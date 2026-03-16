"""
LTX-2 Video Generation Pipeline Manager
=========================================
Manages pipeline selection, execution, and infinite chaining
for the IVG platform using the LTX-2 model.
"""

from dataclasses import dataclass
from enum import Enum
from pathlib import Path
from typing import Optional

from ..config.ltx2_config import (
    CameraLoRA,
    GenerationConfig,
    InfiniteChainConfig,
    LTX2ModelConfig,
    Pipeline,
    QualityPreset,
    QUALITY_PRESETS,
)


class GenerationStatus(Enum):
    """Status of a generation job."""
    QUEUED = "queued"
    LOADING_MODEL = "loading_model"
    GENERATING_STAGE_1 = "generating_stage_1"
    GENERATING_STAGE_2 = "generating_stage_2"
    UPSAMPLING_SPATIAL = "upsampling_spatial"
    UPSAMPLING_TEMPORAL = "upsampling_temporal"
    POST_PROCESSING = "post_processing"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class GenerationJob:
    """Represents a single video generation job."""
    job_id: str
    prompt: str
    pipeline: Pipeline
    config: GenerationConfig
    output_path: str
    status: GenerationStatus = GenerationStatus.QUEUED
    progress: float = 0.0
    error: Optional[str] = None
    # Image conditioning for chaining
    conditioning_images: Optional[list[str]] = None
    # Audio conditioning
    audio_path: Optional[str] = None
    audio_start_time: float = 0.0
    audio_max_duration: Optional[float] = None
    # Camera LoRA
    camera_lora: Optional[CameraLoRA] = None
    # Retake parameters
    retake_video_path: Optional[str] = None
    retake_start_time: Optional[float] = None
    retake_end_time: Optional[float] = None
    # Chain context
    chain_id: Optional[str] = None
    chain_position: int = 0
    # Metadata
    seed_used: Optional[int] = None


@dataclass
class ChainSegment:
    """A segment in an infinite generation chain."""
    segment_id: str
    job: GenerationJob
    output_path: Optional[str] = None
    keyframe_path: Optional[str] = None
    next_segment_id: Optional[str] = None
    branch_segment_ids: list[str] = None

    def __post_init__(self):
        if self.branch_segment_ids is None:
            self.branch_segment_ids = []


class PipelineSelector:
    """Selects the optimal LTX-2 pipeline based on task requirements."""

    @staticmethod
    def select(
        has_audio: bool = False,
        has_image_input: bool = False,
        has_video_input: bool = False,
        is_retake: bool = False,
        is_interpolation: bool = False,
        quality_preset: QualityPreset = QualityPreset.PRODUCTION,
    ) -> Pipeline:
        """Select the optimal pipeline for the given task."""
        if is_retake:
            return Pipeline.RETAKE
        if is_interpolation:
            return Pipeline.KEYFRAME_INTERPOLATION
        if has_video_input:
            return Pipeline.IC_LORA
        if has_audio:
            return Pipeline.AUDIO_TO_VIDEO
        if quality_preset == QualityPreset.RAPID:
            return Pipeline.DISTILLED
        if quality_preset == QualityPreset.HIGH_QUALITY:
            return Pipeline.TI2VID_TWO_STAGES_HQ
        return Pipeline.TI2VID_TWO_STAGES


class VideoGenerator:
    """
    Core video generation engine interfacing with LTX-2.

    Handles pipeline execution, upsampling, and infinite chaining.
    """

    def __init__(
        self,
        model_config: Optional[LTX2ModelConfig] = None,
        chain_config: Optional[InfiniteChainConfig] = None,
    ):
        self.model_config = model_config or LTX2ModelConfig()
        self.chain_config = chain_config or InfiniteChainConfig()
        self._pipeline_cache: dict[Pipeline, object] = {}
        self._active_chains: dict[str, list[ChainSegment]] = {}

    def create_job(
        self,
        prompt: str,
        pipeline: Optional[Pipeline] = None,
        quality_preset: QualityPreset = QualityPreset.PRODUCTION,
        output_path: str = "./output",
        conditioning_images: Optional[list[str]] = None,
        audio_path: Optional[str] = None,
        camera_lora: Optional[CameraLoRA] = None,
        seed: Optional[int] = None,
        chain_id: Optional[str] = None,
    ) -> GenerationJob:
        """Create a new generation job with optimal configuration."""
        config = QUALITY_PRESETS[quality_preset]
        if seed is not None:
            config.seed = seed

        if pipeline is None:
            pipeline = PipelineSelector.select(
                has_audio=audio_path is not None,
                has_image_input=conditioning_images is not None,
                quality_preset=quality_preset,
            )

        import uuid
        job_id = str(uuid.uuid4())[:8]

        return GenerationJob(
            job_id=job_id,
            prompt=prompt,
            pipeline=pipeline,
            config=config,
            output_path=f"{output_path}/{job_id}.mp4",
            conditioning_images=conditioning_images,
            audio_path=audio_path,
            camera_lora=camera_lora,
            chain_id=chain_id,
        )

    def build_command(self, job: GenerationJob) -> list[str]:
        """Build the CLI command for LTX-2 pipeline execution."""
        cmd = [
            "python", "-m", "ltx_pipelines.run",
            "--pipeline", job.pipeline.value,
            "--prompt", job.prompt,
            "--output-path", job.output_path,
            "--height", str(job.config.height),
            "--width", str(job.config.width),
            "--num-frames", str(job.config.num_frames),
            "--frame-rate", str(job.config.frame_rate),
            "--num-inference-steps", str(job.config.num_inference_steps),
        ]

        if job.config.seed is not None:
            cmd.extend(["--seed", str(job.config.seed)])

        # Guidance parameters
        g = job.config.guidance
        cmd.extend([
            "--cfg-scale", str(g.cfg_scale),
            "--stg-scale", str(g.stg_scale),
            "--rescale-scale", str(g.rescale_scale),
        ])

        # Quantization
        if job.config.quantization.value != "none":
            cmd.extend(["--quantization", job.config.quantization.value])

        # Image conditioning
        if job.conditioning_images:
            for img in job.conditioning_images:
                cmd.extend(["--image", img])

        # Audio conditioning
        if job.audio_path:
            cmd.extend([
                "--audio-path", job.audio_path,
                "--audio-start-time", str(job.audio_start_time),
            ])
            if job.audio_max_duration:
                cmd.extend(["--audio-max-duration", str(job.audio_max_duration)])

        # Retake parameters
        if job.retake_video_path:
            cmd.extend([
                "--video-path", job.retake_video_path,
                "--start-time", str(job.retake_start_time),
                "--end-time", str(job.retake_end_time),
            ])

        return cmd

    def start_infinite_chain(self, chain_id: str, initial_job: GenerationJob) -> str:
        """Initialize an infinite generation chain."""
        initial_job.chain_id = chain_id
        initial_job.chain_position = 0

        segment = ChainSegment(
            segment_id=f"{chain_id}_seg_0",
            job=initial_job,
        )
        self._active_chains[chain_id] = [segment]
        return segment.segment_id

    def continue_chain(
        self,
        chain_id: str,
        evolved_prompt: str,
        keyframe_path: str,
    ) -> GenerationJob:
        """Continue an infinite chain with the next segment."""
        chain = self._active_chains.get(chain_id, [])
        position = len(chain)

        job = self.create_job(
            prompt=evolved_prompt,
            conditioning_images=[keyframe_path],
            chain_id=chain_id,
        )
        job.chain_position = position

        segment = ChainSegment(
            segment_id=f"{chain_id}_seg_{position}",
            job=job,
        )

        if chain:
            chain[-1].next_segment_id = segment.segment_id

        chain.append(segment)
        self._active_chains[chain_id] = chain
        return job

    def branch_chain(
        self,
        chain_id: str,
        branch_from_position: int,
        branch_prompt: str,
    ) -> tuple[str, GenerationJob]:
        """Branch an infinite chain into a parallel storyline."""
        chain = self._active_chains.get(chain_id, [])
        if branch_from_position >= len(chain):
            raise ValueError(f"Position {branch_from_position} does not exist in chain {chain_id}")

        source_segment = chain[branch_from_position]
        import uuid
        branch_chain_id = f"{chain_id}_branch_{uuid.uuid4().hex[:6]}"

        job = self.create_job(
            prompt=branch_prompt,
            conditioning_images=[source_segment.keyframe_path] if source_segment.keyframe_path else None,
            chain_id=branch_chain_id,
        )

        branch_segment = ChainSegment(
            segment_id=f"{branch_chain_id}_seg_0",
            job=job,
        )

        source_segment.branch_segment_ids.append(branch_segment.segment_id)
        self._active_chains[branch_chain_id] = [branch_segment]

        return branch_chain_id, job

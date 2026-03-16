"""
LTX-2 Model Configuration for IVG Platform
============================================
Central configuration for all LTX-2 pipeline parameters, model paths,
LoRA presets, and generation defaults.

Model: Lightricks/LTX-2.3 (22B parameter DiT-based audio-video foundation model)
Repository: https://github.com/Lightricks/LTX-2
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Optional


class Pipeline(Enum):
    """Available LTX-2 generation pipelines."""
    TI2VID_TWO_STAGES = "TI2VidTwoStagesPipeline"
    TI2VID_TWO_STAGES_HQ = "TI2VidTwoStagesHQPipeline"
    TI2VID_ONE_STAGE = "TI2VidOneStagePipeline"
    DISTILLED = "DistilledPipeline"
    IC_LORA = "ICLoraPipeline"
    KEYFRAME_INTERPOLATION = "KeyframeInterpolationPipeline"
    AUDIO_TO_VIDEO = "A2VidPipelineTwoStage"
    RETAKE = "RetakePipeline"


class Quantization(Enum):
    """FP8 quantization modes."""
    NONE = "none"
    FP8_CAST = "fp8-cast"
    FP8_SCALED_MM = "fp8-scaled-mm"


class CameraLoRA(Enum):
    """Available camera control LoRAs."""
    DOLLY_IN = "dolly-in"
    DOLLY_OUT = "dolly-out"
    DOLLY_LEFT = "dolly-left"
    DOLLY_RIGHT = "dolly-right"
    JIB_UP = "jib-up"
    JIB_DOWN = "jib-down"
    STATIC = "static"


class QualityPreset(Enum):
    """Generation quality presets."""
    PRODUCTION = "production"
    HIGH_QUALITY = "high_quality"
    PREVIEW = "preview"
    RAPID = "rapid"


@dataclass
class GuidanceParams:
    """Multi-modal guidance parameters for LTX-2."""
    cfg_scale: float = 3.5
    stg_scale: float = 1.0
    stg_blocks: list[int] = field(default_factory=lambda: [29])
    rescale_scale: float = 0.7
    modality_scale: float = 1.0
    skip_step: int = 0


@dataclass
class UpsamplingConfig:
    """Spatial and temporal upsampling configuration."""
    spatial_enabled: bool = True
    spatial_factor: str = "2x"  # "1.5x" or "2x"
    temporal_enabled: bool = True
    temporal_factor: str = "2x"
    spatial_model: str = "ltx-2.3-spatial-upscaler-x2-1.0.safetensors"
    temporal_model: str = "ltx-2.3-temporal-upscaler-x2-1.0.safetensors"


@dataclass
class GenerationConfig:
    """Core generation parameters."""
    height: int = 512
    width: int = 768
    num_frames: int = 121
    frame_rate: float = 25.0
    num_inference_steps: int = 40
    seed: Optional[int] = None
    quantization: Quantization = Quantization.NONE
    guidance: GuidanceParams = field(default_factory=GuidanceParams)
    upsampling: UpsamplingConfig = field(default_factory=UpsamplingConfig)


# Quality presets
QUALITY_PRESETS: dict[QualityPreset, GenerationConfig] = {
    QualityPreset.PRODUCTION: GenerationConfig(
        height=512,
        width=768,
        num_frames=121,
        num_inference_steps=40,
        guidance=GuidanceParams(cfg_scale=3.5, stg_scale=1.0),
        upsampling=UpsamplingConfig(spatial_enabled=True, temporal_enabled=True),
    ),
    QualityPreset.HIGH_QUALITY: GenerationConfig(
        height=512,
        width=768,
        num_frames=121,
        num_inference_steps=20,  # Uses res_2s sampler
        guidance=GuidanceParams(cfg_scale=3.5, stg_scale=1.0),
        upsampling=UpsamplingConfig(spatial_enabled=True, temporal_enabled=True),
    ),
    QualityPreset.PREVIEW: GenerationConfig(
        height=512,
        width=768,
        num_frames=61,
        num_inference_steps=40,
        guidance=GuidanceParams(cfg_scale=3.0, stg_scale=0.8),
        upsampling=UpsamplingConfig(spatial_enabled=False, temporal_enabled=False),
    ),
    QualityPreset.RAPID: GenerationConfig(
        height=512,
        width=768,
        num_frames=41,
        num_inference_steps=8,  # Distilled pipeline
        guidance=GuidanceParams(cfg_scale=0.0),  # No guidance for distilled
        upsampling=UpsamplingConfig(spatial_enabled=False, temporal_enabled=False),
    ),
}


@dataclass
class LTX2ModelConfig:
    """Complete LTX-2 model configuration."""
    model_repo: str = "Lightricks/LTX-2.3"
    dev_checkpoint: str = "ltx-2.3-22b-dev.safetensors"
    distilled_checkpoint: str = "ltx-2.3-22b-distilled.safetensors"
    distilled_lora: str = "ltx-2.3-22b-distilled-lora-384.safetensors"
    text_encoder: str = "google/gemma-3-12b-it-qat-q4_0-unquantized"
    cache_dir: str = "./models"
    device: str = "cuda"


@dataclass
class InfiniteChainConfig:
    """Configuration for infinite video chaining."""
    extract_last_n_frames: int = 1
    overlap_frames: int = 5
    prompt_evolution_enabled: bool = True
    max_chain_length: Optional[int] = None  # None = truly infinite
    keyframe_interpolation_enabled: bool = True
    branch_enabled: bool = True

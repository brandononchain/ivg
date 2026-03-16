"""
IVG Backend API Routes
========================
REST + WebSocket API for the IVG platform.
Handles generation requests, queue management, and real-time progress.
"""

from dataclasses import dataclass
from enum import Enum
from typing import Optional


class APIRoute(Enum):
    """API route definitions."""
    # Generation
    GENERATE = "POST /api/v1/generate"
    GENERATE_STATUS = "GET /api/v1/generate/{job_id}"
    GENERATE_CANCEL = "DELETE /api/v1/generate/{job_id}"

    # Queue
    QUEUE_LIST = "GET /api/v1/queue"
    QUEUE_CLEAR = "DELETE /api/v1/queue"

    # Chains
    CHAIN_CREATE = "POST /api/v1/chains"
    CHAIN_CONTINUE = "POST /api/v1/chains/{chain_id}/continue"
    CHAIN_BRANCH = "POST /api/v1/chains/{chain_id}/branch"
    CHAIN_STATUS = "GET /api/v1/chains/{chain_id}"
    CHAIN_LIST = "GET /api/v1/chains"

    # Library
    LIBRARY_LIST = "GET /api/v1/library/videos"
    LIBRARY_VIDEO = "GET /api/v1/library/videos/{video_id}"
    LIBRARY_DELETE = "DELETE /api/v1/library/videos/{video_id}"
    LIBRARY_KEYFRAMES = "GET /api/v1/library/keyframes"

    # Prompts
    PROMPTS_LIST = "GET /api/v1/prompts"
    PROMPTS_SAVE = "POST /api/v1/prompts"
    PROMPTS_DELETE = "DELETE /api/v1/prompts/{prompt_id}"

    # Presets
    PRESETS_LIST = "GET /api/v1/presets"
    PRESETS_SAVE = "POST /api/v1/presets"

    # WebSocket
    WS_PROGRESS = "WS /api/v1/ws/progress"
    WS_GPU_STATUS = "WS /api/v1/ws/gpu"


@dataclass
class GenerateRequest:
    """Request body for video generation."""
    prompt: str
    pipeline: str = "TI2VidTwoStagesPipeline"
    quality_preset: str = "production"
    num_frames: int = 121
    height: int = 512
    width: int = 768
    cfg_scale: float = 3.5
    stg_scale: float = 1.0
    seed: Optional[int] = None
    conditioning_images: Optional[list[str]] = None
    audio_path: Optional[str] = None
    camera_lora: Optional[str] = None
    spatial_upsampling: bool = True
    temporal_upsampling: bool = True


@dataclass
class ChainCreateRequest:
    """Request body for creating an infinite chain."""
    initial_prompt: str
    pipeline: str = "TI2VidTwoStagesPipeline"
    quality_preset: str = "production"
    auto_continue: bool = False
    max_segments: Optional[int] = None  # None = infinite


@dataclass
class ChainContinueRequest:
    """Request body for continuing an infinite chain."""
    evolved_prompt: str
    use_auto_evolution: bool = False


@dataclass
class GenerateResponse:
    """Response for generation requests."""
    job_id: str
    status: str
    pipeline: str
    estimated_duration_seconds: Optional[float] = None


@dataclass
class ProgressEvent:
    """WebSocket progress event."""
    job_id: str
    stage: str
    progress: float  # 0-100
    message: str
    chain_id: Optional[str] = None
    segment_position: Optional[int] = None

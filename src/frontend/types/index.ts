export type Pipeline =
  | 'TI2VidTwoStagesPipeline'
  | 'TI2VidTwoStagesHQPipeline'
  | 'DistilledPipeline'
  | 'A2VidPipelineTwoStage';

export type GenerationStage =
  | 'queued'
  | 'loading_model'
  | 'generating_stage_1'
  | 'generating_stage_2'
  | 'upsampling_spatial'
  | 'upsampling_temporal'
  | 'post_processing'
  | 'completed'
  | 'failed';

export type CameraLoRA =
  | 'dolly-in'
  | 'dolly-out'
  | 'dolly-left'
  | 'dolly-right'
  | 'jib-up'
  | 'jib-down'
  | 'static'
  | null;

export interface GenerationParams {
  pipeline: Pipeline;
  numFrames: number;
  height: number;
  width: number;
  cfgScale: number;
  stgScale: number;
  seed: string;
  spatialUpsampling: boolean;
  temporalUpsampling: boolean;
  cameraLoRA: CameraLoRA;
}

export interface GenerationJob {
  id: string;
  prompt: string;
  params: GenerationParams;
  stage: GenerationStage;
  progress: number;
  videoUrl: string | null;
  error: string | null;
  createdAt: number;
}

export interface GenerateRequest {
  prompt: string;
  params: GenerationParams;
}

export interface GenerateResponse {
  jobId: string;
}

export interface JobStatusResponse {
  stage: GenerationStage;
  progress: number;
  videoUrl: string | null;
  error: string | null;
}

/** Maps pipeline IDs to fal.ai inference step counts */
export const PIPELINE_STEPS: Record<Pipeline, number> = {
  TI2VidTwoStagesPipeline: 40,
  TI2VidTwoStagesHQPipeline: 20,
  DistilledPipeline: 8,
  A2VidPipelineTwoStage: 40,
};

export const DEFAULT_PARAMS: GenerationParams = {
  pipeline: 'TI2VidTwoStagesPipeline',
  numFrames: 121,
  height: 512,
  width: 768,
  cfgScale: 3.5,
  stgScale: 1.0,
  seed: '',
  spatialUpsampling: false,
  temporalUpsampling: false,
  cameraLoRA: null,
};

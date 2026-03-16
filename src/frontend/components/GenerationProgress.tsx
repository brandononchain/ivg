import React, { memo } from 'react';

type GenerationStage =
  | 'queued'
  | 'loading_model'
  | 'generating_stage_1'
  | 'generating_stage_2'
  | 'upsampling_spatial'
  | 'upsampling_temporal'
  | 'post_processing'
  | 'completed'
  | 'failed';

interface GenerationProgressProps {
  stage: GenerationStage;
  progress: number; // 0-100
  jobId: string;
  error?: string;
}

const STAGE_LABELS: Record<GenerationStage, string> = {
  queued: 'In queue — your video is next...',
  loading_model: 'Loading LTX-2 model...',
  generating_stage_1: 'Teaching pixels to dance...',
  generating_stage_2: 'Adding the finishing details...',
  upsampling_spatial: 'Enhancing resolution (2x spatial)...',
  upsampling_temporal: 'Smoothing motion (2x temporal)...',
  post_processing: 'Almost there — polishing your masterpiece...',
  completed: 'Your video is ready!',
  failed: 'Generation encountered an issue.',
};

const STAGE_PROGRESS_RANGES: Record<GenerationStage, [number, number]> = {
  queued: [0, 5],
  loading_model: [5, 15],
  generating_stage_1: [15, 55],
  generating_stage_2: [55, 75],
  upsampling_spatial: [75, 85],
  upsampling_temporal: [85, 93],
  post_processing: [93, 99],
  completed: [100, 100],
  failed: [0, 0],
};

export const GenerationProgress = memo<GenerationProgressProps>(({
  stage,
  progress,
  jobId,
  error,
}) => {
  const [rangeStart, rangeEnd] = STAGE_PROGRESS_RANGES[stage];
  const overallProgress = stage === 'completed' ? 100 :
    rangeStart + (progress / 100) * (rangeEnd - rangeStart);

  const isFailed = stage === 'failed';
  const isComplete = stage === 'completed';

  return (
    <div
      className="ivg-card"
      role="status"
      aria-live="polite"
      aria-label={`Generation ${stage}: ${Math.round(overallProgress)}% complete`}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium" style={{ color: 'var(--ivg-text-primary)' }}>
          {STAGE_LABELS[stage]}
        </span>
        <span className="text-xs font-mono" style={{ color: 'var(--ivg-text-muted)' }}>
          {jobId}
        </span>
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-1 rounded-full overflow-hidden"
        style={{ background: 'var(--ivg-bg-tertiary)' }}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isFailed ? '' : isComplete ? '' : 'ivg-progress-bar'
          }`}
          style={{
            width: `${overallProgress}%`,
            background: isFailed
              ? 'var(--ivg-accent-error)'
              : isComplete
              ? 'var(--ivg-accent-success)'
              : undefined,
          }}
        />
      </div>

      {/* Progress percentage */}
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs" style={{ color: 'var(--ivg-text-muted)' }}>
          {Math.round(overallProgress)}%
        </span>
        {isComplete && (
          <span className="text-xs font-medium" style={{ color: 'var(--ivg-accent-success)' }}>
            Fresh video, hot off the GPU!
          </span>
        )}
      </div>

      {/* Error display */}
      {isFailed && error && (
        <div
          className="mt-3 p-3 rounded-md text-sm"
          style={{ background: 'rgba(225, 112, 85, 0.1)', color: 'var(--ivg-accent-error)' }}
        >
          {error}
        </div>
      )}
    </div>
  );
});

GenerationProgress.displayName = 'GenerationProgress';

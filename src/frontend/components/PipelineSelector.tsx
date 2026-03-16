import React, { memo } from 'react';

interface PipelineOption {
  id: string;
  name: string;
  description: string;
  steps: string;
  quality: string;
  recommended?: boolean;
}

const PIPELINES: PipelineOption[] = [
  {
    id: 'TI2VidTwoStagesPipeline',
    name: 'Production (2-Stage)',
    description: 'Standard production — text/image to video with 2x upsampling',
    steps: '40 + 10',
    quality: 'Highest',
    recommended: true,
  },
  {
    id: 'TI2VidTwoStagesHQPipeline',
    name: 'High Quality (HQ)',
    description: 'Uses res_2s sampler — fewer steps, excellent quality',
    steps: '20 + 10',
    quality: 'Highest',
  },
  {
    id: 'DistilledPipeline',
    name: 'Rapid Preview',
    description: 'Fast iteration with distilled model — 8 predefined sigmas',
    steps: '8 + 4',
    quality: 'Good',
  },
  {
    id: 'A2VidPipelineTwoStage',
    name: 'Audio-Driven',
    description: 'Generate video synchronized to audio input',
    steps: '40 + 10',
    quality: 'High',
  },
];

interface PipelineSelectorProps {
  selected: string;
  onChange: (pipelineId: string) => void;
}

export const PipelineSelector = memo<PipelineSelectorProps>(({ selected, onChange }) => {
  return (
    <div role="radiogroup" aria-label="Select generation pipeline">
      <label className="block text-sm font-medium mb-3" style={{ color: 'var(--ivg-text-secondary)' }}>
        Pipeline
      </label>
      <div className="space-y-2">
        {PIPELINES.map((pipeline) => (
          <button
            key={pipeline.id}
            onClick={() => onChange(pipeline.id)}
            className={`w-full text-left p-3 rounded-lg border transition-all duration-150 ${
              selected === pipeline.id
                ? 'border-[var(--ivg-primary)] bg-[rgba(108,92,231,0.1)]'
                : 'border-[var(--ivg-border)] bg-[var(--ivg-surface)] hover:border-[var(--ivg-primary-light)]'
            }`}
            role="radio"
            aria-checked={selected === pipeline.id}
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="text-sm font-medium" style={{ color: 'var(--ivg-text-primary)' }}>
                  {pipeline.name}
                  {pipeline.recommended && (
                    <span
                      className="ml-2 text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'var(--ivg-primary)', color: 'white' }}
                    >
                      Recommended
                    </span>
                  )}
                </span>
                <p className="text-xs mt-1" style={{ color: 'var(--ivg-text-muted)' }}>
                  {pipeline.description}
                </p>
              </div>
              <div className="text-right ml-4 shrink-0">
                <span className="text-xs font-mono" style={{ color: 'var(--ivg-text-secondary)' }}>
                  {pipeline.steps} steps
                </span>
                <p className="text-xs mt-1" style={{ color: 'var(--ivg-text-muted)' }}>
                  {pipeline.quality}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

PipelineSelector.displayName = 'PipelineSelector';

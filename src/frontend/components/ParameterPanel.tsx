import React, { memo, useCallback } from 'react';
import type { GenerationParams, CameraLoRA } from '../types';

interface ParameterPanelProps {
  params: GenerationParams;
  onChange: (params: GenerationParams) => void;
}

const CAMERA_LORAS = [
  { id: 'dolly-in', label: 'Dolly In' },
  { id: 'dolly-out', label: 'Dolly Out' },
  { id: 'dolly-left', label: 'Dolly Left' },
  { id: 'dolly-right', label: 'Dolly Right' },
  { id: 'jib-up', label: 'Jib Up' },
  { id: 'jib-down', label: 'Jib Down' },
  { id: 'static', label: 'Static' },
];

export const ParameterPanel = memo<ParameterPanelProps>(({ params, onChange }) => {
  const update = useCallback(
    (key: keyof GenerationParams, value: number | string | boolean | null) => {
      onChange({ ...params, [key]: value });
    },
    [params, onChange]
  );

  return (
    <div className="space-y-6">
      {/* Frames */}
      <div>
        <label htmlFor="num-frames" className="flex justify-between text-sm mb-1">
          <span style={{ color: 'var(--ivg-text-secondary)' }}>Frames</span>
          <span className="font-mono" style={{ color: 'var(--ivg-text-muted)' }}>
            {params.numFrames} ({(params.numFrames / 25).toFixed(1)}s)
          </span>
        </label>
        <input
          id="num-frames"
          type="range"
          min={21}
          max={161}
          step={10}
          value={params.numFrames}
          onChange={(e) => update('numFrames', Number(e.target.value))}
          className="w-full accent-[var(--ivg-primary)]"
        />
      </div>

      {/* Resolution */}
      <div>
        <label className="block text-sm mb-1" style={{ color: 'var(--ivg-text-secondary)' }}>
          Resolution
        </label>
        <div className="flex gap-2">
          {[
            { w: 768, h: 512, label: '768x512' },
            { w: 512, h: 512, label: '512x512' },
            { w: 512, h: 768, label: '512x768' },
          ].map((res) => (
            <button
              key={res.label}
              onClick={() => onChange({ ...params, width: res.w, height: res.h })}
              className={`flex-1 px-3 py-2 text-xs rounded-md border transition-all ${
                params.width === res.w && params.height === res.h
                  ? 'border-[var(--ivg-primary)] bg-[rgba(108,92,231,0.1)] text-[var(--ivg-text-primary)]'
                  : 'border-[var(--ivg-border)] text-[var(--ivg-text-muted)] hover:border-[var(--ivg-primary-light)]'
              }`}
            >
              {res.label}
            </button>
          ))}
        </div>
      </div>

      {/* Guidance Scale */}
      <div>
        <label htmlFor="cfg-scale" className="flex justify-between text-sm mb-1">
          <span style={{ color: 'var(--ivg-text-secondary)' }}>CFG Scale</span>
          <span className="font-mono" style={{ color: 'var(--ivg-text-muted)' }}>{params.cfgScale}</span>
        </label>
        <input
          id="cfg-scale"
          type="range"
          min={1.0}
          max={5.0}
          step={0.5}
          value={params.cfgScale}
          onChange={(e) => update('cfgScale', Number(e.target.value))}
          className="w-full accent-[var(--ivg-primary)]"
        />
      </div>

      {/* STG Scale */}
      <div>
        <label htmlFor="stg-scale" className="flex justify-between text-sm mb-1">
          <span style={{ color: 'var(--ivg-text-secondary)' }}>STG Scale</span>
          <span className="font-mono" style={{ color: 'var(--ivg-text-muted)' }}>{params.stgScale}</span>
        </label>
        <input
          id="stg-scale"
          type="range"
          min={0.0}
          max={2.0}
          step={0.1}
          value={params.stgScale}
          onChange={(e) => update('stgScale', Number(e.target.value))}
          className="w-full accent-[var(--ivg-primary)]"
        />
      </div>

      {/* Seed */}
      <div>
        <label htmlFor="seed" className="block text-sm mb-1" style={{ color: 'var(--ivg-text-secondary)' }}>
          Seed (blank = random)
        </label>
        <input
          id="seed"
          type="text"
          value={params.seed}
          onChange={(e) => update('seed', e.target.value)}
          placeholder="Random"
          className="ivg-input text-sm"
        />
      </div>

      {/* Upsampling Toggles */}
      <div>
        <span className="block text-sm mb-2" style={{ color: 'var(--ivg-text-secondary)' }}>Upsampling</span>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={params.spatialUpsampling}
              onChange={(e) => update('spatialUpsampling', e.target.checked)}
              className="accent-[var(--ivg-primary)]"
            />
            <span className="text-sm" style={{ color: 'var(--ivg-text-primary)' }}>Spatial 2x</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={params.temporalUpsampling}
              onChange={(e) => update('temporalUpsampling', e.target.checked)}
              className="accent-[var(--ivg-primary)]"
            />
            <span className="text-sm" style={{ color: 'var(--ivg-text-primary)' }}>Temporal 2x</span>
          </label>
        </div>
      </div>

      {/* Camera LoRA Chips */}
      <div>
        <span className="block text-sm mb-2" style={{ color: 'var(--ivg-text-secondary)' }}>Camera Control</span>
        <div className="flex flex-wrap gap-2">
          {CAMERA_LORAS.map((lora) => (
            <button
              key={lora.id}
              onClick={() =>
                update('cameraLoRA', params.cameraLoRA === lora.id ? null : lora.id)
              }
              className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                params.cameraLoRA === lora.id
                  ? 'border-[var(--ivg-primary)] bg-[rgba(108,92,231,0.15)] text-[var(--ivg-text-primary)]'
                  : 'border-[var(--ivg-border)] text-[var(--ivg-text-muted)] hover:border-[var(--ivg-primary)] hover:text-[var(--ivg-text-primary)]'
              }`}
            >
              {lora.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
});

ParameterPanel.displayName = 'ParameterPanel';

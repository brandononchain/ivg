import React, { useCallback } from 'react';
import { PromptEditor } from '../components/PromptEditor';
import { ParameterPanel } from '../components/ParameterPanel';
import { PipelineSelector } from '../components/PipelineSelector';
import { GenerationProgress } from '../components/GenerationProgress';
import { VideoPlayer } from '../components/VideoPlayer';
import { useGeneration } from '../hooks/useGeneration';
import type { Pipeline, GenerationStage } from '../types';

export default function Home() {
  const {
    jobs,
    params,
    setParams,
    generate,
    dismissJob,
    activeJob,
    isGenerating,
  } = useGeneration();

  const handleGenerate = useCallback(
    (prompt: string) => {
      generate(prompt);
    },
    [generate],
  );

  const completedJobs = jobs.filter((j) => j.stage === 'completed' && j.videoUrl);
  const failedJobs = jobs.filter((j) => j.stage === 'failed');

  return (
    <div className="ivg-layout">
      {/* Header */}
      <header
        className="ivg-header flex items-center justify-between px-6 border-b"
        style={{
          borderColor: 'var(--ivg-border)',
          background: 'var(--ivg-bg-secondary)',
        }}
      >
        <div className="flex items-center gap-3">
          <h1
            className="text-xl font-bold"
            style={{ color: 'var(--ivg-text-primary)' }}
          >
            IVG
          </h1>
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{
              background: 'rgba(108, 92, 231, 0.15)',
              color: 'var(--ivg-primary-light)',
            }}
          >
            Infinite Video Generation
          </span>
        </div>
        <nav className="flex items-center gap-6">
          <span
            className="text-sm font-medium"
            style={{ color: 'var(--ivg-primary-light)' }}
          >
            Dashboard
          </span>
        </nav>
      </header>

      {/* Sidebar — Pipeline + Parameters */}
      <aside
        className="ivg-sidebar p-4 border-r overflow-y-auto space-y-6"
        style={{
          borderColor: 'var(--ivg-border)',
          background: 'var(--ivg-bg-secondary)',
        }}
      >
        <PipelineSelector
          selected={params.pipeline}
          onChange={(id) =>
            setParams((p) => ({ ...p, pipeline: id as Pipeline }))
          }
        />
        <div
          className="border-t pt-4"
          style={{ borderColor: 'var(--ivg-border)' }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-wider mb-4"
            style={{ color: 'var(--ivg-text-muted)' }}
          >
            Parameters
          </h3>
          <ParameterPanel
            params={params}
            onChange={setParams}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="ivg-main p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Prompt */}
          <section>
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: 'var(--ivg-text-primary)' }}
            >
              Generate Video
            </h2>
            <PromptEditor
              onSubmit={handleGenerate}
              isGenerating={isGenerating}
            />
          </section>

          {/* Active Generation */}
          {activeJob && (
            <section>
              <h2
                className="text-lg font-semibold mb-4"
                style={{ color: 'var(--ivg-text-primary)' }}
              >
                Generating...
              </h2>
              <GenerationProgress
                stage={activeJob.stage as GenerationStage}
                progress={activeJob.progress}
                jobId={activeJob.id.slice(0, 12)}
              />
            </section>
          )}

          {/* Failed jobs */}
          {failedJobs.map((job) => (
            <section key={job.id}>
              <GenerationProgress
                stage="failed"
                progress={0}
                jobId={job.id.slice(0, 12)}
                error={job.error ?? 'Generation failed'}
              />
              <button
                onClick={() => dismissJob(job.id)}
                className="ivg-btn ivg-btn-secondary text-xs mt-2"
              >
                Dismiss
              </button>
            </section>
          ))}

          {/* Completed Videos */}
          {completedJobs.map((job) => (
            <section key={job.id}>
              <h2
                className="text-lg font-semibold mb-4"
                style={{ color: 'var(--ivg-text-primary)' }}
              >
                {job.prompt.slice(0, 60)}
                {job.prompt.length > 60 ? '...' : ''}
              </h2>
              <VideoPlayer
                url={job.videoUrl!}
                onDismiss={() => dismissJob(job.id)}
              />
            </section>
          ))}

          {/* Empty state */}
          {jobs.length === 0 && (
            <section>
              <div className="ivg-card text-center py-12">
                <p style={{ color: 'var(--ivg-text-muted)' }}>
                  No videos yet — your first masterpiece awaits. Hit Generate!
                </p>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Right Panel — Generation History */}
      <aside
        className="ivg-panel p-4 border-l overflow-y-auto"
        style={{
          borderColor: 'var(--ivg-border)',
          background: 'var(--ivg-bg-secondary)',
        }}
      >
        <h2
          className="text-xs font-semibold uppercase tracking-wider mb-4"
          style={{ color: 'var(--ivg-text-muted)' }}
        >
          Generation History
        </h2>
        {jobs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm" style={{ color: 'var(--ivg-text-muted)' }}>
              No generations yet
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="p-3 rounded-lg border transition-all"
                style={{
                  borderColor:
                    job.stage === 'completed'
                      ? 'var(--ivg-accent-success)'
                      : job.stage === 'failed'
                      ? 'var(--ivg-accent-error)'
                      : 'var(--ivg-border)',
                  background: 'var(--ivg-surface)',
                }}
              >
                <p
                  className="text-sm truncate"
                  style={{ color: 'var(--ivg-text-primary)' }}
                >
                  {job.prompt.slice(0, 50)}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--ivg-text-muted)' }}>
                  {job.stage === 'completed'
                    ? 'Done'
                    : job.stage === 'failed'
                    ? 'Failed'
                    : `${Math.round(job.progress)}%`}
                </p>
              </div>
            ))}
          </div>
        )}
      </aside>

      {/* Footer */}
      <footer
        className="ivg-footer flex items-center justify-between px-6 border-t text-xs"
        style={{
          borderColor: 'var(--ivg-border)',
          color: 'var(--ivg-text-muted)',
          background: 'var(--ivg-bg-secondary)',
        }}
      >
        <span>IVG — Powered by LTX-Video (Lightricks)</span>
        <span>GPU inference via fal.ai</span>
      </footer>
    </div>
  );
}

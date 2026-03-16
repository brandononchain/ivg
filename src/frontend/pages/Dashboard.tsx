import React, { useState, useCallback } from 'react';
import { PromptEditor } from '../components/PromptEditor';
import { GenerationProgress } from '../components/GenerationProgress';

/**
 * Dashboard — IVG Home Page
 *
 * Quick generate, recent generations, and queue overview.
 */
export default function Dashboard() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStage, setCurrentStage] = useState<string>('queued');
  const [progress, setProgress] = useState(0);

  const handleGenerate = useCallback((prompt: string, params: any) => {
    setIsGenerating(true);
    setCurrentStage('loading_model');
    setProgress(0);
    // In production: dispatch to backend via WebSocket
    console.log('Generating with prompt:', prompt, 'params:', params);
  }, []);

  return (
    <div className="ivg-layout">
      {/* Header */}
      <header
        className="ivg-header flex items-center justify-between px-6 border-b"
        style={{ borderColor: 'var(--ivg-border)', background: 'var(--ivg-bg-secondary)' }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold" style={{ color: 'var(--ivg-text-primary)' }}>IVG</h1>
          <span className="text-xs px-2 py-1 rounded-full" style={{
            background: 'rgba(108, 92, 231, 0.15)',
            color: 'var(--ivg-primary-light)',
          }}>
            Infinite Video Generation
          </span>
        </div>
        <nav className="flex items-center gap-6">
          <a href="/dashboard" className="text-sm font-medium" style={{ color: 'var(--ivg-primary-light)' }}>Dashboard</a>
          <a href="/studio" className="text-sm" style={{ color: 'var(--ivg-text-muted)' }}>Studio</a>
          <a href="/library" className="text-sm" style={{ color: 'var(--ivg-text-muted)' }}>Library</a>
          <a href="/settings" className="text-sm" style={{ color: 'var(--ivg-text-muted)' }}>Settings</a>
        </nav>
      </header>

      {/* Sidebar */}
      <aside
        className="ivg-sidebar p-4 border-r overflow-y-auto"
        style={{ borderColor: 'var(--ivg-border)', background: 'var(--ivg-bg-secondary)' }}
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--ivg-text-muted)' }}>
          Quick Actions
        </h2>
        <div className="space-y-2">
          {[
            { label: 'Text to Video', desc: 'Generate from a prompt' },
            { label: 'Image to Video', desc: 'Animate a still image' },
            { label: 'Continue Chain', desc: 'Extend a video infinitely' },
            { label: 'Audio to Video', desc: 'Sync video to audio' },
          ].map((action) => (
            <button
              key={action.label}
              className="w-full text-left p-3 rounded-lg transition-all
                         hover:bg-[var(--ivg-surface)]"
            >
              <span className="block text-sm font-medium" style={{ color: 'var(--ivg-text-primary)' }}>{action.label}</span>
              <span className="block text-xs mt-0.5" style={{ color: 'var(--ivg-text-muted)' }}>{action.desc}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="ivg-main p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Quick Generate */}
          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--ivg-text-primary)' }}>
              Quick Generate
            </h2>
            <PromptEditor onSubmit={handleGenerate} isGenerating={isGenerating} />
          </section>

          {/* Active Generation */}
          {isGenerating && (
            <section>
              <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--ivg-text-primary)' }}>
                Active Generation
              </h2>
              <GenerationProgress
                stage={currentStage as any}
                progress={progress}
                jobId="demo-001"
              />
            </section>
          )}

          {/* Recent Generations */}
          <section>
            <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--ivg-text-primary)' }}>
              Recent Generations
            </h2>
            <div className="ivg-card text-center py-12">
              <p style={{ color: 'var(--ivg-text-muted)' }}>
                No videos yet — your first masterpiece awaits. Hit Generate!
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Right Panel */}
      <aside
        className="ivg-panel p-4 border-l overflow-y-auto"
        style={{ borderColor: 'var(--ivg-border)', background: 'var(--ivg-bg-secondary)' }}
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--ivg-text-muted)' }}>
          Generation Queue
        </h2>
        <div className="text-center py-8">
          <p className="text-sm" style={{ color: 'var(--ivg-text-muted)' }}>Queue is empty</p>
        </div>
      </aside>

      {/* Footer */}
      <footer
        className="ivg-footer flex items-center justify-between px-6 border-t text-xs"
        style={{ borderColor: 'var(--ivg-border)', color: 'var(--ivg-text-muted)', background: 'var(--ivg-bg-secondary)' }}
      >
        <span>IVG — Powered by LTX-2 (Lightricks)</span>
        <span>Model: LTX-2.3 22B</span>
      </footer>
    </div>
  );
}

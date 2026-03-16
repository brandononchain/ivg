import React, { memo, useState, useCallback } from 'react';

interface PromptEditorProps {
  onSubmit: (prompt: string) => void;
  maxWords?: number;
  isGenerating?: boolean;
}

export const PromptEditor = memo<PromptEditorProps>(({
  onSubmit,
  maxWords = 200,
  isGenerating = false,
}) => {
  const [prompt, setPrompt] = useState('');
  const wordCount = prompt.trim().split(/\s+/).filter(Boolean).length;
  const isOverLimit = wordCount > maxWords;
  const canSubmit = prompt.trim().length > 0 && !isOverLimit && !isGenerating;

  const handleSubmit = useCallback(() => {
    if (canSubmit) {
      onSubmit(prompt.trim());
    }
  }, [prompt, canSubmit, onSubmit]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canSubmit) {
      handleSubmit();
    }
  }, [canSubmit, handleSubmit]);

  return (
    <div className="ivg-card">
      <label htmlFor="ivg-prompt" className="block text-sm font-medium mb-2" style={{ color: 'var(--ivg-text-secondary)' }}>
        Describe your video scene
      </label>
      <textarea
        id="ivg-prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Start directly with the action — describe movements, appearance, environment, camera, and lighting in chronological order..."
        rows={5}
        className="ivg-input resize-none"
        aria-describedby="prompt-help"
        disabled={isGenerating}
      />
      <div className="flex justify-between items-center mt-3">
        <div className="flex items-center gap-4">
          <span
            id="prompt-help"
            className="text-sm"
            style={{ color: isOverLimit ? 'var(--ivg-accent-error)' : 'var(--ivg-text-muted)' }}
          >
            {wordCount}/{maxWords} words
          </span>
          <span className="text-xs" style={{ color: 'var(--ivg-text-muted)' }}>
            Ctrl+Enter to generate
          </span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="ivg-generate-btn ivg-btn"
          aria-label={isGenerating ? 'Generating video...' : 'Generate video'}
        >
          {isGenerating ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </div>
  );
});

PromptEditor.displayName = 'PromptEditor';

import React, { memo } from 'react';

interface VideoPlayerProps {
  url: string;
  onDismiss?: () => void;
}

export const VideoPlayer = memo<VideoPlayerProps>(({ url, onDismiss }) => {
  return (
    <div className="ivg-card">
      <div className="flex justify-between items-center mb-3">
        <span
          className="text-sm font-medium"
          style={{ color: 'var(--ivg-accent-success)' }}
        >
          Your video is ready!
        </span>
        <div className="flex gap-2">
          <a
            href={url}
            download
            className="ivg-btn ivg-btn-secondary text-xs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Download
          </a>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="ivg-btn ivg-btn-secondary text-xs"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
      <div
        className="relative w-full rounded-lg overflow-hidden"
        style={{ background: 'var(--ivg-bg-tertiary)' }}
      >
        <video
          src={url}
          controls
          autoPlay
          loop
          muted
          playsInline
          className="w-full"
          style={{ maxHeight: '480px', objectFit: 'contain' }}
        />
      </div>
    </div>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

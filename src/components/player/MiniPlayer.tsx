'use client';

import React from 'react';
import { useEpisodePlayer } from '@/context/EpisodePlayerContext';
import YouTubePlayer from './YouTubePlayer';
import { Play, Pause, X, Minimize2, Maximize2 } from 'lucide-react';

export default function MiniPlayer() {
  const {
    currentEpisode,
    isPlaying,
    isMinimized,
    pause,
    resume,
    close,
    minimize,
    maximize,
  } = useEpisodePlayer();

  if (!currentEpisode) return null;

  // Minimized: thin bottom bar
  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '56px',
          backgroundColor: '#0f0f23',
          borderTop: '1px solid #1e1e3a',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: '12px',
          zIndex: 9999,
          boxShadow: '0 -2px 12px rgba(0,0,0,0.3)',
        }}
      >
        {/* Episode info */}
        <div
          style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
          onClick={maximize}
        >
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              fontWeight: 600,
              color: '#e2e8f0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {currentEpisode.title}
          </p>
          <p
            style={{
              margin: 0,
              fontSize: '11px',
              color: '#6366f1',
            }}
          >
            Summit Neuro {currentEpisode.subject ? `· ${currentEpisode.subject}` : ''}
          </p>
        </div>

        {/* Controls */}
        <button
          onClick={isPlaying ? pause : resume}
          style={{
            background: 'none',
            border: 'none',
            color: '#e2e8f0',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>

        <button
          onClick={maximize}
          style={{
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Expand player"
        >
          <Maximize2 size={16} />
        </button>

        <button
          onClick={close}
          style={{
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Close player"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  // Expanded: overlay panel at bottom
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0f0f23',
        borderTop: '1px solid #1e1e3a',
        zIndex: 9999,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.4)',
        maxHeight: '70vh',
        overflow: 'auto',
      }}
    >
      {/* Header bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px 8px',
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <h3
            style={{
              margin: 0,
              fontSize: '15px',
              fontWeight: 700,
              color: '#e2e8f0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {currentEpisode.title}
          </h3>
          <p
            style={{
              margin: '2px 0 0',
              fontSize: '12px',
              color: '#6366f1',
            }}
          >
            Summit Neuro {currentEpisode.subject ? `· ${currentEpisode.subject}` : ''}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={minimize}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Minimize player"
          >
            <Minimize2 size={16} />
          </button>
          <button
            onClick={close}
            style={{
              background: 'none',
              border: 'none',
              color: '#9ca3af',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Close player"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* YouTube Player */}
      <div style={{ padding: '0 16px 16px' }}>
        <YouTubePlayer />
      </div>

      {/* Description */}
      {currentEpisode.description && (
        <div style={{ padding: '0 16px 16px' }}>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: '#9ca3af',
              lineHeight: 1.5,
            }}
          >
            {currentEpisode.description}
          </p>
        </div>
      )}
    </div>
  );
}

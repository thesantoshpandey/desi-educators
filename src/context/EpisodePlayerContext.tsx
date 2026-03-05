'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export interface Episode {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  chapter_id?: string;
  youtube_video_id: string;
  duration_seconds: number;
  is_free: boolean;
  order_index: number;
}

interface EpisodePlayerState {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  isMinimized: boolean;
  hasEarnedXP: boolean;
}

interface EpisodePlayerContextType extends EpisodePlayerState {
  playEpisode: (episode: Episode) => void;
  pause: () => void;
  resume: () => void;
  close: () => void;
  minimize: () => void;
  maximize: () => void;
  markXPEarned: () => void;
}

const EpisodePlayerContext = createContext<EpisodePlayerContextType | null>(null);

export function EpisodePlayerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<EpisodePlayerState>({
    currentEpisode: null,
    isPlaying: false,
    isMinimized: false,
    hasEarnedXP: false,
  });

  const playEpisode = useCallback((episode: Episode) => {
    setState({
      currentEpisode: episode,
      isPlaying: true,
      isMinimized: false,
      hasEarnedXP: false,
    });
  }, []);

  const pause = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: false }));
  }, []);

  const resume = useCallback(() => {
    setState((prev) => ({ ...prev, isPlaying: true }));
  }, []);

  const close = useCallback(() => {
    setState({
      currentEpisode: null,
      isPlaying: false,
      isMinimized: false,
      hasEarnedXP: false,
    });
  }, []);

  const minimize = useCallback(() => {
    setState((prev) => ({ ...prev, isMinimized: true }));
  }, []);

  const maximize = useCallback(() => {
    setState((prev) => ({ ...prev, isMinimized: false }));
  }, []);

  const markXPEarned = useCallback(() => {
    setState((prev) => ({ ...prev, hasEarnedXP: true }));
  }, []);

  return (
    <EpisodePlayerContext.Provider
      value={{
        ...state,
        playEpisode,
        pause,
        resume,
        close,
        minimize,
        maximize,
        markXPEarned,
      }}
    >
      {children}
    </EpisodePlayerContext.Provider>
  );
}

export function useEpisodePlayer() {
  const context = useContext(EpisodePlayerContext);
  if (!context) {
    throw new Error('useEpisodePlayer must be used within EpisodePlayerProvider');
  }
  return context;
}

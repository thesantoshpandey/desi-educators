'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { useEpisodePlayer } from '@/context/EpisodePlayerContext';

// Extend window for YouTube IFrame API
declare global {
  interface Window {
    YT: typeof YT;
    onYouTubeIframeAPIReady: () => void;
  }
}

// XP threshold: student must watch 85% of the video duration
const XP_THRESHOLD = 0.85;
const POLL_INTERVAL_MS = 500;

interface YouTubePlayerProps {
  onXPAwarded?: (xp: number) => void;
}

export default function YouTubePlayer({ onXPAwarded }: YouTubePlayerProps) {
  const { currentEpisode, isPlaying, hasEarnedXP, markXPEarned, pause, resume } =
    useEpisodePlayer();

  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Cumulative watch tracking state (refs to avoid re-renders during polling)
  const lastPolledTimeRef = useRef<number>(0);
  const cumulativeWatchedRef = useRef<number>(0);
  const videoDurationRef = useRef<number>(0);
  const isTrackingRef = useRef<boolean>(false);
  const xpAwardedRef = useRef<boolean>(false);

  const [watchProgress, setWatchProgress] = useState<number>(0);
  const [xpToast, setXpToast] = useState<string | null>(null);

  // Load YouTube IFrame API script once
  useEffect(() => {
    if (window.YT && window.YT.Player) return;

    const existingScript = document.getElementById('youtube-iframe-api');
    if (existingScript) return;

    const tag = document.createElement('script');
    tag.id = 'youtube-iframe-api';
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode?.insertBefore(tag, firstScript);
  }, []);

  // Start cumulative tracking poll
  const startTracking = useCallback(() => {
    if (isTrackingRef.current) return;
    isTrackingRef.current = true;

    // Initialize lastPolledTime to current position
    if (playerRef.current) {
      lastPolledTimeRef.current = playerRef.current.getCurrentTime();
    }

    pollIntervalRef.current = setInterval(() => {
      if (!playerRef.current) return;

      const currentTime = playerRef.current.getCurrentTime();
      const delta = currentTime - lastPolledTimeRef.current;

      // Only count forward progress within a reasonable range (0 to 2 seconds)
      // This filters out seeks: if delta > 2s or negative, the user skipped
      if (delta > 0 && delta <= 2) {
        cumulativeWatchedRef.current += delta;
      }

      lastPolledTimeRef.current = currentTime;

      // Update progress for UI
      if (videoDurationRef.current > 0) {
        const progress = Math.min(
          cumulativeWatchedRef.current / videoDurationRef.current,
          1
        );
        setWatchProgress(progress);

        // Check XP threshold
        if (progress >= XP_THRESHOLD && !xpAwardedRef.current) {
          xpAwardedRef.current = true;
          awardEpisodeXP();
        }
      }
    }, POLL_INTERVAL_MS);
  }, []);

  const stopTracking = useCallback(() => {
    isTrackingRef.current = false;
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Award XP via API
  const awardEpisodeXP = useCallback(async () => {
    if (!currentEpisode || hasEarnedXP) return;

    try {
      const res = await fetch('/api/gamification/play-episode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episode_id: currentEpisode.id }),
      });

      if (res.ok) {
        const data = await res.json();
        markXPEarned();
        setXpToast(`+${data.xp_awarded} XP earned!`);
        onXPAwarded?.(data.xp_awarded);

        // Clear toast after 3s
        setTimeout(() => setXpToast(null), 3000);
      }
    } catch (err) {
      console.error('Failed to award episode XP:', err);
    }
  }, [currentEpisode, hasEarnedXP, markXPEarned, onXPAwarded]);

  // Handle player state changes
  const onPlayerStateChange = useCallback(
    (event: YT.OnStateChangeEvent) => {
      switch (event.data) {
        case YT.PlayerState.PLAYING:
          resume();
          startTracking();
          break;
        case YT.PlayerState.PAUSED:
          pause();
          stopTracking();
          break;
        case YT.PlayerState.ENDED:
          pause();
          stopTracking();
          // Final check in case we're right at the threshold
          if (
            videoDurationRef.current > 0 &&
            cumulativeWatchedRef.current / videoDurationRef.current >= XP_THRESHOLD &&
            !xpAwardedRef.current
          ) {
            xpAwardedRef.current = true;
            awardEpisodeXP();
          }
          break;
        case YT.PlayerState.BUFFERING:
          stopTracking();
          break;
      }
    },
    [pause, resume, startTracking, stopTracking, awardEpisodeXP]
  );

  const onPlayerReady = useCallback((event: YT.PlayerReadyEvent) => {
    videoDurationRef.current = event.target.getDuration();
  }, []);

  // Create/recreate player when episode changes
  useEffect(() => {
    if (!currentEpisode) return;

    // Reset tracking state
    cumulativeWatchedRef.current = 0;
    lastPolledTimeRef.current = 0;
    videoDurationRef.current = 0;
    xpAwardedRef.current = false;
    setWatchProgress(0);
    setXpToast(null);
    stopTracking();

    const initPlayer = () => {
      // Destroy existing player
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }

      if (!containerRef.current) return;

      // Create a fresh div for the player
      const playerDiv = document.createElement('div');
      playerDiv.id = 'yt-player-' + Date.now();
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(playerDiv);

      playerRef.current = new window.YT.Player(playerDiv.id, {
        videoId: currentEpisode.youtube_video_id,
        playerVars: {
          autoplay: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          cc_load_policy: 0,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Wait for API to load
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prevCallback?.();
        initPlayer();
      };
    }

    return () => {
      stopTracking();
    };
  }, [currentEpisode?.id]); // Only re-init on episode change

  // Sync play/pause from external controls
  useEffect(() => {
    if (!playerRef.current) return;
    try {
      const state = playerRef.current.getPlayerState();
      if (isPlaying && state !== YT.PlayerState.PLAYING) {
        playerRef.current.playVideo();
      } else if (!isPlaying && state === YT.PlayerState.PLAYING) {
        playerRef.current.pauseVideo();
      }
    } catch {
      // Player not ready yet
    }
  }, [isPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Ignore
        }
      }
    };
  }, [stopTracking]);

  if (!currentEpisode) return null;

  const progressPercent = Math.round(watchProgress * 100);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* YouTube Player Container */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          aspectRatio: '16/9',
          backgroundColor: '#000',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
      />

      {/* Watch Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#1a1a2e',
          borderRadius: '0 0 8px 8px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${progressPercent}%`,
            height: '100%',
            backgroundColor:
              watchProgress >= XP_THRESHOLD ? '#10b981' : '#6366f1',
            transition: 'width 0.5s ease, background-color 0.3s ease',
          }}
        />
      </div>

      {/* Progress label */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 4px 0',
          fontSize: '12px',
          color: '#9ca3af',
        }}
      >
        <span>
          {watchProgress >= XP_THRESHOLD
            ? '✅ XP earned'
            : `${progressPercent}% watched (${Math.round(XP_THRESHOLD * 100)}% needed for XP)`}
        </span>
        {hasEarnedXP && (
          <span style={{ color: '#10b981', fontWeight: 600 }}>+25 XP</span>
        )}
      </div>

      {/* XP Toast */}
      {xpToast && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(16, 185, 129, 0.95)',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 700,
            animation: 'fadeInUp 0.3s ease',
            pointerEvents: 'none',
            zIndex: 10,
          }}
        >
          {xpToast}
        </div>
      )}
    </div>
  );
}

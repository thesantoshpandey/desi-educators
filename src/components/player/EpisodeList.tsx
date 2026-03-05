'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useEpisodePlayer, Episode } from '@/context/EpisodePlayerContext';
import { Play, Pause, Lock, Headphones } from 'lucide-react';

interface EpisodeListProps {
  subject?: string;
  chapterId?: string;
  limit?: number;
  showTitle?: boolean;
}

export default function EpisodeList({
  subject,
  chapterId,
  limit = 20,
  showTitle = true,
}: EpisodeListProps) {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentEpisode, isPlaying, playEpisode, pause, resume } =
    useEpisodePlayer();

  useEffect(() => {
    async function fetchEpisodes() {
      setLoading(true);
      let query = supabase
        .from('audio_episodes')
        .select('id, title, description, subject, chapter_id, audio_url, duration_seconds, is_free, play_count, order_index')
        .order('order_index', { ascending: true })
        .limit(limit);

      if (subject) {
        query = query.eq('subject', subject);
      }
      if (chapterId) {
        query = query.eq('chapter_id', chapterId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to fetch episodes:', error);
        setLoading(false);
        return;
      }

      // Map audio_url to youtube_video_id
      const mapped: Episode[] = (data || []).map((ep) => ({
        id: ep.id,
        title: ep.title,
        description: ep.description,
        subject: ep.subject,
        chapter_id: ep.chapter_id,
        youtube_video_id: ep.audio_url, // audio_url stores the YouTube video ID
        duration_seconds: ep.duration_seconds,
        is_free: ep.is_free,
        order_index: ep.order_index,
      }));

      setEpisodes(mapped);
      setLoading(false);
    }

    fetchEpisodes();
  }, [subject, chapterId, limit]);

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function handleEpisodeClick(episode: Episode) {
    if (currentEpisode?.id === episode.id) {
      isPlaying ? pause() : resume();
    } else {
      playEpisode(episode);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
        Loading episodes...
      </div>
    );
  }

  if (episodes.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
        No episodes available yet. Coming soon!
      </div>
    );
  }

  return (
    <div>
      {showTitle && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
          <Headphones size={20} style={{ color: '#6366f1' }} />
          <h2
            style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: 700,
              color: '#e2e8f0',
            }}
          >
            Summit Neuro Episodes
          </h2>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {episodes.map((episode, index) => {
          const isActive = currentEpisode?.id === episode.id;
          const isCurrentlyPlaying = isActive && isPlaying;

          return (
            <button
              key={episode.id}
              onClick={() => handleEpisodeClick(episode)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: isActive ? '#1e1b4b' : '#111827',
                border: isActive ? '1px solid #6366f1' : '1px solid #1f2937',
                borderRadius: '10px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.2s ease',
              }}
            >
              {/* Episode number / play icon */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: isActive ? '#6366f1' : '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {!episode.is_free ? (
                  <Lock size={14} style={{ color: '#9ca3af' }} />
                ) : isCurrentlyPlaying ? (
                  <Pause size={14} style={{ color: '#fff' }} />
                ) : (
                  <Play
                    size={14}
                    style={{
                      color: isActive ? '#fff' : '#9ca3af',
                      marginLeft: '2px',
                    }}
                  />
                )}
              </div>

              {/* Episode info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isActive ? '#c7d2fe' : '#e2e8f0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {index + 1}. {episode.title}
                </p>
                {episode.description && (
                  <p
                    style={{
                      margin: '2px 0 0',
                      fontSize: '12px',
                      color: '#6b7280',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {episode.description}
                  </p>
                )}
              </div>

              {/* Duration */}
              <span
                style={{
                  fontSize: '12px',
                  color: '#6b7280',
                  flexShrink: 0,
                }}
              >
                {formatDuration(episode.duration_seconds)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

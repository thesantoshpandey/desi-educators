'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, ArrowRight, Headphones } from 'lucide-react';
import { Button } from '@/components/ui';
import styles from './EpisodePreview.module.css';

interface Episode {
  id: string;
  title: string;
  subject: string;
  duration_seconds: number;
  play_count: number;
  audio_url: string; // YouTube video ID
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  if (m >= 60) {
    const h = Math.floor(m / 60);
    const rm = m % 60;
    return `${h}h ${rm}m`;
  }
  return `${m} min`;
}

export const EpisodePreview: React.FC = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const res = await fetch('/api/admin/sync-episodes');
        if (res.ok) {
          const data = await res.json();
          // Take first 4 episodes (already ordered by order_index)
          setEpisodes((data.episodes || []).slice(0, 4));
        }
      } catch {
        // Silent fail, section just won't show
      } finally {
        setLoading(false);
      }
    };
    fetchEpisodes();
  }, []);

  if (loading || episodes.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.sectionBadge}>
              <Headphones size={14} />
              Summit Neuro Podcast
            </div>
            <h2 className={styles.title}>Listen while you study</h2>
            <p className={styles.subtitle}>
              Free audio lectures from Priya Ma&apos;am. Biology concepts explained in Hindi, 
              designed for revision on the go.
            </p>
          </div>
          <Link href="/episodes" className={styles.viewAll}>
            <Button variant="outline" size="sm">
              All Episodes
              <ArrowRight size={16} style={{ marginLeft: 6 }} />
            </Button>
          </Link>
        </div>

        <div className={styles.grid}>
          {episodes.map((ep) => (
            <Link href="/episodes" key={ep.id} className={styles.card}>
              <div className={styles.thumbnail}>
                <img
                  src={`https://img.youtube.com/vi/${ep.audio_url}/mqdefault.jpg`}
                  alt={ep.title}
                  className={styles.thumbImg}
                />
                <div className={styles.playOverlay}>
                  <Play size={24} fill="white" color="white" />
                </div>
                <span className={styles.duration}>{formatDuration(ep.duration_seconds)}</span>
              </div>
              <div className={styles.cardBody}>
                <span className={styles.subject}>{ep.subject}</span>
                <h3 className={styles.epTitle}>{ep.title}</h3>
                {ep.play_count > 0 && (
                  <span className={styles.plays}>{ep.play_count} plays</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

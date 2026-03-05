'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, ArrowRight } from 'lucide-react';
import styles from './EpisodePreview.module.css';

interface Episode {
  id: string;
  title: string;
  subject: string;
  duration_seconds: number;
  play_count: number;
  audio_url: string;
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
        const res = await fetch('/api/episodes/public');
        if (res.ok) {
          const data = await res.json();
          setEpisodes(data.episodes || []);
        }
      } catch (err) {
        console.error('EpisodePreview fetch error:', err);
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
          <div>
            <p className={styles.eyebrow}>Free Lectures</p>
            <h2 className={styles.title}>Listen while you study</h2>
          </div>
          <Link href="/episodes" className={styles.viewAll}>
            All episodes <ArrowRight size={15} />
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
                  <Play size={22} fill="white" color="white" />
                </div>
                <span className={styles.duration}>{formatDuration(ep.duration_seconds)}</span>
              </div>
              <div className={styles.cardBody}>
                <span className={styles.subject}>{ep.subject}</span>
                <h3 className={styles.epTitle}>{ep.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

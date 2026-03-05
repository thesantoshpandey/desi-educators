'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './EpisodePreview.module.css';

interface Episode { id: string; title: string; subject: string; duration_seconds: number; }

export const EpisodePreview: React.FC = () => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    fetch('/api/episodes/public')
      .then(r => r.json())
      .then(d => { if (d.episodes) setEpisodes(d.episodes); })
      .catch(() => {});
  }, []);

  const fallback = [
    { id: '1', title: 'Ecological Succession: Bare Rock to Forest', subject: 'Biology', duration_seconds: 2040 },
    { id: '2', title: 'Genetic Drift and the Founder Effect', subject: 'Biology', duration_seconds: 1680 },
    { id: '3', title: 'Thermodynamics: Laws and NEET Applications', subject: 'Physics', duration_seconds: 2520 },
    { id: '4', title: 'Organic Chemistry: Reaction Mechanisms', subject: 'Chemistry', duration_seconds: 2160 },
  ];

  const display = episodes.length > 0 ? episodes.slice(0, 4) : fallback;

  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div>
            <div className={styles.label}>
              <span className={styles.divider} />
              Summit Neuro Podcast
            </div>
            <h2 className={styles.title}>
              Listen. Absorb. <em className={styles.italic}>Score.</em>
            </h2>
          </div>
          <Link href="/episodes" className={styles.allLink}>All Episodes &rarr;</Link>
        </div>
        <div className={styles.grid}>
          {display.map((e, i) => (
            <div key={e.id} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.ep}>EP {String(display.length - i).padStart(3, '0')}</span>
                <span className={styles.dur}>{Math.round(e.duration_seconds / 60)} min</span>
              </div>
              <h3 className={styles.cardTitle}>{e.title}</h3>
              <span className={styles.tag}>{e.subject || 'Biology'}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EpisodePreview;

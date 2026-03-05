'use client';
import React from 'react';
import styles from './PriyaAICTA.module.css';

const DNALine = ({ height = 200 }: { height?: number }) => (
  <svg width="2" height={height} viewBox={`0 0 2 ${height}`}>
    {Array.from({ length: Math.floor(height / 8) }).map((_, i) => (
      <circle key={i} cx="1" cy={i * 8 + 4} r={i % 3 === 0 ? '1' : '0.5'}
        fill={i % 5 === 0 ? 'rgba(196,30,30,0.6)' : 'rgba(0,0,0,0.15)'} />
    ))}
  </svg>
);

export const PriyaAICTA: React.FC = () => (
  <section className={styles.section}>
    <div className={styles.dnaLeft}><DNALine height={200} /></div>
    <div className={styles.dnaRight}><DNALine height={200} /></div>

    <div className={styles.inner}>
      <div className={styles.badge}>
        <div className={styles.dot} />
        AI Powered
      </div>

      <h2 className={styles.title}>
        Your doubt.<br />
        Priya Ma&apos;am&rsquo;s <em className={styles.italic}>brain.</em>
      </h2>

      <p className={styles.desc}>
        Ask anything about NEET. Biology, Physics, Chemistry.
        Get answers the way Priya Ma&apos;am teaches.
        Hindi or English. With voice.
      </p>

      <button className={styles.btn}>
        Try Priya AI on Telegram
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </button>
    </div>
  </section>
);

export default PriyaAICTA;

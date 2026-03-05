'use client';
import React from 'react';
import styles from './Features.module.css';

const features = [
  { n: '01', t: 'Molecular First Principles', d: 'Every concept from the molecular level up. We do not oversimplify. We make complexity accessible.' },
  { n: '02', t: 'Error Corrected NCERT', d: 'RTI filed. Errors identified, documented, published. Learn what is actually correct.' },
  { n: '03', t: 'Priya AI Tutor', d: '24/7 AI tutor trained on Priya Ma\'am\'s methodology. Biology, Physics, Chemistry doubts answered in Hindi and English.' },
  { n: '04', t: 'Summit Neuro Podcast', d: 'Audio lectures with Delhi cultural context. Spoken out genetic notation. Made for Indian students.' },
  { n: '05', t: 'Gamified Progress', d: 'XP, streaks, weekly leaderboard, 20 achievement badges. Competition drives retention.' },
];

export const Features: React.FC = () => (
  <section className={styles.section}>
    <div className={styles.inner}>
      <div className={styles.header}>
        <div className={styles.label}>
          <span className={styles.divider} />
          The Method
        </div>
        <h2 className={styles.title}>Not another edtech app.</h2>
      </div>
      {features.map((f, i) => (
        <div key={i} className={styles.item}>
          <div className={styles.num}>{f.n}</div>
          <div>
            <h3 className={styles.itemTitle}>{f.t}</h3>
            <p className={styles.itemDesc}>{f.d}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default Features;

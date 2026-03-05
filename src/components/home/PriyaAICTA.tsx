'use client';

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import styles from './PriyaAICTA.module.css';

export const PriyaAICTA: React.FC = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.inner}>
          <p className={styles.eyebrow}>AI Mentor</p>
          <h2 className={styles.title}>
            Got a doubt?{'\n'}
            <em className={styles.italic}>Ask Priya AI.</em>
          </h2>
          <p className={styles.subtitle}>
            India&apos;s first AI NEET Biology mentor. Voice replies in Hindi.
            Available 24/7 on Telegram. Completely free.
          </p>
          <a
            href="https://t.me/PriyaAI_bot"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaButton}
          >
            Open on Telegram
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};

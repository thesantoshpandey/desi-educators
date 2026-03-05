'use client';

import React from 'react';
import { MessageCircle, Bot, Zap } from 'lucide-react';
import styles from './PriyaAICTA.module.css';

export const PriyaAICTA: React.FC = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.iconWrap}>
            <Bot size={32} />
          </div>
          <h2 className={styles.title}>
            Meet Priya AI
          </h2>
          <p className={styles.subtitle}>
            India&apos;s first AI NEET Biology mentor. Ask any Biology doubt in Hindi or English. 
            Voice replies. Available 24/7 on Telegram. Completely free.
          </p>
          <div className={styles.features}>
            <div className={styles.feat}>
              <Zap size={16} />
              <span>Instant doubt resolution</span>
            </div>
            <div className={styles.feat}>
              <MessageCircle size={16} />
              <span>Hindi voice replies</span>
            </div>
          </div>
          <a
            href="https://t.me/PriyaAI_bot"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.ctaButton}
          >
            <MessageCircle size={18} />
            Open Priya AI on Telegram
          </a>
        </div>
      </div>
    </section>
  );
};

import React from 'react';
import { BookOpen, Headphones, CheckCircle, TrendingUp, MessageCircle, Shield } from 'lucide-react';
import styles from './Features.module.css';

export const Features = () => {
  const features = [
    {
      title: 'NCERT, line by line',
      desc: 'Every concept mapped to exact NCERT pages. What NTA tests, we teach. Nothing extra.',
      icon: <BookOpen size={22} />,
    },
    {
      title: 'Audio lectures',
      desc: 'Summit Neuro podcast. Biology in Hindi. Priya Ma\'am\'s voice. Revise on the go.',
      icon: <Headphones size={22} />,
    },
    {
      title: 'Topic MCQs',
      desc: 'Sorted by chapter and difficulty. Detailed solutions. Track accuracy over time.',
      icon: <CheckCircle size={22} />,
    },
    {
      title: 'XP and streaks',
      desc: 'Earn XP for quizzes, episodes, daily logins. Build streaks. Weekly leaderboard.',
      icon: <TrendingUp size={22} />,
    },
    {
      title: 'Priya AI on Telegram',
      desc: 'Ask any Biology doubt. Instant voice replies in Hindi. Free. Available 24/7.',
      icon: <MessageCircle size={22} />,
    },
    {
      title: 'NCERT error corrections',
      desc: 'RTI backed audit of textbook errors. Study the real science, not the typos.',
      icon: <Shield size={22} />,
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Platform</p>
          <h2 className={styles.title}>Everything you need for NEET Biology</h2>
        </div>

        <div className={styles.grid}>
          {features.map((f, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.icon}>{f.icon}</div>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

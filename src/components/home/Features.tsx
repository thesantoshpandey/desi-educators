import React from 'react';
import { BookOpen, PlayCircle, CheckCircle, TrendingUp, Headphones, Shield } from 'lucide-react';
import styles from './Features.module.css';

export const Features = () => {
    const features = [
        {
            title: 'NCERT Line by Line',
            desc: 'Every concept mapped to exact NCERT pages. No extra, no less. What NTA tests, we teach.',
            icon: <BookOpen size={22} />,
            color: '#DC2626',
        },
        {
            title: 'Free Audio Lectures',
            desc: 'Summit Neuro podcast episodes. Listen on the go. Biology concepts in Hindi, voice of Priya Ma\'am.',
            icon: <Headphones size={22} />,
            color: '#7c3aed',
        },
        {
            title: 'Topic MCQs',
            desc: 'Practice questions sorted by chapter and difficulty. Detailed solutions for every question.',
            icon: <CheckCircle size={22} />,
            color: '#059669',
        },
        {
            title: 'XP and Streaks',
            desc: 'Earn XP for every quiz, episode, and login. Build streaks. Compete on the weekly leaderboard.',
            icon: <TrendingUp size={22} />,
            color: '#2563eb',
        },
        {
            title: 'Priya AI Mentor',
            desc: 'Ask any Biology doubt on Telegram. Get instant voice replies in Hindi. Free, 24/7.',
            icon: <PlayCircle size={22} />,
            color: '#d97706',
        },
        {
            title: 'NCERT Error Corrections',
            desc: 'RTI verified corrections to NCERT textbook errors. Study the real science, not the typos.',
            icon: <Shield size={22} />,
            color: '#111',
        },
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2>Everything you need for NEET Biology</h2>
                    <p>Built by a Gold Medalist. Powered by AI. Free to start.</p>
                </div>

                <div className={styles.grid}>
                    {features.map((f, i) => (
                        <div key={i} className={styles.card}>
                            <div className={styles.icon} style={{ color: f.color, background: `${f.color}0D` }}>
                                {f.icon}
                            </div>
                            <h3 className={styles.cardTitle}>{f.title}</h3>
                            <p className={styles.cardDesc}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

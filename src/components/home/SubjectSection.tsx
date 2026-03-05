import React from 'react';
import Link from 'next/link';
import { Dna, Atom, FlaskConical, ArrowUpRight } from 'lucide-react';
import styles from './SubjectSection.module.css';

export const SubjectSection = () => {
    const subjects = [
        {
            id: 'biology',
            title: 'Biology',
            desc: 'Botany and Zoology with NCERT line by line coverage. Priya Ma\'am\'s strongest subject.',
            icon: <Dna size={28} />,
            color: '#DC2626',
            bg: 'rgba(220, 38, 38, 0.06)',
            href: '/neet/biology'
        },
        {
            id: 'physics',
            title: 'Physics',
            desc: 'Visual concept clarity and numerical mastery. Build intuition, not just formulas.',
            icon: <Atom size={28} />,
            color: '#2563eb',
            bg: 'rgba(37, 99, 235, 0.06)',
            href: '/neet/physics'
        },
        {
            id: 'chemistry',
            title: 'Chemistry',
            desc: 'Physical, Organic, and Inorganic explained with clarity. Reaction mechanisms made simple.',
            icon: <FlaskConical size={28} />,
            color: '#059669',
            bg: 'rgba(5, 150, 105, 0.06)',
            href: '/neet/chemistry'
        }
    ];

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.header}>
                    <h2>Subjects</h2>
                    <p>Structured for NEET 2026. Start anywhere.</p>
                </div>

                <div className={styles.grid}>
                    {subjects.map((sub) => (
                        <Link key={sub.id} href={sub.href} className={styles.card}>
                            <div className={styles.cardTop}>
                                <div className={styles.iconBox} style={{ backgroundColor: sub.bg, color: sub.color }}>
                                    {sub.icon}
                                </div>
                                <ArrowUpRight size={18} className={styles.arrow} />
                            </div>
                            <h3 className={styles.cardTitle}>{sub.title}</h3>
                            <p className={styles.cardDesc}>{sub.desc}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
};

import React from 'react';
import Link from 'next/link';
import { Dna, Atom, FlaskConical, ArrowUpRight } from 'lucide-react';
import styles from './SubjectSection.module.css';

export const SubjectSection = () => {
  const subjects = [
    {
      id: 'biology',
      title: 'Biology',
      desc: 'Botany and Zoology, NCERT line by line. Priya Ma\'am\'s domain.',
      icon: <Dna size={26} />,
      color: '#DC2626',
      href: '/neet/biology',
      tag: 'Most popular',
    },
    {
      id: 'physics',
      title: 'Physics',
      desc: 'Visual concept clarity. Numerical mastery. Build intuition, not formulas.',
      icon: <Atom size={26} />,
      color: '#2563eb',
      href: '/neet/physics',
      tag: null,
    },
    {
      id: 'chemistry',
      title: 'Chemistry',
      desc: 'Physical, Organic, Inorganic. Reaction mechanisms made simple.',
      icon: <FlaskConical size={26} />,
      color: '#059669',
      href: '/neet/chemistry',
      tag: null,
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <p className={styles.eyebrow}>Subjects</p>
          <h2 className={styles.title}>Pick your starting point</h2>
        </div>

        <div className={styles.grid}>
          {subjects.map((sub) => (
            <Link key={sub.id} href={sub.href} className={styles.card}>
              {sub.tag && <span className={styles.tag}>{sub.tag}</span>}
              <div className={styles.cardTop}>
                <div className={styles.iconBox} style={{ color: sub.color }}>
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

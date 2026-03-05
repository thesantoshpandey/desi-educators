'use client';

import React from 'react';
import { FileCheck, AlertTriangle, Award, BookOpen } from 'lucide-react';
import styles from './NCERTSection.module.css';

const corrections = [
  {
    icon: <AlertTriangle size={20} />,
    topic: 'ATP Yield',
    detail: 'NCERT states 38 ATP per glucose. Modern biochemistry confirms 30 to 32.',
  },
  {
    icon: <AlertTriangle size={20} />,
    topic: 'Thymus Location',
    detail: 'Textbook diagram placement corrected via RTI filing with NCERT.',
  },
  {
    icon: <AlertTriangle size={20} />,
    topic: 'Genetic Notation',
    detail: 'Standardised notation errors flagged across Class 11 and 12 Biology chapters.',
  },
];

export const NCERTSection: React.FC = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.left}>
          <div className={styles.sectionBadge}>
            <FileCheck size={14} />
            NCERT Curriculum Audit
          </div>
          <h2 className={styles.title}>
            We found errors in your NCERT textbook. Then we fixed your prep.
          </h2>
          <p className={styles.subtitle}>
            Priya Ma&apos;am filed RTI applications with NCERT and NTA, identifying factual
            errors in the official Biology syllabus. Positive NCERT responses confirm these
            corrections. Your prep should reflect the real science, not outdated text.
          </p>

          <div className={styles.credentials}>
            <div className={styles.credItem}>
              <Award size={18} />
              <span>RTI verified corrections</span>
            </div>
            <div className={styles.credItem}>
              <BookOpen size={18} />
              <span>White paper published on SSRN</span>
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.correctionList}>
            {corrections.map((c, i) => (
              <div key={i} className={styles.correctionCard}>
                <div className={styles.correctionIcon}>{c.icon}</div>
                <div>
                  <h4 className={styles.correctionTopic}>{c.topic}</h4>
                  <p className={styles.correctionDetail}>{c.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

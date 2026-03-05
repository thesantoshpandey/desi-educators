'use client';

import React from 'react';
import { FileText, AlertTriangle, ExternalLink } from 'lucide-react';
import styles from './NCERTSection.module.css';

const corrections = [
  {
    topic: 'ATP Yield',
    detail: 'NCERT states 38 ATP per glucose. Modern biochemistry confirms 30 to 32. RTI filed with NCERT.',
  },
  {
    topic: 'Thymus Location',
    detail: 'Textbook diagram placement inconsistency identified. RTI filed requesting correction.',
  },
  {
    topic: 'Genetic Notation',
    detail: 'Notation errors flagged across Class 11 and 12 Biology chapters. RTI filed with NTA.',
  },
];

export const NCERTSection: React.FC = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.left}>
          <p className={styles.eyebrow}>NCERT Curriculum Audit</p>
          <h2 className={styles.title}>
            Your textbook has errors.{'\n'}
            <em className={styles.italic}>We caught them.</em>
          </h2>
          <p className={styles.subtitle}>
            Priya Ma&apos;am filed RTI applications with NCERT and NTA identifying
            factual errors in official Biology textbooks. A white paper documenting
            the methodology is published on SSRN. Your prep should reflect the real science.
          </p>

          <a
            href="https://doi.org/10.5281/zenodo.18619351"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.paperLink}
          >
            <FileText size={16} />
            Read the white paper
            <ExternalLink size={13} />
          </a>
        </div>

        <div className={styles.right}>
          {corrections.map((c, i) => (
            <div key={i} className={styles.correctionCard}>
              <div className={styles.correctionIcon}>
                <AlertTriangle size={18} />
              </div>
              <div>
                <h4 className={styles.correctionTopic}>{c.topic}</h4>
                <p className={styles.correctionDetail}>{c.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

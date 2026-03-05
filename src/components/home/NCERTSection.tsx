'use client';
import React from 'react';
import styles from './NCERTSection.module.css';

const corrections = [
  { label: 'ATP Yield', wrong: '38 ATP per glucose', right: '30 to 32 ATP (modern consensus)', src: 'Class 11, Ch. 14' },
  { label: 'Thymus Location', wrong: 'Described as near the heart', right: 'Anterior mediastinum, behind sternum', src: 'Class 12, Ch. 8' },
  { label: 'Genetic Notation', wrong: 'Inconsistent across chapters', right: 'HUGO Gene Nomenclature standard', src: 'Multiple chapters' },
];

export const NCERTSection: React.FC = () => (
  <section className={styles.section}>
    <div className={styles.inner}>
      <div className={styles.label}>
        <span className={styles.divider} />
        NCERT Under Review
      </div>
      <h2 className={styles.title}>
        We found the errors.<br />
        <span className={styles.titleMuted}>We filed formally.</span>
      </h2>
      <p className={styles.desc}>
        RTI applications filed with NCERT and NTA identifying factual errors
        in the NEET curriculum across Biology, Physics, and Chemistry.
        Findings published on SSRN and Zenodo. Awaiting formal response.
      </p>

      <div className={styles.grid}>
        {corrections.map((c, i) => (
          <div key={i} className={styles.card}>
            <div className={styles.cardLabel}>{c.label}</div>
            <div>
              <div className={styles.fieldLabel}>NCERT states</div>
              <div className={styles.wrong}>{c.wrong}</div>
            </div>
            <div>
              <div className={styles.fieldLabel}>Correction</div>
              <div className={styles.right}>{c.right}</div>
            </div>
            <div className={styles.source}>{c.src}</div>
          </div>
        ))}
      </div>

      <div className={styles.badge}>
        <div className={styles.dot} />
        <span className={styles.badgeText}>
          Published: &ldquo;The Summit Neuro Methodology&rdquo; on SSRN &amp; Zenodo (DOI: 10.5281/zenodo.18619351)
        </span>
      </div>
    </div>
  </section>
);

export default NCERTSection;

'use client';
import React from 'react';
import styles from './SubjectSection.module.css';

const subjects = [
  { n: '01', t: 'Cell Biology', d: 'From prokaryotes to eukaryotic organelles. Membrane transport, cell division, molecular machinery.' },
  { n: '02', t: 'Genetics', d: 'Mendelian to molecular. DNA replication, gene expression, mutations, and evolution at the gene level.' },
  { n: '03', t: 'Human Physiology', d: 'Digestion to neural signalling. Systems biology with clinical correlations and NCERT corrections.' },
  { n: '04', t: 'Physics', d: 'Mechanics, thermodynamics, optics, electrodynamics. Problem solving with conceptual clarity, not rote formulae.' },
  { n: '05', t: 'Chemistry', d: 'Organic, inorganic, physical. Reaction mechanisms, periodic trends, and numerical chemistry from first principles.' },
  { n: '06', t: 'Ecology & Evolution', d: 'Population dynamics, biodiversity, Oparin to modern synthesis. Evidence based, data driven.' },
];

export const SubjectSection: React.FC = () => (
  <section className={styles.section}>
    <div className={styles.header}>
      <div className={styles.label}>
        <span className={styles.divider} />
        Curriculum
      </div>
      <h2 className={styles.title}>
        Master every subject.<br />
        <span className={styles.titleMuted}>At the deepest level.</span>
      </h2>
    </div>
    <div className={styles.grid}>
      {subjects.map((s, i) => (
        <div key={i} className={styles.card}>
          <div className={styles.cardNum}>{s.n}</div>
          <h3 className={styles.cardTitle}>{s.t}</h3>
          <p className={styles.cardDesc}>{s.d}</p>
        </div>
      ))}
    </div>
  </section>
);

export default SubjectSection;

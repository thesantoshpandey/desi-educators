'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import styles from './Hero.module.css';
import { useAuth } from '@/context/AuthContext';

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const calc = () => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      if (distance < 0) return;
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  return timeLeft;
}

export const Hero: React.FC = () => {
  const { user } = useAuth();
  // NEET UG 2026: 3 May 2026, 2:00 PM IST (confirmed by NTA)
  const neetDate = new Date('2026-05-03T14:00:00+05:30');
  const { days, hours, minutes, seconds } = useCountdown(neetDate);

  return (
    <section className={styles.hero}>
      <div className={styles.grain} />

      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>NEET 2026 Preparation</p>

          <h1 className={styles.headline}>
            Learn Biology{'\n'}from <em className={styles.italic}>Priya Ma&apos;am</em>
          </h1>

          <p className={styles.subhead}>
            The Short Trick Queen. Teaching since 2017. NCERT Curriculum Auditor.
            Concept-first Biology that has reached millions across the country.
          </p>

          <div className={styles.countdown}>
            <span className={styles.countdownLabel}>Exam starts in</span>
            <div className={styles.countdownBlocks}>
              {[
                { val: days, label: 'Days' },
                { val: hours, label: 'Hrs' },
                { val: minutes, label: 'Min' },
                { val: seconds, label: 'Sec' },
              ].map(({ val, label }) => (
                <div key={label} className={styles.countdownBlock}>
                  <span className={styles.countdownNum}>{String(val).padStart(2, '0')}</span>
                  <span className={styles.countdownUnit}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.actions}>
            <Link href={user ? '/neet' : '/signup'}>
              <Button variant="primary" size="lg">
                {user ? 'Continue Learning' : 'Start Learning Free'}
                <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </Button>
            </Link>
            <Link href="/episodes" className={styles.ghostLink}>
              Listen to free lectures
            </Link>
          </div>

          <div className={styles.proofBar}>
            <div className={styles.proofItem}>
              <span className={styles.proofNum}>Since 2017</span>
              <span className={styles.proofLabel}>Teaching NEET Biology</span>
            </div>
            <div className={styles.proofDivider} />
            <div className={styles.proofItem}>
              <span className={styles.proofNum}>Millions</span>
              <span className={styles.proofLabel}>Students reached</span>
            </div>
            <div className={styles.proofDivider} />
            <div className={styles.proofItem}>
              <span className={styles.proofNum}>93+</span>
              <span className={styles.proofLabel}>Free lectures</span>
            </div>
          </div>
        </div>

        <div className={styles.visual}>
          <Image
            src="/hero-person-full.png"
            alt="Priya Ma'am"
            width={560}
            height={840}
            className={styles.heroImage}
            priority
          />
          <div className={styles.captionFloat}>
            <span className={styles.captionName}>Priya Pandey</span>
            <span className={styles.captionRole}>MSc Gold Medalist &middot; NCERT Auditor</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

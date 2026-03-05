'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, Sparkles } from 'lucide-react';
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
  const neetDate = new Date('2026-05-03T09:00:00+05:30');
  const { days, hours, minutes, seconds } = useCountdown(neetDate);

  return (
    <section className={styles.hero}>
      {/* Countdown strip */}
      <div className={styles.countdownStrip}>
        <Clock size={16} />
        <span className={styles.countdownLabel}>NEET 2026</span>
        <div className={styles.countdownBlocks}>
          {[
            { val: days, label: 'days' },
            { val: hours, label: 'hrs' },
            { val: minutes, label: 'min' },
            { val: seconds, label: 'sec' },
          ].map(({ val, label }) => (
            <div key={label} className={styles.countdownBlock}>
              <span className={styles.countdownNum}>{String(val).padStart(2, '0')}</span>
              <span className={styles.countdownUnit}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.badge}>
            <Sparkles size={14} />
            India&apos;s First AI NEET Mentor
          </div>

          <h1 className={styles.headline}>
            Learn Biology from
            <span className={styles.highlight}> Priya Ma&apos;am</span>
          </h1>

          <p className={styles.subhead}>
            MSc Gold Medalist. 75,000+ students on Instagram.
            NCERT Curriculum Auditor. Concept-first teaching that
            actually sticks.
          </p>

          <div className={styles.actions}>
            <Link href={user ? '/neet' : '/signup'}>
              <Button variant="primary" size="lg">
                {user ? 'Continue Learning' : 'Start Free Prep'}
                <ArrowRight size={18} style={{ marginLeft: 8 }} />
              </Button>
            </Link>
            <Link href="/episodes">
              <Button variant="outline" size="lg">
                Listen Free
              </Button>
            </Link>
          </div>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <strong>75K+</strong>
              <span>Instagram Students</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.statItem}>
              <strong>10.9K</strong>
              <span>YouTube Subscribers</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.statItem}>
              <strong>93+</strong>
              <span>Free Lectures</span>
            </div>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.imageContainer}>
            <div className={styles.imageGlow} />
            <Image
              src="/hero-person-full.png"
              alt="Priya Ma'am - Desi Educators"
              width={480}
              height={600}
              className={styles.heroImage}
              priority
            />
            <div className={styles.captionCard}>
              <p className={styles.captionName}>Priya Pandey</p>
              <p className={styles.captionDegree}>MSc Biology Gold Medalist</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

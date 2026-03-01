'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import styles from './Hero.module.css';

import { useAuth } from '@/context/AuthContext';

// NEET 2026 countdown - May 4, 2025 (update year as needed)
function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      if (distance < 0) { clearInterval(timer); return; }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  return timeLeft;
}

const Hero: React.FC = () => {
  const { user } = useAuth();
  // NEET UG 2026 expected date - update when NTA announces
  const neetDate = new Date('2026-05-03T09:00:00+05:30');
  const { days, hours, minutes, seconds } = useCountdown(neetDate);

  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        {/* NEET Countdown Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
          borderRadius: '12px',
          padding: '12px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          color: 'white',
          fontSize: '14px',
          fontWeight: 600,
        }}>
          <Clock size={18} />
          <span>NEET 2026 in</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { val: days, label: 'D' },
              { val: hours, label: 'H' },
              { val: minutes, label: 'M' },
              { val: seconds, label: 'S' },
            ].map(({ val, label }) => (
              <span key={label} style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '6px',
                padding: '4px 8px',
                minWidth: '36px',
                textAlign: 'center' as const,
              }}>
                {val}{label}
              </span>
            ))}
          </div>
        </div>

        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Master NEET with{' '}
            <span className={styles.highlight}>Visual Mind Maps</span>
          </h1>
          <p className={styles.subtitle}>
            Comprehensive NEET preparation materials designed by top educators.
            Visual mind maps, detailed notes, and practice questions for Physics,
            Chemistry, and Biology.
          </p>
          <div className={styles.ctaGroup}>
            <Link href={user ? '/neet' : '/pricing'}>
              <Button variant="primary" size="lg">
                {user ? 'Start Learning' : 'Get Started'}
                <ArrowRight size={20} />
              </Button>
            </Link>
            <Link href="/neet">
              <Button variant="outline" size="lg">
                Explore Subjects
              </Button>
            </Link>
          </div>

          {/* Priya AI CTA */}
          <a
            href="https://t.me/PriyaAI_bot"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '16px',
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'transform 0.2s',
            }}
          >
            <MessageCircle size={18} />
            Ask Priya AI - Your Free NEET Study Buddy on Telegram
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;

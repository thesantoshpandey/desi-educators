'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Hero.module.css';
import { useAuth } from '@/context/AuthContext';

function useCountdown(targetDate: Date) {
  const [tl, setTl] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const calc = () => {
      const d = targetDate.getTime() - Date.now();
      if (d < 0) return;
      setTl({
        days: Math.floor(d / 86400000),
        hours: Math.floor((d % 86400000) / 3600000),
        minutes: Math.floor((d % 3600000) / 60000),
        seconds: Math.floor((d % 60000) / 1000),
      });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  return tl;
}

/* Tree of Life SVG */
const TreeOfLife = () => (
  <svg width="200" height="400" viewBox="0 0 200 400" fill="none">
    <line x1="100" y1="380" x2="100" y2="80" stroke="currentColor" strokeWidth="1.5" opacity="0.4"/>
    {/* Roots */}
    <path d="M100 380 Q80 360 60 370" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
    <path d="M100 380 Q120 360 140 370" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
    <path d="M100 370 Q70 350 50 360" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.2"/>
    <path d="M100 370 Q130 350 150 360" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.2"/>
    {/* Branches */}
    <path d="M100 280 Q60 240 30 250" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.35"/>
    <path d="M100 280 Q140 240 170 250" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.35"/>
    <path d="M100 220 Q50 180 20 190" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
    <path d="M100 220 Q150 180 180 190" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
    <path d="M100 160 Q55 120 30 130" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.25"/>
    <path d="M100 160 Q145 120 170 130" stroke="currentColor" strokeWidth="0.7" fill="none" opacity="0.25"/>
    <path d="M100 110 Q70 80 50 85" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.2"/>
    <path d="M100 110 Q130 80 150 85" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.2"/>
    {/* Canopy circle */}
    <circle cx="100" cy="80" r="50" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.15"/>
    <circle cx="100" cy="80" r="35" stroke="currentColor" strokeWidth="0.3" fill="none" opacity="0.1"/>
    {/* Small leaves as circles */}
    {[30,250, 170,250, 20,190, 180,190, 30,130, 170,130, 50,85, 150,85].reduce<Array<{x:number,y:number}>>((acc, v, i) => {
      if (i % 2 === 0) acc.push({x: v, y: 0});
      else acc[acc.length-1].y = v;
      return acc;
    }, []).map((p, i) => (
      <circle key={i} cx={p.x} cy={p.y} r="3" fill="currentColor" opacity="0.15"/>
    ))}
  </svg>
);

/* Saraswati Veena SVG */
const Veena = () => (
  <svg width="60" height="350" viewBox="0 0 60 350" fill="none">
    {/* Main tube */}
    <line x1="30" y1="30" x2="30" y2="320" stroke="currentColor" strokeWidth="1.2" opacity="0.4"/>
    {/* Top gourd */}
    <ellipse cx="30" cy="30" rx="22" ry="18" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
    <ellipse cx="30" cy="30" rx="14" ry="10" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.15"/>
    {/* Bottom gourd */}
    <ellipse cx="30" cy="310" rx="26" ry="22" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.3"/>
    <ellipse cx="30" cy="310" rx="16" ry="14" stroke="currentColor" strokeWidth="0.4" fill="none" opacity="0.15"/>
    {/* Strings */}
    {[24, 27, 30, 33, 36].map((x, i) => (
      <line key={i} x1={x} y1="48" x2={x} y2="288" stroke="currentColor" strokeWidth="0.3" opacity={0.2 - i * 0.02}/>
    ))}
    {/* Frets */}
    {[80, 120, 155, 185, 210, 232, 250].map((y, i) => (
      <line key={i} x1="22" y1={y} x2="38" y2={y} stroke="currentColor" strokeWidth="0.4" opacity="0.2"/>
    ))}
    {/* Decorative peacock head at top */}
    <path d="M30 12 Q35 5 28 2 Q22 5 30 12" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.25"/>
  </svg>
);

/* DNA Helix accent */
const DNAHelix = ({ height = 300 }: { height?: number }) => (
  <svg width="24" height={height} viewBox={`0 0 24 ${height}`} fill="none">
    {Array.from({ length: Math.floor(height / 16) }).map((_, i) => {
      const y = i * 16 + 8;
      const off = Math.sin(i * 0.5) * 8;
      return (
        <g key={i}>
          <circle cx={12 + off} cy={y} r="1.5" fill="currentColor" opacity={i % 3 === 0 ? 0.5 : 0.25}/>
          <circle cx={12 - off} cy={y} r="1.5" fill="currentColor" opacity={i % 3 === 0 ? 0.25 : 0.15}/>
          {i % 2 === 0 && (
            <line x1={12 + off} y1={y} x2={12 - off} y2={y} stroke="currentColor" strokeWidth="0.3" opacity="0.15" strokeDasharray="2 2"/>
          )}
        </g>
      );
    })}
  </svg>
);

/* Cloud */
const Cloud = ({ top, left, scale, opacity }: { top: string; left: string; scale: number; opacity: number }) => (
  <div className={styles.cloud} style={{ top, left, transform: `scale(${scale})`, opacity }}>
    <svg width="200" height="60" viewBox="0 0 200 60" fill="none">
      <ellipse cx="100" cy="35" rx="90" ry="20" fill="rgba(0,0,0,0.012)"/>
      <ellipse cx="70" cy="28" rx="55" ry="24" fill="rgba(0,0,0,0.01)"/>
      <ellipse cx="130" cy="30" rx="50" ry="20" fill="rgba(0,0,0,0.01)"/>
    </svg>
  </div>
);

export const Hero: React.FC = () => {
  const { user } = useAuth();
  const neetDate = new Date('2026-05-03T14:00:00+05:30');
  const { days, hours, minutes, seconds } = useCountdown(neetDate);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setLoaded(true), 150); }, []);

  return (
    <section className={styles.hero}>
      <div className="grain" />

      {/* Decorative: Tree of Life */}
      <div className={styles.treeOfLife} style={{ color: 'var(--primary)' }}>
        <TreeOfLife />
      </div>

      {/* Decorative: Veena */}
      <div className={styles.veena} style={{ color: 'var(--primary)' }}>
        <Veena />
      </div>

      {/* DNA accents */}
      <div className={`${styles.dnaAccent} ${styles.dnaLeft}`} style={{ color: 'var(--primary)' }}>
        <DNAHelix height={400} />
      </div>
      <div className={`${styles.dnaAccent} ${styles.dnaRight}`} style={{ color: 'var(--text-muted)' }}>
        <DNAHelix height={250} />
      </div>

      {/* Clouds */}
      <Cloud top="8%" left="-3%" scale={1.1} opacity={0.5} />
      <Cloud top="18%" left="55%" scale={0.7} opacity={0.3} />
      <Cloud top="65%" left="25%" scale={0.9} opacity={0.2} />

      <div className={styles.container} style={{
        animation: loaded ? 'fadeUp 0.9s cubic-bezier(0.23,1,0.32,1)' : 'none',
        opacity: loaded ? 1 : 0,
      }}>
        <div className={styles.content}>
          <p className={styles.eyebrow}>
            <span className={styles.divider} />
            MSc Gold Medalist &middot; Teaching Since 2017
          </p>

          <h1 className={styles.headline}>
            NEET is not<br />
            <span className={styles.muted}>memorisation.</span><br />
            It is <em className={styles.italic}>understanding.</em>
          </h1>

          <p className={styles.subhead}>
            Crack NEET with Priya Ma&apos;am. Biology, Physics, Chemistry.
            Every concept at the deepest level. Every NCERT error corrected.
            Every doubt answered by AI.
          </p>

          <div className={styles.countdown}>
            <span className={styles.countdownLabel}>NEET UG 2026</span>
            <div className={styles.countdownBlocks}>
              {[
                { val: days, label: 'Days' },
                { val: hours, label: 'Hours' },
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
              <button className={styles.btnPrimary}>
                {user ? 'Continue Learning' : 'Start Free Lectures'}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </Link>
            <Link href="/episodes">
              <button className={styles.btnGhost}>Try Priya AI</button>
            </Link>
          </div>
        </div>

        <div className={styles.visual}>
          <div className={styles.glow} />
          <div className={styles.photoWrap}>
            <Image
              src="/hero-person-full.png"
              alt="Priya Ma'am"
              width={560}
              height={840}
              className={styles.heroImage}
              priority
            />
            <div className={styles.photoFade} />
          </div>
        </div>
      </div>

      <div className={styles.scrollLine} style={{ animation: 'fadeIn 2s ease 2s both' }} />
    </section>
  );
};

export default Hero;

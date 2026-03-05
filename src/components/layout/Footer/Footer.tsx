'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Instagram, Youtube, MessageCircle } from 'lucide-react';
import styles from './Footer.module.css';

export const Footer = () => {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.brand}>
            <Link href="/" className={styles.logo}>
              <Image
                src="/logo.png"
                alt="Desi Educators"
                width={100}
                height={60}
                style={{ width: 'auto', height: '28px' }}
              />
              <span className={styles.logoText}>Desi Educators</span>
            </Link>
            <p className={styles.tagline}>
              Concept-first NEET preparation by Priya Ma&apos;am.
              Teaching since 2017.
            </p>
            <div className={styles.socials}>
              <a href="https://www.instagram.com/desieducators" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Instagram">
                <Instagram size={18} />
              </a>
              <a href="https://www.youtube.com/@desieducators" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="YouTube">
                <Youtube size={18} />
              </a>
              <a href="https://t.me/PriyaAI_bot" target="_blank" rel="noopener noreferrer" className={styles.socialLink} aria-label="Priya AI">
                <MessageCircle size={18} />
              </a>
            </div>
          </div>

          <div className={styles.links}>
            <div className={styles.column}>
              <h4 className={styles.colTitle}>Learn</h4>
              <Link href="/neet">Subjects</Link>
              <Link href="/episodes">Episodes</Link>
              <Link href="/pricing">Pricing</Link>
            </div>
            <div className={styles.column}>
              <h4 className={styles.colTitle}>Company</h4>
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
            </div>
            <div className={styles.column}>
              <h4 className={styles.colTitle}>Legal</h4>
              <Link href="/terms">Terms</Link>
              <Link href="/privacy-policy">Privacy</Link>
              <Link href="/refund-policy">Refund Policy</Link>
            </div>
          </div>
        </div>

        <div className={styles.bottom}>
          <p>&copy; 2026 Desi Educators Private Limited</p>
        </div>
      </div>
    </footer>
  );
};

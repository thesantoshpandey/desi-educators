'use client';
// Triggering Vercel deployment

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import styles from './Footer.module.css';

export const Footer = () => {
    const pathname = usePathname();
    if (pathname.startsWith('/admin')) return null;

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.brandSection}>
                    <div className={styles.logo}>
                        <Image
                            src="/logo.png"
                            alt="Desi Educators Logo"
                            width={100}
                            height={60}
                            style={{ width: 'auto', height: '30px' }}
                        />
                        <span style={{ color: 'black', fontWeight: 700 }}>Desi Educators</span>
                    </div>
                    <p className={styles.tagline}>
                        Desi Roots. Global Results. Your trusted partner for NEET preparation.
                    </p>
                    <div className={styles.socials}>
                        {/* Social links placeholder - hidden until active */}
                        {/* <Facebook size={20} />
                        <Twitter size={20} />
                        <Instagram size={20} />
                        <Linkedin size={20} /> */}
                    </div>
                </div>

                <div className={styles.linksSection}>
                    <div className={styles.column}>
                        <h4>Company</h4>
                        <Link href="/about">About Us</Link>
                        <Link href="/contact">Contact</Link>
                        {/* <Link href="/careers">Careers</Link> */}
                    </div>
                    <div className={styles.column}>
                        <h4>Resources</h4>
                        <Link href="/neet">NEET Syllabus</Link>
                        {/* <Link href="/blog">Blog</Link> */}
                        {/* <Link href="/toppers">Success Stories</Link> */}
                    </div>
                    <div className={styles.column}>
                        <h4>Legal</h4>
                        <Link href="/terms">Terms & Conditions</Link>
                        <Link href="/privacy-policy">Privacy Policy</Link>
                        <Link href="/refund-policy">Refund & Cancellation Policy</Link>
                    </div>
                </div>
            </div>
            <div className={styles.copyright}>
                &copy; {new Date().getFullYear()} Desi Educators Private Limited. All rights reserved.
            </div>
        </footer >
    );
};

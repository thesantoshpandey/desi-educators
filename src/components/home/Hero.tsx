'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';
import styles from './Hero.module.css';

import { useAuth } from '@/context/AuthContext';

export const Hero = () => {
    const { user } = useAuth();

    return (
        <section className={styles.hero}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <span className={styles.badge}>New: NEET 2026 Crash Course</span>
                    <h1 className={styles.headline}>
                        <span style={{ display: 'block', fontSize: '0.6em', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--primary-color)', marginBottom: '8px' }}>Desi Educators</span>
                        Crack NEET with <br />
                        <span className={styles.highlight}>Concept-First Learning</span>
                    </h1>
                    <p className={styles.subhead}>
                        Desi Educators is your all-in-one platform to master Biology, Physics, and Chemistry.
                        Structured courses, NCERT-focused notes, and limitless practice.
                    </p>
                    <div className={styles.actions}>
                        <Link href={user ? "/dashboard" : "/signup"}>
                            <Button size="lg" rightIcon={<ArrowRight size={20} />}>
                                {user ? "Go to Dashboard" : "Start Prep for Free"}
                            </Button>
                        </Link>

                    </div>
                    <div className={styles.stats}>
                        <div className={styles.statItem}>
                            <strong>10k+</strong>
                            <span>Students</span>
                        </div>
                        <div className={styles.divider}></div>
                        <div className={styles.statItem}>
                            <strong>500+</strong>
                            <span>Top Ranks</span>
                        </div>
                        <div className={styles.divider}></div>
                        <div className={styles.statItem}>
                            <strong>4.8/5</strong>
                            <span>Rating</span>
                        </div>
                    </div>
                </div>
                <div className={styles.visual}>
                    {/* Abstract visual representation */}
                    <div className={styles.circle1}></div>
                    <div className={styles.circle2}></div>
                    <div className={styles.cardVisual}>
                        <div className={styles.cardHeader}>
                            <div className={styles.dot}></div>
                            <div className={styles.dot}></div>
                            <div className={styles.dot}></div>
                        </div>
                        <div className={styles.cardBody}>
                            <h4>Biology - Genetics</h4>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: '75%' }}></div>
                            </div>
                            <p>Lesson 3: DNA Replication</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

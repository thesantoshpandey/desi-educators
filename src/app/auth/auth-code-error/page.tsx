'use client';

import React from 'react';
import { Button, Card } from '@/components/ui';
import Link from 'next/link';
import styles from '../../login/LoginPage.module.css'; // Reuse login styles

export default function AuthCodeError() {
    return (
        <div className={styles.container}>
            <Card className={styles.authCard}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#ff4d4f' }}>
                        Link Expired
                    </h1>
                    <p style={{ marginBottom: '1.5rem', color: '#666' }}>
                        This password reset link is invalid or has already been used.
                        <br />
                        Please request a new one.
                    </p>

                    <Link href="/forgot-password" style={{ textDecoration: 'none' }}>
                        <Button style={{ width: '100%' }}>
                            Request New Link
                        </Button>
                    </Link>

                    <div style={{ marginTop: '1rem' }}>
                        <Link href="/login" className={styles.link}>
                            Back to Login
                        </Link>
                    </div>
                </div>
            </Card>
        </div>
    );
}

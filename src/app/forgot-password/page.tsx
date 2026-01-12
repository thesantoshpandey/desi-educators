'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import styles from '../(auth)/auth.module.css';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'https://desieducators.com/update-password',
            });

            if (error) throw error;

            setMessage('Check your email for the password reset link.');
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Card className={styles.authCard}>
                <div className={styles.header}>
                    <h1>Reset Password</h1>
                    <p>Enter your email to receive instructions</p>
                </div>

                {message ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{
                            backgroundColor: '#FEE2E2',
                            color: '#B91C1C',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontWeight: 500
                        }}>
                            {message}
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>
                            Can't find it? Check your spam folder.
                        </p>
                        <Link href="/login">
                            <Button variant="outline" style={{ width: '100%' }}>Back to Login</Button>
                        </Link>
                    </div>
                ) : (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="Enter your registered email"
                            icon={<Mail size={18} />}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        {error && <p style={{ color: 'red', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}

                        <Button type="submit" style={{ width: '100%' }} disabled={isLoading} isLoading={isLoading}>
                            Send Reset Link
                        </Button>

                        <div className={styles.footer}>
                            <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none' }}>
                                <ArrowLeft size={16} /> Back to Login
                            </Link>
                        </div>
                    </form>
                )}
            </Card>
        </div>
    );
}

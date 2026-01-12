'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import styles from '../(auth)/auth.module.css';
import { supabase } from '@/lib/supabase';

export default function UpdatePasswordPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        // We need to wait for Supabase to handle the recovery link exchange
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                setCheckingSession(false);
            }
        };

        checkSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth event:", event);
            if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
                setCheckingSession(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.updateUser({ password: password });

            if (error) throw error;

            setSuccess('Password updated successfully!');

            // Explicitly sign out to ensure clean state and avoid session conflict
            await supabase.auth.signOut();

            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to update password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Card className={styles.authCard}>
                <div className={styles.header}>
                    <h1>Set New Password</h1>
                    <p>Enter your new password below</p>
                </div>

                {checkingSession ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-gray-500">Verifying security link...</p>
                    </div>
                ) : success ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <div style={{
                            backgroundColor: '#FEE2E2',
                            color: '#B91C1C',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontWeight: 500
                        }}>
                            {success}
                        </div>
                        <p>Redirecting to login...</p>
                    </div>
                ) : (
                    <form className={styles.form} onSubmit={handleSubmit}>
                        <Input
                            label="New Password"
                            type="password"
                            placeholder="Enter new password"
                            icon={<Lock size={18} />}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="Confirm new password"
                            icon={<Lock size={18} />}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />

                        {error && <p style={{ color: 'red', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}

                        <Button type="submit" style={{ width: '100%' }} disabled={isLoading} isLoading={isLoading}>
                            Update Password
                        </Button>
                    </form>
                )}
            </Card>
        </div>
    );
}

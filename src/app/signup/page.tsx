'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, Phone } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import styles from '../(auth)/auth.module.css';

import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
    const router = useRouter();
    const { signup } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    // Form states
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { success, error: signupError } = await signup(name, email, password, phone);
            if (success) {
                router.push('/verify');
            } else {
                setError(signupError || 'Email already exists. Please login.');
            }
        } catch (err) {
            setError('Failed to create account');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <Card className={styles.authCard}>
                <div className={styles.header}>
                    <h1>Create Account</h1>
                    <p>Join thousands of NEET aspirants today</p>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <Input
                        label="Full Name"
                        type="text"
                        placeholder="Enter your full name"
                        icon={<User size={18} />}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <Input
                        label="Phone Number"
                        type="tel"
                        placeholder="Enter mobile number"
                        icon={<Phone size={18} />}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="Enter your email"
                        icon={<Mail size={18} />}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="Create a password"
                        icon={<Lock size={18} />}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && <p style={{ color: 'red', fontSize: '0.9rem', textAlign: 'center' }}>{error}</p>}

                    <Button type="submit" style={{ width: '100%' }} disabled={isLoading} isLoading={isLoading}>
                        Create Account
                    </Button>
                </form>

                <div className={styles.footer}>
                    Already have an account?{' '}
                    <Link href="/login" className={styles.link}>
                        Log In
                    </Link>
                </div>
            </Card>
        </div>
    );
}

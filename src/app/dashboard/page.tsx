'use client';

import React, { useEffect } from 'react';
import { Card, Button } from '@/components/ui';
import { BookOpen, Target, TrendingUp, Clock } from 'lucide-react';
import styles from './Dashboard.module.css';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { supabase } from '@/lib/supabase';

export default function DashboardPage() {
    const { user, isLoading } = useAuth();
    const { enrolledTargetIds, refreshEnrollments } = useContent(); // Use global context
    const router = useRouter();

    const [courses, setCourses] = React.useState<any[]>([]);
    const [recentAttempts, setRecentAttempts] = React.useState<any[]>([]);
    const [stats, setStats] = React.useState({ accuracy: 0, completed: 0, testsTaken: 0 });

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);


    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return;

            // 1. Use Global Context for Enrollments (Instant & Cached)
            try {
                // Ensure we have latest data
                if (enrolledTargetIds.length === 0) {
                    await refreshEnrollments();
                }

                const hasFullAccess = enrolledTargetIds.includes('full_bundle') || enrolledTargetIds.includes('full-year');

                const activeCourses = [
                    { name: 'Full NEET Bundle', enrolled: hasFullAccess, progress: 0, color: '#DC2626' },
                    { name: 'Physics Mastery', enrolled: hasFullAccess || enrolledTargetIds.includes('physics'), progress: 0, color: '#FF5722' },
                    { name: 'Chemistry Mastery', enrolled: hasFullAccess || enrolledTargetIds.includes('chemistry'), progress: 0, color: '#2196F3' },
                    { name: 'Biology Mastery', enrolled: hasFullAccess || enrolledTargetIds.includes('biology'), progress: 0, color: '#8b5cf6' },
                    { name: 'All India Test Series', enrolled: enrolledTargetIds.includes('test_series') || enrolledTargetIds.includes('test-series'), progress: 0, color: '#FFC107' },
                ].filter(c => c.enrolled);

                setCourses(activeCourses);
            } catch (err) {
                console.error("Error processing enrollments:", err);
            }

            // 2. Fetch Quiz Attempts
            try {
                // Fetch attempts first
                const { data: attempts, error: attemptsError } = await supabase
                    .from('quiz_attempts')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('completed_at', { ascending: false });

                if (attemptsError) throw attemptsError;

                if (attempts && attempts.length > 0) {
                    // Fetch related quiz titles manually
                    const quizIds = Array.from(new Set(attempts.map((a: any) => a.quiz_id)));
                    const { data: quizData, error: quizError } = await supabase
                        .from('quizzes')
                        .select('id, title')
                        .in('id', quizIds);

                    if (quizError) console.error("Error fetching quiz titles:", quizError);

                    // Map titles back to attempts
                    const quizMap = (quizData || []).reduce((acc: any, q: any) => {
                        acc[q.id] = q.title;
                        return acc;
                    }, {});

                    const enrichedAttempts = attempts.map((a: any) => ({
                        ...a,
                        quizzes: { title: quizMap[a.quiz_id] || 'Unknown Quiz' }
                    }));

                    setRecentAttempts(enrichedAttempts);

                    // Calculate Stats
                    let totalCorrect = 0;
                    let totalQuestions = 0;
                    enrichedAttempts.forEach((a: any) => {
                        totalCorrect += a.correct_count || 0;
                        totalQuestions += (a.total_marks || 0) / 4;
                    });

                    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
                    setStats({
                        accuracy,
                        completed: 0,
                        testsTaken: enrichedAttempts.length
                    });
                } else {
                    setRecentAttempts([]);
                    setStats({ accuracy: 0, completed: 0, testsTaken: 0 });
                }
            } catch (err) {
                console.error("Error fetching dashboard data (Full):", JSON.stringify(err, null, 2));
            }
        };

        fetchDashboardData();
    }, [user]);

    if (isLoading || !user) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <p>Loading...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h1>Welcome, {user.name}! 👋</h1>
                <p>Start your learning journey today.</p>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <Card padding="md" className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(0, 169, 157, 0.1)' }}>
                        <Target size={24} color="var(--primary-color)" />
                    </div>
                    <div>
                        <h3>{stats.accuracy}%</h3>
                        <p>Overall Accuracy</p>
                    </div>
                </Card>
                <Card padding="md" className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(33, 150, 243, 0.1)' }}>
                        <BookOpen size={24} color="#2196F3" />
                    </div>
                    <div>
                        <h3>{stats.testsTaken}</h3>
                        <p>Tests Taken</p>
                    </div>
                </Card>
                <Card padding="md" className={styles.statCard}>
                    <div className={styles.statIcon} style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
                        <TrendingUp size={24} color="#FFC107" />
                    </div>
                    <div>
                        <h3>-</h3>
                        <p>Current Rank</p>
                    </div>
                </Card>
            </div>

            <div className={styles.mainGrid}>
                {/* Enrolled Courses / Progress */}
                <section className={styles.progressSection}>
                    <h2>Your Enrolled Courses</h2>
                    <Card className={styles.progressCard}>
                        {courses.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748b' }}>
                                <p>You haven't enrolled in any courses yet.</p>
                                <Link href="/pricing">
                                    <Button size="sm" style={{ marginTop: '12px' }}>Browse Courses</Button>
                                </Link>
                            </div>
                        ) : (
                            courses.map((course, i) => (
                                <div key={i} className={styles.subjectRow}>
                                    <div className={styles.subjectInfo}>
                                        <span className={styles.subjectName}>{course.name}</span>
                                        <span className={styles.subjectPercent}>{course.progress}%</span>
                                    </div>
                                    <div className={styles.progressBar}>
                                        <div className={styles.progressFill} style={{ width: `${course.progress}%`, backgroundColor: course.color }}></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </Card>
                </section>

                {/* Recent Activity / Continue Learning */}
                <section className={styles.continueSection}>
                    <h2>Recent Quiz Activity</h2>
                    <Card className={styles.continueCard}>
                        {recentAttempts.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                                <p>No recent activity.</p>
                                <Link href="/neet/physics">
                                    <Button variant="outline" size="sm" style={{ marginTop: '12px' }}>Start Learning</Button>
                                </Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {recentAttempts.slice(0, 5).map((attempt, i) => (
                                    <div key={i} style={{
                                        padding: '12px', borderRadius: '8px', backgroundColor: '#f8fafc',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{attempt.quizzes?.title || 'Unknown Quiz'}</p>
                                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                                {new Date(attempt.completed_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span style={{
                                                fontWeight: 700,
                                                color: attempt.percentage >= 80 ? '#16a34a' : attempt.percentage >= 50 ? '#ca8a04' : '#dc2626'
                                            }}>
                                                {Math.round(attempt.percentage)}%
                                            </span>
                                            <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>Score: {attempt.score}</p>
                                            <Link href={`/quiz/result/${attempt.id}`}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
                                                    Review
                                                </span>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </section>
            </div>
        </div>
    );
}

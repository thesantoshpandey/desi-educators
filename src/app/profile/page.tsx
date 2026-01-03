'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { User, Mail, Save, UserCircle, BookOpen, ShoppingBag, LayoutDashboard, Clock, ShieldCheck, ChevronRight, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { INDIAN_STATES, CITIES_BY_STATE } from '@/data/locations';

const DAYS = Array.from({ length: 31 }, (_, i) => (i + 1).toString());
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];
const YEARS = Array.from({ length: 60 }, (_, i) => (2025 - i).toString()); // 2025 down to 1966

export default function ProfilePage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState('overview');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    // Extended Details State
    const [targetExam, setTargetExam] = useState('Select Exam');
    const [currentClass, setCurrentClass] = useState('Select Class');
    const [state, setState] = useState('');
    const [city, setCity] = useState('');

    const [dobDay, setDobDay] = useState('');
    const [dobMonth, setDobMonth] = useState('');
    const [dobYear, setDobYear] = useState('');

    const [isEditing, setIsEditing] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    // Data States
    const [orders, setOrders] = useState<any[]>([]);

    const [myCourses, setMyCourses] = useState<any[]>([]);
    const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
    const [profileStats, setProfileStats] = useState({
        coursesEnrolled: '0',
        testsAttempted: '0',
        accuracy: '0%'
    });

    // Real user stats
    const statsItems = [
        { label: 'Courses Enrolled', value: profileStats.coursesEnrolled, icon: BookOpen, color: '#DC2626' },
        { label: 'Tests Attempted', value: profileStats.testsAttempted, icon: ShieldCheck, color: '#FF5722' },
        { label: 'Overall Accuracy', value: profileStats.accuracy, icon: Clock, color: '#2196F3' }
    ];

    const [phone, setPhone] = useState('');
    const [isChangingPhone, setIsChangingPhone] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [isOtpSent, setIsOtpSent] = useState(false);

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        } else if (user) {
            // Fetch Profile Data from Supabase
            const fetchProfile = async () => {
                try {
                    // Fetch profile
                    const { data: profile, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .single();

                    if (profile) {
                        setName(profile.name || user.name);
                        setEmail(profile.email || user.email);
                        setPhone(profile.phone || '');
                        setTargetExam(profile.target_exam || 'Select Exam');
                        setCurrentClass(profile.current_class || 'Select Class');
                        setState(profile.state || '');
                        setCity(profile.city || '');

                        if (profile.dob) {
                            const [y, m, d] = profile.dob.split('-');
                            setDobYear(y || '');
                            setDobMonth(m ? MONTHS[parseInt(m) - 1] : '');
                            setDobDay(d ? parseInt(d).toString() : '');
                        }
                    } else {
                        // Fallback if no profile yet (should exist due to trigger, but just in case)
                        setName(user.name);
                        setEmail(user.email);
                    }

                    // Fetch Orders
                    const { data: userOrders } = await supabase
                        .from('orders')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false });

                    if (userOrders) {
                        setOrders(userOrders.map(o => ({
                            id: o.order_id,
                            date: new Date(o.created_at).toLocaleDateString(),
                            plan: o.plan_name,
                            amount: `₹${o.amount}`,
                            status: o.status
                        })));
                    }

                    // Fetch Enrollments (Courses)
                    const { data: enrollments } = await supabase
                        .from('enrollments')
                        .select('target_id')
                        .eq('user_id', user.id);

                    const courses = [];
                    const targets = enrollments ? enrollments.map(e => e.target_id) : [];

                    if (targets.includes('full_bundle')) {
                        courses.push({ name: 'NEET 2026 Full Course', progress: 0, subject: 'Bundle' });
                    } else {
                        if (targets.includes('physics')) courses.push({ name: 'Physics Mastery', progress: 0, subject: 'Physics' });
                        if (targets.includes('chemistry')) courses.push({ name: 'Chemistry Essentials', progress: 0, subject: 'Chemistry' });
                        if (targets.includes('biology')) courses.push({ name: 'Biology Deep Dive', progress: 0, subject: 'Biology' });
                    }
                    if (targets.includes('test_series')) {
                        courses.push({ name: 'All India Test Series', progress: 0, subject: 'Test Series' });
                    }
                    setMyCourses(courses);

                } catch (err) {
                    console.error('Error loading profile:', err);
                }

                // Fetch Quiz Attempts (Split Query)
                try {
                    const { data: attempts, error: attemptsError } = await supabase
                        .from('quiz_attempts')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('completed_at', { ascending: false });

                    if (!attemptsError && attempts && attempts.length > 0) {
                        const quizIds = Array.from(new Set(attempts.map((a: any) => a.quiz_id)));
                        const { data: quizData } = await supabase
                            .from('quizzes')
                            .select('id, title')
                            .in('id', quizIds);

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

                        // Update Stat Cards
                        // Courses Enrolled (index 0), Tests Attempted (index 1), Hours Studied (index 2)
                        // This is a bit hacky with direct state mutation but effectively sets initial values
                        // Better to use state for the stats array itself, but trying to be minimally invasive first.
                        // Actually, let's use a separate state or update the existing one if it were state.
                        // The 'stats' variable is constant here, so I should introduce a state for it.
                        setProfileStats({
                            coursesEnrolled: myCourses.length.toString(),
                            testsAttempted: enrichedAttempts.length.toString(),
                            accuracy: `${accuracy}%`
                        });
                    }
                } catch (err) {
                    console.error("Error fetching quiz data for profile:", err);
                }
            };

            fetchProfile();
        }
    }, [user, isLoading, router]);

    fetchProfile();
}
    }, [user, isLoading, router]);


const handleDeleteAttempt = async (attemptId: string) => {
    if (!confirm('Are you sure you want to delete this attempt? This action cannot be undone.')) return;

    try {
        const { error } = await supabase
            .from('quiz_attempts')
            .delete()
            .eq('id', attemptId);

        if (error) throw error;

        // Update UI locally
        const updatedAttempts = recentAttempts.filter(a => a.id !== attemptId);
        setRecentAttempts(updatedAttempts);

        // Recalculate stats
        let totalCorrect = 0;
        let totalQuestions = 0;
        updatedAttempts.forEach((a: any) => {
            totalCorrect += a.correct_count || 0;
            totalQuestions += (a.total_marks || 0) / 4;
        });
        const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

        setProfileStats(prev => ({
            ...prev,
            testsAttempted: updatedAttempts.length.toString(),
            accuracy: `${accuracy}%`
        }));

    } catch (err) {
        console.error('Error deleting attempt:', err);
        alert('Failed to delete attempt');
    }
};

const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    setState(newState);
    setCity(''); // Reset city when state changes
};

const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare DOB
    const formattedMonth = (MONTHS.indexOf(dobMonth) + 1).toString().padStart(2, '0');
    const formattedDay = dobDay.padStart(2, '0');
    const dob = (dobYear && dobMonth && dobDay) ? `${dobYear}-${formattedMonth}-${formattedDay}` : null;

    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                name,
                target_exam: targetExam,
                current_class: currentClass,
                state,
                city,
                dob,
                updated_at: new Date().toISOString()
            })
            .eq('id', user?.id);

        if (error) throw error;

        setIsEditing(false);
        setSuccessMsg('Profile updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
        console.error('Error updating profile:', err);
        alert('Failed to update profile. Please try again.');
    }
};



if (isLoading || !user) {
    return <div style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>Loading your profile...</div>;
}

const tabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'courses', label: 'My Courses', icon: <BookOpen size={20} /> },
    { id: 'quizzes', label: 'Quiz History', icon: <ShieldCheck size={20} /> },
    { id: 'orders', label: 'Order History', icon: <ShoppingBag size={20} /> },
    { id: 'settings', label: 'Settings', icon: <User size={20} /> },
];

return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 64px)', padding: '40px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

            {/* Header Section */}
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '24px', backgroundColor: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: '#e0f2f1',
                    color: '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    fontWeight: 700
                }}>
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1 style={{ fontSize: '2rem', marginBottom: '8px', fontWeight: 800 }}>{user.name}</h1>
                    <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '12px' }}>{user.email}</p>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <span style={{ padding: '6px 16px', backgroundColor: '#DC2626', color: 'white', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                            {targetExam} Aspirant
                        </span>
                        <span style={{ padding: '6px 16px', backgroundColor: '#f1f5f9', color: '#475569', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 }}>
                            {currentClass}
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', alignItems: 'flex-start' }}>
                {/* Sidebar Tabs */}
                <div style={{ flex: '1 1 280px', minWidth: '250px' }}>
                    <Card padding="none" style={{ height: 'fit-content', overflow: 'hidden' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '16px 24px',
                                        width: '100%',
                                        border: 'none',
                                        backgroundColor: activeTab === tab.id ? '#f0fdfa' : 'white',
                                        color: activeTab === tab.id ? '#DC2626' : '#64748b',
                                        fontWeight: activeTab === tab.id ? 600 : 500,
                                        cursor: 'pointer',
                                        textAlign: 'left',
                                        borderLeft: activeTab === tab.id ? '4px solid #DC2626' : '4px solid transparent',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    {tab.icon}
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Content Area */}
                <div style={{ flex: '999 1 300px', minHeight: '500px', maxWidth: '100%' }}>

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                                {statsItems.map((stat, i) => (
                                    <Card key={i} padding="md">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: `${stat.color}20` }}>
                                                <stat.icon size={24} color={stat.color} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{stat.value}</div>
                                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '8px' }}>Continue Learning</h3>
                            {myCourses.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                                    {myCourses.slice(0, 6).map((course, i) => (
                                        <Card key={i} padding="lg">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                                                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#DC2626', backgroundColor: '#e0f2f1', padding: '4px 8px', borderRadius: '4px' }}>
                                                    {course.subject}
                                                </span>
                                            </div>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>{course.name}</h4>
                                            <div style={{ marginBottom: '16px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px', color: '#64748b' }}>
                                                    <span>Progress</span>
                                                    <span>{course.progress}%</span>
                                                </div>
                                                <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
                                                    <div style={{ width: `${course.progress}%`, height: '100%', backgroundColor: '#DC2626', borderRadius: '4px' }}></div>
                                                </div>
                                            </div>
                                            <Link href="/dashboard">
                                                <Button variant="outline" size="sm" style={{ width: '100%' }}>Resume Learning</Button>
                                            </Link>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                                    <p style={{ color: '#64748b' }}>You haven't enrolled in any courses yet.</p>
                                    <Link href="/pricing" style={{ color: '#DC2626', fontWeight: 600, marginTop: '8px', display: 'inline-block' }}>Browse Courses &rarr;</Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* QUIZZES TAB */}
                    {activeTab === 'quizzes' && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>Quiz Performance History</h2>
                            {recentAttempts.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {recentAttempts.map((attempt, i) => (
                                        <Card key={i} padding="md">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                                                <div>
                                                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{attempt.quizzes?.title || 'Unknown Quiz'}</h4>
                                                    <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                                                        Taken on {new Date(attempt.completed_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '24px', textAlign: 'right', alignItems: 'center' }}>
                                                    <div>
                                                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#DC2626' }}>{attempt.score}</div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Score</div>
                                                    </div>
                                                    <div>
                                                        <div style={{
                                                            fontSize: '1.25rem', fontWeight: 700,
                                                            color: attempt.percentage >= 80 ? '#16a34a' : attempt.percentage >= 50 ? '#ca8a04' : '#DC2626'
                                                        }}>
                                                            {Math.round(attempt.percentage)}%
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Percentage</div>
                                                    </div>
                                                    <Link href={`/quiz/result/${attempt.id}`}>
                                                        <Button size="sm" variant="outline">Review</Button>
                                                    </Link>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        style={{ color: '#ef4444', padding: '8px' }}
                                                        onClick={() => handleDeleteAttempt(attempt.id)}
                                                        title="Delete History"
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '16px' }}>
                                    <ShieldCheck size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>No Quizzes Attempted</h3>
                                    <p style={{ color: '#64748b', marginBottom: '24px' }}>Test your knowledge by taking a quiz.</p>
                                    <Link href="/neet/physics">
                                        <Button>Start Learning</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* MY COURSES TAB */}
                    {activeTab === 'courses' && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>My Enrolled Courses</h2>
                            {myCourses.length > 0 ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                                    {myCourses.map((course, i) => (
                                        <Card key={i} padding="lg">
                                            <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '8px' }}>{course.name}</h4>
                                            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>Subject: {course.subject}</p>
                                            <Link href="/dashboard">
                                                <Button style={{ width: '100%' }}>Go to Classroom</Button>
                                            </Link>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '16px' }}>
                                    <BookOpen size={48} color="#cbd5e1" style={{ marginBottom: '16px' }} />
                                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>No Courses Found</h3>
                                    <p style={{ color: '#64748b', marginBottom: '24px' }}>Start your journey by enrolling in a course today.</p>
                                    <Link href="/pricing">
                                        <Button>Explore Courses</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ORDERS TAB */}
                    {activeTab === 'orders' && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>Order History</h2>
                            <Card padding="none">
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                                        <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                            <tr>
                                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Order ID</th>
                                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Date</th>
                                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Plan / Course</th>
                                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Amount</th>
                                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                                                        No orders found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                orders.map((order, i) => (
                                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                        <td style={{ padding: '16px', fontWeight: 500 }}>{order.id}</td>
                                                        <td style={{ padding: '16px', color: '#64748b' }}>{order.date}</td>
                                                        <td style={{ padding: '16px' }}>{order.plan}</td>
                                                        <td style={{ padding: '16px', fontWeight: 600 }}>{order.amount}</td>
                                                        <td style={{ padding: '16px' }}>
                                                            <span style={{
                                                                padding: '4px 10px',
                                                                borderRadius: '20px',
                                                                fontSize: '0.75rem',
                                                                fontWeight: 600,
                                                                backgroundColor: '#FEE2E2',
                                                                color: '#B91C1C'
                                                            }}>
                                                                Success
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '24px' }}>Account Settings</h2>
                            <Card padding="lg">
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                                    Personal Information
                                </h3>

                                {successMsg && (
                                    <div style={{
                                        marginBottom: '24px',
                                        padding: '12px',
                                        backgroundColor: '#FEE2E2',
                                        color: '#B91C1C',
                                        borderRadius: '8px',
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <ShieldCheck size={18} /> {successMsg}
                                    </div>
                                )}

                                <form onSubmit={handleSave}>
                                    {/* Basic Info */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#334155' }}>Full Name</label>
                                            <Input
                                                icon={<User size={18} />}
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#334155' }}>Email Address</label>
                                            <Input
                                                type="email"
                                                icon={<Mail size={18} />}
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                    </div>

                                    {/* Academic Info */}
                                    <div style={{ marginBottom: '24px' }}>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', color: '#64748b' }}>Academic Details</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#334155' }}>Target Exam</label>
                                                <select
                                                    value={targetExam}
                                                    onChange={(e) => setTargetExam(e.target.value)}
                                                    disabled={!isEditing}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 12px',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '8px',
                                                        backgroundColor: isEditing ? 'white' : '#f8fafc',
                                                        fontSize: '1rem'
                                                    }}
                                                >
                                                    <option value="NEET">NEET</option>
                                                    <option value="JEE Main">JEE Main</option>
                                                    <option value="JEE Advanced">JEE Advanced</option>
                                                    <option value="Board Exams">Board Exams</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#334155' }}>Current Class</label>
                                                <select
                                                    value={currentClass}
                                                    onChange={(e) => setCurrentClass(e.target.value)}
                                                    disabled={!isEditing}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 12px',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '8px',
                                                        backgroundColor: isEditing ? 'white' : '#f8fafc',
                                                        fontSize: '1rem'
                                                    }}
                                                >
                                                    <option value="Class 11">Class 11</option>
                                                    <option value="Class 12">Class 12</option>
                                                    <option value="Dropper">Dropper</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location & Personal */}
                                    <div style={{ marginBottom: '32px' }}>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', color: '#64748b' }}>Personal Details</h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#334155' }}>Date of Birth</label>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <select
                                                        value={dobDay}
                                                        onChange={(e) => setDobDay(e.target.value)}
                                                        disabled={!isEditing}
                                                        style={{
                                                            flex: 1,
                                                            padding: '10px',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            backgroundColor: isEditing ? 'white' : '#f8fafc',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        <option value="">Day</option>
                                                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                                    </select>
                                                    <select
                                                        value={dobMonth}
                                                        onChange={(e) => setDobMonth(e.target.value)}
                                                        disabled={!isEditing}
                                                        style={{
                                                            flex: 2,
                                                            padding: '10px',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            backgroundColor: isEditing ? 'white' : '#f8fafc',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        <option value="">Month</option>
                                                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                                    </select>
                                                    <select
                                                        value={dobYear}
                                                        onChange={(e) => setDobYear(e.target.value)}
                                                        disabled={!isEditing}
                                                        style={{
                                                            flex: 1.5,
                                                            padding: '10px',
                                                            border: '1px solid #e2e8f0',
                                                            borderRadius: '8px',
                                                            backgroundColor: isEditing ? 'white' : '#f8fafc',
                                                            fontSize: '0.9rem'
                                                        }}
                                                    >
                                                        <option value="">Year</option>
                                                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#334155' }}>State</label>
                                                <select
                                                    value={state}
                                                    onChange={handleStateChange}
                                                    disabled={!isEditing}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 12px',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '8px',
                                                        backgroundColor: isEditing ? 'white' : '#f8fafc',
                                                        fontSize: '1rem'
                                                    }}
                                                >
                                                    <option value="">Select State</option>
                                                    {INDIAN_STATES.map((s) => (
                                                        <option key={s} value={s}>{s}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#334155' }}>City</label>
                                                <select
                                                    value={city}
                                                    onChange={(e) => setCity(e.target.value)}
                                                    disabled={!isEditing || !state}
                                                    style={{
                                                        width: '100%',
                                                        padding: '10px 12px',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '8px',
                                                        backgroundColor: isEditing && state ? 'white' : '#f8fafc',
                                                        fontSize: '1rem'
                                                    }}
                                                >
                                                    <option value="">Select City</option>
                                                    {state && CITIES_BY_STATE[state]?.map((c) => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))}
                                                    {state && !CITIES_BY_STATE[state] && <option value="Other">Other</option>}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '32px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#334155' }}>Phone Number</label>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <Input
                                                type="tel"
                                                value={phone}
                                                readOnly
                                                disabled
                                                placeholder="Enter your phone number"
                                                style={{ backgroundColor: '#f1f5f9', flex: 1, cursor: 'not-allowed' }}
                                            />
                                            {isEditing && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => setIsChangingPhone(true)}
                                                >
                                                    Change
                                                </Button>
                                            )}
                                        </div>
                                        {isEditing && <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Verified number. Click 'Change' to update.</p>}
                                    </div>

                                    {/* Phone Change Modal/Section */}
                                    {isChangingPhone && (
                                        <div style={{
                                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                                            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '16px', width: '90%', maxWidth: '400px' }}>
                                                <h3 style={{ marginBottom: '16px', fontSize: '1.25rem' }}>Update Phone Number</h3>

                                                {!isOtpSent ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                        <Input
                                                            placeholder="Enter New Mobile Number"
                                                            value={newPhone}
                                                            onChange={(e) => setNewPhone(e.target.value)}
                                                        />
                                                        <Button onClick={() => {
                                                            if (newPhone.length < 10) {
                                                                alert('Please enter a valid 10-digit number');
                                                                return;
                                                            }
                                                            setIsOtpSent(true);
                                                            alert(`OTP SENT to ${newPhone}: 1234`);
                                                        }}>
                                                            Send OTP
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                                        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Enter the OTP sent to {newPhone}</p>
                                                        <Input
                                                            placeholder="Enter 4-digit OTP"
                                                            value={otp}
                                                            onChange={(e) => setOtp(e.target.value)}
                                                        />
                                                        <div style={{ display: 'flex', gap: '12px' }}>
                                                            <Button onClick={() => {
                                                                if (otp === '1234') {
                                                                    setPhone(newPhone);
                                                                    setIsChangingPhone(false);
                                                                    setIsOtpSent(false);
                                                                    setNewPhone('');
                                                                    setOtp('');
                                                                    setSuccessMsg('Phone number updated!');
                                                                } else {
                                                                    alert('Invalid OTP');
                                                                }
                                                            }} style={{ flex: 1 }}>
                                                                Verify & Update
                                                            </Button>
                                                            <Button variant="outline" onClick={() => setIsOtpSent(false)}>Back</Button>
                                                        </div>
                                                    </div>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    style={{ width: '100%', marginTop: '16px' }}
                                                    onClick={() => {
                                                        setIsChangingPhone(false);
                                                        setIsOtpSent(false);
                                                        setNewPhone('');
                                                        setOtp('');
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                        {isEditing ? (
                                            <>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setIsEditing(false);
                                                        setName(user.name);
                                                        setEmail(user.email);
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                                <Button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <Save size={18} /> Save Changes
                                                </Button>
                                            </>
                                        ) : (
                                            <Button type="button" onClick={() => setIsEditing(true)}>
                                                Edit Profile
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </Card>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
);
}

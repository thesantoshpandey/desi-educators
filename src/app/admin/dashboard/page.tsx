'use client';

import React, { useEffect, useState } from 'react';
import { StatCard } from '@/components/admin/StatCard';
import { DollarSign, Users, BookOpen, ShoppingBag, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState({
        revenue: 0,
        activeStudents: 0,
        totalOrders: 0,
        pendingOrders: 0 // Mock, or derive from 'Pending' status if any
    });
    const [recentOrders, setRecentOrders] = useState<any[]>([]);
    const [topCourses, setTopCourses] = useState<{ name: string, count: number, percent: number }[]>([]);

    useEffect(() => {
        const fetchOrders = async () => {
            const { supabase } = await import('@/lib/supabase');

            // Fetch Orders from Supabase
            const { data: dbOrders, error } = await supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching orders:', error);
                return;
            }

            const orders = dbOrders || [];

            // Extract unique user IDs to fetch profile data manually (since no FK exists)
            const userIds = Array.from(new Set(orders.map((o: any) => o.user_id).filter(Boolean)));

            let userMap: Record<string, any> = {};

            if (userIds.length > 0) {
                const { data: profiles, error: profileError } = await supabase
                    .from('profiles')
                    .select('id, name, email')
                    .in('id', userIds);

                if (!profileError && profiles) {
                    profiles.forEach(p => {
                        userMap[p.id] = p;
                    });
                }
            }

            // Calculate Revenue
            const totalRevenue = orders.reduce((acc: number, order: any) => {
                if (order.status === 'Success') {
                    // Handle potential string formats like "₹500" or just "500"
                    const amountStr = order.amount.toString().replace(/[^\d.]/g, '');
                    const amount = parseFloat(amountStr) || 0;
                    return acc + amount;
                }
                return acc;
            }, 0);

            // Calculate Active Students (Unique Users)
            // Note: In a real app we might count 'enrollments', but orders work for sales unique users
            // Using user_id if available, or fallback to user name if old data
            const uniqueStudents = new Set(orders.map((o: any) => o.user_id || o.user)).size;

            // Top Courses
            const courseCounts: { [key: string]: number } = {};
            orders.forEach((o: any) => {
                // Determine course name. Logic might need adjustment if DB field varies
                const planName = o.plan_name || o.plan || 'Unknown';
                courseCounts[planName] = (courseCounts[planName] || 0) + 1;
            });

            const sortedCourses = Object.entries(courseCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([name, count]) => ({
                    name,
                    count,
                    percent: orders.length > 0 ? Math.round((count / orders.length) * 100) : 0
                }));

            setStats({
                revenue: totalRevenue,
                activeStudents: uniqueStudents,
                totalOrders: orders.length,
                pendingOrders: orders.filter((o: any) => o.status === 'Pending').length
            });

            // Attach profile data to orders for display
            const enrichedOrders = orders.map((o: any) => ({
                ...o,
                profile: userMap[o.user_id]
            }));

            setRecentOrders(enrichedOrders.slice(0, 5));
            setTopCourses(sortedCourses);
        };

        fetchOrders();
    }, []);

    return (
        <div>
            <h1 style={{ marginBottom: '24px', fontSize: '1.8rem', fontWeight: 800 }}>Dashboard Overview</h1>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
            }}>
                <StatCard
                    label="Total Revenue"
                    value={`₹${stats.revenue.toLocaleString()}`}
                    trend="Now"
                    trendUp={true}
                    icon={<DollarSign size={24} />}
                    color="#DC2626"
                />
                <StatCard
                    label="Active Students"
                    value={stats.activeStudents.toString()}
                    trend="Unique Buyers"
                    trendUp={true}
                    icon={<Users size={24} />}
                    color="#3b82f6"
                />
                <StatCard
                    label="Total Orders"
                    value={stats.totalOrders.toString()}
                    icon={<ShoppingBag size={24} />}
                    color="#f59e0b"
                />
                <StatCard
                    label="Conversion Rate"
                    value="4.2%"
                    trend="Avg."
                    trendUp={true}
                    icon={<TrendingUp size={24} />}
                    color="#ec4899"
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                {/* Recent Orders Table */}
                <Card title="Recent Orders">
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '0.875rem' }}>Order ID</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '0.875rem' }}>Student</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '0.875rem' }}>Course</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '0.875rem' }}>Amount</th>
                                <th style={{ padding: '12px', color: '#64748b', fontSize: '0.875rem' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No orders yet.</td>
                                </tr>
                            ) : (
                                recentOrders.map((order, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '12px', fontWeight: 500 }}>#{order.id.replace('ORD-', '')}</td>
                                        <td style={{ padding: '12px', color: '#64748b' }}>
                                            {order.profile?.name || order.user || 'Student'}
                                        </td>
                                        <td style={{ padding: '12px', fontSize: '0.9rem' }}>{order.plan_name || order.plan}</td>
                                        <td style={{ padding: '12px', fontWeight: 600 }}>₹{order.amount.toString().replace(/[^\d.]/g, '')}</td>
                                        <td style={{ padding: '12px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                backgroundColor: order.status === 'Success' ? '#FEE2E2' : order.status === 'Pending' ? '#fef3c7' : '#fee2e2',
                                                color: order.status === 'Success' ? '#B91C1C' : order.status === 'Pending' ? '#92400e' : '#991b1b'
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </Card>

                {/* Quick Actions & Top Courses */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <Card title="Top Performing Courses">
                        {topCourses.length === 0 ? (
                            <p style={{ color: '#94a3b8', padding: '16px 0' }}>No sales data yet.</p>
                        ) : (
                            <div style={{ marginTop: '16px' }}>
                                {topCourses.map((course, i) => (
                                    <div key={i} style={{ marginBottom: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{course.name}</span>
                                            <strong style={{ fontSize: '0.9rem' }}>{course.count} Sales</strong>
                                        </div>
                                        <div style={{ width: '100%', background: '#f1f5f9', height: '6px', borderRadius: '4px' }}>
                                            <div style={{
                                                width: `${course.percent}%`,
                                                background: i === 0 ? '#DC2626' : i === 1 ? '#3b82f6' : '#f59e0b',
                                                height: '100%',
                                                borderRadius: '4px'
                                            }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card title="Quick Actions">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                            <Link href="/admin/content">
                                <button style={{
                                    padding: '12px',
                                    backgroundColor: '#DC2626',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    width: '100%'
                                }}>
                                    + Add New Course
                                </button>
                            </Link>
                            <Link href="/admin/monetization">
                                <button
                                    style={{
                                        padding: '12px',
                                        backgroundColor: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        width: '100%'
                                    }}
                                >
                                    Manage Coupons
                                </button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

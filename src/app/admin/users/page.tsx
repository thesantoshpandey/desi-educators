'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from '@/components/ui';
import { Search, Shield, Ban, CheckCircle, MoreHorizontal } from 'lucide-react';
import { UserFormModal } from '@/components/admin/UserFormModal';
import { supabase } from '@/lib/supabase';

interface User {
    name: string;
    email: string;
    role: 'student' | 'admin';
    status?: 'active' | 'blocked';
    joinedAt?: string;
}

// Mock Data Removed

export default function UsersManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [userPlans, setUserPlans] = useState<Record<string, string[]>>({});
    const [isLoading, setIsLoading] = useState(false);

    const fetchUsers = async () => {
        // 1. Fetch Profiles from Supabase
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
            return;
        }

        // 2. Map to UI User format
        let dbUsers: User[] = (profiles || []).map(p => ({
            name: p.name || 'Unknown',
            email: p.email,
            role: p.role || 'student',
            status: 'active', // Default to active
            joinedAt: p.created_at ? new Date(p.created_at).toLocaleDateString() : 'N/A'
        }));

        setUsers(dbUsers);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleUserStatus = (email: string) => {
        // TODO: Implement API for blocking users
        alert('Blocking users is not yet connected to the backend API.');
    };

    const handleAddUser = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleSaveUser = async (data: any) => {
        setIsLoading(true);
        if (editingUser) {
            // Update Logic (TODO: Implement PUT API)
            alert('Editing users is not yet implemented in the backend API.');
            setIsLoading(false);
        } else {
            // Create New User via API
            try {
                const response = await fetch('/api/admin/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...data,
                        role: 'student' // Force role for now or allow selection if modal supports it
                    }),
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.error || 'Failed to create user');
                }

                alert('User created successfully!');
                setIsModalOpen(false);
                fetchUsers(); // Refresh list
            } catch (error: any) {
                console.error('Error creating user:', error);
                alert(`Error: ${error.message}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Users</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage student access and roles.</p>
                </div>
                <Button onClick={handleAddUser}>+ Add User</Button>
            </div>

            <UserFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSaveUser}
                initialData={editingUser}
            />

            <Card padding="md">
                <div style={{ marginBottom: '24px', maxWidth: '400px' }}>
                    <Input
                        placeholder="Search users..."
                        icon={<Search size={18} />}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '12px', color: '#64748b' }}>User</th>
                            <th style={{ padding: '12px', color: '#64748b' }}>Role</th>
                            <th style={{ padding: '12px', color: '#64748b' }}>Status</th>
                            <th style={{ padding: '12px', color: '#64748b' }}>Plans</th>
                            <th style={{ padding: '12px', color: '#64748b' }}>Joined</th>
                            <th style={{ padding: '12px', color: '#64748b', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '16px 12px' }}>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{user.name}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{user.email}</div>
                                    </div>
                                </td>
                                <td style={{ padding: '16px 12px' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        backgroundColor: user.role === 'admin' ? '#e0e7ff' : '#f1f5f9',
                                        color: user.role === 'admin' ? '#4338ca' : '#64748b'
                                    }}>
                                        {(user.role || 'STUDENT').toUpperCase()}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 12px' }}>
                                    {user.status === 'active' ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#B91C1C', fontSize: '0.9rem' }}>
                                            <CheckCircle size={14} /> Active
                                        </span>
                                    ) : (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#991b1b', fontSize: '0.9rem' }}>
                                            <Ban size={14} /> Blocked
                                        </span>
                                    )}
                                </td>
                                <td style={{ padding: '16px 12px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {userPlans[user.email] && userPlans[user.email].map((plan, idx) => (
                                            <span key={idx} style={{
                                                fontSize: '0.75rem',
                                                backgroundColor: plan === 'None' ? '#f1f5f9' : '#fff7ed',
                                                color: plan === 'None' ? '#64748b' : '#c2410c',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                display: 'inline-block',
                                                width: 'fit-content'
                                            }}>
                                                {plan}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td style={{ padding: '16px 12px', color: '#64748b' }}>{user.joinedAt}</td>
                                <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                                    {user.role !== 'admin' && (
                                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEditUser(user)}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => toggleUserStatus(user.email)}
                                            >
                                                {user.status === 'active' ? 'Block' : 'Unblock'}
                                            </Button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );
}

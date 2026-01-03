'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, User, Mail, Lock } from 'lucide-react';
import { Button, Input } from '@/components/ui';

interface UserData {
    name: string;
    email: string;
    role: 'student' | 'admin';
    password?: string;
}

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UserData) => void;
    initialData?: UserData | null;
}

export const UserFormModal = ({ isOpen, onClose, onSubmit, initialData }: UserFormModalProps) => {
    const [formData, setFormData] = useState<UserData>({
        name: '',
        email: '',
        role: 'student',
        password: ''
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({ ...initialData, password: '' }); // Don't show password for edit
            } else {
                setFormData({ name: '', email: '', role: 'student', password: '' });
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    const modalContent = (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '32px',
                width: '100%',
                maxWidth: '480px',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#64748b'
                    }}
                >
                    <X size={24} />
                </button>

                <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>
                    {initialData ? 'Edit User' : 'Add New User'}
                </h2>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>
                    {initialData ? 'Update user details' : 'Create a new student account'}
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
                        <Input
                            icon={<User size={18} />}
                            placeholder="John Doe"
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
                        <Input
                            type="email"
                            icon={<Mail size={18} />}
                            placeholder="john@example.com"
                            value={formData.email || ''}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            disabled={!!initialData} // Email is immutable for ID purposes locally
                        />
                    </div>

                    {!initialData && (
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
                            <Input
                                type="password"
                                icon={<Lock size={18} />}
                                placeholder="Min. 6 characters"
                                value={formData.password || ''}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    <div style={{ paddingTop: '8px' }}>
                        <Button className="w-full" style={{ width: '100%' }} type="submit">
                            {initialData ? 'Update User' : 'Create User'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Internal User Interface (compatible with existing UI)
export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'student' | 'admin';
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error: string | null }>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to get/set device ID
const getDeviceId = () => {
    if (typeof window === 'undefined') return null;
    let id = localStorage.getItem('device_session_id');
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem('device_session_id', id);
    }
    return id;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Session Check Function
    const checkSessionValidity = async (userId: string) => {
        const deviceId = getDeviceId();
        if (!deviceId) return; // Should not happen in client

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('current_session_id')
            .eq('id', userId)
            .single();

        if (!error && profile) {
            // If DB has a session ID and it doesn't match ours, logout
            if (profile.current_session_id && profile.current_session_id !== deviceId) {
                console.warn('Session mismatch. Logged in on another device.');
                await supabase.auth.signOut();
                setUser(null);
                localStorage.removeItem('device_session_id'); // Clear invalid ID
                alert('You have been logged out because your account was used on another device.');
                router.push('/login');
            } else if (!profile.current_session_id) {
                // If DB is empty (legacy or cleared), claim it
                await supabase
                    .from('profiles')
                    .update({ current_session_id: deviceId })
                    .eq('id', userId);
            }
        }
    };

    useEffect(() => {
        // Initialize Session
        const getSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (session?.user) {
                    await fetchUserWithRole(session.user);

                    // Initial Device Check on Load
                    const deviceId = getDeviceId();
                    if (deviceId) {
                        // We do a check. If it's a resume, we want to verify we are still valid.
                        // However, if we are valid (or DB is null), we ensure DB matches us.
                        // But we must NOT overwrite if DB has someone else.
                        await checkSessionValidity(session.user.id);
                    }
                }
            } catch (error: any) {
                const errMsg = error?.message?.toLowerCase() || '';
                if (errMsg.includes('invalid refresh token') || errMsg.includes('refresh token not found')) {
                    console.warn("Session expired (Invalid Refresh Token), signing out...");
                    await supabase.auth.signOut();
                    setUser(null);
                } else {
                    console.error("Auth Init Error:", error);
                }
            } finally {
                setIsLoading(false);
            }
        };

        getSession();

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth Event:", event);

            if (event === 'PASSWORD_RECOVERY') {
                // FORCE Claim Session for Password Reset
                if (session?.user) {
                    const newDeviceId = crypto.randomUUID();
                    localStorage.setItem('device_session_id', newDeviceId);

                    await supabase
                        .from('profiles')
                        .update({ current_session_id: newDeviceId })
                        .eq('id', session.user.id);

                    // Allow time for DB update to propagate
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }

            if (session?.user) {
                await fetchUserWithRole(session.user);
            } else {
                setUser(null);
            }
            if (event === 'SIGNED_OUT') {
                setUser(null);
                router.refresh();
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [router]);

    // Polling Effect
    useEffect(() => {
        if (!user) return;

        const interval = setInterval(() => {
            checkSessionValidity(user.id);
        }, 10000); // Check every 10 seconds

        return () => clearInterval(interval);
    }, [user]);

    const fetchUserWithRole = async (sbUser: SupabaseUser) => {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', sbUser.id)
                .single();

            setUser({
                id: sbUser.id,
                email: sbUser.email || '',
                name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'User',
                phone: sbUser.phone || sbUser.user_metadata?.phone || '',
                role: (profile?.role as 'admin' | 'student') || 'student'
            });
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // Fallback if profile fetch fails
            setUser({
                id: sbUser.id,
                email: sbUser.email || '',
                name: sbUser.user_metadata?.name || 'User',
                role: 'student'
            });
        }
    };

    const login = async (email: string, password: string) => {
        const { error, data } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;

        // On Login: Generate NEW Device ID and Claim Session
        if (data.user) {
            const newDeviceId = crypto.randomUUID();
            localStorage.setItem('device_session_id', newDeviceId);

            await supabase
                .from('profiles')
                .update({ current_session_id: newDeviceId })
                .eq('id', data.user.id);
        }
    };

    const signup = async (name: string, email: string, password: string, phone?: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name, phone }
            }
        });
        if (error) {
            console.error("Signup error:", error);
            return { success: false, error: error.message };
        }
        if (data.user) {
            // New User: Generate ID
            const newDeviceId = crypto.randomUUID();
            localStorage.setItem('device_session_id', newDeviceId);

            // Create Profile in Public Table with Session ID
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        name: name,
                        email: email,
                        phone: phone,
                        role: 'student', // Default role
                        created_at: new Date().toISOString(),
                        current_session_id: newDeviceId
                    }
                ]);

            if (profileError) {
                console.error("Error creating profile:", profileError);
            }
        }
        return { success: true, error: null };
    };

    const logout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('device_session_id'); // Clear ID
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

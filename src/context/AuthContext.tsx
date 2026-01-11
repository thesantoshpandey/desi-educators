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
    signup: (name: string, email: string, password: string, phone?: string) => Promise<boolean>;
    logout: () => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Initialize Session
        const getSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (session?.user) {
                    await fetchUserWithRole(session.user);
                }
            } catch (error: any) {
                // ... error handling ...
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
            console.log("Auth State Change:", event);
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
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        if (error) throw error;
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
            return false;
        }
        if (data.user) {
            // Create Profile in Public Table
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        name: name,
                        email: email,
                        phone: phone,
                        role: 'student', // Default role
                        created_at: new Date().toISOString()
                    }
                ]);

            if (profileError) {
                console.error("Error creating profile:", profileError);
            }
        }
        return true;
    };

    const logout = async () => {
        await supabase.auth.signOut();
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

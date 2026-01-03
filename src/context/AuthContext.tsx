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

                if (error) {
                    throw error;
                }

                if (session?.user) {
                    setUser(mapSupabaseUser(session.user));
                }
            } catch (error: any) {
                if (error?.message?.includes('Invalid Refresh Token') || error?.message?.includes('Refresh Token Not Found')) {
                    // Suppress the error logging for this expected case
                    console.warn("Session expired (Invalid Refresh Token), signing out...");

                    // Clear Supabase local storage keys manually to prevent loops
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1].split('.')[0]}-auth-token`);
                        // Also try generic clean up just in case
                        Object.keys(localStorage).forEach(key => {
                            if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
                                localStorage.removeItem(key);
                            }
                        });
                    }

                    await supabase.auth.signOut();
                    setUser(null);
                } else {
                    // Log actual unexpected errors
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
                setUser(mapSupabaseUser(session.user));
            } else {
                setUser(null);
            }

            // Handle specific events
            if (event === 'SIGNED_OUT') {
                setUser(null);
                router.refresh();
            }

            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [router]);

    const mapSupabaseUser = (sbUser: SupabaseUser): User => {
        return {
            id: sbUser.id,
            email: sbUser.email || '',
            // Use metadata name or fallback to email prefix
            name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'User',
            phone: sbUser.phone || sbUser.user_metadata?.phone || '',
            // Simple role logic: If email matches admin, they are admin. 
            // In real app, check 'profiles' table or app_metadata.
            role: sbUser.email === 'vishal.pandey1912@gmail.com' ? 'admin' : 'student'
        };
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
                // Optional: We could delete the auth user if profile fails, but let's keep it simple
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

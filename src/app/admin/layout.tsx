'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import styles from './AdminLayout.module.css';
import { Menu } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);


    // Protect Admin Routes with Supabase
    React.useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { user }, error } = await supabase.auth.getUser();

                if (error || !user) {
                    if (pathname !== '/admin/login') {
                        router.push('/admin/login');
                    } else {
                        setIsLoading(false);
                    }
                    return;
                }

                // Check Admin Email
                const isAdmin = user.email?.toLowerCase() === 'vishal.pandey1912@gmail.com'.toLowerCase();

                if (isAdmin) {
                    setIsAuthenticated(true);
                    if (pathname === '/admin/login') {
                        router.push('/admin/content');
                    }
                } else {
                    // Not admin
                    router.push('/dashboard');
                }
            } catch (err) {
                console.error('Admin Auth Error:', err);
                if (pathname !== '/admin/login') router.push('/admin/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [pathname, router]);

    // If on login page, render full screen without sidebar
    if (pathname === '/admin/login') {
        // If we are authenticated, we are likely redirecting, but render children briefly
        return <>{children}</>;
    }

    if (isLoading) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading Admin...</div>;

    if (!isAuthenticated) return null;

    return (
        <div className={styles.container}>
            <div className={styles.sidebarWrapper}>
                <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            </div>
            <main className={styles.main}>
                <button
                    className={styles.mobileToggle}
                    onClick={() => setIsSidebarOpen(true)}
                    style={{
                        marginBottom: '16px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        // display: 'flex' handled by CSS class .mobileToggle
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 600,
                        color: '#64748b'
                    }}
                >
                    <Menu size={24} /> Menu
                </button>
                {children}
            </main>
        </div>
    );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, BookOpen, GraduationCap, LayoutDashboard, UserCircle, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui';
import styles from './Navbar.module.css';
import { useAuth } from '@/context/AuthContext';
import { usePathname } from 'next/navigation';

import { useCart } from '@/context/CartContext';
import { CartDrawer } from '@/components/layout/CartDrawer';

export const Navbar = () => {
    const { user, logout } = useAuth();
    const { cartCount, setIsCartOpen } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

    const navLinks = [
        { name: 'Home', href: '/' },
        { name: 'NEET Exam', href: '/neet', icon: <BookOpen size={18} /> },
        { name: 'Pricing', href: '/pricing', icon: <CreditCard size={18} /> },
        { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
    ];

    return (
        <>
            <nav className={styles.navbar}>
                <div className={styles.container}>
                    {/* Logo */}
                    <Link href="/" className={styles.logo}>
                        <GraduationCap size={28} className={styles.logoIcon} />
                        <span>Desi Educators</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className={styles.desktopNav}>
                        {navLinks.map((link) => (
                            <Link key={link.name} href={link.href} className={styles.navLink}>
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Actions */}
                    <div className={styles.desktopActions}>
                        {/* Cart Icon */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            style={{
                                position: 'relative',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                marginRight: '8px',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <UserCircle size={0} style={{ display: 'none' }} /> {/* Hack to keep import valid if unused or remove */}
                            <div style={{ position: 'relative' }}>
                                <CreditCard size={0} style={{ display: 'none' }} />
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
                                {cartCount > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-8px',
                                        right: '-8px',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        fontSize: '0.7rem',
                                        fontWeight: 700,
                                        width: '18px',
                                        height: '18px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {cartCount}
                                    </span>
                                )}
                            </div>
                        </button>

                        {user ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                                    <UserCircle size={24} />
                                    <Link href="/profile" style={{ fontWeight: 500, textDecoration: 'none' }} className={styles.profileLink}>
                                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                                            <span style={{ fontWeight: 600 }}>{user.name}</span>
                                            <span style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'capitalize' }}>{user.role}</span>
                                        </div>
                                    </Link>
                                </div>
                                {/* Admin Link */}
                                {user.role === 'admin' && (
                                    <Link href="/admin/dashboard">
                                        <Button size="sm" variant="outline">Admin Panel</Button>
                                    </Link>
                                )}
                                <Button variant="ghost" size="sm" onClick={logout}>Log Out</Button>
                            </div>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" size="sm">Log In</Button>
                                </Link>
                                <Link href="/signup">
                                    <Button size="sm">Start Prep Free</Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button className={styles.menuToggle} onClick={toggleMenu} aria-label="Toggle menu">
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
                    <div className={styles.mobileLinks}>
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={styles.mobileLink}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {link.icon && <span className={styles.linkIcon}>{link.icon}</span>}
                                {link.name}
                            </Link>
                        ))}
                        <div className={styles.mobileActions}>
                            <button
                                onClick={() => { setIsCartOpen(true); setIsMenuOpen(false); }}
                                className={styles.mobileLink}
                                style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', color: 'var(--text-primary)' }}
                            >
                                <span className={styles.linkIcon}><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg></span>
                                Cart ({cartCount})
                            </button>

                            {user ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px 0' }}>
                                    <Link href="/profile" onClick={() => setIsMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                                        <UserCircle size={20} />
                                        <span>{user.name}</span>
                                    </Link>

                                    {user.role === 'admin' && (
                                        <Link href="/admin/dashboard" onClick={() => setIsMenuOpen(false)}>
                                            <Button size="sm" variant="outline" className={styles.fullWidth}>
                                                Admin Panel
                                            </Button>
                                        </Link>
                                    )}

                                    <Button size="sm" onClick={() => { logout(); setIsMenuOpen(false); }}>
                                        Log Out
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                                        <Button variant="outline" className={styles.fullWidth}>Log In</Button>
                                    </Link>
                                    <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                                        <Button className={styles.fullWidth}>Start Prep Free</Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
            <CartDrawer />
        </>
    );
};

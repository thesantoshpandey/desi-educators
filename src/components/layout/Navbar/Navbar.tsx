'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import styles from './Navbar.module.css';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { CartDrawer } from '@/components/layout/CartDrawer';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount, setIsCartOpen } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { name: 'Subjects', href: '/neet' },
    { name: 'Episodes', href: '/episodes' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Dashboard', href: '/dashboard' },
  ];

  return (
    <>
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.container}>
          <Link href="/" className={styles.logo}>
            <Image
              src="/logo.png"
              alt="Desi Educators"
              width={100}
              height={60}
              style={{ width: 'auto', height: '32px' }}
              priority
            />
            <span className={styles.logoText}>Desi Educators</span>
          </Link>

          <div className={styles.desktopNav}>
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href} className={styles.navLink}>
                {link.name}
              </Link>
            ))}
          </div>

          <div className={styles.desktopActions}>
            <button
              onClick={() => setIsCartOpen(true)}
              className={styles.cartBtn}
              aria-label="Cart"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></svg>
              {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
            </button>

            {user ? (
              <div className={styles.userGroup}>
                <Link href="/profile" className={styles.userLink}>
                  <UserCircle size={20} />
                  <span>{user.name}</span>
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin/dashboard">
                    <Button size="sm" variant="outline">Admin</Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={logout}>Log Out</Button>
              </div>
            ) : (
              <div className={styles.authGroup}>
                <Link href="/login" className={styles.loginLink}>Log In</Link>
                <Link href="/signup">
                  <Button size="sm">Start Free</Button>
                </Link>
              </div>
            )}
          </div>

          <button className={styles.menuToggle} onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Menu">
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className={styles.mobileMenu}>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={styles.mobileLink}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className={styles.mobileActions}>
              {user ? (
                <>
                  <Link href="/profile" onClick={() => setIsMenuOpen(false)} className={styles.mobileLink}>
                    Profile
                  </Link>
                  {user.role === 'admin' && (
                    <Link href="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className={styles.mobileLink}>
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={() => { logout(); setIsMenuOpen(false); }} className={styles.mobileLink}>
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMenuOpen(false)} className={styles.mobileLink}>
                    Log In
                  </Link>
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    <Button className={styles.fullWidth}>Start Free</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
      <CartDrawer />
    </>
  );
};

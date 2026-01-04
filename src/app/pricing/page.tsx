'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, PaymentModal } from '@/components/ui';
import { Check, Star, Zap, BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useProduct } from '@/context/ProductContext';

export default function PricingPage() {
    const { user } = useAuth();
    const { addToCart } = useCart();
    const { products } = useProduct();
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [purchasedPlans, setPurchasedPlans] = useState<string[]>([]);

    // Filter products to display on Pricing Page
    // Show Bundles, Test Series, and promoted Subjects
    const displayPlans = useMemo(() => {
        const filtered = products.filter(p => p.isActive && ['bundle', 'test_series', 'subject'].includes(p.type));
        // Sort: Recommended first
        return filtered.sort((a, b) => (b.isRecommended ? 1 : 0) - (a.isRecommended ? 1 : 0));
    }, [products]);

    useEffect(() => {
        const loadPurchased = async () => {
            if (user) {
                const purchased: string[] = [];

                // 1. Check Local Storage (Fast)
                displayPlans.forEach(plan => {
                    const key = `access_${plan.targetIds[0]}_${user.email}`;
                    if (localStorage.getItem(key)) purchased.push(plan.id);
                });

                // 2. Check Database (Source of Truth)
                const { supabase } = await import('@/lib/supabase');
                const { data } = await supabase.from('enrollments').select('target_id').eq('user_id', user.id);
                const dbTargets = data?.map(e => e.target_id) || [];

                displayPlans.forEach(plan => {
                    // Check if *all* targets of this plan are present in DB enrollments
                    // e.g. Bundle has [physics, chem]. If DB has both, we own the bundle.
                    const ownsAll = plan.targetIds.every(tid => dbTargets.includes(tid));
                    if (ownsAll && !purchased.includes(plan.id)) {
                        purchased.push(plan.id);
                        // Backfill local storage
                        plan.targetIds.forEach(tid => localStorage.setItem(`access_${tid}_${user.email}`, 'true'));
                    }
                });

                setPurchasedPlans(purchased);
            }
        };
        loadPurchased();
    }, [isModalOpen, user, displayPlans]);

    const handleAddToCart = (plan: any) => {
        addToCart({
            id: plan.id,
            name: plan.name,
            price: plan.price,
            type: plan.type,
            targetIds: plan.targetIds
        });
    };

    const handlePaymentSuccess = async () => {
        if (!selectedPlan || !user) return;

        // 1. DB: Grant Access (Already handled by /api/payment/verify)
        // We skip client-side DB insert to avoid duplicates & security issues

        // 2. Local: Grant Access
        if (selectedPlan.targetIds && Array.isArray(selectedPlan.targetIds)) {
            selectedPlan.targetIds.forEach((target: string) => {
                localStorage.setItem(`access_${target}_${user.email}`, 'true');
            });
        }

        const newOrder = {
            id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
            user: user.name,
            plan: selectedPlan.name,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            amount: `₹${selectedPlan.price.toLocaleString()}`,
            status: 'Success'
        };

        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        localStorage.setItem('orders', JSON.stringify([newOrder, ...existingOrders]));

        const newPurchased = [...purchasedPlans];
        if (!newPurchased.includes(selectedPlan.id)) newPurchased.push(selectedPlan.id);
        setPurchasedPlans(newPurchased);

        setIsModalOpen(false);
    };

    return (
        <div style={{ padding: '60px 20px', backgroundColor: '#f9fafb', minHeight: 'calc(100vh - 64px)' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', color: '#1f2937' }}>
                        Invest in Your Future
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>
                        Choose the perfect plan to crack NEET with ease.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
                    {displayPlans.map((plan) => {
                        // Check if Plan ID is in purchased list OR if user has access to ALL of its targets
                        // If a plan sells 'physics', and I have 'access_physics_...', I own it.
                        // However, be careful: A Bundle sells 'physics' + 'chem'. If I own 'physics', I don't own the bundle.
                        // So for a generic plan: I own it if I have access to ALL its targets.
                        // But for a single subject plan: I own it if I have access to that subject.

                        const hasAccessToTargets = user && plan.targetIds.every((t: string) => localStorage.getItem(`access_${t}_${user.email}`));
                        const isPurchased = purchasedPlans.includes(plan.id) || !!hasAccessToTargets;

                        return (
                            <Card
                                key={plan.id}
                                style={{
                                    position: 'relative',
                                    border: isPurchased ? '1px solid #1f2937' : plan.isRecommended ? '2px solid #DC2626' : '1px solid #e5e7eb',
                                    transform: plan.isRecommended ? 'scale(1.02)' : 'none', // Reduced scale for mobile safety
                                    zIndex: plan.isRecommended ? 10 : 1,
                                    backgroundColor: isPurchased ? '#f9fafb' : 'white'
                                }}
                                padding="lg"
                            >
                                {plan.isRecommended && !isPurchased && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '-12px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        backgroundColor: '#DC2626',
                                        color: 'white',
                                        padding: '4px 16px',
                                        borderRadius: '12px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                    }}>
                                        Recommended
                                    </div>
                                )}

                                {isPurchased && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '16px',
                                        right: '16px',
                                        backgroundColor: '#000000',
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}>
                                        <Check size={12} /> Purchased
                                    </div>
                                )}

                                <div style={{ marginBottom: '24px' }}>
                                    <div style={{
                                        width: '48px',
                                        height: '48px',
                                        borderRadius: '12px',
                                        backgroundColor: `${plan.color || '#DC2626'}15`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: '16px'
                                    }}>
                                        {/* Dynamic Icon based on type - simplified */}
                                        {plan.type === 'bundle' || plan.name.includes('Full') ? <Zap size={24} color={plan.color || '#DC2626'} /> :
                                            plan.type === 'test_series' ? <Star size={24} color={plan.color || '#FFC107'} /> :
                                                <BookOpen size={24} color={plan.color || '#FF5722'} />}
                                    </div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>{plan.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                                        <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1f2937' }}>₹{plan.price.toLocaleString()}</span>
                                        <span style={{ color: '#6b7280' }}>/ one-time</span>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {plan.features.map((feature: string, i: number) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4b5563' }}>
                                            <div style={{
                                                minWidth: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                backgroundColor: '#FEE2E2',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <Check size={12} color="#DC2626" />
                                            </div>
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                    <Button
                                        onClick={() => handleAddToCart(plan)}
                                        variant="outline"
                                        disabled={isPurchased}
                                        style={{ width: '100%', height: '48px', opacity: isPurchased ? 0.5 : 1 }}
                                    >
                                        Add to Cart
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            if (!user) {
                                                window.location.href = `/login?next=${window.location.pathname}`;
                                                return;
                                            }
                                            setSelectedPlan(plan);
                                            setIsModalOpen(true);
                                        }}
                                        disabled={isPurchased}
                                        style={{
                                            width: '100%',
                                            backgroundColor: isPurchased ? '#1f2937' : plan.isRecommended ? '#DC2626' : '#1f2937',
                                            height: '48px',
                                            fontSize: '1rem',
                                            opacity: isPurchased ? 0.8 : 1,
                                            cursor: isPurchased ? 'default' : 'pointer'
                                        }}
                                    >
                                        {isPurchased ? 'Owned' : 'Buy Now'}
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {selectedPlan && (
                <PaymentModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    amount={selectedPlan.price}
                    planName={selectedPlan.name}
                    onSuccess={handlePaymentSuccess}
                />
            )}
        </div>
    );
}

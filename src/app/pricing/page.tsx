'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, PaymentModal } from '@/components/ui';
import { Check, Star, Zap, BookOpen } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useProduct } from '@/context/ProductContext';
import styles from './Pricing.module.css';

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
                // Check Database (Source of Truth)
                const { supabase } = await import('@/lib/supabase');
                const { data } = await supabase.from('enrollments').select('target_id').eq('user_id', user.id);
                const dbTargets = data?.map(e => e.target_id) || [];

                const purchased: string[] = [];
                displayPlans.forEach(plan => {
                    // Check if *all* targets of this plan are present in DB enrollments
                    const ownsAll = plan.targetIds.every(tid => dbTargets.includes(tid));
                    if (ownsAll) {
                        purchased.push(plan.id);
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

        // 1. Access is granted by the server webhook (/api/payment/verify)
        // 2. We just update the local UI state to reflect the purchase immediately

        const newPurchased = [...purchasedPlans];
        if (!newPurchased.includes(selectedPlan.id)) newPurchased.push(selectedPlan.id);
        setPurchasedPlans(newPurchased);

        setIsModalOpen(false);
    };

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        Invest in Your Future
                    </h1>
                    <p className={styles.subtitle}>
                        Choose the perfect plan to crack NEET with ease. Transparent pricing, no hidden fees.
                    </p>
                </div>

                <div className={styles.grid}>
                    {displayPlans.map((plan) => {
                        const isPurchased = purchasedPlans.includes(plan.id);

                        // Determine icon
                        let PlanIcon = BookOpen;
                        if (plan.type === 'test_series') PlanIcon = Star;

                        // Check if it's a bundle to show custom logo
                        const isBundle = plan.type === 'bundle' || plan.name.toLowerCase().includes('full');

                        return (
                            <div
                                key={plan.id}
                                className={`${styles.card} ${plan.isRecommended ? styles.recommended : ''} ${isPurchased ? styles.owned : ''}`}
                            >
                                {plan.isRecommended && !isPurchased && (
                                    <div className={styles.bestValue}>
                                        BEST VALUE
                                    </div>
                                )}

                                {isPurchased && (
                                    <div className={styles.purchasedBadge}>
                                        <Check size={12} /> Owned
                                    </div>
                                )}

                                <div className={styles.iconWrapper} style={{
                                    backgroundColor: isBundle ? 'transparent' : `${plan.color}10`,
                                    color: plan.color || '#0f172a',
                                    overflow: 'hidden'
                                }}>
                                    {isBundle ? (
                                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                                            <Image
                                                src="/logo-v4.png"
                                                alt="Desi Educators"
                                                fill
                                                style={{ objectFit: 'contain' }}
                                            />
                                        </div>
                                    ) : (
                                        <PlanIcon size={32} />
                                    )}
                                </div>

                                <h3 className={styles.planName}>{plan.name}</h3>
                                <p className={styles.planDescription}>
                                    {plan.description || "Complete access to all materials and tests."}
                                </p>

                                <div className={styles.pricing}>
                                    {plan.originalPrice && plan.originalPrice > plan.price && (
                                        <div className={styles.originalPriceWrapper}>
                                            <span className={styles.originalPrice}>₹{plan.originalPrice.toLocaleString()}</span>
                                            <span className={styles.saveBadge}>
                                                SAVE {Math.round(((plan.originalPrice - plan.price) / plan.originalPrice) * 100)}%
                                            </span>
                                        </div>
                                    )}
                                    <div className={styles.currentPriceWrapper}>
                                        <span className={styles.currency}>₹</span>
                                        <span className={styles.amount}>{plan.price.toLocaleString()}</span>
                                        <span className={styles.period}>/ one-time</span>
                                    </div>
                                </div>

                                <div className={styles.divider}></div>

                                <div className={styles.featuresList}>
                                    {plan.features.map((feature: string, i: number) => (
                                        <div key={i} className={styles.featureItem}>
                                            <div className={styles.checkIcon}>
                                                <Check size={18} />
                                            </div>
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.actions}>
                                    <button
                                        onClick={() => handleAddToCart(plan)}
                                        disabled={isPurchased}
                                        className={styles.addToCartBtn}
                                    >
                                        Add to Cart
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!user) {
                                                window.location.href = `/login?next=${window.location.pathname}`;
                                                return;
                                            }
                                            setSelectedPlan(plan);
                                            setIsModalOpen(true);
                                        }}
                                        disabled={isPurchased}
                                        className={`${styles.buyNowBtn} ${plan.isRecommended ? styles.recommended : ''}`}
                                    >
                                        {isPurchased ? 'Owned' : 'Buy Now'}
                                    </button>
                                </div>
                            </div>
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
                    items={[{
                        id: selectedPlan.id,
                        name: selectedPlan.name,
                        price: selectedPlan.price,
                        type: selectedPlan.type,
                        targetIds: selectedPlan.targetIds
                    }]}
                />
            )}
        </div>
    );
}

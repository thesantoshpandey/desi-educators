'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { X, Trash2, ShoppingCart, Lock } from 'lucide-react';
import { Button } from '@/components/ui';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export const CartDrawer = () => {
    const { isCartOpen, setIsCartOpen, items, removeFromCart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();

    const [isCheckout, setIsCheckout] = React.useState(false);
    const [couponCode, setCouponCode] = React.useState('');
    const [discount, setDiscount] = React.useState(0);

    // Reset discount when cart changes or closes
    React.useEffect(() => {
        if (!isCartOpen) {
            setDiscount(0);
            setCouponCode('');
        }
    }, [isCartOpen]);

    // Recalculate discount if cart total drops below discount (edge case) or just visually
    // Ideally validation happens on apply.

    const [isValidatingCoupon, setIsValidatingCoupon] = React.useState(false);

    const applyCoupon = async () => {
        const codeToApply = couponCode.trim().toUpperCase();

        if (!codeToApply) return;
        setIsValidatingCoupon(true);

        try {
            const { data: coupon, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', codeToApply)
                .eq('active', true)
                .single();

            if (error) {
                // If no rows found, .single() returns an error code PGRST116
                if (error.code !== 'PGRST116') {
                    console.error('Supabase error:', error);
                    throw error;
                }
            }

            if (coupon) {
                let disc = 0;
                if (coupon.type === 'percent') {
                    disc = Math.floor((cartTotal * coupon.discount) / 100);
                } else {
                    disc = coupon.discount;
                }
                // Cap discount at total
                const finalDiscount = Math.min(disc, cartTotal);
                setDiscount(finalDiscount);
            } else {
                alert('Invalid or expired coupon code');
                setDiscount(0);
            }
        } catch (err) {
            console.error('Error applying coupon:', err);
            alert('Failed to apply coupon. Please try again.');
        } finally {
            setIsValidatingCoupon(false);
        }
    };

    const handleCheckout = async () => {
        if (!user) {
            router.push('/login');
            setIsCartOpen(false);
            return;
        }

        const finalAmount = Math.max(0, cartTotal - discount);
        const confirm = window.confirm(`Proceed to pay ₹${finalAmount}?`);

        if (confirm) {
            try {
                // 1. Create Order
                const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
                // In real app, we iterate if multiple plans? Usually one transaction per cart or summed up.
                // For simplicity, we create specific orders per item or one bulk order?
                // The current schema asks for 'plan_name'. Let's join them if multiple.
                const planNames = items.map(i => i.name).join(', ');

                const { error: orderError } = await supabase.from('orders').insert({
                    id: orderId,
                    user_id: user.id,
                    plan_name: planNames,
                    amount: finalAmount,
                    status: 'Success'
                });

                if (orderError) throw orderError;

                // 2. Grant Access (Enrollments)
                const enrollmentsToInsert: any[] = [];
                items.forEach(item => {
                    const nameLower = item.name.toLowerCase();
                    const type = item.type;

                    if (item.targetIds && Array.isArray(item.targetIds)) {
                        item.targetIds.forEach(target => {
                            enrollmentsToInsert.push({ user_id: user.id, target_id: target });
                        });
                    } else {
                        // Legacy logic mapped to targets
                        if (type === 'bundle' || nameLower.includes('full')) {
                            enrollmentsToInsert.push({ user_id: user.id, target_id: 'full_bundle' });
                            // Optionally expand bundle? No, keep it simple, check for bundle existence in access logic.
                            // Actually, let's expand for granular access if needed, but 'full_bundle' key is easier.
                            // Let's Add physics/chem/bio too just in case we deprecate bundle key.
                            enrollmentsToInsert.push({ user_id: user.id, target_id: 'physics' });
                            enrollmentsToInsert.push({ user_id: user.id, target_id: 'chemistry' });
                            enrollmentsToInsert.push({ user_id: user.id, target_id: 'biology' });
                        }
                        if (nameLower.includes('physics')) enrollmentsToInsert.push({ user_id: user.id, target_id: 'physics' });
                        if (nameLower.includes('chemistry')) enrollmentsToInsert.push({ user_id: user.id, target_id: 'chemistry' });
                        if (nameLower.includes('biology')) enrollmentsToInsert.push({ user_id: user.id, target_id: 'biology' });
                        if (type === 'test-series' || nameLower.includes('test series')) {
                            enrollmentsToInsert.push({ user_id: user.id, target_id: 'test_series' });
                        }
                    }
                });

                // Deduplicate targets before insert
                const uniqueEnrollments = Array.from(new Set(enrollmentsToInsert.map(e => e.target_id)))
                    .map(targetId => ({ user_id: user.id, target_id: targetId }));

                if (uniqueEnrollments.length > 0) {
                    const { error: enrollError } = await supabase.from('enrollments').upsert(uniqueEnrollments, { onConflict: 'user_id, target_id' });
                    if (enrollError) throw enrollError;
                }

                alert('Payment Successful! Access Granted.');
                clearCart();
                setIsCartOpen(false);
                router.push('/dashboard');

            } catch (err: any) {
                console.error('Checkout Error:', err);
                alert('Payment recorded locally but failed to save to server: ' + err.message);
                // Fallback? No, we want strict sync.
            }
        }
    };

    if (!isCartOpen) return null;

    const drawerContent = (
        <>
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 1001,
                    transition: 'opacity 0.3s ease'
                }}
                onClick={() => setIsCartOpen(false)}
            />
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '100%',
                maxWidth: '400px',
                height: '100vh',
                backgroundColor: 'white',
                zIndex: 1002,
                boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                transform: isCartOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.3s ease-in-out'
            }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShoppingCart size={20} /> Your Cart ({items.length})
                    </h2>
                    <button onClick={() => setIsCartOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                    {items.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px' }}>
                            <ShoppingCart size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                            <p>Your cart is empty.</p>
                            <Button variant="outline" size="sm" style={{ marginTop: '16px' }} onClick={() => {
                                setIsCartOpen(false);
                                router.push('/pricing');
                            }}>
                                Browse Courses
                            </Button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {items.map((item, index) => (
                                <div key={`${item.id}-${index}`} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        backgroundColor: '#f1f5f9',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {/* Placeholder Image */}
                                        <Lock size={20} color="#cbd5e1" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px' }}>{item.name}</h4>
                                        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '8px' }}>{item.type}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 700, color: '#DC2626' }}>₹{item.price.toLocaleString()}</span>
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
                                            >
                                                <Trash2 size={14} /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>

                        {/* Coupon Section */}
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    placeholder="Coupon Code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    style={{
                                        flex: 1,
                                        padding: '8px 12px',
                                        border: '1px solid #cbd5e1',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem'
                                    }}
                                />
                                <Button size="sm" variant="outline" onClick={applyCoupon} disabled={discount > 0}>
                                    {discount > 0 ? 'Applied' : 'Apply'}
                                </Button>
                            </div>
                            {discount > 0 && (
                                <p style={{ fontSize: '0.8rem', color: '#B91C1C', marginTop: '4px' }}>
                                    Discount applied: -₹{discount}
                                </p>
                            )}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#64748b' }}>
                            <span>Subtotal</span>
                            <span>₹{cartTotal.toLocaleString()}</span>
                        </div>
                        {discount > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: '#B91C1C' }}>
                                <span>Discount</span>
                                <span>-₹{discount.toLocaleString()}</span>
                            </div>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '1.2rem', fontWeight: 800 }}>
                            <span>Total</span>
                            <span>₹{(Math.max(0, cartTotal - discount)).toLocaleString()}</span>
                        </div>

                        <Button className="w-full" style={{ width: '100%' }} onClick={handleCheckout}>
                            Proceed to Checkout
                        </Button>
                        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8', marginTop: '12px' }}>
                            Secure Checkout by DesiPayments
                        </p>
                    </div>
                )}
            </div>
        </>
    );

    return typeof document !== 'undefined' ? createPortal(drawerContent, document.body) : null;
};

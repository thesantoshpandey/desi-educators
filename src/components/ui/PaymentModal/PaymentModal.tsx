'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, CreditCard, Lock, Loader2 } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    planName: string;
    onSuccess: () => void;
    items?: any[]; // Array of items being purchased (for enrollment)
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export const PaymentModal = ({ isOpen, onClose, amount, planName, onSuccess, items }: PaymentModalProps) => {
    const { user } = useAuth();
    const [step, setStep] = useState<'details' | 'processing' | 'success'>('details');
    const [loading, setLoading] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [discountApplied, setDiscountApplied] = useState(0);
    const [finalAmount, setFinalAmount] = useState(amount);

    React.useEffect(() => {
        setFinalAmount(amount);
        setDiscountApplied(0);
        setCouponCode('');

        // Load Razorpay Script dynamically
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [amount, isOpen]);

    const applyCoupon = () => {
        const coupons = JSON.parse(localStorage.getItem('siteCoupons') || '[]');
        const coupon = coupons.find((c: any) => c.code === couponCode.toUpperCase() && c.active);

        if (coupon) {
            let discount = 0;
            if (coupon.type === 'percent') {
                discount = Math.floor((amount * coupon.discount) / 100);
            } else {
                discount = coupon.discount;
            }
            setDiscountApplied(discount);
            setFinalAmount(Math.max(0, amount - discount));
        } else {
            alert('Invalid or expired coupon code');
        }
    };

    if (!isOpen) return null;

    const handleRazorpayPayment = async () => {
        if (!user) {
            alert('Please login to continue');
            return;
        }

        setLoading(true);

        try {
            // 1. Create Order via API
            const response = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: finalAmount,
                    currency: 'INR'
                })
            });

            const orderData = await response.json();

            if (!response.ok) {
                throw new Error(orderData.details || 'Failed to create order');
            }

            // 2. Initialize Razorpay
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Ensure exposed if needed, or rely on backend, but SDK needs public key usually? 
                // Wait, Razorpay JS needs the ID. We should pass it from backend or env.
                // Assuming it's in public env for now, or returned by create-order? 
                // Let's assume env.
                // If not in env, we can return it from backend create-order.

                amount: orderData.amount,
                currency: orderData.currency,
                name: "Desi Educators",
                description: `Purchase: ${planName}`,
                image: "https://your-logo-url.com/logo.png", // Optional
                order_id: orderData.id,
                handler: async function (response: any) {
                    // 3. Verify Payment
                    setStep('processing');

                    const verifyRes = await fetch('/api/payment/verify', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            user_id: user.id,
                            amount: finalAmount,
                            items: items || [{ id: 'bundle', title: planName, itemType: 'bundle' }]
                        })
                    });

                    const verifyData = await verifyRes.json();

                    if (verifyRes.ok) {
                        setStep('success');
                        setTimeout(() => {
                            onSuccess();
                            setStep('details');
                        }, 2000);
                    } else {
                        alert('Payment Verification Failed: ' + verifyData.message);
                        setStep('details');
                    }
                    setLoading(false);
                },
                prefill: {
                    name: user.name || 'User',
                    email: user.email,
                    contact: user.phone || ''
                },
                theme: {
                    color: "#DC2626"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                alert('Payment Failed: ' + response.error.description);
                setLoading(false);
            });
            rzp.open();

        } catch (err: any) {
            console.error('Payment Initialization Error:', err);
            alert('Failed to initiate payment. Please try again.');
            setLoading(false);
        }
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

                {step === 'details' && (
                    <>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Complete Payment</h2>
                        <p style={{ color: '#64748b', marginBottom: '24px' }}>
                            Unlock full access to <strong>{planName}</strong>
                        </p>

                        <div style={{
                            backgroundColor: '#f8fafc',
                            padding: '16px',
                            borderRadius: '8px',
                            marginBottom: '24px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <span style={{ color: '#475569', fontWeight: 500 }}>Total Amount</span>
                            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#DC2626' }}>₹{finalAmount}</span>
                        </div>

                        {/* Coupon Section */}
                        <div style={{ marginBottom: '24px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem', fontWeight: 500 }}>Coupon Code</label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Input
                                    placeholder="Enter code"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    disabled={discountApplied > 0}
                                />
                                <Button
                                    variant="outline"
                                    onClick={applyCoupon}
                                    disabled={discountApplied > 0}
                                >
                                    {discountApplied > 0 ? 'Applied' : 'Apply'}
                                </Button>
                            </div>
                            {discountApplied > 0 && (
                                <p style={{ fontSize: '0.8rem', color: '#B91C1C', marginTop: '4px' }}>
                                    Coupon applied! You saved ₹{discountApplied}.
                                </p>
                            )}
                        </div>

                        <Button
                            onClick={handleRazorpayPayment}
                            disabled={loading}
                            className="w-full"
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Lock size={16} />}
                            {loading ? 'Processing...' : `Pay ₹${finalAmount} with Razorpay`}
                        </Button>

                        <p style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                            Secured by Razorpay. UPI, Cards & Netbanking accepted.
                        </p>
                    </>
                )}

                {(step === 'processing' || (step !== 'success' && loading && step !== 'details')) && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div className="spinner" style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid #DC2626',
                            borderRadius: '50%',
                            margin: '0 auto 24px',
                            animation: 'spin 1s linear infinite'
                        }}></div>
                        <style jsx>{`
                            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                        `}</style>
                        <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Processing Payment...</h3>
                        <p style={{ color: '#64748b' }}>Please wait while we verify your transaction.</p>
                    </div>
                )}

                {step === 'success' && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 24px' }} />
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#10b981' }}>Payment Successful!</h3>
                        <p style={{ color: '#64748b' }}>You now have access to {planName}.</p>
                    </div>
                )}
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

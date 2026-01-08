'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, Button, PaymentModal } from '@/components/ui';
import { ChevronRight, Lock } from 'lucide-react';
import { useContent } from '@/context/ContentContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useProduct } from '@/context/ProductContext';

export default function SubjectPage({
    params,
}: {
    params: Promise<{ subject: string }>;
}) {
    const { subject } = use(params);
    const { getChaptersBySubject, hasAccess, refreshEnrollments, mergeEnrollments } = useContent();
    const { getProductByTarget } = useProduct();
    const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);
    const chapters = getChaptersBySubject(subject);

    // Find the product that sells this subject (or the first one targeting it)
    const product = getProductByTarget(subject);

    const { user } = useAuth();
    const { addToCart } = useCart();
    const [selectedProduct, setSelectedProduct] = React.useState<any>(null); // Product to buy (Subject or Chapter)
    const [locks, setLocks] = React.useState<Record<string, boolean>>({});

    const isOwned = hasAccess(subject);

    // Check ownership and load locks
    React.useEffect(() => {
        // Load miscellaneous locks config if needed (though really this should come from DB/Config too)
        const storedLocks = JSON.parse(localStorage.getItem('contentLocks') || '{}');
        setLocks(storedLocks);
    }, []);

    const handleSuccess = async (newlyEnrolledIds?: string[]) => {
        if (!user || !selectedProduct) return;

        // 1. Try immediate optimistic update from backend response
        if (newlyEnrolledIds && newlyEnrolledIds.length > 0) {
            mergeEnrollments(newlyEnrolledIds);
        } else {
            // Fallback to fetch
            await refreshEnrollments();
        }

        // Refresh State logic handled by context update
        if (!selectedProduct.targetIds.includes(subject)) {
            window.location.reload();
        }

        setSelectedProduct(null);
    };

    const isSubjectLocked = locks[subject] !== false;

    return (
        <div style={{ padding: '0 0' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem' }}>{subjectName}</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Select a chapter to start learning.</p>
                </div>
                {(!isOwned && isSubjectLocked && product) && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                            variant="outline"
                            onClick={() => addToCart({
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                type: product.type,
                                targetIds: product.targetIds
                            })}
                        >
                            Add to Cart
                        </Button>
                        <Button onClick={() => {
                            if (!user) {
                                window.location.href = `/login?next=${window.location.pathname}`;
                                return;
                            }
                            setSelectedProduct(product);
                        }} style={{ backgroundColor: '#FFC107', color: 'black' }}>
                            Buy Now
                        </Button>
                    </div>
                )}
                {isOwned && (
                    <div style={{ padding: '8px 16px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '8px', fontWeight: 600 }}>
                        Enrolled
                    </div>
                )}
            </div>

            {selectedProduct && (
                <PaymentModal
                    isOpen={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    amount={selectedProduct.price}
                    planName={selectedProduct.name}
                    onSuccess={handleSuccess}
                    items={selectedProduct.targetIds.map((id: string) => ({
                        id: id,
                        title: selectedProduct.name, // or specific item name if available
                        itemType: selectedProduct.type === 'chapter' ? 'chapter' : 'subject'
                    }))}
                />
            )}

            {chapters.length === 0 ? (
                <p>No chapters added yet.</p>
            ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                    {chapters.map((chapter) => {
                        // Check if user has explicit access to this chapter
                        const hasChapterAccess = hasAccess(chapter.id);

                        // Logic: Locked if (Subject Locked AND No Explicit Access)
                        const chapterLockKey = `${subject}_${chapter.id}`;
                        const isChapterLocked = !isOwned && !hasChapterAccess && (
                            locks[chapterLockKey] !== undefined
                                ? locks[chapterLockKey]
                                : isSubjectLocked
                        );

                        const chapterProduct = getProductByTarget(chapter.id);

                        return (
                            <div key={`${chapter.subjectId}-${chapter.id}`}>
                                {isChapterLocked ? (
                                    <Card padding="md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.9, backgroundColor: '#f9fafb' }}>
                                        <div>
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '4px', color: '#64748b' }}>{chapter.title}</h3>
                                            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{chapter.topics.length} Topics • Locked</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {chapterProduct ? (
                                                <Button size="sm" onClick={() => {
                                                    if (!user) {
                                                        window.location.href = `/login?next=${window.location.pathname}`;
                                                        return;
                                                    }
                                                    setSelectedProduct(chapterProduct);
                                                }}>
                                                    Unlock ₹{chapterProduct.price}
                                                </Button>
                                            ) : (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#94a3b8', fontSize: '0.8rem' }}>
                                                    <Lock size={14} /> Course Material
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ) : (
                                    <Link href={`/neet/${subject}/${chapter.id}`}>
                                        <Card hoverable padding="md" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{chapter.title}</h3>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{chapter.topics.length} Topics</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <ChevronRight size={20} color="var(--text-light)" />
                                            </div>
                                        </Card>
                                    </Link>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

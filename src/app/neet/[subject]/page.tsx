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
    const { getChaptersBySubject, hasAccess, refreshEnrollments, mergeEnrollments, subjects, isLoading } = useContent();
    const { getProductByTarget } = useProduct();
    const subjectName = subject.charAt(0).toUpperCase() + subject.slice(1);
    const chapters = getChaptersBySubject(subject);

    // Get current subject data from Context (DB source of truth)
    const subjectData = subjects.find(s => s.id === subject);
    const isSubjectGlobalLock = subjectData?.is_locked !== false; // Default: Locked

    // Find the product that sells this subject (or the first one targeting it)
    const product = getProductByTarget(subject);

    const { user } = useAuth();
    const { addToCart } = useCart();
    const [selectedProduct, setSelectedProduct] = React.useState<any>(null); // Product to buy (Subject or Chapter)

    const isOwned = hasAccess(subject);

    const handleSuccess = async (newlyEnrolledIds?: string[]) => {
        if (!user || !selectedProduct) return;

        // 1. Try immediate optimistic update from backend response
        if (newlyEnrolledIds && newlyEnrolledIds.length > 0) {
            mergeEnrollments(newlyEnrolledIds);
        } else {
            // Fallback to fetch
            await refreshEnrollments();
        }

        setSelectedProduct(null);
    };

    if (isLoading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                <div style={{ marginBottom: '16px' }}>
                    <Lock size={32} style={{ opacity: 0.2 }} />
                </div>
                <p>Verifying access...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '0 0' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem' }}>{subjectName}</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Select a chapter to start learning.</p>
                </div>
                {(!isOwned && isSubjectGlobalLock && product) && (
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
                        // hasAccess(chapter.id) ALREADY handles hierarchy checks (Subject ownership -> Chapter access)
                        const hasChapterAccess = hasAccess(chapter.id);

                        // Determine if Chapter is locked:
                        // 1. User does NOT have access
                        // 2. AND (Chapter is explicitly locked OR (Chapter lock is undefined AND Subject is locked))
                        // Note: If chapter.is_locked is explicitly false, it overrides subject lock (Free chapter in paid course)
                        const isChapterGlobalLock = chapter.is_locked !== undefined
                            ? chapter.is_locked
                            : isSubjectGlobalLock;

                        const isChapterLocked = !hasChapterAccess && isChapterGlobalLock;

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

            {/* DEBUG SECTION - Remove after fixing */}
            <div style={{ marginTop: '50px', padding: '20px', backgroundColor: '#f0f0f0', border: '1px dashed red', fontSize: '12px', fontFamily: 'monospace' }}>
                <h4>Debug Info (Deep Trace)</h4>
                <p><strong>Checking Access For:</strong> {subject}</p>
                <hr style={{ margin: '8px 0' }} />
                <p><strong>User ID:</strong> {user?.id}</p>
                <p><strong>Enrolled IDs:</strong> {JSON.stringify(useContent().enrolledTargetIds)}</p>
                <p><strong>Is Direct Owner?</strong> {useContent().enrolledTargetIds.includes(subject) ? 'YES' : 'NO'}</p>
                <hr style={{ margin: '8px 0' }} />
                <p><strong>All Products ({useContent().products.length}):</strong></p>
                <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                    {useContent().products.map((p: any) => (
                        <div key={p.id}>{p.id} &rarr; Uses Targets: {JSON.stringify(p.target_ids || p.targetIds)}</div>
                    ))}
                </div>
                <hr style={{ margin: '8px 0' }} />
                <p><strong>Owned Products (Intersection):</strong></p>
                <div>
                    {useContent().products.filter((p: any) => useContent().enrolledTargetIds.includes(p.id)).map((p: any) => (
                        <div key={p.id}>
                            <strong>{p.id}</strong>
                            <br />Targets: {JSON.stringify(p.target_ids || p.targetIds)}
                            <br />Does it match '{subject}'? {(p.target_ids || p.targetIds)?.includes(subject) ? 'YES !!!' : 'NO'}
                        </div>
                    ))}
                </div>
                <hr style={{ margin: '8px 0' }} />
                <p><strong>Final Result (HasAccess):</strong> {hasAccess(subject) ? 'YES' : 'NO'}</p>
            </div>
        </div>
    );
}

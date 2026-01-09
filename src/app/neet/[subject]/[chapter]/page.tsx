'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { Accordion, AccordionItem } from '@/components/ui';
import { PaymentModal, Button } from '@/components/ui';
import { PlayCircle, FileText, HelpCircle, Lock, Image, File, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useContent } from '@/context/ContentContext';

export default function ChapterPage({
    params,
}: {
    params: Promise<{ subject: string; chapter: string }>;
}) {
    const { subject, chapter: chapterId } = use(params);
    const { getChapterById, userProgress, toggleProgress, quizzes, hasAccess, subjects, chapters } = useContent();
    const { user } = useAuth();
    const chapterData = getChapterById(subject, chapterId);
    const subjectData = subjects.find(s => s.id === subject || s.title.toLowerCase() === subject.toLowerCase());
    const currentChapter = chapters.find(c => c.id === chapterId);

    const [selectedItem, setSelectedItem] = React.useState<{ id: string, name: string, price: number } | null>(null);

    const hasItemAccess = (itemId: string) => {
        if (!user) return false;
        // Global access check via Context
        if (hasAccess(subject)) return true;
        if (hasAccess(chapterId)) return true; // Check if user owns the Chapter
        if (hasAccess('full_bundle')) return true;
        return hasAccess(itemId);
    };

    const handleBuyItem = (e: React.MouseEvent, item: { id: string, title: string, price: number }) => {
        e.preventDefault();

        if (!user) {
            // Redirect to login if not authenticated
            window.location.href = `/login?next=${window.location.pathname}`;
            return;
        }

        setSelectedItem({
            id: item.id,
            name: item.title,
            price: item.price
        });
    };

    const { refreshEnrollments, mergeEnrollments } = useContent();

    const handlePaymentSuccess = async (newlyEnrolledIds?: string[]) => {
        if (!selectedItem || !user) return;

        if (newlyEnrolledIds && newlyEnrolledIds.length > 0) {
            mergeEnrollments(newlyEnrolledIds);
        } else {
            await refreshEnrollments();
        }

        setSelectedItem(null);
    };

    if (!chapterData) {
        return <div>Chapter not found.</div>;
    }

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '0.9rem', color: 'var(--primary-color)', textTransform: 'capitalize' }}>
                    {subject}
                </span>
                <h1 style={{ fontSize: '1.75rem', marginTop: '8px' }}>{chapterData.title}</h1>
            </div>

            <Accordion>
                {chapterData.topics.length === 0 && <p>Coming soon...</p>}
                {chapterData.topics.map((topic, index) => {
                    // Unified Items logic
                    // We assume quizzes created as materials have type='test'
                    // We also merge legacy quizzes if they exist separately
                    const legacyQuiz = quizzes?.find(q => q.topic_id === topic.id);
                    const unifiedMaterials = [...topic.materials];

                    // If there's a legacy quiz that isn't in materials, add it
                    if (legacyQuiz && !unifiedMaterials.find(m => m.id === legacyQuiz.id)) {
                        unifiedMaterials.push({
                            id: legacyQuiz.id,
                            type: 'test',
                            title: legacyQuiz.title,
                            price: legacyQuiz.price,
                            created_at: legacyQuiz.created_at
                        } as any);
                    }

                    // Sort by creation or default order
                    // unifiedMaterials.sort(...) // Optional

                    return (
                        <AccordionItem
                            key={topic.id}
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                    <span style={{ fontWeight: 600, color: '#111827' }}>{topic.title}</span>
                                    <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 400 }}>{unifiedMaterials.length} Items</span>
                                </div>
                            }
                            defaultOpen={index === 0}
                        >
                            {unifiedMaterials.length === 0 ? (
                                <p style={{ color: 'var(--text-light)' }}>No content uploaded yet.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {unifiedMaterials.map(material => {
                                        const price = material.price || 0;
                                        const isSubjectLocked = subjectData?.is_locked && !hasAccess(subjectData.id);
                                        const isChapterLocked = currentChapter?.is_locked && !hasAccess(chapterId);
                                        const isMaterialLocked = (material.price || 0) > 0 && !hasAccess(material.id);

                                        const isLocked = isSubjectLocked || isChapterLocked || isMaterialLocked;
                                        const displayPrice = isSubjectLocked ? 999 : (isChapterLocked ? 199 : (material.price || 0)); // Fallback prices if locked by parent but no specific price

                                        const isCompleted = userProgress[material.id] || false;
                                        const isQuiz = material.type === 'test';

                                        return (
                                            <div key={material.id} style={{
                                                padding: '12px',
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                transition: 'all 0.2s'
                                            }}>
                                                {isLocked ? (
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        opacity: 0.8
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{
                                                                padding: '8px',
                                                                borderRadius: '8px',
                                                                backgroundColor: '#f3f4f6'
                                                            }}>
                                                                <Lock size={18} color="#6b7280" />
                                                            </div>
                                                            <div>
                                                                <span style={{ fontWeight: 600, color: '#374151' }}>{material.title}</span>
                                                                {isQuiz && <span style={{ marginLeft: '8px', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>QUIZ</span>}
                                                            </div>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            style={{ height: '36px', fontSize: '0.85rem', backgroundColor: '#111827' }}
                                                            onClick={(e) => handleBuyItem(e, { id: isSubjectLocked ? (subjectData?.id || '') : (isChapterLocked ? chapterId : material.id), title: isSubjectLocked ? (subjectData?.title || 'Course') : (isChapterLocked ? (currentChapter?.title || 'Chapter') : material.title), price: displayPrice })}
                                                        >
                                                            Unlock ₹{displayPrice}
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                                            {/* Progress for non-quizzes (or quizzes too if we want manual mark) */}
                                                            {!isQuiz && (
                                                                <div
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        toggleProgress(material.id, !isCompleted);
                                                                    }}
                                                                    style={{ cursor: 'pointer' }}
                                                                >
                                                                    {isCompleted ? (
                                                                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                            <Check size={14} color="white" />
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid #e5e7eb' }}></div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            <div style={{
                                                                padding: '10px',
                                                                borderRadius: '8px',
                                                                backgroundColor: isQuiz ? '#FEF2F2' : '#f9fafb',
                                                                color: isQuiz ? '#DC2626' : '#6b7280'
                                                            }}>
                                                                {material.type === 'pdf' && <FileText size={20} />}
                                                                {material.type === 'video' && <PlayCircle size={20} />}
                                                                {isQuiz && <HelpCircle size={20} />}
                                                                {material.type === 'image' && <Image size={20} />}
                                                                {material.type === 'document' && <File size={20} />}
                                                            </div>

                                                            <div>
                                                                <a
                                                                    href={isQuiz ? `/quiz/${material.id}` : (material.url || '#')}
                                                                    target={isQuiz ? "_self" : "_blank"}
                                                                    rel="noopener noreferrer"
                                                                    style={{ textDecoration: 'none' }}
                                                                >
                                                                    <div style={{ fontWeight: 600, color: '#111827', cursor: 'pointer', fontSize: '0.95rem' }}>
                                                                        {material.title}
                                                                    </div>
                                                                </a>
                                                                <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '2px' }}>
                                                                    {material.type.toUpperCase()}
                                                                    {material.duration && ` • ${material.duration}`}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {isQuiz ? (
                                                            <Link href={`/quiz/${material.id}`}>
                                                                <Button
                                                                    size="sm"
                                                                    style={{
                                                                        backgroundColor: '#DC2626',
                                                                        color: 'white',
                                                                        height: '36px',
                                                                        padding: '0 16px',
                                                                        borderRadius: '6px',
                                                                        fontWeight: 600
                                                                    }}
                                                                >
                                                                    Start Quiz
                                                                </Button>
                                                            </Link>
                                                        ) : (
                                                            <a href={material.url || '#'} target="_blank" rel="noopener noreferrer">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    style={{ color: '#6b7280' }}
                                                                >
                                                                    View
                                                                </Button>
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </AccordionItem>
                    );
                })}
            </Accordion>

            {selectedItem && (
                <PaymentModal
                    isOpen={!!selectedItem}
                    onClose={() => setSelectedItem(null)}
                    amount={selectedItem.price}
                    planName={selectedItem.name}
                    onSuccess={handlePaymentSuccess}
                    items={[{
                        id: selectedItem.id,
                        title: selectedItem.name,
                        itemType: 'chapter'
                    }]}
                />
            )}
        </div>
    );
}

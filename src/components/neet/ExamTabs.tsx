'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, PlayCircle, HelpCircle, PenTool, ChevronRight } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { useContent } from '@/context/ContentContext';
import styles from './ExamTabs.module.css';

const tabs = [
    { id: 'notes', label: 'Notes', icon: <FileText size={18} /> },
    { id: 'videos', label: 'Videos', icon: <PlayCircle size={18} /> },
    { id: 'tests', label: 'Mock Tests', icon: <PenTool size={18} /> },
    { id: 'doubts', label: 'Doubts', icon: <HelpCircle size={18} /> },
];

export const ExamTabs = () => {
    const [activeTab, setActiveTab] = useState('notes');

    const { chapters, quizzes } = useContent();

    // Get recent 3 chapters with materials
    const recentNotes = chapters
        .filter(c => c.topics.some(t => t.materials.length > 0))
        .slice(0, 3);

    return (
        <div className={styles.container}>
            {/* Tab Navigation */}
            <div className={styles.tabList}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <Card className={styles.contentArea}>
                {activeTab === 'notes' && (
                    <div className={styles.grid}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <h3>Recent Notes</h3>
                            <Link href="/neet/biology" style={{ fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: 600 }}>View All</Link>
                        </div>
                        {(() => {
                            // Find all PDF materials across all chapters
                            const allMaterials = chapters.flatMap(c =>
                                c.topics.flatMap(t =>
                                    t.materials
                                        .filter(m => m.type === 'pdf')
                                        .map(m => ({
                                            ...m,
                                            chapterId: c.id,
                                            subjectId: c.subjectId,
                                            chapterTitle: c.title
                                        }))
                                )
                            );

                            // Sort by created_at desc (newest first)
                            const recents = allMaterials
                                .sort((a, b) => {
                                    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                                    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                                    return dateB - dateA;
                                })
                                .slice(0, 3); // Limit to top 3 as requested

                            return recents.length > 0 ? (
                                recents.map(m => (
                                    <Link key={m.id} href={`/neet/${m.subjectId}/${m.chapterId}`} className={styles.placeholderItem}>
                                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {m.title}
                                            {(!m.created_at || (new Date().getTime() - new Date(m.created_at).getTime() < 7 * 24 * 60 * 60 * 1000)) && (
                                                <span className={styles.newBadge}>NEW</span>
                                            )}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{m.chapterTitle}</div>
                                    </Link>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                                    <FileText size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                                    <p style={{ fontWeight: 500 }}>No notes uploaded yet</p>
                                    <p style={{ fontSize: '0.875rem' }}>Check back soon for new study materials!</p>
                                </div>
                            );
                        })()}
                    </div>
                )}
                {activeTab === 'videos' && (
                    <div className={styles.grid}>
                        <h3>Concept Videos</h3>
                        {(() => {
                            // Find all Video materials
                            const allVideos = chapters.flatMap(c =>
                                c.topics.flatMap(t =>
                                    t.materials
                                        .filter(m => m.type === 'video')
                                        .map(m => ({
                                            ...m,
                                            chapterId: c.id,
                                            subjectId: c.subjectId,
                                            chapterTitle: c.title
                                        }))
                                )
                            );

                            const recentVideos = allVideos.slice(0, 5);

                            return recentVideos.length > 0 ? (
                                recentVideos.map(v => (
                                    <Link key={v.id} href={`/neet/${v.subjectId}/${v.chapterId}`} className={styles.videoCard}>
                                        <div className={styles.videoThumb}>
                                            <PlayCircle size={24} />
                                        </div>
                                        <div className={styles.content}>
                                            <div className={styles.title}>{v.title}</div>
                                            <div className={styles.subtitle}>{v.chapterTitle}</div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                                    <PlayCircle size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                                    <p style={{ fontWeight: 500 }}>No videos uploaded yet</p>
                                    <p style={{ fontSize: '0.875rem' }}>Video lectures are coming soon.</p>
                                </div>
                            );
                        })()}
                    </div>
                )}
                {activeTab === 'tests' && (
                    <div className={styles.grid}>
                        <h3>Available Mock Tests</h3>
                        {quizzes && quizzes.length > 0 ? (
                            quizzes.map(quiz => (
                                <Link
                                    key={quiz.id}
                                    href={`/quiz/${quiz.id}`}
                                    className={styles.listItem}
                                >
                                    <div className={styles.iconBox}>
                                        <HelpCircle size={24} />
                                    </div>
                                    <div className={styles.content}>
                                        <div className={styles.title}>{quiz.title || 'Untitled Quiz'}</div>
                                        <div className={styles.subtitle}>Test your knowledge</div>
                                    </div>
                                    <div className={styles.actionIcon}>
                                        <ChevronRight size={20} />
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                                <PenTool size={48} style={{ opacity: 0.2, margin: '0 auto 16px' }} />
                                <p style={{ fontWeight: 500 }}>No mock tests active</p>
                                <p style={{ fontSize: '0.875rem' }}>Tests will appear here before exams.</p>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'doubts' && <div>Join the discussion forum.</div>}
            </Card>
        </div>
    );
};

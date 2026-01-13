'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, ChevronDown, Book } from 'lucide-react';
import styles from './SyllabusSidebar.module.css';

import { useContent } from '@/context/ContentContext';

import { useParams } from 'next/navigation';

export const SyllabusSidebar = () => {
    const { chapters, subjects } = useContent();
    const params = useParams(); // Get URL params to detect active chapter
    const [expandedSubject, setExpandedSubject] = useState<string | null>('biology');

    const toggleSubject = (subjectId: string) => {
        setExpandedSubject(expandedSubject === subjectId ? null : subjectId);
    };

    return (
        <aside className={styles.sidebar}>
            <div className={styles.header}>
                <Book size={20} />
                <h3>NEET Syllabus</h3>
            </div>
            <div className={styles.content}>
                {subjects.map((subject) => {
                    const subjectChapters = chapters.filter(c => c.subjectId === subject.id);

                    return (
                        <div key={subject.id} className={styles.subjectGroup}>
                            <button
                                className={styles.subjectHeader}
                                onClick={() => toggleSubject(subject.id)}
                            >
                                <span style={{ textTransform: 'capitalize' }}>{subject.title}</span>
                                {expandedSubject === subject.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </button>

                            {expandedSubject === subject.id && (
                                <div className={styles.unitList}>
                                    {subjectChapters.length > 0 ? (
                                        subjectChapters.map((chapter) => {
                                            const isActive = params?.chapter === chapter.id;
                                            return (
                                                <Link
                                                    key={chapter.id}
                                                    href={`/neet/${subject.id}/${chapter.id}`}
                                                    className={styles.unitLink}
                                                    style={isActive ? {
                                                        backgroundColor: '#FEF2F2',
                                                        color: '#DC2626',
                                                        fontWeight: 600,
                                                        borderLeft: '3px solid #DC2626',
                                                        paddingLeft: '13px' // Adjust for border
                                                    } : {}}
                                                >
                                                    {chapter.title}
                                                </Link>
                                            );
                                        })
                                    ) : (
                                        <div style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#94a3b8' }}>
                                            No chapters available.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

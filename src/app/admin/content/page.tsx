'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, Button, Input } from '@/components/ui';
import { Edit, Trash2, Plus, Search, FileText, Video, X, Book, ArrowLeft, ArrowRight } from 'lucide-react';
import { useContent } from '@/context/ContentContext';

export default function ContentManagementPage() {
    const { chapters, subjects, addChapter, deleteChapter, addSubject, deleteSubject, updateSubject, reorderSubjects } = useContent();
    const [searchTerm, setSearchTerm] = useState('');

    // Add Chapter State
    const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
    const [newChapterTitle, setNewChapterTitle] = useState('');
    const [newChapterSubject, setNewChapterSubject] = useState(''); // Empty default

    // Initialize newChapterSubject when subjects load
    React.useEffect(() => {
        if (subjects && subjects.length > 0 && !newChapterSubject) {
            setNewChapterSubject(subjects[0].id);
        }
    }, [subjects, newChapterSubject]);

    // Add Course State
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [newCourseTitle, setNewCourseTitle] = useState('');

    // Edit Course State
    const [isEditCourseModalOpen, setIsEditCourseModalOpen] = useState(false);
    const [editCourseId, setEditCourseId] = useState<string | null>(null);
    const [editCourseTitle, setEditCourseTitle] = useState('');

    const handleEditCourse = (subject: any) => {
        setEditCourseId(subject.id);
        setEditCourseTitle(subject.title);
        setIsEditCourseModalOpen(true);
    };

    const handleUpdateCourse = () => {
        if (!editCourseId || !editCourseTitle.trim()) return;
        updateSubject(editCourseId, editCourseTitle);
        setIsEditCourseModalOpen(false);
        setEditCourseId(null);
        setEditCourseTitle('');
    };

    const handleAddChapter = () => {
        if (!newChapterTitle.trim() || !newChapterSubject) return;
        addChapter(newChapterSubject, newChapterTitle);
        setNewChapterTitle('');
        setIsChapterModalOpen(false);
    };

    const handleAddCourse = () => {
        if (!newCourseTitle.trim()) return;
        addSubject(newCourseTitle);
        setNewCourseTitle('');
        setIsCourseModalOpen(false);
    };

    const handleMoveSubject = (index: number, direction: 'left' | 'right') => {
        if (direction === 'left' && index === 0) return;
        if (direction === 'right' && index === subjects.length - 1) return;

        const newSubjects = [...subjects];
        const targetIndex = direction === 'left' ? index - 1 : index + 1;

        // Swap
        [newSubjects[index], newSubjects[targetIndex]] = [newSubjects[targetIndex], newSubjects[index]];

        reorderSubjects(newSubjects.map(s => s.id));
    };

    // Filter logic
    const safeSubjects = subjects || [];
    const filteredChapters = chapters.filter(c => {
        // Find subject title for search
        const subject = safeSubjects.find(s => s.id === c.subjectId);
        const subjectTitle = subject ? subject.title.toLowerCase() : (c.subjectId ? c.subjectId.toLowerCase() : '');
        const chapterTitle = c.title ? c.title.toLowerCase() : '';

        return (
            chapterTitle.includes(searchTerm.toLowerCase()) ||
            subjectTitle.includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Course Content</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage chapters, notes, and videos.</p>
                </div>
            </div>

            <Card padding="md" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Course Categories</h2>
                    <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{subjects.length} Total</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                    {subjects.map((subject, index) => {
                        const chapterCount = chapters.filter(c => c.subjectId === subject.id).length;
                        return (
                            <div key={subject.id} style={{
                                padding: '16px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: 'white'
                            }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>{subject.title}</h3>
                                    <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                        {chapterCount} {chapterCount === 1 ? 'Chapter' : 'Chapters'}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button
                                        onClick={() => handleMoveSubject(index, 'left')}
                                        disabled={index === 0}
                                        style={{ border: 'none', background: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer', color: index === 0 ? '#cbd5e1' : '#64748b', padding: '8px' }}
                                        title="Move Left"
                                    >
                                        <ArrowLeft size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleMoveSubject(index, 'right')}
                                        disabled={index === subjects.length - 1}
                                        style={{ border: 'none', background: 'none', cursor: index === subjects.length - 1 ? 'not-allowed' : 'pointer', color: index === subjects.length - 1 ? '#cbd5e1' : '#64748b', padding: '8px' }}
                                        title="Move Right"
                                    >
                                        <ArrowRight size={18} />
                                    </button>
                                    <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0', margin: '0 4px' }}></div>
                                    <button
                                        onClick={() => handleEditCourse(subject)}
                                        style={{
                                            color: '#64748b',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '8px',
                                            borderRadius: '4px',
                                            transition: 'all 0.2s'
                                        }}
                                        title="Edit Course"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this course? All chapters will be hidden.')) {
                                                deleteSubject(subject.id);
                                            }
                                        }}
                                        style={{
                                            color: '#94a3b8',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '8px',
                                            borderRadius: '4px',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                                        onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                                        title="Delete Course"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            <Card padding="md">
                <div style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                        <Input
                            placeholder="Search chapters or courses..."
                            icon={<Search size={18} />}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button leftIcon={<Book size={18} />} onClick={() => setIsCourseModalOpen(true)} variant="secondary">Add New Course</Button>
                    <Button leftIcon={<Plus size={18} />} onClick={() => {
                        // Set default subject if available
                        if (subjects.length > 0) setNewChapterSubject(subjects[0].id);
                        setIsChapterModalOpen(true);
                    }}>Add New Chapter</Button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '12px', color: '#64748b', fontSize: '0.875rem' }}>Subject/Course</th>
                            <th style={{ padding: '12px', color: '#64748b', fontSize: '0.875rem' }}>Chapter Title</th>
                            <th style={{ padding: '12px', color: '#64748b', fontSize: '0.875rem' }}>Topics</th>
                            <th style={{ padding: '12px', color: '#64748b', fontSize: '0.875rem' }}>Materials</th>
                            <th style={{ padding: '12px', color: '#64748b', fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredChapters.map((chapter) => {
                            const subject = subjects.find(s => s.id === chapter.subjectId);
                            return (
                                <tr key={`${chapter.subjectId}-${chapter.id}`} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={{ padding: '16px 12px', textTransform: 'capitalize' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            background: '#f1f5f9',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            color: '#64748b'
                                        }}>
                                            {subject ? subject.title : chapter.subjectId}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 12px', fontWeight: 500 }}>{chapter.title}</td>
                                    <td style={{ padding: '16px 12px', color: '#64748b' }}>{chapter.topics.length} items</td>
                                    <td style={{ padding: '16px 12px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#64748b' }}>
                                                <FileText size={14} />
                                                {chapter.topics.reduce((acc, t) => acc + t.materials.filter(m => m.type === 'pdf').length, 0)}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: '#64748b' }}>
                                                <Video size={14} />
                                                {chapter.topics.reduce((acc, t) => acc + t.materials.filter(m => m.type === 'video').length, 0)}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                            <Link href={`/admin/content/${chapter.subjectId}/${chapter.id}`}>
                                                <button style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }} title="Manage Content">
                                                    <Edit size={18} />
                                                </button>
                                            </Link>
                                            <button
                                                onClick={() => deleteChapter(chapter.id)}
                                                style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}
                                                title="Delete Chapter"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </Card>

            {/* Add Chapter Modal */}
            {isChapterModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '12px',
                        width: '400px',
                        maxWidth: '90%'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Add New Chapter</h3>
                            <button onClick={() => setIsChapterModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Subject / Course</label>
                                <select
                                    value={newChapterSubject}
                                    onChange={(e) => setNewChapterSubject(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '1rem'
                                    }}
                                >
                                    {subjects.map(subject => (
                                        <option key={subject.id} value={subject.id}>{subject.title}</option>
                                    ))}
                                </select>
                            </div>

                            <Input
                                label="Chapter Title"
                                placeholder="e.g. Thermodynamics"
                                value={newChapterTitle}
                                onChange={(e) => setNewChapterTitle(e.target.value)}
                            />

                            <Button onClick={handleAddChapter} style={{ width: '100%' }}>Create Chapter</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Course Modal */}
            {isCourseModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '12px',
                        width: '400px',
                        maxWidth: '90%'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Add New Course</h3>
                            <button onClick={() => setIsCourseModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Create a new course category (e.g. "12th Mnemonics") to organize chapters.</p>
                            <Input
                                label="Course Title"
                                placeholder="e.g. 12th Class Mnemonics"
                                value={newCourseTitle}
                                onChange={(e) => setNewCourseTitle(e.target.value)}
                            />

                            <Button onClick={handleAddCourse} style={{ width: '100%' }}>Create Course</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Course Modal */}
            {isEditCourseModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '24px',
                        borderRadius: '12px',
                        width: '400px',
                        maxWidth: '90%'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Edit Course</h3>
                            <button onClick={() => setIsEditCourseModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Input
                                label="Course Title"
                                placeholder="e.g. 12th Class Mnemonics"
                                value={editCourseTitle}
                                onChange={(e) => setEditCourseTitle(e.target.value)}
                            />

                            <Button onClick={handleUpdateCourse} style={{ width: '100%' }}>Update Course</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

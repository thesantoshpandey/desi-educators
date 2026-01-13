'use client';

import { QuizBuilder } from '@/components/admin/QuizBuilder';
import { HelpCircle } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { use } from 'react';
import { useState } from 'react';
import { ArrowLeft, Edit, FileText, Plus, Trash2, Video, X } from 'lucide-react';
import { Button, Card, Input } from '@/components/ui';
import Link from 'next/link';
import { useContent } from '@/context/ContentContext';
import { Material } from '@/data/content';

export default function AdminChapterPage({
    params,
}: {
    params: Promise<{ subject: string; chapterId: string }>;
}) {
    const { subject, chapterId } = use(params);
    const { getChapterById, addTopic, updateTopic, deleteTopic, addMaterial, updateMaterial, deleteMaterial, uploadFile, addQuiz, updateQuiz, deleteQuiz, quizzes, updateChapter } = useContent();
    const chapter = getChapterById(subject, chapterId);

    // Edit Chapter State
    const [isEditChapterModalOpen, setIsEditChapterModalOpen] = useState(false);
    const [editChapterTitle, setEditChapterTitle] = useState('');

    // Modal States
    const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [editingTopicId, setEditingTopicId] = useState<string | null>(null);

    const handleOpenAddTopic = () => {
        setEditingTopicId(null);
        setNewTopicTitle('');
        setIsTopicModalOpen(true);
    };

    const handleOpenEditTopic = (topic: any) => {
        setEditingTopicId(topic.id);
        setNewTopicTitle(topic.title);
        setIsTopicModalOpen(true);
    };

    const [isMaterialModalOpen, setMaterialModalOpen] = useState(false);
    const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
    const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);

    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
    const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
    const [quizInitialData, setQuizInitialData] = useState<{ title: string, questions: any[], price?: number } | undefined>(undefined);

    const [materialType, setMaterialType] = useState<'pdf' | 'video' | 'image' | 'document' | 'test'>('pdf');
    const [materialTitle, setMaterialTitle] = useState('');
    const [materialUrl, setMaterialUrl] = useState(''); // Keep for manual URL
    const [materialPrice, setMaterialPrice] = useState(''); // New State for Price
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    if (!chapter) return <div>Chapter not found</div>;

    const handleOpenEditChapter = () => {
        setEditChapterTitle(chapter.title);
        setIsEditChapterModalOpen(true);
    };

    const handleUpdateChapter = () => {
        if (!editChapterTitle.trim()) return;
        updateChapter(subject, chapterId, editChapterTitle);
        setIsEditChapterModalOpen(false);
    };

    const handleSaveTopic = () => {
        if (!newTopicTitle.trim()) return;

        if (editingTopicId) {
            updateTopic(subject, chapterId, editingTopicId, newTopicTitle);
        } else {
            addTopic(subject, chapterId, newTopicTitle);
        }

        setNewTopicTitle('');
        setEditingTopicId(null);
        setIsTopicModalOpen(false);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadedFile(e.target.files[0]);
            // Clear manual URL if file uploads
            setMaterialUrl('');
        }
    };

    const handleSaveQuiz = async (title: string, questions: any[], price: number) => {
        if (editingQuizId) {
            await updateQuiz(editingQuizId, title, questions, price);
        } else if (selectedTopicId) {
            await addQuiz(selectedTopicId, title, questions, price);
        }
        setIsQuizModalOpen(false);
        setEditingQuizId(null);
        setQuizInitialData(undefined);
    };

    const openAddQuizModal = (topicId: string) => {
        setSelectedTopicId(topicId);
        setEditingQuizId(null);
        setQuizInitialData(undefined);
        setIsQuizModalOpen(true);
    };

    const openEditQuizModal = async (quiz: any) => {
        setEditingQuizId(quiz.id);

        // Fetch Questions
        const { data: questions } = await supabase
            .from('quiz_questions')
            .select('*')
            .eq('quiz_id', quiz.id);

        const mappedQuestions = questions?.map(q => ({
            id: q.id,
            questionText: q.question_text,
            options: q.options,
            correctOption: q.correct_option
        })) || [];

        setQuizInitialData({
            title: quiz.title,
            questions: mappedQuestions,
            price: quiz.price
        });

        setIsQuizModalOpen(true);
    };

    const handleDeleteQuiz = async (quizId: string) => {
        if (confirm('Are you sure you want to delete this quiz?')) {
            await deleteQuiz(quizId);
        }
    };

    const handleSaveMaterial = async () => {
        if (!selectedTopicId) {
            alert('Error: No topic selected. Please refresh and try again.');
            return;
        }

        // Redirect to Quiz Builder if Test selected
        if (materialType === 'test') {
            setMaterialModalOpen(false);
            openAddQuizModal(selectedTopicId);
            return;
        }

        if (!materialTitle) {
            alert('Please enter a title for the material.');
            return;
        }

        let finalUrl = materialUrl;

        setIsUploading(true); // Start loading state

        try {
            if (uploadedFile) {
                const publicUrl = await uploadFile(uploadedFile);
                if (!publicUrl) {
                    throw new Error('Upload returned no URL');
                }
                finalUrl = publicUrl;
            }

            if (!finalUrl) {
                setIsUploading(false);
                alert('Please provide a URL or upload a file.');
                return;
            }

            const price = materialPrice ? parseInt(materialPrice) : 0;

            if (editingMaterialId) {
                await updateMaterial(subject, chapterId, selectedTopicId, editingMaterialId, {
                    title: materialTitle,
                    url: finalUrl,
                    type: materialType,
                    price: price
                });
            } else {
                await addMaterial(subject, chapterId, selectedTopicId, {
                    title: materialTitle,
                    url: finalUrl,
                    type: materialType,
                    price: price
                });
            }

            resetFormState();
            setMaterialModalOpen(false); // Close ONLY on success

        } catch (error: any) {
            console.error('Save Material Error:', error);
            alert(`Failed: ${error.message || 'Unknown error occurred.'}`);
            setIsUploading(false); // Stop loading on error
        }
    };

    const resetFormState = () => {
        setMaterialTitle('');
        setMaterialUrl('');
        setMaterialType('pdf');
        setMaterialPrice('');
        setUploadedFile(null);
        setEditingMaterialId(null);
        setIsUploading(false);
    };

    const openAddMaterialModal = (topicId: string) => {
        resetFormState();
        setSelectedTopicId(topicId);
        setMaterialModalOpen(true);
    };

    const openEditMaterialModal = (topicId: string, material: Material) => {
        resetFormState(); // clear previous state
        setSelectedTopicId(topicId);
        setEditingMaterialId(material.id);
        setMaterialTitle(material.title);
        setMaterialType(material.type);
        setMaterialUrl(material.url || '');
        setMaterialPrice(material.price ? material.price.toString() : '');
        setMaterialModalOpen(true);
    };

    const closeModal = () => {
        resetFormState();
        setMaterialModalOpen(false);
    };

    return (
        <div>
            <div style={{ marginBottom: '24px' }}>
                <Link href="/admin/content" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', textDecoration: 'none', marginBottom: '16px' }}>
                    <ArrowLeft size={16} /> Back to Courses
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ textTransform: 'capitalize', color: 'var(--primary-color)', fontWeight: 600 }}>{subject}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{chapter.title}</h1>
                            <button onClick={handleOpenEditChapter} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }} title="Edit Chapter Name">
                                <Edit size={20} />
                            </button>
                        </div>
                    </div>
                    <Button leftIcon={<Plus size={18} />} onClick={handleOpenAddTopic}>Add New Topic</Button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {chapter.topics.length === 0 && (
                    <Card padding="lg" style={{ textAlign: 'center', color: '#64748b' }}>
                        <p>No topics yet. Create one to start adding materials.</p>
                    </Card>
                )}

                {chapter.topics.map((topic) => {
                    const topicQuizzes = quizzes?.filter(q => q.topic_id === topic.id) || [];

                    // Combine and Sort
                    const items = [
                        ...topic.materials.map(m => ({ ...m, itemType: 'material', created_at: m.created_at || ' ' })),
                        ...topicQuizzes.map(q => ({ ...q, id: q.id, title: q.title, itemType: 'quiz', created_at: q.created_at || ' ' }))
                    ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

                    return (
                        <Card key={topic.id} padding="md">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{topic.title}</h3>
                                    <button onClick={() => handleOpenEditTopic(topic)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }} title="Edit Topic Name">
                                        <Edit size={16} />
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Button size="sm" variant="outline" leftIcon={<HelpCircle size={14} />} onClick={() => openAddQuizModal(topic.id)}>
                                        Add Quiz
                                    </Button>
                                    <Button size="sm" variant="outline" leftIcon={<Plus size={14} />} onClick={() => openAddMaterialModal(topic.id)}>Add Material</Button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this topic and all its contents?')) {
                                                deleteTopic(subject, chapterId, topic.id);
                                            }
                                        }}
                                        style={{
                                            border: '1px solid #fee2e2',
                                            background: '#fef2f2',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            padding: '8px',
                                            borderRadius: '6px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {items.length === 0 ? (
                                <p style={{ fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic' }}>No notes, videos, or quizzes added.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {items.map((item) => {
                                        if (item.itemType === 'quiz') {
                                            // Quiz Item Render
                                            return (
                                                <div key={item.id} style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '8px 12px', backgroundColor: '#f0fdf4', borderRadius: '6px', border: '1px solid #FEE2E2'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <HelpCircle size={16} color="#B91C1C" />
                                                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#B91C1C' }}>{item.title}</span>
                                                        <span style={{ fontSize: '0.75rem', backgroundColor: '#B91C1C', color: 'white', padding: '1px 6px', borderRadius: '4px' }}>Quiz</span>
                                                        {item.price && item.price > 0 && (
                                                            <span style={{ fontSize: '0.75rem', backgroundColor: '#fff7ed', color: '#c2410c', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                                                ₹{item.price}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => openEditQuizModal(item)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}>
                                                            <Edit size={14} />
                                                        </button>
                                                        <button onClick={() => handleDeleteQuiz(item.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}>
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        } else {
                                            // Material Item Render
                                            return (
                                                <div key={item.id} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '8px 12px',
                                                    backgroundColor: '#f8fafc',
                                                    borderRadius: '6px'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {item.type === 'pdf' ? <FileText size={16} color="#DC2626" /> : <Video size={16} color="#3b82f6" />}
                                                        {item.url ? (
                                                            <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                <span style={{ fontSize: '0.9rem', fontWeight: 500, textDecoration: 'underline' }}>{item.title}</span>
                                                            </a>
                                                        ) : (
                                                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.title}</span>
                                                        )}
                                                        {item.url && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>({item.type === 'pdf' ? 'PDF' : 'Video'})</span>}
                                                        {item.price && item.price > 0 ? (
                                                            <span style={{ fontSize: '0.75rem', backgroundColor: '#fff7ed', color: '#c2410c', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                                                                ₹{item.price}
                                                            </span>
                                                        ) : <span style={{ fontSize: '0.75rem', backgroundColor: '#f0fdf4', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>Free</span>}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => openEditMaterialModal(topic.id, item as Material)}
                                                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (confirm('Are you sure you want to delete this material?')) {
                                                                    deleteMaterial(subject, chapterId, topic.id, item.id);
                                                                }
                                                            }}
                                                            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    })}
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Add Topic Modal */}
            {isTopicModalOpen && (
                <div style={modalOverlayStyle}>
                    <Card style={modalContentStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontWeight: 700 }}>{editingTopicId ? 'Edit Topic' : 'Add Topic'}</h3>
                            <button onClick={() => setIsTopicModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <Input label="Topic Name" placeholder="e.g. Introduction" value={newTopicTitle} onChange={(e) => setNewTopicTitle(e.target.value)} />
                        <Button style={{ marginTop: '16px', width: '100%' }} onClick={handleSaveTopic}>{editingTopicId ? 'Update Topic' : 'Create Topic'}</Button>
                    </Card>
                </div>
            )}

            {/* Add/Edit Material Modal */}
            {isMaterialModalOpen && (
                <div style={modalOverlayStyle}>
                    <Card style={modalContentStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontWeight: 700 }}>{editingMaterialId ? 'Edit Material' : 'Add Material'}</h3>
                            <button onClick={closeModal} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px' }}>Material Type</label>
                                <select
                                    value={materialType}
                                    onChange={(e) => setMaterialType(e.target.value as any)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '6px',
                                        border: '1px solid #e2e8f0',
                                        backgroundColor: 'white'
                                    }}
                                >
                                    <option value="pdf">PDF Document</option>
                                    <option value="video">Video</option>
                                    <option value="image">Image (JPG/PNG)</option>
                                    <option value="document">Word/Doc</option>
                                    <option value="test">Test / Quiz</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '8px' }}>
                                    Upload File {materialType === 'video' && '(or paste link below)'}
                                </label>
                                <input
                                    type="file"
                                    accept={
                                        materialType === 'pdf' ? '.pdf' :
                                            materialType === 'video' ? 'video/*' :
                                                materialType === 'image' ? 'image/*' :
                                                    '.doc,.docx,.txt'
                                    }
                                    onChange={handleFileChange}
                                    style={{
                                        width: '100%',
                                        padding: '8px',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '6px'
                                    }}
                                />
                                {uploadedFile && (
                                    <p style={{ marginTop: '4px', fontSize: '0.8rem', color: '#B91C1C' }}>
                                        Selected: {uploadedFile.name}
                                    </p>
                                )}
                            </div>

                            <Input
                                label="Title"
                                placeholder={materialType === 'pdf' ? "e.g. NCERT Summary" : "e.g. Lecture 1"}
                                value={materialTitle}
                                onChange={(e) => setMaterialTitle(e.target.value)}
                            />

                            <Input
                                label={materialType === 'pdf' ? "Or Paste URL" : "Or Video Link"}
                                placeholder="Paste external link if skipping upload"
                                value={materialUrl}
                                onChange={(e) => setMaterialUrl(e.target.value)}
                                disabled={!!uploadedFile}
                            />

                            <div style={{ marginTop: '16px' }}>
                                <Input
                                    label="Price (₹)"
                                    placeholder="0 for Free"
                                    type="number"
                                    value={materialPrice}
                                    onChange={(e) => setMaterialPrice(e.target.value)}
                                />
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                                    If price &gt; 0, it will be locked for users who haven't purchased it.
                                </p>
                            </div>
                        </div>

                        <Button
                            style={{ marginTop: '16px', width: '100%' }}
                            onClick={handleSaveMaterial}
                            isLoading={isUploading}
                        >
                            {editingMaterialId ? 'Update Material' : 'Add Material'}
                        </Button>
                    </Card>
                </div>
            )}

            {/* Quiz Builder Modal */}
            <QuizBuilder
                isOpen={isQuizModalOpen}
                onClose={() => setIsQuizModalOpen(false)}
                onSave={handleSaveQuiz}
                initialData={quizInitialData}
            />

            {/* Edit Chapter Modal */}
            {isEditChapterModalOpen && (
                <div style={modalOverlayStyle}>
                    <Card style={modalContentStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <h3 style={{ fontWeight: 700 }}>Edit Chapter</h3>
                            <button onClick={() => setIsEditChapterModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <Input label="Chapter Title" placeholder="e.g. Thermodynamics" value={editChapterTitle} onChange={(e) => setEditChapterTitle(e.target.value)} />
                        <Button style={{ marginTop: '16px', width: '100%' }} onClick={handleUpdateChapter}>Update Chapter</Button>
                    </Card>
                </div>
            )}
        </div>
    );
}

const modalOverlayStyle = {
    position: 'fixed' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000
};

const modalContentStyle = {
    width: '400px',
    maxWidth: '90%'
};

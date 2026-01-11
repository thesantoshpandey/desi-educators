'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
// Retaining types for existing UI compatibility
import { Topic, Material } from '@/data/content';
export type { Topic, Material };

export interface Subject {
    id: string;
    title: string;
    order_index?: number;
    is_locked?: boolean;
    price?: number;
}

export interface Chapter {
    id: string;
    subjectId: string;
    title: string;
    topics: Topic[];
    is_locked?: boolean;
    price?: number;
}

interface ContentContextType {
    chapters: Chapter[];
    subjects: Subject[];
    quizzes: any[];
    addQuiz: (topicId: string, title: string, questions: any[], price: number) => Promise<void>;
    updateQuiz: (quizId: string, title: string, questions: any[], price: number) => Promise<void>;
    deleteQuiz: (quizId: string) => Promise<void>;
    addSubject: (title: string) => Promise<void>;
    updateSubject: (id: string, title: string) => Promise<void>;
    updateSubjectLock: (id: string, isLocked: boolean) => Promise<void>;
    updateSubjectPrice: (id: string, price: number) => Promise<void>;
    deleteSubject: (id: string) => Promise<void>;
    reorderSubjects: (orderedIds: string[]) => Promise<void>;
    addChapter: (subjectId: string, title: string) => Promise<void>;
    updateChapterLock: (chapterId: string, isLocked: boolean) => Promise<void>;
    updateChapterPrice: (chapterId: string, price: number) => Promise<void>;
    updateChapter: (subjectId: string, chapterId: string, title: string) => Promise<void>;
    deleteChapter: (chapterId: string) => Promise<void>;
    addTopic: (subjectId: string, chapterId: string, title: string) => Promise<void>;
    updateTopic: (subjectId: string, chapterId: string, topicId: string, title: string) => Promise<void>;
    deleteTopic: (subjectId: string, chapterId: string, topicId: string) => Promise<void>;
    addMaterial: (subjectId: string, chapterId: string, topicId: string, material: Omit<Material, 'id'>) => Promise<void>;
    updateMaterial: (subjectId: string, chapterId: string, topicId: string, materialId: string, updates: Partial<Material>) => Promise<void>;
    deleteMaterial: (subjectId: string, chapterId: string, topicId: string, materialId: string) => Promise<void>;
    uploadFile: (file: File) => Promise<string | null>;
    getChaptersBySubject: (subjectId: string) => Chapter[];
    getChapterById: (subjectId: string, chapterId: string) => Chapter | undefined;
    userProgress: Record<string, boolean>;
    toggleProgress: (materialId: string, isCompleted: boolean) => Promise<void>;
    isLoading: boolean;
    // New Entitlement Logic
    enrolledTargetIds: string[];
    hasAccess: (targetId: string) => boolean;
    refreshEnrollments: () => Promise<void>;
    mergeEnrollments: (ids: string[]) => void;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider = ({ children }: { children: React.ReactNode }) => {
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [quizzes, setQuizzes] = useState<any[]>([]); // Metadata only
    const [isLoading, setIsLoading] = useState(true);

    const [userProgress, setUserProgress] = useState<Record<string, boolean>>({});
    const [enrolledTargetIds, setEnrolledTargetIds] = useState<string[]>([]);

    const { user } = useAuth();

    // Fetch Initial Data
    useEffect(() => {
        fetchData();
        fetchUserProgress();
        refreshEnrollments();
    }, []);

    // Also refresh enrollments when auth state likely changes (handled via polling or just initial mount is enough if we force refresh on login)
    // Actually, we should listen for auth changes to clear/fetch enrollments.
    useEffect(() => {
        // Simple polling or re-check on focus could be added here for robustness
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                refreshEnrollments();
            } else if (event === 'SIGNED_OUT') {
                setEnrolledTargetIds([]);
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const refreshEnrollments = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setEnrolledTargetIds([]);
            return;
        }

        const { data, error } = await supabase
            .from('enrollments')
            .select('target_id')
            .eq('user_id', user.id);

        if (data) {
            const ids = data.map(d => d.target_id);
            setEnrolledTargetIds(ids);
        }
    };

    const hasAccess = (targetId: string) => {
        if (user?.role === 'admin') return true; // Admin has full access

        if (enrolledTargetIds.includes(targetId)) return true;

        // Check for bundles
        if (enrolledTargetIds.includes('full_bundle') || enrolledTargetIds.includes('full-year')) return true;

        return false;
    };

    // Fetch User Progress
    const fetchUserProgress = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('user_progress')
                .select('material_id, is_completed')
                .eq('user_id', user.id);

            if (data) {
                const progressMap: Record<string, boolean> = {};
                data.forEach((p: any) => {
                    progressMap[p.material_id] = p.is_completed;
                });
                setUserProgress(progressMap);
            }
        }
    };

    const toggleProgress = async (materialId: string, isCompleted: boolean) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Optimistic Update
        setUserProgress(prev => ({ ...prev, [materialId]: isCompleted }));

        const { error } = await supabase
            .from('user_progress')
            .upsert({
                user_id: user.id,
                material_id: materialId,
                is_completed: isCompleted,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, material_id' });

        if (error) {
            console.error('Error updating progress:', error);
            // Revert on error?
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            // Fetch Subjects
            const { data: subjectsData, error: subjectsError } = await supabase
                .from('subjects')
                .select('*')
                .order('order_index', { ascending: true })
                .order('created_at', { ascending: true });

            if (subjectsError) throw subjectsError;

            // Fetch Chapters
            const { data: chaptersData, error: chaptersError } = await supabase
                .from('chapters')
                .select('*')
                .order('created_at', { ascending: true });

            if (chaptersError) throw chaptersError;

            // Fetch Topics
            const { data: topicsData, error: topicsError } = await supabase
                .from('topics')
                .select('*')
                .order('created_at', { ascending: true });

            if (topicsError) throw topicsError;

            // Fetch Materials
            const { data: materialsData, error: materialsError } = await supabase
                .from('materials')
                .select('*')
                .order('created_at', { ascending: true });

            if (materialsError) throw materialsError;

            // Fetch Quizzes
            const { data: quizzesData, error: quizzesError } = await supabase
                .from('quizzes')
                .select('id, topic_id, title, duration_minutes, price, created_at');

            if (quizzesError) console.error('Error fetching quizzes:', quizzesError); // Non-critical
            if (quizzesData) setQuizzes(quizzesData);

            // Reconstruct nested structure
            if (subjectsData) setSubjects(subjectsData);

            if (chaptersData) {
                const nestedChapters = chaptersData.map(c => {
                    const cTopics = topicsData?.filter(t => t.chapter_id === c.id) || [];
                    return {
                        id: c.id,
                        subjectId: c.subject_id,
                        title: c.title,
                        topics: cTopics.map(t => {
                            const tMaterials = materialsData?.filter(m => m.topic_id === t.id) || [];
                            return {
                                id: t.id,
                                title: t.title,
                                materials: tMaterials.map(m => ({
                                    id: m.id,
                                    title: m.title,
                                    type: m.type as 'pdf' | 'video',
                                    url: m.url,
                                    price: m.price || 0
                                }))
                            };
                        })
                    };
                });
                setChapters(nestedChapters);
            }
        } catch (error) {
            console.error('Error fetching content:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addQuiz = async (topicId: string, title: string, questions: any[], price: number) => {
        const quizId = crypto.randomUUID();

        // 1. Create Quiz
        const { error: quizError } = await supabase.from('quizzes').insert([{
            id: quizId,
            topic_id: topicId,
            title: title,
            duration_minutes: 30, // Default
            price: price
        }]);

        if (quizError) {
            console.error('Error creating quiz:', quizError);
            return;
        }

        // 2. Add Questions
        if (questions && questions.length > 0) {
            const formattedQuestions = questions.map(q => ({
                id: crypto.randomUUID(),
                quiz_id: quizId,
                question_text: q.questionText,
                options: q.options,
                correct_option: q.correctOption,
                marks: 4
            }));

            const { error: questionsError } = await supabase
                .from('quiz_questions')
                .insert(formattedQuestions);

            if (questionsError) {
                console.error('Error adding questions:', questionsError);
            }
        }

        await fetchData(); // Refresh content
    };

    const updateQuiz = async (quizId: string, title: string, questions: any[], price: number) => {
        // 1. Update Title and Price
        const { error: quizError } = await supabase.from('quizzes').update({
            title: title,
            price: price
        }).eq('id', quizId);

        if (quizError) {
            console.error('Error updating quiz:', quizError);
            return;
        }

        // 2. Replace Questions (Delete All + Insert New)
        // Note: This loses question history if tracking per-question analytics, but fine for now.
        await supabase.from('quiz_questions').delete().eq('quiz_id', quizId);

        if (questions && questions.length > 0) {
            const formattedQuestions = questions.map(q => ({
                id: crypto.randomUUID(),
                quiz_id: quizId,
                question_text: q.questionText,
                options: q.options,
                correct_option: q.correctOption,
                marks: 4
            }));

            await supabase.from('quiz_questions').insert(formattedQuestions);
        }

        await fetchData();
    };

    const deleteQuiz = async (quizId: string) => {
        const { error } = await supabase.from('quizzes').delete().eq('id', quizId);
        if (error) console.error('Error deleting quiz:', error);
        await fetchData();
    };

    const uploadFile = async (file: File): Promise<string | null> => {
        try {
            const fileExt = file.name.split('.').pop()?.toLowerCase();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const isPdf = fileExt === 'pdf';

            // Bucket Selection
            const bucketName = isPdf ? 'secure-materials' : 'course-materials';
            const filePath = `uploads/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading file:', uploadError);
                return null;
            }

            if (isPdf) {
                // For Secure PDF, we return the STORAGE PATH (ID), not a URL.
                // We prefix it with 'secure::' to easily identify it later if needed, 
                // or just store the path and handle it in the UI.
                // Let's store just the path "uploads/filename.pdf" which we can pass to the API.
                return filePath;
            } else {
                // Legacy / Public (Images, etc)
                const { data: { publicUrl } } = supabase.storage
                    .from(bucketName)
                    .getPublicUrl(filePath);
                return publicUrl;
            }
        } catch (error) {
            console.error('Error in uploadFile:', error);
            return null;
        }
    };

    const addSubject = async (title: string) => {
        const id = title.toLowerCase().replace(/\s+/g, '-');
        const { error } = await supabase.from('subjects').insert([{ id, title }]);
        if (error) {
            console.error('Error adding subject', error);
            return;
        }
        await fetchData();
    };

    const updateSubject = async (id: string, title: string) => {
        const { error } = await supabase.from('subjects').update({ title }).eq('id', id);
        if (error) {
            console.error('Error updating subject', error);
            return;
        }
        await fetchData();
    };

    const updateSubjectLock = async (id: string, isLocked: boolean) => {
        const { error } = await supabase.from('subjects').update({ is_locked: isLocked }).eq('id', id);
        if (error) console.error('Error updating subject lock', error);
        await fetchData();
    };

    const updateSubjectPrice = async (id: string, price: number) => {
        const { error } = await supabase.from('subjects').update({ price: price }).eq('id', id);
        if (error) console.error('Error updating subject price', error);
        await fetchData();
    };

    const deleteSubject = async (id: string) => {
        const { error } = await supabase.from('subjects').delete().eq('id', id);
        if (error) console.error(error);
        await fetchData();
    };
    // ...
    const updateChapterLock = async (chapterId: string, isLocked: boolean) => {
        const { error } = await supabase.from('chapters').update({ is_locked: isLocked }).eq('id', chapterId);
        if (error) console.error(error);
        await fetchData();
    };

    const updateChapterPrice = async (chapterId: string, price: number) => {
        const { error } = await supabase.from('chapters').update({ price: price }).eq('id', chapterId);
        if (error) console.error(error);
        await fetchData();
    };

    const reorderSubjects = async (orderedIds: string[]) => {
        // Optimistic update (optional, but good for UI)
        setSubjects(prev => {
            const sorted = [...prev].sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
            return sorted;
        });

        const updates = orderedIds.map((id, index) => ({
            id,
            order_index: index
        }));

        const { error } = await supabase.from('subjects').upsert(updates, { onConflict: 'id' });
        if (error) {
            console.error('Error reordering subjects:', error);
            await fetchData(); // Revert on error
        }
    };

    const addChapter = async (subjectId: string, title: string) => {
        const id = crypto.randomUUID();
        const { error } = await supabase.from('chapters').insert([{ id, subject_id: subjectId, title }]);
        if (error) console.error(error);
        await fetchData();
    };

    const updateChapter = async (subjectId: string, chapterId: string, title: string) => {
        const { error } = await supabase.from('chapters').update({ title }).eq('id', chapterId);
        if (error) console.error(error);
        await fetchData();
    };



    const deleteChapter = async (chapterId: string) => {
        const { error } = await supabase.from('chapters').delete().eq('id', chapterId);
        if (error) console.error(error);
        await fetchData();
    };

    const addTopic = async (subjectId: string, chapterId: string, title: string) => {
        const id = crypto.randomUUID();
        const { error } = await supabase.from('topics').insert([{ id, chapter_id: chapterId, title }]);
        if (error) console.error(error);
        await fetchData();
    };

    const updateTopic = async (subjectId: string, chapterId: string, topicId: string, title: string) => {
        const { error } = await supabase.from('topics').update({ title }).eq('id', topicId);
        if (error) console.error(error);
        await fetchData();
    };

    const deleteTopic = async (subjectId: string, chapterId: string, topicId: string) => {
        const { error } = await supabase.from('topics').delete().eq('id', topicId);
        if (error) console.error(error);
        await fetchData();
    };

    // ... (other methods unchanged)

    const addMaterial = async (subjectId: string, chapterId: string, topicId: string, material: Omit<Material, 'id'>) => {
        const id = crypto.randomUUID();
        const { error } = await supabase.from('materials').insert([{
            id,
            topic_id: topicId,
            title: material.title,
            type: material.type,
            url: material.url,
            price: material.price || 0
        }]);
        if (error) console.error(error);
        await fetchData();
    };

    const updateMaterial = async (subjectId: string, chapterId: string, topicId: string, materialId: string, updates: Partial<Material>) => {
        const { error } = await supabase.from('materials').update(updates).eq('id', materialId);
        if (error) console.error(error);
        await fetchData();
    };

    const deleteMaterial = async (subjectId: string, chapterId: string, topicId: string, materialId: string) => {
        const { error } = await supabase.from('materials').delete().eq('id', materialId);
        if (error) console.error(error);
        await fetchData();
    };


    const getChaptersBySubject = (subjectId: string) => {
        return chapters.filter(c => c.subjectId === subjectId);
    };

    const getChapterById = (subjectId: string, chapterId: string) => {
        return chapters.find(c => c.subjectId === subjectId && c.id === chapterId);
    };

    return (
        <ContentContext.Provider value={{
            chapters,
            subjects,
            quizzes,
            userProgress,
            toggleProgress,
            addQuiz,
            updateQuiz,
            deleteQuiz,
            addSubject,
            updateSubject,
            updateSubjectLock,
            updateSubjectPrice,
            deleteSubject,
            reorderSubjects,
            addChapter,
            updateChapter,
            updateChapterLock,
            updateChapterPrice,
            deleteChapter,
            addTopic,
            updateTopic,
            deleteTopic,
            addMaterial,
            updateMaterial,
            deleteMaterial,
            uploadFile,
            getChaptersBySubject,
            getChapterById,
            isLoading,
            // New Entitlement Logic
            enrolledTargetIds,
            hasAccess,
            refreshEnrollments,
            mergeEnrollments: (ids: string[]) => {
                setEnrolledTargetIds(prev => [...prev, ...ids]);
            }
        }}>
            {children}
        </ContentContext.Provider>
    );
};

export const useContent = () => {
    const context = useContext(ContentContext);
    if (context === undefined) {
        throw new Error('useContent must be used within a ContentProvider');
    }
    return context;
};

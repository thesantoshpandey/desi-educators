'use client';

import React, { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Button, Card } from '@/components/ui';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Question {
    id: string;
    question_text: string;
    options: string[];
    correct_option: number;
    marks: number;
}

export default function QuizResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
    const { attemptId } = use(params);
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [attempt, setAttempt] = useState<any>(null);
    const [quiz, setQuiz] = useState<any>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user && attemptId) {
            fetchResult();
        }
    }, [user, attemptId, authLoading]);

    const fetchResult = async () => {
        try {
            // 1. Fetch Attempt
            const { data: attemptData, error: attemptError } = await supabase
                .from('quiz_attempts')
                .select('*')
                .eq('id', attemptId)
                .single();

            if (attemptError) throw attemptError;
            setAttempt(attemptData);

            // 2. Fetch Quiz Details
            const { data: quizData, error: quizError } = await supabase
                .from('quizzes')
                .select('*')
                .eq('id', attemptData.quiz_id)
                .single();

            if (quizError) throw quizError;
            setQuiz(quizData);

            // 3. Fetch Questions
            const { data: questionsData, error: questionsError } = await supabase
                .from('quiz_questions')
                .select('*')
                .eq('quiz_id', attemptData.quiz_id);

            if (questionsError) throw questionsError;
            setQuestions(questionsData || []);

        } catch (error) {
            console.error('Error fetching result:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading Result...</div>;
    if (!attempt || !quiz) return <div style={{ padding: '40px', textAlign: 'center' }}>Result not found</div>;

    const selectedAnswers = attempt.answers || {};

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div style={{ marginBottom: '24px' }}>
                <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#64748b' }}>
                    <ArrowLeft size={20} /> Back to Dashboard
                </Link>
            </div>

            <Card style={{ marginBottom: '24px', padding: '32px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '8px', color: '#64748b' }}>Result: {quiz.title}</h1>
                <p style={{ fontSize: '1rem', color: '#94a3b8', marginBottom: '16px' }}>
                    Taken on {new Date(attempt.completed_at).toLocaleDateString()}
                </p>
                <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary-color)', lineHeight: 1 }}>
                    {attempt.score} <span style={{ fontSize: '1.5rem', color: '#94a3b8' }}>/ {attempt.total_marks}</span>
                </div>
                <div style={{ marginTop: '16px', fontSize: '1.2rem', fontWeight: 600, color: attempt.percentage >= 80 ? '#16a34a' : attempt.percentage >= 50 ? '#ca8a04' : '#DC2626' }}>
                    {Math.round(attempt.percentage)}%
                </div>
            </Card>

            <h3 style={{ textAlign: 'left', marginBottom: '16px' }}>Detailed Analysis</h3>

            {questions.map((q, index) => {
                const userAnswer = selectedAnswers[q.id];
                const isCorrect = userAnswer === q.correct_option;
                const isSkipped = userAnswer === undefined;

                return (
                    <Card key={q.id} style={{ marginBottom: '16px', textAlign: 'left', borderLeft: isSkipped ? '4px solid #cbd5e1' : isCorrect ? '4px solid #16a34a' : '4px solid #ef4444' }}>
                        <p style={{ fontWeight: 600, marginBottom: '12px' }}>Q{index + 1}. {q.question_text}</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {q.options.map((opt, i) => (
                                <div key={i} style={{
                                    padding: '8px 12px', borderRadius: '6px',
                                    backgroundColor:
                                        i === q.correct_option ? '#f0fdf4' : // Correct: Green
                                            (i === userAnswer && !isCorrect) ? '#fef2f2' : '#f8fafc', // Wrong: Red
                                    color:
                                        i === q.correct_option ? '#15803d' : // Correct: Green Text
                                            (i === userAnswer && !isCorrect) ? '#b91c1c' : 'inherit', // Wrong: Red Text
                                    border:
                                        i === q.correct_option ? '1px solid #bbf7d0' :
                                            (i === userAnswer && !isCorrect) ? '1px solid #fecaca' : '1px solid transparent',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <span>{opt}</span>
                                    {i === q.correct_option && <CheckCircle size={18} color="#15803d" />}
                                    {i === userAnswer && !isCorrect && <XCircle size={18} color="#b91c1c" />}
                                </div>
                            ))}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}

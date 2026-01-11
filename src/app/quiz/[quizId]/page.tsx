'use client';

import React, { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { Button, Card } from '@/components/ui';
import { ArrowLeft, CheckCircle, XCircle, Timer, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PaymentModal } from '@/components/ui/PaymentModal/PaymentModal';
import { WatermarkOverlay } from '@/components/ui/WatermarkOverlay/WatermarkOverlay';

interface Question {
    id: string;
    question_text: string;
    options: string[]; // Array of 4 options
    correct_option: number; // 0-3
    marks: number;
}

interface Quiz {
    id: string;
    title: string;
    duration_minutes: number;
    topic_id?: string;
    price?: number;
}

export default function QuizPage({ params }: { params: Promise<{ quizId: string }> }) {
    const { quizId } = use(params);
    const router = useRouter();
    const { user, isLoading: authLoading } = useAuth();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasAccess, setHasAccess] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);

    // Quiz State
    const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push(`/login?next=/quiz/${quizId}`);
        }
    }, [user, authLoading, router, quizId]);

    useEffect(() => {
        if (user) {
            fetchQuiz();
        }
    }, [quizId, user]);

    const fetchQuiz = async () => {
        try {
            // Secure Server Fetch
            const response = await fetch(`/api/quiz/${quizId}/start`, {
                method: 'POST',
            });

            if (response.status === 403) {
                // Payment Required - fetch just quiz metadata locally to show payment card
                const { data: quizData } = await supabase
                    .from('quizzes')
                    .select('*')
                    .eq('id', quizId)
                    .single();
                if (quizData) setQuiz(quizData);
                setHasAccess(false);
                setLoading(false);
                return;
            }

            if (!response.ok) {
                console.error('Failed to start quiz');
                setLoading(false);
                return;
            }

            const data = await response.json();
            setQuiz(data.quiz);
            setQuestions(data.questions);
            setHasAccess(true);
            setTimeLeft(data.quiz.duration_minutes * 60);
            setLoading(false);

        } catch (error) {
            console.error('Error fetching quiz:', error);
            setLoading(false);
        }
    };

    // Timer Effect
    useEffect(() => {
        if (!loading && hasAccess && !isSubmitted && timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [loading, hasAccess, isSubmitted, timeLeft]);

    const handleOptionSelect = (questionId: string, optionIndex: number) => {
        if (isSubmitted) return;
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: optionIndex
        }));
    };

    const handleSubmit = async () => {
        let calculatedScore = 0;
        let correctCount = 0;

        questions.forEach(q => {
            if (selectedAnswers[q.id] === q.correct_option) {
                calculatedScore += q.marks;
                correctCount++;
            } else if (selectedAnswers[q.id] !== undefined) {
                calculatedScore -= 1; // Negative marking? Assumed standard
            }
        });

        setScore(calculatedScore);
        setIsSubmitted(true);

        // Save Attempt
        if (user && quiz) {
            await supabase.from('quiz_attempts').insert({
                user_id: user.id,
                quiz_id: quiz.id,
                score: calculatedScore,
                total_marks: questions.length * 4,
                correct_answers: correctCount,
                wrong_answers: Object.keys(selectedAnswers).length - correctCount,
                unanswered: questions.length - Object.keys(selectedAnswers).length
            });
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="p-8 text-center">Loading secure quiz...</div>;

    if (!hasAccess && quiz) {
        return (
            <div className="p-8 flex flex-col items-center justify-center">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
                <p className="mb-6 text-gray-600">You need to unlock this quiz to rely attempt it.</p>
                <Button onClick={() => setShowPaymentModal(true)}>
                    Unlock for ₹{quiz.price}
                </Button>

                <PaymentModal
                    isOpen={showPaymentModal}
                    onClose={() => setShowPaymentModal(false)}
                    amount={quiz.price || 0}
                    planName={quiz.title}
                    onSuccess={() => {
                        setShowPaymentModal(false);
                        fetchQuiz();
                    }}
                    items={[{ id: quiz.id, title: quiz.title, itemType: 'quiz' }]}
                />
            </div>
        );
    }

    if (!quiz || questions.length === 0) return <div className="p-8 text-center">Quiz not found or empty.</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            {user && hasAccess && !isSubmitted && (
                <WatermarkOverlay
                    text={user.email || 'User'}
                    subtext={user.id?.slice(0, 8)}
                />
            )}

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">{quiz.title}</h1>
                    <p className="text-gray-500 text-sm">Question {activeQuestionIndex + 1} of {questions.length}</p>
                </div>
                {!isSubmitted && (
                    <div className="flex items-center gap-2 text-xl font-mono font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                        <Timer size={24} />
                        {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            {isSubmitted ? (
                <Card className="p-8 text-center">
                    <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
                    <h2 className="text-3xl font-bold mb-2">Quiz Submitted!</h2>
                    <p className="text-gray-600 mb-6">Your Score: <span className="text-blue-600 font-bold">{score}</span> / {questions.length * 4}</p>

                    <div className="flex justify-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="outline">Back to Dashboard</Button>
                        </Link>
                        <Button onClick={() => window.location.reload()}>Retake Quiz</Button>
                    </div>
                </Card>
            ) : (
                <Card className="p-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-medium mb-4">
                            {activeQuestionIndex + 1}. {questions[activeQuestionIndex].question_text}
                        </h3>

                        <div className="space-y-3">
                            {questions[activeQuestionIndex].options.map((option, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => handleOptionSelect(questions[activeQuestionIndex].id, idx)}
                                    className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedAnswers[questions[activeQuestionIndex].id] === idxOrigin
                                            ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                            : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${selectedAnswers[questions[activeQuestionIndex].id] === idx
                                                ? 'border-blue-600 bg-blue-600 text-white'
                                                : 'border-gray-300'
                                            }`}>
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span>{option}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between mt-8 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => setActiveQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={activeQuestionIndex === 0}
                        >
                            Previous
                        </Button>

                        {activeQuestionIndex === questions.length - 1 ? (
                            <Button
                                onClick={handleSubmit}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                Submit Quiz
                            </Button>
                        ) : (
                            <Button
                                onClick={() => setActiveQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                            >
                                Next
                            </Button>
                        )}
                    </div>
                </Card>
            )}
        </div>
    );
}

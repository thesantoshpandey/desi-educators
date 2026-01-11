
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin client for fetching data (bypassing RLS if needed, though we should check auth)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ quizId: string }> }
) {
    const { quizId } = await params;

    // 1. Auth Check (Standard Client)
    const supabaseUserClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return req.cookies.getAll() },
            },
        }
    );

    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

    if (authError || !user) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    // 2. Quiz Metadata & Access Check
    const { data: quiz, error: quizError } = await supabaseAdmin
        .from('quizzes')
        .select('*')
        .eq('id', quizId)
        .single();

    if (quizError || !quiz) {
        return new NextResponse('Quiz not found', { status: 404 });
    }

    // Check Enrollment if Price > 0
    if (quiz.price > 0) {
        const { data: enrollments } = await supabaseAdmin
            .from('enrollments')
            .select('*')
            .eq('user_id', user.id)
            .eq('course_id', quizId); // Assuming direct quiz enrollment or bundle logic handled elsewhere

        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        const hasAccess = (enrollments && enrollments.length > 0) || profile?.role === 'admin';

        if (!hasAccess) {
            return new NextResponse('Payment Required', { status: 403 });
        }
    }

    // 3. Fetch Questions
    const { data: questions, error: qError } = await supabaseAdmin
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', quizId);

    if (qError) {
        return new NextResponse('Error fetching questions', { status: 500 });
    }

    if (!questions || questions.length === 0) {
        return NextResponse.json({ quiz, questions: [] });
    }

    // 4. Randomization Logic
    // Shuffle Questions
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);

    // Shuffle Options per Question
    const formattedQuestions = shuffledQuestions.map(q => {
        // q.options is array of strings
        // q.correct_option is index (0-3)

        const originalOptions = q.options;
        const correctOptionValue = originalOptions[q.correct_option];

        // Create array of objects to shuffle info
        const optionObjects = originalOptions.map((opt: string, index: number) => ({
            text: opt,
            isCorrect: index === q.correct_option
        }));

        // Shuffle options
        const shuffledOptionsObj = optionObjects.sort(() => Math.random() - 0.5);

        // Reconstruct
        const newOptions = shuffledOptionsObj.map((o: any) => o.text);
        const newCorrectIndex = shuffledOptionsObj.findIndex((o: any) => o.isCorrect);

        return {
            ...q,
            options: newOptions,
            correct_option: newCorrectIndex
        };
    });

    return NextResponse.json({
        quiz,
        questions: formattedQuestions
    });
}

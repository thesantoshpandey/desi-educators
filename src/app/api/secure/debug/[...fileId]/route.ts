
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ fileId: string[] }> }
) {
    const { fileId: fileIdArray } = await params;
    const fileId = fileIdArray.join('/');

    const supabaseUserClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return req.cookies.getAll() },
                setAll(cookiesToSet) { }
            },
        }
    );

    const { data: { user }, error: authError } = await supabaseUserClient.auth.getUser();

    const debugInfo: any = {
        fileId,
        isAuthenticated: !!user,
        userEmail: user?.email || 'N/A',
        userId: user?.id || 'N/A',
        authError: authError?.message || null,
        enrollmentCheck: {},
    };

    if (!user) {
        return NextResponse.json(debugInfo);
    }

    try {
        const fileName = fileIdArray[fileIdArray.length - 1];

        const { data: material } = await supabaseUserClient
            .from('materials')
            .select('topic_id, url')
            .ilike('url', `%${fileName}`)
            .single();

        debugInfo.enrollmentCheck.materialFound = !!material;
        debugInfo.enrollmentCheck.materialUrl = material?.url;

        if (material) {
            const { data: topic } = await supabaseUserClient.from('topics').select('chapter_id').eq('id', material.topic_id).single();
            const chapterId = topic?.chapter_id;

            const { data: chapter } = await supabaseUserClient.from('chapters').select('subject_id').eq('id', chapterId).single();
            const subjectId = chapter?.subject_id;

            debugInfo.enrollmentCheck.hierarchy = { subjectId, chapterId, topicId: material.topic_id };

            const { data: enrollments } = await supabaseUserClient
                .from('enrollments')
                .select('target_id')
                .eq('user_id', user.id);

            const enrolledIds = enrollments?.map(e => e.target_id) || [];
            debugInfo.enrollmentCheck.enrolledIds = enrolledIds;

            const hasAccess = enrolledIds.includes('full_bundle') ||
                enrolledIds.includes(subjectId) ||
                enrolledIds.includes(chapterId) ||
                (user.user_metadata?.role === 'admin');

            debugInfo.enrollmentCheck.hasAccess = hasAccess;
        }

    } catch (err: any) {
        debugInfo.error = err.message;
    }

    return NextResponse.json(debugInfo);
}

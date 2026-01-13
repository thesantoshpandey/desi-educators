import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
    try {
        // 1. Verify User Session & Role
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() { return cookieStore.getAll(); },
                    setAll(cookiesToSet) {
                        // API routes usually don't set cookies, but satisfying TS
                    },
                },
            }
        );

        const authHeader = req.headers.get('Authorization');
        const token = authHeader?.replace('Bearer ', '');

        let user;
        let authError;

        if (token) {
            // Validate via Header Token
            const { data, error } = await supabase.auth.getUser(token);
            user = data.user;
            authError = error;
        } else {
            // Validate via Cookies (Fallback)
            const { data, error } = await supabase.auth.getUser();
            user = data.user;
            authError = error;
        }

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized: No active session' }, { status: 401 });
        }

        // Check Admin Role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (!profile || profile.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        // 2. Generate Signed Upload URL
        const body = await req.json();
        const { filename, bucket, contentType } = body;

        if (!filename || !bucket) {
            return NextResponse.json({ error: 'Missing filename or bucket' }, { status: 400 });
        }

        // Generate Path
        const fileExt = filename.split('.').pop()?.toLowerCase() || 'bin';
        const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `uploads/${uniqueName}`;

        // Create Signed Upload URL
        const { data, error: signError } = await supabaseAdmin
            .storage
            .from(bucket)
            .createSignedUploadUrl(filePath);

        if (signError) {
            console.error('Signed URL Error:', signError);
            return NextResponse.json({ error: signError.message }, { status: 500 });
        }

        // Return the token/url for client-side upload
        // Note: data.signedUrl is the full URL, but client 'uploadToSignedUrl' needs parameters usually.
        // Actually, Supabase JS client 'uploadToSignedUrl' takes (path, token, file)

        let publicUrl = '';
        if (bucket !== 'secure-materials') {
            const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
            publicUrl = urlData.publicUrl;
        }

        return NextResponse.json({
            path: filePath,
            token: data.token,
            signedUrl: data.signedUrl, // For validation if needed
            publicUrl: publicUrl
        });

    } catch (error: any) {
        console.error('Upload API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

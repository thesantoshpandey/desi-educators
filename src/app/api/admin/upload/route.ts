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

        const { data: { user }, error: authError } = await supabase.auth.getUser();

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

        // 2. Process Upload
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const bucket = formData.get('bucket') as string;
        // Optional path prefix, otherwise we generate one
        const pathPrefix = formData.get('pathPrefix') as string || 'uploads';

        if (!file || !bucket) {
            return NextResponse.json({ error: 'Missing file or bucket' }, { status: 400 });
        }

        // Generate Secure Path
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${pathPrefix}/${fileName}`;

        // Convert File to ArrayBuffer -> Buffer (for Node environment)
        // Note: Supabase JS upload accepts ArrayBuffer/Blob in some environments, but Buffer is safe here.
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload using Service Role (Bypassing RLS)
        const { data, error: uploadError } = await supabaseAdmin
            .storage
            .from(bucket)
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: false
            });

        if (uploadError) {
            console.error('Supabase Storage Error:', uploadError);
            return NextResponse.json({ error: uploadError.message }, { status: 500 });
        }

        // 3. Return Result
        let publicUrl = '';
        if (bucket !== 'secure-materials') {
            const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
            publicUrl = urlData.publicUrl;
        }

        return NextResponse.json({
            message: 'Upload successful',
            path: filePath,
            publicUrl: publicUrl || null
        });

    } catch (error: any) {
        console.error('Upload API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    try {
        // 1. Verify User from Authorization Header (Standard Client Token)
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Initialize standard client to verify token
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        // 2. Initialize Admin Client to Bypass RLS
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 3. Fetch Enrollments for THIS user
        const { data, error } = await supabaseAdmin
            .from('enrollments')
            .select('target_id')
            .eq('user_id', user.id);

        if (error) {
            console.error('Proxy Enrollments Error:', error);
            return NextResponse.json({ error: 'Database Error' }, { status: 500 });
        }

        // Return just the array of IDs for simplicity/bandwidth
        const ids = data.map(d => d.target_id);
        return NextResponse.json({ ids });

    } catch (error: any) {
        console.error('Proxy Enrollments Exception:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

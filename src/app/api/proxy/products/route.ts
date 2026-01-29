import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
    // 1. Initialize Supabase Admin with Service Role Key
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    try {
        // 2. Fetch All Products (Public Data)
        // We use admin client just to be safe against RLS, though products theoretically should be public.
        const { data, error } = await supabaseAdmin
            .from('products')
            .select('id, target_ids, type');

        if (error) {
            console.error('Proxy Products Error:', error);
            return NextResponse.json({ error: 'Database Error' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Proxy Products Exception:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

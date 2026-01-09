import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        if (!supabaseServiceKey) {
            return NextResponse.json({ error: 'Missing SUPABASE_SERVICE_ROLE_KEY' }, { status: 500 });
        }

        const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Test Order Insert
        const { data: orderData, error: orderError } = await adminSupabase.from('orders').insert({
            user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
            amount: '100',
            status: 'Test',
            id: 'test_order_' + Date.now(),
            plan_name: 'Test Plan'
        }).select();

        // 2. Test Enrollment Insert
        const { data: enrollData, error: enrollError } = await adminSupabase.from('enrollments').insert({
            user_id: '00000000-0000-0000-0000-000000000000',
            target_id: 'test_target',
            target_type: 'test'
        }).select();

        return NextResponse.json({
            status: 'Run Completed',
            orderResult: orderError ? { error: orderError } : { success: true, data: orderData },
            enrollmentResult: enrollError ? { error: enrollError } : { success: true, data: enrollData }
        });

    } catch (error: any) {
        return NextResponse.json({
            message: 'Critical Failure',
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

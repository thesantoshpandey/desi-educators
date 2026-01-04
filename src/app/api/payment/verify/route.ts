import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        // Initialize Admin Client lazily
        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
            process.env.SUPABASE_SERVICE_ROLE_KEY || 'fallback_key_for_build_only'
        );

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            user_id,
            items,
            amount
        } = await request.json();

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || '')
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // 1. Update Order in Database
            // We use adminSupabase to ensure we can write to tables regardless of RLS policies.

            // A. Record Transaction
            const { error: orderError } = await adminSupabase.from('orders').insert({
                user_id,
                amount,
                status: 'Success',
                plan_name: items?.map((i: any) => i.title).join(', ') || 'Bundle',
                payment_id: razorpay_payment_id,
                // provider_order_id: razorpay_order_id
            });

            if (orderError) {
                console.error('Error recording order:', orderError);
                // We don't fail the request because payment was successful, just log error.
            }

            // B. Grant Access (Enrollments)
            if (items && Array.isArray(items)) {
                const enrollmentPromises = items.map((item: any) =>
                    adminSupabase.from('enrollments').insert({
                        user_id,
                        item_id: item.id,
                        course_id: item.id, // Explicitly set course_id for QuizPage compatibility
                        item_type: item.itemType || 'material',
                        access_type: 'lifetime'
                    })
                );
                await Promise.all(enrollmentPromises);
            }

            return NextResponse.json({
                message: "success",
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
            });
        } else {
            return NextResponse.json(
                { message: "Invalid signature" },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}

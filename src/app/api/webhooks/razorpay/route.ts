import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Use Service Role for Admin Actions (writing to orders/enrollments without RLS constraints)
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
    try {
        const signature = request.headers.get('x-razorpay-signature');
        const body = await request.text(); // Read raw body for signature verification

        // 1. Verify Signature
        // STRICT SECURITY: Use only the independent webhook secret, no fallback.
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!secret) {
            console.error('CRITICAL: RAZORPAY_WEBHOOK_SECRET is not set in environment.');
            return NextResponse.json({ error: 'Webhook Configuration Error' }, { status: 500 });
        }

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body)
            .digest('hex');

        if (expectedSignature !== signature) {
            console.warn('Invalid Razorpay Webhook Signature', { signature, expectedSignature });
            return NextResponse.json({ error: 'Invalid Signature' }, { status: 400 });
        }

        const event = JSON.parse(body);
        const { payload } = event;

        console.log(`Processing Razorpay Webhook Event: ${event.event}`);

        if (event.event === 'order.paid' || event.event === 'payment.captured') {
            const payment = payload.payment.entity;
            const orderId = payment.order_id;
            const paymentId = payment.id;
            const amount = payment.amount / 100; // Convert to main unit
            const email = payment.email;
            const contact = payment.contact;

            // Ideally, pass user_id in notes when creating order. 
            // If not found in notes, we try to match by email (fallback).
            const notes = payment.notes || {};
            let userId = notes.user_id;

            if (!userId) {
                // FLAKY FALLBACK: Try to find user by email if user_id wasn't in notes
                const { data: userByEmail } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('email', email)
                    .single();

                if (userByEmail) {
                    userId = userByEmail.id;
                } else {
                    console.error(`Could not find user for payment ${paymentId} (Email: ${email})`);
                    // We consume the event but log error to manual investigation
                    return NextResponse.json({ status: 'ignored_no_user' });
                }
            }

            // 2. Check if Order already exists (Idempotency)
            const { data: existingOrder } = await supabaseAdmin
                .from('orders')
                .select('id')
                .eq('payment_id', paymentId)
                .single();

            if (existingOrder) {
                console.log(`Order ${paymentId} already processed.`);
                return NextResponse.json({ status: 'ok_already_exists' });
            }

            // 3. Insert Order
            const { error: insertError } = await supabaseAdmin
                .from('orders')
                .insert({
                    user_id: userId,
                    amount: amount,
                    status: 'Success',
                    plan_name: 'Webhook Purchase', // Should Ideally come from notes or lookup
                    payment_id: paymentId,
                    provider_order_id: orderId,
                    created_at: new Date().toISOString()
                });

            if (insertError) {
                console.error('Failed to insert order via webhook', insertError);
                return NextResponse.json({ error: 'Database Error' }, { status: 500 });
            }

            // 4. Enroll User (Logic similar to /verify route)
            // If we had course_ids in notes, we could enroll specific courses. 
            // For now, if we don't have item info, we might just log success.
            // PRO TIP: Update your /create-order to send course_id in notes!
            if (notes.course_ids) {
                const courseIds = notes.course_ids.split(',');
                const enrollments = courseIds.map((cid: string) => ({
                    user_id: userId,
                    course_id: cid,
                    item_id: cid,
                    item_type: 'course', // simplified
                    access_type: 'lifetime'
                }));

                const { error: enrollError } = await supabaseAdmin
                    .from('enrollments')
                    .insert(enrollments);

                if (enrollError) console.error('Enrollment failed in webhook', enrollError);
            }

            return NextResponse.json({ status: 'ok' });
        }

        return NextResponse.json({ status: 'ignored_event_type' });

    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

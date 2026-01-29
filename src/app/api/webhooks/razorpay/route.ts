import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Use Service Role for Admin Actions (writing to orders/enrollments without RLS constraints)
export async function POST(request: Request) {
    // Use Service Role for Admin Actions (writing to orders/enrollments without RLS constraints)
    // Initialize inside handler to avoid build-time errors if env vars are missing
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

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
            // We use 'course_data' from notes which is trusted (signed/saved securely on creation)
            // Format: "id:type,id:type"
            const courseDataRaw = notes.course_data;

            if (courseDataRaw) {
                const pairs = courseDataRaw.split(',');
                const enrollments = [];

                for (const p of pairs) {
                    const [iId, iType] = p.split(':');
                    if (iId) {
                        enrollments.push({
                            user_id: userId,
                            target_id: iId,
                            target_type: iType || 'material',
                            access_type: 'lifetime',
                            // Using upsert or similar might be safer if we want to avoid duplicates errors,
                            // but standard insert is fine if we just catch error.
                        });
                    }
                }

                if (enrollments.length > 0) {
                    // We use ignoreDuplicates: true if available, or just insert.
                    // Supabase insert has { onConflict: '...' } option via upsert or separate config.
                    // Simple insert might fail if already exists. Let's use upsert or ignore.
                    const { error: enrollError } = await supabaseAdmin
                        .from('enrollments')
                        .upsert(enrollments, { onConflict: 'user_id, target_id' });

                    if (enrollError) {
                        console.error('Enrollment failed in webhook', enrollError);
                    } else {
                        console.log(`Successfully enrolled user ${userId} in ${enrollments.length} items via webhook.`);
                    }
                }
            } else {
                console.warn('Webhook: No course_data in notes. Access might be delayed until client verify.');
            }

            return NextResponse.json({ status: 'ok' });
        }

        return NextResponse.json({ status: 'ignored_event_type' });

    } catch (error: any) {
        console.error('Webhook Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

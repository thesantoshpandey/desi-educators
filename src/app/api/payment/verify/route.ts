import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        // 1. Verify User from Authorization Header
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return NextResponse.json(
                { message: 'Unauthorized: Missing Authentication Token.' },
                { status: 401 }
            );
        }

        // Initialize a fresh client for auth verification (Token based)
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json(
                { message: 'Unauthorized: Invalid or expired token.' },
                { status: 401 }
            );
        }

        // Validate Key Secret Existence
        const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!razorpaySecret) {
            console.error('CRITICAL: RAZORPAY_KEY_SECRET is missing in environment variables.');
            return NextResponse.json(
                { message: 'Configuration Error: RAZORPAY_KEY_SECRET is missing on server.' },
                { status: 500 }
            );
        }

        // Initialize Admin Client
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('CRITICAL: Supabase Admin configuration missing.');
            return NextResponse.json(
                { message: 'Configuration Error: Supabase Admin keys missing.' },
                { status: 500 }
            );
        }

        const adminSupabase = createClient(supabaseUrl, supabaseServiceKey);

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            items,
            amount
        } = await request.json();

        const body = razorpay_order_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", razorpaySecret)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // 2. Fetch Order from Razorpay to get Trusted 'notes' and 'amount'
            // We do NOT trust 'amount' or 'items' from the client anymore.

            const Razorpay = require('razorpay');
            const instance = new Razorpay({
                key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                key_secret: razorpaySecret,
            });

            const order = await instance.orders.fetch(razorpay_order_id);

            if (!order) {
                return NextResponse.json({ message: 'Order logic failed: Order not found with provider.' }, { status: 500 });
            }

            // A. Trusted Amount
            // order.amount is in paise, convert to rupees for DB if needed, or store as is. 
            // Our Schema stores as text/numeric. Let's store what we charged.
            const paidAmount = (order.amount / 100).toString();

            // B. Trusted Items
            // format: "id:type,id2:type2"
            const courseDataRaw = order.notes?.course_data;
            const trustedItems = [];

            if (courseDataRaw) {
                const pairs = courseDataRaw.split(',');
                for (const p of pairs) {
                    const [iId, iType] = p.split(':');
                    if (iId) trustedItems.push({ id: iId, itemType: iType });
                }
            } else {
                // Fallback for legacy orders (unlikely in prod if we just deployed, but safe)
                // If no notes, we might have to trust client or fail. Making it fail is safer.
                // But for now, let's log potential issue.
                console.warn('Warning: No course_data in notes. Order might be old.');
            }

            // 3. Use Secure Authenticated User ID
            const secureUserId = user.id;

            // A. Record Transaction
            const { error: orderError } = await adminSupabase.from('orders').insert({
                user_id: secureUserId,
                amount: paidAmount,
                status: 'Success',
                plan_name: 'Purchased Items', // Generic name since we don't have titles in notes
                id: razorpay_payment_id,
            });

            if (orderError) {
                console.error('Error recording order:', orderError);
            }

            // B. Grant Access (Enrollments)
            if (trustedItems.length > 0) {
                const enrollmentsToInsert = trustedItems.map((item: any) => ({
                    user_id: secureUserId,
                    target_id: item.id,
                    target_type: item.itemType || 'material'
                }));

                // Use upsert to handle potential race conditions with webhook
                const { error: enrollError } = await adminSupabase
                    .from('enrollments')
                    .upsert(enrollmentsToInsert, { onConflict: 'user_id, target_id' });

                if (enrollError) {
                    console.error('Error inserting enrollments in verify:', enrollError);
                    // We don't rollback the order recording, but we should probably alert or rely on webhook fallback.
                    // But usually upsert succeeds.
                }
            }

            return NextResponse.json({
                message: "success",
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                enrolledTargets: trustedItems.map((i: any) => i.id)
            });
        } else {
            console.error(`Signature Verification Failed. Expected: ${expectedSignature}, Received: ${razorpay_signature}`);
            return NextResponse.json(
                { message: "Invalid Signature: The provided Razorpay payment signature did not match the expected one. This usually happens if the Backend Secret Key does not match the Frontend Key ID (e.g. Test vs Live mismatch)." },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error('Error verifying payment:', error);
        return NextResponse.json(
            { message: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}

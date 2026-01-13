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
            // 2. Use Secure Authenticated User ID
            const secureUserId = user.id;

            // A. Record Transaction
            // A. Record Transaction
            const { error: orderError } = await adminSupabase.from('orders').insert({
                user_id: secureUserId,
                amount: (amount || 0).toString(), // Ensure string, handle missing amount safely
                status: 'Success',
                plan_name: items?.map((i: any) => i.title).join(', ') || 'Bundle',
                id: razorpay_payment_id, // Map payment_id to 'id' column as per schema
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
                        user_id: secureUserId,
                        target_id: item.id,
                        target_type: item.itemType || 'material'
                    })
                );
                await Promise.all(enrollmentPromises);
            }

            return NextResponse.json({
                message: "success",
                orderId: razorpay_order_id,
                paymentId: razorpay_payment_id,
                enrolledTargets: items?.map((i: any) => i.id) || [] // Return the IDs we just unlocked
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

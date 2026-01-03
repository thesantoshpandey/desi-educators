import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase'; // Using the client-side lib for simplicity, but ideally should use a Service Role client for Admin writes

// IMPORTANT: For production, ensure you use a Service Role Client to bypass RLS when updating Orders/Enrollments
// const adminSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(request: Request) {
    try {
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
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // 1. Update Order in Database (or Create if not pending logic handled on client)
            // Let's create the final success record here to be safe and authoritative.

            // NOTE: Ideally we should use a Service Role client here to ensure we can write to tables 
            // regardless of user permission (though RLS v3 allows insert for authenticated).
            // For now, we assume the API is called by the client but we will perform the database operations here.

            /*
               Schema Assumption:
               orders: { id, user_id, amount, status, payment_id, provider_order_id, created_at }
               enrollments: { user_id, item_id, item_type, access_granted_at }
            */

            // A. Record Transaction
            const { error: orderError } = await supabase.from('orders').insert({
                user_id,
                amount,
                status: 'Success',
                plan_name: items?.map((i: any) => i.title).join(', ') || 'Bundle',
                payment_id: razorpay_payment_id,
                // If you added 'provider_order_id' to schema, add: provider_order_id: razorpay_order_id
            });

            if (orderError) {
                console.error('Error recording order:', orderError);
                // We don't fail the request because payment was successful, just log validation error.
            }

            // B. Grant Access (Enrollments)
            if (items && Array.isArray(items)) {
                const enrollmentPromises = items.map((item: any) =>
                    supabase.from('enrollments').insert({
                        user_id,
                        item_id: item.id,
                        item_type: item.itemType || 'material', // fallback
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

import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';

// Helper to calculate total price server-side
async function calculateTotal(supabase: any, items: any[], couponCode?: string): Promise<number> {
    let total = 0;

    for (const item of items) {
        let price = 0;
        const { id, type } = item;

        // 1. Try Products Table (Primary Source)
        const { data: product } = await supabase.from('products').select('price').eq('id', id).single();
        if (product) {
            price = product.price;
        } else {
            // 2. Fallback to specific tables
            if (type === 'subject') {
                const { data } = await supabase.from('subjects').select('price').eq('id', id).single();
                price = data?.price || 0;
            } else if (type === 'chapter') {
                const { data } = await supabase.from('chapters').select('price').eq('id', id).single();
                price = data?.price || 0;
            } else if (type === 'test-series' || type === 'quiz') { // 'test-series' might be product, 'quiz' table
                const { data } = await supabase.from('quizzes').select('price').eq('id', id).single();
                price = data?.price || 0;
            }
            // Add logic for materials if they are sold individually
            else if (type === 'material') {
                const { data } = await supabase.from('materials').select('price').eq('id', id).single();
                price = data?.price || 0;
            }
        }
        total += price;
    }

    // 3. Apply Coupon
    if (couponCode) {
        const { data: coupon } = await supabase
            .from('coupons')
            .select('*')
            .eq('code', couponCode.toUpperCase())
            .eq('active', true)
            .single();

        if (coupon) {
            if (coupon.type === 'percent') {
                total = total - Math.floor((total * coupon.discount) / 100);
            } else {
                total = total - coupon.discount;
            }
        }
    }

    return Math.max(0, total);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items, couponCode, currency } = body;

        // 1. Verify User from Authorization Header
        const authHeader = request.headers.get('Authorization');
        const token = authHeader?.split(' ')[1];

        if (!token) {
            return NextResponse.json({ details: 'Unauthorized: Missing Authentication Token.' }, { status: 401 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ details: 'Unauthorized: Please log in to make a purchase.' }, { status: 401 });
        }

        // 2. SERVER-SIDE PRICE CALCULATION (Security Fix)
        // We IGNORE body.amount and calculate it ourselves.
        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ details: 'Invalid Request: No items to purchase.' }, { status: 400 });
        }

        // Use Supabase Admin for reading prices (in case RLS blocks reading price columns? unlikely but safe)
        // Actually, public client is fine for prices usually, but let's stick to the client we used for auth 
        // OR better, create a client that can definitely read prices. 
        // Using the same client as user is fine if prices are public.

        const calculatedAmount = await calculateTotal(supabase, items, couponCode);

        // 3. Configuration Check
        const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            return NextResponse.json({ details: 'Configuration Error: Razorpay Keys missing.' }, { status: 500 });
        }

        const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

        const options = {
            amount: calculatedAmount * 100, // Paise
            currency: currency || 'INR',
            receipt: `receipt_${Date.now()}`,
            notes: {
                user_id: user.id,
                // Store course payload for webhook fulfillment
                course_ids: items.map((i: any) => i.id).join(','),
                coupon_used: couponCode || ''
            }
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount, // Return the verified amount so frontend knows context
        });

    } catch (error: any) {
        console.error('Razorpay API Error:', error);
        return NextResponse.json({
            error: 'Error creating order',
            details: error.message || 'Unknown Error'
        }, { status: 500 });
    }
}

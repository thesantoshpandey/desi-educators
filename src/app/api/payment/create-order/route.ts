import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
    try {
        const { amount, currency } = await request.json();

        // Allow looking for either the strict server key or the public one (since they are often the same value)
        const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId) {
            console.error('Error: RAZORPAY_KEY_ID (and NEXT_PUBLIC_RAZORPAY_KEY_ID) are missing from env.');
            return NextResponse.json(
                { details: 'Configuration Error: RAZORPAY_KEY_ID is missing in Vercel Environment Variables.' },
                { status: 500 }
            );
        }

        if (!keySecret) {
            console.error('Error: RAZORPAY_KEY_SECRET is missing from env.');
            return NextResponse.json(
                { details: 'Configuration Error: RAZORPAY_KEY_SECRET is missing in Vercel Environment Variables.' },
                { status: 500 }
            );
        }

        // Safe logging (first 6 chars)
        console.log(`Initializing Razorpay with Key ID: ${keyId.substring(0, 6)}...`);

        const razorpay = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });

        const options = {
            amount: amount * 100, // Amount in smallest currency unit (paise)
            currency: currency || 'INR',
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        return NextResponse.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
        });
    } catch (error: any) {
        console.error('Razorpay API Error:', error);

        // Handle Authentication specific errors
        if (error.statusCode === 401) {
            return NextResponse.json(
                { details: 'Authentication Failed: The Key ID or Secret set in Vercel is incorrect. Please verify they match your Razorpay Dashboard exactly.' },
                { status: 500 }
            );
        }

        const errorMessage = error.error?.description || error.message || 'Unknown Razorpay Error';
        return NextResponse.json(
            { error: 'Error creating order', details: errorMessage },
            { status: 500 }
        );
    }
}

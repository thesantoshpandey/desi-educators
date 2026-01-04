import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(request: Request) {
    try {
        const { amount, currency } = await request.json();

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error('Razorpay keys missing');
            return NextResponse.json(
                { details: 'Server Error: Razorpay Keys are MISSING. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to Vercel Environment Variables.' },
                { status: 500 }
            );
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
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
        console.error('Error creating Razorpay order:', error);
        // Try to extract useful message from Razorpay error object
        const errorMessage = error.error?.description || error.message || JSON.stringify(error);

        return NextResponse.json(
            { error: 'Error creating order', details: errorMessage },
            { status: 500 }
        );
    }
}

-- ==============================================================================
-- Payment & Enrollment Schema Setup
-- Run this script in your Supabase SQL Editor to enable payments.
-- ==============================================================================
-- 1. Create 'orders' table
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    payment_id text,
    -- Razorpay Payment ID
    provider_order_id text,
    -- Razorpay Order ID
    amount numeric NOT NULL,
    status text DEFAULT 'pending',
    -- pending, Success, Failed
    plan_name text,
    currency text DEFAULT 'INR',
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
-- 2. Create 'enrollments' table (Access Control)
-- This checks if a user has access to a quiz/course.
CREATE TABLE IF NOT EXISTS public.enrollments (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    course_id text,
    -- Matches 'quiz_id' or course identifier used in QuizPage
    item_id text,
    -- Generic identifier for future proofing
    item_type text DEFAULT 'course',
    access_type text DEFAULT 'lifetime',
    created_at timestamp with time zone DEFAULT now()
);
-- 3. Enable RLS (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
-- 4. RLS Policies
-- Orders: Users can view their own orders
DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders FOR
SELECT USING (auth.uid() = user_id);
-- Enrollments: Users can view their own enrollments (CRITICAL for checkAccess)
DROP POLICY IF EXISTS "Users can view own enrollments" ON public.enrollments;
CREATE POLICY "Users can view own enrollments" ON public.enrollments FOR
SELECT USING (auth.uid() = user_id);
-- 5. Notes
-- "Users can insert own enrollments" policy has been removed for security.
-- Enrollments must be created via the secure Server Side API.
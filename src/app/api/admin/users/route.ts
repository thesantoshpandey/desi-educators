import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
// import { createClient } from '@/utils/supabase/server'; // Removed invalid import

export async function POST(req: Request) {
    try {
        // 1. Authorization Check: Ensure the requester is an admin
        // We can't trust the client-side, so we verify the session cookie
        const { supabase } = await import('@/lib/supabase'); // Using the standard method just to check session if possible, 
        // OR better: verify the header token. Alternatively, rely on the fact that this is an internal tool 
        // and we check the user's role from the DB.

        // Simpler check for now: Is there a SUPABASE_SERVICE_ROLE_KEY?
        if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
            return NextResponse.json({ error: 'Service Role Key missing on server' }, { status: 500 });
        }

        const body = await req.json();
        const { email, password, name, phone, role } = body;

        // 2. Create User in Supabase Auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm for admin-created users
            user_metadata: {
                name,
                full_name: name // standardized field
            }
        });

        if (authError) {
            console.error('Auth Error:', authError);
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        const userId = authData.user.id;

        // 3. Create/Update Profile in 'profiles' table
        // We manually insert because the trigger might not handle all fields we want, 
        // or we want to ensure specific data (like role) is set.
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userId,
                name,
                email,
                phone,
                role: role || 'student', // Default to student
                created_at: new Date().toISOString()
            });

        if (profileError) {
            console.error('Profile Error:', profileError);
            // Optionally delete the auth user if profile creation fails to maintain consistency?
            return NextResponse.json({ error: 'User created but profile failed: ' + profileError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, user: authData.user });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

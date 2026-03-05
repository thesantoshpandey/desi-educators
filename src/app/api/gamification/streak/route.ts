import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('student_streaks')
      .select('current_streak, longest_streak, last_activity_date, total_xp')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows returned, which is fine for new users
      console.error('streak fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch streak' }, { status: 500 });
    }

    return NextResponse.json({
      current_streak: data?.current_streak || 0,
      longest_streak: data?.longest_streak || 0,
      last_activity_date: data?.last_activity_date || null,
      total_xp: data?.total_xp || 0,
    });
  } catch (err) {
    console.error('streak route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

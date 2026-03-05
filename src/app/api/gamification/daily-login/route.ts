import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthUser } from '@/lib/auth-helper';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Check if user already logged in today
    const { data: streak } = await supabaseAdmin
      .from('student_streaks')
      .select('last_activity_date, current_streak')
      .eq('user_id', user.id)
      .single();

    const today = new Date().toISOString().split('T')[0];

    if (streak?.last_activity_date === today) {
      return NextResponse.json({
        success: true,
        already_logged: true,
        xp_awarded: 0,
        current_streak: streak.current_streak,
      });
    }

    // Award daily login XP (5 XP)
    const { error: xpError } = await supabaseAdmin.rpc('award_xp', {
      p_user_id: user.id,
      p_xp: 5,
      p_source: 'daily_login',
    });

    if (xpError) {
      console.error('daily login xp error:', xpError);
      return NextResponse.json({ error: 'Failed to award XP' }, { status: 500 });
    }

    // Re-fetch to get updated streak
    const { data: updatedStreak } = await supabaseAdmin
      .from('student_streaks')
      .select('current_streak, longest_streak, total_xp')
      .eq('user_id', user.id)
      .single();

    let bonus_xp = 0;

    // Check for 7-day streak bonus
    if (updatedStreak && updatedStreak.current_streak > 0 && updatedStreak.current_streak % 7 === 0) {
      bonus_xp = 100;
      await supabaseAdmin.rpc('award_xp', {
        p_user_id: user.id,
        p_xp: 100,
        p_source: 'streak_bonus_7',
      });
    }

    return NextResponse.json({
      success: true,
      already_logged: false,
      xp_awarded: 5 + bonus_xp,
      bonus_xp,
      current_streak: updatedStreak?.current_streak || 1,
      total_xp: (updatedStreak?.total_xp || 0) + bonus_xp,
    });
  } catch (err) {
    console.error('daily-login route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

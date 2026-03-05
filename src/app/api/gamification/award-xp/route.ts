import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthUser } from '@/lib/auth-helper';

// XP values by source
const XP_VALUES: Record<string, number> = {
  quiz_correct: 10,
  chapter_complete: 50,
  audio_episode: 25,
  daily_login: 5,
  streak_bonus_7: 100,
  priya_ai_question: 5,
};

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { source, custom_xp } = await req.json();

    if (!source || !XP_VALUES[source]) {
      if (!custom_xp || typeof custom_xp !== 'number') {
        return NextResponse.json(
          { error: 'Invalid source or custom_xp' },
          { status: 400 }
        );
      }
    }

    const xp = custom_xp || XP_VALUES[source];

    // Call the award_xp function we created in Supabase
    const { error } = await supabaseAdmin.rpc('award_xp', {
      p_user_id: user.id,
      p_xp: xp,
      p_source: source || 'other',
    });

    if (error) {
      console.error('award_xp error:', error);
      return NextResponse.json({ error: 'Failed to award XP' }, { status: 500 });
    }

    // Check for badge unlocks after awarding XP
    const { data: streak } = await supabaseAdmin
      .from('student_streaks')
      .select('total_xp, current_streak')
      .eq('user_id', user.id)
      .single();

    // Check XP badges
    if (streak) {
      const { data: unlockedBadges } = await supabaseAdmin
        .from('badges')
        .select('id, name, requirement_type, requirement_value')
        .eq('requirement_type', 'total_xp')
        .lte('requirement_value', streak.total_xp);

      if (unlockedBadges) {
        for (const badge of unlockedBadges) {
          await supabaseAdmin
            .from('student_badges')
            .upsert(
              { user_id: user.id, badge_id: badge.id },
              { onConflict: 'user_id,badge_id' }
            );
        }
      }

      // Check streak badges
      const { data: streakBadges } = await supabaseAdmin
        .from('badges')
        .select('id, name, requirement_type, requirement_value')
        .eq('requirement_type', 'streak_days')
        .lte('requirement_value', streak.current_streak);

      if (streakBadges) {
        for (const badge of streakBadges) {
          await supabaseAdmin
            .from('student_badges')
            .upsert(
              { user_id: user.id, badge_id: badge.id },
              { onConflict: 'user_id,badge_id' }
            );
        }
      }
    }

    return NextResponse.json({
      success: true,
      xp_awarded: xp,
      source,
      total_xp: streak?.total_xp || 0,
    });
  } catch (err) {
    console.error('award-xp route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

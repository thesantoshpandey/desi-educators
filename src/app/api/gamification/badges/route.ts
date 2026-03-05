import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all badges
    const { data: allBadges, error: badgesError } = await supabaseAdmin
      .from('badges')
      .select('id, name, description, icon_url, requirement_type, requirement_value, subject')
      .order('requirement_type')
      .order('requirement_value');

    if (badgesError) {
      console.error('badges fetch error:', badgesError);
      return NextResponse.json({ error: 'Failed to fetch badges' }, { status: 500 });
    }

    // Get user's earned badges
    const { data: earnedBadges, error: earnedError } = await supabaseAdmin
      .from('student_badges')
      .select('badge_id, earned_at')
      .eq('user_id', user.id);

    if (earnedError) {
      console.error('earned badges fetch error:', earnedError);
      return NextResponse.json({ error: 'Failed to fetch earned badges' }, { status: 500 });
    }

    const earnedSet = new Set(earnedBadges?.map((b) => b.badge_id) || []);
    const earnedMap = new Map(
      earnedBadges?.map((b) => [b.badge_id, b.earned_at]) || []
    );

    const badges = (allBadges || []).map((badge) => ({
      ...badge,
      earned: earnedSet.has(badge.id),
      earned_at: earnedMap.get(badge.id) || null,
    }));

    return NextResponse.json({
      badges,
      earned_count: earnedSet.size,
      total_count: allBadges?.length || 0,
    });
  } catch (err) {
    console.error('badges route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

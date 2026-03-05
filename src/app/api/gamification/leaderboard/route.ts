import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);

    // Get current week start (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    // Fetch leaderboard with profile names
    const { data: leaderboard, error } = await supabaseAdmin
      .from('weekly_leaderboard')
      .select(`
        weekly_xp,
        user_id,
        profiles!inner(full_name, avatar_url)
      `)
      .eq('week_start', weekStartStr)
      .order('weekly_xp', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('leaderboard fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }

    // Find current user's position
    const userEntry = leaderboard?.find((e) => e.user_id === user.id);
    const userRank = userEntry
      ? (leaderboard?.indexOf(userEntry) || 0) + 1
      : null;

    const entries = (leaderboard || []).map((entry, index) => ({
      rank: index + 1,
      user_id: entry.user_id,
      weekly_xp: entry.weekly_xp,
      name: (entry.profiles as { full_name?: string })?.full_name || 'Student',
      avatar_url: (entry.profiles as { avatar_url?: string })?.avatar_url || null,
      is_current_user: entry.user_id === user.id,
    }));

    return NextResponse.json({
      week_start: weekStartStr,
      entries,
      user_rank: userRank,
      user_xp: userEntry?.weekly_xp || 0,
    });
  } catch (err) {
    console.error('leaderboard route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

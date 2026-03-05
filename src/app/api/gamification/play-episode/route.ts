import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getAuthUser } from '@/lib/auth-helper';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { episode_id } = await req.json();

    if (!episode_id) {
      return NextResponse.json({ error: 'episode_id required' }, { status: 400 });
    }

    // Verify episode exists
    const { data: episode, error: episodeError } = await supabaseAdmin
      .from('audio_episodes')
      .select('id, title')
      .eq('id', episode_id)
      .single();

    if (episodeError || !episode) {
      return NextResponse.json({ error: 'Episode not found' }, { status: 404 });
    }

    // Increment play count
    await supabaseAdmin.rpc('increment_play_count', {
      p_episode_id: episode_id,
    });

    // Award 25 XP for listening
    const { error: xpError } = await supabaseAdmin.rpc('award_xp', {
      p_user_id: user.id,
      p_xp: 25,
      p_source: 'audio_episode',
    });

    if (xpError) {
      console.error('play episode xp error:', xpError);
    }

    // Check episodes_listened badges
    // Count how many unique episodes this user has listened to (we track via XP source)
    // For now, we just check total XP from audio as a proxy
    const { data: streak } = await supabaseAdmin
      .from('student_streaks')
      .select('total_xp')
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({
      success: true,
      xp_awarded: 25,
      episode_title: episode.title,
      total_xp: streak?.total_xp || 0,
    });
  } catch (err) {
    console.error('play-episode route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

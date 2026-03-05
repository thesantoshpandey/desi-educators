import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Public endpoint: returns latest episodes for homepage preview
// No auth required - read only, limited data
export async function GET() {
  try {
    const { data: episodes, error } = await supabaseAdmin
      .from('audio_episodes')
      .select('id, title, subject, audio_url, duration_seconds, play_count')
      .eq('is_free', true)
      .order('order_index', { ascending: true })
      .limit(4);

    if (error) {
      console.error('episodes-public error:', error);
      return NextResponse.json({ episodes: [] });
    }

    return NextResponse.json({ episodes: episodes || [] });
  } catch (err) {
    console.error('episodes-public error:', err);
    return NextResponse.json({ episodes: [] });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Desi Educators channel
const CHANNEL_ID = 'UCcia7dZmIGRJ53T55Dl02Cg';
const UPLOADS_PLAYLIST_ID = 'UUcia7dZmIGRJ53T55Dl02Cg'; // UC -> UU

// Videos from before this date are old lectures we skip
const CUTOFF_DATE = '2026-01-14T00:00:00Z';

// Simple auth: check for admin API key or admin user
async function isAuthorized(req: NextRequest): Promise<boolean> {
  // Option 1: Cron secret (for Vercel cron)
  const authHeader = req.headers.get('authorization');
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    return true;
  }

  // Option 2: Admin user session
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseUserClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return req.cookies.getAll(); } } }
  );
  const { data: { user } } = await supabaseUserClient.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
}

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  duration_seconds: number;
}

// Parse ISO 8601 duration (PT15M2S) to seconds
function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');
  return hours * 3600 + minutes * 60 + seconds;
}

async function fetchChannelVideos(apiKey: string): Promise<YouTubeVideo[]> {
  // Step 1: Get video IDs from uploads playlist
  const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${UPLOADS_PLAYLIST_ID}&maxResults=20&key=${apiKey}`;
  const playlistRes = await fetch(playlistUrl);
  const playlistData = await playlistRes.json();

  if (!playlistData.items || playlistData.items.length === 0) {
    return [];
  }

  // Filter by cutoff date
  const recentItems = playlistData.items.filter(
    (item: { snippet: { publishedAt: string } }) =>
      new Date(item.snippet.publishedAt) >= new Date(CUTOFF_DATE)
  );

  if (recentItems.length === 0) return [];

  // Step 2: Get video durations (contentDetails)
  const videoIds = recentItems
    .map((item: { snippet: { resourceId: { videoId: string } } }) => item.snippet.resourceId.videoId)
    .join(',');

  const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoIds}&key=${apiKey}`;
  const videosRes = await fetch(videosUrl);
  const videosData = await videosRes.json();

  return (videosData.items || []).map(
    (v: {
      id: string;
      snippet: { title: string; description: string; publishedAt: string };
      contentDetails: { duration: string };
    }) => ({
      videoId: v.id,
      title: v.snippet.title,
      description: v.snippet.description?.substring(0, 200) || '',
      publishedAt: v.snippet.publishedAt,
      duration_seconds: parseDuration(v.contentDetails.duration),
    })
  );
}

export async function POST(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'YOUTUBE_API_KEY not configured' },
      { status: 500 }
    );
  }

  try {
    // Fetch latest videos from YouTube
    const videos = await fetchChannelVideos(apiKey);

    // Get existing video IDs from DB
    const { data: existing } = await supabaseAdmin
      .from('audio_episodes')
      .select('audio_url');

    const existingIds = new Set(existing?.map((e) => e.audio_url) || []);

    // Find new videos not yet in DB
    const newVideos = videos.filter((v) => !existingIds.has(v.videoId));

    if (newVideos.length === 0) {
      return NextResponse.json({
        message: 'No new episodes found',
        total_on_youtube: videos.length,
        already_in_db: existingIds.size,
      });
    }

    // Get current max order_index
    const { data: maxOrder } = await supabaseAdmin
      .from('audio_episodes')
      .select('order_index')
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    let nextOrder = (maxOrder?.order_index || 0) + 1;

    // Insert new episodes
    const toInsert = newVideos.map((v) => ({
      title: v.title
        .replace(/\s*\|\s*NEET\s*\d{4}\s*/gi, '')
        .replace(/\s*\|\s*Vijay Path Series\s*/gi, '')
        .replace(/\s*\|\s*Summit Neuro.*$/gi, '')
        .trim(),
      description: v.description,
      subject: 'Biology',
      audio_url: v.videoId,
      duration_seconds: v.duration_seconds,
      is_free: true,
      order_index: nextOrder++,
    }));

    const { error: insertError } = await supabaseAdmin
      .from('audio_episodes')
      .insert(toInsert);

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to insert episodes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `${toInsert.length} new episode(s) added`,
      added: toInsert.map((e) => ({ title: e.title, videoId: e.audio_url })),
      total_on_youtube: videos.length,
      total_in_db: existingIds.size + toInsert.length,
    });
  } catch (err) {
    console.error('sync-episodes error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Check status without syncing
export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: episodes } = await supabaseAdmin
    .from('audio_episodes')
    .select('title, audio_url, duration_seconds, order_index, created_at')
    .order('order_index');

  return NextResponse.json({
    total_episodes: episodes?.length || 0,
    episodes: episodes || [],
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';



export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // Search via JioSaavn API
    const response = await fetch(
      `https://saavn.dev/api/search/songs?query=${encodeURIComponent(query)}&limit=20`
    );
    const data = await response.json();

    if (!data.success || !data.data?.results) {
      return NextResponse.json({ tracks: [] });
    }

    const tracks = data.data.results.map((song: any) => ({
      id: song.id,
      title: song.name,
      artist: song.artists?.primary?.map((a: any) => a.name).join(', ') || 'Unknown Artist',
      source_api_url: `https://saavn.dev/api/songs/${song.id}`,
      cover_url: song.image?.[2]?.url || song.image?.[1]?.url || song.image?.[0]?.url || null,
      duration: song.duration || 0,
    }));

    return NextResponse.json({ tracks });
  } catch (err) {
    console.error('Search error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

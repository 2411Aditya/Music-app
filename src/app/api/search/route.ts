import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';



export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // Search via working JioSaavn API wrapper
    const response = await fetch(
      `https://jiosaavn-api-beta.vercel.app/search/songs?query=${encodeURIComponent(query)}`
    );
    const data = await response.json();

    if (!data.data?.results || !Array.isArray(data.data.results)) {
      return NextResponse.json({ tracks: [] });
    }

    const tracks = data.data.results.map((song: any) => {
      // Find highest quality download URL
      const downloadUrls = song.downloadUrl || [];
      const bestAudio = downloadUrls[downloadUrls.length - 1]?.link || song.url;
      
      return {
        id: song.id,
        title: song.name,
        artist: song.primaryArtists || 'Unknown Artist',
        source_api_url: bestAudio,
        cover_url: song.image?.[2]?.link || song.image?.[1]?.link || song.image?.[0]?.link || null,
        duration: parseInt(song.duration || '0', 10),
      };
    });

    return NextResponse.json({ tracks });
  } catch (err) {
    console.error('Search error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

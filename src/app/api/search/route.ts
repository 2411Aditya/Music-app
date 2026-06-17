import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';



export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // Search via official JioSaavn Autocomplete API
    const response = await fetch(
      `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(query)}`
    );
    const data = await response.json();

    if (!data.songs?.data || !Array.isArray(data.songs.data)) {
      return NextResponse.json({ tracks: [] });
    }

    const tracks = data.songs.data.map((song: any) => {
      // JioSaavn usually returns 50x50 images in search, replace with 500x500 for better quality
      const highResImage = song.image?.replace('50x50', '500x500') || null;
      
      return {
        id: song.id,
        title: song.title,
        artist: song.more_info?.primary_artists || song.description?.split(' · ')[0] || 'Unknown Artist',
        source_api_url: song.more_info?.vlink || song.url,
        cover_url: highResImage,
        duration: 0, // Autocomplete API doesn't provide duration easily
      };
    });

    return NextResponse.json({ tracks });
  } catch (err) {
    console.error('Search error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

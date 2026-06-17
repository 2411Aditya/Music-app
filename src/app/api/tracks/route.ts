import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';


// Save a track (from search results) to Supabase
export async function POST(request: NextRequest) {
  try {
    const supabase = getServerSupabase();
    const body = await request.json();
    const { title, artist, source_api_url, cover_url, duration } = body;

    if (!title || !artist || !source_api_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if track already exists by source_api_url
    const { data: existing } = await supabase
      .from('tracks')
      .select('id')
      .eq('source_api_url', source_api_url)
      .single();

    if (existing) {
      return NextResponse.json({ track: existing, message: 'Track already exists' });
    }

    const { data, error } = await supabase
      .from('tracks')
      .insert({ title, artist, source_api_url, cover_url, duration } as any)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ track: data });
  } catch (err) {
    console.error('Track save error:', err);
    return NextResponse.json({ error: 'Failed to save track' }, { status: 500 });
  }
}

// Get all tracks
export async function GET() {
  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from('tracks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ tracks: data || [] });
  } catch (err) {
    console.error('Tracks fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch tracks' }, { status: 500 });
  }
}

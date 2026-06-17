import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';



import CryptoJS from 'crypto-js';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // 1. Search via official JioSaavn Autocomplete API
    const searchRes = await fetch(
      `https://www.jiosaavn.com/api.php?__call=autocomplete.get&_format=json&_marker=0&cc=in&includeMetaTags=1&query=${encodeURIComponent(query)}`
    );
    const searchData = await searchRes.json();

    if (!searchData.songs?.data || !Array.isArray(searchData.songs.data)) {
      return NextResponse.json({ tracks: [] });
    }

    const songIds = searchData.songs.data.map((s: any) => s.id).join(',');

    // 2. Fetch full details for these songs
    const detailsRes = await fetch(
      `https://www.jiosaavn.com/api.php?__call=song.getDetails&pids=${songIds}&_format=json&_marker=0&ctx=web6dot0`
    );
    const detailsData = await detailsRes.json();
    
    if (!detailsData.songs || !Array.isArray(detailsData.songs)) {
      return NextResponse.json({ tracks: [] });
    }

    const key = CryptoJS.enc.Utf8.parse('38346591');

    const tracks = detailsData.songs.map((song: any) => {
      // Decrypt media URL
      let decryptedUrl = '';
      if (song.encrypted_media_url) {
        try {
          const decrypted = CryptoJS.DES.decrypt(
            { ciphertext: CryptoJS.enc.Base64.parse(song.encrypted_media_url) } as any,
            key,
            { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
          );
          decryptedUrl = decrypted.toString(CryptoJS.enc.Utf8);
          // Upgrade to 320kbps
          decryptedUrl = decryptedUrl.replace('_96.mp4', '_320.mp4').replace('_160.mp4', '_320.mp4');
        } catch (e) {
          console.error('Decryption failed for', song.id);
        }
      }

      const highResImage = song.image?.replace('150x150', '500x500') || null;

      return {
        id: song.id,
        title: song.song || song.title,
        artist: song.primary_artists || 'Unknown Artist',
        source_api_url: decryptedUrl || song.media_preview_url,
        cover_url: highResImage,
        duration: parseInt(song.duration || '0', 10),
      };
    });

    return NextResponse.json({ tracks });
  } catch (err) {
    console.error('Search error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

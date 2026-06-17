import { NextRequest, NextResponse } from 'next/server';
import CryptoJS from 'crypto-js';

function unescapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&apos;/g, "'");
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    // Search via official JioSaavn search.getResults API (highly relevant, returns complete metadata)
    const searchRes = await fetch(
      `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&cc=in&includeMetaTags=1&q=${encodeURIComponent(query)}&p=1&n=20&api_version=4&ctx=web6dot0`
    );
    const searchData = await searchRes.json();

    if (!searchData.results || !Array.isArray(searchData.results)) {
      return NextResponse.json({ tracks: [] });
    }

    const key = CryptoJS.enc.Utf8.parse('38346591');

    const tracks = searchData.results.map((song: any) => {
      // Decrypt media URL
      const encryptedUrl = song.more_info?.encrypted_media_url;
      let decryptedUrl = '';
      if (encryptedUrl) {
        try {
          const decrypted = CryptoJS.DES.decrypt(
            { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) } as any,
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

      // Extract and clean artist name
      let artist = '';
      if (song.more_info?.artistMap?.primary_artists && Array.isArray(song.more_info.artistMap.primary_artists) && song.more_info.artistMap.primary_artists.length > 0) {
        artist = song.more_info.artistMap.primary_artists.map((a: any) => a.name).join(', ');
      } else if (song.more_info?.singers) {
        artist = song.more_info.singers;
      } else if (song.subtitle) {
        artist = song.subtitle.split(' - ')[0] || song.subtitle;
      } else {
        artist = 'Unknown Artist';
      }

      return {
        id: song.id,
        title: unescapeHtml(song.title || song.song),
        artist: unescapeHtml(artist),
        source_api_url: decryptedUrl || song.media_preview_url,
        cover_url: highResImage,
        duration: parseInt(song.more_info?.duration || '0', 10),
      };
    });

    return NextResponse.json({ tracks });
  } catch (err) {
    console.error('Search error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

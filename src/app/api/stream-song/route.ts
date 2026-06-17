import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';
import os from 'os';


async function downloadFile(url: string, destPath: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(destPath, buffer);
}

function cleanupFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error('Cleanup error:', err);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Track ID is required' }, { status: 400 });
  }

  // 1. Look up track from Supabase
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('tracks')
    .select('source_api_url, title')
    .eq('id', id)
    .single();

  const track = data as any;

  if (error || !track) {
    return NextResponse.json({ error: 'Track not found' }, { status: 404 });
  }

  // 2. Resolve the actual audio URL from the JioSaavn API
  let audioUrl = track.source_api_url;
  
  try {
    // If the source URL is a JioSaavn API endpoint, resolve the actual download URL
    if (track.source_api_url.includes('saavn.dev')) {
      const apiResponse = await fetch(track.source_api_url);
      const apiData = await apiResponse.json();
      
      if (apiData.success && apiData.data) {
        const songData = Array.isArray(apiData.data) ? apiData.data[0] : apiData.data;
        const downloadUrls = songData.downloadUrl || [];
        // Get highest quality available (last item = highest bitrate)
        const bestQuality = downloadUrls[downloadUrls.length - 1];
        if (bestQuality?.url) {
          audioUrl = bestQuality.url;
        } else {
          return NextResponse.json({ error: 'No audio URL found' }, { status: 404 });
        }
      } else {
        return NextResponse.json({ error: 'Failed to resolve audio URL' }, { status: 502 });
      }
    }
  } catch (err) {
    console.error('API resolution error:', err);
    return NextResponse.json({ error: 'Failed to resolve audio source' }, { status: 502 });
  }

  // 3. Download to temp directory
  const tmpDir = os.tmpdir();
  const tmpFileName = `music-stream-${crypto.randomUUID()}.mp3`;
  const tmpPath = path.join(tmpDir, tmpFileName);

  try {
    await downloadFile(audioUrl, tmpPath);
  } catch (err) {
    console.error('Download error:', err);
    cleanupFile(tmpPath);
    return NextResponse.json({ error: 'Failed to download audio' }, { status: 502 });
  }

  // 4. Read file and prepare response
  try {
    const stat = fs.statSync(tmpPath);
    const fileSize = stat.size;
    const rangeHeader = request.headers.get('range');

    // Register cleanup on abort (user stops playback or closes tab)
    request.signal.addEventListener('abort', () => {
      cleanupFile(tmpPath);
    });

    if (rangeHeader) {
      // Handle range request for seeking
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      const fileBuffer = Buffer.alloc(chunkSize);
      const fd = fs.openSync(tmpPath, 'r');
      fs.readSync(fd, fileBuffer, 0, chunkSize, start);
      fs.closeSync(fd);

      // Schedule cleanup after response
      setTimeout(() => cleanupFile(tmpPath), 30000);

      return new NextResponse(fileBuffer, {
        status: 206,
        headers: {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize.toString(),
          'Content-Type': 'audio/mpeg',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    } else {
      // Full file response
      const fileBuffer = fs.readFileSync(tmpPath);

      // Schedule cleanup after response is sent
      setTimeout(() => cleanupFile(tmpPath), 30000);

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': fileSize.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    }
  } catch (err) {
    console.error('Stream error:', err);
    cleanupFile(tmpPath);
    return NextResponse.json({ error: 'Failed to stream audio' }, { status: 500 });
  }
}

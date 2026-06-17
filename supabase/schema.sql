-- ================================================
-- Music Streaming App — Database Schema
-- Run this in Supabase SQL Editor
-- ================================================

-- Tracks table: stores metadata + source audio URL
CREATE TABLE IF NOT EXISTS tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  source_api_url TEXT NOT NULL,
  cover_url TEXT,
  duration INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Playlists table: global/public playlists
CREATE TABLE IF NOT EXISTS playlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table: many-to-many relationship
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE NOT NULL,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE NOT NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(playlist_id, track_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_playlist ON playlist_tracks(playlist_id);
CREATE INDEX IF NOT EXISTS idx_playlist_tracks_track ON playlist_tracks(track_id);
CREATE INDEX IF NOT EXISTS idx_tracks_title ON tracks(title);
CREATE INDEX IF NOT EXISTS idx_tracks_artist ON tracks(artist);

-- Enable Row Level Security (open for public access)
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;

-- Public access policies (no auth required)
CREATE POLICY "Public read/write tracks" ON tracks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write playlists" ON playlists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write playlist_tracks" ON playlist_tracks FOR ALL USING (true) WITH CHECK (true);

-- ================================================
-- Seed Data — Sample tracks for testing
-- Uses JioSaavn API URLs as source_api_url
-- These will be resolved at stream-time via /api/stream-song
-- ================================================

-- Note: source_api_url points to the JioSaavn API endpoint
-- The /api/stream-song route will fetch the actual audio URL from this API

INSERT INTO tracks (title, artist, source_api_url, cover_url, duration) VALUES
  ('Blinding Lights', 'The Weeknd', 'https://saavn.dev/api/songs/5WXAlMNt', 'https://c.saavncdn.com/604/Blinding-Lights-English-2019-20200212041610-500x500.jpg', 201),
  ('Starboy', 'The Weeknd', 'https://saavn.dev/api/songs/6PqPOuBE', 'https://c.saavncdn.com/936/Starboy-English-2016-500x500.jpg', 230),
  ('Shape of You', 'Ed Sheeran', 'https://saavn.dev/api/songs/pJLvFkQT', 'https://c.saavncdn.com/227/Divide-English-2017-500x500.jpg', 234),
  ('Levitating', 'Dua Lipa', 'https://saavn.dev/api/songs/IxEFMpS3', 'https://c.saavncdn.com/569/Future-Nostalgia-English-2020-20200717101826-500x500.jpg', 203),
  ('Stay', 'The Kid LAROI, Justin Bieber', 'https://saavn.dev/api/songs/gLvBBfaa', 'https://c.saavncdn.com/191/Stay-with-Justin-Bieber-English-2021-20210709231927-500x500.jpg', 141),
  ('Peaches', 'Justin Bieber', 'https://saavn.dev/api/songs/FGBqDmh-', 'https://c.saavncdn.com/269/Justice-English-2021-20210924193029-500x500.jpg', 198),
  ('Watermelon Sugar', 'Harry Styles', 'https://saavn.dev/api/songs/HfGuvHkK', 'https://c.saavncdn.com/373/Fine-Line-English-2019-20191213044348-500x500.jpg', 174),
  ('drivers license', 'Olivia Rodrigo', 'https://saavn.dev/api/songs/-QWqCLgj', 'https://c.saavncdn.com/269/drivers-license-English-2021-20210203111957-500x500.jpg', 242);

-- Create a sample playlist
INSERT INTO playlists (name, description, user_id) VALUES
  ('Top Hits 2024', 'The biggest hits of the year curated for you', 'demo-user'),
  ('Chill Vibes', 'Relax and unwind with these smooth tracks', 'demo-user');

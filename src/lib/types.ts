export interface Track {
  id: string;
  title: string;
  artist: string;
  source_api_url: string;
  cover_url: string | null;
  duration: number;
  created_at?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  user_id: string | null;
  created_at: string;
  track_count?: number;
}

export interface PlaylistTrack {
  id: string;
  playlist_id: string;
  track_id: string;
  added_at: string;
  track?: Track;
}

export interface PlayerState {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  volume: number;
  progress: number;
  duration: number;
}

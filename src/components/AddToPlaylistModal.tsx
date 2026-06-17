'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Check, ListMusic } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Track, Playlist } from '@/lib/types';

interface AddToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  track: Track | null;
}

export default function AddToPlaylistModal({
  isOpen,
  onClose,
  track,
}: AddToPlaylistModalProps) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [addedTo, setAddedTo] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPlaylists();
      setAddedTo(new Set());
    }
  }, [isOpen]);

  async function fetchPlaylists() {
    const { data } = await supabase
      .from('playlists')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setPlaylists(data);
  }

  async function addToPlaylist(playlistId: string) {
    if (!track) return;
    setLoading(true);

    try {
      // First, ensure the track exists in Supabase
      let trackId = track.id;

      // Check if this is a search result (from JioSaavn) that needs to be saved
      const { data: existingTrack } = await supabase
        .from('tracks')
        .select('id')
        .eq('source_api_url', track.source_api_url)
        .single();

      if (existingTrack) {
        trackId = existingTrack.id;
      } else {
        // Save track to Supabase first
        const { data: newTrack, error: trackError } = await supabase
          .from('tracks')
          .insert({
            title: track.title,
            artist: track.artist,
            source_api_url: track.source_api_url,
            cover_url: track.cover_url,
            duration: track.duration,
          })
          .select()
          .single();

        if (trackError) throw trackError;
        if (newTrack) trackId = newTrack.id;
      }

      // Add to playlist
      const { error } = await supabase.from('playlist_tracks').insert({
        playlist_id: playlistId,
        track_id: trackId,
      });

      if (error) {
        if (error.code === '23505') {
          // Unique violation — track already in playlist
          setToast({ message: 'Track already in this playlist', type: 'error' });
          setTimeout(() => setToast(null), 2000);
          return;
        }
        throw error;
      }

      setAddedTo((prev) => new Set([...prev, playlistId]));
      setToast({ message: 'Added to playlist!', type: 'success' });
      setTimeout(() => setToast(null), 2000);
    } catch (err) {
      console.error('Add to playlist error:', err);
      setToast({ message: 'Failed to add track', type: 'error' });
      setTimeout(() => setToast(null), 2000);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !track) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-[400px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Add to Playlist</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Track Preview */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-elevated)] mb-4">
          {track.cover_url ? (
            <img
              src={track.cover_url}
              alt={track.title}
              className="w-10 h-10 rounded-md object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-md bg-[var(--bg-hover)] flex items-center justify-center">
              <ListMusic size={16} className="text-[var(--text-muted)]" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate text-white">{track.title}</p>
            <p className="text-xs text-[var(--text-secondary)] truncate">{track.artist}</p>
          </div>
        </div>

        {/* Playlist List */}
        <div className="max-h-[300px] overflow-y-auto space-y-1">
          {playlists.length === 0 ? (
            <p className="text-center text-sm text-[var(--text-muted)] py-8">
              No playlists yet. Create one first!
            </p>
          ) : (
            playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => addToPlaylist(playlist.id)}
                disabled={loading || addedTo.has(playlist.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[var(--bg-elevated)] transition-all text-left group disabled:opacity-70"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-hover)] flex items-center justify-center flex-shrink-0">
                  <ListMusic size={16} className="text-[var(--text-muted)]" />
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)] flex-1 truncate">
                  {playlist.name}
                </span>
                {addedTo.has(playlist.id) ? (
                  <Check size={16} className="text-[var(--success)] flex-shrink-0" />
                ) : (
                  <Plus
                    size={16}
                    className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                  />
                )}
              </button>
            ))
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`mt-4 px-4 py-2 rounded-xl text-sm font-medium text-center animate-slide-up ${
              toast.type === 'success'
                ? 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20'
                : 'bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/20'
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}

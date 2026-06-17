'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Check, Loader2, Music2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Track } from '@/lib/types';

interface AddSongsToPlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlistId: string;
  onSongsAdded: () => void;
}

export default function AddSongsToPlaylistModal({
  isOpen,
  onClose,
  playlistId,
  onSongsAdded,
}: AddSongsToPlaylistModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [addedTrackIds, setAddedTrackIds] = useState<Set<string>>(new Set());
  const [addingTrackId, setAddingTrackId] = useState<string | null>(null);

  // Load existing track IDs in this playlist so we can show checkmarks for already added songs
  async function fetchExistingTrackIds() {
    const { data } = await supabase
      .from('playlist_tracks')
      .select('track_id, tracks (source_api_url)')
      .eq('playlist_id', playlistId);
    
    if (data) {
      // We map by source_api_url to identify songs from search that are already added
      const urls = data.map((pt: any) => pt.tracks?.source_api_url).filter(Boolean);
      setAddedTrackIds(new Set(urls));
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchExistingTrackIds();
      setQuery('');
      setResults([]);
    }
  }, [isOpen, playlistId]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  async function performSearch(searchQuery: string) {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data.tracks) {
        setResults(data.tracks);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddSong(track: Track) {
    setAddingTrackId(track.id);
    try {
      // 1. Check if track already exists by source_api_url
      const { data: existingTrack, error: findError } = await supabase
        .from('tracks')
        .select('id')
        .eq('source_api_url', track.source_api_url)
        .maybeSingle();

      if (findError) throw findError;

      let trackId = '';

      if (existingTrack) {
        trackId = existingTrack.id;
      } else {
        // Insert track and let Supabase generate a UUID
        const { data: newTrack, error: insertError } = await supabase
          .from('tracks')
          .insert({
            title: track.title,
            artist: track.artist,
            source_api_url: track.source_api_url,
            cover_url: track.cover_url,
            duration: track.duration,
          })
          .select('id')
          .single();

        if (insertError) throw insertError;
        trackId = newTrack.id;
      }

      // 2. Add to playlist_tracks
      const { error: playlistError } = await supabase
        .from('playlist_tracks')
        .insert({
          playlist_id: playlistId,
          track_id: trackId,
        });

      if (playlistError && playlistError.code !== '23505') {
        throw playlistError;
      }

      // 3. Mark as added locally
      setAddedTrackIds((prev) => new Set([...prev, track.source_api_url]));
      onSongsAdded(); // Refresh parent track list immediately!
    } catch (err) {
      console.error('Add song error:', err);
    } finally {
      setAddingTrackId(null);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content max-w-[500px] w-full flex flex-col max-h-[85vh] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-white">Add Songs to Playlist</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4 flex-shrink-0">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for tracks to add..."
            className="w-full pl-11 pr-10 py-2.5 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-white text-sm placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-glow)] transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 size={24} className="text-[var(--accent-primary)] animate-spin mb-2" />
              <p className="text-xs text-[var(--text-secondary)]">Searching songs...</p>
            </div>
          ) : results.length > 0 ? (
            results.map((t) => {
              const isAdded = addedTrackIds.has(t.source_api_url);
              const isAdding = addingTrackId === t.id;

              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 p-2 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-elevated)] transition-all"
                >
                  {/* Cover */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--bg-surface)] flex-shrink-0">
                    {t.cover_url ? (
                      <img
                        src={t.cover_url}
                        alt={t.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-[var(--bg-hover)]">
                        <Music2 size={16} className="text-[var(--text-muted)]" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate text-white">{t.title}</p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{t.artist}</p>
                  </div>

                  {/* Action Button */}
                  {isAdded ? (
                    <div className="w-8 h-8 rounded-full bg-[var(--success)]/10 text-[var(--success)] flex items-center justify-center flex-shrink-0">
                      <Check size={16} />
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddSong(t)}
                      disabled={isAdding}
                      className="w-8 h-8 rounded-full bg-[var(--accent-primary)] hover:bg-[var(--accent-secondary)] text-white flex items-center justify-center transition-colors flex-shrink-0 disabled:opacity-50"
                      title="Add to playlist"
                    >
                      {isAdding ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Plus size={16} />
                      )}
                    </button>
                  )}
                </div>
              );
            })
          ) : query ? (
            <p className="text-center text-xs text-[var(--text-muted)] py-12">
              No songs found matching your search.
            </p>
          ) : (
            <p className="text-center text-xs text-[var(--text-muted)] py-12">
              Type in the search bar above to find and add songs.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

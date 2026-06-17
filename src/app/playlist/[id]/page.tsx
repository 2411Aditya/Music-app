'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Play,
  Pause,
  Shuffle,
  Clock,
  ArrowLeft,
  MoreHorizontal,
  ListMusic,
  Trash2,
  Music2,
  Plus,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Track, Playlist } from '@/lib/types';
import { usePlayer } from '@/context/PlayerContext';
import { formatDuration, cn } from '@/lib/utils';
import TrackRow from '@/components/TrackRow';
import AddSongsToPlaylistModal from '@/components/AddSongsToPlaylistModal';
import Image from 'next/image';

export default function PlaylistPage() {
  const params = useParams();
  const router = useRouter();
  const playlistId = params.id as string;

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddSongsModal, setShowAddSongsModal] = useState(false);
  const { playTrack, currentTrack, isPlaying } = usePlayer();

  useEffect(() => {
    if (playlistId) {
      fetchPlaylistData();
    }
  }, [playlistId]);

  async function fetchPlaylistData() {
    setLoading(true);
    try {
      // Fetch playlist
      const { data: playlistData } = await supabase
        .from('playlists')
        .select('*')
        .eq('id', playlistId)
        .single();

      if (playlistData) setPlaylist(playlistData);

      // Fetch playlist tracks with track details
      const { data: playlistTracks } = await supabase
        .from('playlist_tracks')
        .select(`
          id,
          added_at,
          track_id,
          tracks (*)
        `)
        .eq('playlist_id', playlistId)
        .order('added_at', { ascending: true });

      if (playlistTracks) {
        const trackList = playlistTracks
          .map((pt: any) => pt.tracks)
          .filter(Boolean) as Track[];
        setTracks(trackList);
      }
    } catch (err) {
      console.error('Failed to fetch playlist:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveTrack(trackId: string) {
    try {
      await supabase
        .from('playlist_tracks')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('track_id', trackId);

      setTracks((prev) => prev.filter((t) => t.id !== trackId));
    } catch (err) {
      console.error('Remove track error:', err);
    }
  }



  function handlePlayAll() {
    if (tracks.length > 0) {
      playTrack(tracks[0], tracks);
    }
  }

  function handleShuffle() {
    if (tracks.length > 0) {
      const shuffled = [...tracks].sort(() => Math.random() - 0.5);
      playTrack(shuffled[0], shuffled);
    }
  }

  async function handleDeletePlaylist() {
    if (confirm('Are you sure you want to delete this playlist?')) {
      const { error } = await supabase.from('playlists').delete().eq('id', playlistId);
      if (!error) {
        // Force a page reload to refresh the sidebar
        window.location.href = '/';
      } else {
        alert('Failed to delete playlist');
      }
    }
  }

  const totalDuration = tracks.reduce((sum, t) => sum + (t.duration || 0), 0);
  const isPlaylistPlaying =
    isPlaying && currentTrack && tracks.some((t) => t.id === currentTrack.id);

  // Get dominant cover from first track
  const coverUrl = tracks[0]?.cover_url;

  if (loading) {
    return (
      <div className="min-h-full animate-fade-in">
        <div className="h-[320px] bg-gradient-to-b from-[var(--bg-elevated)] to-[var(--bg-secondary)] p-8 flex items-end">
          <div className="flex items-end gap-6">
            <div className="w-[200px] h-[200px] rounded-xl bg-[var(--bg-surface)] animate-shimmer" />
            <div>
              <div className="h-4 w-20 bg-[var(--bg-surface)] rounded animate-shimmer mb-3" />
              <div className="h-10 w-64 bg-[var(--bg-surface)] rounded animate-shimmer mb-3" />
              <div className="h-4 w-40 bg-[var(--bg-surface)] rounded animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">
            Playlist not found
          </h2>
          <button
            onClick={() => router.push('/')}
            className="text-sm text-[var(--accent-primary)] hover:underline"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Playlist Header */}
      <div className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2a1a4e] via-[#1a1040] to-[var(--bg-secondary)]" />
        {coverUrl && (
          <div
            className="absolute inset-0 opacity-20 blur-3xl scale-110"
            style={{
              backgroundImage: `url(${coverUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}

        <div className="relative px-4 md:px-8 pt-6 pb-8">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="mb-6 w-8 h-8 rounded-full bg-black/30 flex items-center justify-center text-white hover:bg-black/50 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex items-end gap-6">
            {/* Playlist Cover */}
            <div className="w-[200px] h-[200px] rounded-xl overflow-hidden bg-[var(--bg-surface)] shadow-2xl flex-shrink-0">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt={playlist.name}
                  width={200}
                  height={200}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
                  <ListMusic size={64} className="text-white/60" />
                </div>
              )}
            </div>

            {/* Playlist Info */}
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-white mb-2">
                Playlist
              </p>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 leading-tight">
                {playlist.name}
              </h1>
              {playlist.description && (
                <p className="text-sm text-[var(--text-secondary)] mb-2 max-w-lg">
                  {playlist.description}
                </p>
              )}
              <p className="text-sm text-[var(--text-secondary)]">
                <span className="text-white font-medium">
                  {tracks.length} {tracks.length === 1 ? 'song' : 'songs'}
                </span>
                {totalDuration > 0 && (
                  <>
                    {' · '}
                    {Math.floor(totalDuration / 60)} min{' '}
                    {totalDuration % 60} sec
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 px-4 md:px-8 py-5">
        <button
          onClick={handlePlayAll}
          disabled={tracks.length === 0}
          className="w-14 h-14 rounded-full bg-[var(--accent-primary)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
        >
          {isPlaylistPlaying ? (
            <Pause size={24} className="text-white" fill="white" />
          ) : (
            <Play size={24} className="text-white ml-1" fill="white" />
          )}
        </button>

        <button
          onClick={handleShuffle}
          disabled={tracks.length === 0}
          className="text-[var(--text-secondary)] hover:text-white transition-colors disabled:opacity-50"
          title="Shuffle"
        >
          <Shuffle size={22} />
        </button>

        <button
          onClick={() => setShowAddSongsModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--border-subtle)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--accent-primary)] transition-all"
        >
          <Plus size={16} />
          <span>Add Songs</span>
        </button>

        <div className="ml-auto relative">
          <button
            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
            className="text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            <MoreHorizontal size={22} />
          </button>
          {showDeleteConfirm && (
            <div className="absolute right-0 top-10 w-48 py-1 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl z-10 animate-scale-in">
              <button
                onClick={handleDeletePlaylist}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[var(--error)] hover:bg-[var(--bg-elevated)] transition-colors"
              >
                <Trash2 size={16} />
                Delete Playlist
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Track List */}
      <div className="px-4 md:px-8 pb-32">
        {tracks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center mx-auto mb-4">
              <Music2 size={32} className="text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              This playlist is empty
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Search for songs and add them to this playlist
            </p>
            <button
              onClick={() => setShowAddSongsModal(true)}
              className="inline-flex px-6 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white hover:opacity-90 transition-all hover:scale-105"
            >
              Add Songs
            </button>
          </div>
        ) : (
          <>
            {/* Column Headers */}
            <div className="flex items-center gap-4 px-4 py-2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)] mb-2">
              <div className="w-8 text-center">#</div>
              <div className="flex-1">Title</div>
              <Clock size={14} />
            </div>

            <div className="space-y-0.5 stagger-children">
              {tracks.map((track, i) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={i}
                  trackList={tracks}
                  showRemove
                  onRemove={handleRemoveTrack}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add Songs Modal */}
      <AddSongsToPlaylistModal
        isOpen={showAddSongsModal}
        onClose={() => setShowAddSongsModal(false)}
        playlistId={playlistId}
        onSongsAdded={fetchPlaylistData}
      />
    </div>
  );
}

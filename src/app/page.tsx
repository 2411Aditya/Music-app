'use client';

import React, { useState, useEffect } from 'react';
import { Play, TrendingUp, Sparkles, ChevronRight, ListMusic } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Track, Playlist } from '@/lib/types';
import { usePlayer } from '@/context/PlayerContext';
import TrackCard from '@/components/TrackCard';
import AddToPlaylistModal from '@/components/AddToPlaylistModal';
import Link from 'next/link';

export default function HomePage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const { playTrack } = usePlayer();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [tracksRes, playlistsRes] = await Promise.all([
        supabase.from('tracks').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('playlists').select('*').order('created_at', { ascending: false }).limit(10),
      ]);

      if (tracksRes.data) setTracks(tracksRes.data);
      if (playlistsRes.data) setPlaylists(playlistsRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleAddToPlaylist(track: Track) {
    setSelectedTrack(track);
    setShowAddToPlaylist(true);
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }

  return (
    <div className="min-h-full">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1040] via-[var(--bg-secondary)] to-[var(--bg-secondary)]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--accent-primary)] rounded-full blur-[128px] opacity-10" />
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-[var(--accent-secondary)] rounded-full blur-[128px] opacity-10" />

        <div className="relative px-8 pt-10 pb-6">
          <h1 className="text-3xl font-bold text-white mb-1 animate-fade-in">
            {getGreeting()}
          </h1>
          <p className="text-[var(--text-secondary)] animate-fade-in">
            Discover and stream your favorite music
          </p>
        </div>
      </div>

      {/* Quick Play Playlists */}
      {playlists.length > 0 && (
        <section className="px-8 pb-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 stagger-children">
            {playlists.slice(0, 6).map((playlist) => (
              <Link
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                className="flex items-center gap-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 group overflow-hidden"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center flex-shrink-0">
                  <ListMusic size={22} className="text-white" />
                </div>
                <span className="text-sm font-semibold text-white truncate pr-4">
                  {playlist.name}
                </span>
                <div className="ml-auto mr-3 w-10 h-10 rounded-full bg-[var(--accent-primary)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl translate-y-1 group-hover:translate-y-0">
                  <Play size={18} className="text-white ml-0.5" fill="white" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recently Added Tracks */}
      <section className="px-8 pb-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-[var(--accent-primary)]" />
            <h2 className="text-xl font-bold text-white">Recently Added</h2>
          </div>
          {tracks.length > 5 && (
            <button className="text-sm font-semibold text-[var(--text-secondary)] hover:text-white transition-colors flex items-center gap-1">
              Show all <ChevronRight size={16} />
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3">
                <div className="aspect-square rounded-lg bg-[var(--bg-surface)] animate-shimmer mb-3" />
                <div className="h-4 bg-[var(--bg-surface)] rounded animate-shimmer mb-2 w-3/4" />
                <div className="h-3 bg-[var(--bg-surface)] rounded animate-shimmer w-1/2" />
              </div>
            ))}
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center mx-auto mb-4">
              <Sparkles size={32} className="text-[var(--text-muted)]" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No tracks yet</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Search for music to add tracks to your library
            </p>
            <Link
              href="/search"
              className="inline-flex px-6 py-2.5 rounded-full text-sm font-semibold bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-white hover:opacity-90 transition-all hover:scale-105"
            >
              Search Music
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 stagger-children">
            {tracks.map((track, i) => (
              <TrackCard
                key={track.id}
                track={track}
                trackList={tracks}
                onAddToPlaylist={handleAddToPlaylist}
                index={i}
              />
            ))}
          </div>
        )}
      </section>

      {/* Trending Section */}
      {tracks.length > 4 && (
        <section className="px-8 pb-32">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={20} className="text-[var(--accent-secondary)]" />
            <h2 className="text-xl font-bold text-white">Made For You</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 stagger-children">
            {tracks.slice(0, 6).map((track, i) => (
              <TrackCard
                key={`trending-${track.id}`}
                track={track}
                trackList={tracks.slice(0, 6)}
                onAddToPlaylist={handleAddToPlaylist}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        isOpen={showAddToPlaylist}
        onClose={() => setShowAddToPlaylist(false)}
        track={selectedTrack}
      />
    </div>
  );
}

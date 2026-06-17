'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search as SearchIcon, X, Loader2, Music2 } from 'lucide-react';
import { Track } from '@/lib/types';
import { usePlayer } from '@/context/PlayerContext';
import TrackRow from '@/components/TrackRow';
import AddToPlaylistModal from '@/components/AddToPlaylistModal';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const { playTrack } = usePlayer();

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query.trim());
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  async function performSearch(searchQuery: string) {
    setLoading(true);
    setHasSearched(true);

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

  function handleAddToPlaylist(track: Track) {
    setSelectedTrack(track);
    setShowAddToPlaylist(true);
  }

  const trendingSearches = [
    'Blinding Lights',
    'Shape of You',
    'Levitating',
    'Starboy',
    'Watermelon Sugar',
    'Stay',
    'Peaches',
    'Bad Guy',
    'Sunflower',
    'Bohemian Rhapsody',
  ];

  return (
    <div className="min-h-full p-4 md:p-8 pb-32">
      {/* Search Header */}
      <div className="max-w-2xl mb-8">
        <div className="relative">
          <SearchIcon
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What do you want to listen to?"
            className="w-full pl-12 pr-12 py-4 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-white text-base placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-glow)] transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={32} className="text-[var(--accent-primary)] animate-spin mb-4" />
          <p className="text-sm text-[var(--text-secondary)]">Searching...</p>
        </div>
      ) : hasSearched && results.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center mb-4">
            <Music2 size={32} className="text-[var(--text-muted)]" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            No results found
          </h3>
          <p className="text-sm text-[var(--text-secondary)]">
            Try searching for something else
          </p>
        </div>
      ) : results.length > 0 ? (
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-white mb-4">
            Search Results
            <span className="text-sm font-normal text-[var(--text-secondary)] ml-2">
              {results.length} tracks found
            </span>
          </h2>

          {/* Column Headers */}
          <div className="flex items-center gap-4 px-4 py-2 text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider border-b border-[var(--border-subtle)] mb-2">
            <div className="w-8 text-center">#</div>
            <div className="flex-1">Title</div>
            <div className="w-20 text-right">Duration</div>
          </div>

          <div className="space-y-0.5 stagger-children">
            {results.map((track, i) => (
              <TrackRow
                key={track.id}
                track={track}
                index={i}
                trackList={results}
                onAddToPlaylist={handleAddToPlaylist}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Browse/Trending */
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-white mb-5">
            Trending Searches
          </h2>
          <div className="flex flex-wrap gap-3">
            {trendingSearches.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="px-5 py-2.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] hover:border-[var(--accent-primary)] hover:text-white transition-all duration-200 hover:scale-105"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Genre Cards */}
          <h2 className="text-lg font-bold text-white mt-10 mb-5">
            Browse by Mood
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              { name: 'Pop Hits', gradient: 'from-pink-500 to-rose-600', query: 'pop hits 2024' },
              { name: 'Hip Hop', gradient: 'from-amber-500 to-orange-600', query: 'hip hop trending' },
              { name: 'Chill Vibes', gradient: 'from-emerald-500 to-teal-600', query: 'chill lofi' },
              { name: 'Rock Classics', gradient: 'from-red-500 to-red-700', query: 'classic rock' },
              { name: 'R&B Soul', gradient: 'from-purple-500 to-violet-700', query: 'r&b soul' },
              { name: 'EDM', gradient: 'from-cyan-400 to-blue-600', query: 'edm dance' },
              { name: 'Indie', gradient: 'from-lime-400 to-green-600', query: 'indie music' },
              { name: 'Bollywood', gradient: 'from-yellow-400 to-amber-600', query: 'bollywood hits' },
            ].map((genre) => (
              <button
                key={genre.name}
                onClick={() => setQuery(genre.query)}
                className={`relative overflow-hidden rounded-xl p-5 h-28 bg-gradient-to-br ${genre.gradient} text-left group hover:scale-[1.02] transition-transform duration-200`}
              >
                <span className="text-lg font-bold text-white relative z-10">
                  {genre.name}
                </span>
                <div className="absolute bottom-0 right-0 w-20 h-20 bg-black/10 rounded-tl-full" />
              </button>
            ))}
          </div>
        </div>
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

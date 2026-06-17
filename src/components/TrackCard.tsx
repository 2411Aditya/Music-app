'use client';

import React, { useState } from 'react';
import { Play, Pause, Plus, MoreHorizontal } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { Track } from '@/lib/types';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface TrackCardProps {
  track: Track;
  trackList?: Track[];
  onAddToPlaylist?: (track: Track) => void;
  index?: number;
}

export default function TrackCard({ track, trackList, onAddToPlaylist, index = 0 }: TrackCardProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
  const [isHovered, setIsHovered] = useState(false);
  const isCurrentTrack = currentTrack?.id === track.id;

  function handlePlay() {
    if (isCurrentTrack) {
      togglePlay();
    } else {
      playTrack(track, trackList);
    }
  }

  return (
    <div
      className="group relative rounded-xl p-3 transition-all duration-300 hover:bg-[var(--bg-elevated)] cursor-pointer"
      style={{ animationDelay: `${index * 0.05}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handlePlay}
    >
      {/* Cover Art */}
      <div className="relative aspect-square rounded-lg overflow-hidden mb-3 bg-[var(--bg-surface)] shadow-lg">
        {track.cover_url ? (
          <Image
            src={track.cover_url}
            alt={track.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="200px"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-hover)]">
            <Play size={32} className="text-[var(--text-muted)]" />
          </div>
        )}

        {/* Play Button Overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-black/40 flex items-end justify-end p-2 transition-opacity duration-200',
            isHovered || isCurrentTrack ? 'opacity-100' : 'opacity-0'
          )}
        >
          <button
            className={cn(
              'w-11 h-11 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-105',
              isCurrentTrack && isPlaying
                ? 'bg-[var(--accent-primary)]'
                : 'bg-[var(--accent-primary)]'
            )}
            onClick={(e) => {
              e.stopPropagation();
              handlePlay();
            }}
          >
            {isCurrentTrack && isPlaying ? (
              <Pause size={20} className="text-white" fill="white" />
            ) : (
              <Play size={20} className="text-white ml-0.5" fill="white" />
            )}
          </button>
        </div>

        {/* Now Playing Indicator */}
        {isCurrentTrack && isPlaying && (
          <div className="absolute top-2 left-2">
            <div className="equalizer">
              <div className="equalizer-bar" />
              <div className="equalizer-bar" />
              <div className="equalizer-bar" />
              <div className="equalizer-bar" />
            </div>
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="min-w-0">
        <p
          className={cn(
            'text-sm font-semibold truncate mb-0.5',
            isCurrentTrack ? 'text-[var(--accent-primary)]' : 'text-white'
          )}
        >
          {track.title}
        </p>
        <p className="text-xs text-[var(--text-secondary)] truncate">
          {track.artist}
        </p>
      </div>

      {/* Add to Playlist Button */}
      {onAddToPlaylist && (
        <button
          className={cn(
            'absolute top-4 right-4 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-black/80 hover:scale-110',
          )}
          onClick={(e) => {
            e.stopPropagation();
            onAddToPlaylist(track);
          }}
          title="Add to playlist"
        >
          <Plus size={14} />
        </button>
      )}
    </div>
  );
}

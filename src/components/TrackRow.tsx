'use client';

import React from 'react';
import { Play, Pause, X, Clock } from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { Track } from '@/lib/types';
import { formatDuration, cn } from '@/lib/utils';
import Image from 'next/image';

interface TrackRowProps {
  track: Track;
  index: number;
  trackList?: Track[];
  showRemove?: boolean;
  onRemove?: (trackId: string) => void;
  onAddToPlaylist?: (track: Track) => void;
}

export default function TrackRow({
  track,
  index,
  trackList,
  showRemove,
  onRemove,
  onAddToPlaylist,
}: TrackRowProps) {
  const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer();
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
      className={cn(
        'group flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer',
        isCurrentTrack
          ? 'bg-[var(--accent-glow)]'
          : 'hover:bg-[var(--bg-elevated)]'
      )}
      onClick={handlePlay}
    >
      {/* Index / Play Icon */}
      <div className="w-8 flex justify-center flex-shrink-0">
        {isCurrentTrack && isPlaying ? (
          <div className="equalizer">
            <div className="equalizer-bar" />
            <div className="equalizer-bar" />
            <div className="equalizer-bar" />
            <div className="equalizer-bar" />
          </div>
        ) : (
          <>
            <span className="text-sm text-[var(--text-muted)] group-hover:hidden tabular-nums">
              {index + 1}
            </span>
            <button
              className="hidden group-hover:flex text-white"
              onClick={(e) => {
                e.stopPropagation();
                handlePlay();
              }}
            >
              {isCurrentTrack && isPlaying ? (
                <Pause size={16} fill="currentColor" />
              ) : (
                <Play size={16} fill="currentColor" />
              )}
            </button>
          </>
        )}
      </div>

      {/* Cover + Info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-md overflow-hidden bg-[var(--bg-surface)] flex-shrink-0">
          {track.cover_url ? (
            <Image
              src={track.cover_url}
              alt={track.title}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-hover)]">
              <Play size={14} className="text-[var(--text-muted)]" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-sm font-medium truncate',
              isCurrentTrack ? 'text-[var(--accent-primary)]' : 'text-white'
            )}
          >
            {track.title}
          </p>
          <p className="text-xs text-[var(--text-secondary)] truncate">
            {track.artist}
          </p>
        </div>
      </div>

      {/* Duration */}
      <span className="text-sm text-[var(--text-muted)] tabular-nums flex-shrink-0">
        {formatDuration(track.duration)}
      </span>

      {/* Remove Button */}
      {showRemove && onRemove && (
        <button
          className="opacity-0 group-hover:opacity-100 text-[var(--text-muted)] hover:text-[var(--error)] transition-all ml-2"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(track.id);
          }}
          title="Remove from playlist"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}

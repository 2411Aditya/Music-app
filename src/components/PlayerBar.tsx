'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
  Repeat,
  Shuffle,
  ListMusic,
  Maximize2,
  Plus,
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { formatDuration, cn } from '@/lib/utils';
import Image from 'next/image';
import AddToPlaylistModal from '@/components/AddToPlaylistModal';

export default function PlayerBar() {
  const {
    currentTrack,
    isPlaying,
    volume,
    progress,
    duration,
    togglePlay,
    nextTrack,
    prevTrack,
    setVolume,
    seekTo,
  } = usePlayer();

  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const [prevVolume, setPrevVolume] = useState(0.7);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressBarRefMobile = useRef<HTMLDivElement>(null);
  const dragProgressRef = useRef(0);

  const displayProgress = isDragging ? dragProgress : progress;
  const progressPercent = duration > 0 ? (displayProgress / duration) * 100 : 0;

  function updateProgressFromX(clientX: number, isMobile: boolean) {
    const ref = isMobile ? progressBarRefMobile : progressBarRef;
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = x / rect.width;
    const newTime = percent * duration;
    setDragProgress(newTime);
    dragProgressRef.current = newTime;
  }

  function handleProgressMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    updateProgressFromX(e.clientX, false);

    const handleMouseMove = (event: MouseEvent) => {
      updateProgressFromX(event.clientX, false);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      seekTo(dragProgressRef.current);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  function handleProgressTouchStart(e: React.TouchEvent) {
    setIsDragging(true);
    const touch = e.touches[0];
    if (!touch) return;
    updateProgressFromX(touch.clientX, true);

    const handleTouchMove = (event: TouchEvent) => {
      const t = event.touches[0];
      if (t) {
        updateProgressFromX(t.clientX, true);
      }
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
      seekTo(dragProgressRef.current);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);
  }

  function toggleMute() {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume);
    }
  }

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  if (!currentTrack) {
    return (
      <div className="h-[80px] glass-strong border-t border-[var(--border-subtle)] flex items-center justify-center">
        <p className="text-sm text-[var(--text-muted)]">
          Select a track to start listening
        </p>
      </div>
    );
  }

  return (
    <div className="h-[64px] md:h-[80px] glass-strong border-t border-[var(--border-subtle)] flex items-center px-3 md:px-4 gap-2 md:gap-4 z-50">
      {/* Left: Track Info */}
      <div className="flex items-center gap-2 md:gap-3 flex-1 md:flex-none md:w-[280px] min-w-0">
        <div className="relative flex-shrink-0">
          <div className="w-10 h-10 md:w-14 md:h-14 rounded-md overflow-hidden bg-[var(--bg-elevated)]">
            {currentTrack.cover_url ? (
              <Image
                src={currentTrack.cover_url}
                alt={currentTrack.title}
                width={56}
                height={56}
                className={cn(
                  'w-full h-full object-cover transition-transform duration-500',
                  isPlaying && 'scale-105'
                )}
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ListMusic size={20} className="text-[var(--text-muted)]" />
              </div>
            )}
          </div>
          {isPlaying && (
            <div className="hidden md:flex absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent-primary)] items-center justify-center animate-pulse-glow">
              <div className="equalizer" style={{ height: 10, gap: 1 }}>
                <div className="equalizer-bar" style={{ width: 2 }} />
                <div className="equalizer-bar" style={{ width: 2 }} />
                <div className="equalizer-bar" style={{ width: 2 }} />
              </div>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate text-white animate-slide-right">
            {currentTrack.title}
          </p>
          <p className="text-xs text-[var(--text-secondary)] truncate">
            {currentTrack.artist}
          </p>
        </div>
        {/* Add to Playlist button */}
        <button
          onClick={() => setShowAddToPlaylist(true)}
          className="text-[var(--text-secondary)] hover:text-white p-2 rounded-full hover:bg-[var(--bg-hover)] transition-all flex-shrink-0"
          title="Add to playlist"
        >
          <Plus size={18} />
        </button>
        {/* Mobile Play Controls */}
        <div className="flex md:hidden items-center gap-3 pr-2 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevTrack();
            }}
            className="text-[var(--text-secondary)] hover:text-white transition-colors p-1"
            title="Previous Song"
          >
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
            className="text-white hover:scale-105 active:scale-95 transition-transform p-1"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextTrack();
            }}
            className="text-[var(--text-secondary)] hover:text-white transition-colors p-1"
            title="Next Song"
          >
            <SkipForward size={20} fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Center: Controls + Progress (Hidden on mobile) */}
      <div className="hidden md:flex flex-1 flex-col items-center max-w-[720px] mx-auto">
        {/* Playback Controls */}
        <div className="flex items-center gap-4 mb-1">
          <button className="text-[var(--text-muted)] hover:text-white transition-colors">
            <Shuffle size={16} />
          </button>
          <button
            onClick={prevTrack}
            className="text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            <SkipBack size={20} fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying ? (
              <Pause size={18} className="text-black" fill="black" />
            ) : (
              <Play size={18} className="text-black ml-0.5" fill="black" />
            )}
          </button>
          <button
            onClick={nextTrack}
            className="text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            <SkipForward size={20} fill="currentColor" />
          </button>
          <button className="text-[var(--text-muted)] hover:text-white transition-colors">
            <Repeat size={16} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-[11px] text-[var(--text-muted)] w-10 text-right tabular-nums">
            {formatDuration(displayProgress)}
          </span>
          <div
            ref={progressBarRef}
            className="flex-1 h-5 flex items-center cursor-pointer group"
            onMouseDown={handleProgressMouseDown}
          >
            <div className="w-full h-1 rounded-full bg-white/10 relative group-hover:h-1.5 transition-all">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
                style={{ width: `${progressPercent}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                style={{ left: `calc(${progressPercent}% - 6px)` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-[var(--text-muted)] w-10 tabular-nums">
            {formatDuration(duration)}
          </span>
        </div>
      </div>

      {/* Right: Volume (Hidden on mobile) */}
      <div className="hidden md:flex items-center gap-2 w-[180px] justify-end">
        <button
          onClick={toggleMute}
          className="text-[var(--text-secondary)] hover:text-white transition-colors"
        >
          <VolumeIcon size={18} />
        </button>
        <div className="w-24 relative group">
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full"
            style={{
              background: `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%, rgba(255,255,255,0.1) 100%)`,
              height: 4,
              borderRadius: 2,
            }}
          />
        </div>
      </div>
      
      {/* Mobile Progress Bar (interactive touch/drag seek) */}
      <div 
        ref={progressBarRefMobile}
        className="md:hidden absolute top-[-6px] left-0 right-0 h-4 flex items-center cursor-pointer z-50 group"
        onTouchStart={handleProgressTouchStart}
        onMouseDown={handleProgressMouseDown}
      >
        <div className="w-full h-[3px] bg-white/10 relative group-hover:h-1 transition-all">
          <div 
            className="h-full bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)]"
            style={{ width: `${progressPercent}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-lg transition-transform scale-100 group-hover:scale-110"
            style={{ left: `calc(${progressPercent}% - 5px)` }}
          />
        </div>
      </div>

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        isOpen={showAddToPlaylist}
        onClose={() => setShowAddToPlaylist(false)}
        track={currentTrack}
      />
    </div>
  );
}

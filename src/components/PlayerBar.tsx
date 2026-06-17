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
} from 'lucide-react';
import { usePlayer } from '@/context/PlayerContext';
import { formatDuration, cn } from '@/lib/utils';
import Image from 'next/image';

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
  const progressBarRef = useRef<HTMLDivElement>(null);

  const displayProgress = isDragging ? dragProgress : progress;
  const progressPercent = duration > 0 ? (displayProgress / duration) * 100 : 0;

  function handleProgressMouseDown(e: React.MouseEvent) {
    setIsDragging(true);
    updateProgressFromMouse(e);
  }

  function updateProgressFromMouse(e: React.MouseEvent | MouseEvent) {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = x / rect.width;
    const newTime = percent * duration;
    setDragProgress(newTime);
  }

  useEffect(() => {
    if (!isDragging) return;

    function handleMouseMove(e: MouseEvent) {
      updateProgressFromMouse(e);
    }

    function handleMouseUp() {
      setIsDragging(false);
      seekTo(dragProgress);
    }

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragProgress, seekTo]);

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
    <div className="h-[80px] glass-strong border-t border-[var(--border-subtle)] flex items-center px-4 gap-4 z-50">
      {/* Left: Track Info */}
      <div className="flex items-center gap-3 w-[280px] min-w-[180px]">
        <div className="relative group flex-shrink-0">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-[var(--bg-elevated)]">
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
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--accent-primary)] flex items-center justify-center animate-pulse-glow">
              <div className="equalizer" style={{ height: 10, gap: 1 }}>
                <div className="equalizer-bar" style={{ width: 2 }} />
                <div className="equalizer-bar" style={{ width: 2 }} />
                <div className="equalizer-bar" style={{ width: 2 }} />
              </div>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate text-white animate-slide-right">
            {currentTrack.title}
          </p>
          <p className="text-xs text-[var(--text-secondary)] truncate">
            {currentTrack.artist}
          </p>
        </div>
      </div>

      {/* Center: Controls + Progress */}
      <div className="flex-1 flex flex-col items-center max-w-[720px] mx-auto">
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

      {/* Right: Volume */}
      <div className="flex items-center gap-2 w-[180px] justify-end">
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
    </div>
  );
}

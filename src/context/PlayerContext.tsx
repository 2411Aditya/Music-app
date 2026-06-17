'use client';

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';
import { Track } from '@/lib/types';
import { getStreamUrl } from '@/lib/utils';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  volume: number;
  progress: number;
  duration: number;
  playTrack: (track: Track, trackList?: Track[]) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  seekTo: (time: number) => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [volume, setVolumeState] = useState(0.7);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.7;
    audioRef.current = audio;

    audio.addEventListener('timeupdate', () => {
      setProgress(audio.currentTime);
    });

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('ended', () => {
      // Auto-play next track
      setQueue(prev => {
        if (prev.length > 0) {
          const [nextTrack, ...rest] = prev;
          setCurrentTrack(nextTrack);
          audio.src = getStreamUrl(nextTrack.id);
          audio.play().catch(console.error);
          setIsPlaying(true);
          return rest;
        }
        setIsPlaying(false);
        return prev;
      });
    });

    audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      setIsPlaying(false);
    });

    return () => {
      audio.pause();
      audio.src = '';
      audio.load();
    };
  }, []);

  const playTrack = useCallback((track: Track, trackList?: Track[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    // Stop current playback and release network connection
    audio.pause();
    audio.src = '';
    audio.load();

    setCurrentTrack(track);
    audio.src = getStreamUrl(track.id);
    audio.play().catch(console.error);
    setIsPlaying(true);
    setProgress(0);

    // If a track list is provided, queue the remaining tracks
    if (trackList) {
      const currentIndex = trackList.findIndex(t => t.id === track.id);
      if (currentIndex !== -1) {
        setQueue(trackList.slice(currentIndex + 1));
      }
    }
  }, []);

  const pauseTrack = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
  }, []);

  const resumeTrack = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.play().catch(console.error);
    setIsPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pauseTrack();
    } else {
      resumeTrack();
    }
  }, [isPlaying, pauseTrack, resumeTrack]);

  const nextTrack = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (queue.length > 0) {
      const [next, ...rest] = queue;
      setCurrentTrack(next);
      audio.pause();
      audio.src = '';
      audio.load();
      audio.src = getStreamUrl(next.id);
      audio.play().catch(console.error);
      setIsPlaying(true);
      setProgress(0);
      setQueue(rest);
    }
  }, [queue]);

  const prevTrack = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    // If more than 3 seconds in, restart current track
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = vol;
    setVolumeState(vol);
  }, []);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setProgress(time);
  }, []);

  const addToQueue = useCallback((track: Track) => {
    setQueue(prev => [...prev, track]);
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        queue,
        volume,
        progress,
        duration,
        playTrack,
        pauseTrack,
        resumeTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        setVolume,
        seekTo,
        addToQueue,
        removeFromQueue,
        clearQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Search,
  Library,
  Plus,
  Music2,
  ListMusic,
  ChevronRight,
  Disc3,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Playlist } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  onCreatePlaylist: () => void;
}

export default function Sidebar({ onCreatePlaylist }: SidebarProps) {
  const pathname = usePathname();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    fetchPlaylists();

    // Subscribe to playlist changes
    const channel = supabase
      .channel('playlists-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'playlists' }, () => {
        fetchPlaylists();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchPlaylists() {
    const { data } = await supabase
      .from('playlists')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setPlaylists(data);
  }

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search' },
  ];

  return (
    <aside
      className={cn(
        'flex flex-col h-full transition-all duration-300 ease-out',
        isCollapsed ? 'w-[72px]' : 'w-[280px]'
      )}
      style={{ minWidth: isCollapsed ? 72 : 280 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="relative flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] flex items-center justify-center">
            <Disc3 size={20} className="text-white" />
          </div>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] blur-lg opacity-30" />
        </div>
        {!isCollapsed && (
          <span className="text-lg font-bold gradient-text tracking-tight">
            Sonora
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="px-3 mb-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group mb-0.5',
                isActive
                  ? 'bg-[var(--bg-elevated)] text-white'
                  : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)]'
              )}
            >
              <item.icon
                size={20}
                className={cn(
                  'flex-shrink-0 transition-colors',
                  isActive ? 'text-[var(--accent-primary)]' : 'group-hover:text-white'
                )}
              />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Library Section */}
      <div className="flex-1 flex flex-col min-h-0 mx-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
        {/* Library Header */}
        <div className="flex items-center justify-between px-4 py-3.5">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-white transition-colors"
          >
            <Library size={20} />
            {!isCollapsed && (
              <span className="text-sm font-semibold">Your Library</span>
            )}
          </button>
          {!isCollapsed && (
            <button
              onClick={onCreatePlaylist}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)] transition-all"
              title="Create playlist"
            >
              <Plus size={16} />
            </button>
          )}
        </div>

        {/* Playlist List */}
        <div className="flex-1 overflow-y-auto px-2 pb-2">
          {playlists.length === 0 ? (
            <div className={cn('px-3 py-4', !isCollapsed && 'text-center')}>
              {!isCollapsed && (
                <>
                  <p className="text-sm text-[var(--text-secondary)] mb-3">
                    Create your first playlist
                  </p>
                  <button
                    onClick={onCreatePlaylist}
                    className="px-4 py-2 text-xs font-semibold rounded-full bg-white text-black hover:scale-105 transition-transform"
                  >
                    Create Playlist
                  </button>
                </>
              )}
            </div>
          ) : (
            playlists.map((playlist) => (
              <Link
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group',
                  pathname === `/playlist/${playlist.id}`
                    ? 'bg-[var(--bg-hover)]'
                    : 'hover:bg-[var(--bg-elevated)]'
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-hover)] flex items-center justify-center flex-shrink-0">
                  <ListMusic size={16} className="text-[var(--text-muted)]" />
                </div>
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate text-[var(--text-primary)]">
                      {playlist.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      Playlist
                    </p>
                  </div>
                )}
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Spacer for bottom player bar */}
      <div className="h-2" />
    </aside>
  );
}

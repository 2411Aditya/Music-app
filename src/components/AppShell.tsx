'use client';

import React, { useState } from 'react';
import { PlayerProvider } from '@/context/PlayerContext';
import Sidebar from '@/components/Sidebar';
import PlayerBar from '@/components/PlayerBar';
import CreatePlaylistModal from '@/components/CreatePlaylistModal';

import { Home, Search, Library } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/search', icon: Search, label: 'Search' },
  ];

  return (
    <PlayerProvider>
      <div className="h-[100dvh] flex flex-col bg-[var(--bg-primary)] overflow-hidden">
        {/* Main Content Area */}
        <div className="flex flex-1 min-h-0 p-2 gap-2 relative">
          {/* Sidebar (Desktop only) */}
          <Sidebar onCreatePlaylist={() => setShowCreatePlaylist(true)} />

          {/* Main Content */}
          <main className="flex-1 rounded-xl bg-[var(--bg-secondary)] overflow-y-auto overflow-x-hidden relative pb-[115px] md:pb-0">
            {children}
          </main>
          
          {/* Mobile Navigation (Mobile only) */}
          <div className="md:hidden absolute bottom-2 left-2 right-2 rounded-xl bg-black/80 backdrop-blur-xl border border-[var(--border-subtle)] flex items-center justify-around p-2 z-40">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                    isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-secondary)] hover:text-white'
                  }`}
                >
                  <item.icon size={24} />
                  <span className="text-[10px] mt-1 font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Player Bar */}
        <div className="z-50">
          <PlayerBar />
        </div>

        {/* Modals */}
        <CreatePlaylistModal
          isOpen={showCreatePlaylist}
          onClose={() => setShowCreatePlaylist(false)}
        />
      </div>
    </PlayerProvider>
  );
}

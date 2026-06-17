'use client';

import React, { useState } from 'react';
import { PlayerProvider } from '@/context/PlayerContext';
import Sidebar from '@/components/Sidebar';
import PlayerBar from '@/components/PlayerBar';
import CreatePlaylistModal from '@/components/CreatePlaylistModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);

  return (
    <PlayerProvider>
      <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
        {/* Main Content Area */}
        <div className="flex flex-1 min-h-0 p-2 gap-2">
          {/* Sidebar */}
          <Sidebar onCreatePlaylist={() => setShowCreatePlaylist(true)} />

          {/* Main Content */}
          <main className="flex-1 rounded-xl bg-[var(--bg-secondary)] overflow-y-auto overflow-x-hidden">
            {children}
          </main>
        </div>

        {/* Player Bar */}
        <PlayerBar />

        {/* Modals */}
        <CreatePlaylistModal
          isOpen={showCreatePlaylist}
          onClose={() => setShowCreatePlaylist(false)}
        />
      </div>
    </PlayerProvider>
  );
}

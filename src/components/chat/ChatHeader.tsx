'use client';

import React from 'react';
import { Search, MoreVertical, ArrowLeft } from 'lucide-react';
import { useUIStore } from '@/state/uiStore'; // BARU: Panggil state UI

export function ChatHeader({ session }: { session: any }) {
  const { setSidebarOpen } = useUIStore(); // BARU: Fungsi untuk membuka Sidebar

  return (
    <header className="h-[60px] px-4 flex items-center justify-between bg-[var(--color-bg-surface)] shrink-0 border-b border-[var(--color-border-default)]">
      <div className="flex items-center gap-3">
        {/* BARU: Tombol Back Khusus Mobile */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="md:hidden p-1 -ml-2 text-[var(--color-text-secondary)] rounded-full hover:bg-black/5 dark:hover:bg-white/5"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold shrink-0">
          {session.chatName.substring(0, 1).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-[var(--color-text-primary)] truncate">
            {session.chatName}
          </h2>
          <div className="text-xs text-[var(--color-text-secondary)] truncate">
            {session.chatType === 'group' ? 'Tap here for group info' : 'Click here for contact info'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 text-[var(--color-header-icon)] hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
          <Search size={20} />
        </button>
        <button className="p-2 text-[var(--color-header-icon)] hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>
    </header>
  );
}
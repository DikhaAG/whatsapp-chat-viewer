'use client';

import React from 'react';
import { ArrowLeft, MoreVertical, Search, Phone, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChatSession } from '@/types/chat';

interface ChatHeaderProps {
  session: ChatSession;
}

export function ChatHeader({ session }: ChatHeaderProps) {
  const router = useRouter();

  return (
    <header className="h-[60px] px-4 flex items-center justify-between bg-[var(--color-bg-surface)] border-b border-[var(--color-border-default)] shrink-0 z-10 shadow-sm">
      <div className="flex items-center flex-1 min-w-0">
        <button
          onClick={() => router.push('/')}
          className="mr-2 p-1 text-[var(--color-header-icon)] hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="w-10 h-10 rounded-full bg-gray-400 shrink-0 mr-3 flex items-center justify-center text-white font-bold">
          {session.chatName.substring(0, 1).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-[var(--color-text-primary)] font-semibold truncate leading-tight">
            {session.chatName}
          </h2>
          <p className="text-[11px] text-[var(--color-text-secondary)] truncate">
            {session.chatType === 'group' ? 'Group Chat' : 'Contact'}
          </p>
        </div>
      </div>

      {/* <div className="flex items-center gap-1 sm:gap-4 text-[var(--color-header-icon)]">
         <button className="hidden sm:block p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
            <Video size={20} />
         </button>
         <button className="hidden sm:block p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
            <Phone size={20} />
         </button>
         <div className="w-[1px] h-6 bg-[var(--color-border-default)] mx-1 hidden sm:block" />
         <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
            <Search size={20} />
         </button>
         <button className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full">
            <MoreVertical size={20} />
         </button>
      </div> */}
    </header>
  );
}

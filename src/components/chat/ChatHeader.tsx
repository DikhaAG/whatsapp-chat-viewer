'use client';

import React, { useEffect, useRef } from 'react';
import { ArrowLeft, MoreVertical, Search, Phone, Video, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChatSession } from '@/types/chat';

interface ChatHeaderProps {
  session: ChatSession;
  isSearching?: boolean;
  setIsSearching?: (val: boolean) => void;
  searchQuery?: string;
  setSearchQuery?: (val: string) => void;
  matchCount?: number;
  currentMatchIndex?: number;
  onNextMatch?: () => void;
  onPrevMatch?: () => void;
}

export function ChatHeader({ session, isSearching, setIsSearching, searchQuery, setSearchQuery, matchCount = 0, currentMatchIndex = 0, onNextMatch, onPrevMatch }: ChatHeaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearching && inputRef.current) inputRef.current.focus();
  }, [isSearching]);

  if (isSearching) {
    return (
      <header className="h-[60px] px-4 flex items-center bg-[var(--color-bg-surface)] border-b border-[var(--color-border-default)] shrink-0 z-10 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
        <button
          onClick={() => {
            setIsSearching?.(false);
            setSearchQuery?.('');
          }}
          className="mr-2 p-2 text-[#00a884] hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search messages..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery?.(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)] text-[16px]"
          />
        </div>

        {searchQuery && (
          <div className="flex items-center gap-2">
            {matchCount > 0 && (
              <span className="text-xs font-medium text-[var(--color-text-secondary)] whitespace-nowrap mr-2">
                {currentMatchIndex + 1} of {matchCount}
              </span>
            )}

            <div className="flex border border-[var(--color-border-default)] rounded-md overflow-hidden">
              <button
                onClick={onPrevMatch}
                disabled={currentMatchIndex === 0 || matchCount === 0}
                className="p-1.5 text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronUp size={20} />
              </button>
              <div className="w-[1px] bg-[var(--color-border-default)]" />
              <button
                onClick={onNextMatch}
                disabled={currentMatchIndex === matchCount - 1 || matchCount === 0}
                className="p-1.5 text-[var(--color-text-secondary)] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent"
              >
                <ChevronDown size={20} />
              </button>
            </div>

            <button onClick={() => setSearchQuery?.('')} className="p-2 ml-1 text-[var(--color-text-secondary)] hover:bg-black/5 rounded-full">
              <X size={20} />
            </button>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="h-[60px] px-4 flex items-center justify-between bg-[var(--color-bg-surface)] border-b border-[var(--color-border-default)] shrink-0 z-10 shadow-sm">
      <div className="flex items-center flex-1 min-w-0">
        <button onClick={() => router.push('/')} className="mr-2 p-1 text-[var(--color-header-icon)] rounded-full"><ArrowLeft size={20} /></button>
        <div className="w-10 h-10 rounded-full bg-gray-400 shrink-0 mr-3 flex items-center justify-center text-white font-bold">{session.chatName.substring(0, 1).toUpperCase()}</div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[var(--color-text-primary)] font-semibold truncate leading-tight">{session.chatName}</h2>
          <p className="text-[11px] text-[var(--color-text-secondary)] truncate">{session.chatType === 'group' ? 'Group Chat' : 'Contact'}</p>
        </div>
      </div>
      <div className="flex items-center gap-1 sm:gap-4 text-[var(--color-header-icon)]">
        {/* <button className="hidden sm:block p-2 rounded-full"><Video size={20} /></button> */}
        {/* <button className="hidden sm:block p-2 rounded-full"><Phone size={20} /></button> */}
        <button onClick={() => setIsSearching?.(true)} className="p-2 rounded-full"><Search size={20} /></button>
        {/* <button className="p-2 rounded-full"><MoreVertical size={20} /></button> */}
      </div>
    </header>
  );
}
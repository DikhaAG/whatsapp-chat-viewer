'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Upload, Trash2, MessageSquare, Search, MoreVertical } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useChatStore } from '@/state/chatStore';
import { useUIStore } from '@/state/uiStore';
import { extractChatFromZip } from '@/lib/utils/zipHandler';
import { parseChatText } from '@/lib/parsing/chatParser';
import { ThemeToggle } from './ThemeToggle';
import { dbService } from '@/lib/db/indexedDbService';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const { chatSessions, activeChatId, setActiveChat, importNewChat, removeChat, isLoading, setAttachmentMap } = useChatStore();
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. STATE PENCARIAN
  const [searchQuery, setSearchQuery] = useState('');

  // 2. STATE PROGRESS BAR
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  useEffect(() => {
    if (pathname === '/') {
      setSidebarOpen(true);
    }
  }, [pathname, setSidebarOpen]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadProgress(0);
      setUploadStatus('Memulai proses...');

      const { chatText, fileName, attachmentMap, rawBlobs } = await extractChatFromZip(file, (progress, status) => {
        setUploadProgress(progress);
        setUploadStatus(status);
      });

      const safeId = fileName.replace(/\.zip$/i, '').replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const sessionId = safeId + '-' + Date.now();
      const chatName = fileName.replace(/\.zip$/i, '');

      setUploadStatus('Menyusun format pesan...');
      const session = await parseChatText(chatText, sessionId, chatName);

      setUploadStatus('Menyimpan pesan teks ke IndexedDB...');
      await importNewChat(session);

      if (rawBlobs && rawBlobs.length > 0) {
        setUploadStatus(`Menyimpan ${rawBlobs.length} file media ke database...`);
        for (let i = 0; i < rawBlobs.length; i++) {
          await dbService.saveAttachment(sessionId, rawBlobs[i].fileName, rawBlobs[i].blob);
        }
      }

      if (Object.keys(attachmentMap).length > 0) {
        setAttachmentMap(sessionId, attachmentMap);
      }

      handleChatClick(sessionId);
    } catch (error: any) {
      alert(`Failed to import chat: ${error.message}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setUploadProgress(null), 1000);
    }
  };

  const handleChatClick = (sessionId: string) => {
    setActiveChat(sessionId);
    router.push(`/chat/${sessionId}`);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // 3. LOGIKA MESIN PENYARING (FILTER)
  const filteredSessions = chatSessions.filter(session =>
    session.chatName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <aside className={`h-full flex flex-col border-r border-[var(--color-border-default)] bg-[var(--color-bg-surface)] overflow-hidden transition-all duration-300 z-40 shrink-0
        ${isSidebarOpen
          ? 'absolute w-full inset-0 md:relative md:w-[350px] md:flex'
          : 'hidden md:flex md:w-[350px] md:relative'
        }`}
      >
        <header className="h-[60px] px-4 flex items-center justify-between bg-[var(--color-bg-surface)] shrink-0">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleImportClick}
              disabled={isLoading || uploadProgress !== null}
              className="p-2 text-[var(--color-header-icon)] hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
            >
              <Upload size={20} />
            </button>
            <button className="p-2 text-[var(--color-header-icon)] hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
              <MoreVertical size={20} />
            </button>
          </div>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".zip" className="hidden" />
        </header>

        {/* 4. KOTAK PENCARIAN YANG AKTIF */}
        <div className="p-2 shrink-0 border-b border-[var(--color-border-default)]/50">
          <div className="relative flex items-center bg-[var(--color-bg-primary)] rounded-lg px-3 py-1.5 focus-within:bg-[var(--color-bg-surface)] focus-within:ring-1 focus-within:ring-[#00a884] transition-all">
            <Search size={18} className="text-[var(--color-text-secondary)] mr-3 shrink-0" />
            <input
              type="text"
              placeholder="Search imported chats"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm w-full text-[var(--color-text-primary)] outline-none placeholder:text-[var(--color-text-secondary)]"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] ml-2 shrink-0">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {chatSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center text-[var(--color-text-secondary)] opacity-60">
              <MessageSquare size={48} className="mb-4" />
              <p className="text-sm">No chats imported yet.</p>
              <button onClick={handleImportClick} className="mt-4 text-[#00a884] font-medium hover:underline text-sm">
                Import your first ZIP
              </button>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-[var(--color-text-secondary)]">
              <p className="text-sm">No chats found for "{searchQuery}"</p>
            </div>
          ) : (
            <div>
              {/* 5. GUNAKAN ARRAY YANG SUDAH DISARING (filteredSessions) */}
              {filteredSessions
                .sort((a, b) => b.lastActivityTimestamp - a.lastActivityTimestamp)
                .map((session) => (
                  <div
                    key={session.sessionId}
                    onClick={() => handleChatClick(session.sessionId)}
                    className={`flex items-center px-4 py-3 cursor-pointer transition-colors relative group border-b border-[var(--color-border-default)]/30 ${activeChatId === session.sessionId
                        ? 'bg-[#d1d7db]/40 dark:bg-[#374045]'
                        : 'hover:bg-[#f5f6f6] dark:hover:bg-[#2a3942]'
                      }`}
                  >
                    <div className="w-12 h-12 rounded-full bg-gray-400 shrink-0 mr-3 flex items-center justify-center text-white font-bold">
                      {session.chatName.substring(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-semibold text-[var(--color-text-primary)] truncate">{session.chatName}</h3>
                        <span className="text-[10px] text-[var(--color-text-secondary)] shrink-0">
                          {new Date(session.lastActivityTimestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-[var(--color-text-secondary)]">
                        <span className="truncate flex-1">{session.lastMessageSnippet || 'No messages'}</span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete chat history with ${session.chatName}?`)) removeChat(session.sessionId);
                      }}
                      className="absolute right-2 opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      </aside>

      {/* OVERLAY PROGRESS BAR */}
      {uploadProgress !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-[#182229] rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-[var(--color-border-default)]">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <Upload size={20} className="text-[#00a884] animate-bounce" />
              Mengunggah Obrolan...
            </h3>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2 overflow-hidden">
              <div
                className="bg-[#00a884] h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-[var(--color-text-secondary)] font-medium truncate pr-4">
                {uploadStatus}
              </span>
              <span className="text-[var(--color-text-primary)] font-bold shrink-0">
                {uploadProgress}%
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
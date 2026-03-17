'use client';

import React, { useRef, useEffect } from 'react';
import { Upload, Trash2, MessageSquare, Search, MoreVertical } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useChatStore } from '@/state/chatStore';
import { useUIStore } from '@/state/uiStore'; // BARU: Memanggil UI Store
import { extractChatFromZip } from '@/lib/utils/zipHandler';
import { parseChatText } from '@/lib/parsing/chatParser';
import { ThemeToggle } from './ThemeToggle';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const { chatSessions, activeChatId, setActiveChat, importNewChat, removeChat, isLoading, setActiveAttachmentMap } = useChatStore();

  // BARU: Mengambil status dan fungsi dari saklar UI
  const { isSidebarOpen, setSidebarOpen } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // BARU: Memastikan Sidebar selalu terbuka di HP jika berada di halaman utama (kosong)
  useEffect(() => {
    if (pathname === '/') {
      setSidebarOpen(true);
    }
  }, [pathname, setSidebarOpen]);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // ... (Logika ekstraksi file Anda tidak ada yang saya ubah di sini)
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { chatText, fileName, attachmentMap } = await extractChatFromZip(file);
      const sessionId = fileName.replace(/\.zip$/i, '') + '-' + Date.now();
      const chatName = fileName.replace(/\.zip$/i, '');

      const session = await parseChatText(chatText, sessionId, chatName);
      await importNewChat(session);

      if (attachmentMap && setActiveAttachmentMap) {
        setActiveAttachmentMap(attachmentMap);
      }

      handleChatClick(sessionId); // Gunakan fungsi klik yang baru
    } catch (error: any) {
      alert(`Failed to import chat: ${error.message}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // BARU: Logika Cerdas Saat Chat Diklik
  const handleChatClick = (sessionId: string) => {
    setActiveChat(sessionId);
    router.push(`/chat/${sessionId}`);

    // Jika layar kecil (Mobile), tutup Sidebar agar pesan terlihat
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    // BARU: Logika Class CSS Responsif yang meniru WhatsApp Web
    <aside className={`h-full flex flex-col border-r border-[var(--color-border-default)] bg-[var(--color-bg-surface)] overflow-hidden transition-all duration-300 z-40 shrink-0
      ${isSidebarOpen
        ? 'absolute w-full inset-0 md:relative md:w-[350px] md:flex' // Terbuka: Full di Mobile, 350px di Desktop
        : 'hidden md:flex md:w-[350px] md:relative'                  // Tertutup: Hilang di Mobile, 350px di Desktop
      }`}
    >
      <header className="h-[60px] px-4 flex items-center justify-between bg-[var(--color-bg-surface)] shrink-0">
        <div className="w-10 h-10 rounded-full bg-gray-300 flex-shrink-0" />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={handleImportClick}
            disabled={isLoading}
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

      <div className="p-2 shrink-0">
        <div className="relative flex items-center bg-[var(--color-bg-primary)] rounded-lg px-3 py-1.5 focus-within:bg-[var(--color-bg-surface)]">
          <Search size={18} className="text-[var(--color-text-secondary)] mr-3" />
          <input
            type="text"
            placeholder="Search or start new chat"
            className="bg-transparent border-none focus:ring-0 text-sm w-full text-[var(--color-text-primary)] outline-none"
            disabled
          />
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
        ) : (
          <div>
            {chatSessions
              .sort((a, b) => b.lastActivityTimestamp - a.lastActivityTimestamp)
              .map((session) => (
                <div
                  key={session.sessionId}
                  // BARU: Memanggil handleChatClick yang sudah dimodifikasi
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
                      <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
                        {session.chatName}
                      </h3>
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
                      if (confirm(`Delete chat history with ${session.chatName}?`)) {
                        removeChat(session.sessionId);
                      }
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
  );
}
'use client';

import React, { useRef, useState } from 'react';
import { Upload, Trash2, MessageSquare, Search, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useChatStore } from '@/state/chatStore';
import { extractChatFromZip } from '@/lib/utils/zipHandler';
import { parseChatText } from '@/lib/parsing/chatParser';
import { ThemeToggle } from './ThemeToggle';
import { dbService } from '@/lib/db/indexedDbService';

export function Sidebar() {
  const router = useRouter();

  // BARU: Panggil setAttachmentMap dari store
  const { chatSessions, activeChatId, setActiveChat, importNewChat, removeChat, isLoading, setAttachmentMap } = useChatStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // BARU: State lokal untuk indikator progres
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadProgress(0);
      setUploadStatus('Memulai proses...');

      // BARU: Tangkap rawBlobs dari pemanggilan fungsi
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

      // LOGIKA BARU: Simpan data fisik file (Blob) ke IndexedDB
      if (rawBlobs && rawBlobs.length > 0) {
        setUploadStatus(`Menyimpan ${rawBlobs.length} file media ke database...`);

        // Loop untuk menyimpan ke database satu per satu
        // (Kita gunakan loop of array biasa agar tidak membuat browser freeze karena terlalu banyak write ke disk bersamaan)
        for (let i = 0; i < rawBlobs.length; i++) {
          await dbService.saveAttachment(sessionId, rawBlobs[i].fileName, rawBlobs[i].blob);
        }
      }

      if (Object.keys(attachmentMap).length > 0) {
        setAttachmentMap(sessionId, attachmentMap);
      }

      setActiveChat(sessionId);
      router.push(`/chat/${sessionId}`);
    } catch (error: any) {
      alert(`Failed to import chat: ${error.message}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setTimeout(() => setUploadProgress(null), 1000);
    }
  };

  return (
    <>
      <aside className="w-[350px] h-full flex flex-col border-r border-[var(--color-border-default)] bg-[var(--color-bg-surface)] overflow-hidden z-20">
        {/* ... (Header dan Search Bar persis sama seperti sebelumnya) ... */}
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

        <div className="p-2 shrink-0">
          <div className="relative flex items-center bg-[var(--color-bg-primary)] rounded-lg px-3 py-1.5 focus-within:bg-[var(--color-bg-surface)]">
            <Search size={18} className="text-[var(--color-text-secondary)] mr-3" />
            <input type="text" placeholder="Search or start new chat" className="bg-transparent border-none focus:ring-0 text-sm w-full text-[var(--color-text-primary)]" disabled />
          </div>
        </div>

        {/* Chat List */}
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
                    onClick={() => {
                      setActiveChat(session.sessionId);
                      router.push(`/chat/${session.sessionId}`);
                    }}
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

      {/* BARU: UI OVERLAY PROGRESS BAR */}
      {uploadProgress !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white dark:bg-[#182229] rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-[var(--color-border-default)]">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <Upload size={20} className="text-[#00a884] animate-bounce" />
              Mengunggah Obrolan...
            </h3>

            {/* Bar Persentase */}
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
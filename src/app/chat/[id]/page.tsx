'use client';

import React, { useEffect, use, useState } from 'react';
import { useChatStore } from '@/state/chatStore';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { VirtualizedMessageList } from '@/components/chat/VirtualizedMessageList';
import { Loader2 } from 'lucide-react';

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { activeChatId, activeMessages, chatSessions, setActiveChat, isLoading, error, attachmentMaps } = useChatStore();

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  useEffect(() => {
    // Memanggil fungsi async (mengembalikan Promise, tapi dibiarkan mengambang)
    setActiveChat(id);

    // Fungsi pembersih (Cleanup / Destructor)
    return () => {
      // Dengan menggunakan kurung kurawal {}, kita hanya mengeksekusi fungsinya
      // tanpa me-return hasil Promise-nya kepada React.
      setActiveChat(null);
    };
  }, [id, setActiveChat]);

  const currentSession = chatSessions.find(s => s.sessionId === id);

  // Mencatat ID pesan mana saja yang mengandung teks pencarian
  const matchedMessageIds = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return activeMessages
      .filter(msg => msg.content.toLowerCase().includes(query))
      .map(msg => msg.messageId);
  }, [activeMessages, searchQuery]);

  // Selalu mulai navigasi dari temuan paling bawah (terbaru) saat pengguna mengetik
  useEffect(() => {
    if (matchedMessageIds.length > 0) {
      setCurrentMatchIndex(matchedMessageIds.length - 1);
    } else {
      setCurrentMatchIndex(0);
    }
  }, [matchedMessageIds.length]);

  const handlePrevMatch = () => {
    if (currentMatchIndex > 0) setCurrentMatchIndex(prev => prev - 1);
  };

  const handleNextMatch = () => {
    if (currentMatchIndex < matchedMessageIds.length - 1) setCurrentMatchIndex(prev => prev + 1);
  };

  if (isLoading && !currentSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--color-bg-primary)] h-full">
        <Loader2 className="animate-spin text-[#00a884] mb-4" size={40} />
      </div>
    );
  }

  if (error || (!currentSession && !isLoading)) return <div>Chat not found</div>;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {currentSession && (
        <ChatHeader
          session={currentSession}
          isSearching={isSearching}
          setIsSearching={setIsSearching}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          matchCount={matchedMessageIds.length}
          currentMatchIndex={currentMatchIndex}
          onNextMatch={handleNextMatch}
          onPrevMatch={handlePrevMatch}
        />
      )}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        <VirtualizedMessageList
          messages={activeMessages}
          attachmentMap={attachmentMaps[id] || {}}
          searchQuery={searchQuery}
          targetMessageId={matchedMessageIds[currentMatchIndex] || null}
        />

        {isSearching && searchQuery && matchedMessageIds.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#efeae2]/80 dark:bg-[#0b141a]/80 z-10 backdrop-blur-sm pointer-events-none">
            <p className="text-[var(--color-text-secondary)] bg-[var(--color-bg-surface)] px-6 py-3 rounded-xl shadow-md border border-[var(--color-border-default)]">
              No messages found for "{searchQuery}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import React, { useEffect, use } from 'react';
import { useChatStore } from '@/state/chatStore';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { VirtualizedMessageList } from '@/components/chat/VirtualizedMessageList';
import { Loader2 } from 'lucide-react';

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { activeChatId, activeMessages, chatSessions, setActiveChat, isLoading, error, activeAttachmentMap } = useChatStore();

  useEffect(() => {
    setActiveChat(id);

    // Cleanup on unmount
    return () => {
      setActiveChat(null);
    };
  }, [id, setActiveChat]);

  const currentSession = chatSessions.find(s => s.sessionId === id);

  if (isLoading && !currentSession) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--color-bg-primary)] h-full">
        <Loader2 className="animate-spin text-[#00a884] mb-4" size={40} />
        <p className="text-[var(--color-text-secondary)]">Opening your chat...</p>
      </div>
    );
  }

  if (error || (!currentSession && !isLoading)) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--color-bg-primary)] h-full p-8 text-center">
        <h2 className="text-xl font-bold text-red-500 mb-2">Chat not found</h2>
        <p className="text-[var(--color-text-secondary)] mb-4">{error || "The chat you're looking for doesn't exist locally."}</p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-[#00a884] text-white px-6 py-2 rounded-full font-medium"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {currentSession && <ChatHeader session={currentSession} />}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        <VirtualizedMessageList messages={activeMessages} attachmentMap={activeAttachmentMap} />
      </div>
    </div>
  );
}

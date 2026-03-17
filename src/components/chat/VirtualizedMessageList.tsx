'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Message } from '@/types/chat';
import { MessageBubble } from './MessageBubble';

interface VirtualizedMessageListProps {
  messages: Message[];
  attachmentMap?: Record<string, string>;
  searchQuery?: string;
  targetMessageId?: string | null;
}

interface LightboxState { urls: string[]; currentIndex: number; }

export function VirtualizedMessageList({ messages, attachmentMap, searchQuery = '', targetMessageId }: VirtualizedMessageListProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const groupedMessages = useMemo(() => {
    const result: Message[] = [];
    for (const msg of messages) {
      const isMedia = msg.content.includes('<attached:');
      const prev = result[result.length - 1];

      if (isMedia && prev && !prev.isSystemMessage && prev.sender === msg.sender && prev.content.includes('<attached:') && (msg.timestamp - prev.timestamp < 60000)) {
        const merged = {
          ...prev,
          content: prev.content + '\n' + msg.content,
          _mergedIds: [...((prev as any)._mergedIds || [prev.messageId]), msg.messageId]
        };
        result[result.length - 1] = merged;
      } else {
        result.push(msg);
      }
    }
    return result;
  }, [messages]);

  const virtualizer = useVirtualizer({
    count: groupedMessages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 10,
  });

  // Eksekusi Auto-Scroll jika ada target dari pencarian
  useEffect(() => {
    if (targetMessageId) {
      const index = groupedMessages.findIndex(m =>
        m.messageId === targetMessageId || (m as any)._mergedIds?.includes(targetMessageId)
      );
      if (index !== -1) {
        virtualizer.scrollToIndex(index, { align: 'center' });
      }
    } else if (!searchQuery && groupedMessages.length > 0) {
      virtualizer.scrollToIndex(groupedMessages.length - 1, { align: 'end' });
    }
  }, [targetMessageId, groupedMessages, virtualizer, searchQuery]);

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lightbox) return;
    setLightbox({ ...lightbox, currentIndex: (lightbox.currentIndex + 1) % lightbox.urls.length });
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!lightbox) return;
    setLightbox({ ...lightbox, currentIndex: (lightbox.currentIndex - 1 + lightbox.urls.length) % lightbox.urls.length });
  };

  return (
    <>
      <div ref={parentRef} className="flex-1 overflow-y-auto bg-[#efeae2] dark:bg-[#0b141a] relative custom-scrollbar" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundBlendMode: 'overlay', backgroundRepeat: 'repeat' }}>
        <div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const message = groupedMessages[virtualItem.index];
            const isMe = false; // Logic penentuan pengirim "Me" dapat digabungkan dengan backend nanti
            const prevMessage = groupedMessages[virtualItem.index - 1];
            const showSender = !prevMessage || prevMessage.sender !== message.sender;

            return (
              <div key={virtualItem.key} data-index={virtualItem.index} ref={virtualizer.measureElement} className="absolute top-0 left-0 w-full" style={{ transform: `translateY(${virtualItem.start}px)` }}>
                <div className="py-0.5">
                  <MessageBubble
                    message={message}
                    isMe={isMe}
                    showSender={showSender}
                    attachmentMap={attachmentMap}
                    searchQuery={searchQuery}
                    onImageClick={(urls, startingIndex) => setLightbox({ urls, currentIndex: startingIndex })}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm transition-opacity" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors z-50">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
          <div className="absolute top-4 left-4 text-white font-medium bg-black/50 px-3 py-1 rounded-full text-sm z-50">
            {lightbox.currentIndex + 1} / {lightbox.urls.length}
          </div>
          {lightbox.urls.length > 1 && (
            <button onClick={handlePrevImage} className="absolute left-4 p-3 text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors z-50">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
          )}
          <img src={lightbox.urls[lightbox.currentIndex]} className="max-w-[95vw] max-h-[90vh] object-contain rounded-md select-none" onClick={(e) => e.stopPropagation()} alt="Fullscreen" />
          {lightbox.urls.length > 1 && (
            <button onClick={handleNextImage} className="absolute right-4 p-3 text-white bg-black/50 hover:bg-black/80 rounded-full transition-colors z-50">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
            </button>
          )}
        </div>
      )}
    </>
  );
}
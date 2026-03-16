'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Message } from '@/types/chat';
import { getSenderColor, formatTime } from '@/lib/utils/chatUtils';

// ============================================================================
// 1. KOMPONEN PEMUTAR VOICE NOTE (KUSTOM)
// ============================================================================
const VoiceNotePlayer = ({ src, isMe }: { src: string; isMe: boolean }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Mengubah detik menjadi format 0:00
  const formatAudioTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const m = Math.floor(time / 60);
    const s = Math.floor(time % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = (Number(e.target.value) / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
      setProgress(Number(e.target.value));
    }
  };

  return (
    <div className="flex items-center gap-3 min-w-[220px] max-w-[300px] py-1">
      {/* Avatar Bulat (Bisa diganti foto profil nantinya) */}
      <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0 flex items-center justify-center overflow-hidden">
        <svg width="20" height="20" viewBox="0 0 24 24" fill={isMe ? "#fff" : "#888"}>
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5-3c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.81 6.43 6.32 6.92V21h1.36v-3.08C16.19 17.43 19 14.53 19 11h-2z" />
        </svg>
      </div>

      {/* Tombol Play/Pause */}
      <button onClick={togglePlay} className="focus:outline-none flex-shrink-0 text-gray-600 dark:text-gray-300">
        {isPlaying ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
        )}
      </button>

      {/* Area Slider & Waktu */}
      <div className="flex flex-col flex-grow">
        <input
          type="range"
          min="0" max="100"
          value={progress || 0}
          onChange={handleSeek}
          className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer"
          style={{ accentColor: isMe ? '#00A884' : '#53bdeb' }}
        />
        <div className="flex justify-between mt-1 text-[11px] text-gray-500 dark:text-gray-400">
          <span>{formatAudioTime(isPlaying ? currentTime : duration)}</span>
        </div>
      </div>

      {/* Mesin Pemutar Asli (Disembunyikan) */}
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
};

// ============================================================================
// 2. KOMPONEN PEMUTAR VIDEO (KUSTOM)
// ============================================================================
const WhatsAppVideoPlayer = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="relative mt-1 rounded-md overflow-hidden bg-black max-w-sm group cursor-pointer" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={src}
        preload="metadata"
        onEnded={() => setIsPlaying(false)}
        // Menampilkan kontrol bawaan HANYA jika sedang diputar (agar bisa fullscreen)
        controls={isPlaying}
        className="w-full h-auto max-h-64 object-contain"
      />

      {/* Overlay Tombol Play Besar (Mirip WhatsApp) */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center transition-all group-hover:bg-black/40">
          <div className="w-14 h-14 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="white" className="ml-1">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================================
// 3. KOMPONEN UTAMA (GELEMBUNG PESAN)
// ============================================================================
interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  showSender: boolean;
  attachmentMap?: Record<string, string>;
  onImageClick?: (urls: string[], startingIndex: number) => void;
}

export function MessageBubble({ message, isMe, showSender, attachmentMap, onImageClick }: MessageBubbleProps) {

  const renderContent = () => {
    const attachmentRegexGlob = /<attached:\s*(.+?)>/g;
    const matches = Array.from(message.content.matchAll(attachmentRegexGlob));

    if (matches.length > 0) {
      const images: { fileName: string, url: string }[] = [];
      const videos: { fileName: string, url: string }[] = [];
      const audios: { fileName: string, url: string }[] = [];
      const docs: { fileName: string, url: string }[] = [];

      matches.forEach(m => {
        const fileName = m[1].replace(/[\u200E\u200F]/g, '').trim();
        const url = attachmentMap?.[fileName];

        if (url) {
          const ext = fileName.split('.').pop()?.toLowerCase() || '';

          if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
            images.push({ fileName, url });
          } else if (['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext)) {
            videos.push({ fileName, url });
          } else if (['mp3', 'ogg', 'opus', 'm4a', 'wav', 'aac'].includes(ext)) {
            audios.push({ fileName, url });
          } else {
            docs.push({ fileName, url });
          }
        }
      });

      const caption = message.content.replace(attachmentRegexGlob, '').trim();
      const displayImages = images.slice(0, 4);
      const remainingCount = images.length - 4;

      return (
        <div className="flex flex-col gap-1 pr-12">

          {/* GRID GAMBAR */}
          {images.length > 0 && (
            <div className={`grid gap-1 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {displayImages.map((img, idx) => {
                const isLastDisplay = idx === 3;
                const hasMore = remainingCount > 0;
                return (
                  <div key={idx} className="relative cursor-pointer overflow-hidden rounded-md group/img" onClick={() => onImageClick && onImageClick(images.map(i => i.url), idx)}>
                    <img src={img.url} alt={img.fileName} className={`object-cover hover:scale-105 transition-transform duration-300 ${images.length === 1 ? 'max-h-64 w-auto' : 'h-32 w-full aspect-square'}`} />
                    {isLastDisplay && hasMore && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xl font-bold transition-colors group-hover/img:bg-black/50">+{remainingCount}</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* RENDER VIDEO KUSTOM */}
          {videos.map((vid, idx) => (
            <WhatsAppVideoPlayer key={idx} src={vid.url} />
          ))}

          {/* RENDER AUDIO KUSTOM */}
          {audios.map((aud, idx) => (
            <VoiceNotePlayer key={idx} src={aud.url} isMe={isMe} />
          ))}

          {/* RENDER DOKUMEN */}
          {docs.map((doc, idx) => (
            <a key={idx} href={doc.url} download={doc.fileName} className="text-[#53bdeb] bg-black/10 dark:bg-white/10 p-2 rounded-md underline text-sm flex items-center gap-2 mt-1">
              📄 {doc.fileName}
            </a>
          ))}

          {caption && <span className="text-[14.2px] leading-relaxed whitespace-pre-wrap break-words mt-1">{caption}</span>}
        </div>
      );
    }

    return <div className="text-[14.2px] leading-relaxed whitespace-pre-wrap break-words pr-12">{message.content}</div>;
  };

  if (message.isSystemMessage) {
    return (
      <div className="flex justify-center my-2 px-4">
        <span className="bg-[#dcf8c6] dark:bg-[#182229] text-[var(--color-text-secondary)] text-[11.5px] py-1 px-3 rounded-lg shadow-sm border border-[var(--color-border-default)] uppercase tracking-tight">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-1 px-4 sm:px-12 ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] sm:max-w-[70%] rounded-lg px-2 pt-1 pb-1.5 shadow-sm relative group ${isMe ? 'bg-[var(--color-bubble-sent)] text-[var(--color-text-bubble)] rounded-tr-none' : 'bg-[var(--color-bubble-received)] text-[var(--color-text-primary)] rounded-tl-none'}`}>
        {showSender && !isMe && <div className="text-[12.5px] font-semibold mb-0.5" style={{ color: getSenderColor(message.sender) }}>{message.sender}</div>}
        {renderContent()}
        <div className="absolute bottom-1 right-1.5 flex items-center gap-1">
          <span className="text-[10px] text-[var(--color-text-secondary)] opacity-70">{formatTime(message.timestamp)}</span>
          {isMe && <svg viewBox="0 0 16 11" width="16" height="11" className="text-[#53bdeb] fill-current"><path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033L5.891 7.741a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185a.32.32 0 0 0 .484-.033l6.38-8.975a.365.365 0 0 0-.071-.505zM10.89 3.34a.366.366 0 0 0-.514.006l-.423.433a.364.364 0 0 0 .006.514l.325.318a.32.32 0 0 0 .484-.033l6.38-8.975a.365.365 0 0 0-.071-.505l-.479-.372a.365.365 0 0 0-.51.063z" /></svg>}
        </div>
      </div>
    </div>
  );
}
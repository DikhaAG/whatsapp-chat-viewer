import React from 'react';

export default function Home() {
  return (
    // 'hidden md:flex' memastikan layar abu-abu ini hanya muncul di Desktop
    <div className="hidden md:flex flex-col flex-1 items-center justify-center bg-[#f0f2f5] dark:bg-[#222e35] h-full border-b-[6px] border-[#00a884]">
      <div className="max-w-md text-center flex flex-col items-center">
        {/* Placeholder Ikon Web WA */}
        <div className="w-64 h-64 mb-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center animate-pulse">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="#00a884"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" /></svg>
        </div>

        <h1 className="text-3xl font-light text-[var(--color-text-primary)] mb-4">WA Export Viewer</h1>
        <p className="text-[var(--color-text-secondary)] leading-relaxed text-sm">
          Send and receive messages without keeping your phone online.<br />
          Use this app to read your exported ZIP chats seamlessly.
        </p>

        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[var(--color-text-secondary)] opacity-60">
          <svg viewBox="0 0 10 12" width="10" height="12" fill="currentColor"><path d="M5 0C2.2 0 0 2.2 0 5v2c0 2.8 2.2 5 5 5s5-2.2 5-5V5c0-2.8-2.2-5-5-5zm3.5 7c0 1.9-1.6 3.5-3.5 3.5S1.5 8.9 1.5 7V5c0-1.9 1.6-3.5 3.5-3.5S8.5 3.1 8.5 5v2z" /></svg>
          Your personal messages are end-to-end protected and stored locally.
        </div>
      </div>
    </div>
  );
}
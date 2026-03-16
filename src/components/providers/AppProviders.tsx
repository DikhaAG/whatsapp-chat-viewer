'use client';

import React, { useEffect, useState } from 'react';
import { useChatStore } from '@/state/chatStore';
import { useUIStore } from '@/state/uiStore';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const loadAllSessions = useChatStore((state) => state.loadAllSessions);
  const theme = useUIStore((state) => state.theme);
  const [mounted, setMounted] = useState(false);

  // Handle Hydration
  useEffect(() => {
    setMounted(true);
    loadAllSessions();
  }, [loadAllSessions]);

  // Handle Theme Switching on HTML Root
  useEffect(() => {
    if (!mounted) return;

    const root = window.document.documentElement;
    const isDark = 
      theme === 'dark' || 
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, mounted]);

  // Prevent flash of unstyled content during hydration
  if (!mounted) {
    return <div className="min-h-screen bg-[#efeae2] dark:bg-[#111b21]" />;
  }

  return <>{children}</>;
}

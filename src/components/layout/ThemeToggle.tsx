'use client';

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useUIStore } from '@/state/uiStore';

export function ThemeToggle() {
  const { theme, setTheme } = useUIStore();

  return (
    <div className="flex items-center gap-1 bg-[var(--color-bg-surface)] p-1 rounded-full border border-[var(--color-border-default)]">
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded-full transition-colors ${theme === 'light' ? 'bg-[#d1d7db] text-[#111b21]' : 'text-[var(--color-header-icon)] hover:bg-black/5'}`}
        title="Light Mode"
      >
        <Sun size={18} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded-full transition-colors ${theme === 'dark' ? 'bg-[#374045] text-[#e9edef]' : 'text-[var(--color-header-icon)] hover:bg-white/5'}`}
        title="Dark Mode"
      >
        <Moon size={18} />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded-full transition-colors ${theme === 'system' ? 'bg-[#d1d7db] dark:bg-[#374045] text-current' : 'text-[var(--color-header-icon)] hover:bg-black/5 dark:hover:bg-white/5'}`}
        title="System Preference"
      >
        <Monitor size={18} />
      </button>
    </div>
  );
}

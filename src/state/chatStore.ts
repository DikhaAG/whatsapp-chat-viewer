import { create } from 'zustand';
import { ChatSession, Message } from '@/types/chat';
import { dbService } from '@/lib/db/indexedDbService';

interface ChatState {
  chatSessions: ChatSession[];
  activeChatId: string | null;
  activeMessages: Message[];
  isLoading: boolean;
  error: string | null;
  attachmentMaps: Record<string, Record<string, string>>;

  loadAllSessions: () => Promise<void>;
  setActiveChat: (sessionId: string | null) => Promise<void>;
  importNewChat: (session: ChatSession) => Promise<void>;
  removeChat: (sessionId: string) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setAttachmentMap: (sessionId: string, map: Record<string, string>) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chatSessions: [],
  activeChatId: null,
  activeMessages: [],
  isLoading: false,
  error: null,
  attachmentMaps: {},

  loadAllSessions: async () => { /* ... kode asli tidak berubah ... */
    set({ isLoading: true });
    try {
      const sessions = await dbService.getAllChats();
      set({ chatSessions: sessions, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  setActiveChat: async (sessionId: string | null) => {
    if (!sessionId) {
      set({ activeChatId: null, activeMessages: [] });
      return;
    }

    set({ isLoading: true });
    try {
      // 1. Ambil teks pesan dari IndexedDB
      const fullSession = await dbService.getChatById(sessionId);

      // ==========================================
      // LOGIKA BARU: REGENERASI FILE MEDIA
      // ==========================================
      const currentState = get();

      // Periksa: Apakah kamus gambar untuk sesi ini KOSONG di memori RAM?
      // (Ini akan bernilai true jika pengguna baru saja menekan tombol Refresh F5)
      if (!currentState.attachmentMaps[sessionId]) {
        // Turun ke gudang IndexedDB untuk mencari fisik file milik sesi ini
        const savedAttachments = await dbService.getAttachmentsBySessionId(sessionId);

        if (savedAttachments.length > 0) {
          const newMap: Record<string, string> = {};

          // Bangkitkan ulang Blob URL dari data fisik yang tersimpan
          savedAttachments.forEach(att => {
            newMap[att.fileName] = URL.createObjectURL(att.blob);
          });

          // Simpan URL baru tersebut kembali ke memori RAM
          set((state) => ({
            attachmentMaps: { ...state.attachmentMaps, [sessionId]: newMap }
          }));
        }
      }

      // 2. Tampilkan pesan ke layar
      if (fullSession) {
        set({
          activeChatId: sessionId,
          activeMessages: fullSession.messages || [],
          isLoading: false
        });
      } else {
        set({ error: 'Chat not found', isLoading: false });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  importNewChat: async (session: ChatSession) => { /* ... kode asli tidak berubah ... */
    set({ isLoading: true });
    try {
      await dbService.saveChat(session);
      const { messages, ...metadata } = session;
      set((state) => ({
        chatSessions: [
          ...state.chatSessions.filter(s => s.sessionId !== session.sessionId),
          metadata as ChatSession
        ],
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  removeChat: async (sessionId: string) => { /* ... kode asli tidak berubah ... */
    set({ isLoading: true });
    try {
      await dbService.deleteChat(sessionId);
      set((state) => {
        const newAttachmentMaps = { ...state.attachmentMaps };
        delete newAttachmentMaps[sessionId];
        return {
          chatSessions: state.chatSessions.filter(s => s.sessionId !== sessionId),
          activeChatId: state.activeChatId === sessionId ? null : state.activeChatId,
          activeMessages: state.activeChatId === sessionId ? [] : state.activeMessages,
          attachmentMaps: newAttachmentMaps,
          isLoading: false
        };
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setAttachmentMap: (sessionId, map) => set((state) => ({
    attachmentMaps: {
      ...state.attachmentMaps,
      [sessionId]: map
    }
  })),
}));
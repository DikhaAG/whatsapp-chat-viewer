import { create } from 'zustand';
import { ChatSession, Message } from '@/types/chat';
import { dbService } from '@/lib/db/indexedDbService';

interface ChatState {
  chatSessions: ChatSession[];
  activeChatId: string | null;
  activeMessages: Message[];
  activeAttachmentMap: Record<string, string>;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadAllSessions: () => Promise<void>;
  setActiveChat: (sessionId: string | null) => Promise<void>;
  importNewChat: (session: ChatSession) => Promise<void>;
  removeChat: (sessionId: string) => Promise<void>;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setActiveAttachmentMap: (map: Record<string, string>) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chatSessions: [],
  activeChatId: null,
  activeMessages: [],
  activeAttachmentMap: {},
  isLoading: false,
  error: null,

  loadAllSessions: async () => {
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
      const fullSession = await dbService.getChatById(sessionId);
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

  importNewChat: async (session: ChatSession) => {
    set({ isLoading: true });
    try {
      await dbService.saveChat(session);

      // Update local sessions list (metadata only)
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

  removeChat: async (sessionId: string) => {
    set({ isLoading: true });
    try {
      await dbService.deleteChat(sessionId);
      set((state) => ({
        chatSessions: state.chatSessions.filter(s => s.sessionId !== sessionId),
        activeChatId: state.activeChatId === sessionId ? null : state.activeChatId,
        activeMessages: state.activeChatId === sessionId ? [] : state.activeMessages,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },
  setActiveAttachmentMap: (map) => set({ activeAttachmentMap: map }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));

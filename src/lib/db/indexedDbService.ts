import { openDB, IDBPDatabase } from 'idb';
import { ChatSession } from '@/types/chat';

const DB_NAME = 'wa-viewer-db';
const DB_VERSION = 1;
const STORE_CHATS = 'chats';

export class IndexedDbService {
  private dbPromise: Promise<IDBPDatabase> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_CHATS)) {
            db.createObjectStore(STORE_CHATS, { keyPath: 'sessionId' });
          }
        },
      });
    }
  }

  async saveChat(session: ChatSession): Promise<void> {
    const db = await this.dbPromise;
    if (!db) return;
    await db.put(STORE_CHATS, session);
  }

  async getAllChats(): Promise<ChatSession[]> {
    const db = await this.dbPromise;
    if (!db) return [];
    
    const chats = await db.getAll(STORE_CHATS);
    // Return only metadata (no messages) for the sidebar/list view
    return chats.map(({ messages, ...metadata }) => metadata as ChatSession);
  }

  async getChatById(sessionId: string): Promise<ChatSession | null> {
    const db = await this.dbPromise;
    if (!db) return null;
    return await db.get(STORE_CHATS, sessionId) || null;
  }

  async deleteChat(sessionId: string): Promise<void> {
    const db = await this.dbPromise;
    if (!db) return;
    await db.delete(STORE_CHATS, sessionId);
  }
}

export const dbService = new IndexedDbService();

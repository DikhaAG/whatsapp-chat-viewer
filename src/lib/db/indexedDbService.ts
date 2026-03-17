import { openDB, IDBPDatabase } from 'idb';
import { ChatSession } from '@/types/chat';

const DB_NAME = 'wa-viewer-db';
// PERUBAHAN KRUSIAL: Naikkan versi dari 1 menjadi 2 untuk memicu 'upgrade'
const DB_VERSION = 2;
const STORE_CHATS = 'chats';
const STORE_ATTACHMENTS = 'attachments'; // NAMA TABEL BARU

export interface AttachmentRecord {
  id: string; // Format: "sessionId_fileName"
  sessionId: string;
  fileName: string;
  blob: Blob; // DATA FISIK FILE ASLI
}

export class IndexedDbService {
  private dbPromise: Promise<IDBPDatabase> | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db, oldVersion, newVersion) {
          if (!db.objectStoreNames.contains(STORE_CHATS)) {
            db.createObjectStore(STORE_CHATS, { keyPath: 'sessionId' });
          }
          // BARU: Membuat laci khusus untuk attachment
          if (!db.objectStoreNames.contains(STORE_ATTACHMENTS)) {
            const attachmentStore = db.createObjectStore(STORE_ATTACHMENTS, { keyPath: 'id' });
            // Membuat indeks pencarian agar kita bisa memanggil semua foto berdasarkan ID Sesi
            attachmentStore.createIndex('sessionId', 'sessionId');
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
    return chats.map(({ messages, ...metadata }) => metadata as ChatSession);
  }

  async getChatById(sessionId: string): Promise<ChatSession | null> {
    const db = await this.dbPromise;
    if (!db) return null;
    return await db.get(STORE_CHATS, sessionId) || null;
  }

  // ==========================================
  // FUNGSI BARU UNTUK MEDIA (BLOB)
  // ==========================================
  async saveAttachment(sessionId: string, fileName: string, blob: Blob): Promise<void> {
    const db = await this.dbPromise;
    if (!db) return;
    const id = `${sessionId}_${fileName}`;
    await db.put(STORE_ATTACHMENTS, { id, sessionId, fileName, blob });
  }

  async getAttachmentsBySessionId(sessionId: string): Promise<AttachmentRecord[]> {
    const db = await this.dbPromise;
    if (!db) return [];
    // Mengambil semua foto dari laci "attachments" yang cocok dengan sessionId
    return await db.getAllFromIndex(STORE_ATTACHMENTS, 'sessionId', sessionId);
  }

  async deleteChat(sessionId: string): Promise<void> {
    const db = await this.dbPromise;
    if (!db) return;
    await db.delete(STORE_CHATS, sessionId);

    // BARU: Jika obrolan dihapus, hapus juga file medianya agar hard disk pengguna tidak penuh!
    const tx = db.transaction(STORE_ATTACHMENTS, 'readwrite');
    const index = tx.store.index('sessionId');
    let cursor = await index.openCursor(IDBKeyRange.only(sessionId));

    while (cursor) {
      await cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  }
}

export const dbService = new IndexedDbService();
export type ChatType = 'individual' | 'group';

export interface Message {
  messageId: string;
  sessionId: string;
  timestamp: number; // Unix MS
  sender: string;
  content: string;
  isSystemMessage: boolean;
  contentType: 'text' | 'media' | 'status';
  attachmentRef?: string | null;
}

export interface ChatSession {
  sessionId: string;
  chatName: string;
  chatType: ChatType;
  lastMessageSnippet: string;
  lastActivityTimestamp: number; // Unix MS
  importDate: number; // Unix MS
  isRead: boolean;
  messages?: Message[];
}

export interface Attachment {
  attachmentId: string;
  sessionId: string;
  messageId: string;
  mimeType: string;
  blobURL: string;
}

import { ChatSession, Message, ChatType } from '@/types/chat';
import { ANDROID_MATCH_REGEX, IOS_MATCH_REGEX, SENDER_CONTENT_REGEX } from './regexPatterns';

export async function parseChatText(text: string, sessionId: string, chatName: string): Promise<ChatSession> {
  const lines = text.split(/\r?\n/);
  const messages: Message[] = [];

  let currentMessage: Message | null = null;

  // PERUBAHAN: Gunakan 'let' agar isi baris bisa dimanipulasi
  for (let line of lines) {

    // SOLUSI TERSANGKA 3: Basmi Karakter Siluman U+200E dan U+200F
    line = line.replace(/[\u200E\u200F]/g, '');

    if (!line.trim()) continue;

    const androidMatch = line.match(ANDROID_MATCH_REGEX);
    const iosMatch = line.match(IOS_MATCH_REGEX);
    const match = androidMatch || iosMatch;

    if (match) {
      const [, dateStr, timeStr, remainder] = match;
      const timestamp = parseTimestamp(dateStr, timeStr);
      const messageId = `${sessionId}-${timestamp}-${messages.length}`;
      const senderMatch = remainder.match(SENDER_CONTENT_REGEX);

      if (senderMatch) {
        const [, sender, content] = senderMatch;
        currentMessage = {
          messageId,
          sessionId,
          timestamp,
          sender: sender.trim(),
          content: content.trim(),
          isSystemMessage: false,
          contentType: 'text',
        };
      } else {
        currentMessage = {
          messageId,
          sessionId,
          timestamp,
          sender: 'System',
          content: remainder.trim(),
          isSystemMessage: true,
          contentType: 'text',
        };
      }
      messages.push(currentMessage);
    } else {
      if (messages.length > 0) {
        const lastMsg = messages[messages.length - 1];
        lastMsg.content += `\n${line}`;
      } else {
        const timestamp = Date.now();
        messages.push({
          messageId: `${sessionId}-${timestamp}-initial`,
          sessionId,
          timestamp,
          sender: 'System',
          content: line,
          isSystemMessage: true,
          contentType: 'text',
        });
      }
    }
  }

  const lastMessage = messages[messages.length - 1];
  const lastActivityTimestamp = lastMessage?.timestamp || Date.now();
  const lastMessageSnippet = lastMessage?.content.substring(0, 50) || '';

  return {
    sessionId,
    chatName,
    chatType: detectChatType(messages),
    lastMessageSnippet,
    lastActivityTimestamp,
    importDate: Date.now(),
    isRead: true,
    messages: messages,
  };
}

function parseTimestamp(dateStr: string, timeStr: string): number {
  try {
    const normalizedDate = dateStr.replace(/[-.]/g, '/');
    const [d, m, y] = normalizedDate.split('/').map(Number);
    const fullYear = y < 100 ? 2000 + y : y;

    // Pastikan titik menjadi titik dua (seperti diskusi sebelumnya)
    const normalizedTime = timeStr.replace(/\./g, ':');

    const timeMatch = normalizedTime.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?(\s?[aApP][mM])?/);
    if (!timeMatch) return Date.now();

    let [, hours, minutes, seconds, ampm] = timeMatch;
    let h = parseInt(hours);
    const min = parseInt(minutes);
    const sec = seconds ? parseInt(seconds) : 0;

    if (ampm) {
      const isPm = ampm.toLowerCase().includes('p');
      if (isPm && h < 12) h += 12;
      if (!isPm && h === 12) h = 0;
    }

    return new Date(fullYear, m - 1, d, h, min, sec).getTime();
  } catch (e) {
    console.error('Failed to parse timestamp:', dateStr, timeStr, e);
    return Date.now();
  }
}

function detectChatType(messages: Message[]): ChatType {
  const senders = new Set(messages.filter(m => !m.isSystemMessage).map(m => m.sender));
  return senders.size > 2 ? 'group' : 'individual';
}

export function getMessagesFromParsedSession(session: any): Message[] {
  return [];
}
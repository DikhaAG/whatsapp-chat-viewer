/**
 * Regex patterns for parsing WhatsApp chat exports.
 * Supports Android and iOS formats with flexible date separators and 12/24h time.
 */

// // Android: 14/03/24, 21:48 - Sender: Message or 14.03.24, 9:48 PM - Sender: Message
// export const ANDROID_MATCH_REGEX = /^(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}),\s(\d{1,2}:\d{2}(?:\s?[aApP][mM])?)\s-\s(.*)$/;

// // iOS: [14/03/24, 21:48:14] Sender: Message or [14/03/24, 9:48:14 PM] Sender: Message
// export const IOS_MATCH_REGEX = /^\[(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}),\s(\d{1,2}:\d{2}:\d{2}(?:\s?[aApP][mM])?)\]\s(.*)$/;
// Menerima titik dua (:) ATAU titik (.)
export const IOS_MATCH_REGEX = /^\[(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}),\s(\d{1,2}[:.]\d{2}[:.]\d{2}(?:\s?[aApP][mM])?)\]\s(.*)$/;

export const ANDROID_MATCH_REGEX = /^(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}),\s(\d{1,2}[:.]\d{2}(?:\s?[aApP][mM])?)\s-\s(.*)$/;
// Extract sender and content from the remainder of the line
export const SENDER_CONTENT_REGEX = /^([^:]+):\s([\s\S]*)$/;

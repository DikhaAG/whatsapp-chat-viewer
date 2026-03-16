import JSZip from 'jszip';

interface ZipResult {
  chatText: string;
  fileName: string;
  attachmentMap: Record<string, string>;
}

/**
 * Handles client-side extraction of WhatsApp export ZIP files.
 * Searches for the primary chat .txt file and extracts media attachments.
 */
export async function extractChatFromZip(zipFile: File): Promise<ZipResult> {
  const zip = new JSZip();
  const contents = await zip.loadAsync(zipFile);

  const chatFile = Object.values(contents.files).find(file =>
    !file.dir && file.name.endsWith('.txt') && (file.name.includes('_chat') || file.name === 'chat.txt')
  ) || Object.values(contents.files).find(file => !file.dir && file.name.endsWith('.txt'));

  if (!chatFile) {
    throw new Error('No .txt chat file found in the ZIP archive.');
  }

  const chatText = await chatFile.async('string');
  const attachmentMap: Record<string, string> = {};
  const allFiles = Object.values(contents.files);

  const attachmentPromises = allFiles
    .filter(file => !file.dir && file.name !== chatFile.name)
    .map(async (file) => {
      const blob = await file.async('blob');
      const blobUrl = URL.createObjectURL(blob);

      // SOLUSI TERSANGKA 1: Mengambil nama file paling ujung
      const baseFileName = file.name.split('/').pop() || file.name;

      attachmentMap[baseFileName] = blobUrl;
    });

  await Promise.all(attachmentPromises);

  return {
    chatText,
    fileName: zipFile.name,
    attachmentMap
  };
}
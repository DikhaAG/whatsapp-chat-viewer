import JSZip from 'jszip';

interface ZipResult {
  chatText: string;
  fileName: string;
  attachmentMap: Record<string, string>;
  // BARU: Tempat untuk menampung file fisik mentah (Blob)
  rawBlobs: { fileName: string; blob: Blob }[];
}

export async function extractChatFromZip(
  zipFile: File,
  onProgress?: (progress: number, statusText: string) => void
): Promise<ZipResult> {
  onProgress?.(5, 'Membaca file ZIP...');
  const zip = new JSZip();
  const contents = await zip.loadAsync(zipFile);

  const chatFile = Object.values(contents.files).find(file =>
    !file.dir && file.name.endsWith('.txt') && (file.name.includes('_chat') || file.name === 'chat.txt')
  ) || Object.values(contents.files).find(file => !file.dir && file.name.endsWith('.txt'));

  if (!chatFile) throw new Error('No .txt chat file found in the ZIP archive.');

  onProgress?.(15, 'Mengekstrak teks obrolan utama...');
  const chatText = await chatFile.async('string');
  const attachmentMap: Record<string, string> = {};

  // BARU: Inisialisasi wadah untuk file mentah
  const rawBlobs: { fileName: string; blob: Blob }[] = [];

  const mediaFiles = Object.values(contents.files).filter(file => !file.dir && file.name !== chatFile.name);
  const totalMedia = mediaFiles.length;
  let processedMedia = 0;

  if (totalMedia > 0) {
    onProgress?.(20, `Mempersiapkan ekstraksi ${totalMedia} file media...`);

    const attachmentPromises = mediaFiles.map(async (file) => {
      const blob = await file.async('blob');
      const blobUrl = URL.createObjectURL(blob);
      const baseFileName = file.name.split('/').pop() || file.name;

      attachmentMap[baseFileName] = blobUrl;
      // BARU: Simpan data mentahnya ke dalam wadah array
      rawBlobs.push({ fileName: baseFileName, blob });

      processedMedia++;
      const percentage = 20 + Math.floor((processedMedia / totalMedia) * 80);
      onProgress?.(percentage, `Mengekstrak file: ${processedMedia} / ${totalMedia}`);
    });

    await Promise.all(attachmentPromises);
  }

  onProgress?.(100, 'Proses selesai!');

  return { chatText, fileName: zipFile.name, attachmentMap, rawBlobs };
}
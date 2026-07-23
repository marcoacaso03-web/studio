import { toPng } from 'html-to-image';

/**
 * Captures a DOM node (the tactical pitch) as a PNG and either shares it via
 * the Web Share API (mobile: WhatsApp/Telegram) or downloads it as a file.
 *
 * Falls back to download when the sharing sheet is unavailable (desktop).
 */
export async function shareLineupAsImage(
  node: HTMLElement,
  filename = 'formazione-pitchman.png',
): Promise<void> {
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    cacheBust: true,
    backgroundColor: '#000000',
  });

  // Try native share sheet (mobile) — lets the user pick WhatsApp/Telegram.
  if (typeof navigator !== 'undefined' && 'share' in navigator && navigator.canShare) {
    try {
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], filename, { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Formazione PitchMan',
          text: 'Ecco la formazione',
        });
        return;
      }
    } catch (e) {
      // user cancelled or share failed -> fall through to download
      if ((e as Error)?.name === 'AbortError') return;
    }
  }

  // Fallback: download
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

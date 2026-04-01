import { toPng } from "html-to-image";

export async function captureCard(element: HTMLElement): Promise<Blob> {
  const dataUrl = await toPng(element, {
    backgroundColor: "#0a0a0f",
    pixelRatio: 2,
    skipFonts: true,
  });

  // Convert data URL to Blob
  const res = await fetch(dataUrl);
  return res.blob();
}

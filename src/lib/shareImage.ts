import { toPng } from "html-to-image";

export async function captureCard(element: HTMLElement): Promise<Blob> {
  // Run toPng twice — first call warms up font/image loading, second produces clean output
  await toPng(element, {
    backgroundColor: "#0a0a0f",
    pixelRatio: 2,
    quality: 0.95,
  }).catch(() => {});

  const dataUrl = await toPng(element, {
    backgroundColor: "#0a0a0f",
    pixelRatio: 2,
    quality: 0.95,
  });

  const res = await fetch(dataUrl);
  return res.blob();
}

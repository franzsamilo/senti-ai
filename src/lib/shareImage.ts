import { toPng } from "html-to-image";

/** Render an off-screen card to a PNG blob at 2× (540×960 → 1080×1920). */
export async function captureCard(element: HTMLElement): Promise<Blob> {
  // The node must carry no positioning of its own — see ShareCard.
  const options = { pixelRatio: 2, quality: 0.95, cacheBust: true } as const;

  // The first pass warms font and image loading; the second is the clean one.
  await toPng(element, options).catch(() => {});
  const dataUrl = await toPng(element, options);

  const res = await fetch(dataUrl);
  return res.blob();
}

/**
 * Hand a PNG to the native share sheet where it's supported (phones — the
 * route straight into IG/FB stories), otherwise download it.
 *
 * Returns what happened so the UI can confirm it.
 */
export async function shareOrDownload(
  blob: Blob,
  filename: string,
  title: string
): Promise<"shared" | "downloaded" | "cancelled"> {
  const file = new File([blob], filename, { type: "image/png" });

  if (typeof navigator !== "undefined" && navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return "shared";
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") return "cancelled";
      // Fall through to download on any other share failure.
    }
  }

  downloadBlob(blob, filename);
  return "downloaded";
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

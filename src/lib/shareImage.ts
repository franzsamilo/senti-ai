import html2canvas from "html2canvas";

export async function captureCard(element: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(element, {
    backgroundColor: "#0a0a0f",
    scale: 1,
    useCORS: true,
    logging: false,
  });
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to generate image"));
      },
      "image/png",
      1.0
    );
  });
}

export async function shareOrDownload(
  blob: Blob,
  filename: string
): Promise<void> {
  const file = new File([blob], filename, { type: "image/png" });
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: "My Senti.AI Results",
        text: "Check out my emotional damage assessment 😭 Take yours → https://senti-ai-iota.vercel.app",
      });
      return;
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
    }
  }
  // Fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

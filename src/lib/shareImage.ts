import html2canvas from "html2canvas";

export async function captureCard(element: HTMLElement): Promise<Blob> {
  const canvas = await html2canvas(element, {
    backgroundColor: "#0a0a0f",
    scale: 2, // 2x for crisp images
    useCORS: true,
    logging: false,
    scrollY: -window.scrollY, // fix for scrolled pages
    windowHeight: element.scrollHeight,
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

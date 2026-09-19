export async function qrDataUrl(
  value: string,
  size = 1024,
): Promise<string> {
  if (typeof document === "undefined") {
    throw new Error("QR generation requires a browser.");
  }

  const { QR_EXPORT_PADDING, canvasToPaddedDataUrl, readQrCanvas, renderQrCode } =
    await import("@/lib/qr/qrcode-engine");

  const host = document.createElement("div");
  host.style.position = "fixed";
  host.style.left = "-9999px";
  host.style.top = "0";
  document.body.appendChild(host);

  try {
    renderQrCode(host, value, size);
    return canvasToPaddedDataUrl(readQrCanvas(host), QR_EXPORT_PADDING);
  } finally {
    host.remove();
  }
}

export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function downloadQrPng(
  value: string,
  filename: string,
  size = 1024,
): Promise<void> {
  const dataUrl = await qrDataUrl(value, size);
  downloadDataUrl(dataUrl, filename);
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, data] = dataUrl.split(",");
  const mimeMatch = /data:(.*?);base64/.exec(header ?? "");
  const mime = mimeMatch?.[1];
  const binary = atob(data ?? "");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mime ?? "image/png" });
}

import QRCode from "qrcode";

export async function qrDataUrl(
  value: string,
  size = 1024,
): Promise<string> {
  return QRCode.toDataURL(value, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: size,
    color: {
      dark: "#16181D",
      light: "#FFFFFF",
    },
  });
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

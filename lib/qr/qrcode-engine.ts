import QRCode from "@/lib/qr/vendor/qrcodejs.js";
import {
  QR_COLOR_DARK,
  QR_COLOR_LIGHT,
  QR_DISPLAY_SIZE,
  QR_EXPORT_PADDING,
} from "@/lib/qr/constants";

export {
  QR_COLOR_DARK,
  QR_COLOR_LIGHT,
  QR_DISPLAY_SIZE,
  QR_EXPORT_PADDING,
} from "@/lib/qr/constants";

export function renderQrCode(
  container: HTMLElement,
  text: string,
  size = QR_DISPLAY_SIZE,
): QRCode {
  container.replaceChildren();
  return new QRCode(container, {
    text,
    width: size,
    height: size,
    colorDark: QR_COLOR_DARK,
    colorLight: QR_COLOR_LIGHT,
    correctLevel: QRCode.CorrectLevel.H,
  });
}

export function readQrCanvas(container: HTMLElement): HTMLCanvasElement {
  const canvas = container.querySelector("canvas");
  if (!canvas) {
    throw new Error("Could not render QR code.");
  }
  return canvas;
}

/**
 * Export the rendered canvas with the same white padding approach as
 * kacf/QR-Generator `downloadQR`, without their product footer.
 */
export function canvasToPaddedDataUrl(
  canvas: HTMLCanvasElement,
  padding = QR_EXPORT_PADDING,
): string {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = canvas.width + padding * 2;
  exportCanvas.height = canvas.height + padding * 2;
  const ctx = exportCanvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not create QR export canvas.");
  }
  ctx.fillStyle = QR_COLOR_LIGHT;
  ctx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
  ctx.drawImage(canvas, padding, padding);
  return exportCanvas.toDataURL("image/png");
}

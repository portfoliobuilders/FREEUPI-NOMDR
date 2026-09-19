const CONTROL_CHARS = /[\u0000-\u001F\u007F]/g;
const HTML_CHARS = /[<>]/g;

export function sanitizePaymentText(value: string, maxLength: number): string {
  return value
    .replace(CONTROL_CHARS, "")
    .replace(HTML_CHARS, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function sanitizeMultiline(value: string, maxLength: number): string {
  return value
    .replace(CONTROL_CHARS, "")
    .replace(HTML_CHARS, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim()
    .slice(0, maxLength);
}

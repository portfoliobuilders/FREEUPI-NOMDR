declare class QRCode {
  constructor(
    el: HTMLElement | string,
    vOption:
      | string
      | {
          text?: string;
          width?: number;
          height?: number;
          colorDark?: string;
          colorLight?: string;
          correctLevel?: number;
          useSVG?: boolean;
        },
  );
  makeCode(sText: string): void;
  clear(): void;
  static CorrectLevel: { L: number; M: number; Q: number; H: number };
}

export default QRCode;

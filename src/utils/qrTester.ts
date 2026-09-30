import jsQR from 'jsqr';

export interface QRScanTestResult {
  isScannable: boolean;
  decodedText?: string;
  warning?: string;
}

/**
 * Tests an existing HTMLCanvasElement containing a rendered QR code
 * using jsQR to determine if mobile devices will be able to read it reliably.
 */
export function testQRScannability(canvas: HTMLCanvasElement): QRScanTestResult {
  try {
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      return { isScannable: true };
    }

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth',
    });

    if (code && code.data) {
      return {
        isScannable: true,
        decodedText: code.data,
      };
    } else {
      return {
        isScannable: false,
        warning: "Ogohlantirish: Tanlangan dizayn (ranglar kontrasti yoki katta logo) tufayli QR kod skanerdan o'tmasligi mumkin! Kontrastni oshiring yoki logoni kichraytiring.",
      };
    }
  } catch (err: any) {
    console.warn("QR scan testing error:", err);
    return {
      isScannable: true,
    };
  }
}

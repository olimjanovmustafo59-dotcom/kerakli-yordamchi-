import React, { useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  Image as ImageIcon,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Download,
  Link,
  Minimize2,
  Info,
  ExternalLink
} from 'lucide-react';
import { jsPDF } from 'jspdf';

export const ImageToQR: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<number>(0);
  const [imageDimensions, setImageDimensions] = useState<{ w: number; h: number } | null>(null);
  const [mode, setMode] = useState<'compressed_data' | 'url'>('url');
  const [customUrl, setCustomUrl] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const QR_BYTE_LIMIT = 2950; // Maximum byte capacity for QR Version 40 (Binary)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorNotice(null);
    setImageSize(file.size);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setSelectedImage(dataUrl);

      // Measure dimensions
      const img = new Image();
      img.onload = async () => {
        setImageDimensions({ w: img.width, h: img.height });

        // If file is tiny, can embed directly; otherwise upload to backend hosting for real public URL
        if (file.size <= QR_BYTE_LIMIT) {
          setMode('compressed_data');
          generateQR(dataUrl);
        } else {
          setMode('url');
          // Upload to backend hosting to get real accessible URL
          setIsUploading(true);
          try {
            const uploadRes = await fetch('/api/upload/image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageBase64: dataUrl,
                filename: file.name,
              }),
            });
            const uploadJson = await uploadRes.json();
            if (uploadJson.url) {
              const fullUrl = window.location.origin + uploadJson.url;
              setCustomUrl(fullUrl);
              generateQR(fullUrl);
            } else {
              throw new Error("Havola yaratishda xatolik");
            }
          } catch {
            // Fallback to local data micro-compression
            compressToFitQR();
          } finally {
            setIsUploading(false);
          }
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Compress image to fit directly inside QR binary payload
  const compressToFitQR = () => {
    if (!selectedImage) return;
    setIsCompressing(true);
    setErrorNotice(null);

    const img = new Image();
    img.onload = () => {
      // Scale down to tiny thumbnail (e.g. 50x50) and high-compression JPEG
      const canvas = document.createElement('canvas');
      const maxDim = 52;
      const scale = Math.min(maxDim / img.width, maxDim / img.height);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const tinyDataUrl = canvas.toDataURL('image/jpeg', 0.4);
      setMode('compressed_data');
      generateQR(tinyDataUrl);
      setIsCompressing(false);
    };
    img.src = selectedImage;
  };

  const generateQR = async (valueToEncode: string) => {
    setErrorNotice(null);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      await QRCode.toCanvas(canvas, valueToEncode, {
        width: 450,
        margin: 2,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });
      setQrCodeUrl(canvas.toDataURL());
    } catch (err: any) {
      console.error(err);
      setErrorNotice("QR yaratishda xatolik: Ma'lumot hajmi QR xalqaro standartidan oshib ketdi. Iltimos, havola variantidan foydalaning.");
    }
  };

  const handleUrlChange = (url: string) => {
    setCustomUrl(url);
    if (url.trim()) {
      generateQR(url);
    }
  };

  const downloadPNG = () => {
    if (!canvasRef.current) return;
    const a = document.createElement('a');
    a.download = `SmartTools-ImageQR-${Date.now()}.png`;
    a.href = canvasRef.current.toDataURL('image/png');
    a.click();
  };

  const downloadPDF = () => {
    if (!canvasRef.current) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('SmartTools AI - Rasm QR Kodi', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Rasm QR | Sana: ${new Date().toLocaleDateString()}`, 105, 28, { align: 'center' });

    const qrImg = canvasRef.current.toDataURL('image/png');
    doc.addImage(qrImg, 'PNG', 55, 45, 100, 100);

    doc.save(`SmartTools-ImageQR-${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-slate-900 text-white shadow-xl">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
            <ImageIcon className="w-5 h-5 text-emerald-300" />
          </span>
          <h2 className="text-xl font-bold">Rasm → QR Generator</h2>
        </div>
        <p className="text-xs text-slate-300 mt-1 max-w-xl">
          Rasmlarni QR kod orqali tezkor ulashish. Rasm hajmini avtomatik tekshirish,
          mikro-siqish (Data URI) yoki havola (URL) variantlari.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload & Options Left */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              1. Rasmni yuklang
            </label>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-center transition cursor-pointer relative bg-slate-50/50 dark:bg-slate-800/40">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Rasmni bu yerga tashlang yoki tanlang
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP formatlar qo'llab-quvvatlanadi</p>
            </div>

            {selectedImage && (
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg border border-slate-300 dark:border-slate-600"
                  />
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="font-bold text-slate-800 dark:text-white truncate">Yuklangan rasm</p>
                    <p className="text-slate-500">
                      Hajmi: {(imageSize / 1024).toFixed(1)} KB
                      {imageDimensions && ` • ${imageDimensions.w}x${imageDimensions.h} px`}
                    </p>
                    <div className="mt-1">
                      {imageSize > QR_BYTE_LIMIT ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Hajm QR standartidan ({Math.round(QR_BYTE_LIMIT / 1024)} KB) katta
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          QR sig'imiga to'liq mos
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Explanation Card */}
                {imageSize > QR_BYTE_LIMIT && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Nega katta rasmlar to'g'ridan-to'g'ri joylanmaydi?</span>
                        <p className="mt-0.5 leading-relaxed">
                          Xalqaro ISO/IEC 18004 QR kodi standarti bo'yicha eng yuqori sig'im 2.95 KB ni tashkil qiladi.
                          Shuning uchun katta hajmdagi sifatli rasmlar uchun quyidagi 2 ta usuldan birini tanlang:
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Solution Selection */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Variantni tanlang:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={compressToFitQR}
                      disabled={isCompressing}
                      className={`p-3 rounded-xl border text-left text-xs transition ${
                        mode === 'compressed_data'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <Minimize2 className="w-3.5 h-3.5 text-emerald-600" />
                        Mikro-Siqish (Data URI)
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        Rasmni kichraytirib to'g'ridan-to'g'ri QR ichiga joylaydi. Internet talab qilmaydi.
                      </p>
                    </button>

                    <button
                      onClick={() => {
                        setMode('url');
                        if (customUrl) generateQR(customUrl);
                      }}
                      className={`p-3 rounded-xl border text-left text-xs transition ${
                        mode === 'url'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold mb-1">
                        <Link className="w-3.5 h-3.5 text-emerald-600" />
                        Rasm Havolasi (URL)
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        Sifat yo'qolmaydi. Rasm joylashgan xavfsiz URL havolasi kodlanadi.
                      </p>
                    </button>
                  </div>

                  {mode === 'url' && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          Rasm veb-havolasi (avtomatik serverda xavfsiz saqlangan)
                        </label>
                        {isUploading && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold animate-pulse">
                            Yuklanmoqda...
                          </span>
                        )}
                      </div>
                      <input
                        type="url"
                        value={customUrl}
                        onChange={(e) => handleUrlChange(e.target.value)}
                        placeholder="https://mysite.uz/rasm.jpg"
                        className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  )}

                  {errorNotice && (
                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                      {errorNotice}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Live Preview Right */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Hosil bo'lgan Rasm QR Kodi
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-center min-h-[260px]">
              <canvas
                ref={canvasRef}
                className="max-h-64 w-auto object-contain rounded-lg"
              />
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={downloadPNG}
                disabled={!selectedImage && !customUrl}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
              >
                <Download className="w-3.5 h-3.5" />
                PNG Yuklab olish
              </button>
              <button
                onClick={downloadPDF}
                disabled={!selectedImage && !customUrl}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
              >
                <Download className="w-3.5 h-3.5" />
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

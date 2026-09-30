import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  ScanText,
  Upload,
  Download,
  Copy,
  Check,
  RotateCw,
  Sparkles,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

export const OCRTool: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/png');
  const [fileName, setFileName] = useState<string>('');
  const [languageHint, setLanguageHint] = useState<string>("O'zbek, Rus, Ingliz");
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setMimeType(file.type || 'image/png');
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelectedImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const runOCR = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      // If rotated, draw to rotated canvas first
      let imagePayload = selectedImage;
      if (rotation !== 0) {
        imagePayload = await rotateBase64(selectedImage, rotation);
      }

      const res = await fetch('/api/ai/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePayload,
          mimeType: mimeType,
          languageHint: languageHint,
        }),
      });

      const data = await res.json();
      if (res.ok && data.text) {
        setRecognizedText(data.text);
      } else {
        setErrorMsg(data.error || "Matnni ajratishda xatolik yuz berdi.");
      }
    } catch (err: any) {
      setErrorMsg("Aloqa xatosi: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const rotateBase64 = (base64: string, deg: number): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        if (deg === 90 || deg === 270) {
          canvas.width = img.height;
          canvas.height = img.width;
        } else {
          canvas.width = img.width;
          canvas.height = img.height;
        }
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(base64);

        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((deg * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };
      img.src = base64;
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(recognizedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportTXT = () => {
    const blob = new Blob([recognizedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `SmartTools-OCR-${Date.now()}.txt`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportDOCX = () => {
    // Generate clean HTML-based doc file recognizable by MS Word
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>SmartTools OCR</title></head>
      <body><p>${recognizedText.replace(/\n/g, '<br/>')}</p></body>
      </html>
    `;
    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `SmartTools-OCR-${Date.now()}.doc`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text('SmartTools OCR - Matn Natijasi', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(`Fayl: ${fileName || 'Rasm'} | Sana: ${new Date().toLocaleDateString()}`, 105, 27, { align: 'center' });

    doc.setFontSize(11);
    doc.setTextColor(20);
    const splitLines = doc.splitTextToSize(recognizedText, 170);
    doc.text(splitLines, 20, 40);

    doc.save(`SmartTools-OCR-${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-900/90 via-cyan-900/90 to-slate-900 text-white shadow-xl">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
            <ScanText className="w-5 h-5 text-cyan-300" />
          </span>
          <h2 className="text-xl font-bold">OCR Matnni Aniqlash (Multimodal AI)</h2>
        </div>
        <p className="text-xs text-slate-300 mt-1 max-w-xl">
          Skaner qilingan hujjatlar, cheklar, kitob sahifalari yoki fotosuratlardagi matnlarni bir zumda
          o'qib, tahrir qilish va TXT, Word (.doc) hamda PDF formatlarida yuklab olish.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Upload & Image Preview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              1. Rasm yoki PDF skanini tanlang
            </label>

            {!selectedImage ? (
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 rounded-2xl cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 transition">
                <Upload className="w-8 h-8 text-cyan-600 mb-2" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Rasmni bu yerga yuklang
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5">JPG, PNG, WEBP, PDF</span>
                <input type="file" accept="image/*,application/pdf" onChange={handleFile} className="hidden" />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center max-h-72">
                  <img
                    src={selectedImage}
                    alt="OCR Preview"
                    style={{ transform: `rotate(${rotation}deg)` }}
                    className="max-h-72 max-w-full object-contain transition-transform duration-200"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => setRotation((prev) => (prev + 90) % 360)}
                      className="p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 backdrop-blur-xs text-xs"
                      title="90° Burish"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-xs">{fileName}</span>
                  <label className="text-indigo-600 hover:underline cursor-pointer font-medium">
                    Boshqa rasm
                    <input type="file" accept="image/*,application/pdf" onChange={handleFile} className="hidden" />
                  </label>
                </div>
              </div>
            )}

            {/* Language hint */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kutilayotgan asosiy til:
              </label>
              <select
                value={languageHint}
                onChange={(e) => setLanguageHint(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 p-2.5 outline-none"
              >
                <option value="O'zbek, Rus, Ingliz">O'zbek (Lotin & Kirill) + Rus + Ingliz (Aralash)</option>
                <option value="O'zbek (Lotin)">Faqat O'zbekcha (Lotin alifbosi)</option>
                <option value="O'zbek (Kirill)">Faqat O'zbekcha (Kirill alifbosi)</option>
                <option value="Rus">Faqat Rus tili</option>
                <option value="Ingliz">Faqat Ingliz tili</option>
                <option value="Turk">Turk tili</option>
                <option value="Arab">Arab alifbosi</option>
              </select>
            </div>

            {/* Action button */}
            <button
              onClick={runOCR}
              disabled={!selectedImage || isLoading}
              className="w-full py-3 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition active:scale-98"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sun'iy intellekt matnni aniqlamoqda...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Matnni O'qish (OCR boshlash)
                </>
              )}
            </button>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Recognized Text Editor & Export */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  2. Aniqlangan Matn (Qo'lda tahrirlash mumkin)
                </h3>
                <span className="text-[11px] text-slate-400">
                  {recognizedText.length > 0
                    ? `${recognizedText.length} belgi, ${recognizedText.split(/\s+/).filter(Boolean).length} so'z`
                    : "Matn hali aniqlanmadi"}
                </span>
              </div>

              {recognizedText && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Nusxalandi' : 'Nusxa olish'}
                </button>
              )}
            </div>

            <textarea
              rows={15}
              value={recognizedText}
              onChange={(e) => setRecognizedText(e.target.value)}
              placeholder="Rasm yuklab 'Matnni O'qish' tugmasini bosing. Natija bu yerda chiqadi va uni erkin tahrirlashingiz mumkin..."
              className="w-full text-xs font-sans p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500/20 outline-none resize-y leading-relaxed min-h-[320px]"
            />

            {/* Export buttons */}
            {recognizedText && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Natijani yuklab olish
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={exportTXT}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    TXT
                  </button>
                  <button
                    onClick={exportDOCX}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Word (.doc)
                  </button>
                  <button
                    onClick={exportPDF}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

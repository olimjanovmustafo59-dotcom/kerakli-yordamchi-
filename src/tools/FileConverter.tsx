import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  ArrowRightLeft,
  Upload,
  Download,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

type ConvertType =
  | 'img_to_png'
  | 'img_to_jpg'
  | 'img_to_webp'
  | 'img_to_pdf'
  | 'txt_to_pdf'
  | 'csv_to_json'
  | 'json_to_csv';

export const FileConverter: React.FC = () => {
  const [convertType, setConvertType] = useState<ConvertType>('img_to_png');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string>('');
  const [convertedResult, setConvertedResult] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setConvertedResult(null);
    setSuccessMsg(null);
    setErrorMsg(null);

    const reader = new FileReader();
    if (convertType === 'csv_to_json' || convertType === 'json_to_csv' || convertType === 'txt_to_pdf') {
      reader.onload = (ev) => {
        setTextContent(ev.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      reader.onload = (ev) => {
        setFileDataUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConvert = () => {
    setIsConverting(true);
    try {
      if (convertType === 'csv_to_json') {
        // CSV to JSON converter
        const lines = textContent.trim().split('\n');
        if (lines.length === 0) throw new Error("CSV bo'sh");
        const headers = lines[0].split(',').map((h) => h.trim());
        const jsonRows = [];
        for (let i = 1; i < lines.length; i++) {
          const currentline = lines[i].split(',');
          const obj: Record<string, string> = {};
          for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j]?.trim() || '';
          }
          jsonRows.push(obj);
        }
        setConvertedResult(JSON.stringify(jsonRows, null, 2));
        setSuccessMsg("CSV muvaffaqiyatli JSON formatga o'tkazildi!");
      } else if (convertType === 'json_to_csv') {
        // JSON to CSV converter
        const array = JSON.parse(textContent);
        if (!Array.isArray(array) || array.length === 0) throw new Error("JSON massiv (Array) ko'rinishida bo'lishi kerak");
        const headers = Object.keys(array[0]);
        let csv = headers.join(',') + '\n';
        array.forEach((row) => {
          csv += headers.map((header) => JSON.stringify(row[header] || '')).join(',') + '\n';
        });
        setConvertedResult(csv);
        setSuccessMsg("JSON muvaffaqiyatli CSV ga o'tkazildi!");
      } else if (convertType === 'txt_to_pdf') {
        const doc = new jsPDF();
        doc.setFontSize(11);
        const splitText = doc.splitTextToSize(textContent, 170);
        doc.text(splitText, 20, 20);
        doc.save(`SmartTools-Converted-${Date.now()}.pdf`);
        setSuccessMsg("TXT fayl PDF ga o'tkazildi va yuklab olindi!");
      } else if (fileDataUrl) {
        // Image conversions via Canvas
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          let mime = 'image/png';
          let ext = 'png';
          if (convertType === 'img_to_jpg') {
            mime = 'image/jpeg';
            ext = 'jpg';
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          } else if (convertType === 'img_to_webp') {
            mime = 'image/webp';
            ext = 'webp';
          } else if (convertType === 'img_to_pdf') {
            const doc = new jsPDF({ orientation: img.width > img.height ? 'landscape' : 'portrait' });
            doc.addImage(fileDataUrl, 'JPEG', 10, 10, 190, 0);
            doc.save(`SmartTools-Image-${Date.now()}.pdf`);
            setSuccessMsg("Rasm PDF formatga o'tkazildi!");
            setIsConverting(false);
            return;
          }

          ctx.drawImage(img, 0, 0);
          const dataOut = canvas.toDataURL(mime, 0.92);
          const a = document.createElement('a');
          a.download = `SmartTools-Converted-${Date.now()}.${ext}`;
          a.href = dataOut;
          a.click();
          setSuccessMsg(`Rasm ${ext.toUpperCase()} formatiga o'tkazildi va yuklab olindi!`);
        };
        img.src = fileDataUrl;
      }
    } catch (err: any) {
      setErrorMsg("Konvertatsiya qilishda xatolik: " + err.message);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900/90 via-teal-900/90 to-slate-900 text-white shadow-xl">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
            <ArrowRightLeft className="w-5 h-5 text-emerald-300" />
          </span>
          <h2 className="text-xl font-bold">Universal Fayl Konverteri</h2>
        </div>
        <p className="text-xs text-slate-300 mt-1 max-w-xl">
          JPG, PNG, WEBP, PDF, TXT, CSV va JSON formatlarini o'zaro birzumda konvertatsiya qilish.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            {/* Conversion Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Konvertatsiya yo'nalishini tanlang
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'img_to_png', label: 'Rasm → PNG' },
                  { id: 'img_to_jpg', label: 'Rasm → JPG' },
                  { id: 'img_to_webp', label: 'Rasm → WEBP' },
                  { id: 'img_to_pdf', label: 'Rasm → PDF' },
                  { id: 'txt_to_pdf', label: 'TXT → PDF' },
                  { id: 'csv_to_json', label: 'CSV → JSON' },
                  { id: 'json_to_csv', label: 'JSON → CSV' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setConvertType(c.id as ConvertType);
                      setSelectedFile(null);
                      setConvertedResult(null);
                      setSuccessMsg(null);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                      convertType === c.id
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload Box */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Faylni tanlang
              </label>
              <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 transition text-center">
                <Upload className="w-7 h-7 text-emerald-600 mb-1" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {selectedFile ? selectedFile.name : "Faylni bu yerga yuklang"}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">
                  {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : "Tegishli formatdagi faylni tanlang"}
                </span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Action button */}
            <button
              onClick={handleConvert}
              disabled={(!selectedFile && !textContent) || isConverting}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition"
            >
              {isConverting ? "Konvertatsiya qilinmoqda..." : "Konvertatsiya Qilish"}
            </button>

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Result Right */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-lg min-h-[300px] flex flex-col justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Natija Ko'rinishi
            </h3>

            {convertedResult ? (
              <div className="space-y-3 flex-1 flex flex-col justify-between">
                <textarea
                  readOnly
                  rows={10}
                  value={convertedResult}
                  className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
                <button
                  onClick={() => {
                    const blob = new Blob([convertedResult], { type: 'text/plain;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    const ext = convertType === 'csv_to_json' ? 'json' : 'csv';
                    a.download = `SmartTools-Result.${ext}`;
                    a.href = url;
                    a.click();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" />
                  Natijani Fayl Qilib Yuklash
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-xs">
                <ArrowRightLeft className="w-8 h-8 opacity-40 mb-2" />
                <span>Fayl tanlang va konvertatsiyani boshlang</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

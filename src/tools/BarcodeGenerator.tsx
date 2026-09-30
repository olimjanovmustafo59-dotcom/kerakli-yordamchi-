import React, { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { jsPDF } from 'jspdf';
import {
  Barcode as BarcodeIcon,
  Download,
  AlertCircle,
  CheckCircle2,
  Info,
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { BarcodeConfig, BarcodeFormat } from '../types';

export const BarcodeGenerator: React.FC = () => {
  const [format, setFormat] = useState<BarcodeFormat>('CODE128');
  const [value, setValue] = useState('SMART-2026-PRO');
  const [lineColor, setLineColor] = useState('#0f172a');
  const [background, setBackground] = useState('#ffffff');
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(80);
  const [margin, setMargin] = useState(10);
  const [displayValue, setDisplayValue] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Validate format and value strictly
  const validateBarcode = (fmt: BarcodeFormat, val: string): string | null => {
    if (!val || val.trim() === '') {
      return "Shtrix-kod uchun qiymat kiritilishi shart.";
    }

    switch (fmt) {
      case 'EAN13':
        if (!/^\d{12,13}$/.test(val)) {
          return "EAN-13 formati uchun faqat 12 yoki 13 ta raqam kiriting (harf va belgilar mumkin emas).";
        }
        break;
      case 'EAN8':
        if (!/^\d{7,8}$/.test(val)) {
          return "EAN-8 formati uchun aniq 7 yoki 8 ta raqam talab qilinadi.";
        }
        break;
      case 'UPC':
        if (!/^\d{11,12}$/.test(val)) {
          return "UPC-A formati uchun 11 yoki 12 ta raqam kiriting.";
        }
        break;
      case 'ITF':
        if (!/^\d+$/.test(val) || val.length % 2 !== 0) {
          return "ITF (Interleaved 2 of 5) formati faqat juft sondagi raqamlardan iborat bo'lishi kerak.";
        }
        break;
      case 'CODE39':
        if (!/^[0-9A-Z\-\.\ \$\/\+\%]+$/.test(val)) {
          return "Code 39 faqat katta lotin harflari (A-Z), raqamlar (0-9) va (- . $ / + % bo'shliq) belgilarini qabul qiladi.";
        }
        break;
      case 'codabar':
        if (!/^[A-Da-d][0-9\-\$\:\/\.\+]+[A-Da-d]$/.test(val)) {
          return "Codabar boshlanishi va tugashida A, B, C yoki D harflari bo'lishi lozim (masalan: A12345678B).";
        }
        break;
      default:
        break;
    }
    return null;
  };

  // Render Barcode
  useEffect(() => {
    const errorMsg = validateBarcode(format, value);
    setValidationError(errorMsg);

    if (errorMsg) return;

    try {
      if (svgRef.current) {
        JsBarcode(svgRef.current, value, {
          format,
          lineColor,
          background,
          width,
          height,
          margin,
          displayValue,
          fontSize,
          font: 'monospace',
          valid: (valid) => {
            if (!valid) {
              setValidationError("Ushbu qiymat tanlangan format nazorat raqamiga (checksum) mos kelmadi.");
            }
          }
        });
      }

      // Also render to hidden canvas for PNG export
      if (canvasRef.current) {
        JsBarcode(canvasRef.current, value, {
          format,
          lineColor,
          background,
          width,
          height,
          margin,
          displayValue,
          fontSize,
          font: 'monospace',
        });
      }
    } catch (err: any) {
      setValidationError("Generatsiyada xatolik: " + (err.message || "Qiymat formatga mos emas"));
    }
  }, [format, value, lineColor, background, width, height, margin, displayValue, fontSize]);

  // Quick preset loader
  const loadPreset = (fmt: BarcodeFormat, sample: string) => {
    setFormat(fmt);
    setValue(sample);
  };

  const handleCopyValue = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadPNG = () => {
    if (!canvasRef.current || validationError) return;
    const a = document.createElement('a');
    a.download = `SmartTools-Barcode-${format}-${value}.png`;
    a.href = canvasRef.current.toDataURL('image/png');
    a.click();
  };

  const downloadSVG = () => {
    if (!svgRef.current || validationError) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `SmartTools-Barcode-${format}-${value}.svg`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    if (!canvasRef.current || validationError) return;
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [120, 80],
    });

    const imgData = canvasRef.current.toDataURL('image/png');
    doc.setFontSize(10);
    doc.text(`SmartTools Barcode (${format})`, 60, 10, { align: 'center' });
    doc.addImage(imgData, 'PNG', 10, 16, 100, 50);

    doc.save(`SmartTools-Barcode-${format}-${value}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-slate-900 text-white shadow-xl">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
            <BarcodeIcon className="w-5 h-5 text-cyan-300" />
          </span>
          <h2 className="text-xl font-bold">Barcode Generator Pro</h2>
        </div>
        <p className="text-xs text-slate-300 mt-1 max-w-xl">
          Code 128, Code 39, EAN-13, EAN-8, UPC, ITF va Codabar formatlarida tovar va logistika shtrix-kodlari.
          Avtomatik qat'iy nazorat (checksum) va xatoliklar tushuntirishi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Left */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            {/* Format Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Shtrix-kod formati
                </label>
                <span className="text-[10px] text-slate-400">Standartlar</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {[
                  { id: 'CODE128', label: 'Code 128', desc: 'Universal (Harf+Raqam)' },
                  { id: 'CODE39', label: 'Code 39', desc: 'Sanoat standarti' },
                  { id: 'EAN13', label: 'EAN-13', desc: 'Savdo (13 raqam)' },
                  { id: 'EAN8', label: 'EAN-8', desc: 'Kichik tovar (8 raqam)' },
                  { id: 'UPC', label: 'UPC-A', desc: 'AQSH / Xalqaro (12)' },
                  { id: 'ITF', label: 'ITF (14)', desc: 'Karton qutilar' },
                  { id: 'codabar', label: 'Codabar', desc: 'Kutubxona / Tibbiyot' },
                  { id: 'pharmacode', label: 'Pharmacode', desc: 'Farmatsevtika' },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => {
                      setFormat(f.id as BarcodeFormat);
                      if (f.id === 'EAN13') setValue('478000123456');
                      if (f.id === 'EAN8') setValue('4780123');
                      if (f.id === 'UPC') setValue('01234567890');
                      if (f.id === 'ITF') setValue('123456789012');
                      if (f.id === 'codabar') setValue('A12345678B');
                      if (f.id === 'CODE39') setValue('PRODUCT-99');
                    }}
                    className={`p-2 rounded-xl border text-left transition ${
                      format === f.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <p className="text-xs font-bold leading-tight">{f.label}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Value */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kod qiymati
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyValue}
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-indigo-600"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Nusxalandi' : 'Nusxalash'}
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Qiymatni kiriting..."
                className={`w-full text-xs font-mono p-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 transition ${
                  validationError
                    ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/20'
                    : 'border-slate-300 dark:border-slate-700 focus:ring-indigo-500'
                }`}
              />

              {/* Validation Message */}
              {validationError ? (
                <div className="mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-start gap-2 text-xs text-rose-800 dark:text-rose-200">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Format talabi buzildi:</span> {validationError}
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Ushbu format va qiymat xalqaro standartga to'liq mos keladi.
                </div>
              )}
            </div>

            {/* Customization options */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Chiziqlar rangi
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={lineColor}
                    onChange={(e) => setLineColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={lineColor}
                    onChange={(e) => setLineColor(e.target.value)}
                    className="w-full text-xs uppercase font-mono p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Orqa fon rangi
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="w-9 h-9 rounded-lg border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="w-full text-xs uppercase font-mono p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Balandlik (Height): {height}px
                </label>
                <input
                  type="range"
                  min="40"
                  max="160"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Kenglik (Width scale): {width}
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.5"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            {/* Toggle display text */}
            <div className="pt-2 flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={displayValue}
                  onChange={(e) => setDisplayValue(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600"
                />
                Matn / Raqamni ostida ko'rsatish
              </label>

              {displayValue && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Shrift o'lchami:</span>
                  <input
                    type="number"
                    min="10"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-14 text-xs p-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-center"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Right */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-lg">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Shtrix-kod Vizual Ko'rinishi
            </h3>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-center min-h-[200px] overflow-x-auto">
              {!validationError ? (
                <svg ref={svgRef} className="max-w-full h-auto" />
              ) : (
                <div className="text-rose-500 text-xs flex flex-col items-center gap-2">
                  <AlertCircle className="w-8 h-8 opacity-60" />
                  <span>Xatolik tufayli shtrix-kod chizilmadi</span>
                </div>
              )}
              {/* Hidden canvas for PNG export */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Export buttons */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 text-left mb-2">
                Formatlarda yuklab olish
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={downloadPNG}
                  disabled={Boolean(validationError)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  PNG
                </button>
                <button
                  onClick={downloadSVG}
                  disabled={Boolean(validationError)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 text-xs font-semibold transition active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  SVG
                </button>
                <button
                  onClick={downloadPDF}
                  disabled={Boolean(validationError)}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-slate-700 dark:text-slate-300 text-xs font-semibold transition active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import mammoth from 'mammoth';
import { jsPDF } from 'jspdf';
import {
  FileText,
  Upload,
  Sparkles,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Download,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Wand2,
  RefreshCw,
  Trash2
} from 'lucide-react';

export const DocumentAI: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isProcessingAI, setIsProcessingAI] = useState<boolean>(false);
  const [activeAIAction, setActiveAIAction] = useState<string>('');
  const [fontSize, setFontSize] = useState<number>(15);
  const [fontFamily, setFontFamily] = useState<string>('sans-serif');
  const [customTextColor, setCustomTextColor] = useState<string | null>(null);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [lineHeight, setLineHeight] = useState<number>(1.6);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const editorRef = useRef<HTMLTextAreaElement | null>(null);

  // Clear text
  const handleClear = () => {
    setContent('');
    setFileName('');
    setStatusMessage("Matn tozalandi.");
  };

  // Load sample text
  const handleLoadSample = () => {
    setContent(
      `SmartTools AI Platformasi haqida hisobot.\n\nUshbu loyiha zamonaviy web texnologiyalari va sun'iy intellekt vositalarini birlashtirgan ko'p funksiyali tizimdir. Foydalanuvchilar hujjatlarni tahrirlashi, imlo va uslubiy xatolarni sun'iy intellekt orqali bartaraf etishi mumkin.`
    );
    setStatusMessage("Namuna matn yuklandi.");
  };

  // File Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatusMessage(null);
    setErrorMessage(null);
    setFileName(file.name);
    const extension = file.name.split('.').pop()?.toLowerCase();

    try {
      if (extension === 'txt' || extension === 'rtf' || extension === 'md') {
        const text = await file.text();
        setContent(text);
        setStatusMessage(`"${file.name}" matni muvaffaqiyatli yuklandi.`);
      } else if (extension === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setContent(result.value);
        setStatusMessage(`DOCX hujjatdan ${result.value.length} belgi o'qildi.`);
      } else if (extension === 'pdf') {
        // PDF text extraction using OCR backend
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const base64 = ev.target?.result as string;
          setIsProcessingAI(true);
          setStatusMessage("PDF tahlil qilinmoqda...");
          try {
            const res = await fetch('/api/ai/ocr', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageBase64: base64,
                mimeType: 'application/pdf',
                languageHint: "O'zbek, Rus, Ingliz"
              }),
            });
            const data = await res.json();
            if (data.text) {
              setContent(data.text);
              setStatusMessage("PDF dan matn muvaffaqiyatli ajratildi!");
            }
          } catch {
            setErrorMessage("PDF matnini ajratishda xatolik yuz berdi.");
          } finally {
            setIsProcessingAI(false);
          }
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('image/')) {
        // Image OCR
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const base64 = ev.target?.result as string;
          setIsProcessingAI(true);
          setStatusMessage("Rasmdagi matn aniqlanmoqda...");
          try {
            const res = await fetch('/api/ai/ocr', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                imageBase64: base64,
                mimeType: file.type,
                languageHint: "O'zbek, Rus, Ingliz"
              }),
            });
            const data = await res.json();
            if (data.text) {
              setContent(data.text);
              setStatusMessage("Rasmdan matn o'qildi!");
            }
          } catch {
            setErrorMessage("Rasmdagi matnni aniqlashda xatolik.");
          } finally {
            setIsProcessingAI(false);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (err: any) {
      setErrorMessage("Faylni o'qishda xatolik: " + err.message);
    }
  };

  // Trigger Gemini AI actions
  const runAIAction = async (action: 'correct' | 'shorten' | 'expand' | 'formal' | 'simple' | 'professional' | 'grammar') => {
    setStatusMessage(null);
    setErrorMessage(null);
    if (!content.trim()) {
      setErrorMessage("Iltimos, tahrirlash uchun matn kiriting yoki hujjat yuklang.");
      return;
    }

    setIsProcessingAI(true);
    setActiveAIAction(action);
    try {
      const res = await fetch('/api/ai/document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, action }),
      });
      const data = await res.json();
      if (res.ok && data.result) {
        setContent(data.result);
        setStatusMessage("Matn sun'iy intellekt tomonidan muvaffaqiyatli tahrirlandi!");
      } else {
        setErrorMessage(data.error || "AI so'rovida xatolik yuz berdi");
      }
    } catch (err: any) {
      setErrorMessage("Aloqa xatosi: " + err.message);
    } finally {
      setIsProcessingAI(false);
      setActiveAIAction('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportTXT = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `SmartTools-Document-${Date.now()}.txt`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    doc.setFontSize(14);
    doc.text(fileName ? `Hujjat: ${fileName}` : 'SmartTools AI Hujjat', 20, 20);

    doc.setFontSize(fontSize > 16 ? 13 : fontSize);
    const splitText = doc.splitTextToSize(content, 170);
    doc.text(splitText, 20, 32);

    doc.save(`SmartTools-Document-${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-900/90 via-purple-900/90 to-slate-900 text-white shadow-xl">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
            <FileText className="w-5 h-5 text-purple-300" />
          </span>
          <h2 className="text-xl font-bold">Document AI & Editor</h2>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-400/30">
            Gemini Flash
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-1 max-w-xl">
          PDF, DOCX, TXT va rasm hujjatlarini tahrirlash, boy formatlash,
          imlo va grammatik xatolarni tuzatish, rasmiy yoki sodda uslubga o'girish.
        </p>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Editor & AI Tools Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Editor Center/Left */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden">
            {/* Toolbar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              {/* Text formatting controls */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsBold(!isBold)}
                  className={`p-2 rounded-lg border transition ${
                    isBold
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                  title="Qalin (Bold)"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsItalic(!isItalic)}
                  className={`p-2 rounded-lg border transition ${
                    isItalic
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                  title="Qiya (Italic)"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsUnderline(!isUnderline)}
                  className={`p-2 rounded-lg border transition ${
                    isUnderline
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                  title="Tagiga chizilgan (Underline)"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>

                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

                {/* Alignment */}
                <button
                  type="button"
                  onClick={() => setTextAlign('left')}
                  className={`p-2 rounded-lg border transition ${
                    textAlign === 'left' ? 'bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700'
                  }`}
                  title="Chapga"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTextAlign('center')}
                  className={`p-2 rounded-lg border transition ${
                    textAlign === 'center' ? 'bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700'
                  }`}
                  title="Markazga"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTextAlign('right')}
                  className={`p-2 rounded-lg border transition ${
                    textAlign === 'right' ? 'bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700'
                  }`}
                  title="O'ngga"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTextAlign('justify')}
                  className={`p-2 rounded-lg border transition ${
                    textAlign === 'justify' ? 'bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700'
                  }`}
                  title="Tekislash"
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Font settings & Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs"
                >
                  <option value="sans-serif">Inter (Sans)</option>
                  <option value="'Playfair Display', serif">Playfair (Serif)</option>
                  <option value="'JetBrains Mono', monospace">Monospace</option>
                  <option value="'Caveat', cursive">Caveat (Qo'lyozma)</option>
                </select>

                <div className="flex items-center gap-1">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">O'lcham:</span>
                  <input
                    type="number"
                    min="11"
                    max="28"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-12 p-1 text-center rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs"
                  />
                </div>

                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={customTextColor || '#6366f1'}
                    onChange={(e) => setCustomTextColor(e.target.value)}
                    className="w-7 h-7 rounded border border-slate-300 dark:border-slate-700 cursor-pointer"
                    title="Matn rangini tanlash"
                  />
                  {customTextColor && (
                    <button
                      type="button"
                      onClick={() => setCustomTextColor(null)}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600"
                      title="Avtomatik mavzu rangiga qaytarish"
                    >
                      Asl rang
                    </button>
                  )}
                </div>

                <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1 hidden sm:block" />

                {/* Sample and Clear buttons */}
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-300 transition"
                  title="Namuna matn yuklash"
                >
                  Namuna
                </button>

                {content && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-[11px] font-semibold transition"
                    title="Matnni tozalash"
                  >
                    <Trash2 className="w-3 h-3" />
                    Tozalash
                  </button>
                )}
              </div>
            </div>

            {/* Editable Area */}
            <div className="p-4 relative">
              <textarea
                ref={editorRef}
                rows={16}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Bu yerga hujjat matnini yozing yoki o'ng tomondan fayl (PDF, Word, TXT, Rasm) yuklang..."
                style={{
                  fontSize: `${fontSize}px`,
                  fontFamily: fontFamily,
                  ...(customTextColor ? { color: customTextColor } : {}),
                  textAlign: textAlign,
                  fontWeight: isBold ? 'bold' : 'normal',
                  fontStyle: isItalic ? 'italic' : 'normal',
                  textDecoration: isUnderline ? 'underline' : 'none',
                  lineHeight: lineHeight,
                }}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-y min-h-[380px] leading-relaxed transition"
              />

              {isProcessingAI && (
                <div className="absolute inset-0 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3 rounded-xl z-10">
                  <div className="w-10 h-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300 animate-pulse">
                    AI hujjatni qayta ishlamoqda ({activeAIAction})...
                  </p>
                </div>
              )}
            </div>

            {/* Editor Stats Footer */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-4">
                <span>So'zlar: <strong className="text-slate-700 dark:text-slate-300">{content.trim() ? content.trim().split(/\s+/).length : 0}</strong></span>
                <span>Belgilar: <strong className="text-slate-700 dark:text-slate-300">{content.length}</strong></span>
                {fileName && <span className="text-indigo-600 dark:text-indigo-400 truncate max-w-xs font-medium">Fayl: {fileName}</span>}
              </div>
              <div className="flex items-center gap-2">
                {content && (
                  <button
                    onClick={handleClear}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                    Tozalash
                  </button>
                )}
                <button
                  onClick={copyToClipboard}
                  disabled={!content}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 text-xs font-medium"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Nusxalandi' : 'Nusxalash'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* AI Capabilities & File Actions Right */}
        <div className="lg:col-span-4 space-y-4">
          {/* File Upload Box */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hujjat Yuklash
            </h3>
            <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-xl cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 transition">
              <Upload className="w-6 h-6 text-indigo-500 mb-1" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                PDF, DOCX, TXT, RTF yoki Rasm
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">Avtomatik matnga aylantiriladi</span>
              <input
                type="file"
                accept=".txt,.docx,.rtf,.pdf,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* AI Smart Operations */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Sparkles className="w-4 h-4 text-violet-500" />
              AI bilan tahrirlash
            </div>

            <div className="space-y-2">
              <button
                onClick={() => runAIAction('correct')}
                disabled={isProcessingAI}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 text-left text-xs transition"
              >
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">Imlo va xatolarni tuzatish</p>
                  <p className="text-[10px] text-slate-400">Barcha xatolarni tuzatib, sof variantini chiqaradi</p>
                </div>
                <Wand2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              </button>

              <button
                onClick={() => runAIAction('formal')}
                disabled={isProcessingAI}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 text-left text-xs transition"
              >
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">Rasmiy-idoraviy uslub</p>
                  <p className="text-[10px] text-slate-400">Hujjat va arizalar uchun jiddiy uslubga o'girish</p>
                </div>
                <Wand2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              </button>

              <button
                onClick={() => runAIAction('simple')}
                disabled={isProcessingAI}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 text-left text-xs transition"
              >
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">Oddiy xalq tilida tushuntirish</p>
                  <p className="text-[10px] text-slate-400">Murakkab matnlarni har kim tushunadigan sodda qilish</p>
                </div>
                <Wand2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              </button>

              <button
                onClick={() => runAIAction('shorten')}
                disabled={isProcessingAI}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 text-left text-xs transition"
              >
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">Qisqartirish (Konspekt)</p>
                  <p className="text-[10px] text-slate-400">Asosiy mohiyatni saqlab ixchamlashtirish</p>
                </div>
                <Wand2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              </button>

              <button
                onClick={() => runAIAction('expand')}
                disabled={isProcessingAI}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 text-left text-xs transition"
              >
                <div>
                  <p className="font-bold text-slate-800 dark:text-white">Kengaytirish va boyitish</p>
                  <p className="text-[10px] text-slate-400">Tafsilotlar va mantiqiy fikrlar bilan to'ldirish</p>
                </div>
                <Wand2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              </button>
            </div>
          </div>

          {/* Export card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Eksport Qilish
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={exportTXT}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <Download className="w-3.5 h-3.5" />
                TXT yuklash
              </button>
              <button
                onClick={exportPDF}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20"
              >
                <Download className="w-3.5 h-3.5" />
                PDF yuklash
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

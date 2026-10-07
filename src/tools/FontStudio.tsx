import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import {
  PenTool,
  Download,
  Copy,
  Check,
  Sparkles,
  Info,
  Type,
  Palette,
  Layers
} from 'lucide-react';

interface FontOption {
  id: string;
  name: string;
  category: string;
  fontFamily: string;
  sampleName: string;
}

const FONTS: FontOption[] = [
  // Handwriting
  { id: 'caveat', name: 'Caveat (Tabiiy Qo\'lyozma)', category: 'Handwriting', fontFamily: "'Caveat', cursive", sampleName: 'Samimiy eslatma' },
  { id: 'dancing', name: 'Dancing Script', category: 'Handwriting', fontFamily: "'Dancing Script', cursive", sampleName: 'Nozik yozuv' },
  // Signature
  { id: 'great_vibes', name: 'Great Vibes (Klassik Imzo)', category: 'Signature-style', fontFamily: "'Great Vibes', cursive", sampleName: 'Mualliflik imzosi' },
  { id: 'alex_brush', name: 'Alex Brush (Elegant Imzo)', category: 'Signature-style', fontFamily: "'Alex Brush', cursive", sampleName: 'Rasmiy imzo uslubi' },
  { id: 'pacifico', name: 'Pacifico (Qalin Qalam)', category: 'Signature-style', fontFamily: "'Pacifico', cursive", sampleName: 'Zamonaviy imzo' },
  // Modern & Minimal
  { id: 'montserrat', name: 'Montserrat (Zamonaviy)', category: 'Modern', fontFamily: "'Montserrat', sans-serif", sampleName: 'Modern Brand' },
  { id: 'inter', name: 'Inter (Minimal)', category: 'Minimal', fontFamily: "'Inter', sans-serif", sampleName: 'Clean Typography' },
  // Elegant & Professional
  { id: 'playfair', name: 'Playfair Display (Professional)', category: 'Professional', fontFamily: "'Playfair Display', serif", sampleName: 'Editorial & Luxury' },
  { id: 'cinzel', name: 'Cinzel (Qirollik / Elegant)', category: 'Elegant', fontFamily: "'Cinzel', serif", sampleName: 'Imperial Classic' },
  // Monospace
  { id: 'jetbrains', name: 'JetBrains Mono (Dasturchi)', category: 'Monospace', fontFamily: "'JetBrains Mono', monospace", sampleName: 'console.log("SmartTools")' },
];

export const FontStudio: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [selectedFont, setSelectedFont] = useState<FontOption>(FONTS[2]); // Great Vibes
  const [fontSize, setFontSize] = useState<number>(48);
  const [textColor, setTextColor] = useState<string>('#6366f1');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [transparentBg, setTransparentBg] = useState<boolean>(true);
  const [activeCategory, setActiveCategory] = useState<string>('Barchasi');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const categories = ['Barchasi', 'Handwriting', 'Signature-style', 'Modern', 'Professional', 'Elegant', 'Minimal', 'Monospace'];
  const sampleSuggestions = ['Mustafo Olimjanov', 'SmartTools AI', 'Designer & Dev', 'Toshkent'];
  const colorPresets = [
    { label: 'Indigo', hex: '#6366f1' },
    { label: 'Moviy', hex: '#0ea5e9' },
    { label: 'Zumrad', hex: '#10b981' },
    { label: 'Oltin', hex: '#f59e0b' },
    { label: 'Oq', hex: '#ffffff' },
    { label: 'To\'q', hex: '#0f172a' },
    { label: 'Pushti', hex: '#ec4899' },
    { label: 'Binafsha', hex: '#8b5cf6' },
  ];

  const filteredFonts = activeCategory === 'Barchasi'
    ? FONTS
    : FONTS.filter((f) => f.category === activeCategory);

  // Render to canvas for export
  const renderCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    if (!transparentBg) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = textColor;
    ctx.font = `${fontSize * 2}px ${selectedFont.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text || 'SmartTools', canvas.width / 2, canvas.height / 2);

    return canvas;
  };

  const downloadPNG = () => {
    const canvas = renderCanvas();
    const a = document.createElement('a');
    a.download = `SmartTools-Font-${selectedFont.id}-${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  const downloadSVG = () => {
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1000" height="300" viewBox="0 0 1000 300">
        ${!transparentBg ? `<rect width="100%" height="100%" fill="${bgColor}"/>` : ''}
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="${selectedFont.fontFamily.replace(/"/g, "'")}" font-size="${fontSize * 1.5}" fill="${textColor}">
          ${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
        </text>
      </svg>
    `;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `SmartTools-Font-${selectedFont.id}-${Date.now()}.svg`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const canvas = renderCanvas();
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    doc.setFontSize(12);
    doc.text(`SmartTools Handwriting / Font Studio (${selectedFont.name})`, 148, 25, { align: 'center' });

    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 30, 40, 237, 79);

    doc.setFontSize(9);
    doc.setTextColor(140);
    doc.text('Ijodiy va dizayn maqsadlarida foydalanish uchun', 148, 190, { align: 'center' });

    doc.save(`SmartTools-Font-${selectedFont.id}-${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900/90 via-indigo-900/90 to-slate-900 text-white shadow-xl">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
            <PenTool className="w-5 h-5 text-purple-300" />
          </span>
          <h2 className="text-xl font-bold">Handwriting / Font Studio</h2>
        </div>
        <p className="text-xs text-slate-300 mt-1 max-w-xl">
          Matnni qo'lyozma, imzo uslubi, elegant va zamonaviy shriftlarda jonli ko'rish hamda
          PNG (shaffof fon), SVG va PDF formatlarida eksport qilish.
        </p>
      </div>

      {/* Mandatory Disclaimer (Requirement 8) */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Dizayn va Ijodiy foydalanish eslatmasi:</span>
          <p className="mt-0.5 leading-relaxed">
            Qo'lda yozilganga o'xshash va imzo uslubidagi shriftlar faqat ijodiy, dizayn (tabriknomalar, sertifikatlar, brending)
            maqsadlarida foydalanish uchun mo'ljallangan. Ular yuridik va rasmiy hujjatlarda haqiqiy shaxsiy qo'l imzosi o'rnini bosmaydi.
          </p>
        </div>
      </div>

      {/* Controls & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input & Fonts List */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            {/* Input text */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Matn yoki Ism-familiya
                </label>
                {text && (
                  <button
                    type="button"
                    onClick={() => setText('')}
                    className="text-[11px] font-semibold text-rose-500 hover:text-rose-600"
                  >
                    Tozalash
                  </button>
                )}
              </div>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Yozuv yoki imzo matnini kiriting..."
                className="w-full text-sm p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Namunalar:</span>
                {sampleSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setText(s)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter pills */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Shrift kategoriyasi
              </label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                      activeCategory === cat
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Font selector cards */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredFonts.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFont(f)}
                  className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between ${
                    selectedFont.id === f.id
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{f.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {f.category}
                      </span>
                    </div>
                    <p
                      style={{ fontFamily: f.fontFamily }}
                      className="text-lg text-indigo-900 dark:text-indigo-200 truncate"
                    >
                      {text || f.sampleName}
                    </p>
                  </div>
                  {selectedFont.id === f.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Colors & Size adjustments */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Matn rangi
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-8 h-8 rounded border cursor-pointer"
                    />
                    <span className="text-xs font-mono">{textColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Orqa fon
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      disabled={transparentBg}
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-8 h-8 rounded border cursor-pointer disabled:opacity-40"
                    />
                    <label className="text-[11px] text-slate-500 flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={transparentBg}
                        onChange={(e) => setTransparentBg(e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      Shaffof
                    </label>
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    O'lcham: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="24"
                    max="80"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>

              {/* Quick Color Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">Ranglar:</span>
                {colorPresets.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setTextColor(c.hex)}
                    className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 transition hover:scale-110 shadow-xs"
                    style={{ backgroundColor: c.hex }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Large Preview & Export */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center flex flex-col items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Tanlangan Shrift Ko'rinishi
            </h3>

            {/* Live Interactive Preview Box */}
            <div
              style={{
                backgroundColor: transparentBg ? 'transparent' : bgColor,
              }}
              className={`w-full min-h-[220px] rounded-2xl border border-slate-200 dark:border-slate-700 p-8 flex items-center justify-center transition-all ${
                transparentBg
                  ? 'bg-[repeating-conic-gradient(#f8fafc_0%_25%,#e2e8f0_0%_50%)] dark:bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)] [background-size:16px_16px]'
                  : ''
              }`}
            >
              <p
                style={{
                  fontFamily: selectedFont.fontFamily,
                  fontSize: `${fontSize}px`,
                  color: textColor,
                  lineHeight: 1.2,
                }}
                className="text-center select-all break-words max-w-full"
              >
                {text || <span className="opacity-40 italic">Matningizni shu yerda ko'rasiz...</span>}
              </p>
            </div>

            <div className="w-full mt-3 text-xs text-slate-500 flex justify-between px-1">
              <span>Shrift: <strong className="text-slate-800 dark:text-slate-200">{selectedFont.name}</strong></span>
              <span>Kategoriya: {selectedFont.category}</span>
            </div>

            {/* Export buttons */}
            <div className="w-full mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 text-left mb-2">
                Yuklab olish
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={downloadPNG}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  PNG (Shaffof)
                </button>
                <button
                  onClick={downloadSVG}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  SVG (Vektor)
                </button>
                <button
                  onClick={downloadPDF}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition active:scale-95"
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

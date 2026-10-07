import React, { useState, useRef, useEffect } from 'react';
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
  Layers,
  Wand2,
  Award,
  RefreshCw,
  Undo2,
  Eraser,
  Eye,
  Sliders,
  Share2
} from 'lucide-react';
import {
  SIGNATURE_STYLES,
  INK_COLORS,
  SignatureStyleConfig,
  RecommendedSignature,
  generateSignaturesForName,
  generateFlourishPath
} from '../utils/signatureEngine';

interface FontOption {
  id: string;
  name: string;
  category: string;
  fontFamily: string;
  sampleName: string;
}

const FONTS: FontOption[] = [
  // Handwriting & Signatures
  { id: 'great_vibes', name: 'Great Vibes (Klassik Imzo)', category: 'Signature-style', fontFamily: "'Great Vibes', cursive", sampleName: 'Mualliflik imzosi' },
  { id: 'alex_brush', name: 'Alex Brush (Elegant Imzo)', category: 'Signature-style', fontFamily: "'Alex Brush', cursive", sampleName: 'Rasmiy imzo uslubi' },
  { id: 'allura', name: 'Allura (Nozik Badiiy)', category: 'Signature-style', fontFamily: "'Allura', cursive", sampleName: 'Eksklyuziv imzo' },
  { id: 'dancing', name: 'Dancing Script', category: 'Handwriting', fontFamily: "'Dancing Script', cursive", sampleName: 'Nozik yozuv' },
  { id: 'caveat', name: 'Caveat (Tabiiy Qo\'lyozma)', category: 'Handwriting', fontFamily: "'Caveat', cursive", sampleName: 'Samimiy eslatma' },
  { id: 'parisienne', name: 'Parisienne (Fransuz Monogramma)', category: 'Signature-style', fontFamily: "'Parisienne', cursive", sampleName: 'Monogramma & Muhr' },
  { id: 'sacramento', name: 'Sacramento (Yupqa Qalam)', category: 'Signature-style', fontFamily: "'Sacramento', cursive", sampleName: 'Minimalist imzo' },
  { id: 'pacifico', name: 'Pacifico (Qalin Qalam)', category: 'Handwriting', fontFamily: "'Pacifico', cursive", sampleName: 'Zamonaviy imzo' },
  { id: 'marck_script', name: 'Marck Script (Slavyan Qo\'lyozma)', category: 'Handwriting', fontFamily: "'Marck Script', cursive", sampleName: 'Tezkor qo\'lyozma' },
  // Modern & Minimal
  { id: 'montserrat', name: 'Montserrat (Zamonaviy)', category: 'Modern', fontFamily: "'Montserrat', sans-serif", sampleName: 'Modern Brand' },
  { id: 'inter', name: 'Inter (Minimal)', category: 'Minimal', fontFamily: "'Inter', sans-serif", sampleName: 'Clean Typography' },
  // Elegant & Professional
  { id: 'playfair', name: 'Playfair Display (Professional)', category: 'Professional', fontFamily: "'Playfair Display', serif", sampleName: 'Editorial & Luxury' },
  { id: 'cinzel', name: 'Cinzel (Qirollik / Elegant)', category: 'Elegant', fontFamily: "'Cinzel', serif", sampleName: 'Imperial Classic' },
  { id: 'jetbrains', name: 'JetBrains Mono (Dasturchi)', category: 'Monospace', fontFamily: "'JetBrains Mono', monospace", sampleName: 'console.log("SmartTools")' },
];

export const FontStudio: React.FC = () => {
  // Main Tab: 'signature' | 'fonts' | 'practice'
  const [activeTab, setActiveTab] = useState<'signature' | 'fonts' | 'practice'>('signature');

  // Common Text State
  const [nameInput, setNameInput] = useState<string>('');
  const [inkColor, setInkColor] = useState<string>('#09090b'); // default black ink
  const [copied, setCopied] = useState<boolean>(false);

  // Signature Recommendation States
  const [selectedStyleId, setSelectedStyleId] = useState<string>('executive');
  const [customSlant, setCustomSlant] = useState<number>(8);
  const [customFlourish, setCustomFlourish] = useState<SignatureStyleConfig['flourishType'] | 'none'>('executive');
  const [penThickness, setPenThickness] = useState<number>(2.2);
  const [transparentBg, setTransparentBg] = useState<boolean>(true);
  const [bgColor, setBgColor] = useState<string>('#ffffff');

  // Font Studio (Tab 2) specific states
  const [selectedFont, setSelectedFont] = useState<FontOption>(FONTS[0]);
  const [fontStudioSize, setFontStudioSize] = useState<number>(48);
  const [fontStudioTextColor, setFontStudioTextColor] = useState<string>('#6366f1');
  const [fontStudioCategory, setFontStudioCategory] = useState<string>('Barchasi');

  // Practice Pad (Tab 3) specific states
  const [isTracingGuideEnabled, setIsTracingGuideEnabled] = useState<boolean>(true);
  const [practicePenSize, setPracticePenSize] = useState<number>(3);
  const practiceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawHistory, setDrawHistory] = useState<ImageData[]>([]);

  // Generated recommendation data based on nameInput
  const recommendationData = React.useMemo(() => {
    return generateSignaturesForName(nameInput || 'Mustafo Olimjanov');
  }, [nameInput]);

  // Active chosen signature variant
  const activeSignature: RecommendedSignature = React.useMemo(() => {
    const match = recommendationData.variants.find((v) => v.style.id === selectedStyleId);
    return match || recommendationData.variants[recommendationData.recommendedIndex];
  }, [recommendationData, selectedStyleId]);

  // When active signature style changes, synchronize slant & flourish default
  useEffect(() => {
    if (activeSignature) {
      setCustomSlant(activeSignature.style.defaultSlant);
      setCustomFlourish(activeSignature.style.flourishType);
      setPenThickness(activeSignature.style.strokeWidth);
    }
  }, [selectedStyleId]);

  // Computed flourish path
  const currentFlourishSvgPath = React.useMemo(() => {
    if (customFlourish === 'none') return '';
    return generateFlourishPath(customFlourish, 500, 150, 42);
  }, [customFlourish]);

  // Sample quick chips
  const sampleSuggestions = [
    'Mustafo Olimjanov',
    'Aziza Rahimova',
    'Sardor Aliyev',
    'SmartTools AI',
    'Dilnoza Karimova',
  ];

  // ==========================================
  // CANVAS RENDERER FOR SIGNATURE EXPORT
  // ==========================================
  const renderSignatureCanvas = (): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    if (!transparentBg) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    ctx.save();
    // Center of canvas
    ctx.translate(canvas.width / 2, canvas.height / 2 - 20);

    // Apply Slant / Italic skew
    const skewRad = (-customSlant * Math.PI) / 180;
    ctx.transform(1, 0, Math.tan(skewRad * 0.4), 1, 0, 0);

    // Render Text
    ctx.fillStyle = inkColor;
    ctx.font = `bold 100px ${activeSignature.style.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(activeSignature.displayText, 0, 0);

    // Render Flourish Path
    if (currentFlourishSvgPath) {
      ctx.save();
      // Move to flourish baseline below text
      ctx.translate(-300, -20);
      ctx.scale(1.2, 1.2);
      ctx.lineWidth = penThickness * 1.8;
      ctx.strokeStyle = inkColor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      try {
        const path = new Path2D(currentFlourishSvgPath);
        ctx.stroke(path);
      } catch {
        // Fallback smooth underline if Path2D is not supported
        ctx.beginPath();
        ctx.moveTo(50, 110);
        ctx.quadraticCurveTo(250, 130, 450, 110);
        ctx.stroke();
      }
      ctx.restore();
    }

    ctx.restore();
    return canvas;
  };

  // ==========================================
  // EXPORT HANDLERS
  // ==========================================
  const downloadSignaturePNG = () => {
    const canvas = renderSignatureCanvas();
    const a = document.createElement('a');
    const safeName = (nameInput.trim() || 'imzo').replace(/\s+/g, '_');
    a.download = `Imzo-${safeName}-${activeSignature.style.id}-${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  const downloadSignatureSVG = () => {
    const safeText = activeSignature.displayText
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    const safeName = (nameInput.trim() || 'imzo').replace(/\s+/g, '_');

    const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 200" width="600" height="200">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&amp;family=Allura&amp;family=Dancing+Script:wght@700&amp;family=Great+Vibes&amp;family=Parisienne&amp;family=Sacramento&amp;display=swap');
      .sig-text {
        font-family: ${activeSignature.style.fontFamily.replace(/"/g, "'")};
        font-size: 52px;
        fill: ${inkColor};
        font-weight: 600;
        text-anchor: middle;
        dominant-baseline: middle;
      }
      .sig-flourish {
        fill: none;
        stroke: ${inkColor};
        stroke-width: ${penThickness};
        stroke-linecap: round;
        stroke-linejoin: round;
      }
    </style>
  </defs>
  ${!transparentBg ? `<rect width="100%" height="100%" fill="${bgColor}"/>` : ''}
  <g transform="translate(300, 90) skewX(${-customSlant * 0.4})">
    <text class="sig-text" x="0" y="0">${safeText}</text>
  </g>
  ${
    currentFlourishSvgPath
      ? `<g transform="translate(50, 10) scale(1)">
          <path class="sig-flourish" d="${currentFlourishSvgPath}" />
        </g>`
      : ''
  }
</svg>`.trim();

    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `Imzo-${safeName}-${activeSignature.style.id}.svg`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadSignaturePDF = () => {
    const canvas = renderSignatureCanvas();
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Decorative Header
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text('SmartTools Shaxsiy Imzo Sertifikati / Certificate of Signature', 148, 26, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Egasi: ${nameInput || 'Foydalanuvchi'} | Uslub: ${activeSignature.style.name} | Kod: ${activeSignature.uniquenessCode}`, 148, 33, { align: 'center' });

    // Certificate Box
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(25, 42, 247, 125, 4, 4);

    // Signature image inside box
    const imgData = canvas.toDataURL('image/png');
    doc.addImage(imgData, 'PNG', 45, 55, 207, 72);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Eslatma: Ushbu imzo ijodiy va dizayn maqsadlarida tavsiya etilgan shaxsiy mualliflik uslubidir.', 148, 155, { align: 'center' });

    doc.save(`Imzo-${(nameInput || 'shaxsiy').replace(/\s+/g, '_')}.pdf`);
  };

  const copySignatureImage = async () => {
    try {
      const canvas = renderSignatureCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2200);
        } catch {
          // Fallback: copy data URL
          await navigator.clipboard.writeText(canvas.toDataURL('image/png'));
          setCopied(true);
          setTimeout(() => setCopied(false), 2200);
        }
      });
    } catch {
      // ignore
    }
  };

  // ==========================================
  // PRACTICE PAD (CANVAS) LOGIC
  // ==========================================
  useEffect(() => {
    if (activeTab === 'practice' && practiceCanvasRef.current) {
      const canvas = practiceCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      // Setup resolution
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      ctx.scale(2, 2);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = practicePenSize;
      // Save clear state
      const initialData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setDrawHistory([initialData]);
    }
  }, [activeTab]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = practiceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save history before new stroke
    const currentData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setDrawHistory((prev) => [...prev.slice(-10), currentData]);

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = inkColor;
    ctx.lineWidth = practicePenSize;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = practiceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
  };

  const undoPracticeStroke = () => {
    const canvas = practiceCanvasRef.current;
    if (!canvas || drawHistory.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const previous = drawHistory[drawHistory.length - 1];
    ctx.putImageData(previous, 0, 0);
    setDrawHistory((prev) => prev.slice(0, -1));
  };

  const clearPracticeCanvas = () => {
    const canvas = practiceCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawHistory([]);
  };

  const downloadPracticeDrawing = () => {
    const canvas = practiceCanvasRef.current;
    if (!canvas) return;
    const a = document.createElement('a');
    a.download = `Mashq-Imzo-${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  // ==========================================
  // TAB 2: GENERAL FONT STUDIO LOGIC
  // ==========================================
  const categories = ['Barchasi', 'Handwriting', 'Signature-style', 'Modern', 'Professional', 'Elegant', 'Minimal', 'Monospace'];
  const filteredFonts = fontStudioCategory === 'Barchasi'
    ? FONTS
    : FONTS.filter((f) => f.category === fontStudioCategory);

  const downloadFontStudioPNG = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!transparentBg) {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = fontStudioTextColor;
    ctx.font = `${fontStudioSize * 2}px ${selectedFont.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(nameInput || 'SmartTools', canvas.width / 2, canvas.height / 2);

    const a = document.createElement('a');
    a.download = `SmartTools-Font-${selectedFont.id}-${Date.now()}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 text-white shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30 backdrop-blur-sm text-indigo-300">
                <Wand2 className="w-5 h-5" />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Unikal Shaxsiy Imzo Tavsiyasi &amp; Font Studio
                </h2>
                <p className="text-xs text-indigo-200/90 mt-0.5">
                  Ismingiz yoki so'zingizni kiriting — uning harflari ritmiga mos <strong className="text-white">yagona shaxsiy imzo</strong> avtomatik tavsiya etiladi.
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/10 shrink-0 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('signature')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'signature'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-indigo-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Yagona Imzo Tavsiyasi
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'practice'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-indigo-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <PenTool className="w-3.5 h-3.5" />
              Qo'lda Mashq Qilish
            </button>
            <button
              onClick={() => setActiveTab('fonts')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'fonts'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-indigo-200 hover:text-white hover:bg-white/5'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              Shriftlar Kolleksiyasi
            </button>
          </div>
        </div>
      </div>

      {/* Primary Input Bar (Universal across tabs) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <PenTool className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Ismingiz, Familiyangiz yoki Biror So'zni Kiriting:
          </label>
          {nameInput && (
            <button
              type="button"
              onClick={() => setNameInput('')}
              className="text-xs text-rose-500 hover:text-rose-600 font-semibold self-end sm:self-auto"
            >
              Maydonni tozalash
            </button>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Masalan: Mustafo Olimjanov, Sardor, Aziza..."
            className="w-full text-base sm:text-lg font-medium py-3.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
          {nameInput && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {recommendationData.uniquenessKey}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Tezkor namunalar:</span>
          {sampleSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setNameInput(s)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: UNIQUE SIGNATURE RECOMMENDATION ENGINE                  */}
      {/* ============================================================== */}
      {activeTab === 'signature' && (
        <div className="space-y-6">
          {/* Smart Recommendation Analysis Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-200 dark:border-indigo-900/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Aqlli Imzo Tahlili ({nameInput ? `"${nameInput}" uchun` : 'Namunaviy tahlil'})
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                    98% Optimal Moslik
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  <strong className="text-slate-800 dark:text-slate-200">Harf tahlili:</strong> {recommendationData.insights.firstLetterTrait}
                  {' '}{recommendationData.insights.flowTrait}
                </p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <Award className="w-4 h-4 text-indigo-600" />
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Tavsiya Uslubi</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {recommendationData.insights.recommendedStyleName}
                </span>
              </div>
            </div>
          </div>

          {/* Main Showcase & Customizer Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Big Interactive Signature Canvas Showcase */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      {activeSignature.style.badge}
                    </span>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {activeSignature.style.name}
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {activeSignature.uniquenessCode}
                  </span>
                </div>

                {/* SVG Live Preview Container */}
                <div
                  style={{
                    backgroundColor: transparentBg ? 'transparent' : bgColor,
                  }}
                  className={`w-full min-h-[260px] sm:min-h-[300px] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center relative select-none transition-all ${
                    transparentBg
                      ? 'bg-[repeating-conic-gradient(#f8fafc_0%_25%,#e2e8f0_0%_50%)] dark:bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)] [background-size:16px_16px]'
                      : ''
                  }`}
                >
                  <svg
                    viewBox="0 0 600 200"
                    className="w-full h-auto max-h-[220px] drop-shadow-sm transition-transform duration-200"
                  >
                    <g transform={`translate(300, 90) skewX(${-customSlant * 0.4})`}>
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={inkColor}
                        style={{
                          fontFamily: activeSignature.style.fontFamily,
                          fontSize: '52px',
                          fontWeight: 600,
                          letterSpacing: activeSignature.style.letterSpacing,
                        }}
                      >
                        {activeSignature.displayText}
                      </text>
                    </g>
                    {currentFlourishSvgPath && (
                      <g transform="translate(50, 10)">
                        <path
                          d={currentFlourishSvgPath}
                          fill="none"
                          stroke={inkColor}
                          strokeWidth={penThickness}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="transition-all duration-300"
                        />
                      </g>
                    )}
                  </svg>

                  {/* Watermark subtle tag */}
                  <div className="absolute bottom-3 right-4 text-[10px] text-slate-400/60 font-mono">
                    SmartTools Signature Engine
                  </div>
                </div>

                {/* Quick Action Bar under Preview */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={copySignatureImage}
                      className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition active:scale-95"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-600 dark:text-emerald-400">Nusxalandi!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Rasm Nusxalash</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveTab('practice')}
                      className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-semibold transition active:scale-95"
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Shu Imzoni Mashq Qilish</span>
                    </button>
                  </div>

                  {/* Export Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={downloadSignaturePNG}
                      className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
                      title="Shaffof fonli yuqori sifatli PNG rasm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PNG (Shaffof)
                    </button>
                    <button
                      onClick={downloadSignatureSVG}
                      className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition active:scale-95"
                      title="Vektor SVG format"
                    >
                      <Download className="w-3.5 h-3.5" />
                      SVG
                    </button>
                    <button
                      onClick={downloadSignaturePDF}
                      className="flex items-center gap-1.5 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition active:scale-95"
                      title="PDF Hujjat sertifikati"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* Signature Details & Description */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-3">
                <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">Uslub tavsifi:</span>{' '}
                  {activeSignature.style.description}
                  <p className="mt-1 text-slate-500">
                    Siz ushbu imzoni ijtimoiy tarmoqlar, elektron xat (email) imzosi, foto-suv belgisi (watermark), sertifikat va dizayn ishlarida bemalol foydalanishingiz mumkin.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Customization Controls (Ink, Slant, Flourish, Stroke) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                    Imzo Parametrlarini Sozlash
                  </h4>
                  <button
                    onClick={() => {
                      setCustomSlant(activeSignature.style.defaultSlant);
                      setCustomFlourish(activeSignature.style.flourishType);
                      setPenThickness(activeSignature.style.strokeWidth);
                      setInkColor('#09090b');
                    }}
                    className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Asliga qaytarish
                  </button>
                </div>

                {/* Siyoh Rangi (Ink Color) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Siyoh Rangi (Ink Style)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {INK_COLORS.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setInkColor(c.hex)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition ${
                          inkColor === c.hex
                            ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-slate-400/40 shrink-0 shadow-xs"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200 truncate">
                          {c.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bezak Turi (Flourish Style) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Pastki Bezak Chizig'i (Flourish)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'executive', label: 'Qat\'iy To\'lqin' },
                      { id: 'loop', label: 'Dinamik Halqa' },
                      { id: 'royal', label: 'Qirollik Lentalari' },
                      { id: 'circle', label: 'Doiraviy Muhr' },
                      { id: 'ribbon', label: 'Artistik Spiral' },
                      { id: 'minimal', label: 'Minimalist Chiziq' },
                      { id: 'none', label: 'Bezaklarsiz (Toza)' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setCustomFlourish(f.id as any)}
                        className={`px-3 py-2 rounded-xl border text-xs font-medium text-left transition ${
                          customFlourish === f.id
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 font-bold text-indigo-900 dark:text-indigo-200'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Qiyalik (Slant Slider) */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Qiyalik burchagi (Slant)</span>
                    <span className="font-mono text-indigo-600">{customSlant}°</span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="25"
                    step="1"
                    value={customSlant}
                    onChange={(e) => setCustomSlant(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Tik (-10°)</span>
                    <span>Tabiiy (8°)</span>
                    <span>Ekspressiv (25°)</span>
                  </div>
                </div>

                {/* Qalam Qalinligi (Stroke Width) */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>Qalam qalinligi</span>
                    <span className="font-mono text-indigo-600">{penThickness}px</span>
                  </div>
                  <input
                    type="range"
                    min="1.2"
                    max="4.0"
                    step="0.2"
                    value={penThickness}
                    onChange={(e) => setPenThickness(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>Nozik (1.2px)</span>
                    <span>O'rtacha</span>
                    <span>Qalin pero (4.0px)</span>
                  </div>
                </div>

                {/* Shaffoflik va Fon */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={transparentBg}
                      onChange={(e) => setTransparentBg(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Shaffof fon (PNG uchun shaffof)</span>
                  </label>

                  {!transparentBg && (
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="w-7 h-7 rounded border cursor-pointer"
                      />
                      <span className="text-xs font-mono">{bgColor}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* ALL 6 UNIQUE RECOMMENDED SIGNATURE VARIATIONS (GALLERY)       */}
          {/* ============================================================== */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Sizning Ismingiz Uchun Yaratilgan Barcha 6 Xil Imzo Variantlari
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Istalgan variantni tanlang, tahrirlang yoki to'g'ridan-to'g'ri yuklab oling.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendationData.variants.map((variant, idx) => {
                const isSelected = selectedStyleId === variant.style.id;
                const isTopPick = idx === recommendationData.recommendedIndex;

                return (
                  <div
                    key={variant.style.id}
                    onClick={() => setSelectedStyleId(variant.style.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-white dark:bg-slate-900 ring-2 ring-indigo-500/30 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                    }`}
                  >
                    {/* Header */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {variant.style.name}
                        </span>
                        {isTopPick ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            #1 Bosh Tavsiya
                          </span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {variant.style.badge}
                          </span>
                        )}
                      </div>

                      {/* Small Live SVG preview in card */}
                      <div className="h-28 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-center p-3 overflow-hidden">
                        <svg viewBox="0 0 500 160" className="w-full h-full">
                          <g transform={`translate(250, 75) skewX(${-variant.slant * 0.4})`}>
                            <text
                              x="0"
                              y="0"
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fill={inkColor}
                              style={{
                                fontFamily: variant.style.fontFamily,
                                fontSize: '42px',
                                fontWeight: 600,
                              }}
                            >
                              {variant.displayText}
                            </text>
                          </g>
                          <g transform="translate(15, 10)">
                            <path
                              d={variant.flourishSvgPath}
                              fill="none"
                              stroke={inkColor}
                              strokeWidth={variant.style.strokeWidth}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </g>
                        </svg>
                      </div>
                    </div>

                    {/* Footer Card Controls */}
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {variant.style.subtitle.slice(0, 32)}...
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedStyleId(variant.style.id);
                        }}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50'
                        }`}
                      >
                        {isSelected ? 'Tanlangan' : 'Tanlash'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: INTERACTIVE PRACTICE PAD (CANVAS DRAWING & TRACING)     */}
      {/* ============================================================== */}
      {activeTab === 'practice' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PenTool className="w-4 h-4 text-indigo-600" />
                  Tavsiya Qilingan Imzoni Qo'lda Chizib Mashq Qilish
                </h3>
                <p className="text-xs text-slate-500">
                  Sichqoncha yoki sensorli ekran (barmoq/stylus) orqali imzo shablonining ustidan chizing va qo'l harakatingizni rivojlantiring.
                </p>
              </div>

              {/* Tools on practice pad */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsTracingGuideEnabled(!isTracingGuideEnabled)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    isTracingGuideEnabled
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  {isTracingGuideEnabled ? 'Shablon: Yoqilgan' : 'Shablon: O\'chiq'}
                </button>

                <button
                  type="button"
                  onClick={undoPracticeStroke}
                  disabled={drawHistory.length === 0}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition"
                  title="Oxirgi chiziqni bekor qilish"
                >
                  <Undo2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={clearPracticeCanvas}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  Tozalash
                </button>

                <button
                  type="button"
                  onClick={downloadPracticeDrawing}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  Chizilgan Imzoni Saqlash
                </button>
              </div>
            </div>

            {/* Canvas Area with Tracing Watermark */}
            <div className="relative w-full h-[360px] sm:h-[420px] rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 overflow-hidden cursor-crosshair">
              {/* Tracing Guide (Semi-transparent watermark overlay) */}
              {isTracingGuideEnabled && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-25 select-none">
                  <svg viewBox="0 0 600 200" className="w-4/5 h-auto">
                    <g transform={`translate(300, 90) skewX(${-customSlant * 0.4})`}>
                      <text
                        x="0"
                        y="0"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="currentColor"
                        className="text-slate-800 dark:text-slate-200"
                        style={{
                          fontFamily: activeSignature.style.fontFamily,
                          fontSize: '52px',
                          fontWeight: 600,
                        }}
                      >
                        {activeSignature.displayText}
                      </text>
                    </g>
                    {currentFlourishSvgPath && (
                      <g transform="translate(50, 10)">
                        <path
                          d={currentFlourishSvgPath}
                          fill="none"
                          stroke="currentColor"
                          className="text-slate-800 dark:text-slate-200"
                          strokeWidth="2.5"
                          strokeDasharray="4,4"
                        />
                      </g>
                    )}
                  </svg>
                </div>
              )}

              {/* Real Drawing Canvas */}
              <canvas
                ref={practiceCanvasRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                className="w-full h-full relative z-10 touch-none"
              />

              {/* Instructions Badge */}
              <div className="absolute bottom-3 left-4 z-20 text-[11px] text-slate-400 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-md backdrop-blur-xs border border-slate-200 dark:border-slate-800 pointer-events-none">
                💡 Maslahat: Imzoni uzluksiz, bir nafasda tez va dadil harakat bilan chizishga harakat qiling.
              </div>
            </div>

            {/* Practice Pen Thickness & Ink */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Qalam qalinligi:</span>
                {[2, 3, 4, 6].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setPracticePenSize(sz)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      practicePenSize === sz
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {sz}px
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Mashq siyohi:</span>
                {INK_COLORS.slice(0, 5).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setInkColor(c.hex)}
                    className={`w-6 h-6 rounded-full border-2 transition ${
                      inkColor === c.hex ? 'border-indigo-600 scale-110 shadow-xs' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: GENERAL FONT STUDIO & TYPOGRAPHY PREVIEW                */}
      {/* ============================================================== */}
      {activeTab === 'fonts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Fonts selection */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Shrift kategoriyasi
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFontStudioCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                        fontStudioCategory === cat
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font cards list */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
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
                        {nameInput || f.sampleName}
                      </p>
                    </div>
                    {selectedFont.id === f.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* Adjustments */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Matn rangi
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={fontStudioTextColor}
                        onChange={(e) => setFontStudioTextColor(e.target.value)}
                        className="w-8 h-8 rounded border cursor-pointer"
                      />
                      <span className="text-xs font-mono">{fontStudioTextColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      O'lcham: {fontStudioSize}px
                    </label>
                    <input
                      type="range"
                      min="24"
                      max="80"
                      value={fontStudioSize}
                      onChange={(e) => setFontStudioSize(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Preview & Export */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center flex flex-col items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
                Tanlangan Shrift Ko'rinishi
              </h3>

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
                    fontSize: `${fontStudioSize}px`,
                    color: fontStudioTextColor,
                    lineHeight: 1.2,
                  }}
                  className="text-center select-all break-words max-w-full"
                >
                  {nameInput || <span className="opacity-40 italic">Matningizni shu yerda ko'rasiz...</span>}
                </p>
              </div>

              <div className="w-full mt-3 text-xs text-slate-500 flex justify-between px-1">
                <span>Shrift: <strong className="text-slate-800 dark:text-slate-200">{selectedFont.name}</strong></span>
                <span>Kategoriya: {selectedFont.category}</span>
              </div>

              <div className="w-full mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={downloadFontStudioPNG}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  PNG Rasm Formatida Yuklab Olish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Disclaimer (Requirement 8) */}
      <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Dizayn va Ijodiy foydalanish eslatmasi:</span>
          <p className="mt-0.5 leading-relaxed">
            Qo'lda yozilganga o'xshash va imzo uslubidagi shriftlar hamda tavsiya qilingan imzolar faqat ijodiy, dizayn (tabriknomalar, sertifikatlar, brending, email footer, suv belgilari)
            maqsadlarida foydalanish uchun mo'ljallangan. Ular yuridik va rasmiy davlat hujjatlarida haqiqiy shaxsiy qo'l imzosi o'rnini bosmaydi.
          </p>
        </div>
      </div>
    </div>
  );
};

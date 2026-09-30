import React, { useState } from 'react';
import {
  Palette,
  Copy,
  Check,
  Sparkles,
  Sliders,
  CheckCircle2,
  XCircle,
  Eye
} from 'lucide-react';

export const ColorTools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'picker' | 'gradient' | 'palette' | 'contrast'>('picker');
  const [color, setColor] = useState<string>('#6366f1');
  const [copied, setCopied] = useState<string | null>(null);

  // Gradient state
  const [gradColor1, setGradColor1] = useState<string>('#4f46e5');
  const [gradColor2, setGradColor2] = useState<string>('#06b6d4');
  const [gradAngle, setGradAngle] = useState<number>(90);
  const [gradType, setGradType] = useState<'linear' | 'radial'>('linear');

  // Contrast state
  const [fgColor, setFgColor] = useState<string>('#ffffff');
  const [bgColor, setBgColor] = useState<string>('#1e1b4b');

  // HEX to RGB
  const hexToRgb = (hex: string) => {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map((x) => x + x).join('');
    const num = parseInt(c, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
    };
  };

  const rgb = hexToRgb(color);

  // RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // RGB to CMYK approx
  const rgbToCmyk = (r: number, g: number, b: number) => {
    let c = 1 - (r / 255);
    let m = 1 - (g / 255);
    let y = 1 - (b / 255);
    let k = Math.min(c, Math.min(m, y));
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    c = Math.round(((c - k) / (1 - k)) * 100);
    m = Math.round(((m - k) / (1 - k)) * 100);
    y = Math.round(((y - k) / (1 - k)) * 100);
    k = Math.round(k * 100);
    return { c, m, y, k };
  };

  const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);

  // Contrast Ratio (WCAG)
  const getLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const rgbFg = hexToRgb(fgColor);
  const rgbBg = hexToRgb(bgColor);
  const lum1 = getLuminance(rgbFg.r, rgbFg.g, rgbFg.b);
  const lum2 = getLuminance(rgbBg.r, rgbBg.g, rgbBg.b);
  const contrastRatio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);

  const copyString = (str: string, label: string) => {
    navigator.clipboard.writeText(str);
    setCopied(label);
    setTimeout(() => setCopied(null), 1500);
  };

  const gradientCss = gradType === 'linear'
    ? `linear-gradient(${gradAngle}deg, ${gradColor1}, ${gradColor2})`
    : `radial-gradient(circle, ${gradColor1}, ${gradColor2})`;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-violet-900/90 via-purple-900/90 to-slate-900 text-white shadow-xl">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
            <Palette className="w-5 h-5 text-purple-300" />
          </span>
          <h2 className="text-xl font-bold">Color Studio</h2>
        </div>
        <p className="text-xs text-slate-300 mt-1 max-w-xl">
          HEX, RGB, HSL, CMYK konvertatsiyasi, CSS Gradient generatori, rang palitralari va WCAG kontrast tekshiruvi.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        {[
          { id: 'picker', label: 'Rang & Formatlar' },
          { id: 'gradient', label: 'CSS Gradient' },
          { id: 'contrast', label: 'WCAG Kontrast Tekshiruv' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              activeTab === t.id
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 1. PICKER & FORMATS */}
      {activeTab === 'picker' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Rang tanlash</h3>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-20 h-20 rounded-2xl border-4 border-white dark:border-slate-800 shadow-md cursor-pointer"
              />
              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full text-base font-mono uppercase font-bold p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
                <span className="text-[11px] text-slate-400">HEX kodini to'g'ridan-to'g'ri kiritishingiz mumkin</span>
              </div>
            </div>

            {/* Visual Color Preview Block */}
            <div
              style={{ backgroundColor: color }}
              className="w-full h-32 rounded-xl shadow-inner flex items-center justify-center text-white font-mono font-bold text-lg drop-shadow"
            >
              {color.toUpperCase()}
            </div>
          </div>

          {/* Formats info */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Rang Formatlari</h3>

            {[
              { label: 'HEX', val: color.toUpperCase() },
              { label: 'RGB', val: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
              { label: 'HSL', val: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
              { label: 'CMYK (Chop etish)', val: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40"
              >
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">{f.label}</span>
                  <p className="text-xs font-mono font-bold text-slate-800 dark:text-white">{f.val}</p>
                </div>
                <button
                  onClick={() => copyString(f.val, f.label)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  title="Nusxalash"
                >
                  {copied === f.label ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. GRADIENT GENERATOR */}
      {activeTab === 'gradient' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Gradient Sozlamalari</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Rang 1:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={gradColor1}
                    onChange={(e) => setGradColor1(e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <span className="text-xs font-mono">{gradColor1}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1">Rang 2:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={gradColor2}
                    onChange={(e) => setGradColor2(e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <span className="text-xs font-mono">{gradColor2}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setGradType('linear')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${
                  gradType === 'linear' ? 'bg-purple-600 text-white' : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                Chiziqli (Linear)
              </button>
              <button
                onClick={() => setGradType('radial')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg border transition ${
                  gradType === 'radial' ? 'bg-purple-600 text-white' : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                Doiraviy (Radial)
              </button>
            </div>

            {gradType === 'linear' && (
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Burchak:</span>
                  <span>{gradAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={gradAngle}
                  onChange={(e) => setGradAngle(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>
            )}

            <div>
              <label className="text-xs text-slate-500 block mb-1">CSS Kodi:</label>
              <div className="p-2.5 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono flex items-center justify-between">
                <span className="truncate pr-2">background: {gradientCss};</span>
                <button
                  onClick={() => copyString(`background: ${gradientCss};`, 'css')}
                  className="text-slate-400 hover:text-white"
                >
                  {copied === 'css' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Gradient Preview */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
            <div
              style={{ background: gradientCss }}
              className="w-full h-56 rounded-2xl shadow-xl flex items-center justify-center text-white font-bold text-base drop-shadow"
            >
              CSS Gradient Jonli Ko'rinishi
            </div>
          </div>
        </div>
      )}

      {/* 3. CONTRAST CHECKER */}
      {activeTab === 'contrast' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">WCAG Kontrast Nisbati</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-500 block mb-1">Matn rangi:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full text-xs font-mono p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-500 block mb-1">Orqa fon:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full text-xs font-mono p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500">Kontrast ko'rsatkichi:</span>
                <p className="text-2xl font-extrabold text-purple-600">{contrastRatio.toFixed(2)} : 1</p>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5">
                  {contrastRatio >= 4.5 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                  <span>WCAG AA (Oddiy matn ≥ 4.5)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {contrastRatio >= 7 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )}
                  <span>WCAG AAA (Kuchsiz ko'ruvchilar ≥ 7.0)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contrast Preview Box */}
          <div
            style={{ backgroundColor: bgColor, color: fgColor }}
            className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-center space-y-2 transition-colors"
          >
            <h4 className="text-xl font-bold">SmartTools AI O'qilishi Sinovi</h4>
            <p className="text-sm leading-relaxed">
              Ushbu matn tanlangan ranglar kombinatsiyasida veb-saytda qanday ko'rinishini aks ettiradi.
              Kontrast 4.5:1 dan yuqori bo'lsa, o'qilishi mukammal hisoblanadi.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

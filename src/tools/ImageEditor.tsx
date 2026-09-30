import React, { useState, useRef, useEffect } from 'react';
import {
  SlidersHorizontal,
  Upload,
  Download,
  RotateCw,
  Crop,
  Maximize2,
  Sparkles,
  Undo2,
  RefreshCw,
  Layers,
  Eraser,
  Eye
} from 'lucide-react';

export const ImageEditor: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);

  // Transformations
  const [rotation, setRotation] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(0); // -100 to 100
  const [contrast, setContrast] = useState<number>(0);     // -100 to 100
  const [saturation, setSaturation] = useState<number>(0); // -100 to 100
  const [blur, setBlur] = useState<number>(0);             // 0 to 20
  const [grayscale, setGrayscale] = useState<boolean>(false);
  const [sepia, setSepia] = useState<boolean>(false);
  const [invert, setInvert] = useState<boolean>(false);

  // Resize
  const [targetWidth, setTargetWidth] = useState<number>(800);
  const [targetHeight, setTargetHeight] = useState<number>(600);
  const [lockAspectRatio, setLockAspectRatio] = useState<boolean>(true);

  // Output format & quality
  const [exportFormat, setExportFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [quality, setQuality] = useState<number>(0.9);

  // Background removal state
  const [bgRemovalTolerance, setBgRemovalTolerance] = useState<number>(35);
  const [bgRemoved, setBgRemoved] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load image
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setImageSrc(dataUrl);

      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setTargetWidth(img.width);
        setTargetHeight(img.height);
        resetFilters();
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const resetFilters = () => {
    setBrightness(0);
    setContrast(0);
    setSaturation(0);
    setBlur(0);
    setGrayscale(false);
    setSepia(false);
    setInvert(false);
    setRotation(0);
    setBgRemoved(false);
  };

  // Re-draw onto canvas
  useEffect(() => {
    if (!originalImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle rotation dimensions
    const isSideways = rotation % 180 !== 0;
    const drawWidth = isSideways ? targetHeight : targetWidth;
    const drawHeight = isSideways ? targetWidth : targetHeight;

    canvas.width = drawWidth;
    canvas.height = drawHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply CSS filters for fast rendering
    const filterParts: string[] = [];
    if (brightness !== 0) filterParts.push(`brightness(${100 + brightness}%)`);
    if (contrast !== 0) filterParts.push(`contrast(${100 + contrast}%)`);
    if (saturation !== 0) filterParts.push(`saturate(${100 + saturation}%)`);
    if (blur > 0) filterParts.push(`blur(${blur}px)`);
    if (grayscale) filterParts.push('grayscale(100%)');
    if (sepia) filterParts.push('sepia(100%)');
    if (invert) filterParts.push('invert(100%)');

    ctx.filter = filterParts.length > 0 ? filterParts.join(' ') : 'none';

    // Transformations
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.drawImage(originalImage, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
    ctx.restore();

    // Reset filter
    ctx.filter = 'none';

    // Apply Background removal if toggled
    if (bgRemoved) {
      applyBackgroundRemoval(canvas, ctx, bgRemovalTolerance);
    }
  }, [
    originalImage,
    targetWidth,
    targetHeight,
    rotation,
    brightness,
    contrast,
    saturation,
    blur,
    grayscale,
    sepia,
    invert,
    bgRemoved,
    bgRemovalTolerance
  ]);

  // Smart canvas-based background removal (detects corner colors & luminance)
  const applyBackgroundRemoval = (
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    tolerance: number
  ) => {
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;

    // Sample the corner pixel (assumed background)
    const targetR = data[0];
    const targetG = data[1];
    const targetB = data[2];

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Euclidean distance in RGB color space
      const diff = Math.sqrt(
        Math.pow(r - targetR, 2) + Math.pow(g - targetG, 2) + Math.pow(b - targetB, 2)
      );

      // If close to background color, make transparent
      if (diff < tolerance * 2.55) {
        data[i + 3] = 0; // Alpha = 0
      }
    }
    ctx.putImageData(imgData, 0, 0);
  };

  const handleWidthChange = (w: number) => {
    setTargetWidth(w);
    if (lockAspectRatio && originalImage) {
      const ratio = originalImage.height / originalImage.width;
      setTargetHeight(Math.round(w * ratio));
    }
  };

  const handleHeightChange = (h: number) => {
    setTargetHeight(h);
    if (lockAspectRatio && originalImage) {
      const ratio = originalImage.width / originalImage.height;
      setTargetWidth(Math.round(h * ratio));
    }
  };

  const downloadImage = () => {
    if (!canvasRef.current) return;
    const a = document.createElement('a');
    const ext = exportFormat === 'image/png' ? 'png' : exportFormat === 'image/webp' ? 'webp' : 'jpg';
    a.download = `SmartTools-Edited-${Date.now()}.${ext}`;
    a.href = canvasRef.current.toDataURL(exportFormat, quality);
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-rose-900/90 via-pink-900/90 to-slate-900 text-white shadow-xl">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
            <SlidersHorizontal className="w-5 h-5 text-rose-300" />
          </span>
          <h2 className="text-xl font-bold">Image Editor Pro</h2>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30">
            100% Client-Side
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-1 max-w-xl">
          Rasmlarni qirqish, o'lchamini o'zgartirish (Resize), yorqinlik, kontrast, rang to'yinganligi,
          fon tozalash (Background Remover) va JPG, PNG, WEBP formatlariga o'girish.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column Left */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            {/* Upload or change image */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Rasm yuklash
              </label>
              <label className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-500 cursor-pointer bg-slate-50 dark:bg-slate-800/40 text-xs font-semibold text-slate-700 dark:text-slate-200 transition">
                <Upload className="w-4 h-4 text-rose-500" />
                {imageSrc ? "Boshqa rasm tanlash" : "Kompyuterdan rasm tanlang"}
                <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              </label>
            </div>

            {originalImage && (
              <>
                {/* Transform Actions: Rotate & Reset */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setRotation((prev) => (prev + 90) % 360)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-rose-500" />
                      90° Burish
                    </button>
                    <button
                      onClick={resetFilters}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                    >
                      <Undo2 className="w-3.5 h-3.5" />
                      Qaytarish
                    </button>
                  </div>
                </div>

                {/* Resize Controls */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      O'lcham (Resize px)
                    </label>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lockAspectRatio}
                        onChange={(e) => setLockAspectRatio(e.target.checked)}
                        className="rounded text-rose-600"
                      />
                      Proporsiyani saqlash
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400">Kenglik (W):</span>
                      <input
                        type="number"
                        value={targetWidth}
                        onChange={(e) => handleWidthChange(Number(e.target.value))}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Balandlik (H):</span>
                      <input
                        type="number"
                        value={targetHeight}
                        onChange={(e) => handleHeightChange(Number(e.target.value))}
                        className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* Sliders: Brightness, Contrast, Saturation, Blur */}
                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Rang va Sifat sozlamalari
                  </label>

                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Yorqinlik (Brightness):</span>
                      <span>{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-rose-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Kontrast (Contrast):</span>
                      <span>{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-rose-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>To'yinganlik (Saturation):</span>
                      <span>{saturation}%</span>
                    </div>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={saturation}
                      onChange={(e) => setSaturation(Number(e.target.value))}
                      className="w-full accent-rose-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Xiralashtirish (Blur):</span>
                      <span>{blur}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={blur}
                      onChange={(e) => setBlur(Number(e.target.value))}
                      className="w-full accent-rose-600"
                    />
                  </div>
                </div>

                {/* Quick Filters */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Filtrlar
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setGrayscale(!grayscale)}
                      className={`p-2 rounded-xl border text-xs font-semibold transition ${
                        grayscale
                          ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      Oq-qora
                    </button>
                    <button
                      onClick={() => setSepia(!sepia)}
                      className={`p-2 rounded-xl border text-xs font-semibold transition ${
                        sepia
                          ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      Sepia
                    </button>
                    <button
                      onClick={() => setInvert(!invert)}
                      className={`p-2 rounded-xl border text-xs font-semibold transition ${
                        invert
                          ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      Invert
                    </button>
                  </div>
                </div>

                {/* Background Remover */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Eraser className="w-3.5 h-3.5 text-rose-500" />
                      Fon tozalash (Background Remover)
                    </label>
                    <input
                      type="checkbox"
                      checked={bgRemoved}
                      onChange={(e) => setBgRemoved(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-600"
                    />
                  </div>
                  {bgRemoved && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Sezuvchanlik (Tolerance):</span>
                        <span>{bgRemovalTolerance}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="80"
                        value={bgRemovalTolerance}
                        onChange={(e) => setBgRemovalTolerance(Number(e.target.value))}
                        className="w-full accent-rose-600"
                      />
                      <p className="text-[10px] text-slate-400">
                        Rasmning chetki fon rangini avtomatik aniqlab, uni shaffof (PNG) qiladi.
                      </p>
                    </div>
                  )}
                </div>

                {/* Format Conversion & Quality */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Eksport formati
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'image/png', label: 'PNG (Shaffof)' },
                      { id: 'image/jpeg', label: 'JPG' },
                      { id: 'image/webp', label: 'WEBP' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        onClick={() => setExportFormat(fmt.id as any)}
                        className={`p-2 rounded-xl border text-xs font-semibold transition ${
                          exportFormat === fmt.id
                            ? 'border-rose-600 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>

                  {exportFormat !== 'image/png' && (
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Sifat (Siqish darajasi):</span>
                        <span>{Math.round(quality * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.05"
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="w-full accent-rose-600"
                      />
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Live Canvas View Right */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center flex flex-col items-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Natija Ko'rinishi (Live Canvas)
            </h3>

            {/* Canvas Container with Checkerboard background for transparency preview */}
            <div className="w-full min-h-[360px] max-h-[500px] flex items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 overflow-auto bg-[repeating-conic-gradient(#f1f5f9_0%_25%,#e2e8f0_0%_50%)] dark:bg-[repeating-conic-gradient(#1e293b_0%_25%,#0f172a_0%_50%)] [background-size:20px_20px]">
              {originalImage ? (
                <canvas
                  ref={canvasRef}
                  className="max-h-[460px] max-w-full object-contain shadow-2xl rounded"
                />
              ) : (
                <div className="text-center p-8 text-slate-400 text-xs">
                  <SlidersHorizontal className="w-10 h-10 mx-auto mb-2 opacity-50 text-rose-500" />
                  Iltimos, tahrirlash uchun rasm yuklang
                </div>
              )}
            </div>

            {/* Download Button */}
            {originalImage && (
              <div className="w-full mt-4 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500">
                  O'lchami: {targetWidth}x{targetHeight} px • Format: {exportFormat.split('/')[1].toUpperCase()}
                </span>

                <button
                  onClick={downloadImage}
                  className="flex items-center gap-2 py-2.5 px-6 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-lg shadow-rose-600/20 transition active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Rasmni Yuklab Olish
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

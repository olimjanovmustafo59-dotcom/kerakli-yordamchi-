import React, { useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import {
  Files,
  Upload,
  Download,
  RotateCw,
  Scissors,
  Layers,
  ArrowUpDown,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Trash2,
  MoveUp,
  MoveDown,
  RefreshCw,
  Plus
} from 'lucide-react';

type PDFSubTool =
  | 'merge'
  | 'split'
  | 'rotate'
  | 'image_to_pdf'
  | 'text_to_pdf';

interface UploadedPdfItem {
  id: string;
  name: string;
  size: number;
  arrayBuffer: ArrayBuffer;
  pageCount: number;
}

export const PDFTools: React.FC = () => {
  const [activeSubTool, setActiveSubTool] = useState<PDFSubTool>('merge');
  const [pdfFiles, setPdfFiles] = useState<UploadedPdfItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Split state
  const [splitRange, setSplitRange] = useState<string>('1-2');

  // Rotate state
  const [rotationAngle, setRotationAngle] = useState<number>(90);

  // Image to PDF state
  const [imageFiles, setImageFiles] = useState<Array<{ name: string; dataUrl: string }>>([]);

  // Text to PDF state
  const [inputText, setInputText] = useState<string>(
    'Bu yerga PDF ga aylantirilishi kerak bo\'lgan matnni kiriting...'
  );

  // Handle PDF files upload (Drag and drop or file select)
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsProcessing(true);
    setStatusMessage("PDF fayllar o'qilmoqda...");

    try {
      const newItems: UploadedPdfItem[] = [];
      for (const file of files) {
        if (!file.name.toLowerCase().endsWith('.pdf')) continue;
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: file.size,
          arrayBuffer,
          pageCount: pdfDoc.getPageCount(),
        });
      }
      setPdfFiles((prev) => [...prev, ...newItems]);
      setStatusMessage(`${newItems.length} ta PDF fayl muvaffaqiyatli yuklandi.`);
    } catch (err: any) {
      alert("PDF faylni yuklashda xatolik: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reorder items in merge list
  const moveFile = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= pdfFiles.length) return;
    const updated = [...pdfFiles];
    const [moved] = updated.splice(index, 1);
    updated.splice(target, 0, moved);
    setPdfFiles(updated);
  };

  const removeFile = (id: string) => {
    setPdfFiles((prev) => prev.filter((item) => item.id !== id));
  };

  // 1. MERGE PDFS
  const handleMergePDFs = async () => {
    if (pdfFiles.length < 2) {
      alert("Birlashtirish uchun kamida 2 ta PDF fayl yuklang.");
      return;
    }

    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const item of pdfFiles) {
        const donorPdf = await PDFDocument.load(item.arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(donorPdf, donorPdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      downloadBytes(mergedPdfBytes, `SmartTools-Merged-${Date.now()}.pdf`);
      setStatusMessage("Fayllar muvaffaqiyatli birlashtirildi va yuklab olindi!");
    } catch (err: any) {
      alert("Birlashtirishda xatolik: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. SPLIT PDF
  const handleSplitPDF = async () => {
    if (pdfFiles.length === 0) {
      alert("Ajratish uchun PDF fayl yuklang.");
      return;
    }

    setIsProcessing(true);
    try {
      const source = pdfFiles[0];
      const sourcePdf = await PDFDocument.load(source.arrayBuffer);
      const totalPages = sourcePdf.getPageCount();

      // Parse range like "1-3" or "2"
      let start = 1;
      let end = totalPages;
      if (splitRange.includes('-')) {
        const parts = splitRange.split('-');
        start = parseInt(parts[0], 10) || 1;
        end = parseInt(parts[1], 10) || totalPages;
      } else {
        start = parseInt(splitRange, 10) || 1;
        end = start;
      }

      start = Math.max(1, Math.min(start, totalPages));
      end = Math.max(start, Math.min(end, totalPages));

      const newPdf = await PDFDocument.create();
      const pageIndices: number[] = [];
      for (let i = start - 1; i <= end - 1; i++) {
        pageIndices.push(i);
      }

      const extractedPages = await newPdf.copyPages(sourcePdf, pageIndices);
      extractedPages.forEach((p) => newPdf.addPage(p));

      const resultBytes = await newPdf.save();
      downloadBytes(resultBytes, `SmartTools-Split-Pages-${start}-to-${end}.pdf`);
      setStatusMessage(`Sahifalar (${start}-${end}) ajratib olindi!`);
    } catch (err: any) {
      alert("Ajratishda xatolik: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. ROTATE PDF
  const handleRotatePDF = async () => {
    if (pdfFiles.length === 0) {
      alert("Aylantirish uchun PDF fayl yuklang.");
      return;
    }

    setIsProcessing(true);
    try {
      const source = pdfFiles[0];
      const pdfDoc = await PDFDocument.load(source.arrayBuffer);
      const pages = pdfDoc.getPages();

      pages.forEach((page) => {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + rotationAngle) % 360));
      });

      const rotatedBytes = await pdfDoc.save();
      downloadBytes(rotatedBytes, `SmartTools-Rotated-${Date.now()}.pdf`);
      setStatusMessage("Barcha sahifalar muvaffaqiyatli aylantirildi!");
    } catch (err: any) {
      alert("Aylantirishda xatolik: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. IMAGE TO PDF
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImageFiles((prev) => [
          ...prev,
          { name: file.name, dataUrl: ev.target?.result as string }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleConvertImagesToPdf = () => {
    if (imageFiles.length === 0) {
      alert("Kamida bitta rasm yuklang.");
      return;
    }

    setIsProcessing(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      imageFiles.forEach((img, index) => {
        if (index > 0) doc.addPage();
        // A4 is 210 x 297 mm
        doc.addImage(img.dataUrl, 'JPEG', 10, 10, 190, 277, undefined, 'FAST');
      });

      doc.save(`SmartTools-ImagesToPdf-${Date.now()}.pdf`);
      setStatusMessage("Rasmlar PDF ga muvaffaqiyatli o'tkazildi!");
    } catch (err: any) {
      alert("Konvertatsiyada xatolik: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // 5. TEXT TO PDF
  const handleTextToPdf = () => {
    if (!inputText.trim()) {
      alert("Matn kiritilishi lozim.");
      return;
    }

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      doc.setFontSize(14);
      doc.text('SmartTools AI - Hujjat', 20, 20);

      doc.setFontSize(11);
      const splitLines = doc.splitTextToSize(inputText, 170);
      doc.text(splitLines, 20, 32);

      doc.save(`SmartTools-TextToPdf-${Date.now()}.pdf`);
      setStatusMessage("Matn PDF ga aylantirildi!");
    } catch (err: any) {
      alert("Xatolik: " + err.message);
    }
  };

  const downloadBytes = (bytes: Uint8Array, fileName: string) => {
    // Cast to any to satisfy BlobPart in TS
    const blob = new Blob([bytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = fileName;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-red-900/90 via-rose-900/90 to-slate-900 text-white shadow-xl">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
            <Files className="w-5 h-5 text-rose-300" />
          </span>
          <h2 className="text-xl font-bold">PDF Tools Pro</h2>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            Offline & Xavfsiz
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-1 max-w-xl">
          PDF fayllarni birlashtirish, sahifalar bo'yicha ajratish, 90°/180° aylantirish,
          rasmlarni bitta PDF ga to'plash va matnni PDF ga o'tkazish. Fayllaringiz brauzer ichida qayta ishlanadi.
        </p>
      </div>

      {/* Subtools Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'merge', label: 'PDF Birlashtirish (Merge)', icon: <Layers className="w-4 h-4" /> },
          { id: 'split', label: 'Sahifalarga Ajratish (Split)', icon: <Scissors className="w-4 h-4" /> },
          { id: 'rotate', label: 'Sahifalarni Aylantirish (Rotate)', icon: <RotateCw className="w-4 h-4" /> },
          { id: 'image_to_pdf', label: 'Rasm → PDF', icon: <ImageIcon className="w-4 h-4" /> },
          { id: 'text_to_pdf', label: 'Matn → PDF', icon: <FileText className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveSubTool(tab.id as PDFSubTool);
              setStatusMessage(null);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeSubTool === tab.id
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Working Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        {/* MERGE SUBTOOL */}
        {activeSubTool === 'merge' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  PDF fayllarni bitta qilib birlashtirish
                </h3>
                <p className="text-xs text-slate-500">
                  Bir nechta fayl yuklang, tartibini belgilang va yagona PDF hosil qiling.
                </p>
              </div>

              <label className="flex items-center gap-1.5 px-4 py-2 bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold cursor-pointer hover:bg-red-100 transition self-start">
                <Plus className="w-4 h-4" />
                PDF Qo'shish
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Files List */}
            {pdfFiles.length > 0 ? (
              <div className="space-y-2">
                {pdfFiles.map((file, idx) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-300 font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="truncate">
                        <p className="font-semibold text-slate-800 dark:text-white truncate">{file.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {file.pageCount} sahifa • {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => moveFile(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                        title="Yuqoriga surish"
                      >
                        <MoveUp className="w-4 h-4 text-slate-500" />
                      </button>
                      <button
                        onClick={() => moveFile(idx, 'down')}
                        disabled={idx === pdfFiles.length - 1}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                        title="Pastga surish"
                      >
                        <MoveDown className="w-4 h-4 text-slate-500" />
                      </button>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="p-1 rounded hover:bg-red-50 text-rose-500 ml-1"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleMergePDFs}
                    disabled={isProcessing || pdfFiles.length < 2}
                    className="flex items-center gap-2 py-3 px-6 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition"
                  >
                    <Download className="w-4 h-4" />
                    Birlashtirish va Yuklab Olish ({pdfFiles.length} ta fayl)
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-10 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 rounded-2xl cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 transition text-center">
                <Upload className="w-8 h-8 text-red-500 mb-2" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  PDF fayllarni sudrab tashlang yoki bosing
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Bir vaqtning o'zida bir nechta faylni tanlashingiz mumkin</p>
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}

        {/* SPLIT SUBTOOL */}
        {activeSubTool === 'split' && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              PDF Sahifalarini alohida ajratish
            </h3>
            <p className="text-xs text-slate-500">
              Katta PDF fayldan kerakli sahifalarni (masalan: 1-3 yoki 5) sug'urib oling.
            </p>

            {pdfFiles.length === 0 ? (
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 rounded-xl cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 transition text-center">
                <Upload className="w-6 h-6 text-red-500 mb-1" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Ajratish uchun PDF fayl yuklang
                </span>
                <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
              </label>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-white truncate max-w-xs">{pdfFiles[0].name}</span>
                  <span className="text-slate-500 font-semibold">{pdfFiles[0].pageCount} sahifa</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ajratiladigan sahifalar oralig'i:
                  </label>
                  <input
                    type="text"
                    value={splitRange}
                    onChange={(e) => setSplitRange(e.target.value)}
                    placeholder="Masalan: 1-3 yoki 2"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    1 dan {pdfFiles[0].pageCount} gacha oraliq kiriting (masalan 1-2).
                  </p>
                </div>

                <button
                  onClick={handleSplitPDF}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition"
                >
                  <Scissors className="w-4 h-4" />
                  Sahifalarni Ajratish va Yuklab Olish
                </button>
              </div>
            )}
          </div>
        )}

        {/* ROTATE SUBTOOL */}
        {activeSubTool === 'rotate' && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              PDF Sahifalarini aylantirish
            </h3>
            <p className="text-xs text-slate-500">
              Noto'g'ri skanerlangan yoki teskari sahifalarni 90°, 180° yoki 270° ga burish.
            </p>

            {pdfFiles.length === 0 ? (
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 rounded-xl cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 transition text-center">
                <Upload className="w-6 h-6 text-red-500 mb-1" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Aylantirish uchun PDF yuklang
                </span>
                <input type="file" accept="application/pdf" onChange={handlePdfUpload} className="hidden" />
              </label>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="text-xs">
                  <span className="font-bold text-slate-800 dark:text-white">{pdfFiles[0].name}</span>
                  <p className="text-slate-500">{pdfFiles[0].pageCount} sahifa</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Aylantirish burchagi:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { deg: 90, label: '90° O\'ngga' },
                      { deg: 180, label: '180° Teskari' },
                      { deg: 270, label: '270° Chapga' },
                    ].map((b) => (
                      <button
                        key={b.deg}
                        onClick={() => setRotationAngle(b.deg)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition ${
                          rotationAngle === b.deg
                            ? 'border-red-600 bg-red-50 dark:bg-red-950/40 text-red-600'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleRotatePDF}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition"
                >
                  <RotateCw className="w-4 h-4" />
                  Aylantirish va Yuklab Olish
                </button>
              </div>
            )}
          </div>
        )}

        {/* IMAGE TO PDF */}
        {activeSubTool === 'image_to_pdf' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  Rasmlarni yagona PDF kitobchaga birlashtirish
                </h3>
                <p className="text-xs text-slate-500">
                  JPG yoki PNG rasmlarini tanlang, ular tartib bo'yicha PDF sahifalariga aylanadi.
                </p>
              </div>

              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold cursor-pointer">
                <Plus className="w-4 h-4" />
                Rasm qo'shish
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            {imageFiles.length > 0 ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {imageFiles.map((img, idx) => (
                    <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                      <img src={img.dataUrl} alt="Thumbnail" className="w-full h-24 object-cover" />
                      <button
                        onClick={() => setImageFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleConvertImagesToPdf}
                    className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20"
                  >
                    <Download className="w-4 h-4" />
                    PDF qilib yuklab olish ({imageFiles.length} ta rasm)
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-red-500 rounded-xl cursor-pointer bg-slate-50/50 dark:bg-slate-800/30 transition text-center">
                <ImageIcon className="w-6 h-6 text-red-500 mb-1" />
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Rasmlarni bu yerga yuklang
                </span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>
        )}

        {/* TEXT TO PDF */}
        {activeSubTool === 'text_to_pdf' && (
          <div className="space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">
              Matnni to'g'ridan-to'g'ri PDF ga aylantirish
            </h3>
            <textarea
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
            <button
              onClick={handleTextToPdf}
              className="flex items-center gap-2 py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20"
            >
              <Download className="w-4 h-4" />
              PDF Generatsiya Qilish
            </button>
          </div>
        )}

        {/* Status Message */}
        {statusMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Code,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  FileCode,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

type TextSubTool =
  | 'stats_case'
  | 'cleanup'
  | 'find_replace'
  | 'json'
  | 'base64_url'
  | 'markdown'
  | 'lorem';

export const TextTools: React.FC = () => {
  const [activeSub, setActiveSub] = useState<TextSubTool>('stats_case');
  const [text, setText] = useState<string>(
    "SmartTools AI ko'p funksiyali platformasi yordamida matnlarni tahlil qilish, JSON tekshirish va kodlash juda oson!"
  );
  const [copied, setCopied] = useState<boolean>(false);

  // Find & Replace
  const [findWord, setFindWord] = useState<string>('');
  const [replaceWord, setReplaceWord] = useState<string>('');

  // JSON state
  const [jsonInput, setJsonInput] = useState<string>(
    JSON.stringify({ project: "SmartTools AI", version: 2.5, features: ["QR", "OCR", "PDF", "Calculator"] }, null, 2)
  );
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Lorem state
  const [loremParagraphs, setLoremParagraphs] = useState<number>(3);

  // Statistics
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  const lines = text ? text.split('\n').length : 0;
  const readingTimeMin = (words / 200).toFixed(1);

  // Handlers
  const handleCase = (type: 'upper' | 'lower' | 'title' | 'camel' | 'snake' | 'kebab') => {
    switch (type) {
      case 'upper': setText(text.toUpperCase()); break;
      case 'lower': setText(text.toLowerCase()); break;
      case 'title':
        setText(text.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase()));
        break;
      case 'camel':
        setText(
          text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase())
        );
        break;
      case 'snake':
        setText(text.toLowerCase().trim().replace(/[\s\W-]+/g, '_'));
        break;
      case 'kebab':
        setText(text.toLowerCase().trim().replace(/[\s\W-]+/g, '-'));
        break;
    }
  };

  const removeDuplicateLines = () => {
    const unique = Array.from(new Set(text.split('\n'))).join('\n');
    setText(unique);
  };

  const removeExtraSpaces = () => {
    const cleaned = text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n').trim();
    setText(cleaned);
  };

  const sortLines = (direction: 'asc' | 'desc') => {
    const sorted = text.split('\n').sort((a, b) => {
      return direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
    }).join('\n');
    setText(sorted);
  };

  const handleFindReplace = () => {
    if (!findWord) return;
    const replaced = text.split(findWord).join(replaceWord);
    setText(replaced);
  };

  const formatJSON = (indent: number = 2) => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, indent));
      setJsonError(null);
    } catch (err: any) {
      setJsonError("Noto'g'ri JSON sintaksisi: " + err.message);
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed));
      setJsonError(null);
    } catch (err: any) {
      setJsonError("Noto'g'ri JSON sintaksisi: " + err.message);
    }
  };

  const encodeBase64 = () => {
    try {
      setText(btoa(unescape(encodeURIComponent(text))));
    } catch (e: any) {
      alert("Base64 kodlashda xatolik: " + e.message);
    }
  };

  const decodeBase64 = () => {
    try {
      setText(decodeURIComponent(escape(atob(text))));
    } catch (e: any) {
      alert("Base64 dekodlashda xatolik: Matn to'g'ri Base64 emas");
    }
  };

  const encodeURL = () => setText(encodeURIComponent(text));
  const decodeURL = () => {
    try { setText(decodeURIComponent(text)); } catch { alert("URL noto'g'ri"); }
  };

  const generateLorem = () => {
    const sample = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";
    const result = Array(loremParagraphs).fill(sample).join('\n\n');
    setText(result);
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-900/90 via-sky-900/90 to-slate-900 text-white shadow-xl">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
            <Code className="w-5 h-5 text-cyan-300" />
          </span>
          <h2 className="text-xl font-bold">Text & Developer Tools</h2>
        </div>
        <p className="text-xs text-slate-300 mt-1 max-w-xl">
          So'z va belgilar statistikasi, Registr (Case), Dublikatlarni tozalash, JSON formatlagich & validator,
          Base64, URL kodlash va Markdown jonli ko'rish.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'stats_case', label: 'Statistika & Registr' },
          { id: 'cleanup', label: 'Tozalash & Saralash' },
          { id: 'find_replace', label: 'Qidirish & Almashtirish' },
          { id: 'json', label: 'JSON Formatter & Validator' },
          { id: 'base64_url', label: 'Base64 & URL Encoder' },
          { id: 'markdown', label: 'Markdown Preview' },
          { id: 'lorem', label: 'Lorem Ipsum Generator' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveSub(t.id as TextSubTool)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeSub === t.id
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SUBTOOL 1: STATS & CASE */}
      {activeSub === 'stats_case' && (
        <div className="space-y-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">So'zlar</span>
              <p className="text-xl font-extrabold text-cyan-600">{words}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Belgilar</span>
              <p className="text-xl font-extrabold text-cyan-600">{chars}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Bo'shliqsiz</span>
              <p className="text-xl font-extrabold text-cyan-600">{charsNoSpaces}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Qatorlar</span>
              <p className="text-xl font-extrabold text-cyan-600">{lines}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase">O'qish vaqti</span>
              <p className="text-xl font-extrabold text-cyan-600">~{readingTimeMin} min</p>
            </div>
          </div>

          {/* Case buttons */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => handleCase('upper')} className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold">KATTA HARF (UPPER)</button>
            <button onClick={() => handleCase('lower')} className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold">kichik harf (lower)</button>
            <button onClick={() => handleCase('title')} className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold">Bosh Harflar (Title Case)</button>
            <button onClick={() => handleCase('camel')} className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold font-mono">camelCase</button>
            <button onClick={() => handleCase('snake')} className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold font-mono">snake_case</button>
            <button onClick={() => handleCase('kebab')} className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold font-mono">kebab-case</button>
          </div>

          <textarea
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>
      )}

      {/* SUBTOOL 2: CLEANUP & SORT */}
      {activeSub === 'cleanup' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={removeDuplicateLines} className="px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold">Dublikat qatorlarni o'chirish</button>
            <button onClick={removeExtraSpaces} className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold">Ortiqcha bo'shliqlarni yo'qotish</button>
            <button onClick={() => sortLines('asc')} className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold">Alifbo bo'yicha (A-Z)</button>
            <button onClick={() => sortLines('desc')} className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold">Teskari (Z-A)</button>
          </div>

          <textarea
            rows={10}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
          />
        </div>
      )}

      {/* SUBTOOL 3: FIND & REPLACE */}
      {activeSub === 'find_replace' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Topish kerak bo'lgan so'z:</label>
              <input
                type="text"
                value={findWord}
                onChange={(e) => setFindWord(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">O'rniga qo'yiladigan so'z:</label>
              <input
                type="text"
                value={replaceWord}
                onChange={(e) => setReplaceWord(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleFindReplace}
                className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold"
              >
                Barchasini Almashtirish
              </button>
            </div>
          </div>

          <textarea
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>
      )}

      {/* SUBTOOL 4: JSON FORMATTER & VALIDATOR */}
      {activeSub === 'json' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => formatJSON(2)} className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold">Chiroyli qilish (Beautify 2-spaces)</button>
              <button onClick={minifyJSON} className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold">Minify (Bir qatorga)</button>
            </div>

            <button
              onClick={() => copyToClipboard(jsonInput)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-cyan-600"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Nusxalandi' : 'Nusxalash'}
            </button>
          </div>

          {jsonError ? (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{jsonError}</span>
            </div>
          ) : (
            <div className="p-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              To'g'ri JSON formati
            </div>
          )}

          <textarea
            rows={12}
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              try { JSON.parse(e.target.value); setJsonError(null); } catch (err: any) { setJsonError(err.message); }
            }}
            className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-950/50 text-slate-900 dark:text-white"
          />
        </div>
      )}

      {/* SUBTOOL 5: BASE64 & URL */}
      {activeSub === 'base64_url' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button onClick={encodeBase64} className="px-3 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold">Base64 Encode</button>
            <button onClick={decodeBase64} className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold">Base64 Decode</button>
            <button onClick={encodeURL} className="px-3 py-1.5 rounded-xl bg-slate-800 text-white text-xs font-bold">URL Encode</button>
            <button onClick={decodeURL} className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold">URL Decode</button>
          </div>

          <textarea
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>
      )}

      {/* SUBTOOL 6: MARKDOWN */}
      {activeSub === 'markdown' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">Markdown Matn:</span>
            <textarea
              rows={12}
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 block mb-1">Jonli Ko'rinish (Preview):</span>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs leading-relaxed min-h-[260px] prose dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap">{text}</p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTOOL 7: LOREM IPSUM */}
      {activeSub === 'lorem' && (
        <div className="space-y-4 max-w-xl">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Paragraflar soni:</span>
            <input
              type="number"
              min="1"
              max="20"
              value={loremParagraphs}
              onChange={(e) => setLoremParagraphs(Number(e.target.value))}
              className="w-16 text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center"
            />
            <button
              onClick={generateLorem}
              className="py-2 px-5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold"
            >
              Lorem Yaratish
            </button>
          </div>

          <textarea
            rows={8}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
          />
        </div>
      )}
    </div>
  );
};

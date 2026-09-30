import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Copy,
  Check,
  RefreshCw,
  Lock,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';

export const PasswordGenerator: React.FC = () => {
  const [length, setLength] = useState<number>(16);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [excludeSimilar, setExcludeSimilar] = useState<boolean>(true);

  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Generate cryptographically secure random password
  const generate = () => {
    let upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let lower = 'abcdefghijklmnopqrstuvwxyz';
    let numbers = '0123456789';
    let symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (excludeSimilar) {
      upper = upper.replace(/[IO]/g, '');
      lower = lower.replace(/[lo]/g, '');
      numbers = numbers.replace(/[01]/g, '');
    }

    let charset = '';
    if (includeUpper) charset += upper;
    if (includeLower) charset += lower;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    if (!charset) {
      setPassword('');
      return;
    }

    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);

    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length];
    }

    setPassword(result);
  };

  useEffect(() => {
    generate();
  }, [length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeSimilar]);

  // Calculate Entropy & Strength
  const calculateStrength = () => {
    let pool = 0;
    if (includeUpper) pool += 26;
    if (includeLower) pool += 26;
    if (includeNumbers) pool += 10;
    if (includeSymbols) pool += 30;
    if (pool === 0) return { score: 0, label: 'Juda zaif', color: 'bg-rose-500' };

    const entropy = Math.round(length * Math.log2(pool));
    if (entropy < 40) return { score: 25, label: 'Zaif', color: 'bg-rose-500' };
    if (entropy < 60) return { score: 50, label: "O'rtacha", color: 'bg-amber-500' };
    if (entropy < 80) return { score: 75, label: 'Kuchli', color: 'bg-blue-500' };
    return { score: 100, label: "O'ta mustahkam (Buzib bo'lmas)", color: 'bg-emerald-500' };
  };

  const strength = calculateStrength();

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white shadow-xl">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
          </span>
          <h2 className="text-xl font-bold">Xavfsiz Parol Generatori</h2>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            Crypto Secure
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          Parollar brauzerning kriptografik tasodifiy sonlar generatori (window.crypto) orqali yaratiladi
          va aslo serverga yuborilmaydi.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        {/* Password Display Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
          <div className="flex-1 font-mono text-base font-extrabold text-slate-900 dark:text-white break-all tracking-wider">
            {showPassword ? password : '•'.repeat(password.length)}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title={showPassword ? 'Yashirish' : 'Ko\'rsatish'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            <button
              onClick={generate}
              className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Yangilash"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Nusxalandi' : 'Nusxalash'}
            </button>
          </div>
        </div>

        {/* Strength Meter */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-500">Parol mustahkamligi:</span>
            <span className="text-slate-900 dark:text-white">{strength.label}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              style={{ width: `${strength.score}%` }}
              className={`h-full transition-all duration-300 ${strength.color}`}
            />
          </div>
        </div>

        {/* Customization Options */}
        <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              <span>Parol uzunligi:</span>
              <span className="text-indigo-600 text-sm">{length} ta belgi</span>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={includeUpper}
                onChange={(e) => setIncludeUpper(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
              Katta harflar (A-Z)
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={includeLower}
                onChange={(e) => setIncludeLower(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
              Kichik harflar (a-z)
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
              Raqamlar (0-9)
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
              Maxsus belgilar (!@#$%^&*)
            </label>

            <label className="sm:col-span-2 flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={excludeSimilar}
                onChange={(e) => setExcludeSimilar(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
              Adashtiruvchi o'xshash belgilarni chetlatish (l, 1, I, O, 0)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Calculator as CalcIcon,
  Percent,
  Calendar,
  Layers,
  Home,
  Divide,
  X,
  Minus,
  Plus,
  Equal,
  RotateCcw,
  Delete,
  ArrowRightLeft
} from 'lucide-react';

type CalcCategory = 'basic' | 'scientific' | 'finance' | 'date' | 'units' | 'construction';

export const UniversalCalculator: React.FC = () => {
  const [category, setCategory] = useState<CalcCategory>('basic');

  // --- 1. BASIC & SCIENTIFIC STATE ---
  const [display, setDisplay] = useState<string>('0');
  const [history, setHistory] = useState<string>('');

  const handleInput = (val: string) => {
    if (display === '0' && val !== '.') {
      setDisplay(val);
    } else {
      setDisplay((prev) => prev + val);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setHistory('');
  };

  const handleDelete = () => {
    if (display.length <= 1) {
      setDisplay('0');
    } else {
      setDisplay((prev) => prev.slice(0, -1));
    }
  };

  const handleCalculate = () => {
    try {
      // Clean display expression for eval
      const sanitized = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      // Evaluator with accurate float handling
      const result = Function(`'use strict'; return (${sanitized})`)();
      const rounded = Number.isFinite(result) ? Math.round(result * 1e10) / 1e10 : result;
      setHistory(display + ' =');
      setDisplay(String(rounded));
    } catch {
      setDisplay('Xato');
    }
  };

  const handleSciFunction = (fn: string) => {
    try {
      const num = parseFloat(display);
      let res = 0;
      switch (fn) {
        case 'sin': res = Math.sin((num * Math.PI) / 180); break;
        case 'cos': res = Math.cos((num * Math.PI) / 180); break;
        case 'tan': res = Math.tan((num * Math.PI) / 180); break;
        case 'sqrt': res = Math.sqrt(num); break;
        case 'ln': res = Math.log(num); break;
        case 'log': res = Math.log10(num); break;
        case 'pow2': res = Math.pow(num, 2); break;
        case 'fact':
          let f = 1;
          for (let i = 2; i <= Math.min(num, 170); i++) f *= i;
          res = f;
          break;
        default: return;
      }
      const rounded = Math.round(res * 1e10) / 1e10;
      setHistory(`${fn}(${display}) =`);
      setDisplay(String(rounded));
    } catch {
      setDisplay('Xato');
    }
  };

  // --- 2. FINANCE STATE ---
  const [loanAmount, setLoanAmount] = useState<number>(50000000); // 50 mln UZS
  const [annualRate, setAnnualRate] = useState<number>(24);       // 24% yillik
  const [loanMonths, setLoanMonths] = useState<number>(24);       // 24 oy
  const [discountOriginal, setDiscountOriginal] = useState<number>(250000);
  const [discountPercent, setDiscountPercent] = useState<number>(15);

  // Monthly payment (Annuity formula)
  const monthlyRate = (annualRate / 100) / 12;
  const emi = monthlyRate > 0
    ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanMonths)) /
      (Math.pow(1 + monthlyRate, loanMonths) - 1)
    : loanAmount / loanMonths;
  const totalLoanPayment = emi * loanMonths;
  const totalLoanInterest = totalLoanPayment - loanAmount;

  const discountedPrice = discountOriginal * (1 - discountPercent / 100);
  const savedAmount = discountOriginal - discountedPrice;

  // --- 3. DATE CALCULATOR STATE ---
  const [date1, setDate1] = useState<string>('2026-01-01');
  const [date2, setDate2] = useState<string>('2026-09-30');
  const [birthDate, setBirthDate] = useState<string>('2000-01-01');

  // Difference between dates
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffDays = Math.round(Math.abs(d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  const diffWeeks = (diffDays / 7).toFixed(1);
  const diffMonths = (diffDays / 30.4375).toFixed(1);

  // Age calculation
  const bDate = new Date(birthDate);
  const today = new Date();
  let ageYears = today.getFullYear() - bDate.getFullYear();
  let ageMonths = today.getMonth() - bDate.getMonth();
  let ageDays = today.getDate() - bDate.getDate();
  if (ageDays < 0) {
    ageMonths -= 1;
    ageDays += 30;
  }
  if (ageMonths < 0) {
    ageYears -= 1;
    ageMonths += 12;
  }

  // --- 4. UNIT CONVERTER STATE ---
  const [unitType, setUnitType] = useState<string>('length');
  const [unitFromVal, setUnitFromVal] = useState<number>(1);
  const [unitFrom, setUnitFrom] = useState<string>('km');
  const [unitTo, setUnitTo] = useState<string>('m');

  const convertUnits = (): number => {
    const val = unitFromVal;
    if (unitType === 'length') {
      const inMeters: Record<string, number> = {
        m: 1, km: 1000, cm: 0.01, mm: 0.001, inch: 0.0254, ft: 0.3048, mile: 1609.34
      };
      return (val * inMeters[unitFrom]) / inMeters[unitTo];
    }
    if (unitType === 'mass') {
      const inGrams: Record<string, number> = {
        g: 1, kg: 1000, mg: 0.001, ton: 1000000, lb: 453.592, oz: 28.3495
      };
      return (val * inGrams[unitFrom]) / inGrams[unitTo];
    }
    if (unitType === 'temperature') {
      if (unitFrom === 'C' && unitTo === 'F') return (val * 9) / 5 + 32;
      if (unitFrom === 'F' && unitTo === 'C') return ((val - 32) * 5) / 9;
      if (unitFrom === 'C' && unitTo === 'K') return val + 273.15;
      if (unitFrom === 'K' && unitTo === 'C') return val - 273.15;
      return val;
    }
    if (unitType === 'data') {
      const inBytes: Record<string, number> = {
        B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4
      };
      return (val * inBytes[unitFrom]) / inBytes[unitTo];
    }
    return val;
  };

  // --- 5. CONSTRUCTION STATE ---
  const [roomLength, setRoomLength] = useState<number>(5); // metr
  const [roomWidth, setRoomWidth] = useState<number>(4);  // metr
  const [roomHeight, setRoomHeight] = useState<number>(2.8); // metr
  const [tileLength, setTileLength] = useState<number>(60); // cm
  const [tileWidth, setTileWidth] = useState<number>(60);   // cm
  const [paintCoverage, setPaintCoverage] = useState<number>(10); // 1 litr -> 10 m2

  const floorArea = roomLength * roomWidth;
  const wallArea = 2 * (roomLength + roomWidth) * roomHeight;
  const netWallArea = wallArea * 0.85; // minus doors/windows estimate 15%
  const paintLiters = netWallArea / paintCoverage;
  const singleTileArea = (tileLength / 100) * (tileWidth / 100);
  const tilesCount = Math.ceil((floorArea / singleTileArea) * 1.1); // +10% reserve

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-900/90 via-orange-900/90 to-slate-900 text-white shadow-xl">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
            <CalcIcon className="w-5 h-5 text-amber-300" />
          </span>
          <h2 className="text-xl font-bold">Universal Kalkulyator</h2>
        </div>
        <p className="text-xs text-slate-300 mt-1 max-w-xl">
          Oddiy, Muhandislik (Sin/Cos/Ln), Moliya (Kredit, Foiz), Sana, O'lchov birliklari konverteri va Qurilish kalkulyatori.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'basic', label: 'Oddiy & Scientific', icon: <CalcIcon className="w-4 h-4" /> },
          { id: 'finance', label: 'Moliya & Kredit', icon: <Percent className="w-4 h-4" /> },
          { id: 'date', label: 'Sana & Yosh', icon: <Calendar className="w-4 h-4" /> },
          { id: 'units', label: 'O\'lchov Birliklari', icon: <ArrowRightLeft className="w-4 h-4" /> },
          { id: 'construction', label: 'Qurilish & Ta\'mir', icon: <Home className="w-4 h-4" /> },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setCategory(t.id as CalcCategory)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              category === t.id
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        {/* 1. BASIC & SCIENTIFIC */}
        {category === 'basic' && (
          <div className="max-w-md mx-auto space-y-4">
            {/* Screen */}
            <div className="p-4 rounded-2xl bg-slate-900 text-right text-white font-mono shadow-inner border border-slate-800">
              <div className="text-xs text-slate-400 min-h-[18px]">{history}</div>
              <div className="text-3xl font-bold tracking-wider truncate mt-1">{display}</div>
            </div>

            {/* Scientific functions row */}
            <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
              <button onClick={() => handleSciFunction('sin')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200">sin</button>
              <button onClick={() => handleSciFunction('cos')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200">cos</button>
              <button onClick={() => handleSciFunction('tan')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200">tan</button>
              <button onClick={() => handleSciFunction('sqrt')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200">√x</button>
              <button onClick={() => handleSciFunction('ln')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200">ln</button>
              <button onClick={() => handleSciFunction('log')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200">log</button>
              <button onClick={() => handleSciFunction('pow2')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200">x²</button>
              <button onClick={() => handleSciFunction('fact')} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200">n!</button>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-4 gap-2 text-sm font-bold">
              <button onClick={handleClear} className="p-3.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 hover:bg-rose-200">C</button>
              <button onClick={() => handleInput('(')} className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800">(</button>
              <button onClick={() => handleInput(')')} className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800">)</button>
              <button onClick={() => handleInput('÷')} className="p-3.5 rounded-xl bg-amber-500 text-white">÷</button>

              <button onClick={() => handleInput('7')} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">7</button>
              <button onClick={() => handleInput('8')} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">8</button>
              <button onClick={() => handleInput('9')} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">9</button>
              <button onClick={() => handleInput('×')} className="p-3.5 rounded-xl bg-amber-500 text-white">×</button>

              <button onClick={() => handleInput('4')} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">4</button>
              <button onClick={() => handleInput('5')} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">5</button>
              <button onClick={() => handleInput('6')} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">6</button>
              <button onClick={() => handleInput('-')} className="p-3.5 rounded-xl bg-amber-500 text-white">-</button>

              <button onClick={() => handleInput('1')} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">1</button>
              <button onClick={() => handleInput('2')} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">2</button>
              <button onClick={() => handleInput('3')} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">3</button>
              <button onClick={() => handleInput('+')} className="p-3.5 rounded-xl bg-amber-500 text-white">+</button>

              <button onClick={() => handleInput('0')} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">0</button>
              <button onClick={() => handleInput('.')} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">.</button>
              <button onClick={handleDelete} className="p-3.5 rounded-xl bg-slate-200 dark:bg-slate-700">⌫</button>
              <button onClick={handleCalculate} className="p-3.5 rounded-xl bg-emerald-600 text-white">=</button>
            </div>
          </div>
        )}

        {/* 2. FINANCE & LOAN */}
        {category === 'finance' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Loan EMI */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Percent className="w-4 h-4 text-amber-500" />
                Kredit / Ipoteka (Oylik to'lov)
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Kredit summasi (UZS): {loanAmount.toLocaleString()}
                </label>
                <input
                  type="number"
                  step="1000000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Yillik foiz stavkasi (%):
                  </label>
                  <input
                    type="number"
                    value={annualRate}
                    onChange={(e) => setAnnualRate(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Muddati (Oy):
                  </label>
                  <input
                    type="number"
                    value={loanMonths}
                    onChange={(e) => setLoanMonths(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Oylik to'lov (Annuitet):</span>
                  <span className="font-bold text-amber-600 text-sm">{Math.round(emi).toLocaleString()} UZS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ortiqcha foiz to'lovi:</span>
                  <span className="font-semibold text-rose-500">{Math.round(totalLoanInterest).toLocaleString()} UZS</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span className="font-bold">Umumiy qaytariladigan summa:</span>
                  <span className="font-bold">{Math.round(totalLoanPayment).toLocaleString()} UZS</span>
                </div>
              </div>
            </div>

            {/* Discount / Chegirma */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Chegirma va Tejamkorlik
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Asl narx:
                </label>
                <input
                  type="number"
                  value={discountOriginal}
                  onChange={(e) => setDiscountOriginal(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Chegirma foizi (%):
                </label>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">To'lanadigan yakuniy narx:</span>
                  <span className="font-bold text-emerald-600 text-sm">{Math.round(discountedPrice).toLocaleString()} UZS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Siz tejagan summa:</span>
                  <span className="font-semibold text-indigo-600">{Math.round(savedAmount).toLocaleString()} UZS</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. DATE & AGE */}
        {category === 'date' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Date difference */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                Ikki sana orasidagi muddat
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Boshlanish:</label>
                  <input
                    type="date"
                    value={date1}
                    onChange={(e) => setDate1(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tugash:</label>
                  <input
                    type="date"
                    value={date2}
                    onChange={(e) => setDate2(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                <p className="text-slate-500">Oraliq:</p>
                <p className="text-xl font-bold text-indigo-600">{diffDays} kun</p>
                <p className="text-slate-400">{diffWeeks} hafta • taxminan {diffMonths} oy</p>
              </div>
            </div>

            {/* Age calculator */}
            <div className="space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                Aniq Yosh Hisoblagich
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Tug'ilgan kuningiz:
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 space-y-1 text-xs">
                <p className="text-slate-500">Sizning aniq yoshingiz:</p>
                <p className="text-xl font-bold text-amber-600">
                  {ageYears} yosh, {ageMonths} oy, {ageDays} kun
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. UNIT CONVERTER */}
        {category === 'units' && (
          <div className="max-w-xl mx-auto space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[
                { id: 'length', label: 'Uzunlik' },
                { id: 'mass', label: 'Massa / Og\'irlik' },
                { id: 'temperature', label: 'Harorat' },
                { id: 'data', label: 'Xotira / Data' },
              ].map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    setUnitType(u.id);
                    if (u.id === 'length') { setUnitFrom('km'); setUnitTo('m'); }
                    if (u.id === 'mass') { setUnitFrom('kg'); setUnitTo('g'); }
                    if (u.id === 'temperature') { setUnitFrom('C'); setUnitTo('F'); }
                    if (u.id === 'data') { setUnitFrom('GB'); setUnitTo('MB'); }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                    unitType === u.id ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800'
                  }`}
                >
                  {u.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">Qaysi birlikdan:</label>
                <input
                  type="number"
                  value={unitFromVal}
                  onChange={(e) => setUnitFromVal(Number(e.target.value))}
                  className="w-full text-base font-bold p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
                <select
                  value={unitFrom}
                  onChange={(e) => setUnitFrom(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  {unitType === 'length' && (
                    <>
                      <option value="m">Metr (m)</option>
                      <option value="km">Kilometr (km)</option>
                      <option value="cm">Santimetr (cm)</option>
                      <option value="mm">Millimetr (mm)</option>
                      <option value="inch">Dyuym (inch)</option>
                      <option value="ft">Fut (ft)</option>
                      <option value="mile">Mil (mile)</option>
                    </>
                  )}
                  {unitType === 'mass' && (
                    <>
                      <option value="kg">Kilogramm (kg)</option>
                      <option value="g">Gramm (g)</option>
                      <option value="mg">Milligramm (mg)</option>
                      <option value="ton">Tonna (t)</option>
                      <option value="lb">Funt (lb)</option>
                    </>
                  )}
                  {unitType === 'temperature' && (
                    <>
                      <option value="C">Selsiy (°C)</option>
                      <option value="F">Farengeyt (°F)</option>
                      <option value="K">Kelvin (K)</option>
                    </>
                  )}
                  {unitType === 'data' && (
                    <>
                      <option value="B">Bayt (B)</option>
                      <option value="KB">Kilobayt (KB)</option>
                      <option value="MB">Megabayt (MB)</option>
                      <option value="GB">Gigabayt (GB)</option>
                      <option value="TB">Terabayt (TB)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500">Qaysi birlikka:</label>
                <div className="w-full text-base font-bold p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 truncate">
                  {convertUnits()}
                </div>
                <select
                  value={unitTo}
                  onChange={(e) => setUnitTo(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                >
                  {unitType === 'length' && (
                    <>
                      <option value="m">Metr (m)</option>
                      <option value="km">Kilometr (km)</option>
                      <option value="cm">Santimetr (cm)</option>
                      <option value="mm">Millimetr (mm)</option>
                      <option value="inch">Dyuym (inch)</option>
                      <option value="ft">Fut (ft)</option>
                      <option value="mile">Mil (mile)</option>
                    </>
                  )}
                  {unitType === 'mass' && (
                    <>
                      <option value="kg">Kilogramm (kg)</option>
                      <option value="g">Gramm (g)</option>
                      <option value="mg">Milligramm (mg)</option>
                      <option value="ton">Tonna (t)</option>
                      <option value="lb">Funt (lb)</option>
                    </>
                  )}
                  {unitType === 'temperature' && (
                    <>
                      <option value="C">Selsiy (°C)</option>
                      <option value="F">Farengeyt (°F)</option>
                      <option value="K">Kelvin (K)</option>
                    </>
                  )}
                  {unitType === 'data' && (
                    <>
                      <option value="B">Bayt (B)</option>
                      <option value="KB">Kilobayt (KB)</option>
                      <option value="MB">Megabayt (MB)</option>
                      <option value="GB">Gigabayt (GB)</option>
                      <option value="TB">Terabayt (TB)</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 5. CONSTRUCTION */}
        {category === 'construction' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Xona uzunligi (m):
                </label>
                <input
                  type="number"
                  value={roomLength}
                  onChange={(e) => setRoomLength(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Xona kengligi (m):
                </label>
                <input
                  type="number"
                  value={roomWidth}
                  onChange={(e) => setRoomWidth(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Shift balandligi (m):
                </label>
                <input
                  type="number"
                  value={roomHeight}
                  onChange={(e) => setRoomHeight(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs text-slate-500 font-semibold">Pol maydoni (Floor):</span>
                <p className="text-xl font-bold text-amber-600">{floorArea.toFixed(1)} m²</p>
                <p className="text-[11px] text-slate-400">Laminat yoki linoleum uchun</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs text-slate-500 font-semibold">Devor maydoni:</span>
                <p className="text-xl font-bold text-amber-600">{netWallArea.toFixed(1)} m²</p>
                <p className="text-[11px] text-slate-400">Eshik/oyna chegirilgan (15%)</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-xs text-slate-500 font-semibold">Bo'yoq miqdori:</span>
                <p className="text-xl font-bold text-emerald-600">{paintLiters.toFixed(1)} litr</p>
                <p className="text-[11px] text-slate-400">Standart 1 qatlam uchun</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold">Kafel / Plitka taxmini (60x60 cm):</span>
                <p className="text-slate-400">10% zaxira qirqish hisobi bilan</p>
              </div>
              <span className="text-lg font-extrabold text-indigo-600">{tilesCount} dona kafel</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

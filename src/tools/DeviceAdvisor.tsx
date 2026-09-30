import React, { useState } from 'react';
import {
  Laptop,
  Smartphone,
  Sparkles,
  DollarSign,
  Gamepad2,
  Camera,
  BatteryCharging,
  GraduationCap,
  Video,
  Code2,
  CheckCircle2,
  XCircle,
  Star,
  Info,
  Send,
  Cpu,
  HardDrive
} from 'lucide-react';

interface DeviceRecommendation {
  model: string;
  deviceType: string;
  badge: string;
  approxPriceUsd: number;
  specs: {
    cpu: string;
    gpu: string;
    ram: string;
    storage: string;
    display: string;
    battery: string;
  };
  pros: string[];
  cons: string[];
  bestFor: string;
  rating: number;
}

export const DeviceAdvisor: React.FC = () => {
  const [budget, setBudget] = useState<number>(500);
  const [deviceType, setDeviceType] = useState<'both' | 'phone' | 'laptop'>('both');
  const [gaming, setGaming] = useState<boolean>(false);
  const [camera, setCamera] = useState<boolean>(false);
  const [battery, setBattery] = useState<boolean>(false);
  const [studyWork, setStudyWork] = useState<boolean>(true);
  const [videoEditing, setVideoEditing] = useState<boolean>(false);
  const [programming, setProgramming] = useState<boolean>(false);
  const [portability, setPortability] = useState<boolean>(false);
  const [customQuery, setCustomQuery] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [summary, setSummary] = useState<string>('');
  const [devices, setDevices] = useState<DeviceRecommendation[]>([
    {
      model: 'Redmi Note 13 Pro+ 5G',
      deviceType: 'Telefon',
      badge: 'Narx/Sifat Qiroli',
      approxPriceUsd: 340,
      specs: {
        cpu: 'MediaTek Dimensity 7200 Ultra (4nm)',
        gpu: 'Mali-G610 MC4',
        ram: '12GB LPDDR5',
        storage: '512GB UFS 3.1',
        display: '6.67" 120Hz 1.5K Curved AMOLED',
        battery: '5000 mAh, 120W HyperCharge',
      },
      pros: ['200MP OIS asosiy kamera', '120W o\'ta tez zaryad (19 daqiqada 100%)', 'IP68 suv va changdan to\'liq himoya'],
      cons: ['O\'yinlarda uzoq vaqt qizishi mumkin', 'Qo\'shimcha xotira kartasi (MicroSD) sloti yo\'q'],
      bestFor: 'Talabalar, kundalik faol foydalanuvchilar va sifatli foto surat olishni xohlovchilar',
      rating: 4.8,
    },
    {
      model: 'Lenovo LOQ 15 (2024 / 2025)',
      deviceType: 'Noutbuk',
      badge: 'Eng Yaxshi Gaming & Montaj',
      approxPriceUsd: 780,
      specs: {
        cpu: 'Intel Core i5-13450HX (10 yadro)',
        gpu: 'NVIDIA GeForce RTX 4050 6GB GDDR6',
        ram: '16GB DDR5 4800MHz',
        storage: '512GB NVMe PCIe 4.0 SSD',
        display: '15.6" FHD 144Hz IPS 100% sRGB',
        battery: '60Wh, 170W adapter',
      },
      pros: ['Kuchli RTX 4050 videokarta', 'Sovutish tizimi a\'lo darajada', 'Dasturlash va Premier Pro uchun juda mos'],
      cons: ['Vazni 2.4 kg (og\'irroq)', 'Avtonom ishlash muddati o\'rtacha (3-4 soat)'],
      bestFor: 'Dasturchilar, 3D modellashtirish va o\'yin shinavandalari uchun',
      rating: 4.9,
    },
  ]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/device-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget,
          type: deviceType,
          gaming,
          camera,
          battery,
          studyWork,
          videoEditing,
          programming,
          portability,
          customQuery,
        }),
      });

      const data = await res.json();
      if (res.ok && data.devices && data.devices.length > 0) {
        setDevices(data.devices);
        setSummary(data.summary || '');
      } else {
        alert(data.error || "Tavsiyalarni olishda xatolik yuz berdi");
      }
    } catch (err: any) {
      alert("Aloqa xatosi: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
            <Laptop className="w-5 h-5 text-indigo-300" />
          </span>
          <h2 className="text-xl font-bold">Telefon & Noutbuk AI Maslahatchisi</h2>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            Bozor Tahlili
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-1 max-w-xl">
          Budjetingiz va aniq talablaringizga (gaming, kamera, dasturlash, montaj) mos keluvchi
          qurilmalarni texnik ko'rsatkichlari, afzalliklari va kamchiliklari bilan tanlab beradi.
        </p>
      </div>

      {/* Query Bar */}
      <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Tabiiy tildagi so'rov (yoki pastdagi mezonlarni tanlang):
          </label>
          <div className="relative">
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="Masalan: '$300 budjetim bor, PUBG o'ynayman, kamera ham yaxshi bo'lsin' yoki '$700 ga programming laptop'..."
              className="w-full text-xs p-3 pr-28 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition"
            >
              {isLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Tahlil
            </button>
          </div>
        </div>

        {/* Wizard Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          {/* Budget */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Budjet (USD): ${budget}
            </label>
            <input
              type="range"
              min="100"
              max="3000"
              step="50"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>$100</span>
              <span>$1500</span>
              <span>$3000+</span>
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Qurilma turi:
            </label>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => setDeviceType('both')}
                className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                  deviceType === 'both' ? 'bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                Ikkalasi
              </button>
              <button
                type="button"
                onClick={() => setDeviceType('phone')}
                className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                  deviceType === 'phone' ? 'bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                Telefon
              </button>
              <button
                type="button"
                onClick={() => setDeviceType('laptop')}
                className={`py-1.5 text-xs font-bold rounded-lg border transition ${
                  deviceType === 'laptop' ? 'bg-indigo-600 text-white' : 'border-slate-300 dark:border-slate-700'
                }`}
              >
                Noutbuk
              </button>
            </div>
          </div>

          {/* Goals Pills */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Asosiy talablar (Belgilang):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "O'yinlar (Gaming)", val: gaming, set: setGaming, icon: <Gamepad2 className="w-3 h-3" /> },
                { label: 'Kamera muhim', val: camera, set: setCamera, icon: <Camera className="w-3 h-3" /> },
                { label: 'Batareya uzoq', val: battery, set: setBattery, icon: <BatteryCharging className="w-3 h-3" /> },
                { label: 'O\'qish & Ish', val: studyWork, set: setStudyWork, icon: <GraduationCap className="w-3 h-3" /> },
                { label: 'Video montaj', val: videoEditing, set: setVideoEditing, icon: <Video className="w-3 h-3" /> },
                { label: 'Dasturlash (IT)', val: programming, set: setProgramming, icon: <Code2 className="w-3 h-3" /> },
              ].map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => p.set(!p.val)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    p.val
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-400/50 font-bold'
                      : 'border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {p.icon}
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </form>

      {/* Summary message if any */}
      {summary && (
        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Ekspert tavsiyasi xulosasi:</span>
            <p className="mt-0.5 leading-relaxed">{summary}</p>
          </div>
        </div>
      )}

      {/* Recommendation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {devices.map((dev, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition duration-200"
          >
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {dev.badge}
                </span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  ~${dev.approxPriceUsd}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {dev.deviceType === 'Noutbuk' ? (
                  <Laptop className="w-5 h-5 text-indigo-500" />
                ) : (
                  <Smartphone className="w-5 h-5 text-indigo-500" />
                )}
                {dev.model}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Turi: <strong className="text-slate-700 dark:text-slate-300">{dev.deviceType}</strong> • Rating: {dev.rating} / 5.0
              </p>
            </div>

            {/* Specifications Specs Grid */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">CPU:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{dev.specs.cpu}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">GPU:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{dev.specs.gpu}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">RAM & Storage:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">{dev.specs.ram} / {dev.specs.storage}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Ekran:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{dev.specs.display}</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                <span className="text-[10px] text-slate-400 block">Batareya:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">{dev.specs.battery}</span>
              </div>
            </div>

            {/* Pros and Cons */}
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 block mb-1">Afzalliklari:</span>
                <ul className="space-y-1">
                  {dev.pros.map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <span className="font-bold text-rose-600 dark:text-rose-400 block mb-1">Kamchiliklari:</span>
                <ul className="space-y-1">
                  {dev.cons.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300">
                      <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Best for */}
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/50 text-xs">
              <span className="font-bold text-indigo-950 dark:text-indigo-200">Kimlar uchun tavsiya etiladi:</span>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">{dev.bestFor}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

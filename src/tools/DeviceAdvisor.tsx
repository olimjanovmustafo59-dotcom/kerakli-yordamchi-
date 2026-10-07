import React, { useState, useEffect } from 'react';
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
  HardDrive,
  AlertCircle,
  ArrowRightLeft,
  X,
  Layers,
  SlidersHorizontal,
  Flame,
  Check
} from 'lucide-react';

interface DeviceRecommendation {
  brand?: string;
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

const INITIAL_DEVICES: DeviceRecommendation[] = [
  {
    brand: 'Samsung',
    model: 'Samsung Galaxy A55 5G',
    deviceType: 'Telefon',
    badge: 'Eng Ishonchli & Balansli Samsung',
    approxPriceUsd: 375,
    specs: {
      cpu: 'Samsung Exynos 1480 (4nm, AMD GPU)',
      gpu: 'AMD RDNA2 Xclipse 530',
      ram: '8GB / 12GB',
      storage: '256GB + MicroSD slot',
      display: '6.6" Super AMOLED 120Hz FHD+ (Victus+)',
      battery: '5000 mAh, 25W tez zaryad',
    },
    pros: ['Metall rom va shisha orqa panel (Premium dizayn)', 'IP67 to\'liq suv va changdan himoyalangan', 'Samsung Knox xavfsizlik va 4 yil OS yangilanish'],
    cons: ['Qutida zaryadlash bloki mavjud emas', 'Ekran hoshiyalari biroz qalin'],
    bestFor: 'Uzoq yillik barqarorlik, ishonchli tizim va balansli narx-sifat',
    rating: 4.85,
  },
  {
    brand: 'Apple',
    model: 'Apple iPhone 13 128GB',
    deviceType: 'Telefon',
    badge: 'Narx/Sifat Bo\'yicha Xit Apple',
    approxPriceUsd: 510,
    specs: {
      cpu: 'Apple A15 Bionic (6 yadro)',
      gpu: 'Apple 4-core GPU',
      ram: '4GB',
      storage: '128GB NVMe',
      display: '6.1" Super Retina XDR OLED',
      battery: '3240 mAh, MagSafe',
    },
    pros: ['Kinematik video rejimi va ajoyib OIS barqarorlashtirish', 'iOS tizimining yuqori barqarorligi', 'Bozorda qayta sotish qiymatini yo\'qotmaydi'],
    cons: ['Ekran 60Hz', 'Lightning port (Type-C emas)'],
    bestFor: 'Arzonroq narxda haqiqiy sifatli iPhone tajribasini istaganlar',
    rating: 4.8,
  },
  {
    brand: 'Honor',
    model: 'Honor 200 5G',
    deviceType: 'Telefon',
    badge: 'Studio Harcourt Portret Mutaxassisi',
    approxPriceUsd: 410,
    specs: {
      cpu: 'Snapdragon 7 Gen 3 (4nm)',
      gpu: 'Adreno 720',
      ram: '12GB LPDDR5',
      storage: '512GB',
      display: '6.7" 1.5K 120Hz OLED (3840Hz nol-miltillash ekrani)',
      battery: '5200 mAh Silicon-Carbon, 100W SuperCharge',
    },
    pros: ['Studio Harcourt Parij portret algoritmlari — fotosessiya suratlari', 'Ko\'zni mutlaqo toliqtirmaydigan 3840Hz ekran', '512GB ulkan xotira va 100W zaryad'],
    cons: ['Suvdan himoya IP54 (chayqalishdan)', 'Plastik hoshiya'],
    bestFor: 'Portret suratlar, blogerlar va ko\'zlari tez toliqadigan foydalanuvchilar',
    rating: 4.85,
  },
  {
    brand: 'Poco',
    model: 'Poco X6 Pro 5G',
    deviceType: 'Telefon',
    badge: 'O\'yinlar Qiroli (AnTuTu 1.4M+)',
    approxPriceUsd: 315,
    specs: {
      cpu: 'MediaTek Dimensity 8300 Ultra (4nm)',
      gpu: 'Mali G615-MC6',
      ram: '12GB LPDDR5X',
      storage: '512GB UFS 4.0',
      display: '6.67" 1.5K 120Hz Flow AMOLED',
      battery: '5000 mAh, 67W tez zaryad (adapter qutida)',
    },
    pros: ['PUBG Mobile da 90-120 FPS barqaror ushlab beradi', '512GB tezkor UFS 4.0 xotira arzon narxda', 'Juda yengil korpus va yorqin ekran'],
    cons: ['Korpus orqasi plastik', 'Kamera kundalik yaxshi, lekin portret studio emas'],
    bestFor: 'PUBG, Genshin Impact, CoD o\'yinchilari va maksimal kuch talab qiladiganlar',
    rating: 4.9,
  },
  {
    brand: 'Redmi',
    model: 'Redmi Note 13 Pro+ 5G',
    deviceType: 'Telefon',
    badge: 'O\'rta Segmentning Xalq Qahramoni',
    approxPriceUsd: 340,
    specs: {
      cpu: 'MediaTek Dimensity 7200 Ultra (4nm)',
      gpu: 'Mali-G610 MC4',
      ram: '12GB LPDDR5',
      storage: '512GB UFS 3.1',
      display: '6.67" 1.5K 120Hz Qavariq (Curved) AMOLED',
      battery: '5000 mAh, 120W HyperCharge (19 daqiqada 100%)',
    },
    pros: ['200MP OIS asosiy kamera — juda mayda detallargacha aniq oladi', '120W zaryad 19 daqiqada to\'ldiradi', 'IP68 to\'liq suv va changdan himoyalangan'],
    cons: ['Qavariq ekran chetiga himoya oynasi qo\'yish ehtiyotkorlik talab qiladi', 'MicroSD xotira sloti yo\'q'],
    bestFor: 'Talabalar, kundalik barcha ishlar, sifatli foto va tez zaryad qidirayotganlar',
    rating: 4.85,
  },
  {
    brand: 'Samsung',
    model: 'Samsung Galaxy S24 FE 5G',
    deviceType: 'Telefon',
    badge: 'Flagman Imkoniyatlar (Galaxy AI)',
    approxPriceUsd: 640,
    specs: {
      cpu: 'Exynos 2400e (4nm Flagship)',
      gpu: 'AMD Xclipse 940',
      ram: '8GB LPDDR5X',
      storage: '256GB UFS 4.0',
      display: '6.7" Dynamic AMOLED 2X 120Hz HDR10+',
      battery: '4700 mAh, 25W simli + 15W simsiz',
    },
    pros: ['Galaxy AI (tarjima, qidiruv, fotoredaktor) to\'liq ishlaydi', '3x optik zoom telephoto kamera', '7 yil dasturiy yangilanish kafolati'],
    cons: ['Zaryadlash 25W', 'Korpus biroz og\'irroq (213g)'],
    bestFor: 'Flagman darajasidagi kamera, sun\'iy intellekt va uzoq yillik prestij',
    rating: 4.9,
  },
  {
    brand: 'Honor',
    model: 'Honor X9b 5G',
    deviceType: 'Telefon',
    badge: 'Sinmas Ekran (Ultra-Bounce Bardoshli)',
    approxPriceUsd: 260,
    specs: {
      cpu: 'Snapdragon 6 Gen 1 (4nm)',
      gpu: 'Adreno 710',
      ram: '12GB (8+4)',
      storage: '256GB',
      display: '6.78" 1.5K AMOLED Curved (360° zarbaga qarshi himoya)',
      battery: '5800 mAh monster batareya (2-3 kun), 35W',
    },
    pros: ['360 daraja zarbaga bardoshli ekran (tushib ketganda sinmaydi)', '5800 mAh bilan rekord darajadagi avtonomiya', 'Yengil 185g va juda nafis dizayn'],
    cons: ['Kamerada optik OIS yo\'q', 'Pastki dinamik bitta (mono)'],
    bestFor: 'Kuryerlar, harakatchan insonlar, qurilmani tushirib yuborishdan xavotir oluvchilar',
    rating: 4.8,
  },
  {
    brand: 'Lenovo',
    model: 'Lenovo LOQ 15 (2024 / 2025 Edition)',
    deviceType: 'Noutbuk',
    badge: 'Gaming & IT Dasturlash Qiroli',
    approxPriceUsd: 780,
    specs: {
      cpu: 'Intel Core i5-13450HX (10 yadro, 16 oqim)',
      gpu: 'NVIDIA GeForce RTX 4050 6GB GDDR6 (95W TGP)',
      ram: '16GB DDR5 4800MHz',
      storage: '512GB NVMe PCIe 4.0 SSD',
      display: '15.6" FHD 144Hz IPS 100% sRGB 300 nit',
      battery: '60Wh, 170W adapter',
    },
    pros: ['Kuchli RTX 4050 videokarta va HX protsessor', 'Sovutish tizimi sovuq va barqaror ishlaydi', 'Dasturlash (Docker, Android Studio) va montaj uchun a\'lo'],
    cons: ['Vazni 2.38 kg', 'Batareya quvvati o\'rtacha 3-4 soat'],
    bestFor: 'Dasturchilar, talabalar, kiber-sport o\'yinchilari va montajchilar',
    rating: 4.9,
  },
  {
    brand: 'Asus',
    model: 'Asus TUF Gaming A15',
    deviceType: 'Noutbuk',
    badge: 'Harbiy Standartdagi Bardoshli Laptop',
    approxPriceUsd: 760,
    specs: {
      cpu: 'AMD Ryzen 5 7535HS (6 yadro)',
      gpu: 'NVIDIA GeForce RTX 4050 6GB GDDR6',
      ram: '16GB DDR5',
      storage: '512GB PCIe 4.0 SSD',
      display: '15.6" FHD 144Hz G-Sync IPS',
      battery: '90Wh ulkan batareya (ofisda 6-7 soat)',
    },
    pros: ['MIL-STD-810H harbiy sinovlardan o\'tgan bardoshli korpus', '90Wh katta sig\'imli batareya', 'Qulay klaviatura va zarbaga chidamlilik'],
    cons: ['Ekran rang qamrovi 65% sRGB', 'Ventilyatorlar og\'ir o\'yinda eshitiladi'],
    bestFor: 'Safarda yuruvchi o\'yinchilar, talabalar va mustahkam kompyuter izlovchilar',
    rating: 4.85,
  },
  {
    brand: 'Samsung',
    model: 'Samsung Galaxy A15 5G',
    deviceType: 'Telefon',
    badge: 'Eng Arzon Ishonchli Samsung',
    approxPriceUsd: 175,
    specs: {
      cpu: 'MediaTek Dimensity 6100+ (6nm)',
      gpu: 'Mali-G57 MC2',
      ram: '6GB / 8GB',
      storage: '128GB + MicroSD',
      display: '6.5" Super AMOLED 90Hz FHD+ 800 nit',
      battery: '5000 mAh, 25W',
    },
    pros: ['Ushbu narxda Super AMOLED yorqin ekran', '50MP tiniq suratlar oluvchi kamera', 'Katta sig\'imli 5000 mAh batareya'],
    cons: ['Tomchi tirqish', 'Zaryadlash adapteri qutida yo\'q'],
    bestFor: 'Maktab o\'quvchilari, taksi haydovchilari va tejamkor xarid',
    rating: 4.65,
  },
  {
    brand: 'Apple',
    model: 'Apple iPhone 11 / 12',
    deviceType: 'Telefon',
    badge: 'Eng Hamyonbop iOS Tanlovi',
    approxPriceUsd: 290,
    specs: {
      cpu: 'Apple A13 / A14 Bionic',
      gpu: 'Apple 4-core GPU',
      ram: '4GB',
      storage: '128GB NVMe',
      display: '6.1" Liquid Retina / OLED',
      battery: '3110 mAh, 4K 60fps',
    },
    pros: ['Sifatli 4K video olish va ijtimoiy tarmoqlar uchun a\'lo', 'iOS 18 bilan barqaror ishlash', 'Mustahkam korpus'],
    cons: ['Batareya yangi modellarga qaraganda tezroq tugaydi', '60Hz ekran'],
    bestFor: 'Kam byudjetda sifatli iPhone qidirganlar',
    rating: 4.65,
  },
  {
    brand: 'Poco',
    model: 'Poco M6 Pro 4G',
    deviceType: 'Telefon',
    badge: 'Eng Tejamkor 120Hz AMOLED & OIS',
    approxPriceUsd: 185,
    specs: {
      cpu: 'MediaTek Helio G99 Ultra (6nm)',
      gpu: 'Mali-G57 MC2',
      ram: '8GB / 12GB',
      storage: '256GB / 512GB + MicroSD',
      display: '6.67" FHD+ 120Hz Flow AMOLED',
      battery: '5000 mAh, 67W tez zaryad',
    },
    pros: ['64MP kamerada optik OIS bor', '67W tez zaryadlovchi adapter qutida mavjud', 'Yupqa hoshiyali chiroyli 120Hz ekran'],
    cons: ['5G tarmog\'i yo\'q', 'Og\'ir o\'yinlarda o\'rtacha grafik'],
    bestFor: 'Byudjetni tejagan holda 120Hz AMOLED va tez zaryad olishni istaganlar',
    rating: 4.75,
  },
  {
    brand: 'Redmi',
    model: 'Redmi 13 4G',
    deviceType: 'Telefon',
    badge: 'Eng Hamyonbop Xaridorgir Tanlov',
    approxPriceUsd: 145,
    specs: {
      cpu: 'MediaTek Helio G91-Ultra',
      gpu: 'Mali-G52 MC2',
      ram: '8GB LPDDR4X',
      storage: '256GB kengaytiriladigan',
      display: '6.79" FHD+ 90Hz katta ekran',
      battery: '5030 mAh, 33W tez zaryad',
    },
    pros: ['108MP tiniq asosiy kamera', 'Orqa paneli shishadan tayyorlangan ko\'rkam dizayn', 'Juda qulay narx va katta sig\'imli xotira'],
    cons: ['O\'yinlar faqat past-o\'rta grafikada', 'Ekran yorqinligi quyosh ostida o\'rtacha'],
    bestFor: 'O\'qish, darslar, taksi, kuryerlik va messenjerlar',
    rating: 4.65,
  },
  {
    brand: 'Lenovo',
    model: 'Lenovo IdeaPad Slim 3 15',
    deviceType: 'Noutbuk',
    badge: 'Eng Ommabop 16GB RAM Laptop',
    approxPriceUsd: 430,
    specs: {
      cpu: 'Intel Core i5-12450H (8 yadro, 12 oqim)',
      gpu: 'Intel UHD Graphics',
      ram: '16GB LPDDR5',
      storage: '512GB NVMe PCIe 4.0 SSD',
      display: '15.6" FHD IPS 300 nit',
      battery: '47Wh, 65W Type-C tez zaryad',
    },
    pros: ['Juda arzon narxda 16GB RAM va Core i5 H-seriyali kuchli protsessor', '1.62 kg yengil va nafis korpus', 'Qulay klaviatura va tezkor SSD xotira'],
    cons: ['Diskret videokarta yo\'q (og\'ir o\'yinlar uchun emas)', 'Plastik korpus'],
    bestFor: 'O\'qish, darslar, buxgalteriya (1C), ofis ishlari, dasturlash va kundalik vazifalar',
    rating: 4.75,
  },
  {
    brand: 'HP',
    model: 'HP 15s / 250 G9',
    deviceType: 'Noutbuk',
    badge: 'Eng Hamyonbop Ish & O\'qish Noutbuki',
    approxPriceUsd: 370,
    specs: {
      cpu: 'Intel Core i3-1215U (6 yadro, 4.4 GHz)',
      gpu: 'Intel UHD Graphics',
      ram: '16GB DDR4',
      storage: '512GB PCIe NVMe SSD',
      display: '15.6" FHD IPS Antiglare',
      battery: '41Wh, 45W adapter, 6-7 soat ish',
    },
    pros: ['Tezkor NVMe SSD va yangi 6 yadroli Core i3 protsessor', '1.69 kg yengil va ixcham korpus', 'Qulay klaviatura raqamli blok bilan'],
    cons: ['Korpus to\'liq plastik', 'Alohida videokarta yo\'q'],
    bestFor: 'Maktab o\'quvchilari, talabalar, ofis hujjatlari (Word, Excel), buxgalteriya (1C)',
    rating: 4.65,
  },
  {
    brand: 'Acer',
    model: 'Acer Nitro V 15',
    deviceType: 'Noutbuk',
    badge: 'Eng Arzon RTX 4050 Gaming Laptop',
    approxPriceUsd: 680,
    specs: {
      cpu: 'Intel Core i5-13420H (8 yadro)',
      gpu: 'NVIDIA GeForce RTX 4050 6GB GDDR6',
      ram: '16GB DDR5',
      storage: '512GB NVMe PCIe 4.0 SSD',
      display: '15.6" FHD 144Hz IPS',
      battery: '57Wh, 135W adapter',
    },
    pros: ['Hamyonbop narxda RTX 4050 videokarta va DLSS 3.5', 'Ikki ventilyatorli NitroSense sovutish', 'Kiber-sport o\'yinlari va video montaj'],
    cons: ['Ekran rang qamrovi 62.5% sRGB', 'Yuklama ostida ventilyator ovozi'],
    bestFor: 'O\'yinlar (CS2, GTA V, PUBG), montaj va IT dasturlash',
    rating: 4.85,
  },
  {
    brand: 'Apple',
    model: 'Apple MacBook Air 13.6" M2 (16GB RAM)',
    deviceType: 'Noutbuk',
    badge: 'Avtonomiya & Portativlik Qiroli',
    approxPriceUsd: 940,
    specs: {
      cpu: 'Apple M2 Chip (8 yadro CPU, 8 yadro GPU)',
      gpu: 'Apple 8-core GPU (ProRes tezlatgich)',
      ram: '16GB Unified Memory',
      storage: '256GB / 512GB SSD',
      display: '13.6" Liquid Retina (500 nit, P3 Wide color)',
      battery: '52.6Wh (18 soatgacha toza avtonom ishlash)',
    },
    pros: ['18 soatgacha batareya — kun bo\'yi zaryadlovchisiz ishlaydi', 'Mutlaqo shovqinsiz (ventilyatorsiz)', '1.24 kg o\'ta yengil korpus va tengsiz touchpad'],
    cons: ['Windows o\'yinlari o\'ynab bo\'lmaydi', 'Faqat 2 ta Thunderbolt Type-C porti'],
    bestFor: 'Dasturchilar (Web, Frontend, Backend, iOS), talabalar va sayohatchilar',
    rating: 4.95,
  }
];

export const DeviceAdvisor: React.FC = () => {
  const [budget, setBudget] = useState<number>(500);
  const [strictBudget, setStrictBudget] = useState<boolean>(true);
  const [deviceType, setDeviceType] = useState<'both' | 'phone' | 'laptop'>('both');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_asc' | 'price_desc' | 'rating'>('recommended');

  // Goals
  const [gaming, setGaming] = useState<boolean>(false);
  const [camera, setCamera] = useState<boolean>(false);
  const [battery, setBattery] = useState<boolean>(false);
  const [studyWork, setStudyWork] = useState<boolean>(true);
  const [videoEditing, setVideoEditing] = useState<boolean>(false);
  const [programming, setProgramming] = useState<boolean>(false);
  const [customQuery, setCustomQuery] = useState<string>('');

  // States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>(
    "$500 budjet va talablaringiz asosida Samsung, Apple, Honor, Poco, Redmi va noutbuklar qatoridan eng sara va sinalgan variantlar saralab berildi."
  );
  const [devices, setDevices] = useState<DeviceRecommendation[]>(INITIAL_DEVICES);

  // Comparison State
  const [compareList, setCompareList] = useState<DeviceRecommendation[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);

  // Fetch recommendations from API
  const fetchRecommendations = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/ai/device-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          budget,
          strictBudget,
          type: deviceType,
          gaming,
          camera,
          battery,
          studyWork,
          videoEditing,
          programming,
          customQuery,
          brand: selectedBrand,
        }),
      });

      const data = await res.json();
      if (res.ok && data.devices && data.devices.length > 0) {
        setDevices(data.devices);
        setSummary(data.summary || '');
      } else {
        // Fallback to local catalog filter
        setSummary(`Budjetingizga mos Samsung, Apple, Honor, Poco, Redmi va noutbuklar saralandi.`);
      }
    } catch {
      // Offline fallback
      setSummary(`Bozordagi eng mashhur Samsung, Apple, Honor, Poco, Redmi va noutbuk modellari.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-fetch when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecommendations();
    }, 350);
    return () => clearTimeout(timer);
  }, [budget, strictBudget, deviceType, gaming, camera, battery, studyWork, videoEditing, programming, selectedBrand]);

  // Trigger search on submit or filters change
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    fetchRecommendations();
  };

  // Filter devices by brand
  let filteredDevices = devices.slice();
  if (selectedBrand !== 'all') {
    filteredDevices = filteredDevices.filter((d) => {
      const b = (d.brand || '').toLowerCase();
      const m = d.model.toLowerCase();
      const target = selectedBrand.toLowerCase();
      if (target === 'laptop') return d.deviceType === 'Noutbuk';
      return b.includes(target) || m.includes(target);
    });
  }

  // Sort devices
  if (sortBy === 'price_asc') {
    filteredDevices.sort((a, b) => a.approxPriceUsd - b.approxPriceUsd);
  } else if (sortBy === 'price_desc') {
    filteredDevices.sort((a, b) => b.approxPriceUsd - a.approxPriceUsd);
  } else if (sortBy === 'rating') {
    filteredDevices.sort((a, b) => b.rating - a.rating);
  }

  // Toggle comparison item
  const toggleCompare = (device: DeviceRecommendation) => {
    const exists = compareList.some((d) => d.model === device.model);
    if (exists) {
      setCompareList(compareList.filter((d) => d.model !== device.model));
    } else {
      if (compareList.length >= 3) {
        setCompareList([...compareList.slice(1), device]);
      } else {
        setCompareList([...compareList, device]);
      }
    }
  };

  const getBrandBadgeColor = (brand?: string) => {
    const b = (brand || '').toLowerCase();
    if (b.includes('samsung')) return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800';
    if (b.includes('apple')) return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-700';
    if (b.includes('honor')) return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800';
    if (b.includes('poco')) return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    if (b.includes('redmi') || b.includes('xiaomi')) return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800';
    return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-xl bg-white/10 backdrop-blur-sm">
              <Laptop className="w-5 h-5 text-indigo-300" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">Telefon & Noutbuk AI Maslahatchisi</h2>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Samsung • Apple • Honor • Poco • Redmi
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Budjetingiz va bajaradigan ishingizga (gaming, kamera, dasturlash, montaj, o'qish) qarab
                barcha yetakchi brendlar bo'yicha ko'p sonli haqiqiy variantlar, taqqoslash va ekspert xulosasi.
              </p>
            </div>
          </div>

          {compareList.length > 0 && (
            <button
              onClick={() => setIsCompareOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg transition active:scale-95"
            >
              <ArrowRightLeft className="w-4 h-4" />
              Taqqoslash ({compareList.length}/3)
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Filter / Query Box */}
      <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        {/* Natural Language Search */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Qidiruv yoki tabiiy tildagi so'rov:
          </label>
          <div className="relative">
            <input
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="Masalan: '$300 budjetga PUBG uchun Poco yoki Redmi', '$700 ga montaj uchun noutbuk', 'Honor yoki Samsung kamera'..."
              className="w-full text-xs p-3 pr-28 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition"
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

        {/* Wizard Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Budget Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Budjet (USD):
              </label>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                ${budget}
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="2000"
              step="50"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>$100</span>
              <span>$500</span>
              <span>$1000</span>
              <span>$2000+</span>
            </div>

            {/* Quick budget presets */}
            <div className="flex flex-wrap items-center gap-1 mt-2">
              <span className="text-[10px] font-bold text-slate-400">Tezkor:</span>
              {[180, 300, 450, 650, 800, 1200].map((bVal) => (
                <button
                  type="button"
                  key={bVal}
                  onClick={() => setBudget(bVal)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition ${
                    budget === bVal
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  ${bVal}
                </button>
              ))}
            </div>

            {/* Strict budget toggle: "Aytgan narxingizgacha" */}
            <label className="flex items-center gap-1.5 mt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={strictBudget}
                onChange={(e) => setStrictBudget(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                Faqat shu narxgacha (oshmasin)
              </span>
            </label>
          </div>

          {/* Device Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Qurilma toifasi:
            </label>
            <div className="grid grid-cols-3 gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800">
              {[
                { id: 'both', label: 'Barchasi' },
                { id: 'phone', label: 'Telefon' },
                { id: 'laptop', label: 'Noutbuk' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setDeviceType(t.id as any)}
                  className={`py-1.5 text-xs font-bold rounded-lg transition ${
                    deviceType === t.id
                      ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority Task Goals */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nima ish qilishiga qarab (Tanlang):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "O'yinlar (Gaming)", val: gaming, set: setGaming, icon: <Gamepad2 className="w-3 h-3" /> },
                { label: 'Kamera muhim', val: camera, set: setCamera, icon: <Camera className="w-3 h-3" /> },
                { label: 'Batareya uzoq', val: battery, set: setBattery, icon: <BatteryCharging className="w-3 h-3" /> },
                { label: 'O\'qish & Ofis', val: studyWork, set: setStudyWork, icon: <GraduationCap className="w-3 h-3" /> },
                { label: 'Video montaj', val: videoEditing, set: setVideoEditing, icon: <Video className="w-3 h-3" /> },
                { label: 'Dasturlash (IT)', val: programming, set: setProgramming, icon: <Code2 className="w-3 h-3" /> },
              ].map((p, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => p.set(!p.val)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                    p.val
                      ? 'bg-indigo-600 text-white font-bold shadow-xs'
                      : 'border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
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

      {/* Brand Selector Tabs (Specifically addresses user request for Samsung, Apple, Honor, Poco, Redmi options) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Brend:
          </span>
          {[
            { id: 'all', label: 'Barcha Brendlar' },
            { id: 'samsung', label: '📱 Samsung' },
            { id: 'apple', label: '🍎 Apple' },
            { id: 'honor', label: '⚡ Honor' },
            { id: 'poco', label: '🚀 Poco' },
            { id: 'redmi', label: '🔴 Redmi / Xiaomi' },
            { id: 'laptop', label: '💻 Noutbuklar' },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBrand(b.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition ${
                selectedBrand === b.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400">Tartib:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-semibold p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 outline-none"
          >
            <option value="recommended">Tavsiya etilgan</option>
            <option value="price_asc">Narx: Arzonroq</option>
            <option value="price_desc">Narx: Qimmatroq</option>
            <option value="rating">Reyting bo'yicha</option>
          </select>
        </div>
      </div>

      {/* AI Expert Summary Card */}
      {summary && (
        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Ekspert tavsiyasi xulosasi:</span>
            <p className="mt-0.5 leading-relaxed">{summary}</p>
          </div>
        </div>
      )}

      {/* Count & Status */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Topilgan qurilmalar soni: <strong className="text-slate-900 dark:text-white font-bold">{filteredDevices.length} ta</strong> variant
        </span>
        <span className="text-[11px] text-slate-400">
          Samsung, Apple, Honor, Poco, Redmi va noutbuklar qamrab olingan
        </span>
      </div>

      {/* Recommendation Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDevices.map((dev, idx) => {
          const isComparing = compareList.some((c) => c.model === dev.model);
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition duration-200 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md ${
                isComparing
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {/* Header Info */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${getBrandBadgeColor(dev.brand)}`}>
                      {dev.brand || (dev.deviceType === 'Noutbuk' ? 'Noutbuk' : 'Smartfon')}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {dev.badge}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 block">
                      ~${dev.approxPriceUsd}
                    </span>
                    {dev.approxPriceUsd <= budget ? (
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {dev.approxPriceUsd === budget ? 'Aynan budjetingiz' : `$${budget - dev.approxPriceUsd} tejaysiz`}
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-amber-500">
                        +${dev.approxPriceUsd - budget}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {dev.deviceType === 'Noutbuk' ? (
                      <Laptop className="w-5 h-5 text-indigo-500 shrink-0" />
                    ) : (
                      <Smartphone className="w-5 h-5 text-indigo-500 shrink-0" />
                    )}
                    <span>{dev.model}</span>
                  </h3>
                  <button
                    onClick={() => toggleCompare(dev)}
                    className={`shrink-0 p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition ${
                      isComparing
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                    title="Taqqoslash ro'yxatiga qo'shish"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    <span className="text-[10px]">{isComparing ? 'Taqqosda' : 'Taqqoslash'}</span>
                  </button>
                </div>

                <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                  <span>Turi: <strong className="text-slate-700 dark:text-slate-300">{dev.deviceType}</strong></span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="w-3 h-3 fill-amber-500" />
                    {dev.rating} / 5.0
                  </span>
                </p>
              </div>

              {/* Specifications Grid */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2.5 text-xs">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">Protsessor (CPU):</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{dev.specs.cpu}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">Grafika (GPU):</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{dev.specs.gpu}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">RAM & Xotira:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">{dev.specs.ram} / {dev.specs.storage}</span>
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">Ekran:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">{dev.specs.display}</span>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                  <span className="text-[10px] font-semibold text-slate-400 block uppercase">Batareya & Zaryad:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">{dev.specs.battery}</span>
                </div>
              </div>

              {/* Pros & Cons */}
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

              {/* Who is it best for */}
              <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/50 dark:border-indigo-800/50 text-xs">
                <span className="font-bold text-indigo-950 dark:text-indigo-200">Kimlar uchun eng mos:</span>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{dev.bestFor}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Side-by-Side Comparison Modal */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <ArrowRightLeft className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Qurilmalarni Yonma-Yon Taqqoslash (Side-by-Side)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Tanlangan {compareList.length} ta qurilmaning texnik parametrlarini taqqoslang
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCompareOpen(false)}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparison Table */}
            <div className="p-5 overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3 text-slate-400 font-bold uppercase w-32">Parametr</th>
                    {compareList.map((dev, i) => (
                      <th key={i} className="p-3 text-slate-900 dark:text-white font-bold min-w-[220px]">
                        <div className="text-sm font-extrabold">{dev.model}</div>
                        <div className="text-emerald-600 dark:text-emerald-400 text-xs font-bold mt-0.5">
                          ~${dev.approxPriceUsd}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Brend & Toifa</td>
                    {compareList.map((d, i) => (
                      <td key={i} className="p-3 font-semibold text-slate-800 dark:text-slate-200">
                        {d.brand} • {d.deviceType}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Protsessor (CPU)</td>
                    {compareList.map((d, i) => (
                      <td key={i} className="p-3 text-slate-800 dark:text-slate-200">
                        {d.specs.cpu}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Videokarta (GPU)</td>
                    {compareList.map((d, i) => (
                      <td key={i} className="p-3 text-slate-800 dark:text-slate-200">
                        {d.specs.gpu}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">RAM & Xotira</td>
                    {compareList.map((d, i) => (
                      <td key={i} className="p-3 font-bold text-slate-800 dark:text-slate-200">
                        {d.specs.ram} / {d.specs.storage}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Ekran</td>
                    {compareList.map((d, i) => (
                      <td key={i} className="p-3 text-slate-800 dark:text-slate-200">
                        {d.specs.display}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Batareya / Zaryad</td>
                    {compareList.map((d, i) => (
                      <td key={i} className="p-3 text-slate-800 dark:text-slate-200">
                        {d.specs.battery}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Afzalliklari</td>
                    {compareList.map((d, i) => (
                      <td key={i} className="p-3 space-y-1">
                        {d.pros.map((p, idx) => (
                          <div key={idx} className="flex items-start gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                            <Check className="w-3 h-3 shrink-0 mt-0.5" />
                            <span>{p}</span>
                          </div>
                        ))}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-500">Kimga tavsiya etiladi</td>
                    {compareList.map((d, i) => (
                      <td key={i} className="p-3 text-[11px] text-slate-600 dark:text-slate-300 italic">
                        {d.bestFor}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex justify-end">
              <button
                onClick={() => setIsCompareOpen(false)}
                className="px-5 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-700"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

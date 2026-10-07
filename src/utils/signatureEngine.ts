export interface SignatureStyleConfig {
  id: string;
  name: string;
  subtitle: string;
  category: 'executive' | 'royal' | 'modern' | 'artistic' | 'monogram' | 'delicate';
  fontFamily: string;
  textTransform: (raw: string) => string;
  defaultSlant: number; // degrees
  flourishType: 'loop' | 'executive' | 'royal' | 'ribbon' | 'circle' | 'minimal';
  flourishPosition: 'bottom' | 'enclosing' | 'cross' | 'trailing';
  strokeWidth: number;
  letterSpacing: string;
  badge: string;
  description: string;
}

export interface RecommendedSignature {
  style: SignatureStyleConfig;
  displayText: string;
  slant: number;
  inkColor: string;
  flourishSvgPath: string;
  recommendationScore: number;
  reason: string;
  uniquenessCode: string;
}

// Generate deterministic hash from string
export const hashString = (str: string): number => {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
  }
  return Math.abs(hash);
};

// Parse raw name into distinct formatting components
export const parseNameParts = (raw: string) => {
  const clean = raw.trim().replace(/\s+/g, ' ');
  if (!clean) return { clean: '', first: '', last: '', initials: '', middle: '' };
  
  const parts = clean.split(' ');
  const first = parts[0] || '';
  const last = parts.length > 1 ? parts.slice(1).join(' ') : '';
  const initials = parts.map(p => p[0]?.toUpperCase() || '').join('.');
  
  return { clean, first, last, initials, parts };
};

// Available Signature Ink Colors
export const INK_COLORS = [
  { id: 'black', name: 'Klassik Qora (Black)', hex: '#09090b', preview: 'bg-zinc-900' },
  { id: 'royal_blue', name: 'Qirollik To\'q Ko\'k (Royal Blue)', hex: '#1e3a8a', preview: 'bg-blue-900' },
  { id: 'deep_navy', name: 'Prezident Siyohi (Navy)', hex: '#0f172a', preview: 'bg-slate-900' },
  { id: 'crimson', name: 'Qirmizi Qalam (Crimson)', hex: '#991b1b', preview: 'bg-red-800' },
  { id: 'emerald', name: 'Zumrad Yashil (Emerald)', hex: '#065f46', preview: 'bg-emerald-800' },
  { id: 'gold', name: 'Oltin Siyoh (Golden)', hex: '#b45309', preview: 'bg-amber-700' },
  { id: 'purple', name: 'Binafsha Elit (Purple)', hex: '#581c87', preview: 'bg-purple-900' },
];

// Flourish SVG Generators based on style & name characteristics
export const generateFlourishPath = (
  type: SignatureStyleConfig['flourishType'],
  width: number,
  height: number,
  seed: number
): string => {
  const mod = (seed % 10) / 10; // 0.0 - 0.9 variation
  
  switch (type) {
    case 'loop': {
      // Sweeping underline that loops back under itself with an upward flick
      const startX = width * 0.08;
      const startY = height * 0.76;
      const midX = width * 0.65;
      const endX = width * 0.92;
      const loopCpX = width * 0.98;
      const loopCpY = height * (0.84 + mod * 0.08);
      const loopEndX = width * 0.78;
      const loopEndY = height * (0.92 + mod * 0.05);
      const flickX = width * 0.96;
      const flickY = height * (0.88 + mod * 0.04);
      return `M ${startX} ${startY} Q ${midX} ${startY + 15} ${endX} ${startY} C ${loopCpX} ${loopCpY} ${loopEndX} ${loopEndY} ${loopEndX} ${loopEndY} Q ${loopEndX + 40} ${loopEndY} ${flickX} ${flickY}`;
    }
    case 'executive': {
      // Sharp, decisive underline ending in an assertive accent dot or quick slash
      const startX = width * 0.12;
      const startY = height * 0.78;
      const endX = width * 0.88;
      const bow = (seed % 8) - 4;
      return `M ${startX} ${startY} C ${startX + width * 0.3} ${startY + 8 + bow} ${endX - width * 0.2} ${startY - 4} ${endX} ${startY + 6} M ${endX + 8} ${startY + 3} a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0`;
    }
    case 'royal': {
      // Double wave flourish with majestic curlicues
      const startX = width * 0.06;
      const y = height * 0.80;
      const cp1X = width * 0.30;
      const cp2X = width * 0.60;
      const endX = width * 0.94;
      return `M ${startX} ${y} C ${cp1X} ${y + 20} ${cp2X} ${y - 18} ${endX} ${y + 4} M ${startX + 15} ${y + 8} C ${cp1X} ${y + 26} ${cp2X} ${y - 10} ${endX - 30} ${y + 12}`;
    }
    case 'circle': {
      // Dynamic circular ellipse wrapping around or accenting the monogram
      const cx = width * 0.5;
      const cy = height * 0.52;
      const rx = width * 0.44;
      const ry = height * 0.42;
      const startAngle = (seed % 40) - 20;
      return `M ${cx - rx} ${cy} C ${cx - rx} ${cy - ry} ${cx + rx} ${cy - ry} ${cx + rx} ${cy} C ${cx + rx} ${cy + ry} ${cx - rx * 0.6} ${cy + ry} ${cx - rx * 0.2} ${cy + ry * 0.8} Q ${cx + rx * 0.4} ${cy + ry * 0.6} ${cx + rx * 0.8} ${cy + ry * 0.9}`;
    }
    case 'ribbon': {
      // Swirling ribbon-like infinity or bow sweep
      const startX = width * 0.10;
      const y = height * 0.78;
      return `M ${startX} ${y} Q ${width * 0.4} ${y + 24} ${width * 0.75} ${y - 8} T ${width * 0.94} ${y + 10} C ${width * 0.96} ${y + 25} ${width * 0.80} ${y + 25} ${width * 0.72} ${y + 14}`;
    }
    case 'minimal':
    default: {
      // Sleek tapered straight underline
      const startX = width * 0.15;
      const startY = height * 0.79;
      const endX = width * 0.85;
      return `M ${startX} ${startY} Q ${width * 0.5} ${startY + 6} ${endX} ${startY}`;
    }
  }
};

// 6 Signature Styles tailored for distinct personalities
export const SIGNATURE_STYLES: SignatureStyleConfig[] = [
  {
    id: 'executive',
    name: 'Ijrochi & Rasmiy (Executive Pro)',
    subtitle: 'Nufuzli, rasmiy hujjatlar va biznes uchun ideal',
    category: 'executive',
    fontFamily: "'Great Vibes', cursive",
    textTransform: (raw: string) => {
      const { first, last } = parseNameParts(raw);
      if (!last) return raw;
      // "M. Olimjanov" format
      return `${first[0]?.toUpperCase()}. ${last}`;
    },
    defaultSlant: 8,
    flourishType: 'executive',
    flourishPosition: 'bottom',
    strokeWidth: 2.2,
    letterSpacing: '0.04em',
    badge: 'Biznes Tanlovi',
    description: 'Bosh harf qisqartmasi va to\'liq familiya, pastki qat\'iy urg\'u chizig\'i bilan mustahkamlangan klassik imzo uslubi.',
  },
  {
    id: 'royal',
    name: 'Qirollik Kaligrafiyasi (Royal Calligraphy)',
    subtitle: 'Hashamatli, keng qamrovli va to\'liq ism kaligrafiyasi',
    category: 'royal',
    fontFamily: "'Alex Brush', cursive",
    textTransform: (raw: string) => raw, // To'liq ism
    defaultSlant: 12,
    flourishType: 'royal',
    flourishPosition: 'bottom',
    strokeWidth: 2,
    letterSpacing: '0.06em',
    badge: 'Hashamatli',
    description: 'To\'liq ism-familiyaning qirollik uslubidagi nafis buralishlari va erkin to\'lqinli pastki kaligrafik bezak.',
  },
  {
    id: 'modern_dynamic',
    name: 'Tezkor Zamonaviy (Modern Speed)',
    subtitle: 'Dinamik, chaqqon va zamonaviy ijodkorlar uchun',
    category: 'modern',
    fontFamily: "'Dancing Script', cursive",
    textTransform: (raw: string) => {
      const { first, last } = parseNameParts(raw);
      if (!last) return raw;
      // "Mustafo O." format
      return `${first} ${last[0]?.toUpperCase()}.`;
    },
    defaultSlant: 14,
    flourishType: 'loop',
    flourishPosition: 'bottom',
    strokeWidth: 2.5,
    letterSpacing: '0.02em',
    badge: 'Kreativ',
    description: 'Ism to\'liq va familiya qisqartmasi, orqaga qaytuvchi dinamik halqa (loop) bilan yengil va tezkor yozilish.',
  },
  {
    id: 'artistic_swirl',
    name: 'Artistik Spiral (Artistic Swirl)',
    subtitle: 'San\'atkorlar, dizaynerlar va ijodiy shaxslar uchun',
    category: 'artistic',
    fontFamily: "'Allura', cursive",
    textTransform: (raw: string) => raw,
    defaultSlant: 10,
    flourishType: 'ribbon',
    flourishPosition: 'bottom',
    strokeWidth: 2.2,
    letterSpacing: '0.05em',
    badge: 'Eksklyuziv',
    description: 'Badiiy tasviriy chiziqlar, lentasimon nafis burilish va uzluksiz qo\'l harakati bilan yasalgan san\'at asari.',
  },
  {
    id: 'monogram_crest',
    name: 'Monogramma & Muhr (Monogram Crest)',
    subtitle: 'Bosh harflar tutashuvi va doiraviy mualliflik muhri',
    category: 'monogram',
    fontFamily: "'Parisienne', cursive",
    textTransform: (raw: string) => {
      const { initials, clean } = parseNameParts(raw);
      if (initials && initials.length >= 2) {
        return initials.replace(/\./g, ' · ');
      }
      return clean.slice(0, 3).toUpperCase();
    },
    defaultSlant: 0,
    flourishType: 'circle',
    flourishPosition: 'enclosing',
    strokeWidth: 2,
    letterSpacing: '0.12em',
    badge: 'Muhr Uslubi',
    description: 'Ism va familiya bosh harflarining aylanma elit muhr ramkasida uyg\'unlashishi. Brend va shaxsiy logotip sifatida ham mukammal.',
  },
  {
    id: 'delicate_pure',
    name: 'Nozik & Elegant (Delicate Minimal)',
    subtitle: 'Yupqa qalam uchi, minimalist va sof estetika',
    category: 'delicate',
    fontFamily: "'Sacramento', cursive",
    textTransform: (raw: string) => raw,
    defaultSlant: 6,
    flourishType: 'minimal',
    flourishPosition: 'bottom',
    strokeWidth: 1.8,
    letterSpacing: '0.03em',
    badge: 'Minimalist',
    description: 'Yengil bosim bilan chizilgan nafis qalam chiziqlari, ortiqcha yuklamasiz toza va zamonaviy imzo.',
  },
];

// Compute a smart, unique personalized signature recommendation
export const generateSignaturesForName = (inputName: string): {
  recommendedIndex: number;
  uniquenessKey: string;
  insights: {
    firstLetterTrait: string;
    flowTrait: string;
    recommendedStyleName: string;
    advice: string;
  };
  variants: RecommendedSignature[];
} => {
  const cleanName = inputName.trim() || 'SmartTools';
  const seed = hashString(cleanName.toLowerCase());
  const firstLetter = cleanName[0]?.toUpperCase() || 'A';
  
  // Calculate recommended style index (0-5) deterministically based on seed and characteristics
  const styleCount = SIGNATURE_STYLES.length;
  // Weighting: if name has 2+ words, executive/royal often shine
  const hasMultipleWords = cleanName.includes(' ');
  let recommendedIndex = seed % styleCount;
  if (hasMultipleWords && (recommendedIndex === 4 || recommendedIndex === 5)) {
    // Bias towards executive or royal for multi-word full names
    recommendedIndex = (seed % 2 === 0) ? 0 : 1;
  }

  // Generate uniqueness key like #SIG-9482-M
  const uniquenessKey = `SIG-${(seed % 9000 + 1000)}-${firstLetter}`;

  // Personalized insights in Uzbek
  const letterTraits: Record<string, string> = {
    A: "'A' harfi keng va ochiq boshlang'ichga ega bo'lib, o'ziga ishonch va samimiylikni aks ettiradi.",
    B: "'B' harfining ikki qavatli egri chizig'i muvozanatli va nufuzli imzo uchun ajoyib asos bo'ladi.",
    D: "'D' harfining silliq orqa halqasi kaligrafiyada quvvatli va erkin harakatni ta'minlaydi.",
    E: "'E' harfi nozik va ixcham burilishlarga moyil bo'lib, imzoni zamonaviy va yengil qiladi.",
    F: "'F' harfi baland vertikal qalam tebranishi bilan imzoga tantanavor nufuz bag'ishlaydi.",
    G: "'G' harfi chuqur pastki past-sirtmoqqa ega bo'lib, pastki bezak chizig'i bilan o'zaro chiroyli bog'lanadi.",
    H: "'H' harfining ko'prik chizig'i qo'shimcha badiiy elementlar uchun keng imkoniyat beradi.",
    I: "'I' harfi minimalist va chaqqon boshlanish beradi, unga cho'ziq to'lqinli yakun yarashadi.",
    J: "'J' harfi pastki uzun halqasi bilan imzo ostki chizig'i rolini o'zi ham o'ynay oladi.",
    K: "'K' harfining o'tkir qanotlari qat'iyatlilik va dinamikani namoyon etadi.",
    L: "'L' harfi mayin to'lqinli va romantik, u yozuvga oquvchan nafislik baxsh etadi.",
    M: "'M' harfi keng qanotli bo'lib, qudratli va salobatli boshlang'ich element yaratadi.",
    N: "'N' harfi tezkor va qat'iy yo'nalishli, u biznes imzolariga juda mos keladi.",
    O: "'O' harfi mukammal aylanma markaz bo'lib, monogramma va doiraviy bezaklarga qulay.",
    P: "'P' harfining yuqori doirasi imzo boshida chiroyli salla-halqa shaklini hosil qiladi.",
    Q: "'Q' harfining quyruqchasi erkin to'lqinga aylanib, butun imzoni tagidan ko'tarib turadi.",
    R: "'R' harfining o'ng oyog'i o'ngga qarab dinamik cho'zilib, oldinga intilish ruhini beradi.",
    S: "'S' harfi ilondek nozik va elastik bo'lib, eng mashhur kaligrafik imzo bosh harflaridan biridir.",
    T: "'T' harfining gorizontal shlyapasi butun imzoni himoyalovchi soyabon kabi bezaydi.",
    U: "'U' harfi ochiq kosadek yumshoq bo'lib, yozuvni mehmondo'st va erkin qiladi.",
    V: "'V' harfining o'tkir tubi zamonaviy va texnologik qat'iyatni ifodalaydi.",
    X: "'X' harfi simmetrik kesishuvi bilan o'ziga xos muhr taassurotini uyg'otadi.",
    Y: "'Y' harfining pastki keng quyrug'i imzoga chuqur va mustahkam poydevor yaratadi.",
    Z: "'Z' harfining zikzak harakati chaqmoqdek chaqqon va unutilmas imzo shakllantiradi.",
  };

  const firstLetterTrait = letterTraits[firstLetter] || 
    `'${firstLetter}' harfi bilan boshlanuvchi ismingiz o'ziga xos kaligrafik boshlang'ichga ega.`;

  const flowTrait = cleanName.length > 12 
    ? "Uzun ism-familiya bo'lgani sababli, bosh harf qisqartmasi va pastki to'lqinli chiziq imzoni ixcham hamda o'qilishi oson qiladi."
    : "Ixcham uzunlikdagi matn bo'lgani uchun, to'liq kaligrafik bezaklar va cho'ziq yakuniy sirtmoq (swash) mukammal mutanosiblik hosil qiladi.";

  const recommendedStyle = SIGNATURE_STYLES[recommendedIndex];

  // Colors deterministic selection
  const defaultInk = INK_COLORS[(seed % (INK_COLORS.length - 2))].hex;

  // Build variants
  const variants: RecommendedSignature[] = SIGNATURE_STYLES.map((style, idx) => {
    const isRecommended = idx === recommendedIndex;
    const variantSeed = seed + idx * 31;
    const displayText = style.textTransform(cleanName);
    const slant = style.defaultSlant + ((variantSeed % 5) - 2);
    const flourishSvgPath = generateFlourishPath(style.flourishType, 500, 150, variantSeed);
    const score = isRecommended ? 98 : (85 + (variantSeed % 11));

    return {
      style,
      displayText,
      slant,
      inkColor: defaultInk,
      flourishSvgPath,
      recommendationScore: score,
      reason: isRecommended 
        ? `Ismingizning '${firstLetter}' harfi va ritmiga 100% mos keluvchi eng ideal yagona tavsiya!`
        : `${style.badge} uslubi — muqobil variant sifatida tavsiya etiladi.`,
      uniquenessCode: `${uniquenessKey}-V${idx + 1}`,
    };
  });

  return {
    recommendedIndex,
    uniquenessKey,
    insights: {
      firstLetterTrait,
      flowTrait,
      recommendedStyleName: recommendedStyle.name,
      advice: `Tavsiya: ${recommendedStyle.name} uslubini tanlab, pastki chizig'ini qalam bilan mashq qiling. Ushbu imzo sizning shaxsiyatingizga jiddiylik va nufuz bag'ishlaydi.`,
    },
    variants,
  };
};

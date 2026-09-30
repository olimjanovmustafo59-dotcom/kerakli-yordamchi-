import { ToolDefinition } from '../types';

export const TOOLS_LIST: ToolDefinition[] = [
  // AI Tools
  {
    id: 'doc_ai',
    name: 'Document AI',
    shortDesc: 'PDF, Word, TXT matnlarini o\'qish, tahrirlash va AI bilan boyitish',
    category: 'ai',
    iconName: 'FileText',
    badge: 'AI Smart',
    tags: ['hujjat', 'doc', 'pdf', 'word', 'matn', 'ai', 'tahrir', 'grammatika', 'qisqartirish'],
  },
  {
    id: 'ocr',
    name: 'OCR Matn Aniqlash',
    shortDesc: 'Rasm yoki skanerdan matnlarni bir zumda ajratib olish (UZ, RU, EN)',
    category: 'ai',
    iconName: 'ScanText',
    badge: 'Multimodal',
    tags: ['ocr', 'rasm', 'skaner', 'matn', 'tanib olish', 'image to text'],
  },
  {
    id: 'translator',
    name: 'Translator AI',
    shortDesc: 'Kontekstni va terminlarni saqlovchi professional sun\'iy intellekt tarjimoni',
    category: 'ai',
    iconName: 'Languages',
    badge: 'Pro',
    tags: ['tarjima', 'translator', 'inglizcha', 'ruscha', 'til', 'lugat', 'ai'],
  },
  {
    id: 'device_advisor',
    name: 'Telefon & Noutbuk Tavsiyasi',
    shortDesc: 'Budjet va maqsadlaringizga mos ideal smartfon yoki kompyuterni tanlash',
    category: 'ai',
    iconName: 'Laptop',
    badge: 'Ekspert',
    tags: ['telefon', 'noutbuk', 'kompyuter', 'smartfon', 'laptop', 'gaming', 'pubg', 'budjet', 'advice'],
  },

  // QR & Barcode
  {
    id: 'qr_pro',
    name: 'QR Code Pro',
    shortDesc: 'Barcha turlar, rang-barang dizayn, logo, ramka va avtomatik skanerlash tekshiruvi',
    category: 'qr_barcode',
    iconName: 'QrCode',
    badge: 'Skaner-Test',
    tags: ['qr', 'qrcode', 'wifi', 'vcard', 'url', 'barkod', 'dizayn'],
  },
  {
    id: 'image_to_qr',
    name: 'Rasm → QR',
    shortDesc: 'Rasmlarni QR kodga joylash, hajm tekshiruvi va qulay ulashish',
    category: 'qr_barcode',
    iconName: 'Image',
    tags: ['rasm qr', 'photo to qr', 'image', 'fayl qr'],
  },
  {
    id: 'barcode',
    name: 'Barcode Generator',
    shortDesc: 'Code 128, Code 39, EAN-13, UPC, ITF va boshqa standart shtrix-kodlar',
    category: 'qr_barcode',
    iconName: 'Barcode',
    tags: ['barkod', 'barcode', 'ean', 'upc', 'code128', 'savdo', 'tovar'],
  },

  // Documents
  {
    id: 'pdf_tools',
    name: 'PDF Tools',
    shortDesc: 'Birlashtirish, ajratish, sahifalarni aylantirish, tartiblash va PDF ↔ Rasm/Matn',
    category: 'documents',
    iconName: 'Files',
    badge: 'Offline tezkor',
    tags: ['pdf', 'merge', 'split', 'birlashtirish', 'kesish', 'convert', 'hujjat'],
  },
  {
    id: 'font_studio',
    name: 'Handwriting / Font Studio',
    shortDesc: 'Qo\'lyozma, imzo uslubi va zamonaviy kreativ shriftlarda matn yaratish va eksport',
    category: 'documents',
    iconName: 'PenTool',
    badge: 'Kreativ',
    tags: ['shrift', 'font', 'imzo', 'handwriting', 'yozuv', 'signature', 'qo\'lyozma'],
  },
  {
    id: 'file_converter',
    name: 'File Converter',
    shortDesc: 'JPG, PNG, WEBP, PDF, TXT, CSV, JSON fayllarini o\'zaro konvertatsiya qilish',
    category: 'documents',
    iconName: 'ArrowRightLeft',
    tags: ['converter', 'fayl', 'format', 'csv', 'json', 'png', 'jpg'],
  },

  // Image
  {
    id: 'image_editor',
    name: 'Image Editor Pro',
    shortDesc: 'O\'lchamni o\'zgartirish, qirqish, filtrlash, sifatni saqlash va fon tozalash',
    category: 'image',
    iconName: 'SlidersHorizontal',
    tags: ['rasm', 'editor', 'crop', 'resize', 'filter', 'fon', 'background', 'photo'],
  },

  // Calculators
  {
    id: 'calculator',
    name: 'Universal Kalkulyator',
    shortDesc: 'Oddiy, Muhandislik (Sin, Cos, Ln), Moliya (Kredit, Foiz), Sana, O\'lchov va Qurilish',
    category: 'calculators',
    iconName: 'Calculator',
    badge: 'Ko\'p yo\'nalishli',
    tags: ['kalkulyator', 'calculator', 'moliya', 'kredit', 'sana', 'yosh', 'converter', 'qurilish', 'kafel'],
  },

  // Developer & Text
  {
    id: 'text_tools',
    name: 'Text & Dev Tools',
    shortDesc: 'So\'z sanagich, JSON formatlagich, Base64, URL kodlash va Markdown ko\'rish',
    category: 'developer',
    iconName: 'Code',
    tags: ['text', 'json', 'base64', 'url', 'markdown', 'formatter', 'words', 'developer'],
  },
  {
    id: 'color_tools',
    name: 'Color Studio',
    shortDesc: 'HEX, RGB, HSL, CMYK, gradient generatori, palitra va WCAG kontrast tekshiruv',
    category: 'developer',
    iconName: 'Palette',
    tags: ['rang', 'color', 'hex', 'rgb', 'gradient', 'palette', 'kontrast'],
  },

  // Security
  {
    id: 'password_generator',
    name: 'Password Generator',
    shortDesc: 'Kriptografik xavfsiz parollar yaratish va kuchlilik darajasini tekshirish',
    category: 'security',
    iconName: 'ShieldCheck',
    badge: '100% Client-side',
    tags: ['parol', 'password', 'xavfsizlik', 'generator', 'security'],
  },

  // Admin
  {
    id: 'admin_panel',
    name: 'Admin Panel',
    shortDesc: 'Tizim monitoringi, foydalanuvchilar fikri va boshqaruv (Olimjanov Mustafo)',
    category: 'security',
    iconName: 'Settings',
    badge: 'Admin',
    tags: ['admin', 'sozlama', 'monitoring', 'boshqaruv'],
  }
];

export const CATEGORIES = [
  { id: 'all', label: 'Barcha vositalar', icon: 'LayoutGrid' },
  { id: 'ai', label: 'AI Vositalari', icon: 'Sparkles' },
  { id: 'qr_barcode', label: 'QR & Barkod', icon: 'QrCode' },
  { id: 'documents', label: 'Hujjatlar & PDF', icon: 'FileText' },
  { id: 'image', label: 'Rasm & Grafika', icon: 'Image' },
  { id: 'calculators', label: 'Kalkulyatorlar', icon: 'Calculator' },
  { id: 'developer', label: 'Dasturchi vositalari', icon: 'Code' },
  { id: 'security', label: 'Xavfsizlik', icon: 'ShieldCheck' },
];

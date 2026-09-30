import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Maximum payload for handling client-side image/PDF base64 conversions safely
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory telemetry & feedback for admin monitoring
const systemStartTime = Date.now();
const activityLog: Array<{
  id: string;
  timestamp: string;
  type: string;
  status: 'success' | 'error';
  details: string;
}> = [];

const feedbackSubmissions: Array<{
  id: string;
  timestamp: string;
  email: string;
  rating: number;
  message: string;
  category: string;
}> = [
  {
    id: 'init-1',
    timestamp: new Date().toISOString(),
    email: 'foydalanuvchi@smarttools.uz',
    rating: 5,
    message: "Ajoyib platforma! Ayniqsa QR Code Pro va PDF birlashtirish funksiyalari juda qulay va tez ishlayapti.",
    category: 'Umumiy'
  }
];

function logActivity(type: string, status: 'success' | 'error', details: string) {
  activityLog.unshift({
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    type,
    status,
    details,
  });
  if (activityLog.length > 100) activityLog.pop();
}

// ---------------- API ENDPOINTS ----------------

// System & Admin Status
app.get('/api/system/status', (req, res) => {
  const uptimeSeconds = Math.floor((Date.now() - systemStartTime) / 1000);
  res.json({
    status: 'online',
    uptimeSeconds,
    hasApiKey: !!process.env.GEMINI_API_KEY,
    adminEmail: 'olimjanovmustafo59@gmail.com',
    recentActivityCount: activityLog.length,
    feedbackCount: feedbackSubmissions.length,
    activeToolsCount: 16,
    version: '2.5.0-pro'
  });
});

// Admin Metrics & Feedbacks
app.get('/api/admin/data', (req, res) => {
  const userEmail = req.headers['x-user-email'] as string || '';
  const isAdmin = userEmail.toLowerCase() === 'olimjanovmustafo59@gmail.com' || req.query.adminKey === 'smarttools-admin-access';
  
  res.json({
    authorized: isAdmin,
    activityLog: activityLog.slice(0, 30),
    feedbackList: feedbackSubmissions,
    serverUptime: Math.floor((Date.now() - systemStartTime) / 1000),
    memoryUsage: process.memoryUsage(),
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

app.post('/api/admin/feedback', (req, res) => {
  try {
    const { email, rating, message, category } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Fikr-mulohaza matni kiritilishi shart." });
    }
    const newFeedback = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      email: email || 'Anonim foydalanuvchi',
      rating: Number(rating) || 5,
      message,
      category: category || 'Umumiy fikr',
    };
    feedbackSubmissions.unshift(newFeedback);
    logActivity('Feedback', 'success', `Yangi fikr: ${newFeedback.category}`);
    res.json({ success: true, feedback: newFeedback });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Xatolik yuz berdi" });
  }
});

// Document AI endpoint
app.post('/api/ai/document', async (req, res) => {
  try {
    const { text, action } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: "Hujjat matni kiritilishi shart." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "Gemini API kaliti topilmadi. Iltimos, sozlamalarda GEMINI_API_KEY mavjudligini tekshiring."
      });
    }

    let instruction = "";
    switch (action) {
      case 'correct':
        instruction = "Quyidagi matndagi barcha imlo, grammatik va tinish belgisi xatolarini tuzatib, toza va to'g'ri o'zbek/tegishli tilda qaytar. Matn mazmunini o'zgartirma. Faqat tuzatilgan matnni ber.";
        break;
      case 'shorten':
        instruction = "Quyidagi matnni qisqartir, uning asosiy mohiyati va muhim faktlarini saqlagan holda ixcham konspekt qilib ber.";
        break;
      case 'expand':
        instruction = "Quyidagi matnni mazmunini boyitib, mantiqiy jihatdan batafsil va tushunarli qilib kengaytir.";
        break;
      case 'formal':
        instruction = "Quyidagi matnni rasmiy-idoraviy yoki akademik uslubga o'tkaz. So'zlarni rasmiy muomalada qo'llanadigan shaklda bayon et.";
        break;
      case 'simple':
        instruction = "Quyidagi matnni oddiy xalq tilida, juda tushunarli va sodda so'zlar bilan qayta ifodalab ber.";
        break;
      case 'professional':
        instruction = "Quyidagi matnni professional biznes uslubida, ishonchli va nufuzli so'z boyligi bilan qayta yoz.";
        break;
      case 'grammar':
        instruction = "Matn grammatikasini tekshir va topilgan asosiy xatolar bo'yicha qisqa tushuntirish berib, oxirida mukammal tuzatilgan variantini taqdim et.";
        break;
      default:
        instruction = "Quyidagi matnni tahlil qil va takomillashtir.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `${instruction}\n\nMatn:\n"""\n${text.slice(0, 15000)}\n"""`,
    });

    const resultText = response.text || "";
    logActivity('Document AI', 'success', `Amal: ${action}, hajm: ${text.length} belgi`);
    res.json({ result: resultText });
  } catch (error: any) {
    console.error("Document AI error:", error);
    logActivity('Document AI', 'error', error.message || 'Xatolik');
    res.status(500).json({
      error: "Hujjatni qayta ishlashda xatolik yuz berdi: " + (error.message || "Server javob bermadi.")
    });
  }
});

// OCR endpoint
app.post('/api/ai/ocr', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/png', languageHint } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Rasm ma'lumoti yuborilmadi." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "Gemini API kaliti topilmadi. OCR uchun API sozlanishi lozim."
      });
    }

    // Strip data:image/...;base64, prefix if present
    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    const promptText = `Ushbu tasvirdagi (yoki skanerlangan hujjatdagi) barcha matnlarni juda aniq ravishda belgisigacha ko'chirib ol (OCR).
Til: O'zbek (lotin yoki kirill), Rus, Ingliz yoki boshqa tillar bo'lishi mumkin.${languageHint ? ` Asosiy ehtimoliy til: ${languageHint}.` : ''}
Qoidalar:
1. Matn tartibi va paragraflarni saqlab qol.
2. Jadval yoki ro'yxat bo'lsa, mos tarzda qatorlarga ajrat.
3. Rasmda matn yo'q bo'lsa yoki o'qib bo'lmasa, "[Tasvirda o'qiladigan matn topilmadi]" deb xabar ber.
4. O'zingdan hech qanday qo'shimcha so'zboshi yoki xulosa qo'shma, faqat hujjatdagi haqiqiy matnni qaytar.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || 'image/png',
            },
          },
          {
            text: promptText,
          },
        ],
      },
    });

    const recognizedText = response.text || "";
    logActivity('OCR', 'success', `Belgilar soni: ${recognizedText.length}`);
    res.json({ text: recognizedText });
  } catch (error: any) {
    console.error("OCR error:", error);
    logActivity('OCR', 'error', error.message || 'Xatolik');
    res.status(500).json({
      error: "Tasvirdan matnni ajratishda xatolik yuz berdi: " + (error.message || "Rasm sifati past yoki xatolik")
    });
  }
});

// Translator AI endpoint
app.post('/api/ai/translate', async (req, res) => {
  try {
    const { text, sourceLang = 'Avtomatik', targetLang = "O'zbek", mode = 'professional' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: "Tarjima qilinadigan matn kiritilishi lozim." });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "Gemini API kaliti topilmadi."
      });
    }

    const modePrompt = mode === 'formal'
      ? "Rasmiy, idoraviy va jiddiy uslubda tarjima qil."
      : mode === 'simple'
      ? "Oddiy, tushunarli, jonli xalq tilida tarjima qil."
      : "Asl ma'no, kontekst va barcha terminlarning to'g'ri o'rnini saqlagan holda yuqori darajada professional tarjima qil.";

    const prompt = `Sen professional poliglotsan. Matnni ${sourceLang} tilidan ${targetLang} tiliga tarjima qil.
Talablar:
- ${modePrompt}
- Ismlar, texnik atamalar va brend nomlarini noo'rin buzma.
- Agar biror jumlada ko'p ma'nolilik yoki noaniqlik bo'lsa, tarjima oxirida [Izoh: ...] sifatida qisqa eslatma kirit, ammo aslo "100% xatosiz" deb da'vo qilma.
- Javobni quyidagi JSON formatda qaytar:
{
  "translatedText": "tarjima matni",
  "detectedSource": "aniqlangan manba tili",
  "confidencePercent": 96,
  "notes": "agar bo'lsa noaniqlik yoki terminologik izoh, aks holda bo'sh qator"
}

Tarjima qilinadigan matn:
"""
${text.slice(0, 10000)}
"""`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let jsonResult;
    try {
      jsonResult = JSON.parse(response.text || '{}');
    } catch {
      jsonResult = {
        translatedText: response.text || "",
        detectedSource: sourceLang,
        confidencePercent: 92,
        notes: ""
      };
    }

    logActivity('Translator', 'success', `${sourceLang} -> ${targetLang}`);
    res.json(jsonResult);
  } catch (error: any) {
    console.error("Translate error:", error);
    logActivity('Translator', 'error', error.message || 'Xatolik');
    res.status(500).json({
      error: "Tarjima jarayonida xatolik yuz berdi: " + (error.message || "Server xatosi")
    });
  }
});

// Device Advisor endpoint
app.post('/api/ai/device-advisor', async (req, res) => {
  try {
    const {
      budget = 500,
      type = 'both',
      goals = [],
      gaming = false,
      camera = false,
      battery = false,
      studyWork = false,
      videoEditing = false,
      programming = false,
      portability = false,
      customQuery = '',
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "Gemini API kaliti topilmadi."
      });
    }

    const prompt = `Sen professional IT uskunalari, smartfon va noutbuklar bo'yicha ekspert sanalasan.
Foydalanuvchi talablari:
- Budjet: $${budget} atrofida (USD)
- Qurilma turi: ${type === 'phone' ? 'Faqat Telefon / Smartfon' : type === 'laptop' ? 'Faqat Noutbuk' : 'Telefon yoki Noutbuk'}
- Asosiy maqsadlar: ${goals.join(', ') || "Kundalik foydalanish va ish"}
- O'yinlar (Gaming): ${gaming ? "Ha, muhim (FPS va sovutish)" : "Muhim emas"}
- Kamera sifati: ${camera ? "Ha, eng yaxshi surat va video" : "O'rtacha yetadi"}
- Batareya va avtonomiya: ${battery ? "Ha, uzoq ishlashi shart" : "Standart"}
- O'qish va ish uchun: ${studyWork ? "Ha" : "Yo'q"}
- Video montaj / Dizayn: ${videoEditing ? "Ha, Premier/AfterEffects/Photoshop uchun kuchli resurs kerak" : "Yo'q"}
- Dasturlash (Programming): ${programming ? "Ha, Docker, IDE, kompilyatsiya uchun kuchli CPU va RAM (kamida 16GB) kerak" : "Yo'q"}
- Portativlik / Yengillik: ${portability ? "Ha, yengil va ixcham korpus" : "Muhim emas"}
- Foydalanuvchining qo'shimcha so'rovi: "${customQuery}"

Topshiriq:
Foydalanuvchining budjeti va talablariga eng mos keladigan 3 ta yoki 4 ta haqiqiy, bozorda mavjud qurilmalarni tanlab ber. Shunchaki bitta modelni "eng zo'ri" deb aytma, har birining o'z o'rni bo'lsin (masalan: "Eng yaxshi muvozanat", "O'yinlar uchun eng zo'r", "Eng tejamkor/narx-sifat").

Quyidagi qat'iy JSON formatida javob ber:
{
  "summary": "Foydalanuvchi talabiga qisqa ekspert xulosasi (o'zbek tilida)",
  "devices": [
    {
      "model": "Aniq model nomi, masalan: Redmi Note 13 Pro 5G yoki Lenovo LOQ 15",
      "deviceType": "Telefon yoki Noutbuk",
      "badge": "Masalan: 'Narx/Sifat Qiroli' yoki 'Eng yaxshi Kamera' yoki 'Dasturchilar tanlovi'",
      "approxPriceUsd": 280,
      "specs": {
        "cpu": "Protsessor nomi",
        "gpu": "Videokarta yoki grafik yadrosi",
        "ram": "Masalan: 12GB LPDDR5",
        "storage": "Masalan: 256GB UFS 3.1",
        "display": "Masalan: 6.67\" AMOLED 120Hz 1.5K",
        "battery": "Masalan: 5100 mAh, 67W tez zaryad"
      },
      "pros": ["Afzallik 1", "Afzallik 2", "Afzallik 3"],
      "cons": ["Kamchilik 1", "Kamchilik 2"],
      "bestFor": "Bu qurilma aynan kimlar uchun eng mosligi",
      "rating": 4.8
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    let result;
    try {
      result = JSON.parse(response.text || '{}');
    } catch {
      result = {
        summary: "Tavsiyalar tayyorlandi.",
        devices: []
      };
    }

    logActivity('Device Advisor', 'success', `Budjet: $${budget}, turi: ${type}`);
    res.json(result);
  } catch (error: any) {
    console.error("Device Advisor error:", error);
    logActivity('Device Advisor', 'error', error.message || 'Xatolik');
    res.status(500).json({
      error: "Qurilma tavsiyalarini tahlil qilishda xatolik yuz berdi: " + (error.message || "Server xatosi")
    });
  }
});

// Configure Vite middleware in development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[SmartTools AI] Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});

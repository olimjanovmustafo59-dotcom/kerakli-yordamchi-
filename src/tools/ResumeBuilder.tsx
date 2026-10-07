import React, { useState, useRef } from 'react';
import {
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Globe,
  Plus,
  Trash2,
  Download,
  Printer,
  Sparkles,
  RotateCcw,
  Check,
  Share2,
  Palette,
  Eye,
  FileText
} from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
}

interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  period: string;
  details: string;
}

interface ResumeData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  telegram: string;
  summary: string;
  skills: string[];
  languages: Array<{ name: string; level: string }>;
  experience: ExperienceItem[];
  education: EducationItem[];
}

const EMPTY_RESUME: ResumeData = {
  fullName: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  telegram: '',
  summary: '',
  skills: [],
  languages: [],
  experience: [],
  education: [],
};

const SAMPLE_RESUME: ResumeData = {
  fullName: 'Mustafo Olimjanov',
  title: 'Senior Frontend & Fullstack Dasturchi',
  email: 'olimjanovmustafo59@gmail.com',
  phone: '+998 90 123 45 67',
  location: 'Toshkent, O\'zbekiston',
  website: 'https://smarttools.uz',
  telegram: '@mustafo_dev',
  summary:
    '5+ yillik tajribaga ega dasturiy ta\'minot muhandisi. Zamonaviy TypeScript, React, Next.js, Node.js va sun\'iy intellekt texnologiyalaridan foydalangan holda keng ko\'lamli web tizimlar va qulay foydalanuvchi interfeyslarini yaratish bo\'yicha mutaxassis.',
  skills: [
    'React & Next.js',
    'TypeScript',
    'Tailwind CSS',
    'Node.js & Express',
    'PostgreSQL / MongoDB',
    'REST API & GraphQL',
    'AI Integratsiya (Gemini, OpenAI)',
    'Git & CI/CD'
  ],
  languages: [
    { name: "O'zbek tili", level: 'Ona tili' },
    { name: 'Ingliz tili', level: 'B2 / Kasbiy erkin' },
    { name: 'Rus tili', level: 'Erkin so\'zlashuv' }
  ],
  experience: [
    {
      id: '1',
      company: 'SmartTools AI Tech',
      role: 'Bosh Dasturchi (Lead Engineer)',
      period: '2023 - Hozirgi vaqt',
      description:
        'Ko\'p funksiyali AI utility platformasini noldan arxitekturasini ishlab chiqish, yuqori yuklamali API lar va interaktiv mijozlar vositalarini joriy qilish.'
    },
    {
      id: '2',
      company: 'Digital Innovation Hub',
      role: 'Frontend Dasturchi',
      period: '2021 - 2023',
      description:
        'Korxona boshqaruv tizimlari (ERP/CRM) uchun responsiv dashboard va tahliliy vizualizatsiya komponentlarini yaratish.'
    }
  ],
  education: [
    {
      id: '1',
      institution: 'Toshkent Axborot Texnologiyalari Universiteti (TATU)',
      degree: 'Dasturiy injiniring (Bakalavr)',
      period: '2019 - 2023',
      details: 'GPA: 4.8 / 5.0. Dasturiy ta\'minot arxitekturasi va ma\'lumotlar tuzilmalari.'
    }
  ]
};

export const ResumeBuilder: React.FC = () => {
  const [data, setData] = useState<ResumeData>(EMPTY_RESUME);
  const [skillInput, setSkillInput] = useState('');
  const [langNameInput, setLangNameInput] = useState('');
  const [langLevelInput, setLangLevelInput] = useState('B2 / Kasbiy');
  const [themeColor, setThemeColor] = useState('#4f46e5'); // Indigo
  const [template, setTemplate] = useState<'modern' | 'minimal' | 'executive' | 'creative'>('modern');
  const [copiedStatus, setCopiedStatus] = useState(false);

  const previewRef = useRef<HTMLDivElement | null>(null);

  const colorThemes = [
    { label: 'Indigo', color: '#4f46e5' },
    { label: 'Moviy', color: '#0284c7' },
    { label: 'Zumrad', color: '#059669' },
    { label: 'Klassik Slate', color: '#334155' },
    { label: 'Binafsha', color: '#7c3aed' },
    { label: 'To\'q Qora', color: '#0f172a' },
  ];

  // Add skill
  const handleAddSkill = () => {
    if (!skillInput.trim()) return;
    if (!data.skills.includes(skillInput.trim())) {
      setData({ ...data, skills: [...data.skills, skillInput.trim()] });
    }
    setSkillInput('');
  };

  // Remove skill
  const handleRemoveSkill = (skill: string) => {
    setData({ ...data, skills: data.skills.filter((s) => s !== skill) });
  };

  // Add Language
  const handleAddLanguage = () => {
    if (!langNameInput.trim()) return;
    setData({
      ...data,
      languages: [...data.languages, { name: langNameInput.trim(), level: langLevelInput }]
    });
    setLangNameInput('');
  };

  // Remove Language
  const handleRemoveLanguage = (index: number) => {
    setData({
      ...data,
      languages: data.languages.filter((_, i) => i !== index)
    });
  };

  // Add Experience
  const handleAddExperience = () => {
    const newItem: ExperienceItem = {
      id: Date.now().toString(),
      company: '',
      role: '',
      period: '',
      description: ''
    };
    setData({ ...data, experience: [newItem, ...data.experience] });
  };

  // Update Experience
  const handleUpdateExperience = (id: string, field: keyof ExperienceItem, val: string) => {
    setData({
      ...data,
      experience: data.experience.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    });
  };

  // Remove Experience
  const handleRemoveExperience = (id: string) => {
    setData({
      ...data,
      experience: data.experience.filter((item) => item.id !== id)
    });
  };

  // Add Education
  const handleAddEducation = () => {
    const newItem: EducationItem = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      period: '',
      details: ''
    };
    setData({ ...data, education: [newItem, ...data.education] });
  };

  // Update Education
  const handleUpdateEducation = (id: string, field: keyof EducationItem, val: string) => {
    setData({
      ...data,
      education: data.education.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    });
  };

  // Remove Education
  const handleRemoveEducation = (id: string) => {
    setData({
      ...data,
      education: data.education.filter((item) => item.id !== id)
    });
  };

  // Print CV
  const handlePrint = () => {
    window.print();
  };

  // Download PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryColor = themeColor;
    // Simple direct crisp text rendering
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 297, 'F');

    // Header bar
    const rgb = hexToRgb(primaryColor);
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.rect(0, 0, 210, 36, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text(data.fullName || 'F.I.SH.', 15, 18);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(data.title || 'Mutaxassislik unvoni', 15, 26);

    // Contact info bar
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    let curY = 44;
    const contacts = [
      data.email,
      data.phone,
      data.location,
      data.telegram,
      data.website
    ].filter(Boolean);

    doc.text(contacts.join('  •  '), 15, curY);

    curY += 8;
    doc.setDrawColor(220, 220, 220);
    doc.line(15, curY, 195, curY);
    curY += 8;

    // Summary
    if (data.summary) {
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text("QISQACHA MA'LUMOT", 15, curY);
      curY += 6;

      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      const splitSummary = doc.splitTextToSize(data.summary, 180);
      doc.text(splitSummary, 15, curY);
      curY += splitSummary.length * 5 + 6;
    }

    // Experience
    if (data.experience.length > 0) {
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('ISH TAJRIBASI', 15, curY);
      curY += 6;

      data.experience.forEach((exp) => {
        if (!exp.company && !exp.role) return;
        doc.setTextColor(20, 20, 20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`${exp.role || 'Lavozim'} — ${exp.company || 'Kompaniya'}`, 15, curY);

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(120, 120, 120);
        if (exp.period) doc.text(exp.period, 195, curY, { align: 'right' });
        curY += 5;

        if (exp.description) {
          doc.setTextColor(60, 60, 60);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          const splitDesc = doc.splitTextToSize(exp.description, 180);
          doc.text(splitDesc, 15, curY);
          curY += splitDesc.length * 4.5 + 4;
        }
      });
      curY += 4;
    }

    // Education
    if (data.education.length > 0) {
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text("TA'LIM", 15, curY);
      curY += 6;

      data.education.forEach((edu) => {
        if (!edu.institution && !edu.degree) return;
        doc.setTextColor(20, 20, 20);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text(`${edu.degree || 'Daraja'} — ${edu.institution || 'Ta\'lim muassasasi'}`, 15, curY);

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(120, 120, 120);
        if (edu.period) doc.text(edu.period, 195, curY, { align: 'right' });
        curY += 5;

        if (edu.details) {
          doc.setTextColor(60, 60, 60);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          const splitDetails = doc.splitTextToSize(edu.details, 180);
          doc.text(splitDetails, 15, curY);
          curY += splitDetails.length * 4.5 + 4;
        }
      });
      curY += 4;
    }

    // Skills
    if (data.skills.length > 0) {
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text("KO'NIKMALAR", 15, curY);
      curY += 6;

      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const skillText = data.skills.join('  •  ');
      const splitSkills = doc.splitTextToSize(skillText, 180);
      doc.text(splitSkills, 15, curY);
      curY += splitSkills.length * 5 + 4;
    }

    // Languages
    if (data.languages.length > 0) {
      doc.setTextColor(rgb.r, rgb.g, rgb.b);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text('TILLAR', 15, curY);
      curY += 6;

      doc.setTextColor(50, 50, 50);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const langStr = data.languages.map((l) => `${l.name} (${l.level})`).join('  •  ');
      doc.text(langStr, 15, curY);
    }

    const safeName = (data.fullName || 'Rezyume').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`${safeName}-CV.pdf`);
  };

  const hexToRgb = (hex: string) => {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
      clean = clean.split('').map((c) => c + c).join('');
    }
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Professional Rezyume / CV Yaratuvchi
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Yangi Imkoniyat
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ATS-friendly standart, A4 PDF yuklab olish, zamonaviy uslublar va bir zumda to'ldirish
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setData(SAMPLE_RESUME)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold hover:bg-indigo-100 transition cursor-pointer"
            title="Namunaviy ma'lumotlar bilan to'ldirish"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Namuna bilan to'ldirish
          </button>

          <button
            type="button"
            onClick={() => setData(EMPTY_RESUME)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-rose-600 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Barcha kiritilgan ma'lumotlarni tozalash"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Tozalash
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            PDF Yuklash
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Editor */}
        <div className="lg:col-span-6 space-y-4">
          {/* Section 1: Personal Info */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5" />
              1. Shaxsiy ma'lumotlar
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ism va Familiya
                </label>
                <input
                  type="text"
                  value={data.fullName}
                  onChange={(e) => setData({ ...data, fullName: e.target.value })}
                  placeholder="Masalan: Mustafo Olimjanov"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mutaxassislik unvoni
                </label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  placeholder="Masalan: Frontend Dasturchi / Iqtisodchi"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  placeholder="pochta@misol.uz"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Telefon raqam
                </label>
                <input
                  type="text"
                  value={data.phone}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                  placeholder="+998 90 123 45 67"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Shahar / Manzil
                </label>
                <input
                  type="text"
                  value={data.location}
                  onChange={(e) => setData({ ...data, location: e.target.value })}
                  placeholder="Toshkent, O'zbekiston"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Telegram yoki Portfolio havola
                </label>
                <input
                  type="text"
                  value={data.telegram}
                  onChange={(e) => setData({ ...data, telegram: e.target.value })}
                  placeholder="@foydalanuvchi yoki https://..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Qisqacha o'zingiz haqingizda (Summary)
              </label>
              <textarea
                rows={3}
                value={data.summary}
                onChange={(e) => setData({ ...data, summary: e.target.value })}
                placeholder="Kasbiy tajribangiz, asosiy maqsadlaringiz va kuchli tomonlaringizni 2-3 jumlada yozing..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Section 2: Work Experience */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                2. Ish tajribasi
              </h2>
              <button
                type="button"
                onClick={handleAddExperience}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Ish joyi qo'shish
              </button>
            </div>

            {data.experience.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Hozircha ish tajribasi kiritilmagan. Yuqoridagi "+ Ish joyi qo'shish" tugmasini bosing.
              </p>
            ) : (
              <div className="space-y-3">
                {data.experience.map((exp, idx) => (
                  <div
                    key={exp.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveExperience(exp.id)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-rose-500 p-1"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                      <input
                        type="text"
                        placeholder="Kompaniya yoki tashkilot"
                        value={exp.company}
                        onChange={(e) => handleUpdateExperience(exp.id, 'company', e.target.value)}
                        className="text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                      <input
                        type="text"
                        placeholder="Lavozim (masalan: Menejer)"
                        value={exp.role}
                        onChange={(e) => handleUpdateExperience(exp.id, 'role', e.target.value)}
                        className="text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Ishlagan davr (masalan: 2022 - 2024)"
                      value={exp.period}
                      onChange={(e) => handleUpdateExperience(exp.id, 'period', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <textarea
                      rows={2}
                      placeholder="Bajarilgan asosiy vazifalar va natijalar..."
                      value={exp.description}
                      onChange={(e) => handleUpdateExperience(exp.id, 'description', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Education */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                3. Ta'lim & Kurslar
              </h2>
              <button
                type="button"
                onClick={handleAddEducation}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Ta'lim qo'shish
              </button>
            </div>

            {data.education.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Ta'lim ma'lumotlari kiritilmagan.
              </p>
            ) : (
              <div className="space-y-3">
                {data.education.map((edu) => (
                  <div
                    key={edu.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(edu.id)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-rose-500 p-1"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pr-6">
                      <input
                        type="text"
                        placeholder="Universitet / Maktab / Kurs"
                        value={edu.institution}
                        onChange={(e) => handleUpdateEducation(edu.id, 'institution', e.target.value)}
                        className="text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                      <input
                        type="text"
                        placeholder="Mutaxassislik / Daraja"
                        value={edu.degree}
                        onChange={(e) => handleUpdateEducation(edu.id, 'degree', e.target.value)}
                        className="text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="O'qigan davr (masalan: 2018 - 2022)"
                      value={edu.period}
                      onChange={(e) => handleUpdateEducation(edu.id, 'period', e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Skills & Languages */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              4. Ko'nikmalar & Tillar
            </h2>

            {/* Skills tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kasbiy ko'nikmalar (Skills)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ko'nikma kiriting va Enter bosing (masalan: Photoshop, Excel)..."
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  Qo'shish
                </button>
              </div>

              {/* Skills list badges */}
              <div className="flex flex-wrap gap-1.5 mt-2.5">
                {data.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-rose-500 font-bold ml-1 text-sm"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Xorijiy tillar
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Til nomi (Ingliz, Rus...)"
                  value={langNameInput}
                  onChange={(e) => setLangNameInput(e.target.value)}
                  className="text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <select
                  value={langLevelInput}
                  onChange={(e) => setLangLevelInput(e.target.value)}
                  className="text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="Ona tili">Ona tili</option>
                  <option value="B2 / Kasbiy">B2 / Kasbiy</option>
                  <option value="C1 / Erkin">C1 / Erkin</option>
                  <option value="B1 / O'rta">B1 / O'rta</option>
                  <option value="Boshlang'ich (A1-A2)">Boshlang'ich</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddLanguage}
                  className="px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
                >
                  Til qo'shish
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {data.languages.map((l, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  >
                    <strong>{l.name}</strong>: {l.level}
                    <button
                      type="button"
                      onClick={() => handleRemoveLanguage(i)}
                      className="hover:text-rose-500 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live A4 Preview & Customization */}
        <div className="lg:col-span-6 space-y-4">
          {/* Customization controls */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Rang mavzusi:
              </span>
              <div className="flex items-center gap-2">
                {colorThemes.map((c) => (
                  <button
                    key={c.color}
                    type="button"
                    onClick={() => setThemeColor(c.color)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      themeColor === c.color ? 'scale-125 ring-2 ring-indigo-500' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: c.color }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Live A4 Sheet Preview Container */}
          <div className="p-3 bg-slate-200/70 dark:bg-slate-950 rounded-2xl border border-slate-300 dark:border-slate-800 overflow-x-auto shadow-inner flex justify-center">
            <div
              ref={previewRef}
              className="w-full max-w-[540px] min-h-[760px] bg-white text-slate-900 p-8 rounded-lg shadow-xl border border-slate-300 flex flex-col justify-between font-sans leading-normal"
            >
              <div>
                {/* Header with Theme Color */}
                <div
                  className="p-5 rounded-xl text-white mb-6 transition-colors"
                  style={{ backgroundColor: themeColor }}
                >
                  <h2 className="text-xl font-extrabold tracking-tight">
                    {data.fullName || 'Ism va Familiya'}
                  </h2>
                  <p className="text-xs opacity-90 font-medium mt-0.5">
                    {data.title || 'Mutaxassislik yo\'nalishi'}
                  </p>

                  <div className="mt-3 pt-3 border-t border-white/20 flex flex-wrap gap-x-4 gap-y-1 text-[11px] opacity-95">
                    {data.email && <span>✉ {data.email}</span>}
                    {data.phone && <span>📞 {data.phone}</span>}
                    {data.location && <span>📍 {data.location}</span>}
                    {data.telegram && <span>✈ {data.telegram}</span>}
                  </div>
                </div>

                {/* Summary */}
                {data.summary && (
                  <div className="mb-5">
                    <h3
                      className="text-xs font-bold uppercase tracking-wider mb-1.5 pb-1 border-b"
                      style={{ color: themeColor, borderColor: `${themeColor}40` }}
                    >
                      Haqida
                    </h3>
                    <p className="text-[11px] text-slate-700 leading-relaxed">
                      {data.summary}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {data.experience.length > 0 && (
                  <div className="mb-5">
                    <h3
                      className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b"
                      style={{ color: themeColor, borderColor: `${themeColor}40` }}
                    >
                      Ish Tajribasi
                    </h3>
                    <div className="space-y-3">
                      {data.experience.map((exp) => (
                        <div key={exp.id}>
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs font-bold text-slate-900">
                              {exp.role || 'Lavozim'} — <span className="font-semibold text-slate-700">{exp.company}</span>
                            </span>
                            <span className="text-[10px] text-slate-500 italic">{exp.period}</span>
                          </div>
                          {exp.description && (
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {data.education.length > 0 && (
                  <div className="mb-5">
                    <h3
                      className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b"
                      style={{ color: themeColor, borderColor: `${themeColor}40` }}
                    >
                      Ta'lim
                    </h3>
                    <div className="space-y-2">
                      {data.education.map((edu) => (
                        <div key={edu.id}>
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs font-bold text-slate-900">
                              {edu.degree || 'Daraja'}
                            </span>
                            <span className="text-[10px] text-slate-500 italic">{edu.period}</span>
                          </div>
                          <p className="text-[11px] text-slate-700">{edu.institution}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {data.skills.length > 0 && (
                  <div className="mb-5">
                    <h3
                      className="text-xs font-bold uppercase tracking-wider mb-2 pb-1 border-b"
                      style={{ color: themeColor, borderColor: `${themeColor}40` }}
                    >
                      Ko'nikmalar
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {data.skills.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {data.languages.length > 0 && (
                  <div>
                    <h3
                      className="text-xs font-bold uppercase tracking-wider mb-1.5 pb-1 border-b"
                      style={{ color: themeColor, borderColor: `${themeColor}40` }}
                    >
                      Tillar
                    </h3>
                    <div className="flex flex-wrap gap-3 text-[11px] text-slate-700">
                      {data.languages.map((l, i) => (
                        <span key={i}>
                          <strong>{l.name}:</strong> {l.level}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Watermark / Footer */}
              <div className="mt-8 pt-2 border-t border-slate-200 text-center text-[9px] text-slate-400">
                SmartTools AI orqali yaratildi • {new Date().getFullYear()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

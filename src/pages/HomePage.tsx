import React from 'react';
import {
  Sparkles,
  Search,
  Star,
  ArrowRight,
  FileText,
  ScanText,
  Languages,
  Laptop,
  QrCode,
  Image as ImageIcon,
  Barcode,
  Files,
  PenTool,
  ArrowRightLeft,
  SlidersHorizontal,
  Calculator,
  Code,
  Palette,
  ShieldCheck,
  Settings,
  Flame,
  LayoutGrid
} from 'lucide-react';
import { ToolCategory, ToolDefinition } from '../types';
import { TOOLS_LIST, CATEGORIES } from '../utils/toolsData';

interface HomePageProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: ToolCategory;
  onSelectCategory: (cat: ToolCategory) => void;
  onSelectTool: (id: string) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  recentTools: string[];
}

export const HomePage: React.FC<HomePageProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onSelectTool,
  favorites,
  onToggleFavorite,
  recentTools,
}) => {
  const getToolIcon = (name: string) => {
    const iconClass = "w-6 h-6 transition-transform group-hover:scale-110";
    switch (name) {
      case 'FileText': return <FileText className={`${iconClass} text-violet-500`} />;
      case 'ScanText': return <ScanText className={`${iconClass} text-cyan-500`} />;
      case 'Languages': return <Languages className={`${iconClass} text-blue-500`} />;
      case 'Laptop': return <Laptop className={`${iconClass} text-indigo-500`} />;
      case 'QrCode': return <QrCode className={`${iconClass} text-emerald-500`} />;
      case 'Image': return <ImageIcon className={`${iconClass} text-teal-500`} />;
      case 'Barcode': return <Barcode className={`${iconClass} text-blue-600`} />;
      case 'Files': return <Files className={`${iconClass} text-rose-500`} />;
      case 'PenTool': return <PenTool className={`${iconClass} text-purple-500`} />;
      case 'ArrowRightLeft': return <ArrowRightLeft className={`${iconClass} text-emerald-600`} />;
      case 'SlidersHorizontal': return <SlidersHorizontal className={`${iconClass} text-pink-500`} />;
      case 'Calculator': return <Calculator className={`${iconClass} text-amber-500`} />;
      case 'Code': return <Code className={`${iconClass} text-cyan-600`} />;
      case 'Palette': return <Palette className={`${iconClass} text-purple-600`} />;
      case 'ShieldCheck': return <ShieldCheck className={`${iconClass} text-emerald-600`} />;
      case 'Settings': return <Settings className={`${iconClass} text-amber-500`} />;
      default: return <Sparkles className={`${iconClass} text-indigo-500`} />;
    }
  };

  // Filter tools by category and search query (name, tags, description)
  const filteredTools = TOOLS_LIST.filter((tool) => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const inName = tool.name.toLowerCase().includes(q);
    const inDesc = tool.shortDesc.toLowerCase().includes(q);
    const inTags = tool.tags.some((tag) => tag.toLowerCase().includes(q));

    return inName || inDesc || inTags;
  });

  const popularSuggestions = ['QR', 'PDF', 'telefon', 'kalkulyator', 'ocr', 'tarjima', 'parol'];

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-8 sm:p-12 text-white shadow-2xl border border-indigo-800/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            Universal Utility & Sun'iy Intellekt Platformasi
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Har qanday vazifa uchun{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-indigo-200 to-white bg-clip-text text-transparent">
              aqlli vositalar
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            QR Code Pro, Barcode, Document AI, OCR, Rasm muharriri, PDF Tools, Universal Kalkulyator,
            Tarjimon va Qurilma maslahatchisi — barchasi bir joyda, tezkor va xavfsiz.
          </p>

          {/* Large Hero Search Bar */}
          <div className="pt-2">
            <div className="relative max-w-2xl">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Kerakli vositani qidiring: 'QR', 'PDF', 'telefon', 'kalkulyator'..."
                className="w-full pl-12 pr-4 py-3.5 text-sm rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder:text-slate-400 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              />
            </div>

            {/* Quick Keyword Pills */}
            <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-300">
              <span className="text-[11px] text-slate-400">Ommabop qidiruvlar:</span>
              {popularSuggestions.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onSearchChange(tag)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] transition cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id as ToolCategory)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-2 ${
              selectedCategory === cat.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Mavjud Vositalar</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {filteredTools.length}
            </span>
          </h2>
        </div>

        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTools.map((tool) => {
              const isFav = favorites.includes(tool.id);
              return (
                <div
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id)}
                  className="group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200 flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    {/* Top Row: Icon + Badge + Favorite */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 transition">
                        {getToolIcon(tool.iconName)}
                      </div>

                      <div className="flex items-center gap-1">
                        {tool.badge && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
                            {tool.badge}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(tool.id);
                          }}
                          className="p-1 rounded-lg text-slate-300 hover:text-amber-500 dark:text-slate-700 dark:hover:text-amber-400 transition"
                          title={isFav ? "Sevimlilardan o'chirish" : "Sevimlilarga qo'shish"}
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Tool Name & Description */}
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {tool.shortDesc}
                    </p>
                  </div>

                  {/* Card Footer Link */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition">
                    <span>Ochish</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <Search className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              "{searchQuery}" bo'yicha hech qanday vosita topilmadi
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Iltimos, boshqa kalit so'z bilan urinib ko'ring (masalan: "QR", "PDF", "kalkulyator" yoki "telefon").
            </p>
            <button
              onClick={() => {
                onSearchChange('');
                onSelectCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
            >
              Barcha vositalarni ko'rsatish
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

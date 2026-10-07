import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Sun,
  Moon,
  Heart,
  MessageSquare,
  Shield,
  Menu,
  X,
  Globe,
  Check
} from 'lucide-react';

interface NavbarProps {
  currentTheme: 'dark' | 'light';
  onToggleTheme: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenFeedback: () => void;
  favoritesCount: number;
  onSelectTool: (toolId: string) => void;
  onToggleSidebar: () => void;
  activeToolId: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTheme,
  onToggleTheme,
  searchQuery,
  onSearchChange,
  onOpenFeedback,
  favoritesCount,
  onSelectTool,
  onToggleSidebar,
  activeToolId,
}) => {
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<'uz' | 'ru' | 'en'>('uz');

  const languages = [
    { code: 'uz', label: "O'zbekcha", flag: '🇺🇿' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Menyu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => onSelectTool('home')}
            className="flex items-center gap-2.5 group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition duration-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-700 dark:from-white dark:via-indigo-200 dark:to-cyan-300 bg-clip-text text-transparent">
                  SmartTools
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-300 font-normal leading-none hidden sm:block">
                Ko'p funksiyali platforma
              </p>
            </div>
          </button>
        </div>

        {/* Middle: Quick Search */}
        <div className="flex-1 max-w-md hidden md:block">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Qidirish: 'QR', 'PDF', 'telefon', 'noutbuk'..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-transparent focus:border-indigo-500/50 dark:focus:border-indigo-500/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-600 dark:placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Admin shortcut with live indicator */}
          <button
            onClick={() => onSelectTool('admin_panel')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              activeToolId === 'admin_panel'
                ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60'
            }`}
            title="Admin panel (olimjanovmustafo59@gmail.com)"
          >
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px]">Admin</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </button>

          {/* Feedback Button */}
          <button
            onClick={onOpenFeedback}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Fikr bildirish"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden lg:inline text-[11px]">Fikr-mulohaza</span>
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 text-xs"
              title="Tilni tanlash"
            >
              <Globe className="w-4 h-4" />
              <span className="font-semibold uppercase text-[10px]">{currentLang}</span>
            </button>

            {langOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-50 text-xs">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setCurrentLang(l.code as any);
                      setLangOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition"
                  >
                    <span className="flex items-center gap-2">
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </span>
                    {currentLang === l.code && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={currentTheme === 'dark' ? 'Yorug\' rejimga o\'tish' : 'Tungi rejimga o\'tish'}
            aria-label="Mavzuni almashtirish"
          >
            {currentTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import {
  LayoutGrid,
  Sparkles,
  QrCode,
  FileText,
  Image as ImageIcon,
  Calculator,
  Code,
  ShieldCheck,
  Star,
  Clock,
  ChevronRight,
  X,
  Laptop,
  ScanText,
  Languages,
  Files,
  PenTool,
  ArrowRightLeft,
  SlidersHorizontal,
  Settings,
  Barcode
} from 'lucide-react';
import { ToolCategory, ToolDefinition } from '../types';
import { CATEGORIES, TOOLS_LIST } from '../utils/toolsData';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: ToolCategory;
  onSelectCategory: (cat: ToolCategory) => void;
  activeToolId: string;
  onSelectTool: (id: string) => void;
  favorites: string[];
  recentTools: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  onSelectCategory,
  activeToolId,
  onSelectTool,
  favorites,
  recentTools,
}) => {
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'all': return <LayoutGrid className="w-4 h-4" />;
      case 'ai': return <Sparkles className="w-4 h-4 text-violet-500" />;
      case 'qr_barcode': return <QrCode className="w-4 h-4 text-emerald-500" />;
      case 'documents': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-rose-500" />;
      case 'calculators': return <Calculator className="w-4 h-4 text-amber-500" />;
      case 'developer': return <Code className="w-4 h-4 text-cyan-500" />;
      case 'security': return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      default: return <LayoutGrid className="w-4 h-4" />;
    }
  };

  const getToolIcon = (name: string) => {
    switch (name) {
      case 'FileText': return <FileText className="w-3.5 h-3.5" />;
      case 'ScanText': return <ScanText className="w-3.5 h-3.5" />;
      case 'Languages': return <Languages className="w-3.5 h-3.5" />;
      case 'Laptop': return <Laptop className="w-3.5 h-3.5" />;
      case 'QrCode': return <QrCode className="w-3.5 h-3.5" />;
      case 'Image': return <ImageIcon className="w-3.5 h-3.5" />;
      case 'Barcode': return <Barcode className="w-3.5 h-3.5" />;
      case 'Files': return <Files className="w-3.5 h-3.5" />;
      case 'PenTool': return <PenTool className="w-3.5 h-3.5" />;
      case 'ArrowRightLeft': return <ArrowRightLeft className="w-3.5 h-3.5" />;
      case 'SlidersHorizontal': return <SlidersHorizontal className="w-3.5 h-3.5" />;
      case 'Calculator': return <Calculator className="w-3.5 h-3.5" />;
      case 'Code': return <Code className="w-3.5 h-3.5" />;
      case 'Palette': return <Sparkles className="w-3.5 h-3.5" />;
      case 'ShieldCheck': return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'Settings': return <Settings className="w-3.5 h-3.5" />;
      default: return <LayoutGrid className="w-3.5 h-3.5" />;
    }
  };

  const favoriteToolObjects = TOOLS_LIST.filter((t) => favorites.includes(t.id));
  const recentToolObjects = recentTools
    .map((id) => TOOLS_LIST.find((t) => t.id === id))
    .filter(Boolean) as ToolDefinition[];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 z-40 h-full lg:h-[calc(100vh-4rem)] w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 overflow-y-auto transition-transform duration-300 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between lg:hidden mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
            Bo'limlar va Vositalar
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Categories */}
        <div className="space-y-1 mb-6">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 px-2.5 mb-2">
            Kategoriyalar
          </p>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id && activeToolId === 'home';
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id as ToolCategory);
                  onSelectTool('home');
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                  isSelected
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {getCategoryIcon(cat.id)}
                  <span>{cat.label}</span>
                </div>
                {isSelected && <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />}
              </button>
            );
          })}
        </div>

        {/* Favorites Section */}
        {favoriteToolObjects.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between px-2.5 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                Sevimlilar
              </span>
              <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                {favoriteToolObjects.length}
              </span>
            </div>
            <div className="space-y-0.5">
              {favoriteToolObjects.slice(0, 5).map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    onSelectTool(tool.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
                    activeToolId === tool.id
                      ? 'bg-indigo-600 text-white font-medium shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {getToolIcon(tool.iconName)}
                    <span className="truncate">{tool.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recent Tools */}
        {recentToolObjects.length > 0 && (
          <div className="mb-6">
            <div className="px-2.5 mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              <Clock className="w-3 h-3" />
              So'nggi vositalar
            </div>
            <div className="space-y-0.5">
              {recentToolObjects.slice(0, 4).map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    onSelectTool(tool.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition ${
                    activeToolId === tool.id
                      ? 'bg-indigo-600 text-white font-medium shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {getToolIcon(tool.iconName)}
                    <span className="truncate">{tool.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Footer info */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 px-2 text-[11px] text-slate-600 dark:text-slate-300">
          <p className="font-semibold text-slate-600 dark:text-slate-300">SmartTools AI v2.5</p>
          <p className="mt-1">Xavfsiz & Client-side birinchi</p>
          <div className="mt-2 flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Tizim to'liq onlayn
          </div>
        </div>
      </aside>
    </>
  );
};

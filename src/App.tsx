import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import { FeedbackModal } from './components/FeedbackModal';
import { HomePage } from './pages/HomePage';

// Tools
import { QRCodePro } from './tools/QRCodePro';
import { ImageToQR } from './tools/ImageToQR';
import { BarcodeGenerator } from './tools/BarcodeGenerator';
import { DocumentAI } from './tools/DocumentAI';
import { OCRTool } from './tools/OCRTool';
import { ImageEditor } from './tools/ImageEditor';
import { FontStudio } from './tools/FontStudio';
import { PDFTools } from './tools/PDFTools';
import { ResumeBuilder } from './tools/ResumeBuilder';
import { TranslatorAI } from './tools/TranslatorAI';
import { DeviceAdvisor } from './tools/DeviceAdvisor';
import { TextTools } from './tools/TextTools';
import { FileConverter } from './tools/FileConverter';
import { PasswordGenerator } from './tools/PasswordGenerator';
import { ColorTools } from './tools/ColorTools';
import { AdminPanel } from './tools/AdminPanel';

import { ToolCategory } from './types';
import { TOOLS_LIST } from './utils/toolsData';
import {
  getFavoriteTools,
  toggleFavoriteTool,
  getRecentTools,
  addRecentTool,
  getStoredTheme,
  setStoredTheme
} from './utils/storage';
import { sendVisitHeartbeat } from './utils/analytics';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('light');
  const [activeToolId, setActiveToolId] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [feedbackOpen, setFeedbackOpen] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentTools, setRecentTools] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initialize theme, favorites, recent, and analytics
  useEffect(() => {
    const savedTheme = getStoredTheme();
    setTheme(savedTheme);
    setStoredTheme(savedTheme);

    setFavorites(getFavoriteTools());
    setRecentTools(getRecentTools());

    // Initial visit tracking
    sendVisitHeartbeat('home', 'Bosh sahifa');

    // Heartbeat every 35 seconds to keep online status active
    const heartbeatTimer = setInterval(() => {
      const activeDef = TOOLS_LIST.find((t) => t.id === activeToolId);
      sendVisitHeartbeat(activeToolId, activeDef ? activeDef.name : 'Bosh sahifa');
    }, 35000);

    return () => clearInterval(heartbeatTimer);
  }, []);

  // Track tool change in analytics
  useEffect(() => {
    const activeDef = TOOLS_LIST.find((t) => t.id === activeToolId);
    sendVisitHeartbeat(activeToolId, activeDef ? activeDef.name : 'Bosh sahifa');
  }, [activeToolId]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    setStoredTheme(nextTheme);
  };

  const handleSelectTool = (toolId: string) => {
    setActiveToolId(toolId);
    if (toolId !== 'home') {
      addRecentTool(toolId);
      setRecentTools(getRecentTools());
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleFavorite = (toolId: string) => {
    const updated = toggleFavoriteTool(toolId);
    setFavorites(updated);
    const tool = TOOLS_LIST.find((t) => t.id === toolId);
    if (tool) {
      const isFav = updated.includes(toolId);
      showToast({
        id: Math.random().toString(),
        type: isFav ? 'success' : 'info',
        title: isFav ? "Sevimlilarga qo'shildi" : "Sevimlilardan o'chirildi",
        message: `${tool.name} ${isFav ? 'sevimlilar ro\'yxatingizga kiritildi.' : 'olib tashlandi.'}`,
      });
    }
  };

  const showToast = (toast: ToastMessage) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const activeToolDef = TOOLS_LIST.find((t) => t.id === activeToolId);

  // Render tool component
  const renderActiveTool = () => {
    switch (activeToolId) {
      case 'qr_pro': return <QRCodePro />;
      case 'image_to_qr': return <ImageToQR />;
      case 'barcode': return <BarcodeGenerator />;
      case 'doc_ai': return <DocumentAI />;
      case 'ocr': return <OCRTool />;
      case 'image_editor': return <ImageEditor />;
      case 'font_studio': return <FontStudio />;
      case 'pdf_tools': return <PDFTools />;
      case 'resume_builder': return <ResumeBuilder />;
      case 'translator': return <TranslatorAI />;
      case 'device_advisor': return <DeviceAdvisor />;
      case 'text_tools': return <TextTools />;
      case 'file_converter': return <FileConverter />;
      case 'password_generator': return <PasswordGenerator />;
      case 'color_tools': return <ColorTools />;
      case 'admin_panel': return <AdminPanel />;
      default:
        return (
          <HomePage
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onSelectTool={handleSelectTool}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            recentTools={recentTools}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTheme={theme}
        onToggleTheme={handleToggleTheme}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (activeToolId !== 'home') setActiveToolId('home');
        }}
        onOpenFeedback={() => setFeedbackOpen(true)}
        favoritesCount={favorites.length}
        onSelectTool={handleSelectTool}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeToolId={activeToolId}
      />

      {/* Main Layout: Sidebar Left, Content Center */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            if (activeToolId !== 'home') setActiveToolId('home');
          }}
          activeToolId={activeToolId}
          onSelectTool={handleSelectTool}
          favorites={favorites}
          recentTools={recentTools}
        />

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
          {/* Breadcrumb if inside a tool */}
          {activeToolId !== 'home' && activeToolDef && (
            <div className="mb-5 flex items-center justify-between">
              <nav className="flex items-center gap-2 text-xs text-slate-500">
                <button
                  onClick={() => setActiveToolId('home')}
                  className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
                >
                  <Home className="w-3.5 h-3.5" />
                  Bosh sahifa
                </button>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {activeToolDef.name}
                </span>
              </nav>

              <button
                onClick={() => setActiveToolId('home')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Bosh sahifaga qaytish
              </button>
            </div>
          )}

          {renderActiveTool()}
        </main>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onSuccess={(msg) => {
          showToast({
            id: Math.random().toString(),
            type: 'success',
            title: 'Qabul qilindi',
            message: msg,
          });
        }}
      />

      {/* Toast notifications */}
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

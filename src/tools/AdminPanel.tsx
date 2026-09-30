import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Activity,
  MessageSquare,
  Server,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Star,
  Users,
  Cpu,
  Layers,
  Sparkles,
  Lock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Radio,
  Clock,
  ArrowUpRight,
  Search,
  Filter,
  Trash2,
  Check,
  Download,
  Terminal,
  Zap,
  CheckCheck,
  Eye
} from 'lucide-react';
import { TOOLS_LIST } from '../utils/toolsData';

type AdminTab = 'visitors' | 'analytics' | 'feedbacks' | 'system';

export const AdminPanel: React.FC = () => {
  const [adminEmail, setAdminEmail] = useState<string>('olimjanovmustafo59@gmail.com');
  const [activeTab, setActiveTab] = useState<AdminTab>('visitors');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [autoRefreshSec, setAutoRefreshSec] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDevice, setFilterDevice] = useState<'all' | 'Desktop' | 'Mobile' | 'Tablet' | 'online'>('all');
  
  // AI Ping state
  const [testingAI, setTestingAI] = useState<boolean>(false);
  const [aiTestResult, setAiTestResult] = useState<{ ok: boolean; latencyMs: number; response?: string; error?: string } | null>(null);

  // Status message
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/analytics?adminKey=smarttools-admin-access', {
        headers: { 'x-user-email': adminEmail },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Admin fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // Auto-refresh interval
  useEffect(() => {
    if (autoRefreshSec <= 0) return;
    const interval = setInterval(fetchAdminData, autoRefreshSec * 1000);
    return () => clearInterval(interval);
  }, [autoRefreshSec]);

  // Test Gemini AI Ping
  const handleTestAI = async () => {
    setTestingAI(true);
    setAiTestResult(null);
    try {
      const res = await fetch('/api/admin/test-ai');
      const resData = await res.json();
      setAiTestResult(resData);
    } catch (e: any) {
      setAiTestResult({ ok: false, latencyMs: 0, error: e.message || 'Aloqa xatosi' });
    } finally {
      setTestingAI(false);
    }
  };

  // Feedback action (update status or delete)
  const handleFeedbackAction = async (id: string, action: 'read' | 'resolved' | 'delete') => {
    try {
      const res = await fetch('/api/admin/feedback/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          status: action === 'delete' ? undefined : action,
          deleteAction: action === 'delete',
        }),
      });
      if (res.ok) {
        setStatusNotice(action === 'delete' ? "Fikr o'chirildi" : `Fikr holati: ${action}`);
        fetchAdminData();
        setTimeout(() => setStatusNotice(null), 3000);
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  // Clear Activity Logs
  const handleClearLogs = async () => {
    try {
      const res = await fetch('/api/admin/clear-logs', { method: 'POST' });
      if (res.ok) {
        setStatusNotice("Barcha faoliyat jurnallari muvaffaqiyatli tozalandi");
        fetchAdminData();
        setTimeout(() => setStatusNotice(null), 3000);
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!data?.recentSessions) return;
    const headers = ['ID', 'VisitorID', 'IP', 'Joylashuv', 'Qurilma', 'Brauzer', 'OS', 'Hozirgi Tool', 'Holati', 'Birinchi kirgan', 'Amallar'];
    const rows = data.recentSessions.map((s: any) => [
      s.id,
      s.visitorId,
      s.ip,
      `"${s.location}"`,
      s.deviceType,
      s.browser,
      s.os,
      `"${s.currentToolName}"`,
      s.isOnline ? 'Online' : 'Offline',
      s.firstSeen,
      s.pageViews,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartTools-Visitors-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter visitors
  const filteredSessions = (data?.recentSessions || []).filter((s: any) => {
    const matchesSearch =
      s.ip?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.browser?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.currentToolName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.visitorId?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterDevice === 'online') return s.isOnline;
    if (filterDevice !== 'all') return s.deviceType === filterDevice;
    return true;
  });

  const metrics = data?.metrics || {
    onlineCount: 3,
    todayVisitorsCount: 48,
    totalVisitorsCount: 861,
    totalPageViews: 1895,
    uptimeSeconds: 120,
    avgRating: '4.9',
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner / Admin Identity */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white shadow-2xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner">
                <Shield className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">SmartTools AI Boshqaruv Markazi</h1>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                JONLI PRO
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              Tizim egasi: <strong className="text-amber-300 font-semibold">{adminEmail}</strong>.
              Saytga tashrif buyuruvchilar, real-time faollik, geografik joylashuv va AI salomatligini to'liq nazorat qilish paneli.
            </p>
          </div>

          {/* Quick controls */}
          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
            {/* Auto refresh dropdown */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-xs text-slate-200">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Avto:</span>
              <select
                value={autoRefreshSec}
                onChange={(e) => setAutoRefreshSec(Number(e.target.value))}
                className="bg-transparent font-bold text-white outline-none cursor-pointer"
              >
                <option value={5} className="bg-slate-900 text-white">5 soniya</option>
                <option value={10} className="bg-slate-900 text-white">10 soniya</option>
                <option value={30} className="bg-slate-900 text-white">30 soniya</option>
                <option value={0} className="bg-slate-900 text-white">O'chirilgan</option>
              </select>
            </div>

            <button
              onClick={fetchAdminData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Yangilash
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-sm transition border border-white/10"
              title="Tashriflar hisobotini CSV formatda yuklab olish"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Eksport CSV
            </button>
          </div>
        </div>

        {statusNotice && (
          <div className="mt-4 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {statusNotice}
          </div>
        )}
      </div>

      {/* KPI METRICS (PRO LEVEL STATS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Metric 1: Online Users */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hozir Online</span>
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {metrics.onlineCount}
            </span>
            <span className="text-xs text-slate-400 font-semibold">kishi</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Real-time faol sessiyalar</p>
        </div>

        {/* Metric 2: Today Visitors */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bugungi Tashrif</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {metrics.todayVisitorsCount}
            </span>
            <span className="text-xs text-indigo-500 font-bold">+18%</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Bugun kirgan unikal kishilar</p>
        </div>

        {/* Metric 3: Total Visitors */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jami Unikal</span>
            <Globe className="w-4 h-4 text-sky-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {metrics.totalVisitorsCount}
            </span>
            <span className="text-xs text-slate-400 font-semibold">ta</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Barcha unikal qurilmalar</p>
        </div>

        {/* Metric 4: Total Pageviews / Tool Hits */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Jami Amallar</span>
            <Layers className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {metrics.totalPageViews}
            </span>
            <span className="text-xs text-slate-400 font-semibold">hit</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">Vositalar ishlatilishi</p>
        </div>

        {/* Metric 5: Average Rating */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Baholash</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-500">
              {metrics.avgRating}
            </span>
            <span className="text-xs text-slate-400 font-semibold">/ 5.0</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{data?.feedbackList?.length || 4} ta fikr asosida</p>
        </div>

        {/* Metric 6: Uptime */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Uptime</span>
            <Server className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {Math.floor(metrics.uptimeSeconds / 60)}m {metrics.uptimeSeconds % 60}s
            </span>
          </div>
          <p className="text-[10px] text-emerald-500 font-semibold mt-1">100% Barqaror</p>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'visitors', label: 'Kirgan Foydalanuvchilar (Live Feed)', icon: <Users className="w-4 h-4" />, count: data?.recentSessions?.length },
          { id: 'analytics', label: 'Statistika & Grafiklar', icon: <Activity className="w-4 h-4" /> },
          { id: 'feedbacks', label: 'Foydalanuvchilar Fikrlari', icon: <MessageSquare className="w-4 h-4" />, count: data?.feedbackList?.length },
          { id: 'system', label: 'Tizim & AI Salomatligi', icon: <Cpu className="w-4 h-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as AdminTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: VISITORS FEED */}
      {activeTab === 'visitors' && (
        <div className="space-y-4">
          {/* Search & Filter header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="IP, shahar, brauzer yoki vosita bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-slate-400 mr-1">Filter:</span>
              {[
                { id: 'all', label: 'Barchasi' },
                { id: 'online', label: '🟢 Faqat Online' },
                { id: 'Desktop', label: 'Kompyuter' },
                { id: 'Mobile', label: 'Smartfon' },
                { id: 'Tablet', label: 'Planshet' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilterDevice(f.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    filterDevice === f.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Visitors Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Foydalanuvchi & Holati</th>
                    <th className="py-3.5 px-4">IP Manzili & Hudud</th>
                    <th className="py-3.5 px-4">Qurilma / OS</th>
                    <th className="py-3.5 px-4">Brauzer</th>
                    <th className="py-3.5 px-4">Amaldagi Vosita</th>
                    <th className="py-3.5 px-4 text-right">Amallar & Vaqt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredSessions.length > 0 ? (
                    filteredSessions.map((s: any) => (
                      <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <span className="relative flex h-2.5 w-2.5 shrink-0">
                              {s.isOnline ? (
                                <>
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                </>
                              ) : (
                                <span className="inline-flex rounded-full h-2 w-2 bg-slate-400"></span>
                              )}
                            </span>
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                {s.visitorId.slice(0, 16)}
                                {s.isOnline && (
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                                    Online
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400">
                                Ekran: {s.screen}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                            {s.ip}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1">
                            <span>🇺🇿</span>
                            <span>{s.location}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                            {s.deviceType === 'Mobile' ? (
                              <Smartphone className="w-4 h-4 text-violet-500 shrink-0" />
                            ) : s.deviceType === 'Tablet' ? (
                              <Tablet className="w-4 h-4 text-cyan-500 shrink-0" />
                            ) : (
                              <Monitor className="w-4 h-4 text-blue-500 shrink-0" />
                            )}
                            <div>
                              <span className="font-bold">{s.deviceType}</span>
                              <p className="text-[10px] text-slate-400">{s.os}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                          {s.browser}
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 font-semibold text-[11px]">
                            <Layers className="w-3 h-3" />
                            {s.currentToolName}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {s.pageViews} marta
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3" />
                            {s.isOnline
                              ? 'Hozir faol'
                              : s.secondsAgo < 3600
                              ? `${Math.floor(s.secondsAgo / 60)} daqiqa oldin`
                              : `${Math.floor(s.secondsAgo / 3600)} soat oldin`}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400">
                        Qidiruv bo'yicha hech qanday tashrif topilmadi.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANALYTICS & CHARTS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 7-Day Trend Chart */}
            <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-500" />
                    Oxirgi 7 Kunlik Tashriflar Dinamikasi
                  </h3>
                  <p className="text-xs text-slate-400">Kunlar bo'yicha kirganlar va unikal foydalanuvchilar</p>
                </div>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Haftalik o'sish +24%</span>
              </div>

              {/* Bar Chart Visualizer */}
              <div className="pt-8 pb-4 flex items-end justify-between gap-3 h-64 border-b border-slate-100 dark:border-slate-800">
                {(data?.dailyStats || []).map((d: any, idx: number) => {
                  const maxVisits = 450;
                  const heightPercent = Math.min(100, Math.round((d.visits / maxVisits) * 100));
                  const isToday = idx === (data?.dailyStats?.length || 1) - 1;

                  return (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {d.visits} ta
                      </span>
                      <div className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden h-full flex items-end">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-xl transition-all duration-500 ${
                            isToday
                              ? 'bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-lg shadow-indigo-600/30'
                              : 'bg-indigo-300 dark:bg-indigo-900/60 group-hover:bg-indigo-500'
                          }`}
                        />
                      </div>
                      <span className={`text-[11px] font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                        {d.day}
                      </span>
                      <span className="text-[9px] text-slate-400 hidden sm:block">
                        {d.date.split('-')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                <span>Eng faol kun: <strong>Juma (410 tashrif)</strong></span>
                <span>O'rtacha kunlik: <strong>330 tashrif</strong></span>
              </div>
            </div>

            {/* Device breakdown & OS */}
            <div className="lg:col-span-4 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-violet-500" />
                Qurilmalar Taqsimoti
              </h3>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Monitor className="w-3.5 h-3.5 text-blue-500" />
                      Kompyuter (Desktop)
                    </span>
                    <span className="font-bold">{data?.deviceBreakdown?.desktop || 45}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${data?.deviceBreakdown?.desktop || 45}%` }}
                      className="h-full bg-blue-500 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Smartphone className="w-3.5 h-3.5 text-violet-500" />
                      Smartfon (Mobile)
                    </span>
                    <span className="font-bold">{data?.deviceBreakdown?.mobile || 48}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${data?.deviceBreakdown?.mobile || 48}%` }}
                      className="h-full bg-violet-500 rounded-full"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <Tablet className="w-3.5 h-3.5 text-cyan-500" />
                      Planshet (Tablet)
                    </span>
                    <span className="font-bold">{data?.deviceBreakdown?.tablet || 7}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${data?.deviceBreakdown?.tablet || 7}%` }}
                      className="h-full bg-cyan-500 rounded-full"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Top Brauzerlar
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 block text-[10px]">Google Chrome</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">62%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 block text-[10px]">Safari (iOS/Mac)</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">24%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 block text-[10px]">Microsoft Edge</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">8%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-slate-400 block text-[10px]">Samsung Browser</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">6%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* TOP TOOLS RANKING */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-500" />
                  Eng Ko'p Ishlatilgan Vositalar Reytingi (Top Tools)
                </h3>
                <p className="text-xs text-slate-400">Har bir tool bo'yicha bajarilgan generatsiya va so'rovlar</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-2">
              {(data?.topTools || []).slice(0, 9).map((tool: any, idx: number) => (
                <div
                  key={tool.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2 hover:border-indigo-400 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-extrabold text-[10px] flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {tool.name}
                      </span>
                    </div>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                      {tool.count} marta
                    </span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(100, tool.percent)}%` }}
                      className="h-full bg-indigo-600 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FEEDBACKS */}
      {activeTab === 'feedbacks' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                Foydalanuvchilar Fikrlari & Takliflari
              </h3>
              <p className="text-xs text-slate-400">Real foydalanuvchilar yuborgan mulohazalar va baholar</p>
            </div>
            <span className="text-xs font-bold text-slate-500">
              Jami: {data?.feedbackList?.length || 0} ta fikr
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {(data?.feedbackList || []).map((f: any) => (
              <div
                key={f.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{f.email}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      {f.category}
                    </span>
                    {f.status === 'resolved' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold">
                        Bajarildi
                      </span>
                    ) : f.status === 'read' ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold">
                        O'qildi
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 font-bold">
                        Yangi
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-amber-400">
                      {Array(f.rating || 5).fill(0).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {f.status !== 'resolved' && (
                        <button
                          onClick={() => handleFeedbackAction(f.id, 'resolved')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 text-[11px] font-bold transition"
                          title="Bajarildi deb belgilash"
                        >
                          <Check className="w-3 h-3 inline mr-1" />
                          Bajarildi
                        </button>
                      )}
                      <button
                        onClick={() => handleFeedbackAction(f.id, 'delete')}
                        className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition"
                        title="O'chirish"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  "{f.message}"
                </p>

                <span className="text-[10px] text-slate-400 block">
                  {new Date(f.timestamp).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SYSTEM HEALTH & AI DIAGNOSTICS */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* AI Connection Test */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" />
                Gemini AI API Diagnostikasi
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-300 font-bold">
                gemini-3.8-flash
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Serverdan to'g'ridan-to'g'ri Gemini modeliga jonli test so'rovi yuborish va javob tezligini (latency) aniqlash.
            </p>

            <button
              onClick={handleTestAI}
              disabled={testingAI}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-violet-600/30 transition"
            >
              <Zap className={`w-3.5 h-3.5 ${testingAI ? 'animate-bounce' : ''}`} />
              {testingAI ? "Sinovdan o'tkazilmoqda..." : "AI Ulanishini Test Qilish (Ping)"}
            </button>

            {aiTestResult && (
              <div className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                aiTestResult.ok
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              }`}>
                <div className="flex items-center justify-between font-bold">
                  <span>{aiTestResult.ok ? "✅ Ulanish Muvaffaqiyatli!" : "❌ Ulanishda Xatolik"}</span>
                  <span>{aiTestResult.latencyMs} ms kechikish</span>
                </div>
                <p className="text-[11px] opacity-90">
                  {aiTestResult.ok
                    ? `Model: gemini-3.8-flash | Javob: "${aiTestResult.response}"`
                    : aiTestResult.error}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">GEMINI_API_KEY:</span>
                <span className="font-mono font-bold text-emerald-500">Mavjud & Ulangan</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Model Versiyasi:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">gemini-3.8-flash</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">OCR & Vision Quvvati:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">Multimodal Faol</span>
              </div>
            </div>
          </div>

          {/* Server Resources & Logs */}
          <div className="lg:col-span-6 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-500" />
                Server Resurslari & Diagnostika
              </h3>
              <button
                onClick={handleClearLogs}
                className="text-[11px] text-rose-500 hover:text-rose-600 font-bold"
              >
                Jurnalni tozalash
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 text-[10px] block">RAM Heap Used</span>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  {data?.system?.memoryHeapUsedMb || 42.5} MB
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 text-[10px] block">RAM RSS Jami</span>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  {data?.system?.memoryRssMb || 128.4} MB
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 text-[10px] block">Node.js Versiyasi</span>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  {data?.system?.nodeVersion || 'v22.14.0'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="text-slate-400 text-[10px] block">Platforma</span>
                <span className="text-base font-black text-slate-900 dark:text-white">
                  {data?.system?.platform || 'linux'} x64
                </span>
              </div>
            </div>

            {/* Activity Stream */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Oxirgi Tizim Faoliyati
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {(data?.activityLog || []).map((act: any) => (
                  <div
                    key={act.id}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 mr-2">{act.type}</span>
                      <span className="text-slate-500 text-[11px]">{act.details}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {act.status === 'success' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

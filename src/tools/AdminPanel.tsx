import React, { useState, useEffect } from 'react';
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
  Lock
} from 'lucide-react';
import { TOOLS_LIST } from '../utils/toolsData';

export const AdminPanel: React.FC = () => {
  const [adminEmail, setAdminEmail] = useState<string>('olimjanovmustafo59@gmail.com');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/data?adminKey=smarttools-admin-access', {
        headers: { 'x-user-email': adminEmail },
      });
      const data = await res.json();
      setTelemetry(data);
      setFeedbacks(data.feedbackList || []);
      setActivity(data.activityLog || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Shield className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold">SmartTools AI Boshqaruv Paneli</h2>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Admin: Olimjanov Mustafo
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Akkaunt: <strong className="text-amber-300">{adminEmail}</strong>. Tizim holati, foydalanuvchilar fikri va faoliyat monitoringi.
          </p>
        </div>

        <button
          onClick={fetchAdminData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold backdrop-blur-sm transition self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Yangilash
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Tizim Uptime</span>
            <Server className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {telemetry?.serverUptime ? `${Math.floor(telemetry.serverUptime / 60)} daqiqa` : 'Faol'}
          </p>
          <span className="text-[10px] text-emerald-500 font-medium">100% Barqaror ishlamoqda</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Gemini AI Holati</span>
            <Sparkles className="w-4 h-4 text-violet-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {telemetry?.hasApiKey ? "Ulangan" : "Kutilmoqda"}
          </p>
          <span className="text-[10px] text-slate-400">gemini-3.8-flash</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Fikr-mulohazalar</span>
            <MessageSquare className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {feedbacks.length} ta
          </p>
          <span className="text-[10px] text-indigo-500 font-medium">Foydalanuvchilar bahosi</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Faol Vositalar</span>
            <Layers className="w-4 h-4 text-cyan-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">
            {TOOLS_LIST.length} ta
          </p>
          <span className="text-[10px] text-cyan-500 font-medium">Barchasi operatsion</span>
        </div>
      </div>

      {/* Main Admin Section: Feedbacks & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: User Feedback Stream */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-500" />
                Foydalanuvchilar Fikrlari & Takliflari
              </h3>
              <span className="text-[10px] text-slate-400 font-semibold">{feedbacks.length} ta xabar</span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {feedbacks.length > 0 ? (
                feedbacks.map((f: any) => (
                  <div
                    key={f.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 dark:text-white">{f.email}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {f.category}
                        </span>
                      </div>

                      <div className="flex items-center text-amber-400">
                        {Array(f.rating || 5).fill(0).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      "{f.message}"
                    </p>

                    <span className="text-[10px] text-slate-400 block">
                      {new Date(f.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center p-6 text-slate-400 text-xs">
                  Hali fikrlar mavjud emas.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Real-time Activity Log */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Real-time Faoliyat Jurnali
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {activity.length > 0 ? (
                activity.map((act: any) => (
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
                ))
              ) : (
                <div className="text-center p-6 text-slate-400 text-xs">
                  Faoliyat qaydlari yangilanmoqda...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

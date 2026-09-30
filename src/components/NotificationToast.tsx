import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
      {toasts.map((toast) => {
        let bg = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100';
        let icon = <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />;

        if (toast.type === 'success') {
          bg = 'bg-emerald-50/95 dark:bg-emerald-950/90 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-50/95 dark:bg-amber-950/90 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-100';
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />;
        } else if (toast.type === 'error') {
          bg = 'bg-rose-50/95 dark:bg-rose-950/90 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100';
          icon = <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto shadow-xl rounded-xl border p-4 flex items-start gap-3 transition-all duration-300 transform translate-y-0 backdrop-blur-sm ${bg}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm">{toast.title}</h4>
              <p className="text-xs mt-0.5 leading-relaxed opacity-90">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 transition-colors"
              title="Yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

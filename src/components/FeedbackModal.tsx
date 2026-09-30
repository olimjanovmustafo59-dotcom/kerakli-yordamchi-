import React, { useState } from 'react';
import { X, Star, Send, MessageSquareHeart } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('Fikr yoki taklif');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, rating, category, message }),
      });
      if (res.ok) {
        onSuccess("Fikringiz uchun tashakkur! Admin jamoasi uni ko'rib chiqadi.");
        setMessage('');
        onClose();
      } else {
        const data = await res.json();
        alert(data.error || "Fikr yuborishda xatolik yuz berdi");
      }
    } catch {
      alert("Aloqa xatosi. Iltimos qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <MessageSquareHeart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Fikr va Takliflar</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              SmartTools AI platformasini yanada takomillashtirishga yordam bering
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Baho bering
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300 dark:text-slate-700'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-medium ml-2 text-slate-500">
                {rating === 5 ? 'Ajoyib!' : rating === 4 ? 'Yaxshi' : rating === 3 ? "O'rtacha" : 'Yaxshilash kerak'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Kategoriya
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="Fikr yoki taklif">Fikr yoki taklif</option>
                <option value="Xatolik (Bug report)">Xatolik (Bug report)</option>
                <option value="Yangi tool so'rovi">Yangi tool so'rovi</option>
                <option value="Tezlik va dizayn">Tezlik va dizayn</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Emailingiz (ixtiyoriy)
              </label>
              <input
                type="email"
                placeholder="misol@pochta.uz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Xabar / Tavsiya <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Qaysi vosita haqida fikringiz bor yoki qanday yangi imkoniyat qo'shilishini xohlaysiz?.."
              className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-3 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="px-5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 disabled:opacity-50 transition"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Yuborish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

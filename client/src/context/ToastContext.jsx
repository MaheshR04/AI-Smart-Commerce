import { createContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast, toasts }}>
      {children}
      {/* Floating Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-[9999] space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 p-4 rounded-xl shadow-lg border text-xs font-semibold pointer-events-auto animate-fade-in transition-all duration-300 transform translate-y-0 ${
              t.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900'
                : t.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-100 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900'
                : 'bg-indigo-50 text-indigo-800 border-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-900'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 shrink-0" />}
            {t.type === 'error' && <AlertTriangle className="w-4.5 h-4.5 text-rose-500 shrink-0" />}
            {t.type === 'info' && <Info className="w-4.5 h-4.5 text-indigo-500 shrink-0" />}
            
            <span className="flex-1 leading-snug">{t.message}</span>
            
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;

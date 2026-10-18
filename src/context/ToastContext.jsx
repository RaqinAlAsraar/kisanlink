import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, PhoneCall, MessageSquare, Sparkles, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ title, message, type = 'success', duration = 3500, icon = null }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast = { id, title, message, type, duration, icon };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Render Portal Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto bg-[#272c1a] text-white border-2 border-[#9fd700]/70 rounded-2xl p-4 shadow-elevated flex items-start gap-3 animate-pop-in transition-all overflow-hidden relative"
          >
            {/* Left Icon Badge */}
            <div className="w-9 h-9 rounded-xl bg-[#9fd70025] text-[#9fd700] flex items-center justify-center shrink-0 mt-0.5 border border-[#9fd70040]">
              {toast.icon || (
                toast.type === 'phone' ? <PhoneCall className="w-4 h-4 fill-current" /> :
                toast.type === 'chat' ? <MessageSquare className="w-4 h-4 fill-current" /> :
                toast.type === 'error' ? <AlertTriangle className="w-4 h-4 text-red-400" /> :
                <CheckCircle2 className="w-4 h-4 text-[#9fd700]" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pr-4">
              <h4 className="text-sm font-black text-[#fffeef] leading-tight flex items-center gap-1.5">
                <span>{toast.title}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#9fd700] animate-ping" />
              </h4>
              {toast.message && (
                <p className="text-xs text-gray-300 mt-1 leading-snug font-medium">
                  {toast.message}
                </p>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Bottom Progress Bar */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-1 bg-[#9fd700]"
              style={{
                animation: `shrinkWidth ${toast.duration}ms linear forwards`
              }}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { showToast: () => {} };
  }
  return ctx;
};

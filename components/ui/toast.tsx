"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── Types ─────────────────────────────────────────────────────────────────────
export type ToastVariant = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (message: string, variant?: ToastVariant) => void;
}

// ── Context ───────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
  }, []);

  const toast = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev.slice(-4), { id, message, variant }]);
    const timer = setTimeout(() => dismiss(id), 4000);
    timers.current.set(id, timer);
  }, [dismiss]);

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ── Toaster ───────────────────────────────────────────────────────────────────
const ICONS: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle size={16} />,
  error:   <AlertCircle size={16} />,
  info:    <Info size={16} />,
};

const COLORS: Record<ToastVariant, { border: string; icon: string }> = {
  success: { border: "rgba(55,201,126,0.35)",  icon: "var(--color-success)" },
  error:   { border: "rgba(236,100,128,0.35)", icon: "var(--color-danger)" },
  info:    { border: "rgba(255,255,255,0.12)", icon: "var(--color-muted)" },
};

function Toaster({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-24 right-4 z-[200] flex flex-col gap-2 md:bottom-6"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const { border, icon } = COLORS[t.variant];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 48, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 48, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
              role="status"
              className="flex w-72 items-start gap-3 rounded-[14px] p-3.5 shadow-xl"
              style={{
                background: "var(--color-surface)",
                border: `1px solid ${border}`,
              }}
            >
              <span style={{ color: icon, marginTop: 1, flexShrink: 0 }}>
                {ICONS[t.variant]}
              </span>
              <p className="flex-1 text-[13px] leading-snug text-foreground">{t.message}</p>
              <button
                onClick={() => onDismiss(t.id)}
                aria-label="Fermer"
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-muted transition hover:text-foreground"
              >
                <X size={12} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

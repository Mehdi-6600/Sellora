"use client";

// Tiny toast system (no extra dependency).
//
// FIX: the previous implementation rendered <ToastContext.Provider> around its
// own markup only, so every useToast() consumer elsewhere in the tree received
// the default no-op context and user feedback silently vanished in six flows
// (login, signup, product actions, ruleset save, import, chat). The provider
// now wraps the whole app from the root layout.

import * as React from "react";
import { cx } from "@/lib/utils/format";

type Toast = { id: string; message: string; tone: "info" | "success" | "error" };
type Ctx = { push: (message: string, tone?: Toast["tone"]) => void };

const ToastContext = React.createContext<Ctx>({ push: () => {} });

export function useToast() {
  return React.useContext(ToastContext);
}

const ICONS: Record<Toast["tone"], string> = {
  info: "ℹ️",
  success: "✅",
  error: "⚠️",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const push = React.useCallback((message: string, tone: Toast["tone"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  const value = React.useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-3 top-3 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:top-4 sm:end-4 sm:items-end"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cx(
              "animate-fade-up pointer-events-auto flex w-[min(92vw,420px)] items-start gap-2.5 rounded-2xl border px-4 py-3 text-[13px] font-medium shadow-raised backdrop-blur",
              t.tone === "success" && "border-emerald-400/30 bg-emerald-400/15 text-emerald-200",
              t.tone === "error" && "border-red-400/30 bg-red-400/15 text-red-200",
              t.tone === "info" && "border-white/[0.12] bg-canvas-soft text-ink-800"
            )}
          >
            <span aria-hidden="true" className="text-base leading-5">
              {ICONS[t.tone]}
            </span>
            <span className="flex-1 leading-6">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

"use client";

// Extremely simple toast system using React state + tailwind. Avoids extra deps.
import * as React from "react";
import { cx } from "@/lib/utils/format";

type Toast = { id: string; message: string; tone: "info" | "success" | "error" };
type Ctx = { push: (message: string, tone?: Toast["tone"]) => void };

const ToastContext = React.createContext<Ctx>({ push: () => {} });

export function useToast() {
  return React.useContext(ToastContext);
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const push = React.useCallback((message: string, tone: Toast["tone"] = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[min(90vw,420px)]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cx(
              "rounded-xl px-4 py-3 text-sm shadow-soft border",
              t.tone === "success" && "bg-emerald-50 border-emerald-200 text-emerald-800",
              t.tone === "error" && "bg-red-50 border-red-200 text-red-800",
              t.tone === "info" && "bg-white border-ink-200 text-ink-800"
            )}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

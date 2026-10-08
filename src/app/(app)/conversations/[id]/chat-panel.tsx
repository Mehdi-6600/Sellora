"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import { cx } from "@/lib/utils/format";
import { IconArrowRight, IconSparkle } from "@/components/layout/icons";
import type { Dict } from "@/lib/i18n/dictionaries/fa";

/**
 * Conversation composer + takeover control.
 *
 * Behaviour, endpoints and payloads are unchanged (POST …/messages,
 * POST …/handoff). Only the presentation changed:
 *   • phones   → pinned above the bottom navigation, thumb-reachable
 *   • desktop  → a card at the foot of the thread column
 * The available action and its copy follow the real automation lock, so the
 * owner always knows whether Sellora or they are answering.
 */
export function ChatPanel({
  conversationId,
  isHuman,
  dict,
}: {
  conversationId: string;
  isHuman: boolean;
  dict: Dict;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [, startTransition] = useTransition();
  const [human, setHuman] = useState(isHuman);
  const [handoffBusy, setHandoffBusy] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const scrolled = useRef(false);

  useEffect(() => {
    if (!scrolled.current) {
      const el = document.getElementById("thread-end");
      if (el) el.scrollIntoView({ block: "end" });
      scrolled.current = true;
    }
  }, []);

  async function send() {
    if (!text.trim()) return;
    setSending(true);
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    setSending(false);
    if (!res.ok) {
      toast.push(dict.errors.generic, "error");
      return;
    }
    setText("");
    startTransition(() => router.refresh());
  }

  async function setLock(state: "AUTO" | "HUMAN") {
    setHandoffBusy(true);
    const res = await fetch(`/api/conversations/${conversationId}/handoff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
    });
    setHandoffBusy(false);
    if (res.ok) {
      setHuman(state === "HUMAN");
      toast.push(
        state === "HUMAN" ? "گفتگو به شما تحویل داده شد" : "گفتگو به سلورا بازگردانده شد",
        "success"
      );
      startTransition(() => router.refresh());
    } else {
      toast.push(dict.errors.generic, "error");
    }
  }

  return (
    <div className="fixed inset-x-0 bottom-[calc(3.6rem+env(safe-area-inset-bottom,0px))] z-30 lg:static lg:inset-x-auto lg:bottom-auto lg:mt-3">
      <div className="border-t border-ink-100/80 glass-bar px-3 py-2.5 shadow-nav lg:rounded-card lg:border lg:border-ink-100 lg:bg-white/[0.06] lg:p-3 lg:shadow-card">
        <div className="mx-auto w-full max-w-[30rem] lg:max-w-none">
          {/* ------------------------------------------------- who is answering */}
          <div className="mb-2 flex items-center gap-2">
            <span
              className={cx(
                "inline-flex min-w-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1",
                human
                  ? "bg-sky-400/15 text-sky-300 ring-sky-400/25"
                  : "bg-brand-50 text-brand-700 ring-brand-100"
              )}
            >
              <IconSparkle size={13} />
              <span className="truncate">
                {human ? "الان شما پاسخ می‌دهید" : "سلورا خودش پاسخ می‌دهد"}
              </span>
            </span>

            <button
              type="button"
              onClick={() => setLock(human ? "AUTO" : "HUMAN")}
              disabled={handoffBusy}
              className="btn-secondary ms-auto min-h-[36px] rounded-xl px-3 py-1.5 text-[12px]"
            >
              {handoffBusy
                ? "…"
                : human
                ? dict.conversations.returnToAuto
                : dict.conversations.takeOver}
            </button>
          </div>

          {/* ------------------------------------------------------- composer */}
          <div className="flex items-end gap-2">
            <label className="sr-only" htmlFor="composer-input">
              {dict.conversations.typingPlaceholder}
            </label>
            <textarea
              id="composer-input"
              aria-label={dict.conversations.typingPlaceholder}
              className={cx(
                "input flex-1 resize-none py-2.5 leading-6 transition",
                !human && "cursor-not-allowed bg-ink-50 text-ink-500"
              )}
              rows={1}
              placeholder={
                human
                  ? dict.conversations.typingPlaceholder
                  : "برای ارسال پیام، ابتدا گفتگو را تحویل بگیرید"
              }
              value={text}
              disabled={!human}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              style={{ maxHeight: 120, minHeight: 46 }}
            />
            <Button
              onClick={send}
              disabled={!human || sending || !text.trim()}
              size="md"
              loading={sending}
              aria-label={dict.conversations.send}
              className="shrink-0 px-3.5"
            >
              {!sending ? (
                <IconArrowRight size={19} className="rtl:rotate-180" />
              ) : null}
              <span className="hidden sm:inline">{dict.conversations.send}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

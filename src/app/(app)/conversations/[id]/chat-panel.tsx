"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toaster";
import type { Dict } from "@/lib/i18n/dictionaries/fa";

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
  const [pending, startTransition] = useTransition();
  const [human, setHuman] = useState(isHuman);
  const router = useRouter();
  const toast = useToast();
  const scrolled = useRef(false);

  useEffect(() => {
    if (!scrolled.current) {
      const el = document.getElementById("messages");
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
    const res = await fetch(`/api/conversations/${conversationId}/handoff`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state }),
    });
    if (res.ok) {
      setHuman(state === "HUMAN");
      toast.push(state === "HUMAN" ? "گفتگو به شما تحویل داده شد" : "گفتگو به سلورا بازگردانده شد", "success");
      startTransition(() => router.refresh());
    }
  }

  // keep unused `pending` referenced to silence TS in dev
  void pending;

  return (
    <div className="fixed bottom-16 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-ink-100">
      <div className="mx-auto max-w-md px-3 py-2 flex flex-col gap-2">
        <div className="flex gap-2">
          {human ? (
            <Button size="sm" variant="secondary" onClick={() => setLock("AUTO")}>
              {dict.conversations.returnToAuto}
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={() => setLock("HUMAN")}>
              {dict.conversations.takeOver}
            </Button>
          )}
        </div>
        <div className="flex gap-2 items-end pb-1">
          <textarea
            className="input resize-none"
            rows={1}
            placeholder={human ? dict.conversations.typingPlaceholder : "برای ارسال پیام ابتدا گفتگو را تحویل بگیرید"}
            value={text}
            disabled={!human}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            style={{ maxHeight: 120 }}
          />
          <Button onClick={send} disabled={!human || sending || !text.trim()} size="md">
            {dict.conversations.send}
          </Button>
        </div>
      </div>
    </div>
  );
}

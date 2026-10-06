"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import type { Dict } from "@/lib/i18n/dictionaries/fa";

export function LoginForm({ dict }: { dict: Dict }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error?.message ? dict.errors[data.error.message as keyof typeof dict.errors] ?? dict.errors.generic : dict.errors.generic);
        return;
      }
      toast.push("خوش آمدید!", "success");
      router.replace(params.get("next") || "/dashboard");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label>{dict.auth.email}</Label>
        <Input type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div>
        <Label>{dict.auth.password}</Label>
        <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      {err && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{err}</div>}
      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? dict.common.loading : dict.auth.login}
      </Button>
    </form>
  );
}

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
        const code = data?.error?.message || data?.error?.code;
        // The API answers with message:"invalidCredentials" which lives in the
        // auth dictionary, not the errors dictionary.
        setErr(
          code === "invalidCredentials"
            ? dict.auth.invalidCredentials
            : (dict.errors as Record<string, string>)[code] ?? dict.errors.generic
        );
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
        <Label htmlFor="login-email">{dict.auth.email}</Label>
        <Input id="login-email" name="email" autoComplete="email" type="email" dir="ltr" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
      </div>
      <div>
        <Label htmlFor="login-password">{dict.auth.password}</Label>
        <Input id="login-password" name="password" autoComplete="current-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      {err && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-[12.5px] font-medium text-red-700"
        >
          {err}
        </div>
      )}
      <Button type="submit" loading={loading} className="w-full" size="lg">
        {loading ? dict.common.loading : dict.auth.login}
      </Button>
    </form>
  );
}

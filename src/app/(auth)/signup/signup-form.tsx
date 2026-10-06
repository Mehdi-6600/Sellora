"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { useToast } from "@/components/ui/toaster";
import type { Dict } from "@/lib/i18n/dictionaries/fa";

export function SignupForm({ dict }: { dict: Dict }) {
  const [state, setState] = useState({ name: "", email: "", password: "", businessName: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const code = data.error?.code || data.error?.message || "generic";
        setErr(code === "email_taken" ? dict.auth.emailTaken : dict.errors.generic);
        return;
      }
      toast.push("حساب شما با موفقیت ساخته شد ✨", "success");
      router.replace("/onboarding");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <Label>{dict.auth.businessName}</Label>
        <Input required value={state.businessName} onChange={(e) => setState({ ...state, businessName: e.target.value })} placeholder="مثلا: فروشگاه مانتو آوا" />
      </div>
      <div>
        <Label>{dict.auth.name}</Label>
        <Input required value={state.name} onChange={(e) => setState({ ...state, name: e.target.value })} placeholder="نام شما" />
      </div>
      <div>
        <Label>{dict.auth.email}</Label>
        <Input type="email" dir="ltr" required value={state.email} onChange={(e) => setState({ ...state, email: e.target.value })} placeholder="you@example.com" />
      </div>
      <div>
        <Label>{dict.auth.password}</Label>
        <Input type="password" required minLength={8} value={state.password} onChange={(e) => setState({ ...state, password: e.target.value })} placeholder="حداقل ۸ کاراکتر" />
      </div>
      {err && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">{err}</div>}
      <Button type="submit" disabled={loading} className="w-full" size="lg">
        {loading ? dict.common.loading : dict.auth.signup}
      </Button>
    </form>
  );
}

import * as React from "react";
import { Card } from "@/components/ui/card";

export function Empty({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="h-12 w-12 rounded-full bg-ink-100 flex items-center justify-center text-2xl">✨</div>
      <div className="font-semibold text-ink-900">{title}</div>
      {subtitle && <div className="text-sm text-ink-500 max-w-xs">{subtitle}</div>}
      {action}
    </Card>
  );
}

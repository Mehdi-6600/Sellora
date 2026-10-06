import * as React from "react";
import { cx } from "@/lib/utils/format";

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("bg-white rounded-2xl shadow-card border border-ink-100", className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("p-4 pb-2", className)} {...props} />;
}
export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("p-4 pt-2", className)} {...props} />;
}
export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("p-4 pt-0 flex items-center gap-2", className)} {...props} />;
}

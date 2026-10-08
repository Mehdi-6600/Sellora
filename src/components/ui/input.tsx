import * as React from "react";
import { cx } from "@/lib/utils/format";

/**
 * Field styling lives in the `.input` component class (globals.css) so plain
 * <input>/<select> elements keep working identically to these wrappers:
 * 48px tall, soft inset depth, obvious brand focus ring.
 */
const FIELD =
  "w-full rounded-2xl border border-ink-200/80 bg-white px-4 py-3 text-sm text-ink-900 shadow-inset transition placeholder:text-ink-400 hover:border-ink-300 focus:border-brand-400 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:cursor-not-allowed disabled:bg-ink-50 min-h-[48px]";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cx(FIELD, className)} {...props} />
  )
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cx(FIELD, "min-h-[120px] leading-7", className)} {...props} />
));
Textarea.displayName = "Textarea";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cx(FIELD, "cursor-pointer pe-10", className)} {...props}>
    {children}
  </select>
));
Select.displayName = "Select";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cx("label", className)} {...props} />;
}

/** Small helper line under a field. */
export function Help({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cx("help", className)} {...props} />;
}

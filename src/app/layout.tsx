import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getServerDict } from "@/lib/i18n";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "Sellora — فروشنده شما در اینستاگرام",
  description: "سلورا؛ فروشنده و پشتیبان خودکار اینستاگرام برای کسب‌وکارهای کوچک.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, dir } = await getServerDict();
  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/vazirmatn@33.0.3/Vazirmatn-font-face.css"
        />
      </head>
      <body className="min-h-screen bg-ink-50 text-ink-900 antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

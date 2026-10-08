import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getServerDict } from "@/lib/i18n";
import { ToastProvider } from "@/components/ui/toaster";
import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_NAME_LATIN,
  absolute,
  siteUrl,
} from "@/lib/config/site";

const DEFAULT_TITLE = `${SITE_NAME} — فروشنده و پشتیبان خودکار اینستاگرام`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME_LATIN, url: siteUrl() }],
  creator: SITE_NAME_LATIN,
  publisher: SITE_NAME_LATIN,
  category: "business",
  formatDetection: { telephone: false, address: false, email: false },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    url: absolute("/"),
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: absolute("/og.jpg"),
        width: 1200,
        height: 630,
        alt: DEFAULT_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: SITE_DESCRIPTION,
    images: [absolute("/og.jpg")],
  },
  robots: { index: true, follow: true },
  icons: {
    // The real Sellora artwork (original character PNGs) — no SVG recreation.
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#150e2e",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, dir } = await getServerDict();
  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        {/* Self-hosted Vazirmatn (SIL OFL 1.1, see public/fonts/OFL.txt).
            One variable woff2 covers weights 100–900 and replaces the
            previously render-blocking third-party stylesheet from jsdelivr. */}
        <link
          rel="preload"
          href="/fonts/vazirmatn-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-canvas text-ink-900 antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}

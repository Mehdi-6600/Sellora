"use client";

// Last-resort boundary for failures inside the root layout itself. It replaces
// the whole document, so it must stand on its own: no shared components and no
// dependency on component classes — only a few inline styles that mirror the
// light application palette, and the REAL Sellora artwork (public/icons/icon-512.png)
// so the fallback still looks like Sellora.

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="fa" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "32px 20px",
          background: "#f7f9fc",
          color: "#182335",
          fontFamily:
            "Vazirmatn, system-ui, -apple-system, 'Segoe UI', Tahoma, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 420,
            width: "100%",
            textAlign: "center",
            background: "#ffffff",
            border: "1px solid #e8edf2",
            borderRadius: 24,
            padding: "28px 22px",
            boxShadow: "0 18px 44px -24px rgba(6,3,20,0.8)",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* The original Sellora character — the real artwork, untouched. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/icon-512.png"
            alt="سلورا"
            width={64}
            height={64}
            style={{
              display: "block",
              margin: "0 auto 14px",
              borderRadius: 18,
              boxShadow: "0 14px 30px -14px rgba(214,37,92,0.65)",
            }}
          />
          <h1 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 8px" }}>خطایی پیش آمد</h1>
          <p style={{ fontSize: 13, lineHeight: 2, color: "#566579", margin: "0 0 20px" }}>
            بارگذاری برنامه ممکن نشد. داده‌های شما دست‌نخورده است؛ یک‌بار دیگر تلاش کنید.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              width: "100%",
              minHeight: 48,
              border: "none",
              borderRadius: 16,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              color: "#ffffff",
              background: "#0066d6",
              boxShadow: "0 12px 24px -14px rgba(214,37,92,0.75)",
            }}
          >
            تلاش دوباره
          </button>
        </div>
      </body>
    </html>
  );
}

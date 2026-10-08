"use client";

// Last-resort boundary for failures inside the root layout itself. It replaces
// the whole document, so it must stand on its own: no shared components and no
// dependency on component classes — only inline styles that mirror the purple
// canvas (soft lavender → deep violet) plus the original Sellora artwork, so
// the fallback still looks like Sellora.

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
          background:
            "radial-gradient(900px 520px at 88% -6%, rgba(124,76,228,0.20), transparent 62%), radial-gradient(780px 480px at 2% 2%, rgba(185,162,246,0.42), transparent 60%), #f1ecfc",
          color: "#201d33",
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
            border: "1px solid rgba(31,16,66,0.08)",
            borderRadius: 24,
            padding: "28px 22px",
            boxShadow: "0 1px 2px rgba(31,16,66,0.04), 0 18px 40px -26px rgba(31,16,66,0.45)",
          }}
        >
          {/* The original artwork, served straight from /public. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/sellora-mark-128.webp"
            alt="سلورا"
            width={72}
            height={72}
            style={{
              width: 72,
              height: 72,
              margin: "0 auto 14px",
              display: "block",
              borderRadius: 22,
              boxShadow: "0 14px 30px -16px rgba(124,76,228,0.55)",
            }}
          />
          <h1 style={{ fontSize: 19, fontWeight: 800, margin: "0 0 8px" }}>خطایی پیش آمد</h1>
          <p style={{ fontSize: 13, lineHeight: 2, color: "#6b6489", margin: "0 0 20px" }}>
            بارگذاری برنامه ممکن نشد. داده‌های شما دست‌نخورده است؛ یک‌بار دیگر تلاش کنید.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              width: "100%",
              minHeight: 48,
              border: "1px solid rgba(85,37,174,0.3)",
              borderRadius: 16,
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700,
              color: "#ffffff",
              background: "linear-gradient(135deg, #9874ef, #6733d0 46%, #431c88)",
              boxShadow: "0 12px 24px -14px rgba(103,51,208,0.75)",
            }}
          >
            تلاش دوباره
          </button>
        </div>
      </body>
    </html>
  );
}

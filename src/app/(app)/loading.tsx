// Skeleton for the authenticated app while a server component streams.
// Matches the AppShell geometry so there is no layout shift (CLS).

export default function AppLoading() {
  return (
    <div className="min-h-screen bg-ink-50 pb-20" aria-busy="true" aria-label="در حال بارگذاری">
      <header className="sticky top-0 z-30 bg-ink-50/85 backdrop-blur border-b border-ink-100">
        <div className="mx-auto w-full max-w-md px-4 py-3 flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-ink-100 skeleton" />
          <div className="h-4 w-20 rounded skeleton" />
        </div>
        <div className="mx-auto w-full max-w-md px-4 pb-3">
          <div className="h-6 w-40 rounded skeleton" />
        </div>
      </header>
      <main className="mx-auto w-full max-w-md px-4 py-4 space-y-3">
        <div className="h-24 rounded-2xl skeleton" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-24 rounded-2xl skeleton" />
          <div className="h-24 rounded-2xl skeleton" />
        </div>
        <div className="h-16 rounded-2xl skeleton" />
        <div className="h-16 rounded-2xl skeleton" />
      </main>
    </div>
  );
}

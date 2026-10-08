// Skeleton for the authenticated app while a server component streams.
// It mirrors the AppShell geometry (sidebar, sticky header, bottom nav) so the
// first paint does not jump when the real page arrives — no layout shift, and
// the phone never shows a bare white screen.

export default function AppLoading() {
  return (
    <div className="min-h-screen" aria-busy="true" aria-label="در حال بارگذاری">
      {/* desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:start-0 lg:flex lg:w-[17.5rem] lg:flex-col lg:gap-4 lg:border-e lg:border-ink-100/80 lg:bg-white/80 lg:px-4 lg:py-6">
        <div className="ms-2 h-10 w-32 rounded-2xl skeleton" />
        <div className="mt-2 space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-11 w-full rounded-2xl skeleton" />
          ))}
        </div>
      </div>

      <div className="lg:ps-[17.5rem]">
        <header className="sticky top-0 z-30 border-b border-ink-100/70 glass-bar">
          <div className="app-container flex items-center gap-3 py-2.5 lg:min-h-[76px] lg:py-3">
            <div className="h-10 w-10 shrink-0 rounded-xl skeleton lg:hidden" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-5 w-40 rounded-lg skeleton" />
              <div className="h-3 w-56 rounded-lg skeleton" />
            </div>
            <div className="h-10 w-10 shrink-0 rounded-xl skeleton" />
          </div>
        </header>

        <main className="app-container pb-28 pt-4 lg:pb-12 lg:pt-6">
          <div className="mx-auto w-full max-w-4xl space-y-4">
            <div className="h-32 rounded-card skeleton" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-24 rounded-card skeleton" />
              ))}
            </div>
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-[68px] rounded-card skeleton" />
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* phone bottom navigation */}
      <div className="fixed inset-x-0 bottom-0 flex h-[3.6rem] items-center justify-around border-t border-ink-100/80 glass-bar lg:hidden">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 w-12 rounded-full skeleton" />
        ))}
      </div>
    </div>
  );
}

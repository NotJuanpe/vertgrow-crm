"use client"

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-vg-bg border-b border-vg-border shadow-sm px-6 py-4">
      {/* Search bar */}
      <div className="relative max-w-[448px] w-full">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-vg-muted">
          <SearchIcon />
        </span>
        <input
          type="search"
          placeholder="Search clients or projects..."
          className="w-full bg-vg-bg-accent rounded-full pl-10 pr-4 py-2.5 text-sm text-vg-heading placeholder:text-vg-muted focus:outline-none focus:ring-2 focus:ring-vg-green"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4 ml-4 shrink-0">
        <button className="p-2 text-vg-muted hover:text-vg-body transition-colors" aria-label="Notifications">
          <BellIcon />
        </button>
        <button className="p-2 text-vg-muted hover:text-vg-body transition-colors" aria-label="Settings">
          <SettingsIcon />
        </button>
        <div className="size-8 rounded-full border border-vg-border bg-vg-green-light flex items-center justify-center text-xs font-semibold text-vg-green-dark">
          VG
        </div>
      </div>
    </header>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="16" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

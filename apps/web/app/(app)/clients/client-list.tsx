"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import type { Client, ClientStatus } from "@vertgrow/database/types"

const STATUS_TABS: { label: string; value: ClientStatus | "all" }[] = [
  { label: "All Clients", value: "all" },
  { label: "Lead",        value: "lead" },
  { label: "Active",      value: "active" },
  { label: "Inactive",    value: "inactive" },
]

const STATUS_BADGE: Record<ClientStatus, { bg: string; text: string }> = {
  active:   { bg: "bg-vg-green",      text: "text-[#f7fff2]" },
  lead:     { bg: "bg-[#fef9c3]",     text: "text-[#854d0e]" },
  inactive: { bg: "bg-[#dce2f3]",     text: "text-vg-body"   },
}

const AVATAR_COLORS: Record<ClientStatus, { bg: string; text: string }> = {
  active:   { bg: "bg-vg-green-light", text: "text-vg-green-dark" },
  lead:     { bg: "bg-[#bdcac1]",      text: "text-[#535f58]"     },
  inactive: { bg: "bg-[#dce2f3]",      text: "text-vg-body"       },
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}

export function ClientList({ clients }: { clients: Client[] }) {
  const [search, setSearch]   = useState("")
  const [tab, setTab]         = useState<ClientStatus | "all">("all")

  const counts = useMemo(() => ({
    lead:     clients.filter((c) => c.status === "lead").length,
    active:   clients.filter((c) => c.status === "active").length,
    inactive: clients.filter((c) => c.status === "inactive").length,
  }), [clients])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return clients.filter((c) => {
      const matchesTab    = tab === "all" || c.status === tab
      const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q)
      return matchesTab && matchesSearch
    })
  }, [clients, search, tab])

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-vg-heading">Client Directory</h1>
          <p className="mt-1 text-base text-vg-body">Manage your greenhouse partnerships and consultation leads.</p>
        </div>
        <Link
          href="/clients/new"
          className="flex items-center gap-2 self-start sm:self-auto bg-vg-green-dark text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-vg-green transition-colors shrink-0"
        >
          <PlusIcon />
          Add Client
        </Link>
      </div>

      {/* Search + filter tabs */}
      <div className="flex flex-col gap-3">
        <div className="relative max-w-sm w-full">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-vg-muted">
            <SearchIcon />
          </span>
          <input
            type="search"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-vg-bg-accent border border-vg-border rounded-lg text-sm text-vg-heading placeholder:text-vg-muted focus:outline-none focus:ring-2 focus:ring-vg-green focus:border-transparent"
          />
        </div>

        <div className="flex gap-0 border-b border-vg-border overflow-x-auto">
          {STATUS_TABS.map(({ label, value }) => {
            const count = value === "all" ? null : counts[value]
            const isActive = tab === value
            return (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  isActive
                    ? "border-vg-green-dark text-vg-green-dark font-bold"
                    : "border-transparent text-vg-body hover:text-vg-heading"
                }`}
              >
                {label}
                {count !== null && value !== "all" && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${
                    value === "lead" ? "bg-[#facc15]" : value === "active" ? "bg-vg-green-dark" : "bg-[#9ca3af]"
                  }`}>
                    {counts[value]}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white border border-vg-border rounded-xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState hasClients={clients.length > 0} />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-vg-bg-accent border-b border-vg-border">
                    <th className="px-6 py-4 text-left text-sm font-bold text-vg-body">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-vg-body">Phone Number</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-vg-body">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-vg-body">Date Added</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-vg-body">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((client, i) => (
                    <tr
                      key={client.id}
                      onClick={() => window.location.href = `/clients/${client.id}`}
                      className={`group cursor-pointer hover:bg-gray-50 transition-colors ${i > 0 ? "border-t border-vg-border" : ""}`}
                    >
                      {/* Name + avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center size-10 rounded-full shrink-0 text-sm font-bold ${AVATAR_COLORS[client.status].bg} ${AVATAR_COLORS[client.status].text}`}>
                            {initials(client.name)}
                          </div>
                          <div>
                            <p className="font-bold text-vg-heading text-sm">{client.name}</p>
                            {client.email && (
                              <p className="text-xs text-vg-body">{client.email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-vg-body">{client.phone}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_BADGE[client.status].bg} ${STATUS_BADGE[client.status].text}`}>
                            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-vg-body">{formatDate(client.created_at)}</td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <Link
                            href={`/clients/${client.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 rounded-lg text-vg-muted hover:text-vg-heading hover:bg-gray-100 transition-colors"
                            aria-label="View client"
                          >
                            <DotsIcon />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-vg-border">
              {filtered.map((client) => (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className={`flex items-center justify-center size-10 rounded-full shrink-0 text-sm font-bold ${AVATAR_COLORS[client.status].bg} ${AVATAR_COLORS[client.status].text}`}>
                    {initials(client.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-vg-heading text-sm truncate">{client.name}</p>
                    <p className="text-xs text-vg-body">{client.phone}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${STATUS_BADGE[client.status].bg} ${STATUS_BADGE[client.status].text}`}>
                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  </span>
                </Link>
              ))}
            </div>

            {/* Footer count */}
            <div className="bg-vg-bg-accent border-t border-vg-border px-6 py-4">
              <p className="text-sm text-vg-body">
                Showing {filtered.length} of {clients.length} client{clients.length !== 1 ? "s" : ""}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState({ hasClients }: { hasClients: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
      <div className="size-14 rounded-full bg-vg-green-light flex items-center justify-center">
        <UsersIcon />
      </div>
      <div>
        <p className="text-lg font-semibold text-vg-heading">
          {hasClients ? "No clients match your search" : "No clients yet"}
        </p>
        <p className="text-sm text-vg-body mt-1">
          {hasClients
            ? "Try adjusting your search or filter."
            : "Add your first client to get started."}
        </p>
      </div>
      {!hasClients && (
        <Link
          href="/clients/new"
          className="flex items-center gap-2 bg-vg-green-dark text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-vg-green transition-colors"
        >
          <PlusIcon />
          Add Client
        </Link>
      )}
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  )
}

function DotsIcon() {
  return (
    <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor">
      <circle cx="2" cy="2"  r="1.5" /><circle cx="2" cy="8"  r="1.5" /><circle cx="2" cy="14" r="1.5" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#006b2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

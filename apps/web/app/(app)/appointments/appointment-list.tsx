"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import type { AppointmentType, AppointmentStatus } from "@vertgrow/database/types"

export type AppointmentRow = {
  id: string
  client_id: string
  date: string
  duration_min: number
  type: AppointmentType
  status: AppointmentStatus
  notes: string | null
  series_id: string | null
  clients: { id: string; name: string }
}

const TYPE_LABEL: Record<AppointmentType, string> = {
  "quote":        "Quote",
  "installation": "Installation",
  "maintenance":  "Maintenance",
  "follow-up":    "Follow-up",
}

const TYPE_BADGE: Record<AppointmentType, string> = {
  "quote":        "bg-[#fef9c3] text-[#854d0e]",
  "installation": "bg-[#dbeafe] text-[#1e40af]",
  "maintenance":  "bg-vg-green-light text-vg-green-dark",
  "follow-up":    "bg-[#ede9fe] text-[#5b21b6]",
}

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  scheduled: "Scheduled",
  completed: "Completed",
  cancelled: "Cancelled",
}

const STATUS_BADGE: Record<AppointmentStatus, string> = {
  scheduled: "bg-[#dbeafe] text-[#1e40af]",
  completed: "bg-vg-green-light text-vg-green-dark",
  cancelled: "bg-[#dce2f3] text-vg-body",
}

function startOfToday() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function isUpcoming(appt: AppointmentRow) {
  return appt.status === "scheduled" && new Date(appt.date) >= startOfToday()
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
  }
}

export function AppointmentList({ appointments }: { appointments: AppointmentRow[] }) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming")

  const { upcoming, past } = useMemo(() => ({
    upcoming: appointments
      .filter(isUpcoming)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    past: appointments
      .filter((a) => !isUpcoming(a))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  }), [appointments])

  const shown = tab === "upcoming" ? upcoming : past

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-vg-heading">Appointments</h1>
          <p className="mt-1 text-base text-vg-body">Schedule and track client visits.</p>
        </div>
        <Link
          href="/appointments/new"
          className="flex items-center gap-2 self-start sm:self-auto bg-vg-green-dark text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm hover:bg-vg-green transition-colors shrink-0"
        >
          <PlusIcon />
          New Appointment
        </Link>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-0 border-b border-vg-border">
        {(["upcoming", "past"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t
                ? "border-vg-green-dark text-vg-green-dark font-bold"
                : "border-transparent text-vg-body hover:text-vg-heading"
            }`}
          >
            {t}
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${
              t === "upcoming" ? "bg-vg-green-dark" : "bg-[#9ca3af]"
            }`}>
              {t === "upcoming" ? upcoming.length : past.length}
            </span>
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white border border-vg-border rounded-xl shadow-sm overflow-hidden">
        {shown.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-vg-bg-accent border-b border-vg-border">
                    <th className="px-6 py-4 text-left text-sm font-bold text-vg-body">Date & Time</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-vg-body">Client</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-vg-body">Type</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-vg-body">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-vg-body">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((appt, i) => {
                    const { date, time } = formatDateTime(appt.date)
                    return (
                      <tr
                        key={appt.id}
                        onClick={() => (window.location.href = `/appointments/${appt.id}`)}
                        className={`group cursor-pointer hover:bg-gray-50 transition-colors ${i > 0 ? "border-t border-vg-border" : ""}`}
                      >
                        <td className="px-6 py-4">
                          <p className="font-semibold text-vg-heading text-sm">{date}</p>
                          <p className="text-xs text-vg-muted">{time}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-vg-heading">
                          {appt.clients.name}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${TYPE_BADGE[appt.type]}`}>
                              {TYPE_LABEL[appt.type]}
                            </span>
                            {appt.series_id && (
                              <span title="Recurring" className="text-vg-muted">
                                <RepeatIcon />
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_BADGE[appt.status]}`}>
                            {STATUS_LABEL[appt.status]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-vg-body max-w-[200px] truncate">
                          {appt.notes ?? <span className="text-vg-muted italic">—</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-vg-border">
              {shown.map((appt) => {
                const { date, time } = formatDateTime(appt.date)
                return (
                  <Link
                    key={appt.id}
                    href={`/appointments/${appt.id}`}
                    className="flex flex-col gap-2 px-4 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-vg-heading text-sm">{appt.clients.name}</p>
                        <p className="text-xs text-vg-muted">{date} · {time}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${STATUS_BADGE[appt.status]}`}>
                        {STATUS_LABEL[appt.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${TYPE_BADGE[appt.type]}`}>
                        {TYPE_LABEL[appt.type]}
                      </span>
                      {appt.series_id && <RepeatIcon />}
                      {appt.notes && (
                        <p className="text-xs text-vg-body line-clamp-1 min-w-0">{appt.notes}</p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>

            <div className="bg-vg-bg-accent border-t border-vg-border px-6 py-4">
              <p className="text-sm text-vg-body">
                Showing {shown.length} {tab} appointment{shown.length !== 1 ? "s" : ""}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function EmptyState({ tab }: { tab: "upcoming" | "past" }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-4">
      <div className="size-14 rounded-full bg-vg-green-light flex items-center justify-center">
        <CalendarIcon />
      </div>
      <div>
        <p className="text-lg font-semibold text-vg-heading">
          {tab === "upcoming" ? "No upcoming appointments" : "No past appointments"}
        </p>
        <p className="text-sm text-vg-body mt-1">
          {tab === "upcoming"
            ? "Schedule your first appointment to get started."
            : "Completed and cancelled appointments will appear here."}
        </p>
      </div>
      {tab === "upcoming" && (
        <Link
          href="/appointments/new"
          className="flex items-center gap-2 bg-vg-green-dark text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-vg-green transition-colors"
        >
          <PlusIcon />
          New Appointment
        </Link>
      )}
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="M12 5v14" />
    </svg>
  )
}

function RepeatIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-vg-muted">
      <path d="m17 2 4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#006b2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

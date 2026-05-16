import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { RemindersSection } from "./reminders-section"
import type { ReminderRow } from "./reminders-section"
import type { Client, Appointment, AppointmentType, ClientStatus } from "@vertgrow/database/types"

type AppointmentRow = Appointment & { clients: { id: string; name: string } }
type RecentClient   = Pick<Client, "id" | "name" | "status" | "updated_at">

// ── Date helpers ───────────────────────────────────────────────────────────────

function todayStr() {
  return new Date().toISOString().split("T")[0]
}

function todayRange() {
  const d = new Date()
  const y = d.getFullYear(), m = d.getMonth(), day = d.getDate()
  return {
    start: new Date(y, m, day).toISOString(),
    end:   new Date(y, m, day + 1).toISOString(),
  }
}

function weekRange() {
  const d   = new Date()
  const dow = d.getDay()
  const y = d.getFullYear(), m = d.getMonth(), day = d.getDate()
  return {
    start: new Date(y, m, day - dow).toISOString(),
    end:   new Date(y, m, day - dow + 7).toISOString(),
  }
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

function formatRelativeDate(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (diff === 0) return "today"
  if (diff === 1) return "yesterday"
  if (diff < 7)   return `${diff} days ago`
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")
}

// ── Style maps ─────────────────────────────────────────────────────────────────

const APPT_TYPE_LABEL: Record<AppointmentType, string> = {
  "quote":        "Quote",
  "installation": "Installation",
  "maintenance":  "Maintenance",
  "follow-up":    "Follow-up",
}

const APPT_TYPE_BADGE: Record<AppointmentType, string> = {
  "quote":        "bg-[#fef9c3] text-[#854d0e]",
  "installation": "bg-[#dbeafe] text-[#1e40af]",
  "maintenance":  "bg-vg-green-light text-vg-green-dark",
  "follow-up":    "bg-[#ede9fe] text-[#5b21b6]",
}

const STATUS_BADGE: Record<ClientStatus, { bg: string; text: string }> = {
  active:   { bg: "bg-vg-green",    text: "text-[#f7fff2]" },
  lead:     { bg: "bg-[#fef9c3]",   text: "text-[#854d0e]" },
  inactive: { bg: "bg-[#dce2f3]",   text: "text-vg-body"   },
}

const AVATAR_COLORS: Record<ClientStatus, { bg: string; text: string }> = {
  active:   { bg: "bg-vg-green-light", text: "text-vg-green-dark" },
  lead:     { bg: "bg-[#bdcac1]",      text: "text-[#535f58]"     },
  inactive: { bg: "bg-[#dce2f3]",      text: "text-vg-body"       },
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase  = await createClient()
  const today     = todayStr()
  const { start: todayStart, end: todayEnd } = todayRange()
  const { start: weekStart,  end: weekEnd  } = weekRange()

  const [
    { data: rawAppointments },
    { data: rawReminders },
    { count: totalClients },
    { count: activeProjects },
    { count: weekAppointments },
    { count: overdueCount },
    { data: rawRecent },
  ] = await Promise.all([
    supabase
      .from("appointments")
      .select("*, clients(id, name)")
      .gte("date", todayStart)
      .lt("date", todayEnd)
      .eq("status", "scheduled")
      .order("date", { ascending: true }),
    supabase
      .from("reminders")
      .select("*, clients(id, name)")
      .lte("due_date", today)
      .eq("done", false)
      .order("due_date", { ascending: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
    supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .gte("date", weekStart)
      .lt("date", weekEnd)
      .eq("status", "scheduled"),
    supabase
      .from("reminders")
      .select("*", { count: "exact", head: true })
      .lt("due_date", today)
      .eq("done", false),
    supabase
      .from("clients")
      .select("id, name, status, updated_at")
      .order("updated_at", { ascending: false })
      .limit(5),
  ])

  const appointments  = (rawAppointments  ?? []) as AppointmentRow[]
  const reminders     = (rawReminders     ?? []) as ReminderRow[]
  const recentClients = (rawRecent        ?? []) as RecentClient[]

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-vg-heading">Dashboard</h1>
        <p className="mt-1 text-base text-vg-body">Here's what's happening today.</p>
      </div>

      {/* Quick stats */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wider text-vg-muted mb-3">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Clients"
            value={totalClients ?? 0}
            href="/clients"
            icon={<UsersIcon />}
          />
          <StatCard
            label="Active Projects"
            value={activeProjects ?? 0}
            href="/projects"
            icon={<FolderIcon />}
          />
          <StatCard
            label="Appointments This Week"
            value={weekAppointments ?? 0}
            href="/appointments"
            icon={<CalendarIcon />}
          />
          <StatCard
            label="Overdue Reminders"
            value={overdueCount ?? 0}
            href="#reminders-due"
            icon={<BellIcon />}
            accent={(overdueCount ?? 0) > 0}
          />
        </div>
      </section>

      {/* Two-column grid — stacks on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's appointments */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-vg-muted mb-3">
            Today's Appointments
          </h2>
          <div className="bg-white border border-vg-border rounded-xl shadow-sm overflow-hidden">
            {appointments.length === 0 ? (
              <SectionEmpty
                icon={<CalendarEmptyIcon />}
                message="No appointments scheduled for today."
              />
            ) : (
              <ul className="divide-y divide-vg-border">
                {appointments.map((appt) => (
                  <li key={appt.id}>
                    <Link
                      href={`/appointments/${appt.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="shrink-0 text-center w-14">
                        <p className="text-sm font-bold text-vg-heading leading-tight">
                          {formatTime(appt.date)}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-vg-heading text-sm truncate">
                          {appt.clients.name}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${APPT_TYPE_BADGE[appt.type]}`}>
                          {APPT_TYPE_LABEL[appt.type]}
                        </span>
                      </div>
                      <ChevronIcon />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Reminders due — client component for "Mark done" */}
        <RemindersSection reminders={reminders} today={today} />

        {/* Recent clients — full width */}
        <section className="md:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-vg-muted mb-3">
            Recent Clients
          </h2>
          <div className="bg-white border border-vg-border rounded-xl shadow-sm overflow-hidden">
            {recentClients.length === 0 ? (
              <SectionEmpty icon={<UsersEmptyIcon />} message="No clients added yet." />
            ) : (
              <ul className="divide-y divide-vg-border">
                {recentClients.map((client) => (
                  <li key={client.id}>
                    <Link
                      href={`/clients/${client.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className={`flex items-center justify-center size-9 rounded-full shrink-0 text-xs font-bold ${AVATAR_COLORS[client.status].bg} ${AVATAR_COLORS[client.status].text}`}>
                        {initials(client.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-vg-heading text-sm truncate">
                          {client.name}
                        </p>
                        <p className="text-xs text-vg-muted">
                          Updated {formatRelativeDate(client.updated_at)}
                        </p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${STATUS_BADGE[client.status].bg} ${STATUS_BADGE[client.status].text}`}>
                        {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

// ── Shared sub-components ──────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  href,
  icon,
  accent = false,
}: {
  label: string
  value: number
  href: string
  icon: React.ReactNode
  accent?: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col gap-3 p-5 rounded-xl border shadow-sm hover:shadow-md transition-shadow bg-white ${
        accent ? "border-vg-error" : "border-vg-border"
      }`}
    >
      <div className={`size-9 rounded-lg flex items-center justify-center ${
        accent ? "bg-[#fce8e8]" : "bg-vg-green-light"
      }`}>
        {icon}
      </div>
      <div>
        <p className={`text-3xl font-bold leading-none ${accent ? "text-vg-error" : "text-vg-heading"}`}>
          {value}
        </p>
        <p className="text-xs text-vg-muted mt-1 leading-snug">{label}</p>
      </div>
    </Link>
  )
}

function SectionEmpty({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center gap-2">
      <div className="size-10 rounded-full bg-vg-green-light flex items-center justify-center">
        {icon}
      </div>
      <p className="text-sm text-vg-body">{message}</p>
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006b2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function FolderIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006b2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006b2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function CalendarEmptyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006b2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function UsersEmptyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006b2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-vg-muted shrink-0">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

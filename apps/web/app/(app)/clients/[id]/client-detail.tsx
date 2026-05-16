"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { deleteClientRecord } from "../actions"
import { ClientForm } from "../client-form"
import type {
  Client, Appointment, Project, Reminder,
  AppointmentType, AppointmentStatus, ProjectStatus, ReminderType,
} from "@vertgrow/database/types"

// ── Label maps ────────────────────────────────────────────────────────────────

const APPT_TYPE_LABEL: Record<AppointmentType, string> = {
  quote:        "Quote",
  installation: "Installation",
  maintenance:  "Maintenance",
  "follow-up":  "Follow-up",
}

const APPT_STATUS_BADGE: Record<AppointmentStatus, string> = {
  scheduled: "bg-[#fef9c3] text-[#854d0e]",
  completed: "bg-vg-green-light text-vg-green-dark",
  cancelled: "bg-[#fee2e2] text-vg-error",
}

const PROJ_STATUS_LABEL: Record<ProjectStatus, string> = {
  planning:    "Planning",
  in_progress: "In Progress",
  completed:   "Completed",
}

const PROJ_STATUS_BADGE: Record<ProjectStatus, string> = {
  planning:    "bg-[#dbeafe] text-[#1e40af]",
  in_progress: "bg-[#fef9c3] text-[#854d0e]",
  completed:   "bg-vg-green-light text-vg-green-dark",
}

const REMINDER_TYPE_LABEL: Record<ReminderType, string> = {
  "follow-up-call":      "Follow-up Call",
  "seasonal-maintenance": "Seasonal Maintenance",
  "quote-expiry":        "Quote Expiry",
  custom:                "Custom",
}

const CLIENT_STATUS_BADGE: Record<Client["status"], { bg: string; text: string }> = {
  active:   { bg: "bg-vg-green",    text: "text-[#f7fff2]" },
  lead:     { bg: "bg-[#fef9c3]",   text: "text-[#854d0e]" },
  inactive: { bg: "bg-[#dce2f3]",   text: "text-vg-body"   },
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ClientDetail({
  client,
  appointments,
  projects,
  reminders,
}: {
  client: Client
  appointments: Appointment[]
  projects: Project[]
  reminders: Reminder[]
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError,   setDeleteError]   = useState<string | null>(null)
  const [isPending, startTransition]      = useTransition()

  function handleDelete() {
    setDeleteError(null)
    startTransition(async () => {
      const result = await deleteClientRecord(client.id)
      if (result?.error) setDeleteError(result.error)
      // redirect to /clients handled inside the action on success
    })
  }

  const badge = CLIENT_STATUS_BADGE[client.status]

  return (
    <div className="flex flex-col gap-8">
      {/* Page header */}
      <div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-sm text-vg-body hover:text-vg-heading transition-colors mb-4"
        >
          <ChevronLeftIcon />
          Clients
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-12 rounded-full bg-vg-green-light text-vg-green-dark text-base font-bold shrink-0">
            {initials(client.name)}
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-vg-heading">{client.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${badge.bg} ${badge.text}`}>
                {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
              </span>
              <span className="text-sm text-vg-muted">Added {formatDate(client.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <section>
        <h2 className="text-lg font-bold text-vg-heading mb-4">Client Details</h2>
        <ClientForm client={client} />
      </section>

      {/* Appointments */}
      <section>
        <h2 className="text-lg font-bold text-vg-heading mb-4">Appointments</h2>
        {appointments.length === 0 ? (
          <EmptySection message="No appointments yet." />
        ) : (
          <div className="bg-white border border-vg-border rounded-xl shadow-sm divide-y divide-vg-border overflow-hidden">
            {appointments.map((a) => (
              <Link
                key={a.id}
                href={`/appointments/${a.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors gap-4"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold text-vg-heading truncate">
                    {APPT_TYPE_LABEL[a.type]}
                  </span>
                  <span className="text-xs text-vg-body">{formatDate(a.date)}</span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${APPT_STATUS_BADGE[a.status]}`}>
                  {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Projects */}
      <section>
        <h2 className="text-lg font-bold text-vg-heading mb-4">Projects</h2>
        {projects.length === 0 ? (
          <EmptySection message="No projects yet." />
        ) : (
          <div className="bg-white border border-vg-border rounded-xl shadow-sm divide-y divide-vg-border overflow-hidden">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/projects/${p.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors gap-4"
              >
                <span className="text-sm font-semibold text-vg-heading truncate">{p.title}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${PROJ_STATUS_BADGE[p.status]}`}>
                  {PROJ_STATUS_LABEL[p.status]}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Reminders */}
      <section>
        <h2 className="text-lg font-bold text-vg-heading mb-4">Upcoming Reminders</h2>
        {reminders.length === 0 ? (
          <EmptySection message="No upcoming reminders." />
        ) : (
          <div className="bg-white border border-vg-border rounded-xl shadow-sm divide-y divide-vg-border overflow-hidden">
            {reminders.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-4 gap-4">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold text-vg-heading">
                    {REMINDER_TYPE_LABEL[r.type]}
                  </span>
                  {r.note && (
                    <span className="text-xs text-vg-body truncate">{r.note}</span>
                  )}
                </div>
                <span className="text-xs text-vg-muted shrink-0">{formatDate(r.due_date)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Danger zone */}
      <section>
        <h2 className="text-lg font-bold text-vg-heading mb-4">Danger Zone</h2>
        <div className="bg-white border border-vg-error/40 rounded-xl shadow-sm p-6">
          {deleteError && (
            <p className="mb-4 text-sm text-vg-error">{deleteError}</p>
          )}
          {!confirmDelete ? (
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-vg-heading">Delete this client</p>
                <p className="text-xs text-vg-body mt-0.5">
                  Existing appointments, projects, and reminders will not be deleted.
                </p>
              </div>
              <button
                onClick={() => setConfirmDelete(true)}
                className="shrink-0 px-4 py-2 text-sm font-semibold text-vg-error border border-vg-error/40 rounded-lg hover:bg-[#fce8e8] transition-colors"
              >
                Delete Client
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <p className="text-sm font-semibold text-vg-heading">
                Are you sure? This cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="px-4 py-2 text-sm font-semibold text-white bg-vg-error rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {isPending ? "Deleting…" : "Yes, delete"}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 text-sm font-medium text-vg-body hover:text-vg-heading transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function EmptySection({ message }: { message: string }) {
  return (
    <div className="bg-white border border-vg-border rounded-xl shadow-sm px-5 py-8 text-center">
      <p className="text-sm text-vg-muted">{message}</p>
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

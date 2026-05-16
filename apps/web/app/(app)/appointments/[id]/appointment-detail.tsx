"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { updateAppointmentStatus, addReminderToAppointment, linkAppointmentToProject } from "../actions"
import type { AppointmentType, AppointmentStatus, ReminderType } from "@vertgrow/database/types"

export type AppointmentFull = {
  id: string
  client_id: string
  date: string
  duration_min: number
  type: AppointmentType
  status: AppointmentStatus
  notes: string | null
  project_id: string | null
  series_id: string | null
}

type ClientProject = { id: string; title: string }

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

const REMINDER_TYPE_OPTIONS: { label: string; value: ReminderType }[] = [
  { label: "Follow-up Call",       value: "follow-up-call"       },
  { label: "Seasonal Maintenance", value: "seasonal-maintenance" },
  { label: "Quote Expiry",         value: "quote-expiry"         },
  { label: "Custom",               value: "custom"               },
]

const DURATION_LABEL: Record<number, string> = {
  30:  "30 min",
  60:  "1 hour",
  120: "2 hours",
  240: "Half day",
  480: "Full day",
}

function durationLabel(min: number) {
  return DURATION_LABEL[min] ?? `${min} min`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

function todayIso() {
  return new Date().toISOString().split("T")[0]
}

const inputCls = "w-full h-10 px-3 bg-vg-bg-accent border border-vg-border rounded-lg text-sm text-vg-heading placeholder:text-vg-muted focus:outline-none focus:ring-2 focus:ring-vg-green focus:border-transparent"
const labelCls = "block text-xs font-semibold uppercase tracking-wide text-vg-muted mb-1.5"

export function AppointmentDetail({
  appointment,
  clientName,
  clientProjects,
}: {
  appointment: AppointmentFull
  clientName: string
  clientProjects: ClientProject[]
}) {
  const [status, setStatus]           = useState(appointment.status)
  const [statusPending, startStatus]  = useTransition()

  const [showReminder, setShowReminder] = useState(false)
  const [rType, setRType]             = useState<ReminderType>("follow-up-call")
  const [rDue,  setRDue]              = useState(todayIso())
  const [rNote, setRNote]             = useState("")
  const [rError, setRError]           = useState<string | null>(null)
  const [rPending, startReminder]     = useTransition()
  const [rSuccess, setRSuccess]       = useState(false)

  const [showProject, setShowProject] = useState(false)
  const [projectId,   setProjectId]   = useState(appointment.project_id ?? "")
  const [pPending, startProject]      = useTransition()

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as AppointmentStatus
    setStatus(next)
    startStatus(() => updateAppointmentStatus(appointment.id, next))
  }

  function handleAddReminder(e: React.FormEvent) {
    e.preventDefault()
    if (!rDue) return
    setRError(null)
    startReminder(async () => {
      const result = await addReminderToAppointment({
        appointment_id: appointment.id,
        client_id:      appointment.client_id,
        type:           rType,
        due_date:       rDue,
        note:           rNote,
      })
      if (result?.error) { setRError(result.error); return }
      setRSuccess(true)
      setRNote("")
      setTimeout(() => { setRSuccess(false); setShowReminder(false) }, 1500)
    })
  }

  function handleLinkProject(e: React.FormEvent) {
    e.preventDefault()
    if (!projectId) return
    startProject(() => linkAppointmentToProject(appointment.id, projectId))
    setShowProject(false)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <Link
        href="/appointments"
        className="inline-flex items-center gap-1.5 text-sm text-vg-body hover:text-vg-heading transition-colors"
      >
        <ChevronLeftIcon />
        Appointments
      </Link>

      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${TYPE_BADGE[appointment.type]}`}>
              {TYPE_LABEL[appointment.type]}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-vg-heading">
            {clientName}
          </h1>
          <p className="mt-1 text-base text-vg-body">
            {formatDate(appointment.date)} · {formatTime(appointment.date)}
          </p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main details — 2/3 */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {/* Details card */}
          <div className="bg-white border border-vg-border rounded-xl shadow-sm p-6 flex flex-col gap-5">
            <Row label="Client">
              <Link
                href={`/clients/${appointment.client_id}`}
                className="text-sm font-semibold text-vg-green-dark hover:underline"
              >
                {clientName}
              </Link>
            </Row>
            <Row label="Date">{formatDate(appointment.date)}</Row>
            <Row label="Time">{formatTime(appointment.date)}</Row>
            <Row label="Duration">{durationLabel(appointment.duration_min)}</Row>
            {appointment.series_id && (
              <Row label="Recurring">
                <span className="inline-flex items-center gap-1.5 text-sm text-vg-body">
                  <RepeatSmIcon />
                  Part of a recurring series · changes apply to this instance only
                </span>
              </Row>
            )}
            {appointment.project_id && (
              <Row label="Project">
                <Link
                  href={`/projects/${appointment.project_id}`}
                  className="text-sm font-semibold text-vg-green-dark hover:underline"
                >
                  View Project
                </Link>
              </Row>
            )}
          </div>

          {/* Notes card */}
          <div className="bg-white border border-vg-border rounded-xl shadow-sm p-6">
            <p className={labelCls}>Notes</p>
            {appointment.notes ? (
              <p className="text-sm text-vg-body whitespace-pre-wrap">{appointment.notes}</p>
            ) : (
              <p className="text-sm text-vg-muted italic">No notes.</p>
            )}
          </div>
        </div>

        {/* Side panel — 1/3 */}
        <div className="flex flex-col gap-4">
          {/* Status card */}
          <div className="bg-white border border-vg-border rounded-xl shadow-sm p-5">
            <p className={labelCls}>Status</p>
            <div className="relative">
              <select
                value={status}
                onChange={handleStatusChange}
                disabled={statusPending}
                className="w-full h-10 pl-3 pr-8 bg-vg-bg-accent border border-vg-border rounded-lg text-sm font-semibold text-vg-heading appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-vg-green disabled:opacity-60"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-vg-muted pointer-events-none">
                <ChevronDownIcon />
              </span>
            </div>
            {statusPending && (
              <p className="mt-2 text-xs text-vg-muted">Saving…</p>
            )}
          </div>

          {/* Actions card */}
          <div className="bg-white border border-vg-border rounded-xl shadow-sm p-5 flex flex-col gap-3">
            <p className={labelCls}>Actions</p>

            {/* Add Reminder toggle */}
            <button
              onClick={() => setShowReminder((v) => !v)}
              className="flex items-center gap-2 w-full text-sm font-medium text-vg-green-dark hover:text-vg-green transition-colors"
            >
              <BellPlusIcon />
              Add Reminder
              <span className="ml-auto text-vg-muted"><ChevronDownSmIcon open={showReminder} /></span>
            </button>

            {showReminder && (
              <form onSubmit={handleAddReminder} className="flex flex-col gap-3 pt-2 border-t border-vg-border">
                {rError && (
                  <p className="text-xs text-vg-error">{rError}</p>
                )}
                {rSuccess && (
                  <p className="text-xs text-vg-green-dark font-semibold">Reminder added!</p>
                )}
                <div>
                  <label className={labelCls}>Type</label>
                  <select
                    value={rType}
                    onChange={(e) => setRType(e.target.value as ReminderType)}
                    className="w-full h-9 pl-3 pr-8 bg-vg-bg-accent border border-vg-border rounded-lg text-sm text-vg-heading appearance-none focus:outline-none focus:ring-2 focus:ring-vg-green"
                  >
                    {REMINDER_TYPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Due date</label>
                  <input
                    type="date"
                    value={rDue}
                    onChange={(e) => setRDue(e.target.value)}
                    required
                    className="w-full h-9 px-3 bg-vg-bg-accent border border-vg-border rounded-lg text-sm text-vg-heading focus:outline-none focus:ring-2 focus:ring-vg-green"
                  />
                </div>
                <div>
                  <label className={labelCls}>Note (optional)</label>
                  <textarea
                    value={rNote}
                    onChange={(e) => setRNote(e.target.value)}
                    rows={2}
                    placeholder="What needs to happen?"
                    className="w-full px-3 py-2 bg-vg-bg-accent border border-vg-border rounded-lg text-sm text-vg-heading placeholder:text-vg-muted focus:outline-none focus:ring-2 focus:ring-vg-green resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={rPending}
                  className="w-full h-9 bg-vg-green-dark text-white text-sm font-semibold rounded-lg hover:bg-vg-green transition-colors disabled:opacity-60"
                >
                  {rPending ? "Saving…" : "Save Reminder"}
                </button>
              </form>
            )}

            {/* Link to Project */}
            {clientProjects.length > 0 && (
              <>
                <div className="border-t border-vg-border" />
                <button
                  onClick={() => setShowProject((v) => !v)}
                  className="flex items-center gap-2 w-full text-sm font-medium text-vg-green-dark hover:text-vg-green transition-colors"
                >
                  <FolderLinkIcon />
                  Link to Project
                  <span className="ml-auto text-vg-muted"><ChevronDownSmIcon open={showProject} /></span>
                </button>

                {showProject && (
                  <form onSubmit={handleLinkProject} className="flex flex-col gap-3 pt-2 border-t border-vg-border">
                    <select
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      className="w-full h-9 pl-3 pr-8 bg-vg-bg-accent border border-vg-border rounded-lg text-sm text-vg-heading appearance-none focus:outline-none focus:ring-2 focus:ring-vg-green"
                    >
                      <option value="">Select a project…</option>
                      {clientProjects.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      disabled={!projectId || pPending}
                      className="w-full h-9 bg-vg-green-dark text-white text-sm font-semibold rounded-lg hover:bg-vg-green transition-colors disabled:opacity-60"
                    >
                      {pPending ? "Linking…" : "Link Project"}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-vg-muted w-28 shrink-0">
        {label}
      </span>
      <span className="text-sm text-vg-heading">{children}</span>
    </div>
  )
}

function ChevronDownSmIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={`transition-transform ${open ? "rotate-180" : ""}`}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function RepeatSmIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-vg-muted shrink-0">
      <path d="m17 2 4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="m7 22-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function BellPlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      <line x1="12" y1="5" x2="12" y2="1" />
      <line x1="10" y1="3" x2="14" y2="3" />
    </svg>
  )
}

function FolderLinkIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  )
}

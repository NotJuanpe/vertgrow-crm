"use client"

import { useState, useMemo, useTransition, useRef } from "react"
import Link from "next/link"
import { createAppointment } from "../actions"
import type { AppointmentType, AppointmentStatus, RecurrenceType } from "@vertgrow/database/types"

type ClientOption = { id: string; name: string }

const DURATION_OPTIONS = [
  { label: "30 min",   value: 30  },
  { label: "1 hour",   value: 60  },
  { label: "2 hours",  value: 120 },
  { label: "Half day", value: 240 },
  { label: "Full day", value: 480 },
]

const TYPE_OPTIONS: { label: string; value: AppointmentType }[] = [
  { label: "Quote",        value: "quote"        },
  { label: "Installation", value: "installation" },
  { label: "Maintenance",  value: "maintenance"  },
  { label: "Follow-up",    value: "follow-up"    },
]

const STATUS_OPTIONS: { label: string; value: AppointmentStatus }[] = [
  { label: "Scheduled", value: "scheduled" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
]

const inputCls = "w-full h-10 px-3 bg-vg-bg-accent border border-vg-border rounded-lg text-sm text-vg-heading placeholder:text-vg-muted focus:outline-none focus:ring-2 focus:ring-vg-green focus:border-transparent"
const selectCls = `${inputCls} appearance-none cursor-pointer`
const labelCls  = "block text-sm font-semibold text-vg-body mb-1.5"

export function AppointmentForm({ clients }: { clients: ClientOption[] }) {
  const [clientSearch, setClientSearch] = useState("")
  const [clientId,     setClientId]     = useState("")
  const [showSuggest,  setShowSuggest]  = useState(false)
  const [date,         setDate]         = useState("")
  const [time,         setTime]         = useState("")
  const [duration,     setDuration]     = useState(60)
  const [type,         setType]         = useState<AppointmentType>("quote")
  const [status,       setStatus]       = useState<AppointmentStatus>("scheduled")
  const [notes,        setNotes]        = useState("")
  const [isRecurring,  setIsRecurring]  = useState(false)
  const [recurrence,   setRecurrence]   = useState<RecurrenceType>("monthly")
  const [secondDay,    setSecondDay]    = useState("")
  const [error,        setError]        = useState<string | null>(null)
  const [fieldErrors,  setFieldErrors]  = useState<Partial<Record<string, string>>>({})
  const [isPending, startTransition]    = useTransition()
  const containerRef                    = useRef<HTMLDivElement>(null)

  const suggestions = useMemo(() => {
    if (!clientSearch.trim() || clientId) return []
    const q = clientSearch.toLowerCase()
    return clients.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8)
  }, [clients, clientSearch, clientId])

  function selectClient(c: ClientOption) {
    setClientId(c.id)
    setClientSearch(c.name)
    setShowSuggest(false)
    setFieldErrors((prev) => ({ ...prev, client: undefined }))
  }

  function validate() {
    const errs: Partial<Record<string, string>> = {}
    if (!clientId)   errs.client   = "Select a client"
    if (!date)       errs.date     = "Date is required"
    if (!time)       errs.time     = "Time is required"
    if (!type)       errs.type     = "Type is required"
    if (!status)     errs.status   = "Status is required"
    if (isRecurring && recurrence === "twice-monthly" && !secondDay)
      errs.secondDay = "Enter the second day of the month"
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setError(null)
    startTransition(async () => {
      const result = await createAppointment({
        client_id: clientId, date, time, duration_min: duration, type, status, notes,
        ...(isRecurring && {
          recurrence,
          second_day_of_month: recurrence === "twice-monthly" && secondDay
            ? parseInt(secondDay, 10)
            : undefined,
        }),
      })
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <Link
          href="/appointments"
          className="inline-flex items-center gap-1.5 text-sm text-vg-body hover:text-vg-heading transition-colors mb-4"
        >
          <ChevronLeftIcon />
          Appointments
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-vg-heading">New Appointment</h1>
        <p className="mt-1 text-base text-vg-body">Schedule a visit with a client.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-white border border-vg-border rounded-xl shadow-sm p-6 flex flex-col gap-6">
          {error && (
            <div className="px-4 py-3 bg-[#fce8e8] border border-vg-error rounded-lg text-sm text-vg-error">
              {error}
            </div>
          )}

          {/* Client combobox */}
          <div ref={containerRef}>
            <label className={labelCls}>Client <RequiredMark /></label>
            <div className="relative">
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value)
                  setClientId("")
                  setShowSuggest(true)
                }}
                onFocus={() => setShowSuggest(true)}
                onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
                placeholder="Search clients by name…"
                autoComplete="off"
                className={`${inputCls} pr-8 ${fieldErrors.client ? "border-vg-error ring-1 ring-vg-error" : ""}`}
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-vg-muted pointer-events-none">
                <SearchIcon />
              </span>
              {showSuggest && suggestions.length > 0 && (
                <ul className="absolute z-20 top-full left-0 right-0 mt-1 bg-white border border-vg-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {suggestions.map((c) => (
                    <li
                      key={c.id}
                      onMouseDown={(e) => { e.preventDefault(); selectClient(c) }}
                      className="px-4 py-2.5 text-sm text-vg-heading hover:bg-vg-bg-accent cursor-pointer"
                    >
                      {c.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {fieldErrors.client && <p className="mt-1 text-xs text-vg-error">{fieldErrors.client}</p>}
          </div>

          {/* Date + Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Date <RequiredMark /></label>
              <input
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); setFieldErrors((p) => ({ ...p, date: undefined })) }}
                className={`${inputCls} ${fieldErrors.date ? "border-vg-error ring-1 ring-vg-error" : ""}`}
              />
              {fieldErrors.date && <p className="mt-1 text-xs text-vg-error">{fieldErrors.date}</p>}
            </div>
            <div>
              <label className={labelCls}>Time <RequiredMark /></label>
              <input
                type="time"
                value={time}
                onChange={(e) => { setTime(e.target.value); setFieldErrors((p) => ({ ...p, time: undefined })) }}
                className={`${inputCls} ${fieldErrors.time ? "border-vg-error ring-1 ring-vg-error" : ""}`}
              />
              {fieldErrors.time && <p className="mt-1 text-xs text-vg-error">{fieldErrors.time}</p>}
            </div>
          </div>

          {/* Duration + Type + Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Duration <RequiredMark /></label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className={selectCls}
              >
                {DURATION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Type <RequiredMark /></label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AppointmentType)}
                className={selectCls}
              >
                {TYPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status <RequiredMark /></label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                className={selectCls}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Recurrence */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 cursor-pointer w-fit">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-vg-border rounded-full peer peer-checked:bg-vg-green-dark transition-colors" />
                <div className="absolute left-0.5 top-0.5 size-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <span className="text-sm font-semibold text-vg-body">Repeats</span>
            </label>

            {isRecurring && (
              <div className="flex flex-col gap-4 p-4 bg-vg-bg-accent border border-vg-border rounded-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Frequency</label>
                    <select
                      value={recurrence}
                      onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
                      className={selectCls}
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly (every 2 weeks)</option>
                      <option value="monthly">Monthly (same date)</option>
                      <option value="twice-monthly">Twice a month</option>
                    </select>
                  </div>

                  {recurrence === "twice-monthly" && (
                    <div>
                      <label className={labelCls}>Second day of month <span className="text-vg-error">*</span></label>
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={secondDay}
                        onChange={(e) => {
                          setSecondDay(e.target.value)
                          setFieldErrors((p) => { const n = { ...p }; delete n.secondDay; return n })
                        }}
                        placeholder="e.g. 15"
                        className={`${inputCls} ${fieldErrors.secondDay ? "border-vg-error ring-1 ring-vg-error" : ""}`}
                      />
                      {fieldErrors.secondDay && (
                        <p className="mt-1 text-xs text-vg-error">{fieldErrors.secondDay}</p>
                      )}
                      <p className="mt-1 text-xs text-vg-muted">First day comes from the date above</p>
                    </div>
                  )}
                </div>

                <p className="text-xs text-vg-muted">
                  Appointments will be created for the next 3 months starting from the date above.
                  Each instance can be edited or cancelled independently.
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this appointment…"
              rows={4}
              className="w-full px-3 py-2.5 bg-vg-bg-accent border border-vg-border rounded-lg text-sm text-vg-heading placeholder:text-vg-muted focus:outline-none focus:ring-2 focus:ring-vg-green focus:border-transparent resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2 border-t border-vg-border">
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 bg-vg-green-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-vg-green transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "Saving…" : isRecurring ? "Create Recurring Appointments" : "Create Appointment"}
            </button>
            <Link
              href="/appointments"
              className="text-sm font-medium text-vg-body hover:text-vg-heading transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}

function RequiredMark() {
  return <span className="text-vg-error ml-0.5">*</span>
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  )
}

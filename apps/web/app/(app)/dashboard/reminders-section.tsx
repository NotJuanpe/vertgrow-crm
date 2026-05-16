"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { markReminderDone } from "./actions"
import type { ReminderType } from "@vertgrow/database/types"

export type ReminderRow = {
  id: string
  client_id: string
  due_date: string
  type: ReminderType
  note: string | null
  done: boolean
  clients: { id: string; name: string }
}

const REMINDER_LABELS: Record<ReminderType, string> = {
  "follow-up-call":       "Follow-up Call",
  "seasonal-maintenance": "Seasonal Maintenance",
  "quote-expiry":         "Quote Expiry",
  "custom":               "Custom",
}

function formatDueDate(dateStr: string, today: string): { label: string; overdue: boolean } {
  if (dateStr === today) return { label: "Due today", overdue: false }
  const d = new Date(dateStr + "T00:00:00")
  const t = new Date(today + "T00:00:00")
  const diffDays = Math.round((t.getTime() - d.getTime()) / 86_400_000)
  if (diffDays === 1) return { label: "Yesterday", overdue: true }
  if (diffDays > 1)   return { label: `${diffDays} days overdue`, overdue: true }
  return { label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), overdue: false }
}

export function RemindersSection({
  reminders,
  today,
}: {
  reminders: ReminderRow[]
  today: string
}) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [, startTransition]       = useTransition()

  const visible = reminders.filter((r) => !dismissed.has(r.id))

  function handleMarkDone(id: string) {
    setDismissed((prev) => new Set([...prev, id]))
    startTransition(() => markReminderDone(id))
  }

  return (
    <section id="reminders-due">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-vg-muted mb-3">Reminders Due</h2>
      <div className="bg-white border border-vg-border rounded-xl shadow-sm overflow-hidden">
        {visible.length === 0 ? (
          <EmptyReminders />
        ) : (
          <ul className="divide-y divide-vg-border">
            {visible.map((reminder) => {
              const { label, overdue } = formatDueDate(reminder.due_date, today)
              return (
                <li key={reminder.id} className="flex items-start gap-3 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/clients/${reminder.clients.id}`}
                      className="font-semibold text-sm text-vg-heading hover:text-vg-green-dark transition-colors block truncate"
                    >
                      {reminder.clients.name}
                    </Link>
                    <p className="text-xs text-vg-body mt-0.5">{REMINDER_LABELS[reminder.type]}</p>
                    <p className={`text-xs mt-0.5 font-medium ${overdue ? "text-vg-error" : "text-vg-muted"}`}>
                      {label}
                    </p>
                  </div>
                  <button
                    onClick={() => handleMarkDone(reminder.id)}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-vg-green-dark border border-vg-green-dark rounded-lg hover:bg-vg-green-light transition-colors"
                    aria-label={`Mark reminder for ${reminder.clients.name} as done`}
                  >
                    <CheckIcon />
                    Done
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </section>
  )
}

function EmptyReminders() {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-6 text-center gap-2">
      <div className="size-10 rounded-full bg-vg-green-light flex items-center justify-center">
        <BellCheckIcon />
      </div>
      <p className="text-sm font-semibold text-vg-heading">All caught up!</p>
      <p className="text-xs text-vg-body">No reminders due today.</p>
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function BellCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#006b2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

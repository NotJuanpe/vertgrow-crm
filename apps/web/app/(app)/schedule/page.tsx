"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import type { PhaseStatus } from "@vertgrow/database/types"

type Project = { id: string; title: string; status: string }

type Phase = {
  id: string
  project_id: string
  name: string
  start_date: string
  end_date: string
  status: PhaseStatus
  notes: string | null
}

type FormState = {
  name: string
  start_date: string
  end_date: string
  status: PhaseStatus
  notes: string
}

const STATUS_STYLES: Record<PhaseStatus, { bar: string; badge: string; label: string }> = {
  pending:     { bar: "bg-gray-300",      badge: "bg-gray-100 text-gray-600",            label: "Pending"     },
  in_progress: { bar: "bg-vg-green",      badge: "bg-vg-green-light text-vg-green-dark", label: "In Progress" },
  done:        { bar: "bg-vg-green-dark", badge: "bg-vg-green-light text-vg-green-dark", label: "Done"        },
}

function parseLocalDate(s: string) {
  const [y, m, d] = s.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function todayDateStr() {
  return new Date().toISOString().slice(0, 10)
}
function plusDays(n: number) {
  return new Date(Date.now() + n * 864e5).toISOString().slice(0, 10)
}

export default function SchedulePage() {
  const supabase = useMemo(() => createClient(), [])

  const [projects, setProjects]       = useState<Project[]>([])
  const [selectedId, setSelectedId]   = useState<string>("")
  const [phases, setPhases]           = useState<Phase[]>([])
  const [loadingPage, setLoadingPage] = useState(true)
  const [showForm, setShowForm]       = useState(false)
  const [editId, setEditId]           = useState<string | null>(null)
  const [form, setForm]               = useState<FormState>({ name: "", start_date: "", end_date: "", status: "pending", notes: "" })
  const [formError, setFormError]     = useState<string | null>(null)
  const [saving, setSaving]           = useState(false)
  const [deleteId, setDeleteId]       = useState<string | null>(null)
  const [deleting, setDeleting]       = useState(false)

  useEffect(() => {
    supabase
      .from("projects")
      .select("id, title, status")
      .in("status", ["planning", "in_progress"])
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const list = (data ?? []) as Project[]
        setProjects(list)
        if (list.length) setSelectedId(list[0].id)
        setLoadingPage(false)
      })
  }, [supabase])

  useEffect(() => {
    if (!selectedId) return
    supabase
      .from("project_phases")
      .select("*")
      .eq("project_id", selectedId)
      .order("start_date")
      .then(({ data }) => setPhases((data ?? []) as Phase[]))
  }, [selectedId, supabase])

  // ── Gantt geometry ─────────────────────────────────────────────────────────

  const today = useMemo(() => {
    const t = new Date()
    return new Date(t.getFullYear(), t.getMonth(), t.getDate())
  }, [])

  const { minDate, spanMs, todayPct } = useMemo(() => {
    if (phases.length === 0) {
      return { minDate: today, spanMs: 30 * 864e5, todayPct: 0 }
    }
    const starts  = phases.map(p => parseLocalDate(p.start_date))
    const ends    = phases.map(p => parseLocalDate(p.end_date))
    const minDate = new Date(Math.min(...starts.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...ends.map(d => d.getTime())))
    const spanMs  = Math.max(maxDate.getTime() - minDate.getTime() + 864e5, 864e5)
    const todayPct = Math.max(0, Math.min(100, (today.getTime() - minDate.getTime()) / spanMs * 100))
    return { minDate, spanMs, todayPct }
  }, [phases, today])

  function leftPct(dateStr: string) {
    return Math.max(0, (parseLocalDate(dateStr).getTime() - minDate.getTime()) / spanMs * 100)
  }
  function widthPct(start: string, end: string) {
    const s = parseLocalDate(start).getTime()
    const e = parseLocalDate(end).getTime()
    return Math.max((e - s + 864e5) / spanMs * 100, 0.5)
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────

  async function refreshPhases() {
    const { data } = await supabase
      .from("project_phases")
      .select("*")
      .eq("project_id", selectedId)
      .order("start_date")
    setPhases((data ?? []) as Phase[])
  }

  async function savePhase() {
    if (!form.name.trim())               return setFormError("Phase name is required.")
    if (!form.start_date)                return setFormError("Start date is required.")
    if (!form.end_date)                  return setFormError("End date is required.")
    if (form.end_date < form.start_date) return setFormError("End date must be on or after the start date.")
    setFormError(null)
    setSaving(true)

    const payload = {
      name:       form.name.trim(),
      start_date: form.start_date,
      end_date:   form.end_date,
      status:     form.status,
      notes:      form.notes.trim() || null,
    }

    if (editId) {
      await supabase.from("project_phases").update(payload).eq("id", editId)
    } else {
      await supabase.from("project_phases").insert({ ...payload, project_id: selectedId })
    }

    await refreshPhases()
    setSaving(false)
    closeForm()
  }

  async function confirmDelete() {
    if (!deleteId) return
    setDeleting(true)
    await supabase.from("project_phases").delete().eq("id", deleteId)
    setPhases(prev => prev.filter(p => p.id !== deleteId))
    setDeleteId(null)
    setDeleting(false)
  }

  function openAdd() {
    setEditId(null)
    setForm({ name: "", start_date: todayDateStr(), end_date: plusDays(7), status: "pending", notes: "" })
    setFormError(null)
    setShowForm(true)
  }

  function openEdit(phase: Phase) {
    setEditId(phase.id)
    setForm({ name: phase.name, start_date: phase.start_date, end_date: phase.end_date, status: phase.status, notes: phase.notes ?? "" })
    setFormError(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditId(null)
    setFormError(null)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loadingPage) {
    return <p className="text-vg-muted text-sm">Loading…</p>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-vg-heading">Cronograma</h1>
          <p className="mt-1 text-base text-vg-body">Timeline and phase tracking for active projects.</p>
        </div>
        {selectedId && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-vg-green-dark text-white rounded-lg text-sm font-medium hover:bg-vg-green transition-colors self-start sm:self-auto"
          >
            <PlusIcon /> Add Phase
          </button>
        )}
      </div>

      {/* No active projects */}
      {projects.length === 0 ? (
        <div className="bg-white border border-vg-border rounded-xl p-10 text-center">
          <p className="text-vg-heading font-semibold">No active projects</p>
          <p className="text-vg-body text-sm mt-1">Create a project first to build its timeline.</p>
        </div>
      ) : (
        <>
          {/* Project selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-vg-body shrink-0">Project</label>
            <select
              value={selectedId}
              onChange={e => { setSelectedId(e.target.value); closeForm(); setDeleteId(null) }}
              className="border border-vg-border rounded-lg px-3 py-2 text-sm bg-white text-vg-heading focus:outline-none focus:ring-2 focus:ring-vg-green"
            >
              {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>

          {/* Add / Edit form */}
          {showForm && (
            <div className="bg-white border border-vg-border rounded-xl p-5 space-y-4 shadow-sm">
              <h2 className="text-sm font-semibold text-vg-heading">{editId ? "Edit phase" : "New phase"}</h2>
              {formError && <p className="text-sm text-vg-error">{formError}</p>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-vg-body mb-1">Phase name *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="e.g. Design, Procurement, Installation, Finishing"
                    className="w-full border border-vg-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-vg-green"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-vg-body mb-1">Start date *</label>
                  <input type="date" value={form.start_date}
                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full border border-vg-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-vg-green" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-vg-body mb-1">End date *</label>
                  <input type="date" value={form.end_date}
                    onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    className="w-full border border-vg-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-vg-green" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-vg-body mb-1">Status</label>
                  <select value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as PhaseStatus }))}
                    className="w-full border border-vg-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-vg-green">
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-vg-body mb-1">Notes</label>
                  <input value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Optional"
                    className="w-full border border-vg-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-vg-green" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={savePhase} disabled={saving}
                  className="px-4 py-2 bg-vg-green-dark text-white rounded-lg text-sm font-medium hover:bg-vg-green transition-colors disabled:opacity-60">
                  {saving ? "Saving…" : editId ? "Save changes" : "Add phase"}
                </button>
                <button onClick={closeForm}
                  className="px-4 py-2 border border-vg-border text-vg-body rounded-lg text-sm hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Gantt chart */}
          {phases.length === 0 ? (
            <div className="bg-white border border-vg-border rounded-xl p-10 text-center">
              <p className="text-vg-heading font-semibold">No phases yet</p>
              <p className="text-vg-body text-sm mt-1">Break the project down into phases to build the timeline.</p>
              <button onClick={openAdd} className="mt-3 text-sm font-medium text-vg-green-dark underline underline-offset-2">
                Add the first phase
              </button>
            </div>
          ) : (
            <div className="bg-white border border-vg-border rounded-xl overflow-hidden shadow-sm">
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-b border-vg-border text-xs text-vg-muted bg-vg-bg-accent">
                {(Object.entries(STATUS_STYLES) as [PhaseStatus, (typeof STATUS_STYLES)[PhaseStatus]][]).map(([key, s]) => (
                  <span key={key} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-sm ${s.bar}`} />
                    {s.label}
                  </span>
                ))}
                <span className="flex items-center gap-1.5 ml-auto">
                  <span className="w-0.5 h-3 bg-orange-400 inline-block rounded" />
                  Today
                </span>
              </div>

              {/* Timeline rows */}
              <div className="overflow-x-auto">
                <div className="min-w-[640px]">
                  {phases.map(phase => {
                    const s = STATUS_STYLES[phase.status]
                    const isDeleteTarget = deleteId === phase.id
                    return (
                      <div key={phase.id} className={`border-b border-vg-border last:border-0 ${isDeleteTarget ? "bg-red-50" : ""}`}>
                        <div className="flex items-center gap-3 px-5 py-3 group">
                          {/* Name + status badge */}
                          <div className="w-40 shrink-0">
                            <p className="text-sm font-medium text-vg-heading truncate">{phase.name}</p>
                            <span className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mt-0.5 ${s.badge}`}>
                              {s.label}
                            </span>
                          </div>

                          {/* Bar track */}
                          <div className="flex-1 relative h-8 min-w-0">
                            {/* Today marker */}
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-orange-400 z-10 rounded"
                              style={{ left: `${todayPct}%` }}
                            />
                            {/* Phase bar */}
                            <div
                              className={`absolute top-1.5 bottom-1.5 rounded cursor-pointer hover:opacity-75 transition-opacity ${s.bar}`}
                              style={{ left: `${leftPct(phase.start_date)}%`, width: `${widthPct(phase.start_date, phase.end_date)}%` }}
                              onClick={() => openEdit(phase)}
                              title={`${phase.start_date} → ${phase.end_date}${phase.notes ? ` · ${phase.notes}` : ""}`}
                            />
                          </div>

                          {/* Date range */}
                          <div className="w-24 shrink-0 text-right text-[11px] text-vg-muted leading-relaxed">
                            <p>{phase.start_date}</p>
                            <p>{phase.end_date}</p>
                          </div>

                          {/* Row actions (visible on hover) */}
                          <div className="shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEdit(phase)}
                              className="p-1.5 rounded-md hover:bg-gray-100 text-vg-muted hover:text-vg-heading transition-colors"
                              title="Edit phase">
                              <EditIcon />
                            </button>
                            <button onClick={() => setDeleteId(phase.id)}
                              className="p-1.5 rounded-md hover:bg-red-50 text-vg-muted hover:text-vg-error transition-colors"
                              title="Delete phase">
                              <TrashIcon />
                            </button>
                          </div>
                        </div>

                        {/* Inline delete confirmation */}
                        {isDeleteTarget && (
                          <div className="px-5 pb-3 flex items-center gap-3">
                            <p className="text-sm text-vg-error font-medium">
                              Delete &quot;{phase.name}&quot;? This cannot be undone.
                            </p>
                            <button onClick={confirmDelete} disabled={deleting}
                              className="px-3 py-1 bg-vg-error text-white rounded-md text-xs font-medium hover:opacity-90 disabled:opacity-60">
                              {deleting ? "Deleting…" : "Delete"}
                            </button>
                            <button onClick={() => setDeleteId(null)}
                              className="px-3 py-1 border border-vg-border text-vg-body rounded-md text-xs hover:bg-gray-50 transition-colors">
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

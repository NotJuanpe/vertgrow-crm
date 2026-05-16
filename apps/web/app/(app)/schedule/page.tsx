"use client"

import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

type Project = { id: string; title: string }

type Phase = {
  id: string
  project_id: string
  name: string
  start_date: string
  end_date: string
  status: "pending" | "in_progress" | "done"
  notes: string | null
}

type FormState = {
  name: string
  start_date: string
  end_date: string
  status: string
  notes: string
}

const EMPTY_FORM: FormState = { name: "", start_date: "", end_date: "", status: "pending", notes: "" }

const STATUS_STYLES = {
  pending:    { bar: "bg-gray-300",       badge: "bg-gray-100 text-gray-600",                  label: "Pending" },
  in_progress:{ bar: "bg-vg-green",       badge: "bg-vg-green-light text-vg-green-dark",       label: "In Progress" },
  done:       { bar: "bg-vg-green-dark",  badge: "bg-vg-green-light text-vg-green-dark",       label: "Done" },
} as const

export default function SchedulePage() {
  const supabase = createClient()

  const [projects, setProjects]   = useState<Project[]>([])
  const [selectedId, setSelectedId] = useState<string>("")
  const [phases, setPhases]       = useState<Phase[]>([])
  const [loadingPage, setLoadingPage] = useState(true)
  const [showForm, setShowForm]   = useState(false)
  const [editId, setEditId]       = useState<string | null>(null)
  const [form, setForm]           = useState<FormState>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)

  // Load projects on mount
  useEffect(() => {
    supabase
      .from("projects")
      .select("id, title")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const list = data ?? []
        setProjects(list)
        if (list.length) setSelectedId(list[0].id)
        setLoadingPage(false)
      })
  }, [])

  // Load phases when selected project changes
  useEffect(() => {
    if (!selectedId) return
    supabase
      .from("project_phases")
      .select("*")
      .eq("project_id", selectedId)
      .order("start_date")
      .then(({ data }) => setPhases(data ?? []))
  }, [selectedId])

  // ── Gantt helpers ──────────────────────────────────────────────────────────

  const parsedDates = phases.flatMap(p => [new Date(p.start_date), new Date(p.end_date)])
  const minMs = parsedDates.length ? Math.min(...parsedDates.map(d => d.getTime())) : Date.now()
  const maxMs = parsedDates.length ? Math.max(...parsedDates.map(d => d.getTime())) : Date.now() + 30 * 864e5
  const spanMs = maxMs - minMs || 864e5

  function leftPct(dateStr: string) {
    return ((new Date(dateStr).getTime() - minMs) / spanMs) * 100
  }
  function widthPct(start: string, end: string) {
    return Math.max(((new Date(end).getTime() - new Date(start).getTime()) / spanMs) * 100, 0.5)
  }
  const todayPct = Math.max(0, Math.min(100, ((Date.now() - minMs) / spanMs) * 100))

  // ── Phase CRUD ─────────────────────────────────────────────────────────────

  async function refreshPhases() {
    const { data } = await supabase
      .from("project_phases")
      .select("*")
      .eq("project_id", selectedId)
      .order("start_date")
    setPhases(data ?? [])
  }

  async function savePhase() {
    if (!form.name.trim())       return setFormError("Phase name is required.")
    if (!form.start_date)        return setFormError("Start date is required.")
    if (!form.end_date)          return setFormError("End date is required.")
    if (form.end_date < form.start_date) return setFormError("End date must be after start date.")
    setFormError(null)

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
    closeForm()
  }

  async function deletePhase(id: string) {
    if (!confirm("Delete this phase? This cannot be undone.")) return
    await supabase.from("project_phases").delete().eq("id", id)
    setPhases(prev => prev.filter(p => p.id !== id))
  }

  function openAdd() {
    setEditId(null)
    setForm(EMPTY_FORM)
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
    setForm(EMPTY_FORM)
    setFormError(null)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loadingPage) {
    return <p className="text-vg-muted text-sm">Loading…</p>
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vg-heading">Schedule</h1>
          <p className="text-sm text-vg-muted mt-0.5">Project timeline and phase tracking</p>
        </div>
        {selectedId && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-vg-green text-white rounded-lg text-sm font-medium hover:bg-vg-green-dark transition-colors"
          >
            <PlusIcon /> Add Phase
          </button>
        )}
      </div>

      {/* Project selector */}
      {projects.length === 0 ? (
        <div className="bg-white border border-vg-border rounded-xl p-8 text-center">
          <p className="text-vg-muted text-sm">No projects yet. Create a project first.</p>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-vg-body shrink-0">Project</label>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="border border-vg-border rounded-lg px-3 py-2 text-sm bg-white text-vg-heading focus:outline-none focus:ring-2 focus:ring-vg-green"
          >
            {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
      )}

      {/* Add / Edit form */}
      {showForm && (
        <div className="bg-white border border-vg-border rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-vg-heading">
            {editId ? "Edit phase" : "New phase"}
          </h2>

          {formError && (
            <p className="text-sm text-vg-error">{formError}</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-vg-body mb-1">Phase name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Procurement, Installation, Finishing"
                className="w-full border border-vg-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-vg-green"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-vg-body mb-1">Start date *</label>
              <input
                type="date"
                value={form.start_date}
                onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                className="w-full border border-vg-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-vg-green"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-vg-body mb-1">End date *</label>
              <input
                type="date"
                value={form.end_date}
                onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                className="w-full border border-vg-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-vg-green"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-vg-body mb-1">Status</label>
              <select
                value={form.status}
                onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full border border-vg-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-vg-green"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-vg-body mb-1">Notes</label>
              <input
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                placeholder="Optional"
                className="w-full border border-vg-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-vg-green"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={savePhase}
              className="px-4 py-2 bg-vg-green text-white rounded-lg text-sm font-medium hover:bg-vg-green-dark transition-colors"
            >
              {editId ? "Save changes" : "Add phase"}
            </button>
            <button
              onClick={closeForm}
              className="px-4 py-2 border border-vg-border text-vg-body rounded-lg text-sm hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Gantt chart */}
      {selectedId && (
        phases.length === 0 ? (
          <div className="bg-white border border-vg-border rounded-xl p-10 text-center">
            <p className="text-vg-muted text-sm">No phases for this project yet.</p>
            <button
              onClick={openAdd}
              className="mt-3 text-vg-green-dark text-sm font-medium underline underline-offset-2"
            >
              Add the first phase
            </button>
          </div>
        ) : (
          <div className="bg-white border border-vg-border rounded-xl overflow-hidden">
            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-b border-vg-border text-xs text-vg-muted">
              {(Object.entries(STATUS_STYLES) as [keyof typeof STATUS_STYLES, typeof STATUS_STYLES[keyof typeof STATUS_STYLES]][]).map(([key, s]) => (
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

            {/* Rows */}
            <div className="overflow-x-auto">
              <div className="min-w-[640px]">
                {phases.map(phase => {
                  const s = STATUS_STYLES[phase.status]
                  return (
                    <div
                      key={phase.id}
                      className="flex items-center gap-3 px-5 py-3 border-b border-vg-border last:border-0 group"
                    >
                      {/* Name + badge */}
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

                      {/* Dates */}
                      <div className="w-24 shrink-0 text-right text-[11px] text-vg-muted leading-relaxed">
                        <p>{phase.start_date}</p>
                        <p>{phase.end_date}</p>
                      </div>

                      {/* Actions (visible on hover) */}
                      <div className="shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(phase)}
                          className="p-1.5 rounded-md hover:bg-gray-100 text-vg-muted hover:text-vg-heading transition-colors"
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => deletePhase(phase.id)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-vg-muted hover:text-vg-error transition-colors"
                          title="Delete"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
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

"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { updateProjectRecord, deleteProjectRecord } from "../actions"
import type {
  Project, ProjectPhase, ProjectPlant,
  ProjectStatus, PhaseStatus, CareDifficulty,
  Client,
} from "@vertgrow/database/types"

// ── Label / badge maps ────────────────────────────────────────────────────────

const PROJ_STATUS_OPTIONS: { label: string; value: ProjectStatus }[] = [
  { label: "Planning",    value: "planning"    },
  { label: "In Progress", value: "in_progress" },
  { label: "Completed",   value: "completed"   },
]

const PROJ_STATUS_BADGE: Record<ProjectStatus, string> = {
  planning:    "bg-[#dbeafe] text-[#1e40af]",
  in_progress: "bg-[#fef9c3] text-[#854d0e]",
  completed:   "bg-vg-green-light text-vg-green-dark",
}

const PROJ_STATUS_LABEL: Record<ProjectStatus, string> = {
  planning:    "Planning",
  in_progress: "In Progress",
  completed:   "Completed",
}

const PHASE_STATUS_BADGE: Record<PhaseStatus, string> = {
  pending:     "bg-[#dce2f3] text-vg-body",
  in_progress: "bg-[#fef9c3] text-[#854d0e]",
  done:        "bg-vg-green-light text-vg-green-dark",
}

const PHASE_STATUS_LABEL: Record<PhaseStatus, string> = {
  pending:     "Pending",
  in_progress: "In Progress",
  done:        "Done",
}

const CARE_BADGE: Record<CareDifficulty, string> = {
  easy:      "bg-vg-green-light text-vg-green-dark",
  moderate:  "bg-[#fef9c3] text-[#854d0e]",
  demanding: "bg-[#fee2e2] text-vg-error",
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const inputCls  = "w-full h-10 px-3 bg-vg-bg-accent border border-vg-border rounded-lg text-sm text-vg-heading placeholder:text-vg-muted focus:outline-none focus:ring-2 focus:ring-vg-green focus:border-transparent"
const selectCls = `${inputCls} appearance-none cursor-pointer pr-8`
const labelCls  = "block text-sm font-semibold text-vg-body mb-1.5"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  })
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ProjectDetail({
  project,
  client,
  phases,
  plants,
}: {
  project: Project
  client: Pick<Client, "id" | "name"> | null
  phases: ProjectPhase[]
  plants: ProjectPlant[]
}) {
  const [title,       setTitle]       = useState(project.title)
  const [status,      setStatus]      = useState<ProjectStatus>(project.status)
  const [dimH,        setDimH]        = useState(project.dimensions_h?.toString() ?? "")
  const [dimW,        setDimW]        = useState(project.dimensions_w?.toString() ?? "")
  const [notes,       setNotes]       = useState(project.notes ?? "")

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({})
  const [formError,   setFormError]   = useState<string | null>(null)
  const [success,     setSuccess]     = useState(false)

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteError,   setDeleteError]   = useState<string | null>(null)

  const [isPending,   startTransition]    = useTransition()
  const [isDeleting,  startDeleteTransition] = useTransition()

  function validate() {
    const errs: Partial<Record<string, string>> = {}
    if (!title.trim()) errs.title = "Title is required"
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setFormError(null)
    setSuccess(false)

    startTransition(async () => {
      const result = await updateProjectRecord(project.id, {
        title,
        status,
        dimensions_h: dimH ? parseFloat(dimH) : null,
        dimensions_w: dimW ? parseFloat(dimW) : null,
        notes,
      })
      if (result && "error" in result) { setFormError(result.error); return }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 4000)
    })
  }

  function handleDelete() {
    setDeleteError(null)
    startDeleteTransition(async () => {
      const result = await deleteProjectRecord(project.id)
      if (result?.error) setDeleteError(result.error)
    })
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-vg-body hover:text-vg-heading transition-colors mb-4"
        >
          <ChevronLeftIcon />
          Projects
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-vg-heading">{project.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${PROJ_STATUS_BADGE[project.status]}`}>
                {PROJ_STATUS_LABEL[project.status]}
              </span>
              <span className="text-sm text-vg-muted">Created {formatDate(project.created_at)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <section>
        <h2 className="text-lg font-bold text-vg-heading mb-4">Project Details</h2>
        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-white border border-vg-border rounded-xl shadow-sm p-6 flex flex-col gap-6">
            {formError && (
              <div className="px-4 py-3 bg-[#fce8e8] border border-vg-error rounded-lg text-sm text-vg-error">
                {formError}
              </div>
            )}
            {success && (
              <div className="px-4 py-3 bg-[#f0fdf4] border border-vg-green rounded-lg text-sm text-vg-green-dark font-semibold">
                Project updated successfully.
              </div>
            )}

            {/* Title + Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Title <span className="text-vg-error ml-0.5">*</span></label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setFieldErrors((p) => { const n = { ...p }; delete n.title; return n }) }}
                  placeholder="Project title"
                  className={`${inputCls} ${fieldErrors.title ? "border-vg-error ring-1 ring-vg-error" : ""}`}
                />
                {fieldErrors.title && <p className="mt-1 text-xs text-vg-error">{fieldErrors.title}</p>}
              </div>
              <div>
                <label className={labelCls}>Status</label>
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                    className={selectCls}
                  >
                    {PROJ_STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-vg-muted pointer-events-none">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
            </div>

            {/* Dimensions */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Height (ft)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={dimH}
                  onChange={(e) => setDimH(e.target.value)}
                  placeholder="e.g. 12"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Width (ft)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={dimW}
                  onChange={(e) => setDimW(e.target.value)}
                  placeholder="e.g. 8"
                  className={inputCls}
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className={labelCls}>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any notes about this project…"
                rows={4}
                className="w-full px-3 py-2.5 bg-vg-bg-accent border border-vg-border rounded-lg text-sm text-vg-heading placeholder:text-vg-muted focus:outline-none focus:ring-2 focus:ring-vg-green focus:border-transparent resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-vg-border">
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-2 bg-vg-green-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-vg-green transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isPending ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Client */}
      <section>
        <h2 className="text-lg font-bold text-vg-heading mb-4">Client</h2>
        <div className="bg-white border border-vg-border rounded-xl shadow-sm overflow-hidden">
          {client ? (
            <Link
              href={`/clients/${client.id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors gap-4"
            >
              <span className="text-sm font-semibold text-vg-heading">{client.name}</span>
              <ChevronRightIcon />
            </Link>
          ) : (
            <div className="px-5 py-4">
              <p className="text-sm text-vg-muted">Client not found.</p>
            </div>
          )}
        </div>
      </section>

      {/* Phases */}
      <section>
        <h2 className="text-lg font-bold text-vg-heading mb-4">Phases</h2>
        {phases.length === 0 ? (
          <EmptySection message="No phases added yet." />
        ) : (
          <div className="bg-white border border-vg-border rounded-xl shadow-sm divide-y divide-vg-border overflow-hidden">
            {phases.map((ph) => (
              <div key={ph.id} className="flex items-center justify-between px-5 py-4 gap-4">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold text-vg-heading truncate">{ph.name}</span>
                  <span className="text-xs text-vg-body">
                    {formatDate(ph.start_date)} → {formatDate(ph.end_date)}
                  </span>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${PHASE_STATUS_BADGE[ph.status]}`}>
                  {PHASE_STATUS_LABEL[ph.status]}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Plants */}
      <section>
        <h2 className="text-lg font-bold text-vg-heading mb-4">Plant List</h2>
        {plants.length === 0 ? (
          <EmptySection message="No plants added yet." />
        ) : (
          <div className="bg-white border border-vg-border rounded-xl shadow-sm divide-y divide-vg-border overflow-hidden">
            {plants.map((pl) => (
              <div key={pl.id} className="flex items-center justify-between px-5 py-4 gap-4">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <span className="text-sm font-semibold text-vg-heading truncate">{pl.common_name}</span>
                  <span className="text-xs text-vg-muted italic truncate">{pl.scientific_name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {pl.care_difficulty && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${CARE_BADGE[pl.care_difficulty]}`}>
                      {pl.care_difficulty.charAt(0).toUpperCase() + pl.care_difficulty.slice(1)}
                    </span>
                  )}
                  {pl.approved && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-vg-green-light text-vg-green-dark">
                      Approved
                    </span>
                  )}
                </div>
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
                <p className="text-sm font-semibold text-vg-heading">Delete this project</p>
                <p className="text-xs text-vg-body mt-0.5">
                  This will permanently remove the project and all associated data.
                </p>
              </div>
              <button
                onClick={() => setConfirmDelete(true)}
                className="shrink-0 px-4 py-2 text-sm font-semibold text-vg-error border border-vg-error/40 rounded-lg hover:bg-[#fce8e8] transition-colors"
              >
                Delete Project
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
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-semibold text-white bg-vg-error rounded-lg hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {isDeleting ? "Deleting…" : "Yes, delete"}
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

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
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

"use client"

import { useState, useTransition } from "react"
import { savePlantsToProject } from "./actions"
import type { PlantResult } from "./actions"
import type { CareDifficulty } from "@vertgrow/database/types"

type Project = { id: string; title: string }
type AdvisorResult = { design_note: string; plants: PlantResult[] }
type Step = "form" | "loading" | "results" | "error"

const SUNLIGHT_OPTIONS  = ["Full sun", "Partial sun", "Shade"]
const STYLE_OPTIONS     = ["Tropical", "Minimal", "Colourful", "Native", "Edible"]
const MAINTENANCE_OPTIONS = ["Low", "Medium", "High"]

const DIFFICULTY_BADGE: Record<CareDifficulty, { bg: string; text: string; label: string }> = {
  easy:      { bg: "bg-vg-green-light", text: "text-vg-green-dark", label: "Easy"      },
  moderate:  { bg: "bg-[#fef9c3]",      text: "text-[#854d0e]",     label: "Moderate"  },
  demanding: { bg: "bg-[#fce8e8]",      text: "text-vg-error",      label: "Demanding" },
}

const inputCls  = "w-full h-10 px-3 bg-vg-bg-accent border border-vg-border rounded-lg text-sm text-vg-heading placeholder:text-vg-muted focus:outline-none focus:ring-2 focus:ring-vg-green focus:border-transparent"
const selectCls = `${inputCls} appearance-none cursor-pointer`
const labelCls  = "block text-sm font-semibold text-vg-body mb-1.5"
const errCls    = "mt-1 text-xs text-vg-error"

export function PlantAdvisor({ projects }: { projects: Project[] }) {
  // Image
  const [imagePreview,   setImagePreview]   = useState<string | null>(null)
  const [imageBase64,    setImageBase64]     = useState<string | null>(null)
  const [imageMimeType,  setImageMimeType]   = useState("image/jpeg")

  // Form fields
  const [climate,     setClimate]     = useState("")
  const [sunlight,    setSunlight]    = useState("")
  const [style,       setStyle]       = useState("")
  const [maintenance, setMaintenance] = useState("")
  const [dimH,        setDimH]        = useState("")
  const [dimW,        setDimW]        = useState("")
  const [notes,       setNotes]       = useState("")

  // Flow state
  const [step,        setStep]        = useState<Step>("form")
  const [result,      setResult]      = useState<AdvisorResult | null>(null)
  const [apiError,    setApiError]    = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Save state
  const [projectId,  setProjectId]  = useState("")
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle")
  const [saveError,  setSaveError]  = useState<string | null>(null)
  const [, startSave] = useTransition()

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setFieldErrors((p) => ({ ...p, image: "Image must be under 10 MB" }))
      return
    }
    setImageMimeType(file.type)
    setImagePreview(URL.createObjectURL(file))
    setFieldErrors((p) => { const n = { ...p }; delete n.image; return n })
    const reader = new FileReader()
    reader.onload = (ev) => {
      const data = ev.target?.result as string
      setImageBase64(data.split(",")[1])
    }
    reader.readAsDataURL(file)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs: Record<string, string> = {}
    if (!imageBase64)      errs.image       = "Upload a photo of the space"
    if (!climate.trim())   errs.climate     = "Climate / location is required"
    if (!sunlight)         errs.sunlight    = "Select a sunlight level"
    if (!style)            errs.style       = "Select a style"
    if (!maintenance)      errs.maintenance = "Select a maintenance level"
    setFieldErrors(errs)
    if (Object.keys(errs).length > 0) return

    setStep("loading")
    setApiError(null)
    try {
      const res = await fetch("/api/ai/plant-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64,
          imageMimeType,
          climate,
          sunlight,
          style,
          maintenance,
          dimensions: dimH && dimW ? { height: parseFloat(dimH), width: parseFloat(dimW) } : null,
          notes,
        }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error ?? "Failed to get recommendations")
      }
      const data: AdvisorResult = await res.json()
      setResult(data)
      setStep("results")
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
      setStep("error")
    }
  }

  function handleSave() {
    if (!projectId || !result) return
    setSaveStatus("idle")
    setSaveError(null)
    startSave(async () => {
      const res = await savePlantsToProject(projectId, result.plants)
      if (res?.error) { setSaveError(res.error); setSaveStatus("error") }
      else setSaveStatus("saved")
    })
  }

  function resetForm() {
    setStep("form")
    setResult(null)
    setApiError(null)
    setSaveStatus("idle")
    setSaveError(null)
    setProjectId("")
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (step === "loading") {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
        <div className="relative size-20">
          <div className="absolute inset-0 rounded-full border-4 border-vg-green-light" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-vg-green animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <LeafIcon />
          </div>
        </div>
        <div>
          <p className="text-lg font-bold text-vg-heading">Analyzing your space…</p>
          <p className="text-sm text-vg-muted mt-1">Claude is reviewing the photo and parameters.<br />This usually takes 5–10 seconds.</p>
        </div>
      </div>
    )
  }

  // ── Results ──────────────────────────────────────────────────────────────────
  if (step === "results" && result) {
    return (
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-vg-heading">Plant Recommendations</h1>
            <p className="mt-1 text-base text-vg-body">{result.design_note}</p>
          </div>
          <button
            onClick={resetForm}
            className="self-start sm:self-auto flex items-center gap-2 text-sm font-medium text-vg-body border border-vg-border px-4 py-2 rounded-lg hover:bg-vg-bg-accent transition-colors shrink-0"
          >
            <RefreshIcon />
            Start over
          </button>
        </div>

        {/* Photo + params summary */}
        {imagePreview && (
          <div className="flex items-center gap-4 p-4 bg-white border border-vg-border rounded-xl">
            <img src={imagePreview} alt="Uploaded space" className="size-16 rounded-lg object-cover shrink-0" />
            <div className="flex flex-wrap gap-2">
              {[climate, sunlight, style, maintenance].filter(Boolean).map((tag) => (
                <span key={tag} className="px-2.5 py-0.5 bg-vg-bg-accent border border-vg-border rounded-full text-xs font-medium text-vg-body">
                  {tag}
                </span>
              ))}
              {dimH && dimW && (
                <span className="px-2.5 py-0.5 bg-vg-bg-accent border border-vg-border rounded-full text-xs font-medium text-vg-body">
                  {dimH}m × {dimW}m
                </span>
              )}
            </div>
          </div>
        )}

        {/* Plant cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.plants.map((plant, i) => {
            const diff = DIFFICULTY_BADGE[plant.care_difficulty] ?? DIFFICULTY_BADGE.moderate
            return (
              <div key={i} className="bg-white border border-vg-border rounded-xl shadow-sm p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-bold text-vg-heading text-base">{plant.common_name}</p>
                    <p className="text-sm text-vg-muted italic">{plant.scientific_name}</p>
                  </div>
                  <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${diff.bg} ${diff.text}`}>
                    {diff.label}
                  </span>
                </div>
                <p className="text-sm text-vg-body leading-relaxed">{plant.why_it_fits}</p>
                {plant.pairing_note && (
                  <p className="text-xs text-vg-muted italic border-t border-vg-border pt-2">
                    <span className="font-semibold not-italic text-vg-body">Pairs with: </span>
                    {plant.pairing_note}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Save to project */}
        {projects.length > 0 && (
          <div className="bg-white border border-vg-border rounded-xl shadow-sm p-6">
            <h2 className="text-base font-bold text-vg-heading mb-1">Save to Project</h2>
            <p className="text-sm text-vg-body mb-4">Add these plants to an existing project's plant list.</p>
            {saveStatus === "saved" ? (
              <div className="flex items-center gap-2 text-vg-green-dark font-semibold text-sm">
                <CheckIcon />
                Saved to {projects.find((p) => p.id === projectId)?.title ?? "project"}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-xs">
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className={selectCls}
                  >
                    <option value="">Select a project…</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleSave}
                  disabled={!projectId}
                  className="flex items-center gap-2 bg-vg-green-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-vg-green transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <SaveIcon />
                  Save Plants
                </button>
              </div>
            )}
            {saveStatus === "error" && saveError && (
              <p className="mt-2 text-xs text-vg-error">{saveError}</p>
            )}
          </div>
        )}
      </div>
    )
  }

  // ── Form (+ error state) ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-vg-heading">Plant Advisor</h1>
        <p className="mt-1 text-base text-vg-body">Upload a photo and Claude will recommend the perfect plants for the space.</p>
      </div>

      {step === "error" && apiError && (
        <div className="flex items-start gap-3 px-4 py-3 bg-[#fce8e8] border border-vg-error rounded-xl text-sm text-vg-error">
          <AlertIcon />
          <div>
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-0.5">{apiError}</p>
            <button onClick={() => setStep("form")} className="mt-2 underline font-medium">
              Try again
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="bg-white border border-vg-border rounded-xl shadow-sm p-6 flex flex-col gap-6">

          {/* Image upload */}
          <div>
            <label className={labelCls}>Space photo <span className="text-vg-error">*</span></label>
            <div className={`flex items-center gap-4 p-4 border-2 border-dashed rounded-xl transition-colors ${
              fieldErrors.image ? "border-vg-error bg-[#fce8e8]" : "border-vg-border bg-vg-bg-accent hover:border-vg-green"
            }`}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="size-20 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="size-20 rounded-lg bg-vg-green-light flex items-center justify-center shrink-0">
                  <CameraIcon />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="space-photo"
                  className="inline-flex items-center gap-2 cursor-pointer bg-vg-green-dark text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-vg-green transition-colors w-fit"
                >
                  <UploadIcon />
                  {imagePreview ? "Change photo" : "Upload photo"}
                </label>
                <p className="text-xs text-vg-muted">JPG or PNG, max 10 MB</p>
                <input
                  id="space-photo"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </div>
            </div>
            {fieldErrors.image && <p className={errCls}>{fieldErrors.image}</p>}
          </div>

          {/* Climate */}
          <div>
            <label htmlFor="climate" className={labelCls}>Climate / location <span className="text-vg-error">*</span></label>
            <input
              id="climate"
              type="text"
              value={climate}
              onChange={(e) => { setClimate(e.target.value); setFieldErrors((p) => { const n={...p}; delete n.climate; return n }) }}
              placeholder="e.g. Miami, FL  or  temperate, UK"
              className={`${inputCls} ${fieldErrors.climate ? "border-vg-error ring-1 ring-vg-error" : ""}`}
            />
            {fieldErrors.climate && <p className={errCls}>{fieldErrors.climate}</p>}
          </div>

          {/* Sunlight + Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Sunlight <span className="text-vg-error">*</span></label>
              <div className="relative">
                <select
                  value={sunlight}
                  onChange={(e) => { setSunlight(e.target.value); setFieldErrors((p) => { const n={...p}; delete n.sunlight; return n }) }}
                  className={`${selectCls} pr-8 ${fieldErrors.sunlight ? "border-vg-error ring-1 ring-vg-error" : ""}`}
                >
                  <option value="">Select…</option>
                  {SUNLIGHT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDownIcon />
              </div>
              {fieldErrors.sunlight && <p className={errCls}>{fieldErrors.sunlight}</p>}
            </div>
            <div>
              <label className={labelCls}>Style <span className="text-vg-error">*</span></label>
              <div className="relative">
                <select
                  value={style}
                  onChange={(e) => { setStyle(e.target.value); setFieldErrors((p) => { const n={...p}; delete n.style; return n }) }}
                  className={`${selectCls} pr-8 ${fieldErrors.style ? "border-vg-error ring-1 ring-vg-error" : ""}`}
                >
                  <option value="">Select…</option>
                  {STYLE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDownIcon />
              </div>
              {fieldErrors.style && <p className={errCls}>{fieldErrors.style}</p>}
            </div>
          </div>

          {/* Maintenance + Dimensions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Maintenance <span className="text-vg-error">*</span></label>
              <div className="relative">
                <select
                  value={maintenance}
                  onChange={(e) => { setMaintenance(e.target.value); setFieldErrors((p) => { const n={...p}; delete n.maintenance; return n }) }}
                  className={`${selectCls} pr-8 ${fieldErrors.maintenance ? "border-vg-error ring-1 ring-vg-error" : ""}`}
                >
                  <option value="">Select…</option>
                  {MAINTENANCE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <ChevronDownIcon />
              </div>
              {fieldErrors.maintenance && <p className={errCls}>{fieldErrors.maintenance}</p>}
            </div>
            <div>
              <label className={labelCls}>Height (m) <span className="text-vg-muted font-normal text-xs">optional</span></label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={dimH}
                onChange={(e) => setDimH(e.target.value)}
                placeholder="e.g. 2.5"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Width (m) <span className="text-vg-muted font-normal text-xs">optional</span></label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={dimW}
                onChange={(e) => setDimW(e.target.value)}
                placeholder="e.g. 1.2"
                className={inputCls}
              />
            </div>
          </div>

          {/* Extra notes */}
          <div>
            <label className={labelCls}>Extra notes <span className="text-vg-muted font-normal text-xs">optional</span></label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. needs to hide a wall, client has dogs, budget is tight"
              rows={3}
              className="w-full px-3 py-2.5 bg-vg-bg-accent border border-vg-border rounded-lg text-sm text-vg-heading placeholder:text-vg-muted focus:outline-none focus:ring-2 focus:ring-vg-green focus:border-transparent resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 border-t border-vg-border">
            <button
              type="submit"
              className="flex items-center gap-2 bg-vg-green-dark text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-vg-green transition-colors"
            >
              <SparkleIcon />
              Get Plant Recommendations
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

// ── Icons ──────────────────────────────────────────────────────────────────────

function LeafIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#006b2c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#006b2c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function SparkleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-vg-muted pointer-events-none">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </span>
  )
}

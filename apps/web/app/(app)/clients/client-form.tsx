"use client"

import { useState, useTransition } from "react"
import { createClientRecord, updateClientRecord } from "./actions"
import type { Client, ClientStatus } from "@vertgrow/database/types"

const STATUS_OPTIONS: { label: string; value: ClientStatus }[] = [
  { label: "Lead",     value: "lead"     },
  { label: "Active",   value: "active"   },
  { label: "Inactive", value: "inactive" },
]

const inputCls  = "w-full h-10 px-3 bg-vg-bg-accent border border-vg-border rounded-lg text-sm text-vg-heading placeholder:text-vg-muted focus:outline-none focus:ring-2 focus:ring-vg-green focus:border-transparent"
const selectCls = `${inputCls} appearance-none cursor-pointer pr-8`
const labelCls  = "block text-sm font-semibold text-vg-body mb-1.5"

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

export function ClientForm({ client }: { client?: Client }) {
  const isEdit = !!client

  const [name,    setName]    = useState(client?.name    ?? "")
  const [phone,   setPhone]   = useState(client?.phone   ?? "")
  const [email,   setEmail]   = useState(client?.email   ?? "")
  const [address, setAddress] = useState(client?.address ?? "")
  const [status,  setStatus]  = useState<ClientStatus>(client?.status ?? "lead")
  const [notes,   setNotes]   = useState(client?.notes   ?? "")

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({})
  const [error,       setError]       = useState<string | null>(null)
  const [success,     setSuccess]     = useState(false)
  const [isPending, startTransition]  = useTransition()

  function validate() {
    const errs: Partial<Record<string, string>> = {}
    if (!name.trim())  errs.name   = "Name is required"
    if (!phone.trim()) errs.phone  = "Phone is required"
    if (!status)       errs.status = "Status is required"
    if (email.trim() && !isValidEmail(email.trim())) errs.email = "Enter a valid email address"
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  function clearFieldError(field: string) {
    setFieldErrors((p) => { const n = { ...p }; delete n[field]; return n })
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setError(null)
    setSuccess(false)

    const data = { name, phone, email, address, status, notes }

    startTransition(async () => {
      if (isEdit) {
        const result = await updateClientRecord(client!.id, data)
        if (result && "error" in result) { setError(result.error); return }
        setSuccess(true)
        setTimeout(() => setSuccess(false), 4000)
      } else {
        const result = await createClientRecord(data)
        if (result?.error) setError(result.error)
        // redirect to /clients/[id] handled inside the action on success
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="bg-white border border-vg-border rounded-xl shadow-sm p-6 flex flex-col gap-6">
        {error && (
          <div className="px-4 py-3 bg-[#fce8e8] border border-vg-error rounded-lg text-sm text-vg-error">
            {error}
          </div>
        )}
        {success && (
          <div className="px-4 py-3 bg-[#f0fdf4] border border-vg-green rounded-lg text-sm text-vg-green-dark font-semibold">
            Client updated successfully.
          </div>
        )}

        {/* Name + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Name <RequiredMark /></label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); clearFieldError("name") }}
              placeholder="Full name"
              className={`${inputCls} ${fieldErrors.name ? "border-vg-error ring-1 ring-vg-error" : ""}`}
            />
            {fieldErrors.name && <p className="mt-1 text-xs text-vg-error">{fieldErrors.name}</p>}
          </div>
          <div>
            <label className={labelCls}>Phone <RequiredMark /></label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); clearFieldError("phone") }}
              placeholder="+1 555 000 0000"
              className={`${inputCls} ${fieldErrors.phone ? "border-vg-error ring-1 ring-vg-error" : ""}`}
            />
            {fieldErrors.phone && <p className="mt-1 text-xs text-vg-error">{fieldErrors.phone}</p>}
          </div>
        </div>

        {/* Email + Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearFieldError("email") }}
              placeholder="client@example.com"
              className={`${inputCls} ${fieldErrors.email ? "border-vg-error ring-1 ring-vg-error" : ""}`}
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-vg-error">{fieldErrors.email}</p>}
          </div>
          <div>
            <label className={labelCls}>Status <RequiredMark /></label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value as ClientStatus); clearFieldError("status") }}
                className={`${selectCls} ${fieldErrors.status ? "border-vg-error ring-1 ring-vg-error" : ""}`}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-vg-muted pointer-events-none">
                <ChevronDownIcon />
              </span>
            </div>
            {fieldErrors.status && <p className="mt-1 text-xs text-vg-error">{fieldErrors.status}</p>}
          </div>
        </div>

        {/* Address */}
        <div>
          <label className={labelCls}>Address</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Main St, City, State"
            className={inputCls}
          />
        </div>

        {/* Notes */}
        <div>
          <label className={labelCls}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes about this client…"
            rows={4}
            className="w-full px-3 py-2.5 bg-vg-bg-accent border border-vg-border rounded-lg text-sm text-vg-heading placeholder:text-vg-muted focus:outline-none focus:ring-2 focus:ring-vg-green focus:border-transparent resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-2 border-t border-vg-border">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 bg-vg-green-dark text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-vg-green transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving…" : isEdit ? "Save Changes" : "Add Client"}
          </button>
        </div>
      </div>
    </form>
  )
}

function RequiredMark() {
  return <span className="text-vg-error ml-0.5">*</span>
}

function ChevronDownIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

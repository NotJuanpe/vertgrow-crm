"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError("Invalid email or password. Please try again.")
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-vg-bg px-4 overflow-hidden">
      {/* Decorative blur blobs */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -top-56 -right-32 size-[400px] rounded-full bg-vg-green-dark blur-[60px]" />
        <div className="absolute -bottom-56 -left-32 size-[300px] rounded-full bg-vg-green-light blur-[50px]" />
      </div>

      <div className="relative w-full max-w-[440px]">
        <div className="bg-white border border-vg-border rounded-xl shadow-sm p-10 flex flex-col gap-0">

          {/* Logo + heading */}
          <div className="flex flex-col items-center pb-8">
            <div className="mb-4 flex items-center justify-center rounded-lg bg-vg-green size-16">
              <LeafIcon />
            </div>
            <h1 className="text-2xl font-semibold text-vg-heading">Welcome Back</h1>
            <p className="mt-1 text-sm text-vg-body">Manage your vertical oasis</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold tracking-widest text-vg-body uppercase">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-vg-muted">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@vertgrow.com"
                  className="w-full h-12 pl-12 pr-4 bg-vg-bg border border-vg-border rounded-lg text-sm text-vg-heading placeholder:text-vg-muted focus:outline-none focus:ring-2 focus:ring-vg-green focus:border-transparent"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold tracking-widest text-vg-body uppercase">
                  Password
                </label>
                <span className="text-xs font-semibold tracking-widest text-vg-green-dark cursor-default">
                  Forgot Password?
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-vg-muted">
                  <LockIcon />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-12 pr-12 bg-vg-bg border border-vg-border rounded-lg text-sm text-vg-heading placeholder:text-vg-muted focus:outline-none focus:ring-2 focus:ring-vg-green focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-vg-muted hover:text-vg-body"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="size-4 rounded border-vg-border accent-vg-green"
              />
              <span className="text-sm text-vg-body">Keep me signed in</span>
            </label>

            {/* Error */}
            {error && (
              <p className="text-sm text-vg-error font-medium">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 h-[52px] w-full rounded-lg bg-vg-green text-[#f7fff2] text-lg font-semibold shadow-sm hover:bg-vg-green-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign In"}
              {!loading && <ArrowRightIcon />}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-vg-border text-center text-sm text-vg-body">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-vg-green-dark hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>

      {/* Version badge */}
      <div className="absolute bottom-8 right-8 flex items-center gap-3 bg-[#e2e8f8] border border-vg-border rounded-full px-4 py-3 shadow-lg">
        <span className="size-2 rounded-full bg-vg-green-dot" />
        <span className="text-xs font-semibold tracking-widest text-vg-heading">
          Precision Horticulture Engine v2.4
        </span>
      </div>
    </main>
  )
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function LeafIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="16" height="13" viewBox="0 0 24 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="2" rx="2" />
      <path d="m2 4 10 8 10-8" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="14" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="18" height="13" viewBox="0 0 24 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="18" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
    </svg>
  )
}

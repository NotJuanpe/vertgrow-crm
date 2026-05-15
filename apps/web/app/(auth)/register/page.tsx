"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-vg-bg px-4 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute -top-56 -right-32 size-[400px] rounded-full bg-vg-green-dark blur-[60px]" />
        <div className="absolute -bottom-56 -left-32 size-[300px] rounded-full bg-vg-green-light blur-[50px]" />
      </div>

      <div className="relative w-full max-w-[440px]">
        <div className="bg-white border border-vg-border rounded-xl shadow-sm p-10 flex flex-col gap-0">
          <div className="flex flex-col items-center pb-8">
            <div className="mb-4 flex items-center justify-center rounded-lg bg-vg-green size-16">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-vg-heading">Create Account</h1>
            <p className="mt-1 text-sm text-vg-body">Set up your VertGrow CRM</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold tracking-widest text-vg-body uppercase">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@vertgrow.com"
                className="w-full h-12 px-4 bg-vg-bg border border-vg-border rounded-lg text-sm text-vg-heading placeholder:text-vg-muted focus:outline-none focus:ring-2 focus:ring-vg-green focus:border-transparent"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold tracking-widest text-vg-body uppercase">
                Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full h-12 px-4 bg-vg-bg border border-vg-border rounded-lg text-sm text-vg-heading placeholder:text-vg-muted focus:outline-none focus:ring-2 focus:ring-vg-green focus:border-transparent"
              />
            </div>

            {error && (
              <p className="text-sm text-vg-error font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 h-[52px] w-full rounded-lg bg-vg-green text-[#f7fff2] text-lg font-semibold shadow-sm hover:bg-vg-green-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-vg-border text-center text-sm text-vg-body">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-vg-green-dark hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

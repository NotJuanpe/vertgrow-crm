import Link from "next/link"
import { ClientForm } from "../client-form"

export default function NewClientPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/clients"
          className="inline-flex items-center gap-1.5 text-sm text-vg-body hover:text-vg-heading transition-colors mb-4"
        >
          <ChevronLeftIcon />
          Clients
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-vg-heading">Add Client</h1>
        <p className="mt-1 text-base text-vg-body">Create a new client record.</p>
      </div>
      <ClientForm />
    </div>
  )
}

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

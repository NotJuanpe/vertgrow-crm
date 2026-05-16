import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Client, Appointment, Project, Reminder } from "@vertgrow/database/types"
import { ClientDetail } from "./client-detail"

export default async function ClientDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const [clientRes, apptRes, projRes, remRes] = await Promise.all([
    supabase.from("clients").select("*").eq("id", params.id).single(),
    supabase.from("appointments").select("*").eq("client_id", params.id).order("date", { ascending: false }),
    supabase.from("projects").select("*").eq("client_id", params.id).order("created_at", { ascending: false }),
    supabase.from("reminders").select("*").eq("client_id", params.id).eq("done", false).order("due_date", { ascending: true }),
  ])

  if (clientRes.error || !clientRes.data) notFound()

  return (
    <ClientDetail
      client={clientRes.data as Client}
      appointments={(apptRes.data ?? []) as Appointment[]}
      projects={(projRes.data ?? []) as Project[]}
      reminders={(remRes.data ?? []) as Reminder[]}
    />
  )
}

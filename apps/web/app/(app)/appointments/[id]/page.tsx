import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppointmentDetail } from "./appointment-detail"
import type { AppointmentFull } from "./appointment-detail"

export default async function AppointmentDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createClient()

  const { data: appt } = await supabase
    .from("appointments")
    .select("id, client_id, date, duration_min, type, status, notes, project_id, series_id")
    .eq("id", params.id)
    .single()

  if (!appt) notFound()

  const [{ data: client }, { data: projects }] = await Promise.all([
    supabase
      .from("clients")
      .select("id, name")
      .eq("id", appt.client_id)
      .single(),
    supabase
      .from("projects")
      .select("id, title")
      .eq("client_id", appt.client_id)
      .order("created_at", { ascending: false }),
  ])

  return (
    <AppointmentDetail
      appointment={appt as AppointmentFull}
      clientName={client?.name ?? "Unknown client"}
      clientProjects={projects ?? []}
    />
  )
}

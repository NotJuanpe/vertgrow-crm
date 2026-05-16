import { createClient } from "@/lib/supabase/server"
import { AppointmentList } from "./appointment-list"
import type { AppointmentRow } from "./appointment-list"

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("appointments")
    .select("*, clients(id, name)")
    .order("date", { ascending: true })

  if (error) {
    return (
      <div className="p-6 text-vg-error text-sm">
        Failed to load appointments: {error.message}
      </div>
    )
  }

  return <AppointmentList appointments={(data ?? []) as AppointmentRow[]} />
}

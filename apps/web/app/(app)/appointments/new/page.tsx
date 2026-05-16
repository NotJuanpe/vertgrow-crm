import { createClient } from "@/lib/supabase/server"
import { AppointmentForm } from "./appointment-form"

export default async function NewAppointmentPage() {
  const supabase = await createClient()
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name")
    .order("name", { ascending: true })

  return <AppointmentForm clients={clients ?? []} />
}

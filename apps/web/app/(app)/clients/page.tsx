import { createClient } from "@/lib/supabase/server"
import type { Client } from "@vertgrow/database/types"
import { ClientList } from "./client-list"

export default async function ClientsPage() {
  const supabase = await createClient()
  const { data: clients, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return (
      <div className="p-6 text-vg-error text-sm">
        Failed to load clients: {error.message}
      </div>
    )
  }

  return <ClientList clients={(clients as Client[]) ?? []} />
}

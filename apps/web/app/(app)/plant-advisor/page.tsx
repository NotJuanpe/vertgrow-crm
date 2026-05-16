import { createClient } from "@/lib/supabase/server"
import { PlantAdvisor } from "./plant-advisor"

export default async function PlantAdvisorPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title")
    .order("created_at", { ascending: false })

  return <PlantAdvisor projects={projects ?? []} />
}

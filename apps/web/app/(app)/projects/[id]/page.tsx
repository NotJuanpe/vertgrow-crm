import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Project, ProjectPhase, ProjectPlant, Client } from "@vertgrow/database/types"
import { ProjectDetail } from "./project-detail"

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const [projectRes, phasesRes, plantsRes] = await Promise.all([
    supabase.from("projects").select("*").eq("id", params.id).single(),
    supabase.from("project_phases").select("*").eq("project_id", params.id).order("start_date", { ascending: true }),
    supabase.from("project_plants").select("*").eq("project_id", params.id).order("created_at", { ascending: true }),
  ])

  if (projectRes.error || !projectRes.data) notFound()

  const project = projectRes.data as Project

  const clientRes = await supabase
    .from("clients")
    .select("id, name")
    .eq("id", project.client_id)
    .single()

  return (
    <ProjectDetail
      project={project}
      client={(clientRes.data ?? null) as Pick<Client, "id" | "name"> | null}
      phases={(phasesRes.data ?? []) as ProjectPhase[]}
      plants={(plantsRes.data ?? []) as ProjectPlant[]}
    />
  )
}

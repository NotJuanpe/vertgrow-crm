"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { CareDifficulty } from "@vertgrow/database/types"

export type PlantResult = {
  common_name: string
  scientific_name: string
  why_it_fits: string
  care_difficulty: CareDifficulty
  pairing_note: string
}

export async function savePlantsToProject(
  projectId: string,
  plants: PlantResult[]
): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const rows = plants.map((p) => ({
    project_id:      projectId,
    common_name:     p.common_name,
    scientific_name: p.scientific_name,
    why_it_fits:     p.why_it_fits,
    care_difficulty: p.care_difficulty,
    pairing_note:    p.pairing_note,
    approved:        false,
  }))
  const { error } = await supabase.from("project_plants").insert(rows)
  if (error) return { error: error.message }
  revalidatePath(`/projects/${projectId}`)
}

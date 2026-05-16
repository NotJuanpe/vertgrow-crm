"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import type { ProjectStatus } from "@vertgrow/database/types"

export async function updateProjectRecord(
  id: string,
  data: {
    title: string
    status: ProjectStatus
    dimensions_h: number | null
    dimensions_w: number | null
    notes: string
  }
): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseClient()
  const { error } = await supabase
    .from("projects")
    .update({
      title:        data.title.trim(),
      status:       data.status,
      dimensions_h: data.dimensions_h,
      dimensions_w: data.dimensions_w,
      notes:        data.notes.trim() || null,
    })
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath(`/projects/${id}`)
  revalidatePath("/projects")
  return { success: true }
}

export async function deleteProjectRecord(id: string): Promise<{ error: string } | void> {
  const supabase = await createSupabaseClient()
  const { error } = await supabase.from("projects").delete().eq("id", id)
  if (error) return { error: error.message }
  redirect("/projects")
}

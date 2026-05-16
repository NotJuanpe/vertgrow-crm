"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import type { ClientStatus } from "@vertgrow/database/types"

export async function createClientRecord(data: {
  name: string
  phone: string
  email: string
  address: string
  status: ClientStatus
  notes: string
}): Promise<{ error: string } | void> {
  const supabase = await createSupabaseClient()
  const { data: row, error } = await supabase
    .from("clients")
    .insert({
      name:    data.name.trim(),
      phone:   data.phone.trim(),
      email:   data.email.trim() || null,
      address: data.address.trim() || null,
      status:  data.status,
      notes:   data.notes.trim() || null,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }
  redirect(`/clients/${row.id}`)
}

export async function updateClientRecord(
  id: string,
  data: {
    name: string
    phone: string
    email: string
    address: string
    status: ClientStatus
    notes: string
  }
): Promise<{ error: string } | { success: true }> {
  const supabase = await createSupabaseClient()
  const { error } = await supabase
    .from("clients")
    .update({
      name:    data.name.trim(),
      phone:   data.phone.trim(),
      email:   data.email.trim() || null,
      address: data.address.trim() || null,
      status:  data.status,
      notes:   data.notes.trim() || null,
    })
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath(`/clients/${id}`)
  revalidatePath("/clients")
  return { success: true }
}

export async function deleteClientRecord(id: string): Promise<{ error: string } | void> {
  const supabase = await createSupabaseClient()
  const { error } = await supabase.from("clients").delete().eq("id", id)
  if (error) return { error: error.message }
  redirect("/clients")
}

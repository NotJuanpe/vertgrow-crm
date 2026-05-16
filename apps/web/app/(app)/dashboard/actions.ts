"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function markReminderDone(reminderId: string) {
  const supabase = await createClient()
  await supabase.from("reminders").update({ done: true }).eq("id", reminderId)
  revalidatePath("/dashboard")
}

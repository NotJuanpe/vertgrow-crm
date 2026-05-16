"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import type { AppointmentType, AppointmentStatus, ReminderType } from "@vertgrow/database/types"
import { generateAppointmentDates } from "@/lib/appointment-dates"

// ── Actions ────────────────────────────────────────────────────────────────────

export async function createAppointment(data: {
  client_id: string
  date: string              // "YYYY-MM-DD"
  time: string              // "HH:MM"
  duration_min: number
  type: AppointmentType
  status: AppointmentStatus
  notes: string
  recurrence?: RecurrenceType
  second_day_of_month?: number
}): Promise<{ error: string } | void> {
  const supabase = await createClient()

  if (data.recurrence) {
    // Insert the series record first
    const { data: series, error: seriesErr } = await supabase
      .from("recurring_series")
      .insert({
        client_id:           data.client_id,
        type:                data.type,
        duration_min:        data.duration_min,
        time:                data.time,
        recurrence:          data.recurrence,
        day_of_month:        new Date(data.date + "T00:00:00").getDate(),
        second_day_of_month: data.second_day_of_month ?? null,
        notes:               data.notes.trim() || null,
        starts_on:           data.date,
      })
      .select("id")
      .single()

    if (seriesErr) return { error: seriesErr.message }

    // Generate all instances for the next 3 months
    const dates = generateAppointmentDates(
      data.date, data.time, data.recurrence, data.second_day_of_month ?? null, 3
    )
    const rows = dates.map((date) => ({
      client_id:    data.client_id,
      date,
      duration_min: data.duration_min,
      type:         data.type,
      status:       "scheduled" as const,
      notes:        data.notes.trim() || null,
      project_id:   null,
      series_id:    series.id,
    }))

    const { error: insertErr } = await supabase.from("appointments").insert(rows)
    if (insertErr) return { error: insertErr.message }

    redirect("/appointments")
  }

  // Single appointment
  const { data: row, error } = await supabase
    .from("appointments")
    .insert({
      client_id:    data.client_id,
      date:         `${data.date}T${data.time}:00`,
      duration_min: data.duration_min,
      type:         data.type,
      status:       data.status,
      notes:        data.notes.trim() || null,
      project_id:   null,
      series_id:    null,
    })
    .select("id")
    .single()

  if (error) return { error: error.message }
  redirect(`/appointments/${row.id}`)
}

export async function updateAppointmentStatus(
  id: string,
  status: AppointmentStatus
): Promise<void> {
  const supabase = await createClient()
  await supabase.from("appointments").update({ status }).eq("id", id)
  revalidatePath(`/appointments/${id}`)
  revalidatePath("/appointments")
  revalidatePath("/dashboard")
}

export async function addReminderToAppointment(data: {
  appointment_id: string
  client_id: string
  type: ReminderType
  due_date: string
  note: string
}): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const { error } = await supabase.from("reminders").insert({
    appointment_id: data.appointment_id,
    client_id:      data.client_id,
    type:           data.type,
    due_date:       data.due_date,
    note:           data.note.trim() || null,
    done:           false,
  })
  if (error) return { error: error.message }
  revalidatePath(`/appointments/${data.appointment_id}`)
  revalidatePath("/dashboard")
}

export async function linkAppointmentToProject(
  appointmentId: string,
  projectId: string
): Promise<void> {
  const supabase = await createClient()
  await supabase
    .from("appointments")
    .update({ project_id: projectId })
    .eq("id", appointmentId)
  revalidatePath(`/appointments/${appointmentId}`)
}

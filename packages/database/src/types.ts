export type ClientStatus = "lead" | "active" | "inactive"
export type AppointmentType = "quote" | "installation" | "maintenance" | "follow-up"
export type AppointmentStatus = "scheduled" | "completed" | "cancelled"
export type RecurrenceType = "weekly" | "biweekly" | "monthly" | "twice-monthly"
export type ProjectStatus = "planning" | "in_progress" | "completed"
export type ReminderType = "follow-up-call" | "seasonal-maintenance" | "quote-expiry" | "custom"
export type MaintenanceLevel = "low" | "medium" | "high"
export type CareDifficulty = "easy" | "moderate" | "demanding"
export type PhaseStatus = "pending" | "in_progress" | "done"

export interface Client {
  id: string
  name: string
  email: string | null
  phone: string
  address: string | null
  status: ClientStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  client_id: string
  date: string
  duration_min: number
  type: AppointmentType
  status: AppointmentStatus
  notes: string | null
  project_id: string | null
  series_id: string | null
  created_at: string
}

export interface RecurringSeries {
  id: string
  client_id: string
  type: AppointmentType
  duration_min: number
  time: string
  recurrence: RecurrenceType
  day_of_month: number | null
  second_day_of_month: number | null
  notes: string | null
  starts_on: string
  created_at: string
}

export interface Reminder {
  id: string
  client_id: string
  appointment_id: string | null
  due_date: string
  type: ReminderType
  note: string | null
  done: boolean
  created_at: string
}

export interface Project {
  id: string
  client_id: string
  title: string
  status: ProjectStatus
  dimensions_h: number | null
  dimensions_w: number | null
  notes: string | null
  created_at: string
}

export interface ProjectPlant {
  id: string
  project_id: string
  common_name: string
  scientific_name: string
  why_it_fits: string | null
  care_difficulty: CareDifficulty | null
  pairing_note: string | null
  approved: boolean
  created_at: string
}

export interface ProjectPhoto {
  id: string
  project_id: string
  storage_path: string
  uploaded_at: string
}

export interface ProjectPhase {
  id: string
  project_id: string
  name: string
  start_date: string
  end_date: string
  status: PhaseStatus
  notes: string | null
  created_at: string
}

import type { RecurrenceType } from "@vertgrow/database/types"

export function clampDate(y: number, m: number, d: number): Date {
  const lastDay = new Date(y, m + 1, 0).getDate()
  return new Date(y, m, Math.min(d, lastDay))
}

export function toISO(d: Date, time: string) {
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${mo}-${day}T${time}:00`
}

export function generateAppointmentDates(
  startDate: string,
  time: string,
  recurrence: RecurrenceType,
  secondDayOfMonth: number | null,
  monthsAhead: number
): string[] {
  const dates: string[] = []
  const start = new Date(startDate + "T00:00:00")
  const end = new Date(start.getFullYear(), start.getMonth() + monthsAhead, start.getDate())

  if (recurrence === "weekly") {
    let cur = new Date(start)
    while (cur < end) { dates.push(toISO(cur, time)); cur.setDate(cur.getDate() + 7) }

  } else if (recurrence === "biweekly") {
    let cur = new Date(start)
    while (cur < end) { dates.push(toISO(cur, time)); cur.setDate(cur.getDate() + 14) }

  } else if (recurrence === "monthly") {
    const dom = start.getDate()
    let y = start.getFullYear(), m = start.getMonth()
    for (let i = 0; i < monthsAhead + 1; i++) {
      const d = clampDate(y, m, dom)
      if (d >= end) break
      if (d >= start) dates.push(toISO(d, time))
      m++; if (m > 11) { m = 0; y++ }
    }

  } else if (recurrence === "twice-monthly") {
    const first = start.getDate()
    const second = secondDayOfMonth ?? (first <= 15 ? first + 15 : first - 15)
    let y = start.getFullYear(), m = start.getMonth()
    for (let i = 0; i < (monthsAhead + 1) * 2; i++) {
      const d1 = clampDate(y, m, first)
      const d2 = clampDate(y, m, second)
      if (d1 >= end && d2 >= end) break
      if (d1 >= start && d1 < end) dates.push(toISO(d1, time))
      if (d2 >= start && d2 < end) dates.push(toISO(d2, time))
      m++; if (m > 11) { m = 0; y++ }
    }
    dates.sort()
  }

  return dates
}

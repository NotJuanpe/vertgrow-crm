import { describe, it, expect } from "vitest"
import { clampDate, toISO, generateAppointmentDates } from "../appointment-dates"

// ── clampDate ──────────────────────────────────────────────────────────────────

describe("clampDate", () => {
  it("returns the exact date when it exists in the month", () => {
    const d = clampDate(2025, 0, 15) // Jan 15
    expect(d.getFullYear()).toBe(2025)
    expect(d.getMonth()).toBe(0)
    expect(d.getDate()).toBe(15)
  })

  it("clamps day 31 to Jan 31 (valid)", () => {
    const d = clampDate(2025, 0, 31)
    expect(d.getDate()).toBe(31)
  })

  it("clamps day 31 to April 30 (April has 30 days)", () => {
    const d = clampDate(2025, 3, 31) // April
    expect(d.getDate()).toBe(30)
  })

  it("clamps day 30 to Feb 28 in a non-leap year", () => {
    const d = clampDate(2025, 1, 30) // Feb 2025
    expect(d.getDate()).toBe(28)
  })

  it("clamps day 30 to Feb 29 in a leap year", () => {
    const d = clampDate(2024, 1, 30) // Feb 2024 (leap year)
    expect(d.getDate()).toBe(29)
  })

  it("clamps day 29 to Feb 28 in a non-leap year", () => {
    const d = clampDate(2025, 1, 29)
    expect(d.getDate()).toBe(28)
  })
})

// ── toISO ──────────────────────────────────────────────────────────────────────

describe("toISO", () => {
  it("formats a date and time as ISO string", () => {
    const d = new Date(2025, 0, 5) // Jan 5 2025
    expect(toISO(d, "09:00")).toBe("2025-01-05T09:00:00")
  })

  it("pads single-digit month and day", () => {
    const d = new Date(2025, 2, 3) // March 3 2025
    expect(toISO(d, "14:30")).toBe("2025-03-03T14:30:00")
  })

  it("handles December correctly", () => {
    const d = new Date(2025, 11, 31) // Dec 31 2025
    expect(toISO(d, "08:00")).toBe("2025-12-31T08:00:00")
  })
})

// ── generateAppointmentDates — weekly ─────────────────────────────────────────

describe("generateAppointmentDates — weekly", () => {
  it("generates weekly dates for 1 month", () => {
    const dates = generateAppointmentDates("2025-01-06", "10:00", "weekly", null, 1)
    // Jan 6, 13, 20, 27 → 4 dates (Feb 3 >= end Jan 6 + 1 month = Feb 6, so also Feb 3)
    expect(dates.length).toBeGreaterThanOrEqual(4)
    expect(dates[0]).toBe("2025-01-06T10:00:00")
    expect(dates[1]).toBe("2025-01-13T10:00:00")
    expect(dates[2]).toBe("2025-01-20T10:00:00")
    expect(dates[3]).toBe("2025-01-27T10:00:00")
  })

  it("first date equals the start date", () => {
    const dates = generateAppointmentDates("2025-03-01", "09:00", "weekly", null, 1)
    expect(dates[0]).toBe("2025-03-01T09:00:00")
  })

  it("all dates are exactly 7 days apart", () => {
    const dates = generateAppointmentDates("2025-01-01", "08:00", "weekly", null, 3)
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1])
      const curr = new Date(dates[i])
      const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      expect(diffDays).toBe(7)
    }
  })

  it("stops before the end date (not inclusive)", () => {
    const dates = generateAppointmentDates("2025-01-01", "08:00", "weekly", null, 1)
    const end = new Date(2025, 1, 1) // Feb 1
    for (const date of dates) {
      expect(new Date(date) < end).toBe(true)
    }
  })
})

// ── generateAppointmentDates — biweekly ───────────────────────────────────────

describe("generateAppointmentDates — biweekly", () => {
  it("generates biweekly dates for 1 month", () => {
    const dates = generateAppointmentDates("2025-01-06", "10:00", "biweekly", null, 1)
    expect(dates[0]).toBe("2025-01-06T10:00:00")
    expect(dates[1]).toBe("2025-01-20T10:00:00")
  })

  it("all dates are exactly 14 days apart", () => {
    const dates = generateAppointmentDates("2025-01-01", "08:00", "biweekly", null, 3)
    for (let i = 1; i < dates.length; i++) {
      const prev = new Date(dates[i - 1])
      const curr = new Date(dates[i])
      const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      expect(diffDays).toBe(14)
    }
  })

  it("generates fewer dates than weekly over the same period", () => {
    const weekly = generateAppointmentDates("2025-01-01", "08:00", "weekly", null, 3)
    const biweekly = generateAppointmentDates("2025-01-01", "08:00", "biweekly", null, 3)
    expect(biweekly.length).toBeLessThan(weekly.length)
  })
})

// ── generateAppointmentDates — monthly ────────────────────────────────────────

describe("generateAppointmentDates — monthly", () => {
  it("generates monthly dates on the same day each month", () => {
    const dates = generateAppointmentDates("2025-01-15", "10:00", "monthly", null, 3)
    expect(dates[0]).toBe("2025-01-15T10:00:00")
    expect(dates[1]).toBe("2025-02-15T10:00:00")
    expect(dates[2]).toBe("2025-03-15T10:00:00")
  })

  it("clamps day 31 to last day of shorter months", () => {
    // Start Jan 31 — Feb should clamp to 28, Mar back to 31
    const dates = generateAppointmentDates("2025-01-31", "10:00", "monthly", null, 3)
    expect(dates[0]).toBe("2025-01-31T10:00:00")
    expect(dates[1]).toBe("2025-02-28T10:00:00") // Feb 2025 has 28 days
    expect(dates[2]).toBe("2025-03-31T10:00:00")
  })

  it("clamps day 31 to Feb 29 in a leap year", () => {
    const dates = generateAppointmentDates("2024-01-31", "10:00", "monthly", null, 2)
    expect(dates[1]).toBe("2024-02-29T10:00:00") // 2024 is a leap year
  })

  it("generates exactly monthsAhead dates when start is 1st of month", () => {
    const dates = generateAppointmentDates("2025-01-01", "09:00", "monthly", null, 3)
    expect(dates).toHaveLength(3)
  })
})

// ── generateAppointmentDates — twice-monthly ──────────────────────────────────

describe("generateAppointmentDates — twice-monthly", () => {
  it("generates two dates per month when secondDayOfMonth is provided", () => {
    const dates = generateAppointmentDates("2025-01-01", "10:00", "twice-monthly", 16, 1)
    const jan = dates.filter((d) => d.startsWith("2025-01"))
    expect(jan).toContain("2025-01-01T10:00:00")
    expect(jan).toContain("2025-01-16T10:00:00")
  })

  it("auto-calculates second day when not provided (first <= 15)", () => {
    // first = 5, so second = 5 + 15 = 20
    const dates = generateAppointmentDates("2025-01-05", "10:00", "twice-monthly", null, 1)
    const jan = dates.filter((d) => d.startsWith("2025-01"))
    expect(jan).toContain("2025-01-05T10:00:00")
    expect(jan).toContain("2025-01-20T10:00:00")
  })

  it("auto-calculates second day when not provided (first > 15)", () => {
    // first = 20, second = 20 - 15 = 5
    // Jan 5 is before the start date (Jan 20) so it's skipped in January
    // Feb 5 and Feb 20 are both within range
    const dates = generateAppointmentDates("2025-01-20", "10:00", "twice-monthly", null, 2)
    expect(dates).toContain("2025-01-20T10:00:00")
    expect(dates).toContain("2025-02-05T10:00:00")
    expect(dates).toContain("2025-02-20T10:00:00")
    expect(dates).not.toContain("2025-01-05T10:00:00") // before start, correctly excluded
  })

  it("returns dates in ascending order", () => {
    const dates = generateAppointmentDates("2025-01-20", "10:00", "twice-monthly", null, 2)
    for (let i = 1; i < dates.length; i++) {
      expect(dates[i] > dates[i - 1]).toBe(true)
    }
  })

  it("clamps twice-monthly dates to Feb last day", () => {
    // 28th and 31st → both clamp in February
    const dates = generateAppointmentDates("2025-01-28", "10:00", "twice-monthly", 31, 2)
    const feb = dates.filter((d) => d.startsWith("2025-02"))
    // Both 28 and 31 clamp to 28 in Feb 2025 — so only one unique date
    expect(feb.every((d) => d.includes("2025-02-28"))).toBe(true)
  })

  it("generates approximately 2x monthly count of dates", () => {
    const monthly = generateAppointmentDates("2025-01-01", "08:00", "monthly", null, 3)
    const twiceMonthly = generateAppointmentDates("2025-01-01", "08:00", "twice-monthly", 16, 3)
    expect(twiceMonthly.length).toBeGreaterThan(monthly.length)
  })
})

// ── Edge cases ────────────────────────────────────────────────────────────────

describe("generateAppointmentDates — edge cases", () => {
  it("returns empty array when monthsAhead is 0", () => {
    // end = start, so the while loop never executes
    const dates = generateAppointmentDates("2025-01-01", "10:00", "weekly", null, 0)
    expect(dates).toHaveLength(0)
  })

  it("includes correct time in all output strings", () => {
    const time = "14:45"
    const dates = generateAppointmentDates("2025-01-01", time, "weekly", null, 1)
    for (const date of dates) {
      expect(date).toMatch(/T14:45:00$/)
    }
  })

  it("handles year boundary correctly (Dec → Jan)", () => {
    const dates = generateAppointmentDates("2025-12-01", "09:00", "monthly", null, 2)
    expect(dates[0]).toBe("2025-12-01T09:00:00")
    expect(dates[1]).toBe("2026-01-01T09:00:00")
  })
})

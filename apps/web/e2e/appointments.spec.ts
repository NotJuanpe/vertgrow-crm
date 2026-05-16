import { test, expect } from "@playwright/test"

const TEST_EMAIL = process.env.E2E_EMAIL ?? ""
const TEST_PASSWORD = process.env.E2E_PASSWORD ?? ""

test.describe("Appointments (requires E2E_EMAIL + E2E_PASSWORD)", () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, "Set E2E_EMAIL and E2E_PASSWORD env vars to run")

  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
    await page.locator('input[type="email"]').fill(TEST_EMAIL)
    await page.locator('input[type="password"]').fill(TEST_PASSWORD)
    await page.getByRole("button", { name: "Sign In" }).click()
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
  })

  test("can navigate to appointments list", async ({ page }) => {
    await page.goto("/appointments")
    await expect(page).toHaveURL(/\/appointments/)
    await expect(page.getByRole("link", { name: /New Appointment|Schedule/i }).first()).toBeVisible({ timeout: 5000 })
  })

  test("new appointment form renders", async ({ page }) => {
    await page.goto("/appointments/new")
    await expect(page).toHaveURL(/\/appointments\/new/)
    // Should have a date input
    await expect(page.locator('input[type="date"]')).toBeVisible({ timeout: 5000 })
    // Should have a time input
    await expect(page.locator('input[type="time"]')).toBeVisible()
  })

  test("appointment types are selectable", async ({ page }) => {
    await page.goto("/appointments/new")
    const typeSelect = page.locator('select[name="type"]')
    await expect(typeSelect).toBeVisible({ timeout: 5000 })
    const options = await typeSelect.locator("option").allTextContents()
    expect(options.some((o) => /quote/i.test(o))).toBe(true)
    expect(options.some((o) => /maintenance/i.test(o))).toBe(true)
  })
})

import { test, expect } from "@playwright/test"

const TEST_EMAIL = process.env.E2E_EMAIL ?? ""
const TEST_PASSWORD = process.env.E2E_PASSWORD ?? ""

test.describe("Clients (requires E2E_EMAIL + E2E_PASSWORD)", () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, "Set E2E_EMAIL and E2E_PASSWORD env vars to run")

  test.beforeEach(async ({ page }) => {
    await page.goto("/login")
    await page.locator('input[type="email"]').fill(TEST_EMAIL)
    await page.locator('input[type="password"]').fill(TEST_PASSWORD)
    await page.getByRole("button", { name: "Sign In" }).click()
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })
  })

  test("can navigate to clients list", async ({ page }) => {
    await page.goto("/clients")
    await expect(page).toHaveURL(/\/clients/)
    await expect(page.getByRole("link", { name: /New Client|Add Client/i }).first()).toBeVisible({ timeout: 5000 })
  })

  test("new client page renders a form", async ({ page }) => {
    await page.goto("/clients/new")
    await expect(page.locator('input[name="name"], input[placeholder*="name" i]').first()).toBeVisible({ timeout: 5000 })
  })

  test("client form validates required fields", async ({ page }) => {
    await page.goto("/clients/new")
    const submit = page.getByRole("button", { name: /Save|Create|Add/i }).first()
    await submit.click()
    // Browser native validation or custom error should prevent submission
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first()
    const validationMessage = await nameInput.evaluate((el: HTMLInputElement) => el.validationMessage)
    expect(validationMessage.length).toBeGreaterThan(0)
  })
})

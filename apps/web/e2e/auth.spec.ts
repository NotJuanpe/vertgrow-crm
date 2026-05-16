import { test, expect } from "@playwright/test"

const TEST_EMAIL = process.env.E2E_EMAIL ?? ""
const TEST_PASSWORD = process.env.E2E_PASSWORD ?? ""

test.describe("Login page", () => {
  test("renders the login form", async ({ page }) => {
    await page.goto("/login")
    await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible()
  })

  test("shows error with wrong credentials", async ({ page }) => {
    await page.goto("/login")
    await page.locator('input[type="email"]').fill("wrong@example.com")
    await page.locator('input[type="password"]').fill("wrongpassword")
    await page.getByRole("button", { name: "Sign In" }).click()
    await expect(page.getByText("Invalid email or password")).toBeVisible({ timeout: 8000 })
  })

  test("show/hide password toggle works", async ({ page }) => {
    await page.goto("/login")
    const passwordInput = page.locator('input[type="password"]')
    await passwordInput.fill("secret123")
    await page.getByRole("button", { name: "Show password" }).click()
    await expect(page.locator('input[type="text"]')).toBeVisible()
    await page.getByRole("button", { name: "Hide password" }).click()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test("unauthenticated user is redirected to login from /dashboard", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page).toHaveURL(/\/login/)
  })

  test("unauthenticated user is redirected to login from /clients", async ({ page }) => {
    await page.goto("/clients")
    await expect(page).toHaveURL(/\/login/)
  })

  test("unauthenticated user is redirected to login from /appointments", async ({ page }) => {
    await page.goto("/appointments")
    await expect(page).toHaveURL(/\/login/)
  })

  test.describe("Authenticated flows (requires E2E_EMAIL + E2E_PASSWORD)", () => {
    test.skip(!TEST_EMAIL || !TEST_PASSWORD, "Set E2E_EMAIL and E2E_PASSWORD env vars to run")

    test.beforeEach(async ({ page }) => {
      await page.goto("/login")
      await page.locator('input[type="email"]').fill(TEST_EMAIL)
      await page.locator('input[type="password"]').fill(TEST_PASSWORD)
      await page.getByRole("button", { name: "Sign In" }).click()
      await page.waitForURL(/\/dashboard/, { timeout: 10000 })
    })

    test("logs in and lands on dashboard", async ({ page }) => {
      await expect(page).toHaveURL(/\/dashboard/)
    })

    test("dashboard shows key sections", async ({ page }) => {
      await expect(page.getByText(/Today|Reminders|Appointments/i).first()).toBeVisible()
    })
  })
})

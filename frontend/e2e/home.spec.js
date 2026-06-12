import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('displays the app title and welcome message', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toHaveText('ResQBridge')
    await expect(page.locator('text=Bridging rescue teams with those in need')).toBeVisible()
  })

  test('has correct page title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle('ResQBridge')
  })
})

import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('displays the hero heading and CTA', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toHaveText('Connect. Coordinate. Rescue.')
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Learn More' })).toBeVisible()
  })

  test('shows stats section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('12K+')).toBeVisible()
    await expect(page.getByText('500+')).toBeVisible()
  })

  test('shows final CTA section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Ready to bridge the gap?')).toBeVisible()
  })

  test('has correct page title', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle('ResQBridge')
  })
})

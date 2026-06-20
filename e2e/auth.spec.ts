import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('redirects unauthenticated users to login from protected routes', async ({ page }) => {
    await page.goto('/dashboard');
    // Because of Supabase SSR redirect logic, it should push to auth/login or /login
    await expect(page).toHaveURL(/.*auth.*/);
  });

  test('shows login form elements', async ({ page }) => {
    await page.goto('/login');
    // We expect the form to render an email input and a password input or similar
    const emailInput = page.locator('input[type="email"], input[name="email"]');
    const passwordInput = page.locator('input[type="password"], input[name="password"]');
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });
});

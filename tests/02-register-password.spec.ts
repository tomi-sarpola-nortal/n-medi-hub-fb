
import { test, expect } from '@playwright/test';

test.describe('User Registration - Step 2 (Password Setup)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/en/register/step1');
    await page.getByLabel('Email Address').fill(`test-user-${Date.now()}@example.com`);
    await page.getByRole('button', { name: 'CONFIRM EMAIL ADDRESS' }).click();
    await page.waitForURL('**/register/step2');
  });

  test('should show password complexity rules and update them on input', async ({ page }) => {
    await expect(page.getByText('At least 8 characters')).toBeVisible();
    await expect(page.getByText('At least one uppercase letter')).toBeVisible();

    await page.getByLabel('Password').fill('valid');
    await expect(page.locator('div').filter({ hasText: 'At least one uppercase letter' }).locator('svg')).toHaveClass(/text-destructive/);
    
    await page.getByLabel('Password').fill('Valid123');
    await expect(page.locator('div').filter({ hasText: 'At least one uppercase letter' }).locator('svg')).toHaveClass(/text-green-500/);
    await expect(page.locator('div').filter({ hasText: 'At least 8 characters' }).locator('svg')).toHaveClass(/text-green-500/);
  });

  test('should show error for password mismatch', async ({ page }) => {
    await page.getByLabel('Password').fill('ValidPass123');
    await page.getByLabel('Repeat Password').fill('DifferentPass123');
    await page.getByLabel('Repeat Password').blur(); // Trigger validation

    await expect(page.getByText('Passwords do not match.')).toBeVisible();
  });

  test('should allow submission with valid, matching passwords', async ({ page }) => {
    await page.getByLabel('Password').fill('ValidPass123');
    await page.getByLabel('Repeat Password').fill('ValidPass123');
    await page.getByRole('button', { name: 'CONTINUE' }).click();

    await expect(page).toHaveURL(/.*\/register\/step3/);
  });
});

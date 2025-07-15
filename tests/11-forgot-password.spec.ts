
import { test, expect } from '@playwright/test';

test.describe('Forgot Password Functionality', () => {

  test('should allow a user to request a password reset link', async ({ page }) => {
    await page.goto('/en/login');

    // Click the "Forgot password?" link to open the dialog
    await page.getByRole('button', { name: 'Forgot password?' }).click();

    // Verify the dialog is visible
    await expect(page.getByRole('heading', { name: 'Reset your password' })).toBeVisible();

    // Fill in the email address
    await page.getByLabel('Email or Dentist ID').fill('t.j.sarpola@gmail.com');

    // Click the send button
    await page.getByRole('button', { name: 'Send Reset Link' }).click();

    // Verify the success toast message is displayed
    const successToast = page.locator('div').filter({ hasText: 'If an account exists for this email, a link to reset your password has been sent.' }).first();
    await expect(successToast).toBeVisible();

    // Verify the dialog has closed
    await expect(page.getByRole('heading', { name: 'Reset your password' })).not.toBeVisible();
  });
});

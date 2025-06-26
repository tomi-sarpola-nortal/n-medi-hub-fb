
import { test, expect } from '@playwright/test';

// This test suite runs with the "Dentist" project config.
test.describe('Settings - Personal Data Form', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/en/settings');
    // Ensure the personal data accordion is open
    await page.getByRole('button', { name: 'Personal Data' }).click();
  });

  test('should update personal information successfully', async ({ page }) => {
    const newCity = `Test City ${Date.now()}`;
    
    await page.getByLabel('City*').fill(newCity);
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // The form submission triggers a "pending change" state.
    // We verify this state is now active.
    const pendingAlert = page.getByRole('alert').filter({ hasText: 'Changes Pending Review' });
    await expect(pendingAlert).toBeVisible();
    
    // The form should now be disabled
    await expect(page.getByLabel('City*')).toBeDisabled();
  });

  test('should show validation error for required field', async ({ page }) => {
    await page.getByLabel('First Name*').fill('');
    await page.getByRole('button', { name: 'Save Changes' }).click();

    await expect(page.getByText('First name is required.')).toBeVisible();
  });
});

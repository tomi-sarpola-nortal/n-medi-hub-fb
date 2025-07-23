
import { test, expect } from '@playwright/test';

// This test suite runs with the "Dentist" project config.
test.describe('Logout Functionality', () => {

  test('should log the user out and redirect to login page', async ({ page }) => {
    await page.goto('/en/dashboard');

    // Click the logout button in the sidebar
    const logoutButton = page.getByRole('button', { name: 'Logout' });
    await logoutButton.click();

    // Verify redirection to the login page
    await page.waitForURL('**/login');
    await expect(page).toHaveURL('/en/login');
    await expect(page.getByRole('heading', { name: 'Login to Portal' })).toBeVisible();
  });
});

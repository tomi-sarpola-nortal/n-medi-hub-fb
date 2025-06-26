
import { test, expect } from '@playwright/test';

// This test suite runs with the "Dentist" project config.
test.describe('Smart Suggestions Error State', () => {

  test('should display an error message when the AI flow fails', async ({ page }) => {
    // Intercept the network request to the AI flow and make it fail
    await page.route('**/api/v1/flow/suggestDocumentsFlow/invoke', async route => {
      await route.abort('failed');
    });

    await page.goto('/en/dashboard');

    // Check for the error message in the Smart Suggestions component
    const errorCard = page.locator('div').filter({ hasText: 'Failed to load document suggestions' });
    await expect(errorCard).toBeVisible();
    await expect(page.getByText('Smart Document Suggestions')).toBeVisible();
  });
});

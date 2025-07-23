
import { test, expect } from '@playwright/test';

// This test suite runs with the "Dentist" project config, which uses saved auth state.
test.describe('Sidebar Navigation', () => {
  
  test('should navigate to the Education page', async ({ page }) => {
    await page.goto('/en/dashboard');

    // Find the sidebar link for "My Trainings"
    const educationLink = page.getByRole('button', { name: 'My Trainings' });
    await educationLink.click();

    // Verify the URL and page title
    await page.waitForURL('**/education');
    await expect(page).toHaveURL('/en/education');
    await expect(page.getByRole('heading', { name: 'My Advanced Trainings' })).toBeVisible();
  });
});

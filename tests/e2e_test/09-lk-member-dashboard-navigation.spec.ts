
import { test, expect } from '@playwright/test';

// This test suite runs with the "LK Member" project config.
test.describe('LK Member Dashboard Navigation', () => {

  test('should navigate to a member review page from the dashboard', async ({ page }) => {
    // This test assumes that the seed data has created users pending review.
    await page.goto('/en/dashboard');

    // Find the card for new registrations
    const reviewCard = page.locator('div').filter({ hasText: 'Review New Registrations' }).first();
    
    // Find the first review button within that card
    const reviewButton = reviewCard.getByRole('button', { name: 'Review Registration' }).first();
    await expect(reviewButton).toBeVisible();

    await reviewButton.click();

    // Verify navigation to the review page for a specific member
    await page.waitForURL('**/member-overview/*/review');
    await expect(page.getByRole('heading', { name: 'Review Submission' })).toBeVisible();
  });
});

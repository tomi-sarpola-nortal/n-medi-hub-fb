
import { test, expect } from '@playwright/test';

test.describe('Dashboard Loading State', () => {
  
  // This test runs on a clean slate, without prior login
  test('should show a loading spinner initially', async ({ page }) => {
    // Go to a page that requires authentication
    await page.goto('/en/dashboard');

    // The page should show a loader while it determines the auth state
    // and before it redirects to login.
    const loader = page.locator('.animate-spin');
    await expect(loader).toBeVisible();
    
    // Eventually, it should redirect to the login page because we are not logged in.
    await page.waitForURL('**/login');
    await expect(page.getByRole('heading', { name: 'Login to Portal' })).toBeVisible();
  });
});


import { test, expect } from '@playwright/test';

test.describe('Language Switcher', () => {

  test('should switch language from English to German', async ({ page }) => {
    await page.goto('/en/login');

    // Verify initial state is English
    await expect(page.getByRole('heading', { name: 'Portal Login' })).toBeVisible();
    
    // Click the language switcher
    await page.getByRole('combobox').click();
    
    // Select German
    await page.getByText('Deutsch').click();
    
    // Verify URL and content changed to German
    await page.waitForURL('**/de/login');
    await expect(page).toHaveURL('/de/login');
    await expect(page.getByRole('heading', { name: 'Portal Anmeldung' })).toBeVisible();
  });
});

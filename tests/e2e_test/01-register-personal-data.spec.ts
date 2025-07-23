
import { test, expect } from '@playwright/test';

test.describe('User Registration - Step 3 (Personal Data)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the start of the registration and complete steps 1 and 2
    // to ensure we have a session for step 3.
    await page.goto('/en/register/step1');
    await page.getByLabel('Email Address').fill(`test-user-${Date.now()}@example.com`);
    await page.getByRole('button', { name: 'CONFIRM EMAIL ADDRESS' }).click();
    
    await page.waitForURL('**/register/step2');
    await page.getByLabel('Password').fill('ValidPass123');
    await page.getByLabel('Repeat Password').fill('ValidPass123');
    await page.getByRole('button', { name: 'CONTINUE' }).click();
    
    await page.waitForURL('**/register/step3');
  });

  test('should allow successful submission with valid data', async ({ page }) => {
    // Fill the form with valid data
    await page.getByLabel('First Name*').fill('John');
    await page.getByLabel('Last Name*').fill('Doe');
    await page.getByLabel('Date of Birth*').fill('1990-05-15');
    await page.getByLabel('Place of Birth*').fill('Vienna');
    await page.getByLabel('Nationality*').click();
    await page.getByText('Austria').click();
    await page.getByLabel('Street and House Number*').fill('Main Street 1');
    await page.getByLabel('Postal Code*').fill('1010');
    await page.getByLabel('City*').fill('Vienna');
    await page.getByLabel('State/Province*').click();
    await page.getByText('Vienna', { exact: true }).click();
    await page.getByLabel('ID Card or Passport*').setInputFiles({
      name: 'id.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test'),
    });

    await page.getByRole('button', { name: 'CONTINUE' }).click();

    // Verify navigation to the next step
    await expect(page).toHaveURL(/.*\/register\/step4/);
  });

  test('should show validation errors for required fields', async ({ page }) => {
    // Attempt to submit without filling any fields
    await page.getByRole('button', { name: 'CONTINUE' }).click();

    // Check for validation messages
    await expect(page.getByText('First name is required.')).toBeVisible();
    await expect(page.getByText('Last name is required.')).toBeVisible();
    await expect(page.getByText('Date of birth is required.')).toBeVisible();
  });
});

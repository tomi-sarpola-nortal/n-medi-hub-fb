
import { test, expect } from '@playwright/test';

test.describe('User Registration - Step 6 (Submission)', () => {
  
  test.beforeEach(async ({ page }) => {
    // This is a simplified setup to get to step 6.
    // In a real scenario, this would involve a more robust way to set state.
    await page.goto('/en/register/step1');
    await page.getByLabel('Email Address').fill(`final-test-user-${Date.now()}@example.com`);
    await page.getByRole('button', { name: 'CONFIRM EMAIL ADDRESS' }).click();
    await page.waitForURL('**/register/step2');
    await page.getByLabel('Password').fill('ValidPass123');
    await page.getByLabel('Repeat Password').fill('ValidPass123');
    await page.getByRole('button', { name: 'CONTINUE' }).click();
    await page.waitForURL('**/register/step3');
    
    // Step 3
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
    await page.getByLabel('ID Card or Passport*').setInputFiles({ name: 'id.pdf', mimeType: 'application/pdf', buffer: Buffer.from('test') });
    await page.getByRole('button', { name: 'CONTINUE' }).click();
    await page.waitForURL('**/register/step4');
    
    // Step 4
    await page.getByLabel('Current Professional Title*').click();
    await page.getByText('Dentist', { exact: true }).click();
    await page.getByText('Implantology').click();
    await page.getByPlaceholder('Add a language...').fill('English');
    await page.keyboard.press('Enter');
    await page.getByLabel('Date of Graduation*').fill('2015-06-20');
    await page.getByLabel('University/College*').fill('University of Vienna');
    await page.getByLabel('Diploma/Certificate of Dental Studies*').setInputFiles({ name: 'diploma.pdf', mimeType: 'application/pdf', buffer: Buffer.from('test') });
    await page.getByRole('button', { name: 'CONTINUE' }).click();
    await page.waitForURL('**/register/step5');

    // Step 5
    await page.getByLabel('Name of Practice/Clinic*').fill('Doe Dental');
    await page.getByLabel('Street and House Number*').fill('Practice Lane 5');
    await page.getByLabel('Postal Code*').fill('1010');
    await page.getByLabel('City*').fill('Vienna');
    await page.getByLabel('Practice Phone Number*').fill('+4312345678');
    await page.getByText('ÖGK (Austrian Health Insurance Fund)').click();
    await page.getByRole('button', { name: 'CONTINUE TO REVIEW' }).click();
    await page.waitForURL('**/register/step6');
  });

  test('should not allow submission until terms are agreed', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: 'SUBMIT APPLICATION' });
    await expect(submitButton).toBeDisabled();

    await page.getByLabel(/I confirm the accuracy/).click();
    await expect(submitButton).toBeEnabled();
  });

  test('should successfully submit the registration', async ({ page }) => {
    await page.getByLabel(/I confirm the accuracy/).click();
    await page.getByRole('button', { name: 'SUBMIT APPLICATION' }).click();

    await page.waitForURL('**/register/success');
    await expect(page.getByRole('heading', { name: 'Thank You!' })).toBeVisible();
  });
});

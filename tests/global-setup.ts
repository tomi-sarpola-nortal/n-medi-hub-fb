
import { test as setup, expect } from '@playwright/test';
import { DENTIST_AUTH_FILE, LK_MEMBER_AUTH_FILE } from '../playwright.config';

const dentistUser = {
  email: process.env.DENTIST_EMAIL || 'sabine.mueller@example.com',
  password: process.env.DENTIST_PASSWORD || 'TestTest24',
};

const lkMemberUser = {
  email: process.env.LK_MEMBER_EMAIL || 'meme@gmail.com',
  password: process.env.LK_MEMBER_PASSWORD || '-dkwfFv8WDGL=tR',
};

setup('authenticate as dentist', async ({ page }) => {
  await page.goto('/en/login');
  await page.getByLabel('Email or Dentist ID').fill(dentistUser.email);
  await page.getByLabel('Password').fill(dentistUser.password);
  await page.getByRole('button', { name: 'LOGIN' }).click();
  
  await page.waitForURL('/en/dashboard');
  await expect(page.getByRole('heading', { name: 'Welcome, Dr. Sabine Müller' })).toBeVisible();

  await page.context().storageState({ path: DENTIST_AUTH_FILE });
});

setup('authenticate as lk_member', async ({ page }) => {
  await page.goto('/en/login');
  await page.getByLabel('Email or Dentist ID').fill(lkMemberUser.email);
  await page.getByLabel('Password').fill(lkMemberUser.password);
  await page.getByRole('button', { name: 'LOGIN' }).click();

  await page.waitForURL('/en/dashboard');
  await expect(page.getByRole('heading', { name: 'Welcome, Max Mustermann' })).toBeVisible();

  await page.context().storageState({ path: LK_MEMBER_AUTH_FILE });
});

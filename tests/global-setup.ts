import { test as setup, expect } from '@playwright/test';
import { DENTIST_AUTH_FILE, LK_MEMBER_AUTH_FILE } from '../playwright.config';

const doctorUser = {
  email: process.env.DENTIST_EMAIL || 'sarah.miller@example.com',
  password: process.env.DENTIST_PASSWORD || 'TestTest24',
};

const bureauMemberUser = {
  email: process.env.LK_MEMBER_EMAIL || 'max.sample@example.com',
  password: process.env.LK_MEMBER_PASSWORD || '-dkwfFv8WDGL=tR',
};

setup('authenticate as doctor', async ({ page }) => {
  await page.goto('/en/login');
  await page.getByLabel('Email or Doctor ID').fill(doctorUser.email);
  await page.getByLabel('Password').fill(doctorUser.password);
  await page.getByRole('button', { name: 'LOGIN' }).click();
  
  await page.waitForURL('/en/dashboard');
  await expect(page.getByRole('heading', { name: 'Welcome, Dr. Sarah Miller' })).toBeVisible();

  await page.context().storageState({ path: DENTIST_AUTH_FILE });
});

setup('authenticate as bureau_member', async ({ page }) => {
  await page.goto('/en/login');
  await page.getByLabel('Email or Doctor ID').fill(bureauMemberUser.email);
  await page.getByLabel('Password').fill(bureauMemberUser.password);
  await page.getByRole('button', { name: 'LOGIN' }).click();

  await page.waitForURL('/en/dashboard');
  await expect(page.getByRole('heading', { name: 'Welcome, Max Sample' })).toBeVisible();

  await page.context().storageState({ path: LK_MEMBER_AUTH_FILE });
});

import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Define the path to the authentication state files
export const DENTIST_AUTH_FILE = path.join(__dirname, 'playwright/.auth/dentist.json');
export const LK_MEMBER_AUTH_FILE = path.join(__dirname, 'playwright/.auth/lk-member.json');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:9002',
    trace: 'on-first-retry',
  },
  
  // A global setup file to run before all tests to handle authentication
  globalSetup: require.resolve('./tests/global-setup'),

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Project for tests that need a logged-in Dentist
    {
      name: 'Dentist',
      testMatch: /.*\.dentist\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: DENTIST_AUTH_FILE,
      },
      dependencies: ['setup'],
    },
    // Project for tests that need a logged-in LK Member
    {
      name: 'LK Member',
      testMatch: /.*\.lk-member\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: LK_MEMBER_AUTH_FILE,
      },
      dependencies: ['setup'],
    },
    // Setup project to handle authentication
    {
      name: 'setup',
      testMatch: /global-setup\.ts/,
    },
  ],
});

import { defineConfig, devices } from '@playwright/test';
import { getPlaywrightBaseUrl, getPlaywrightEnv } from './playwright/playwrightEnv';

// eslint-disable-next-line no-undef
const CI = !!process.env.CI;
const isLocal = getPlaywrightEnv() === 'local';
const baseURL = getPlaywrightBaseUrl();
const mobileTestMatch = /.*\.mobile\.spec\.ts/;

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  /* Maximum time one test can run for. */
  timeout: 30_000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!CI,
  /* Retry on CI only */
  retries: CI ? 2 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL,

    // Apply to all tests: disable tutorial popovers (avoids click interception).
    storageState: {
      cookies: [],
      origins: [
        {
          origin: baseURL.replace(/\/$/, ''),
          localStorage: [
            { name: 'TUTORIAL', value: 'false' },
            { name: 'THEME_MODE', value: 'light' },
          ],
        },
      ],
    },

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      testIgnore: mobileTestMatch,
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      testIgnore: mobileTestMatch,
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      testIgnore: mobileTestMatch,
      use: { ...devices['Desktop Safari'] },
    },

    /* Playwright does not ship a Galaxy S8+ profile, so cover both requested fallbacks. */
    {
      name: 'mobile-iphone-13',
      testMatch: mobileTestMatch,
      use: { ...devices['iPhone 13'] },
    },
    {
      name: 'mobile-galaxy-s8',
      testMatch: mobileTestMatch,
      use: { ...devices['Galaxy S8'] },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: isLocal
    ? {
        command: 'npm run dev',
        url: baseURL,
        reuseExistingServer: !CI,
      }
    : undefined,
});

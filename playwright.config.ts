import { defineConfig, devices } from '@playwright/test';

import { env } from './config/env';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  snapshotDir: './tests/__snapshots__',
  snapshotPathTemplate:
    '{snapshotDir}/{testFileName}-snapshots/{arg}-{projectName}-{platform}{ext}',
  timeout: 10000,
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.WORKERS ? parseInt(process.env.WORKERS) : process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results' }],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    baseURL: env.baseUrl,
    testIdAttribute: 'data-test',
    navigationTimeout: 10000,
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  expect: {
    timeout: 5000,
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.05,
      animations: 'disabled',
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'all',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/ui.json' },
      dependencies: ['setup'],
    },
    {
      name: 'smoke',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/ui.json' },
      grep: /@smoke/,
      dependencies: ['setup'],
    },
    {
      name: 'api',
      grep: /@api/,
      testDir: './tests/API',
    },
    {
      name: 'ui',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/ui.json' },
      grep: /@ui/,
      testDir: './tests/UI',
      dependencies: ['setup'],
    },
    {
      name: 'visual',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/ui.json' },
      grep: /@visual/,
      testDir: './tests/UI/Visual',
      dependencies: ['setup'],
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],
});

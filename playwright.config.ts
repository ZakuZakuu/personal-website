import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: 'test-results',
  fullyParallel: true,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:4322',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'node scripts/serve-dist.mjs',
    url: 'http://127.0.0.1:4322',
    reuseExistingServer: true,
  },
});

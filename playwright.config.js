const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'e2e/specs',
  reporter: [['list'], ['html', { outputFolder: process.env.AUTOPILOT_PLAYWRIGHT_REPORT_DIR || 'playwright-report', open: 'never' }]],
  outputDir: process.env.AUTOPILOT_PLAYWRIGHT_OUTPUT_DIR || 'test-results',
  use: {
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
});

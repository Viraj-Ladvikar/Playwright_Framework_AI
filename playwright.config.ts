import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  timeout: 30 * 1000, // 30000 ms (30 secs)

  testDir: "./tests",

  // The shared local OpenCart/XAMPP storefront cannot reliably persist two
  // concurrent customer registrations, so the whole suite runs on one worker
  // to keep registration-based tests deterministic.
  fullyParallel: false,

  retries: process.env.CI ? 2 : 0,

  workers: 1,

  reporter: [
    ["list"], // Detailed console output

    // ["line"],
    // ["dot"],

    // One-line progress output
    // Minimal console output

    ["html", { open: "never", outputFolder: "reports" }], // HTML Report

    // ["json", { outputFile: "reports/results.json" }], // JSON Report

    ["junit", { outputFile: "reports/results.xml" }], // JUnit XML Report

    ["./utils/CustomReporter.ts"], // Custom reporter

    ["allure-playwright", { outputFolder: "allure-results" }], // Allure Report
  ],

  use: {
    trace: "on-first-retry",

    screenshot: "only-on-failure",

    video: "retain-on-failure",

    headless: process.env.CI ? true : false,

    viewport: {
      width: 1280,
      height: 720,
    }, // Set default viewport size for consistency

    ignoreHTTPSErrors: true, // Ignore SSL errors if necessary

    permissions: ["geolocation"], // Set necessary permissions for geolocation-based tests
  },

  // grep is intentionally NOT set here: each npm script / CI job passes its own
  // --grep flag (e.g. @e2e, @api), and a hardcoded config-level grep would AND
  // with the CLI grep and can silently match zero tests.

  projects: [
    {
      name: "chromium",

      use: {
        ...devices["Desktop Chrome"],
      },
    },

    /*
    {
      name: "firefox",

      use: {
        ...devices["Desktop Firefox"],
      },
    },

    {
      name: "webkit",

      use: {
        ...devices["Desktop Safari"],
      },
    }
    */
  ],
});
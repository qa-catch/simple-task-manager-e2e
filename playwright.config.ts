import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Test directory
  testDir: './tests',
  
  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  // retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : 1,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'reports/html-report' }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['list']
  ],
  
  use: {
    // Base URL for the application
    baseURL: 'https://significant-darcey-kwikicity-3dda52ea.koyeb.app',
    
    // Collect trace when retrying the failed test
    trace: 'on',
    
    // Take screenshot on failure
    screenshot: 'only-on-failure',
    
    // Record video on failure
    video: 'retain-on-failure',
    
    // Global timeout for all actions
    actionTimeout: 30000,
    
    // Global timeout for navigation
    navigationTimeout: 30000,
  },

  // Configure Chrome only (as requested) with dialog permissions
  projects: [
    {
      name: 'chromium',
      use: {
        ...require('@playwright/test').devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Enable browser dialogs and alerts
        launchOptions: {
          args: [
            '--disable-web-security',
            '--allow-running-insecure-content',
            '--disable-features=VizDisplayCompositor'
          ]
        },
        // Grant notifications permission in the browser context
        permissions: ['notifications']
      },
    },
  ],

  // Global setup for handling dialogs
  globalSetup: undefined,
  
  // Handle dialogs globally
  expect: {
    timeout: 10000
  },
});
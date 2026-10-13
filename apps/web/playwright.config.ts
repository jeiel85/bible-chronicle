import { defineConfig, devices } from '@playwright/test';

// End-to-end checks against the production build (docs/18 M5): the service worker only exists there.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: 'http://localhost:4180', locale: 'ko-KR', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run build && npx vite preview --port 4180 --strictPort',
    url: 'http://localhost:4180',
    // Never reuse a server already on the port: a leftover preview would serve an old build and make the run meaningless.
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'phone', use: { ...devices['Pixel 7'] } },
  ],
});

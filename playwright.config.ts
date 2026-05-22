import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the smoke suite.
 *
 * Tests assume an Astro production build is already running on the URL given
 * by `PLAYWRIGHT_BASE_URL` (default http://127.0.0.1:4500). The CI workflow
 * starts the build + node server before invoking `pnpm test`. Locally:
 *
 *   ASTRO_ADAPTER=node pnpm build
 *   HOST=127.0.0.1 PORT=4500 node dist/server/entry.mjs &
 *   pnpm test
 *
 * We intentionally do NOT use Playwright's `webServer` block because the
 * Vercel adapter doesn't expose `astro preview`, so the boot command would
 * be project-specific. Keeping it explicit makes the workflow obvious.
 */
export default defineConfig({
  testDir: "./tests",
  timeout: 30_000,
  fullyParallel: true,
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:4500",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

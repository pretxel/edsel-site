import { expect, test } from "@playwright/test";

/**
 * Smoke tests — minimum viable coverage that every route boots, renders
 * the expected landmark, and doesn't ship console errors.
 *
 * These tests run against a real production build (Astro + @astrojs/node).
 * They are intentionally shallow: we only assert
 *   - the response is 200
 *   - there's a single <main> landmark with a visible heading
 *   - no `console.error()` calls happen during initial load
 *   - the `<title>` is non-empty
 *
 * Deeper assertions (content correctness, navigation flows) belong in
 * route-specific tests so this smoke file stays fast and cheap.
 */

const ROUTES = [
  { path: "/", description: "home" },
  { path: "/blog", description: "blog index" },
  { path: "/projects", description: "projects index" },
  { path: "/projects/daily-potato", description: "project detail" },
  { path: "/about", description: "about" },
  { path: "/now", description: "now" },
  { path: "/uses", description: "uses" },
];

for (const { path, description } of ROUTES) {
  test(`${description} (${path}) loads cleanly`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on("pageerror", (err) => consoleErrors.push(err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });

    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response, "navigation response").not.toBeNull();
    expect(response!.status(), `${path} should respond 2xx`).toBeLessThan(400);

    // <main> landmark — guarantees the layouts wrap their content properly.
    await expect(page.locator("main")).toHaveCount(1);

    // <h1> present and visible.
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();

    // <title> non-empty.
    const title = await page.title();
    expect(title.length, `${path} title should not be empty`).toBeGreaterThan(0);

    // No console errors. Filter out the noisy /_vercel/insights/* 404 that
    // shows up only in dev when the build is not on Vercel.
    const realErrors = consoleErrors.filter(
      (msg) => !msg.includes("_vercel/insights"),
    );
    expect(realErrors, `console errors on ${path}`).toEqual([]);
  });
}

test("skip-to-content link is present and focusable", async ({ page }) => {
  await page.goto("/");
  const skip = page.locator(".skip-to-content");
  await expect(skip).toBeAttached();
  // Tabbing once should move focus to the skip link (it's the first focusable
  // element in the body).
  await page.keyboard.press("Tab");
  const focusedClass = await page.evaluate(
    () => document.activeElement?.className,
  );
  expect(focusedClass).toContain("skip-to-content");
});

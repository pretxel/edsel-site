import { expect, test } from "@playwright/test";

/**
 * Mobile experience contract — see openspec spec `mobile-experience`.
 *
 * Layout tests pin their own viewport so they run identically in every
 * project; hero-animation tests are restricted to the mobile projects.
 */

const ROUTES = [
  "/",
  "/en/",
  "/projects",
  "/en/projects",
  "/projects/daily-potato",
  "/en/projects/daily-potato",
  "/blog",
  "/en/blog",
  "/about",
  "/en/about",
  "/tags",
];

for (const width of [360, 430]) {
  for (const path of ROUTES) {
    test(`no horizontal overflow on ${path} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(path, { waitUntil: "load" });
      const overflow = await page.evaluate(() => {
        const el = document.documentElement;
        return el.scrollWidth - el.clientWidth;
      });
      expect(overflow, `${path} overflows by ${overflow}px`).toBeLessThanOrEqual(
        0,
      );
    });
  }
}

test.describe("tap targets", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("hero CTA is at least 44px tall", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const box = await page.locator("#hero-title ~ div a").first().boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  });

  test("home navigation links are at least 44px tall", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    const links = page.locator('nav[aria-label="Primary"] a');
    expect(await links.count()).toBeGreaterThan(0);
    for (const link of await links.all()) {
      const box = await link.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  });

  for (const path of ["/projects", "/projects/daily-potato", "/about"]) {
    test(`language switcher is at least 44px on ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "load" });
      const button = page.locator("#language-switcher-button").first();
      await expect(button).toBeVisible();
      const box = await button.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.width).toBeGreaterThanOrEqual(44);
    });
  }
});

test.describe("hero animation on mobile", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      !testInfo.project.name.startsWith("mobile"),
      "mobile projects only",
    );
  });

  for (const path of ["/", "/en/"]) {
    test(`canvas mounts behind the hero copy on ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "load" });

      const heading = page.locator("#hero-title");
      const before = await heading.boundingBox();

      const canvas = page.locator('section[aria-labelledby="hero-title"] canvas');
      await expect(canvas).toBeVisible({ timeout: 15_000 });

      // Late mount must not move the hero copy.
      const after = await heading.boundingBox();
      expect(after).toEqual(before);
    });
  }

  test("animation code is requested only after the load event", async ({
    page,
  }) => {
    // Recorded synchronously in the request handler: has `load` fired yet?
    let loadFired = false;
    let requestedAfterLoad: boolean | null = null;
    page.on("load", () => {
      loadFired = true;
    });
    page.on("request", (req) => {
      if (/sphereScene/i.test(req.url()) && requestedAfterLoad === null) {
        requestedAfterLoad = loadFired;
      }
    });
    await page.goto("/", { waitUntil: "load" });
    await expect(page.locator("#hero-title")).toBeVisible();
    await expect(
      page.locator('section[aria-labelledby="hero-title"] canvas'),
    ).toBeVisible({ timeout: 15_000 });
    expect(requestedAfterLoad).toBe(true);
  });

  test("render loop pauses while the hero is offscreen", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await expect(
      page.locator('section[aria-labelledby="hero-title"] canvas'),
    ).toBeVisible({ timeout: 15_000 });

    const framesIn = (ms: number) =>
      page.evaluate(
        (duration) =>
          new Promise<number>((resolve) => {
            const original = window.requestAnimationFrame;
            let count = 0;
            window.requestAnimationFrame = (cb) => {
              count++;
              return original.call(window, cb);
            };
            setTimeout(() => {
              window.requestAnimationFrame = original;
              resolve(count);
            }, duration);
          }),
        ms,
      );

    expect(await framesIn(500)).toBeGreaterThan(5);
    await page.evaluate(() =>
      window.scrollTo(0, document.documentElement.scrollHeight),
    );
    await page.waitForTimeout(300);
    expect(await framesIn(500)).toBeLessThanOrEqual(2);
  });
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("no hero canvas is created", async ({ page }) => {
    await page.goto("/", { waitUntil: "load" });
    await expect(page.locator("#hero-title")).toBeVisible();
    await page.waitForTimeout(3000);
    await expect(
      page.locator('section[aria-labelledby="hero-title"] canvas'),
    ).toHaveCount(0);
  });
});

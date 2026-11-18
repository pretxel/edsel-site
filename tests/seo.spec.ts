import { expect, test, type Page } from "@playwright/test";

/**
 * SEO contract tests — see openspec specs `seo-metadata` and
 * `llm-discoverability`. Assertions run against server-rendered HTML, so
 * they are engine-independent; the endpoint tests use the request fixture.
 */

const SITE = "https://www.edselserrano.com";

interface RouteCase {
  es: string;
  en: string;
  /** Expected Schema.org type of the page node. */
  schemaType: string;
  breadcrumb?: boolean;
}

const ROUTES: RouteCase[] = [
  { es: "/", en: "/en/", schemaType: "WebPage" },
  { es: "/about", en: "/en/about", schemaType: "ProfilePage" },
  { es: "/projects/", en: "/en/projects/", schemaType: "CollectionPage" },
  {
    es: "/projects/daily-potato",
    en: "/en/projects/daily-potato",
    schemaType: "SoftwareApplication",
    breadcrumb: true,
  },
  { es: "/blog/", en: "/en/blog/", schemaType: "CollectionPage" },
  { es: "/tags/", en: "/en/tags/", schemaType: "CollectionPage" },
];

const strip = (url: string) => url.replace(/\/$/, "");

async function hreflangs(page: Page): Promise<Record<string, string>> {
  return page
    .locator('head link[rel="alternate"][hreflang]')
    .evaluateAll((els) =>
      Object.fromEntries(
        els.map((el) => [
          el.getAttribute("hreflang")!,
          el.getAttribute("href")!,
        ]),
      ),
    );
}

for (const route of ROUTES) {
  for (const lang of ["es", "en"] as const) {
    const path = route[lang];

    test(`head tags are unique and complete on ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });

      await expect(page.locator("title")).toHaveCount(1);
      await expect(page.locator('meta[name="description"]')).toHaveCount(1);
      await expect(page.locator('meta[name="viewport"]')).toHaveCount(1);
      await expect(page.locator('meta[name="theme-color"]')).toHaveCount(1);
      await expect(page.locator('meta[name="keywords"]')).toHaveCount(0);
      await expect(page.locator('meta[name="language"]')).toHaveCount(0);

      // Everything SEO-relevant must live inside <head>.
      await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute("href");
      expect(strip(canonical!)).toBe(strip(`${SITE}${path}`));

      await expect(page.locator("html")).toHaveAttribute("lang", lang);
    });

    test(`hreflang alternates are reciprocal on ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const alts = await hreflangs(page);
      expect(Object.keys(alts).sort()).toEqual(["en-US", "es-ES", "x-default"]);
      expect(strip(alts["es-ES"])).toBe(strip(`${SITE}${route.es}`));
      expect(strip(alts["en-US"])).toBe(strip(`${SITE}${route.en}`));
      // x-default points at the Spanish variant of the *same* page.
      expect(strip(alts["x-default"])).toBe(strip(`${SITE}${route.es}`));
    });

    test(`social metadata present on ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      for (const prop of [
        "og:type",
        "og:title",
        "og:description",
        "og:url",
        "og:image",
        "og:image:alt",
        "og:image:width",
        "og:image:height",
        "og:locale",
      ]) {
        await expect(
          page.locator(`meta[property="${prop}"]`),
          prop,
        ).toHaveCount(1);
      }
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
        "content",
        "summary_large_image",
      );
      const image = await page
        .locator('meta[property="og:image"]')
        .getAttribute("content");
      expect(image).toMatch(/^https:\/\/www\.edselserrano\.com\//);
    });

    test(`structured data is one valid graph on ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      const scripts = page.locator('script[type="application/ld+json"]');
      await expect(scripts).toHaveCount(1);

      const data = JSON.parse((await scripts.first().textContent())!);
      expect(data["@context"]).toBe("https://schema.org");
      const graph: Array<Record<string, any>> = data["@graph"];
      expect(Array.isArray(graph) && graph.length > 0).toBe(true);

      const types = graph.flatMap((n) => n["@type"]);
      expect(types).toContain(route.schemaType);
      expect(types).toContain("WebSite");

      // Exactly one Person definition, with the canonical @id.
      const persons = graph.filter((n) => n["@type"] === "Person");
      expect(persons).toHaveLength(1);
      expect(persons[0]["@id"]).toBe(`${SITE}/#edsel`);

      // Any author/publisher reference points at that @id.
      for (const node of graph) {
        for (const key of ["author", "publisher", "mainEntity"]) {
          if (node[key]?.["@id"]?.includes("#edsel")) {
            expect(node[key]).toEqual({ "@id": `${SITE}/#edsel` });
          }
        }
      }

      if (route.breadcrumb) {
        const crumbs = graph.find((n) => n["@type"] === "BreadcrumbList");
        expect(crumbs).toBeTruthy();
        const items = crumbs!.itemListElement;
        expect(strip(items[items.length - 1].item)).toBe(
          strip(`${SITE}${path}`),
        );
      }
    });
  }
}

test("404 page is noindex without hreflang", async ({ page }) => {
  await page.goto("/404", { waitUntil: "domcontentloaded" });
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );
  await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(0);
});

test("og:image for a project resolves to an image", async ({
  page,
  request,
}) => {
  await page.goto("/projects/daily-potato", { waitUntil: "domcontentloaded" });
  const image = await page
    .locator('meta[property="og:image"]')
    .getAttribute("content");
  const res = await request.get(new URL(image!).pathname);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toMatch(/^image\//);
});

test("font preload matches an emitted asset", async ({ page, request }) => {
  await page.goto("/", { waitUntil: "domcontentloaded" });
  const preload = page.locator('link[rel="preload"][as="font"]');
  await expect(preload).toHaveCount(1);
  const href = await preload.getAttribute("href");
  const res = await request.get(href!);
  expect(res.status()).toBe(200);
});

test("project page advertises its Markdown alternate", async ({ page }) => {
  await page.goto("/projects/qr-magic", { waitUntil: "domcontentloaded" });
  await expect(
    page.locator('head link[rel="alternate"][type="text/markdown"]'),
  ).toHaveAttribute("href", `${SITE}/projects/qr-magic.md`);
});

// ── Endpoints ──────────────────────────────────────────────────────────

test("llms.txt is generated from content", async ({ request }) => {
  const res = await request.get("/llms.txt");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toMatch(/text\/(markdown|plain)/);
  const body = await res.text();
  expect(body.startsWith("# Edsel Serrano")).toBe(true);
  expect(body).toMatch(/^> /m);
  expect(body).toContain("## Projects");
  // Every project links to its Markdown alternate.
  expect(body).toContain(`${SITE}/en/projects/qr-magic.md`);
  expect(body).toContain(`${SITE}/en/projects/daily-potato.md`);
});

test("llms-full.txt contains bilingual project content", async ({
  request,
}) => {
  const res = await request.get("/llms-full.txt");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain(`${SITE}/projects/daily-potato`);
  expect(body).toContain(`${SITE}/en/projects/daily-potato`);
  expect(body).toContain(`${SITE}/about`);
});

test("project Markdown alternate is language-isolated and noindex", async ({
  request,
}) => {
  const en = await request.get("/en/projects/qr-magic.md");
  expect(en.status()).toBe(200);
  expect(en.headers()["content-type"]).toContain("text/markdown");
  expect(en.headers()["x-robots-tag"]).toContain("noindex");
  const enBody = await en.text();
  expect(enBody).toContain(`${SITE}/en/projects/qr-magic`);
  expect(enBody).not.toContain("data-lang");

  const es = await request.get("/projects/qr-magic.md");
  expect(es.status()).toBe(200);
  const esBody = await es.text();
  expect(esBody).not.toBe(enBody);
  expect(esBody).not.toContain("data-lang");
});

test("unknown Markdown alternate returns 404", async ({ request }) => {
  const res = await request.get("/projects/does-not-exist.md");
  expect(res.status()).toBe(404);
});

test("robots.txt carries the AI crawler policy", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body).toContain(`Sitemap: ${SITE}/sitemap-index.xml`);
  for (const agent of [
    "GPTBot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "ClaudeBot",
    "Claude-SearchBot",
    "Claude-User",
    "PerplexityBot",
    "Perplexity-User",
    "Google-Extended",
    "Applebot-Extended",
  ]) {
    expect(body, agent).toMatch(new RegExp(`^User-agent: ${agent}$`, "m"));
  }
  for (const retired of ["Claude-Web", "anthropic-ai"]) {
    expect(body, retired).not.toMatch(
      new RegExp(`^User-agent: ${retired}$`, "m"),
    );
  }
  expect(body).not.toMatch(/^Host:/m);
});

test("sitemap lastmod comes from content, with hreflang alternates", async ({
  request,
}) => {
  const res = await request.get("/sitemap.xml");
  expect(res.status()).toBe(200);
  const xml = await res.text();
  const today = new Date().toISOString().slice(0, 10);
  // No content is dated today, so no URL may claim it was modified today.
  expect(xml).not.toContain(`<lastmod>${today}</lastmod>`);
  expect(xml).toContain('hreflang="x-default"');
  expect(xml).not.toContain("/llms.txt");
  expect(xml).toContain(`<loc>${SITE}/projects/daily-potato</loc>`);
});

## 1. Baseline

- [x] 1.1 Build with `ASTRO_ADAPTER=node pnpm build`, serve on `127.0.0.1:4500`, and confirm the existing smoke suite passes
- [x] 1.2 Run Lighthouse mobile on `/` and `/projects/daily-potato` and record Performance, SEO, Accessibility, LCP and CLS as the "before" numbers in this change folder (`notes.md`)
- [x] 1.3 Inspect `dist/` to determine whether `public/robots.txt` or the `astro-robots-txt` output is served, and record the answer in `notes.md`
- [x] 1.4 Save a copy of the current `/llms.txt` output for later diffing against the generated version

## 2. Test scaffolding

- [x] 2.1 Add `mobile-chrome` (Pixel 7) and `mobile-safari` (iPhone 14) projects to `playwright.config.ts`
- [x] 2.2 Create `tests/seo.spec.ts` asserting, per route and language: single title/description/canonical/viewport/theme-color, no `meta keywords`/`meta language`, hreflang trio with correct x-default, OG and Twitter tags, and one parseable JSON-LD `@graph`
- [x] 2.3 Create `tests/mobile.spec.ts` asserting no horizontal overflow at 360px on every route, hero canvas visible on mobile, no canvas under `reducedMotion: "reduce"`, and 44px tap targets for language switcher and hero CTA
- [x] 2.4 Run the new specs and confirm they fail for the expected reasons before implementation

## 3. Head pipeline and hreflang

- [x] 3.1 Add `getAlternates(pathname)` to `src/lib/i18n.ts` returning absolute `es`, `en` and `xDefault` URLs for the same page
- [x] 3.2 Refactor `SEOHead.astro` to use `getAlternates`, emitting self-referencing hreflang only for single-language posts and none when `noindex`
- [x] 3.3 Remove `meta keywords`, `meta language`, `theme-color`, `msapplication-TileColor`, favicon, manifest and `rel="llm-context"` from `SEOHead.astro`
- [x] 3.4 Make `MainHead.astro` the single owner of charset, viewport, generator, `color-scheme`, `theme-color`, favicon and manifest
- [x] 3.5 Replace the hardcoded hashed font preload with a Vite `?url` import of the Inter woff2 and verify the built preload href matches the `@font-face` URL
- [x] 3.6 Update `PageLayout.astro` and `BlogLayout.astro` to render `MainHead` instead of duplicating its tags
- [x] 3.7 Ensure `/about`, `/en/about`, index pages, tag pages and 404 pass the correct props to `SEOHead` (404 with `noindex`)

## 4. Structured data

- [x] 4.1 Create `src/lib/schema.ts` with `buildGraph()` producing a single `@graph` with stable `@id`s for `#edsel` Person and `#website` WebSite
- [x] 4.2 Add page-node builders for `WebPage`, `ProfilePage`, `CollectionPage`, `BlogPosting` and `SoftwareApplication`, plus `BreadcrumbList` for posts and projects
- [x] 4.3 Replace all inline JSON-LD blocks in `SEOHead.astro` with one script fed by `buildGraph()`
- [x] 4.4 Pass the right page kind from each route (home, about, project index/detail, blog index/detail, tags)
- [ ] 4.5 Verify `tests/seo.spec.ts` JSON-LD assertions pass and spot-check one page of each kind in Google's Rich Results Test

## 5. LLM discoverability

- [x] 5.1 Create `src/lib/llms.ts` holding the shared site intro, the `dataSection` language extractor and Markdown rendering helpers for projects and posts
- [x] 5.2 Add `src/pages/llms.txt.ts` generating the llmstxt.org-structured index from the `pages`, `projects` and published `posts` collections, with cache headers
- [x] 5.3 Diff the generated `/llms.txt` against the saved copy, reconcile any lost information, then delete `public/llms.txt`
- [x] 5.4 Extend `src/pages/llms-full.txt.ts` to include published posts and both language variants of each project, excluding drafts
- [x] 5.5 Add Markdown alternate endpoints for projects (`/projects/[slug].md`, `/en/projects/[slug].md`) returning `text/markdown` with `X-Robots-Tag: noindex` and 404 for unknown slugs
- [x] 5.6 Add the equivalent Markdown alternate endpoints for published blog posts in each language
- [x] 5.7 Emit `link[rel="alternate"][type="text/markdown"]` from project and post detail pages and point `llms.txt` entries to the `.md` URLs
- [x] 5.8 Add endpoint assertions to `tests/seo.spec.ts` for `/llms.txt`, `/llms-full.txt` and one `.md` alternate (status, content type, header, language isolation)

## 6. Robots and sitemap

- [x] 6.1 Rewrite `public/robots.txt`: grouped allow list with current AI agents, retired agents removed, `Host` and global `Crawl-delay` removed, sitemap line kept, spam-bot denials kept, "last reviewed" date comment added
- [x] 6.2 Remove the `astro-robots-txt` integration from `astro.config.mjs` and `package.json`, then rebuild and confirm `/robots.txt` serves the static file
- [x] 6.3 Update `src/lib/sitemap.ts` to derive `lastmod` from content dates (max entry date for index pages) and to source alternates from `getAlternates`
- [x] 6.4 Remove the `/llms.txt` entry from the sitemap
- [x] 6.5 Add assertions for `/robots.txt` (required and forbidden agents, sitemap line) and `/sitemap.xml` (no entry dated today unless content is, hreflang alternates present)

## 7. Mobile hero animation

- [x] 7.1 Add options to `sparklingSphere.tsx` for max device pixel ratio and antialias, and pause the render loop via `IntersectionObserver` and `visibilitychange`
- [x] 7.2 Skip mounting when `navigator.connection.saveData` is true, keeping the existing reduced-motion early return
- [x] 7.3 Create a thin mobile wrapper island that dynamically imports the sphere on idle after the `load` event, with a `setTimeout` fallback where `requestIdleCallback` is missing
- [x] 7.4 Update `Hero.astro`: drop `hidden md:block`, keep the desktop island on `client:media="(min-width: 768px)"`, add the mobile island for narrower viewports with reduced particle count and DPR cap
- [x] 7.5 Fade the canvas in with an opacity transition and confirm the container's fixed positioning produces zero layout shift
- [x] 7.6 Verify on a throttled mobile profile that the hero heading paints before the Three.js chunk is requested

## 8. Mobile layout and interaction audit

- [x] 8.1 Check every route in both languages at 360, 390 and 430px for horizontal overflow and fix offending widths, paddings or long unbroken strings
- [x] 8.2 Raise tap targets below 44×44px in the header, language switcher, share buttons, tag chips and CTAs
- [x] 8.3 Add `:active` / `:focus-visible` equivalents wherever cards, links or buttons only animate on `:hover`
- [x] 8.4 Confirm existing CSS transitions and the blog reading-progress and table-of-contents behaviours work on touch viewports and stay disabled under reduced motion
- [ ] 8.5 Check sticky `backdrop-blur` headers for scroll jank on a throttled profile and simplify only if jank is observed

## 9. Verification

- [x] 9.1 Run the full Playwright suite across desktop, mobile-chrome and mobile-safari projects and fix failures
- [x] 9.2 Run `astro check` and a production `pnpm build` (Vercel adapter) with no errors
- [ ] 9.3 Run Lighthouse mobile on `/` and `/projects/daily-potato`; confirm Performance ≥ 90, SEO = 100, Accessibility ≥ 95, LCP ≤ 2.5 s, CLS ≤ 0.1 and record "after" numbers in `notes.md`
- [x] 9.4 If the performance budget is missed because of the mobile sphere, lower particle count/DPR first, then switch mobile to the lighter CSS/Canvas2D fallback and re-run 9.3
- [ ] 9.5 Validate the deployed Vercel preview: hreflang and JSON-LD in rendered HTML, `/llms.txt`, `/robots.txt`, `/sitemap.xml`, and the hero animation on a real phone

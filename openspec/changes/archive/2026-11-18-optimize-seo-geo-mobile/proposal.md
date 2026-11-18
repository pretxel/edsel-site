## Why

The site already ships SEO basics (SEOHead, JSON-LD, sitemap, `llms.txt`, permissive robots.txt), but several signals are inconsistent or stale: conflicting `theme-color` tags, a page-agnostic `hreflang="x-default"`, duplicated/divergent `Person` entities, a hand-maintained `public/llms.txt` that drifts from content, and robots rules naming deprecated AI crawlers while missing current ones. At the same time the homepage hero animation (Three.js sparkling sphere) is fully dropped below 768px, so mobile visitors — the majority of search traffic — get a static hero. Fixing both now keeps rankings, AI-answer-engine citations, and the mobile experience aligned before more projects/posts are added.

## What Changes

- **SEO head hygiene**: single `theme-color` source of truth; per-page `hreflang` alternates with `x-default` pointing at the page's Spanish URL (not always `/`); drop the obsolete `meta keywords`/`meta language`; ensure every layout (incl. `PageLayout`) renders `SEOHead` with canonical + OG + Twitter tags; replace hardcoded hashed font preload with a build-safe import.
- **Structured data**: one canonical `Person` entity (`@id: /#edsel`) referenced by `author` everywhere; `WebSite` entity with `inLanguage` alternates; `BlogPosting` for posts, `SoftwareApplication` + `BreadcrumbList` for project pages; `ProfilePage` for `/about`.
- **LLM / answer-engine discoverability (GEO)**:
  - Generate `/llms.txt` from content collections (replacing the static `public/llms.txt`) so new projects/posts appear automatically.
  - Extend `/llms-full.txt` to include published posts in both languages.
  - Add per-page Markdown alternates (`/projects/<slug>.md`, `/blog/<slug>.md`) advertised via `<link rel="alternate" type="text/markdown">`.
  - Update `robots.txt` AI crawler list (add `Claude-SearchBot`, `Claude-User`, `Google-CloudVertexBot`, etc.; remove deprecated `Claude-Web`, `anthropic-ai`; drop non-standard `Host:` and Googlebot-ignored `Crawl-delay` from the `*` group).
  - Sitemap `lastmod` derived from content dates instead of "today".
- **Mobile animations preserved**: render a lightweight hero animation on mobile (reduced-particle sphere hydrated on idle/visible, or CSS/canvas fallback) without regressing mobile LCP/CLS; keep `prefers-reduced-motion` behaviour; audit all CSS transitions and layouts at 360–430px widths.
- **Verification**: Playwright mobile project (Pixel/iPhone viewports) asserting no horizontal overflow, hero animation present, and SEO tags/JSON-LD valid; Lighthouse mobile budget (Perf ≥ 90, SEO = 100, A11y ≥ 95).

## Capabilities

### New Capabilities
- `seo-metadata`: Per-page meta tags, canonical, hreflang, Open Graph/Twitter and Schema.org JSON-LD requirements.
- `llm-discoverability`: `llms.txt`, `llms-full.txt`, Markdown page alternates, AI-crawler robots policy and sitemap freshness.
- `mobile-experience`: Responsive layout guarantees and preserved hero/UI animations on mobile within Core Web Vitals budgets.

### Modified Capabilities
<!-- None: only `dependency-maintenance` exists and its requirements are unaffected. -->

## Impact

- **Code**: `src/components/SEOHead.astro`, `src/components/MainHead.astro`, `src/layouts/*.astro`, `src/components/home/Hero.astro`, `src/components/Particles/sparklingSphere.tsx`, `src/lib/sitemap.ts`, `src/pages/llms-full.txt.ts`, new `src/pages/llms.txt.ts`, new Markdown endpoints under `src/pages/{projects,blog,en/...}`, `public/robots.txt`, removal of `public/llms.txt`.
- **Tests**: `playwright.config.ts` gains mobile projects; new `tests/seo.spec.ts`, `tests/mobile.spec.ts`.
- **Dependencies**: none new expected (Three.js already present; optional dev-only Lighthouse CI is out of scope).
- **Risk**: hydrating Three.js on mobile can hurt LCP — mitigated by idle/visible hydration, low particle count, DPR cap, and Lighthouse budget gate.

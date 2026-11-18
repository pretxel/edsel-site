## Context

Astro 7 site (`output: "server"`, Vercel adapter, Node adapter for local preview) with bilingual content (`/` Spanish, `/en/` English), Tailwind 4, React islands, and a Three.js hero (`SparklingSphere`).

Current state relevant to this change:

- `SEOHead.astro` emits meta, OG/Twitter, hreflang and several JSON-LD blocks. `MainHead.astro` emits a second `theme-color` (`#09090b`) that conflicts with SEOHead's (`#18181b`). `hreflang="x-default"` is hardcoded to `/` on every page. `Person` is emitted in three shapes with different `sameAs`/`knowsAbout`.
- `PageLayout.astro` writes its own `<title>`/description and relies on a `head` slot; `MainHead`/`PageLayout`/`BlogLayout` preload a font by hashed filename (`inter-latin-wght-normal.Dx4kXJAl.woff2`) that breaks silently when the hash changes.
- `public/llms.txt` is static and hand-edited; `/llms-full.txt` is generated but covers only projects + about. `public/robots.txt` lists deprecated AI user agents and non-standard directives.
- `src/lib/sitemap.ts` stamps every URL with today's date as `lastmod`.
- Hero sphere is wrapped in `hidden md:block` and hydrated with `client:media="(min-width: 768px)"`, so phones get no animation. The component already supports `mobileTotalParticles` and `prefers-reduced-motion`.
- Tests: one Playwright smoke spec, desktop Chromium only, run against a Node-adapter build on `127.0.0.1:4500`.

## Goals / Non-Goals

**Goals:**

- Consistent, non-contradictory SEO signals on every indexable route in both languages.
- Machine-readable content for LLM crawlers that stays in sync with content collections automatically.
- A visible hero animation on mobile that does not regress mobile Core Web Vitals.
- Automated verification (Playwright mobile + SEO assertions, Lighthouse mobile run) so regressions are caught.

**Non-Goals:**

- Visual redesign, copy changes, or new pages.
- Re-linking the blog in navigation or writing new posts.
- Adding analytics/Search Console integrations or a Lighthouse CI service.
- Changing the URL structure or i18n routing (no redirects introduced).

## Decisions

### 1. Single head pipeline: `SEOHead` owns all SEO tags, `MainHead` owns only technical tags

`MainHead` keeps charset, viewport, generator, `color-scheme`, favicon, manifest, font preload and the single `theme-color` (`#09090b`, matching the `--c-zinc-950` background). `SEOHead` drops its `theme-color`, `msapplication-TileColor`, favicon/manifest duplicates, `meta keywords` and `meta language`. `PageLayout` and `BlogLayout` render `MainHead` instead of re-declaring those tags.

*Alternative considered:* merge both into one component. Rejected — `MainHead` is also used where SEO props are not available (404), and the split keeps `SEOHead` purely data-driven.

### 2. Hreflang computed from one helper

Add `getAlternates(pathname)` in `src/lib/i18n.ts` returning `{ es, en, xDefault }` absolute URLs for a given path (x-default = Spanish variant of the *same* page). `SEOHead` and `src/lib/sitemap.ts` both consume it, so head tags and sitemap never disagree. Posts that exist in only one language emit a self-referencing hreflang only.

*Alternative:* keep passing `alternateLanguages` per page. Rejected — every page re-implements it and x-default is already wrong everywhere.

### 3. JSON-LD as one `@graph` built in `src/lib/schema.ts`

A pure function `buildGraph({ kind, ... })` returns a single `@graph` array with stable `@id`s:

- `#edsel` `Person` — defined once in full; other nodes reference it by `@id`.
- `#website` `WebSite` — `inLanguage`, `publisher → #edsel`.
- Page node by kind: `WebPage` (default), `ProfilePage` (`/about`), `BlogPosting` (posts), `SoftwareApplication` (projects), `CollectionPage` (indexes).
- `BreadcrumbList` for posts and project detail pages.

`SEOHead` emits exactly one `<script type="application/ld+json">`. Pure function ⇒ unit-testable without rendering, and no more divergent `Person` copies.

*Alternative:* keep inline objects in the `.astro` file. Rejected — that is how the three `Person` variants drifted.

### 4. `llms.txt` becomes a generated endpoint

New `src/pages/llms.txt.ts` builds the file from the `projects`, `posts` and `pages` collections following the llmstxt.org layout (H1, blockquote summary, `##` sections with link lists). The static prose intro moves into a constant in `src/lib/llms.ts`, shared with `llms-full.txt.ts`. `public/llms.txt` is deleted so it cannot shadow the endpoint. Both endpoints set `Content-Type: text/markdown; charset=utf-8` and a CDN cache header (`s-maxage=3600, stale-while-revalidate=86400`). `llms-full.txt` gains published (non-draft) posts in both languages.

*Alternative:* a build script that rewrites `public/llms.txt`. Rejected — needs a pre-build hook and still drifts if someone forgets to run it.

### 5. Markdown alternates per content page

Endpoints `src/pages/projects/[slug].md.ts`, `src/pages/en/projects/[slug].md.ts`, and the equivalent for blog posts return front-matter-free Markdown: title, description, canonical URL, tags, external link, then the language-specific body (reusing the `dataSection` extractor, moved into `src/lib/llms.ts`). HTML pages advertise them with `<link rel="alternate" type="text/markdown" href="…">`. Responses carry `X-Robots-Tag: noindex` so the Markdown copy does not compete with the canonical HTML in classic search while remaining fetchable by AI agents. The non-standard `<link rel="llm-context">` is removed; `llms.txt` links point to the `.md` URLs.

*Alternative:* content negotiation on `Accept: text/markdown` in middleware. Rejected for now — harder to cache and to test; can be layered on later.

### 6. robots.txt stays a static file, with a corrected policy

Keep `public/robots.txt` (the `astro-robots-txt` integration's output is already superseded by it — remove the integration and dependency to avoid two sources). Changes: remove `Host:` and the global `Crawl-delay`; replace per-bot `Allow: /` blocks with grouped user-agent lines; add current AI agents (`Claude-SearchBot`, `Claude-User`, `Google-CloudVertexBot`, `Gemini-Deep-Research`, `ChatGPT Agent`), drop retired ones (`Claude-Web`, `anthropic-ai`, `cohere-ai`). Keep the existing spam-bot denials.

Before removing `astro-robots-txt`, verify in a build which file actually wins in `dist/`; if the integration output wins, removal is mandatory rather than cleanup.

### 7. Sitemap `lastmod` from content

Content entries use their `date` (or an `updated` field when present); index pages use the max date of the entries they list; static pages use the `pages` collection `updated` value. No URL uses "today". `llms.txt` stays out of the sitemap's priority game (entry removed — it is not a page meant for search results).

### 8. Mobile hero animation: same sphere, cheaper, hydrated late

Remove `hidden md:block` and split hydration by viewport:

- Desktop (`≥768px`): unchanged — `client:media="(min-width: 768px)"`, 600 particles.
- Mobile (`<768px`): a second island instance with `client:visible` gated by `client:media`-equivalent logic inside a thin wrapper that dynamically `import()`s the sphere on `requestIdleCallback` (fallback `setTimeout`) **after** `load`. Mobile settings: ~180–250 particles, `devicePixelRatio` capped at 1.5, antialias off, render loop paused via `IntersectionObserver` when the hero is offscreen and on `visibilitychange`.

The hero's H1 is the LCP element and is server-rendered text, so deferring the Three.js chunk until idle keeps it off the LCP path. The sphere container is absolutely positioned inside a section with a fixed `min-h`, so late canvas insertion causes no CLS. The canvas fades in with a CSS opacity transition to avoid a pop.

*Alternatives considered:*
- **CSS-only / Canvas2D particle fallback on mobile** — smallest bytes, but a second animation implementation to maintain and visually different from desktop. Kept as the fallback if the Lighthouse budget (decision 10) cannot be met with Three.js.
- **`client:idle` directly on mobile** — simpler, but on slow phones idle fires before LCP is painted and the 525 KB chunk competes with it.

### 9. Mobile audit of CSS animations and layout

Sweep `global.css`, `blog.css`, `tokens.css`, `layout.css` and components for: hover-only affordances with no touch equivalent, transitions disabled or broken under `md:`, fixed widths causing horizontal overflow at 360px, tap targets under 44×44 px, and `backdrop-blur` on sticky headers (keep, but verify scroll jank on a throttled profile). Fix at the source with Tailwind utilities; no new animation library.

### 10. Verification

- `playwright.config.ts`: add `mobile-chrome` (Pixel 7) and `mobile-safari` (iPhone 14) projects alongside desktop Chromium.
- `tests/seo.spec.ts`: for each route × language assert one canonical, exactly one `theme-color`, one `description`, reciprocal hreflang pair + x-default, OG/Twitter image present, JSON-LD parses and contains the expected `@type` and a single `#edsel` Person definition; `/llms.txt`, `/llms-full.txt`, `/robots.txt`, `/sitemap.xml` and a `.md` alternate return 200 with expected content types.
- `tests/mobile.spec.ts`: no horizontal overflow (`scrollWidth <= clientWidth`) on every route; hero `<canvas>` attaches and is visible on mobile; with `reducedMotion: "reduce"` no canvas mounts; tap-target size check on nav/CTA.
- Lighthouse mobile via the existing `lighthouse-analyzer` agent against the Node-adapter build, before and after, recorded in the change notes. Budget: Performance ≥ 90, SEO = 100, Accessibility ≥ 95, LCP ≤ 2.5 s, CLS ≤ 0.1.

## Risks / Trade-offs

- [Three.js on mobile regresses LCP/TBT] → Post-load idle import, low particle count, DPR cap, offscreen pause; hard budget gate; documented fallback to CSS/Canvas2D animation.
- [Battery/thermal cost of a continuous WebGL loop on phones] → Pause on offscreen/hidden tab; honour `prefers-reduced-motion`; skip when `navigator.connection.saveData` is true.
- [Deleting `public/llms.txt` changes its bytes/format for crawlers that cached it] → Same URL, same structure; generated output is diffed against the current file before removal.
- [Markdown alternates create duplicate content] → `X-Robots-Tag: noindex` on `.md` responses; canonical HTML remains the only indexable variant.
- [robots.txt user-agent names go stale again] → Group them under one commented block with a "last reviewed" date; listed as a follow-up check rather than automated.
- [Font preload fix changes how the font URL is resolved] → Import the woff2 with Vite `?url` so the hash is always correct; verify in built HTML that the preload URL matches the CSS `@font-face` URL (otherwise the font downloads twice).
- [SSR endpoints add function invocations for txt/md] → CDN cache headers; content only changes on deploy.

## Migration Plan

1. Land head/schema/hreflang refactor with `tests/seo.spec.ts` (no URL changes).
2. Land generated `llms.txt`, extended `llms-full.txt`, `.md` alternates, robots and sitemap updates.
3. Land mobile hero animation + mobile CSS fixes with `tests/mobile.spec.ts`; run Lighthouse mobile before/after.
4. Deploy to a Vercel preview, validate with Google Rich Results Test and a manual phone check, then promote.

Rollback: each step is an independent commit; reverting step 3 restores the desktop-only sphere without touching SEO work. No data migrations.

## Open Questions

- Does the current build serve `public/robots.txt` or the `astro-robots-txt` output? (Determines whether decision 6's removal is cleanup or a fix.)
- Is the Twitter/X handle `@edselserrano` still valid for `twitter:site` and `sameAs`? Keep as-is unless told otherwise.
- Should blog `.md` alternates ship now while the blog is unlinked from navigation? Default: yes for published posts, since they are already in the sitemap.

# Implementation notes

## Baseline (2026-11-18, Node-adapter build, Lighthouse mobile)

| Page | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` | 100 | 100 | 100 | 100 | 1.4 s | 0 | 0 ms |
| `/projects/daily-potato` | 95 | 100 | 100 | 100 | 2.9 s | 0 | 0 ms |

The project page already misses the 2.5 s LCP budget before this change
(LCP element is the full-bleed cover image).

Smoke suite: 5/5 passing.

## robots.txt (task 1.3)

`astro-robots-txt` **overwrites** `public/robots.txt` at build time. The
served file is 23 bytes:

```
User-agent: *
Allow: /
```

So the sitemap line, AI-crawler rules and spam-bot denials in
`public/robots.txt` never reached production. Removing the integration is a
fix, not cleanup.

## Other findings

- `BlogLayout` and `PageLayout` each emit their own `<title>` in addition to
  the one from `SEOHead` → two `<title>` elements per page.
- Tag pages (`/tags`, `/tags/[tag]`, and `/en` mirrors) render `<SEOHead>`
  outside the layout, i.e. before `<!doctype>` instead of inside `<head>`.
- No posts exist yet (`src/content/posts` is empty); post paths are
  implemented but only exercised by build/type checks.

## After (2026-11-18, same setup)

| Page | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` (mobile sphere on) | 98–99 | 100 | 100 | 100 | 1.7 s | 0 | 40–130 ms |
| `/projects/daily-potato` | 95 | 100 | 100 | 100 | 2.9 s | 0 | 0 ms |

- First attempt with the unchanged scene on mobile scored **45** (TBT 4.3 s):
  the `UnrealBloomPass` post-processing dominates frame cost. Task 9.4 was
  resolved by turning bloom off on mobile (`bloom: false`) and drawing the
  particles brighter/larger instead; no Canvas2D fallback was needed.
- Home performance varies run to run because the scene starts during the
  trace: 7 of 8 runs after the bloom change were 98–100, one was 85.
- The project page LCP (2.9 s, cover image) is unchanged from baseline and
  still over the 2.5 s budget — task 9.3 stays open for that reason.

Playwright: 281 passed, 4 skipped (mobile-only hero tests on desktop
Chromium) across chromium, mobile-chrome (Pixel 7), mobile-safari (iPhone 14).
`astro check`: 0 errors. Both adapter builds succeed.

## Fixed along the way (not in the original task list)

- **OG images returned a broken body.** `/og/<slug>.png` answered
  `200 image/png` with the text "Internal server error": `@vercel/og` 1.0.3's
  Node ESM build calls `require("fs")` / `__dirname` for harfbuzz's wasm.
  Fixed in `src/pages/og/[slug].png.ts` (define both, lazy import) plus
  `includeFiles` for `hb.wasm` in the Vercel adapter. Verified on the Node
  build; **not verified on Vercel**.
- **Language switcher unreachable on project/post pages.** It sat in an
  absolute row painted over by the sticky header. Moved into the sticky bar
  (the redundant "Home" pill in that row was dropped).
- **English pages rendered `<SEOHead>` outside `<head>`**, and
  `/en/projects/<slug>` had no `SoftwareApplication` schema.

## Open

- 4.5 Rich Results Test, 9.5 preview validation: need a deployed URL.
- 8.5 sticky `backdrop-blur` scroll jank: not measured.
- The home page has no language switcher (only the nav links).

## Canonical host (decided 2026-11-18)

Production answers `301` from `edselserrano.com` to `www.edselserrano.com`.
The canonical host is now `https://www.edselserrano.com` everywhere:
`SITE_URL` (`src/lib/site.ts`), `site` in `astro.config.mjs`, `robots.txt`,
`security.txt`, both RSS feeds (now importing `SITE_URL`) and the tests.
Search Console should have the `www` property and the new sitemap URL
(`https://www.edselserrano.com/sitemap-index.xml`) submitted.

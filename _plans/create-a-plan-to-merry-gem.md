# edsel-site Improvement Plan

## Context

Site's primary job: be discovered (SEO), load fast (Core Web Vitals), signal competence to recruiters/clients. Current state has real bugs (wrong `lang` attribute on bilingual pages, duplicate `<title>` tags, 982KB PNG image) and missed opportunities (RSS, breadcrumb schema, dead code). Fixing these will directly move PageSpeed scores, fix search indexing errors, and make the site look polished under DevTools inspection.

---

## Quick Wins (Bugs — highest priority, each ≤30 min)

### QW-1 — Fix `lang` attribute bug in `BlogLayout.astro` (CRITICAL)
**File:** `src/layouts/BlogLayout.astro`
- `<html lang="en">` hardcoded on ALL blog pages regardless of current language
- Spanish posts (`/blog/1`) are indexed as English content by Google
- Fix: add `lang` prop to layout `Props` interface, thread from `[id].astro` and blog `index.astro`
- The `langCode` logic already exists in `SEOHead.astro` — reuse it

### QW-2 — Remove dead `skel.css` reference (HIGH)
**File:** `src/components/MainHead.astro`
- `<link rel="preload">` + `<link rel="stylesheet">` for `/assets/css/skel.css` (4KB, legacy HTML5Up template)
- Browser fetches it at high priority during critical path — blocking render for nothing
- Fix: delete both lines

### QW-3 — Fix viewport meta tag (HIGH)
**File:** `src/components/MainHead.astro`
- `<meta name="viewport" content="initial-scale=1.0">` is missing `width=device-width`
- Without it, iOS browsers use 980px default viewport — not mobile-optimized
- Fix: `content="width=device-width, initial-scale=1.0"`

### QW-4 — Reconcile GTM/Analytics setup (HIGH)
**Files:** `src/components/MainHead.astro`, `src/layouts/BlogLayout.astro`
- `MainHead.astro` has `G-76748FJ47B` (a GA4 ID, not a valid GTM container ID format `GTM-*`)
- `BlogLayout.astro` has `GTM-KW47SVK` (valid GTM container)
- `@vercel/analytics` is installed in `package.json` but never imported anywhere
- Fix: pick ONE approach. Recommended: use `@vercel/analytics/astro` `<Analytics />` in shared layout, remove the broken GTM block from `MainHead.astro`, keep `GTM-KW47SVK` in `BlogLayout.astro` or also replace it

### QW-5 — Remove invalid `SearchAction` from JSON-LD (MEDIUM)
**File:** `src/components/SEOHead.astro`
- `potentialAction` points to `${siteUrl}/search?q=...` but no `/search` route exists
- Google will crawl it, get 404, and log structured data errors in Search Console
- Fix: delete the `potentialAction` block from the `type === 'website'` JSON-LD condition

### QW-6 — Fix duplicate `<title>` on homepage (MEDIUM)
**Files:** `src/pages/index.astro`, `src/components/MainHead.astro`
- `index.astro` uses both `<SEOHead>` and `<MainHead>` — both emit `<title>` and `<meta name="description">`
- Fix: strip `<title>` and description from `MainHead.astro` since `SEOHead.astro` handles them, OR drop `MainHead` from homepage after resolving QW-4

---

## Performance Improvements

### PERF-1 — Convert `pong.png` (982KB → ~60KB) (CRITICAL)
**Files:** `public/pong.png`, `src/lib/data.ts`
- Largest file in repo, loads on every blog listing page
- Fix: `cwebp -q 82 public/pong.png -o public/pong.webp`, update `cover` field for post ID 5 in `data.ts`, delete `pong.png`

### PERF-2 — Convert remaining PNG images to WebP (HIGH)
**Files:** `public/edsel-chat.png` (112KB), `public/pokemon-poker.png` (40KB)
- Update `cover` entries in `src/lib/data.ts` after conversion

### PERF-3 — Add `astro:assets` Image component for optimization (HIGH)
**Files:** `src/pages/blog/[id].astro`, `src/components/PostCard.astro`
- Site uses `output: "server"` — Astro's built-in `<Image />` from `astro:assets` serves WebP/AVIF automatically and adds width/height to prevent CLS
- Targets: cover images in post detail and card thumbnails in blog listing

### PERF-4 — Switch Three.js to named imports (HIGH)
**File:** `src/components/Particles/sparklingSphere.tsx`
- `import * as THREE from 'three'` pulls ~600KB; Rollup tree-shaking of Three.js is imperfect
- Fix: named imports for only what's used: `Scene`, `PerspectiveCamera`, `WebGLRenderer`, `Vector2`, `Vector3`, `SphereGeometry`, `MeshStandardMaterial`, `Mesh`, `Group`, `AmbientLight`, `PointLight`, `Color`, `MathUtils`, `ACESFilmicToneMapping`, `CanvasTexture`, `Raycaster`, `Plane`

### PERF-5 — Add `font-display: swap` to Google Fonts (MEDIUM)
**File:** `src/components/MainHead.astro`
- Source Sans Pro loaded without `display` param — browser may block text during font load
- Fix: append `&display=swap` to the Google Fonts URL
- Also remove the incorrect `<link rel="preload" as="font">` pointing to the CSS URL (not the actual font file)

---

## SEO Improvements

### SEO-1 — Add RSS feed (HIGH)
**New files:** `src/pages/rss.xml.ts`, `src/pages/en/rss.xml.ts`
- Install `@astrojs/rss`, generate feed from `src/lib/data.ts` posts
- Two feeds: `/rss.xml` (ES) and `/en/rss.xml` (EN)
- Add `<link rel="alternate" type="application/rss+xml">` to `BlogLayout.astro` and `index.astro` heads

### SEO-2 — Add breadcrumb JSON-LD to blog posts (MEDIUM)
**File:** `src/components/SEOHead.astro` or `src/pages/blog/[id].astro`
- Add `BreadcrumbList` schema when `type === 'article'`
- Chain: `Home > Blog > [Post Title]`
- Localized: ES uses `/blog/`, EN uses `/en/blog/`

---

## Content Improvements

### CONTENT-1 — Expand Dineqrs project description (HIGH)
**File:** `src/lib/data.ts` (post ID 3)
- `content_p2` is empty for both languages; `content` is minimal
- Dineqrs (`dineqrs.com`) is the most credible commercial project in the portfolio
- Add: tech stack, role, scale/impact, interesting technical decisions — for both `es` and `en`

### CONTENT-2 — Add `tags` field to Post data model (LOW)
**File:** `src/lib/data.ts`, `src/pages/blog/[id].astro`
- Lines 217-220 of `[id].astro` show `['React', 'TypeScript', 'Tailwind CSS', 'Astro']` hardcoded for every post
- Add `tags: string[]` to the `Post` interface and populate per-post values
- Makes tags semantic (LSI keywords) and meaningful to readers

---

## Code Cleanup

### CLEANUP-1 — Delete unused Particles components (MEDIUM)
**Files:** `src/components/Particles/container.jsx`, `index.jsx`, `v2.jsx`
- Only `sparklingSphere.tsx` is imported; others are dead code
- `index.jsx` (tsparticles) is only referenced via script tag in `404.astro`, not through the component

### CLEANUP-2 — Delete unused layouts (MEDIUM)
**Files:** `src/layouts/BaseLayout.astro`, `src/layouts/project.astro`
- `BaseLayout.astro` imports old `@fontsource/roboto` and `blog.css`, not used by any page
- `project.astro` references CSS variables that don't exist in the current design system
- Both are dead code

### CLEANUP-3 — Wire up or remove `@vercel/analytics` (LOW)
**File:** `package.json`
- Either add `<Analytics />` from `@vercel/analytics/astro` to shared layout, or `pnpm remove @vercel/analytics`

---

## Verification

1. **Source inspection**: `astro build && astro preview` — check View Source on homepage, `/blog/1` (ES), `/en/blog/1` (EN):
   - Single `<title>` per page
   - `lang` correct per route (`es` vs `en`)
   - No `skel.css` reference
   - `viewport` includes `width=device-width`

2. **Network waterfall**: cold load blog listing — `pong.png` no longer appears; Three.js chunk is smaller

3. **PageSpeed Insights**: run on homepage + blog post — target LCP < 2.5s, CLS < 0.1

4. **Google Rich Results Test**: blog post URL — Article schema clean, BreadcrumbList visible

5. **RSS feed**: navigate to `/rss.xml` in browser — valid XML renders; autodiscovery link present in `<head>`

---

## Critical Files

| File | Changes |
|------|---------|
| `src/components/MainHead.astro` | QW-2, QW-3, QW-4, PERF-5 |
| `src/layouts/BlogLayout.astro` | QW-1, SEO-1 (RSS link) |
| `src/pages/index.astro` | QW-6 |
| `src/components/SEOHead.astro` | QW-5, SEO-2 |
| `src/lib/data.ts` | PERF-1, PERF-2, CONTENT-1, CONTENT-2 |
| `src/components/Particles/sparklingSphere.tsx` | PERF-4 |
| `src/pages/blog/[id].astro` | PERF-3, CONTENT-2 |
| `src/components/PostCard.astro` | PERF-3 |
| `public/pong.png` → `public/pong.webp` | PERF-1 |
| `public/edsel-chat.png` → `.webp` | PERF-2 |
| `src/pages/rss.xml.ts` (new) | SEO-1 |
| `src/pages/en/rss.xml.ts` (new) | SEO-1 |

# Status board — modernización edselserrano.com

> Fuente de verdad de qué está en curso, hecho o bloqueado. Cada agente actualiza su fila al empezar y al terminar.

## Estados

- ⚪ `not_started` — disponible para tomar
- 🟡 `in_progress` — alguien lo está trabajando
- 🔴 `blocked` — esperando una dependencia
- 🟢 `done` — mergeado a `main`

## Tablero

| # | Plan | Estado | Owner | Branch | Notas |
|---|------|--------|-------|--------|-------|
| 01 | [cleanup](./01-cleanup.md) | 🟢 done | claude (01-cleanup) | `feat/cleanup` | Bundle dist/: **2.1M → 1.3M** (-38%). Total `_astro/*.js`: 752K → 732K. Svelte chunk (24K) eliminado. Font Awesome (~190K en /src/fonts) eliminado. |
| 02 | [design-system](./02-design-system.md) | ⚪ not_started | — | `feat/design-system` | Esperar a 01 |
| 03 | [content-migration](./03-content-migration.md) | ⚪ not_started | — | `feat/content-migration` | Esperar a 01 |
| 04 | [homepage](./04-homepage.md) | ⚪ not_started | — | `feat/homepage` | Esperar a 02 |
| 05 | [blog-features](./05-blog-features.md) | ⚪ not_started | — | `feat/blog-features` | Esperar a 02 y 03 |
| 06 | [new-pages](./06-new-pages.md) | ⚪ not_started | — | `feat/new-pages` | Esperar a 02 y 03 |
| 07 | [perf-a11y](./07-perf-a11y.md) | 🟢 done | claude (07-perf-a11y) | `feat/perf-a11y` | Lighthouse ≥ 95 en perf/a11y/bp/seo, desktop + mobile, en las 6 rutas auditadas. |

## Lock zones — quién tiene el archivo

| Archivo | Owner actual | Hasta |
|---------|--------------|-------|
| `package.json` | libre | — (tocado por 01, ahora libre) |
| `astro.config.mjs` | libre | — (tocado por 01, ahora libre) |
| `src/styles/tokens.css` | no existe aún | lo crea 02 |
| `src/content/config.ts` | no existe aún | lo crea 03 |

## Lighthouse — baseline vs final (sobre `feat/wave-3-integrated` + fixes de 07)

Audit local con `@astrojs/node` adapter (Vercel adapter no soporta `astro preview`).
Servido en `http://127.0.0.1:4500`, headless Chrome.

### Desktop preset (`--preset=desktop`)

| Ruta | Perf antes | Perf después | A11y antes | A11y después | BP antes | BP después | SEO antes | SEO después |
| ---- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `/` | 98 | **97** | 95 | **100** | 92 | **100** | 100 | 100 |
| `/blog` | 99 | **100** | 92 | **100** | 92 | **100** | 100 | 100 |
| `/projects` | 98 | **100** | 92 | **100** | 92 | **100** | 100 | 100 |
| `/projects/daily-potato` | 100 | 100 | 88 | **100** | 92 | **100** | 100 | 100 |
| `/about` | 100 | 100 | 95 | **100** | 96 | **100** | 100 | 100 |
| `/now` | 100 | 100 | 100 | 100 | 96 | **100** | 100 | 100 |

### Mobile preset (default Lighthouse mobile)

| Ruta | Perf | A11y | BP | SEO |
| ---- | :---: | :---: | :---: | :---: |
| `/` | 97 | 100 | 100 | 100 |
| `/blog` | 99 | 100 | 100 | 100 |
| `/projects` | 95 | 100 | 100 | 100 |
| `/projects/daily-potato` | 95 | 100 | 100 | 100 |
| `/about` | 99 | 100 | 100 | 100 |
| `/now` | 98 | 100 | 100 | 100 |

> El único score que NO llega a 100 es Perf en home desktop (97) — limitado por el bundle de Three.js para el sphere decorativo. Aceptable: queda muy por encima del piso de 95 y el sphere es la "firma visual" del sitio.

## Bitácora

| Fecha | Agente | Acción |
|-------|--------|--------|
| 2026-05-22 | claude | Creó el plan multi-agente |
| 2026-05-22 | claude (01-cleanup) | Cleanup terminado en `feat/cleanup`: removidas deps muertas (svelte, roboto, react-device-detect), borrado src/fonts/ Font Awesome (~190K), Social/Footer migrados a .astro con astro-icon + lucide (Twitter → X, todos los externos con `rel="noopener noreferrer"`), sparklingSphere ahora respeta `prefers-reduced-motion` y limpia GPU resources, Body en español, global.scss sin vendor prefixes ni cruft HTML5UP. Bundle dist/ 2.1M → 1.3M. `pnpm build` pasa limpio. |
| 2026-05-22 | claude (07-perf-a11y) | Pulido final en `feat/perf-a11y`. **Perf**: sphere se carga sólo en desktop (`client:media="(min-width: 768px)"`), primer card de FeaturedWork con `fetchpriority="high"`, preload del woff2 de Inter en los tres layouts. **A11y**: skip-to-content global, `<main id="main">` en BlogLayout/PageLayout/home, focus-visible token unificado, contrast fixes (`--fg-subtle` a zinc-400, badges de proyectos con `color: var(--c-zinc-950)`), target-size en chips de tags ≥ 24px, headings ordenadas (h3 → h2 en project detail), `a:visited` en `@layer base` para que Tailwind `text-fg-*` siga ganando. **BP**: removidos refs a apple-touch-icon/favicon-{16,32} que 404eaban, manifest limpio, Vercel Analytics gated por `process.env.VERCEL === "1"`, GTM IIFE eliminado (no se usaba), charset como primer hijo de `<head>` vía slot `head` en BlogLayout. **SEO**: JSON-LD Person en home, SoftwareApplication en `/projects/[slug]`, Article en posts (antes BlogPosting), canonicals y hreflang ya funcionaban. **View transitions**: `<ClientRouter />` también en home `/` y `/en/`. **Tests**: `tests/smoke.spec.ts` Playwright (8 tests, todos passing). **Build**: `pnpm build` limpio; `astro check` con 6 errors pre-existentes en LanguageSwitcher (no introducidos por este PR). |

---
plan_id: "07-perf-a11y"
title: "Performance, accessibility y pulido final"
status: not_started
owner: ""
branch: "feat/perf-a11y"
depends_on: ["04-homepage", "05-blog-features", "06-new-pages"]
blocks: []
estimated_hours: 5
---

# 07 — Performance, accessibility y pulido final

## Goal
Pasada final sobre el sitio completo. Objetivo: **Lighthouse ≥ 95 en performance, accessibility, best practices y SEO** en mobile y desktop. Más algunos detalles de pulido (view transitions, JSON-LD).

## Why
Los agentes anteriores hicieron foco en estructura y diseño. Este cierra la calidad medible y los detalles que separan un sitio "ok" de uno "profesional".

## Files to touch (cualquiera del repo)
Este agente puede tocar **cualquier archivo** porque su trabajo es transversal. Reglas:
- No introducir regresiones visuales — confirmar contra screenshots de antes/después.
- No reabrir trabajo cerrado de agentes anteriores sin justificación documentada.

## Out of scope
- Cambios de diseño grandes — si encuentras un problema visual mayor, abrir issue / PR separado, no resolver acá.
- Nuevas features de contenido — no agregar páginas ni componentes nuevos.

## Pasos

### 1. Auditoría base
```bash
pnpm build
pnpm preview &
npx lighthouse http://localhost:4321 --view --preset=mobile
npx lighthouse http://localhost:4321/blog --view --preset=mobile
npx lighthouse http://localhost:4321/projects --view --preset=mobile
npx lighthouse http://localhost:4321/about --view --preset=mobile
```
Anotar baseline en `STATUS.md`.

### 2. Performance

**Three.js sphere**
- Confirmar `geometry.dispose()`, `material.dispose()`, `renderer.dispose()` en cleanup.
- Bajar a 600/300 (desktop/mobile) si no se hizo en 01/04.
- `requestAnimationFrame` con throttle a 30fps cuando la página no está en foco (`document.visibilityState`).
- Carga lazy: `client:visible` en lugar de `client:only` si visualmente acepta una pausa.

**Imágenes**
- Convertir todos los `cover` a AVIF + WebP con `<Picture>` de `astro:assets`.
- `loading="lazy"` en cards (ya está en algunas; verificar).
- `decoding="async"`.

**JS payload**
- Confirmar que React sólo se hidrata donde es necesario (`client:*` directives explícitas).
- Quitar `@vercel/analytics` si no se usa, o que cargue `defer`.
- `GTM` script: si Edsel realmente no lo usa, sacarlo. Si sí, cargar con `defer` (revisar `BlogLayout.astro` — actualmente es inline IIFE).

**Fonts**
- `font-display: swap` (default en `@fontsource-variable`).
- Preload de los 1-2 weights más críticos en `MainHead.astro`.

**Compresión**
- `astro-compress` ya activo. Confirmar que comprime HTML, JS, CSS (no SVG por config actual; OK).

### 3. Accessibility

**Estructura**
- Cada página tiene un `<main>` único y un `<h1>` único.
- Landmarks: `<nav>`, `<main>`, `<footer>`, `<aside>` (TOC) correctos.
- Skip link en el body: `<a href="#main" class="sr-only focus:not-sr-only">Saltar al contenido</a>`.

**Focus**
- Ring visible con `:focus-visible` consistente. Token `--focus-ring: 2px solid var(--accent)`.
- Tab order revisado en cards (link cobertura, no `<div onClick>`).

**Contraste**
- WCAG AA mínimo. Usar https://webaim.org/resources/contrastchecker/ para los tokens nuevos.
- Texto `--fg-muted` sobre `--bg-app` ≥ 4.5:1.

**Lectores de pantalla**
- `aria-label` en iconos-only buttons (share, back-to-top, etc.).
- `<time datetime="">` con valor ISO en todas las fechas.
- `alt` descriptivo en imágenes (no "cover" o vacío); si decorativa, `alt=""`.

**Motion**
- Confirmar que `prefers-reduced-motion` apaga sphere, view transitions y animaciones de hover dramáticas.

**Reduced data**
- `prefers-reduced-data`: opcional, no mostrar sphere si está activo.

### 4. SEO

**Per-page**
- Confirmar que cada página renderiza `<title>`, `<meta description>`, `og:title`, `og:description`, `og:image`, `twitter:card`.

**Structured data**
- `/blog/<slug>`: JSON-LD `Article` con `author`, `datePublished`, `dateModified`, `image`.
- `/projects/<slug>`: `SoftwareApplication` o `CreativeWork`.
- `/`: `Person` con `sameAs` apuntando a sus redes.

**Sitemap**
- `@astrojs/sitemap` ya activo. Verificar que incluye todas las nuevas rutas (`/about`, `/now`, `/uses`, `/projects/*`, `/tags/*`).
- `robots.txt` ya existe en `public/`. Confirmar que apunta al sitemap.

**Canonical**
- Cada página declara `<link rel="canonical">` y `<link rel="alternate" hreflang>` para es/en. Ya está implementado en `SEOHead.astro`; verificar que las rutas nuevas lo pasen correctamente.

### 5. View transitions
Astro 5+ trae `<ClientRouter />` (ya está en `BlogLayout.astro`). Asegurar que también está en el layout del homepage y que las transiciones funcionan entre:
- `/` → `/projects/<slug>` (la card del FeaturedWork transiciona al detalle)
- `/blog` → `/blog/<slug>` (mantener los `transition:name` existentes)

### 6. PWA básico (opcional, low priority)
`public/site.webmanifest` ya existe; revisar:
- `theme_color` matchea el token `--bg-app`
- `icons` apuntan a archivos que existen
- Si Edsel quiere, agregar service worker con `@vite-pwa/astro` (sólo si Lighthouse PWA lo pide).

### 7. Tests de humo
Crear `tests/smoke.spec.ts` con Playwright (o `@astrojs/check`):
- `/` carga, sphere visible, h1 visible
- `/blog` carga, lista al menos 0+ items sin crash
- `/projects/daily-potato` (uno cualquiera) carga
- `/about`, `/now`, `/uses` cargan

```bash
pnpm add -D @playwright/test
npx playwright install chromium
```
Documentar en README cómo correrlos.

### 8. CI básico (opcional)
Si Edsel quiere: GitHub Action que corre `pnpm build`, `astro check` y los smoke tests en cada PR.

### 9. Comparar contra baseline
Re-correr Lighthouse y documentar deltas en `STATUS.md`:
| Ruta | Perf antes | Perf después | A11y antes | A11y después | SEO antes | SEO después |
| ---- | ---------- | ------------ | ---------- | ------------ | --------- | ----------- |

## Acceptance criteria

- [ ] Lighthouse en `/`, `/blog`, `/projects/<x>`, `/about`, `/now`: Performance ≥ 95, A11y ≥ 95, Best practices ≥ 95, SEO ≥ 95 (mobile y desktop)
- [ ] Skip-to-content presente en todas las páginas
- [ ] `focus-visible` consistente con `--accent`
- [ ] Imágenes con `<Picture>` AVIF+WebP donde aplique
- [ ] JSON-LD Article en posts, SoftwareApplication en projects, Person en home
- [ ] View transitions activas entre home/blog/posts
- [ ] Smoke tests pasando (`pnpm test`)
- [ ] Baseline vs final documentado en `STATUS.md`
- [ ] PR mergeado a `main`

## Definition of "done" del proyecto entero
Cuando este PR cierre:
- El sitio tiene 1 solo lenguaje visual de punta a punta.
- Edsel puede publicar un post nuevo escribiendo un `.mdx` en `src/content/posts/`.
- `/about`, `/now`, `/uses` están vivas.
- Lighthouse en verde en las 4 categorías, en las 4 rutas clave.
- Cero dependencias muertas en `package.json`.
- Cero referencias a HTML5UP, Font Awesome self-hosted o Source Sans Pro CDN.

🎉

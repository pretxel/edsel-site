---
plan_id: "02-design-system"
title: "Design system & tokens compartidos"
status: not_started
owner: ""
branch: "feat/design-system"
depends_on: ["01-cleanup"]
blocks: ["04-homepage", "05-blog-features", "06-new-pages"]
estimated_hours: 4
---

# 02 — Design system & tokens compartidos

## Goal
Crear **un solo lenguaje visual** compartido entre homepage y blog. Hoy el home usa la paleta HTML5UP y el blog usa Tailwind `zinc-*` con gradients propios. Después de este agente, todo consume los mismos tokens.

## Why
El home y el blog se sienten dos sitios. Sin tokens compartidos, cualquier rediseño futuro va a divergir otra vez. Esto es la base sobre la que construyen 04, 05 y 06.

## Files to touch (exclusivos de este agente)
- `src/styles/tokens.css` (**crear**)
- `src/styles/global.scss` → renombrar a `src/styles/global.css` (sin SCSS), limpiar y usar tokens
- `src/styles/blog.css`
- `src/layouts/layout.css`
- `tailwind.config.*` si hace falta extender (Tailwind 4 ya soporta `@theme inline` con CSS vars)
- `astro.config.mjs` (asegurar import de `tokens.css` global)

## Out of scope (NO tocar)
- `src/lib/data.ts` — agente 03
- `src/content/**` — agente 03
- `src/components/**` — sólo si necesitas migrar **clases** a tokens, sí; pero **no** rediseños de layout (eso es 04/05/06)
- `src/pages/blog/[id].astro` y `src/pages/blog/index.astro` — agente 05

## Decisiones de diseño a respetar

- **Modo:** dark por default (ya lo es en `/blog`).
- **Paleta base:** zinc + un acento. Reemplazar el random color de la sphere por una sola paleta de marca.
- **Acento de marca:** azul `#46b4ff` (ya existe como `--c-blue` en `global.scss`). Usarlo como `--color-accent`.
- **Tipografía:** Inter Variable (sans) + JetBrains Mono Variable (mono). Eliminar Source Sans Pro CDN.
- **Radii:** consistente — sm `4px`, md `8px`, lg `12px`, xl `16px`, 2xl `24px`.
- **Spacing:** confiar en Tailwind scale; sólo tokenizar lo que se usa fuera de utilities.

## Pasos

### 1. Instalar fuentes variables
```bash
pnpm add @fontsource-variable/inter @fontsource-variable/jetbrains-mono
```
Importarlas en `src/layouts/BlogLayout.astro` y en el nuevo layout del home (cuando 04 lo cree) — o globalmente en `src/styles/tokens.css` con `@import`.

### 2. Crear `src/styles/tokens.css`
Single source of truth. Estructura propuesta:

```css
@layer tokens {
  :root {
    /* ── Color primitives ───────────────────────────── */
    --c-zinc-50:  #fafafa;
    --c-zinc-100: #f4f4f5;
    --c-zinc-200: #e4e4e7;
    --c-zinc-300: #d4d4d8;
    --c-zinc-400: #a1a1aa;
    --c-zinc-500: #71717a;
    --c-zinc-600: #52525b;
    --c-zinc-700: #3f3f46;
    --c-zinc-800: #27272a;
    --c-zinc-900: #18181b;
    --c-zinc-950: #09090b;

    --c-accent-400: #6cc4ff;
    --c-accent-500: #46b4ff;
    --c-accent-600: #2196f3;

    --c-success: #9ef2cb;
    --c-warn:    #ffb7a3;
    --c-danger:  #ff6b6b;

    /* ── Semantic (dark by default) ─────────────────── */
    --bg-app:     var(--c-zinc-950);
    --bg-surface: var(--c-zinc-900);
    --bg-elev:    var(--c-zinc-800);
    --bg-muted:   rgba(255,255,255,0.04);

    --fg-strong:  var(--c-zinc-50);
    --fg-default: var(--c-zinc-200);
    --fg-muted:   var(--c-zinc-400);
    --fg-subtle:  var(--c-zinc-500);

    --border-default: rgba(255,255,255,0.08);
    --border-strong:  rgba(255,255,255,0.16);

    --accent:        var(--c-accent-500);
    --accent-hover:  var(--c-accent-400);

    /* ── Typography ─────────────────────────────────── */
    --font-sans: "Inter Variable", system-ui, -apple-system, "Segoe UI", sans-serif;
    --font-mono: "JetBrains Mono Variable", ui-monospace, "SF Mono", monospace;

    --text-xs:   0.75rem;
    --text-sm:   0.875rem;
    --text-base: 1rem;
    --text-lg:   1.125rem;
    --text-xl:   1.25rem;
    --text-2xl:  1.5rem;
    --text-3xl:  1.875rem;
    --text-4xl:  2.25rem;
    --text-5xl:  3rem;
    --text-6xl:  3.75rem;

    --leading-tight:  1.2;
    --leading-snug:   1.4;
    --leading-normal: 1.6;
    --leading-relaxed:1.75;

    /* ── Radii ──────────────────────────────────────── */
    --radius-sm:  4px;
    --radius-md:  8px;
    --radius-lg:  12px;
    --radius-xl:  16px;
    --radius-2xl: 24px;
    --radius-full: 9999px;

    /* ── Motion ─────────────────────────────────────── */
    --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
    --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
    --dur-fast: 150ms;
    --dur-base: 250ms;
    --dur-slow: 400ms;
  }

  @media (prefers-reduced-motion: reduce) {
    :root {
      --dur-fast: 0ms;
      --dur-base: 0ms;
      --dur-slow: 0ms;
    }
  }
}
```

### 3. Tailwind 4 `@theme inline`
Tailwind 4 lee CSS vars con `@theme inline`. En `src/styles/global.css` (después de migrar de SCSS):
```css
@import "tailwindcss";
@import "./tokens.css";

@theme inline {
  --color-bg: var(--bg-app);
  --color-surface: var(--bg-surface);
  --color-accent: var(--accent);
  --color-fg: var(--fg-default);
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --radius-md: var(--radius-md);
  /* ... */
}
```
Así `bg-bg`, `text-fg`, `text-accent`, etc. quedan disponibles en cualquier componente.

### 4. Migrar `global.scss` → `global.css`
- Borrar `global.scss`, crear `global.css` con los `@import` arriba.
- Si quedan estilos del home (`.header h1`, `.footer nav`), portarlos usando tokens.
- Quitar el `--c-*` legacy y los `--f-uN` exponenciales (no se usan).

### 5. Actualizar `blog.css` y `layout.css`
- Cambiar `bg-zinc-900` literal por `bg-surface` (clase generada por `@theme inline`).
- Reemplazar `from-blue-400 to-purple-500` gradients por `from-accent to-accent-hover` o un token específico `--gradient-brand`.
- Confirmar que el dark theme funciona sin la clase `.dark` (es default).

### 6. Verificar fuentes
- En DevTools, network tab: sólo Inter y JetBrains Mono deben cargar.
- No debe quedar request a `fonts.googleapis.com/css?family=Source+Sans+Pro`.

## Acceptance criteria

- [ ] `src/styles/tokens.css` existe y contiene tokens de color, tipo, radii y motion
- [ ] `src/styles/global.scss` no existe; reemplazado por `global.css`
- [ ] `src/styles/blog.css` y `layout.css` usan tokens (no literales `#27272a`, no `from-blue-400`)
- [ ] Inter Variable y JetBrains Mono Variable cargan vía `@fontsource-variable`
- [ ] No hay request a `fonts.googleapis.com` ni a la cdn de FontAwesome
- [ ] Tailwind 4 `@theme inline` expone `bg-bg`, `bg-surface`, `text-fg`, `text-accent`, `font-sans`, `font-mono`
- [ ] Build verde, `/` y `/blog` se ven correctos visualmente (puede haber drift menor — los rediseños vienen en 04/05)
- [ ] PR mergeado a `main`

## Handoff
- Documentar en el PR los nombres de clases que ahora ofrece Tailwind 4 vía `@theme inline` para que 04, 05 y 06 las usen.
- Si descubres tokens que necesitas y no están en este plan, agrégalos al PR y deja una nota en `STATUS.md`.

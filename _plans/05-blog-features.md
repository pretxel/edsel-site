---
plan_id: "05-blog-features"
title: "Blog features: split projects/posts, tags, reading time, OG"
status: not_started
owner: ""
branch: "feat/blog-features"
depends_on: ["02-design-system", "03-content-migration"]
blocks: ["07-perf-a11y"]
estimated_hours: 7
---

# 05 — Blog features

## Goal
Separar **proyectos** (portafolio externo) de **posts** (artículos escritos), agregar tags navegables, reading time real, OG images dinámicas y limpiar bugs del detalle del post.

## Why
- Hoy "Blog" en realidad es un portafolio: los 7 entries son proyectos con `externalLink`. No hay artículos escritos por Edsel.
- Tags se muestran pero no son navegables (no hay `/tags/[slug]`).
- "5 min read" está hardcoded en cada post.
- OG image es la `cover` estática del proyecto; con artículos reales hace falta generación dinámica.
- `navigator.share` no tiene fallback en desktop.
- Related posts es `slice(0, 3)`, no por afinidad de tags.

## Files to touch (exclusivos de este agente)
- `src/pages/projects/index.astro` (**crear**)
- `src/pages/projects/[slug].astro` (**crear** — adaptación del actual `/blog/[id]`)
- `src/pages/en/projects/index.astro`, `src/pages/en/projects/[slug].astro` (**crear**)
- `src/pages/blog/index.astro` y `src/pages/en/blog/index.astro` — reescribir para listar **posts** de la colección, no proyectos
- `src/pages/blog/[slug].astro` y `src/pages/en/blog/[slug].astro` — reemplazar `[id].astro` (sí, cambia de `id` numérico a `slug` MDX)
- `src/pages/tags/[tag].astro` (**crear**)
- `src/pages/en/tags/[tag].astro` (**crear**)
- `src/components/PostCard.astro` — refactorizar para reusarse en cards de posts y proyectos (prop `variant`)
- `src/components/ProjectCard.astro` (**crear** o variant en PostCard)
- `src/components/blog/TableOfContents.astro` (**crear**)
- `src/components/blog/ReadingProgress.astro` (**crear**)
- `src/components/blog/ShareButtons.astro` (**crear**)
- `src/lib/reading-time.ts` (**crear**)
- `src/pages/og/[slug].png.ts` (**crear** — OG image dinámica con `@vercel/og` o `satori`)
- `src/pages/rss.xml.ts` y `/en/rss.xml.ts` — incluir posts + proyectos

## Out of scope (NO tocar)
- Schema de colecciones — agente 03 (si encuentras un campo faltante, abrir issue / PR separado)
- Homepage — agente 04
- `/about` y `/now` — agente 06
- Perf fina y a11y — agente 07

## Pasos

### 1. Reading time real
`src/lib/reading-time.ts`:
```ts
const WPM = 220;
export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / WPM));
}
```
Usar en cada PostCard, ProjectCard y página de detalle. Calcular del `body` del entry de Content Collections.

### 2. Reestructurar rutas

**Decisión:** `/blog` = artículos. `/projects` = portafolio. El `blog/[id]` actual con números va a 301 redirigir a `/projects/<slug>` (Vercel rewrites o un middleware Astro simple).

- `src/pages/blog/index.astro`: lista `getAllPosts(lang)`. Si vacío, placeholder amigable.
- `src/pages/blog/[slug].astro`: renderiza un `posts` entry con `<Content />` MDX.
- `src/pages/projects/index.astro`: lista `getAllProjects()` localizados.
- `src/pages/projects/[slug].astro`: detalle con la sección bilingüe correcta + `externalLink` CTA.
- `src/pages/tags/[tag].astro`: `getStaticPaths` genera de la unión de tags de posts + proyectos. Render lista combinada.

### 3. Redirects de URLs antiguas
En `astro.config.mjs` o vía Vercel:
- `/blog/1` → `/projects/daily-potato`
- `/blog/2` → `/projects/chat-edsel`
- … (mapear los 7 IDs viejos a slugs nuevos)
- Idem `/en/blog/N` → `/en/projects/<slug>`

### 4. Componente PostCard refactor
Aceptar prop `variant: "post" | "project"`. Diferencias:
- `post`: muestra reading time + lang badge + tags clickables.
- `project`: muestra "ver proyecto ↗" con icono externo si hay `externalLink`, tags clickables, badge de color.

Mantener el mismo look & feel actual (es bonito) — sólo parametrizar y consumir tokens del agente 02.

### 5. Página de detalle de post (`blog/[slug].astro`)
- Header sticky con [← Volver al blog] + share.
- Hero: cover (si lo hay) + título + meta (autor, fecha, reading time real, tags clickables).
- Body: `<Content />` con `prose prose-invert` ya está. Confirmar que MDX renderiza `<h2>` etc. con los estilos.
- **Table of Contents:** componente lateral en desktop (sticky), se genera del MDX. Usar el plugin `remark-toc` o iterar `headings` que Astro expone.
- **Reading progress bar:** barra superior fija que avanza según `scrollY / scrollHeight`. Inline script pequeño.
- **Share buttons:** componente con fallback. Si `navigator.share` existe, usarlo; si no, copy-to-clipboard + toast. Reemplazar el `onclick` inline actual.
- Related posts por **afinidad de tags** (intersección, top 3).

### 6. Página de detalle de proyecto (`projects/[slug].astro`)
- Mismo skeleton pero el body renderiza la sección del lang activo.
- CTA grande "Visitar proyecto ↗" si hay `externalLink`.
- Tags clickables.
- Related: otros proyectos con tags en común.

### 7. Tags
- `src/pages/tags/[tag].astro` lista posts+proyectos con ese tag.
- Tag chips en cards y detail se vuelven `<a href="/tags/{tag}">`.
- Slug del tag: lowercase + kebab (`"Next.js"` → `nextjs` o `next-js`; documentar la decisión).

### 8. OG images dinámicas
- Instalar `@vercel/og` o usar `satori` standalone.
- `src/pages/og/[slug].png.ts` retorna PNG con:
  - Título grande
  - Autor + fecha + reading time
  - Color de acento o background gradient con el `color` del project (si aplica)
- En el `SEOHead`, si hay un slug, pasar `image: /og/<slug>.png` para `og:image` y Twitter card.

### 9. RSS combinado
- `src/pages/rss.xml.ts`: incluir posts (`lang === 'es'`) + proyectos (sección es). Para los proyectos, el "content" del feed puede ser `description + externalLink`.
- Validar en https://validator.w3.org/feed/.

### 10. Limpiar bugs del detalle actual
- Quitar `onclick="navigator.share(...)"` inline en favor del componente `ShareButtons`.
- Quitar `5 min read` hardcoded.
- Confirmar que `back-to-top` funciona en mobile (touch).

## Acceptance criteria

- [ ] `/blog` lista artículos de `posts` (o placeholder vacío con mensaje)
- [ ] `/projects` lista los 7 proyectos migrados con su look & feel actual
- [ ] `/blog/<slug>` renderiza MDX con TOC, reading-progress, share buttons funcionales (incluido fallback clipboard)
- [ ] `/projects/<slug>` renderiza la sección bilingüe correcta y CTA "Visitar proyecto ↗"
- [ ] `/tags/<tag>` muestra unión de posts+proyectos con ese tag
- [ ] Redirects `/blog/N` → `/projects/<slug>` activos
- [ ] Reading time se calcula del contenido real (no hardcoded)
- [ ] OG images dinámicas servidas en `/og/<slug>.png` y referenciadas en `og:image`
- [ ] RSS válido (W3C validator OK)
- [ ] `prose` y cards consumen tokens del agente 02
- [ ] Build verde, `astro check` limpio
- [ ] PR mergeado a `main`

## Handoff
- Documentar el mapeo final de IDs viejos → slugs nuevos en `STATUS.md` por si Edsel tiene esos links en redes.
- Si agente 06 quiere reutilizar `TableOfContents.astro` para `/about` o `/now`, está disponible.

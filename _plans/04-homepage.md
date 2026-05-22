---
plan_id: "04-homepage"
title: "Homepage rediseñado"
status: not_started
owner: ""
branch: "feat/homepage"
depends_on: ["02-design-system"]
blocks: ["07-perf-a11y"]
estimated_hours: 8
---

# 04 — Homepage rediseñado

## Goal
Convertir `/` de "pantalla de bienvenida HTML5UP con esfera" a **un portal real con scroll** que cuenta la historia de Edsel en 10 segundos y empuja al visitante a `/projects`, `/blog` o `/about`.

## Why
Hoy el home es una sola pantalla con nombre + bullets ("Software Engineer • Entrepreneur • IoT…") y nada más. Cero CTAs, cero biografía, cero proyectos destacados. La esfera de partículas es bonita pero no comunica. Y el lenguaje visual no concuerda con el `/blog` ya modernizado.

## Files to touch (exclusivos de este agente)
- `src/pages/index.astro`
- `src/pages/en/index.astro` (**crear** — equivalente en inglés)
- `src/components/home/Hero.astro` (**crear**)
- `src/components/home/FeaturedWork.astro` (**crear**)
- `src/components/home/NowStrip.astro` (**crear**)
- `src/components/home/LatestPosts.astro` (**crear**)
- `src/components/Body/index.tsx` — **borrar** después de portar contenido
- `src/components/Particles/sparklingSphere.tsx` — sólo ajustes de props (opacity, palette fijo, particle count adaptativo). **No** rediseñar el componente.
- `src/components/MainHead.astro` — agregar fuentes y meta tags
- `src/content/now.md` (**crear** — contenido del strip "Now")

## Out of scope (NO tocar)
- Tokens / colores — agente 02 ya los dejó
- Schema de content collections — agente 03
- Páginas `/blog/**` — agente 05
- Páginas `/about` y `/now` (página completa) — agente 06. Aquí sólo el **strip** que aparece en el home.
- Performance fina y a11y — agente 07

## Wireframe textual

```
┌─────────────────────────────────────────────────┐
│ [LOGO ED]                          [Blog] [EN] │  ← Nav minimalista
├─────────────────────────────────────────────────┤
│                                                 │
│  ╭──────╮                                       │
│  │      │  Edsel Serrano                        │
│  │ ✨   │  Construyo herramientas para equipos  │
│  │      │  ágiles. Vivo en México.              │
│  ╰──────╯                                       │
│  ← sphere    [Ver proyectos] [Leer notas]      │  ← 2 CTAs
│   (sutil)                                       │
├─────────────────────────────────────────────────┤
│  TRABAJO RECIENTE                               │  ← Featured (3 cards)
│  ┌──────┐  ┌──────┐  ┌──────┐                  │
│  │      │  │      │  │      │                  │
│  └──────┘  └──────┘  └──────┘                  │
│                              [Ver todos →]      │
├─────────────────────────────────────────────────┤
│ ◉ NOW · Trabajando en Retro Ball. Leyendo X.   │  ← Strip horizontal
├─────────────────────────────────────────────────┤
│  ÚLTIMAS NOTAS                                  │  ← 3 posts de /blog
│  ─── titulo 1 ──── fecha                       │
│  ─── titulo 2 ──── fecha                       │
│  ─── titulo 3 ──── fecha                       │
│                              [Ver blog →]       │
├─────────────────────────────────────────────────┤
│              [X] [GitHub] [LinkedIn] [Email]    │  ← Footer
└─────────────────────────────────────────────────┘
```

## Decisiones de diseño

- **Scroll, no full-screen.** Salir del paradigma "una sola pantalla".
- **Esfera de fondo, sutil.** Se queda pero con `opacity: 0.4`, paleta de marca fija (no random), `pointer-events: none`, sólo en el `<Hero>`.
- **Tipografía:** `font-sans` (Inter) para todo, `font-mono` (JetBrains) para timestamps y tags.
- **Acento de marca:** `--accent` (#46b4ff) consistente con `/blog`.
- **Dark by default**, sin toggle (consistente con la rest del sitio).
- **Mobile-first.** El hero en mobile colapsa a una columna.

## Pasos

### 1. Crear el layout base de `index.astro`
```astro
---
import MainHead from "../components/MainHead.astro";
import SEOHead from "../components/SEOHead.astro";
import Nav from "../components/Nav/index.jsx";
import Hero from "../components/home/Hero.astro";
import FeaturedWork from "../components/home/FeaturedWork.astro";
import NowStrip from "../components/home/NowStrip.astro";
import LatestPosts from "../components/home/LatestPosts.astro";
import Footer from "../components/Footer";
import Analytics from "@vercel/analytics/astro";

const lang = "es";
---
<html lang={lang}>
  <head>
    <SEOHead title="Edsel Serrano" description="..." canonical="/" language={lang} keywords={[...]} type="website" />
    <MainHead />
  </head>
  <body class="bg-bg text-fg font-sans antialiased">
    <Nav />
    <main>
      <Hero lang={lang} />
      <FeaturedWork lang={lang} />
      <NowStrip lang={lang} />
      <LatestPosts lang={lang} />
    </main>
    <Footer />
    <Analytics />
  </body>
</html>
```

Replicar para `src/pages/en/index.astro` con `lang="en"`.

### 2. `Hero.astro`
- Layout 2 columnas en desktop (sphere izq, texto der), 1 columna en mobile (sphere arriba o detrás).
- `SparklingSphere` con props nuevos:
  - `totalParticles={600}` desktop, `300` mobile (decisión adentro del componente con `matchMedia`)
  - `backgroundColor="transparent"` (que la app respire)
  - `particleColors={[0x46b4ff, 0x6cc4ff, 0x88ccff]}` — fijo, no random
- Texto del hero con i18n: usar `t('home.hero.eyebrow')`, `t('home.hero.title')`, `t('home.hero.subtitle')`, `t('home.hero.cta.projects')`, `t('home.hero.cta.posts')` — agregar keys a `src/lib/i18n.ts`.
- 2 CTAs:
  - Primary: `[Ver proyectos]` → `/projects` (o `/blog` mientras 05 no migre)
  - Secondary: `[Leer notas]` → `/blog`

### 3. `FeaturedWork.astro`
- Usa `getFeaturedProjects(3)` de `src/lib/content.ts` (creado por 03).
- Reutiliza el componente `PostCard.astro` si encaja, o crea `ProjectCard.astro` con el mismo estilo.
- "Ver todos →" link a `/projects` (placeholder hasta que 05 cree la ruta — si no existe, link a `/blog`).
- Si no hay proyectos con `featured: true`, mostrar los 3 más recientes y agregar nota en el PR para que Edsel marque featured después.

### 4. `NowStrip.astro`
Una línea horizontal compacta, fondo `bg-surface`, padding pequeño:
```
◉ NOW · {now.title}  ·  {now.subtitle}                       [Más →]
```
- Lee de `src/content/now.md` (frontmatter + cuerpo corto). El archivo es:
  ```md
  ---
  updated: 2026-05-22
  ---
  Trabajando en **Retro Ball**. Leyendo *Designing Data-Intensive Applications*. Disponible para charlas.
  ```
- El strip muestra sólo el cuerpo. "Más →" linkea a `/now` (página completa, agente 06).
- Si `/now` no existe aún, el link puede ser `#` con título "Próximamente".

### 5. `LatestPosts.astro`
- Lista compacta (no cards grandes) de los 3 últimos posts de la colección `posts` (filtrados por lang).
- Cada item: fecha (mono, muted) · título (sans, link).
- Si la colección está vacía, mostrar mensaje placeholder: "Próximamente notas — sigue el RSS".
- "Ver blog →" linkea a `/blog`.

### 6. Borrar componente legacy
Después de portar contenido:
- Borrar `src/components/Body/index.tsx`
- Borrar `src/components/PageHeader.astro` si nadie más lo usa (`rg "PageHeader" src/`)
- Confirmar que el viejo `<header className="header">` ya no está en uso

### 7. Versionar `MainHead.astro`
Asegurar que carga las fuentes variables, favicon, theme-color con el tono del bg (`--c-zinc-950`).

## Acceptance criteria

- [ ] `/` y `/en/` muestran: Hero con sphere sutil + 2 CTAs, FeaturedWork (3 cards), NowStrip, LatestPosts (3 items o placeholder), Footer
- [ ] El hero usa tipografía Inter y el acento azul, NO la paleta HTML5UP
- [ ] La sphere es transparente, sutil, con paleta fija, y baja a 300 partículas en mobile
- [ ] Existe `src/content/now.md` editable en menos de 30 segundos
- [ ] El `Body` legacy y `PageHeader` no se importan en ningún lado
- [ ] i18n: `src/lib/i18n.ts` tiene las nuevas keys `home.*` en `es` y `en`
- [ ] Lighthouse "best practices" ≥ 95 (deja "perf" y "a11y" finos a 07)
- [ ] Build verde
- [ ] PR mergeado a `main`

## Handoff
- Si `/projects` no existe aún, dejar el CTA apuntando a `/blog` y nota en `STATUS.md`. Cuando 05 lo cree, abrir PR de follow-up.
- Documentar en el PR la lista de keys i18n nuevas para que 06 las extienda si crea `/about`.

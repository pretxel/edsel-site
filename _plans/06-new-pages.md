---
plan_id: "06-new-pages"
title: "Páginas /about, /now y /uses"
status: not_started
owner: ""
branch: "feat/new-pages"
depends_on: ["02-design-system", "03-content-migration"]
blocks: ["07-perf-a11y"]
estimated_hours: 5
---

# 06 — Páginas /about, /now y /uses

## Goal
Crear las tres páginas que hoy faltan y que hacen que un sitio personal se sienta vivo:
- **`/about`** — bio extendida + skills + experiencia laboral
- **`/now`** — qué está haciendo Edsel hoy ([nownownow.com](https://nownownow.com) convention)
- **`/uses`** — hardware, software, herramientas del día a día ([uses.tech](https://uses.tech) convention)

Todas editables como Markdown en menos de 1 minuto.

## Why
Hoy el sitio sólo tiene `/` y `/blog`. Para que se sienta "constantemente actualizado", hace falta una página viva (`/now`) que Edsel pueda editar en 30s, una página real de presentación (`/about`) y una de herramientas (`/uses`) que la comunidad busca activamente.

## Files to touch (exclusivos de este agente)
- `src/content/about-es.md`, `src/content/about-en.md` (**crear**)
- `src/content/now.md` (**crear** o extender el del agente 04)
- `src/content/uses-es.md`, `src/content/uses-en.md` (**crear**)
- `src/pages/about.astro`, `src/pages/en/about.astro` (**crear**)
- `src/pages/now.astro`, `src/pages/en/now.astro` (**crear**)
- `src/pages/uses.astro`, `src/pages/en/uses.astro` (**crear**)
- `src/components/about/Skills.astro` (**crear** — opcional, si se usa una grid de skills)
- `src/components/about/Experience.astro` (**crear** — opcional)
- `src/lib/i18n.ts` — agregar keys `nav.about`, `nav.now`, `nav.uses`
- `src/components/Nav/index.jsx` — agregar items de nav

## Out of scope (NO tocar)
- Homepage — agente 04 (sólo el `NowStrip` ahí; aquí es la página completa de `/now`)
- Blog — agente 05
- Schema de collections — agente 03 (si necesitas, crear una colección `pages` con su propio config)

## Decisión de modelo de contenido

Tres opciones:
1. **Files sueltos en `src/content/`** (markdown plain), leídos con `import` + plugin `astro-frontmatter`.
2. **Colección `pages`** en `src/content/config.ts` (extender lo que 03 creó).
3. **Frontmatter en los `.astro`** directamente.

**Recomendado:** opción 2 (colección `pages`). Coordinar con agente 03 si todavía no cerró su PR; si ya cerró, abrir PR pequeño que añada:
```ts
const pages = defineCollection({
  type: "content",
  schema: z.object({
    slug: z.enum(["about", "now", "uses"]),
    lang: z.enum(["es", "en"]),
    title: z.string(),
    updated: z.coerce.date().optional(),
  }),
});
```

## Pasos

### 1. `/now`
Es la página más pequeña y la más impactante.

`src/content/now.md` (compartido es/en si Edsel quiere, o split):
```md
---
slug: now
lang: es
title: "Lo que estoy haciendo ahora"
updated: 2026-05-22
---
## Trabajando en
- **Retro Ball** — retrospectivas ágiles efímeras
- Mejorar este sitio (este plan que estás leyendo)

## Leyendo
- *Designing Data-Intensive Applications* — Kleppmann

## Aprendiendo
- Astro Content Collections + MDX
- TypeScript estricto en proyectos personales

## Disponible para
- Charlas de tech para equipos remotos
- Mentoría 1:1 ocasional

Actualizado el 22 de mayo de 2026.
```

`src/pages/now.astro`:
- Layout simple: container max 65ch, prose dark, `font-sans`.
- Header con título + fecha de "última actualización" en mono.
- Render del `<Content />` MDX/MD.
- Link "← inicio" arriba, footer compartido.

### 2. `/about`
`src/content/about-es.md`:
```md
---
slug: about
lang: es
title: "Sobre mí"
updated: 2026-05-22
---
Soy Edsel Serrano, software engineer mexicano enfocado en…

## Lo que me interesa
- Herramientas para equipos ágiles
- Chatbots y aplicaciones de LLM
- Machine learning aplicado
- IoT

## Stack actual
JavaScript / TypeScript, React, Next.js, Astro, Node, Postgres, Tailwind, Vercel.

## Experiencia
- **2024–presente** — …
- **2022–2024** — …
- **2020–2022** — …

## Hablemos
- [LinkedIn](https://mx.linkedin.com/in/edselserrano)
- [GitHub](https://github.com/pretxel)
- [Email](mailto:pretxel100@gmail.com)
```

Edsel completa los detalles. La página renderiza el markdown con `prose prose-invert` y un layout más rico que `/now` (puede tener un avatar circular arriba, links sociales prominentes).

### 3. `/uses`
`src/content/uses-es.md`:
```md
---
slug: uses
lang: es
title: "Uses"
updated: 2026-05-22
---
## Hardware
- MacBook Pro M…
- Monitor …
- Teclado …

## Software diario
- **Editor:** Cursor / VS Code
- **Terminal:** iTerm2 + zsh
- **Browser:** Arc
- **Notas:** Obsidian

## Dev
- pnpm
- Bun
- pnpm-lock + Volta

## Música mientras codeo
- Spotify, mucho lo-fi y electrónica
```

Página igual al `/now` en estructura, pero con secciones agrupadas con `<h2>`.

### 4. Nav
Actualizar `src/components/Nav/index.jsx`:
```jsx
<a href="/" className={Styles.link}>Inicio</a>
<a href="/projects" className={Styles.link}>Proyectos</a>
<a href="/blog" className={Styles.link}>Blog</a>
<a href="/about" className={Styles.link}>About</a>
<a href="/now" className={Styles.link}>Now</a>
```
**Atención:** el archivo del Nav lo está usando 04 también para el home. Coordinar via `STATUS.md` antes de mergear. Si 04 cierra primero, este agente mergea encima; si este cierra primero, 04 sólo usa lo que ya esté.

`/uses` no va en el nav principal (es un easter egg que la gente busca por URL); link desde el footer.

### 5. Footer
Agregar link a `/uses` y `/now` en el `Footer` componente (no en el nav social, sino como links de texto).

### 6. i18n
En `src/lib/i18n.ts`:
```ts
es: {
  "nav.home": "Inicio",
  "nav.projects": "Proyectos",
  "nav.blog": "Blog",
  "nav.about": "Sobre mí",
  "nav.now": "Now",
  "nav.uses": "Uses",
  ...
},
en: { ... }
```

## Acceptance criteria

- [ ] `/about`, `/now`, `/uses` existen y renderizan markdown con look consistente al resto del sitio (tokens de 02)
- [ ] Equivalentes `/en/about`, `/en/now`, `/en/uses` existen
- [ ] El nav incluye Inicio, Proyectos, Blog, About, Now (Uses sólo en footer)
- [ ] Editar cualquiera de las tres páginas es exactamente editar un archivo .md y guardar
- [ ] Cada página muestra fecha de "última actualización" cuando aplica
- [ ] i18n actualizado en ambos idiomas
- [ ] Build verde, `astro check` limpio
- [ ] PR mergeado a `main`

## Handoff
- Si Edsel quiere automatizar `updated` con commit hook que actualice el frontmatter, dejar nota para que 07 lo agregue como mejora.
- Si decides crear la colección `pages`, asegúrate de coordinarlo con 03 antes (puede que él ya la tenga lista).

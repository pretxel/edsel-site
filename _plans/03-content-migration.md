---
plan_id: "03-content-migration"
title: "Content migration: data.ts → Astro Content Collections"
status: not_started
owner: ""
branch: "feat/content-migration"
depends_on: ["01-cleanup"]
blocks: ["05-blog-features", "06-new-pages"]
estimated_hours: 6
---

# 03 — Content migration: `data.ts` → Content Collections

## Goal
Mover todo el contenido (proyectos y futuros artículos) a **Astro Content Collections con MDX** para que publicar sea `crear un archivo` en lugar de `editar un array TypeScript de 200 líneas`.

## Why
Hoy los 7 entries viven en `src/lib/data.ts` con campos bilingües inline (`content.es.title`, `content.es.content`, etc.). Esto:
- Frena la actualización: cada post requiere editar TS, no escribir Markdown.
- Mezcla concerns: el archivo de datos contiene el HTML del contenido.
- Hace imposible que un colaborador no-dev edite.
- No hay separación entre **proyecto externo** (link afuera) y **artículo** (post escrito).

Después de este agente: dos colecciones (`projects`, `posts`), schema validado con Zod, MDX para contenido rico, helpers tipados que reemplazan `getLocalizedPost`.

## Files to touch (exclusivos de este agente)
- `src/content/config.ts` (**crear**)
- `src/content/projects/**` (**crear** — 7 archivos bilingües migrados)
- `src/content/posts/**` (**crear** — folder vacío con un `.gitkeep` por ahora)
- `src/lib/data.ts` (**borrar** al final)
- `src/lib/content.ts` (**crear** — helpers que reemplazan los de data.ts)
- `src/lib/i18n.ts` (extender si hace falta para resolver locale por path)
- Páginas que importan de `data.ts`: actualizar imports
  - `src/pages/blog/index.astro`
  - `src/pages/blog/[id].astro`
  - `src/pages/en/blog/index.astro`
  - `src/pages/en/blog/[id].astro`
  - `src/pages/rss.xml.ts`
  - `src/pages/en/rss.xml.ts`
- Script `scripts/new-post.mjs` (**crear**)
- `package.json` — agregar `"new:post": "node scripts/new-post.mjs"`

## Out of scope (NO tocar)
- Estilos / tokens — agente 02
- Diseño de las páginas — agentes 04, 05, 06
- Bugs de UI fuera de content — agente 01

## Pasos

### 1. Definir schemas en `src/content/config.ts`
```ts
import { defineCollection, z } from "astro:content";

const i18nText = z.object({
  title: z.string(),
  description: z.string(),
});

const projects = defineCollection({
  type: "content", // MDX
  schema: ({ image }) => z.object({
    title: z.string(),                          // título neutro (slug-friendly)
    i18n: z.object({
      es: i18nText,
      en: i18nText,
    }),
    date: z.coerce.date(),
    cover: z.string(),                          // /assets/...
    externalLink: z.string().url().optional(),
    tags: z.array(z.string()).default([]),
    color: z.enum(["teal","blue","gray","green","yellow","red","pink","orange"]),
    featured: z.boolean().default(false),
    author: z.string().default("Edsel Serrano"),
  }),
});

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    lang: z.enum(["es", "en"]),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    cover: z.string().optional(),
  }),
});

export const collections = { projects, posts };
```

### 2. Estructura de archivos
```
src/content/
  projects/
    daily-potato.mdx          # un archivo por proyecto, bilingüe via frontmatter.i18n + dos secciones
    chat-edsel.mdx
    dineqrs.mdx
    f1-stats.mdx
    pong-svelte.mdx
    pokemon-poker.mdx
    retro-ball.mdx
  posts/
    .gitkeep
```

**Decisión:** un solo `.mdx` por proyecto con `i18n` en frontmatter y dos secciones de contenido marcadas (`<section data-lang="es">…</section>` / `<section data-lang="en">…</section>`), porque los proyectos son fundamentalmente el mismo asset bilingüe. Para `posts/` usar **un archivo por idioma** (`/blog/<slug>-es.mdx`, `/blog/<slug>-en.mdx` con `lang` en frontmatter) — los artículos pueden no traducirse.

### 3. Migrar los 7 entries existentes
Para cada uno, crear el `.mdx`. Ejemplo `daily-potato.mdx`:

```mdx
---
title: "Daily Potato"
i18n:
  es:
    title: "Daily Potato"
    description: "Herramienta innovadora para Daily Scrum remotas con participación aleatoria y métricas de productividad del equipo"
  en:
    title: "Daily Potato"
    description: "Innovative tool for remote Daily Scrums with random participation and team productivity metrics"
date: 2023-01-01
cover: "/potato.webp"
externalLink: "https://potato-daily.pretxel.deno.net/"
tags: ["Next.js", "TypeScript", "PostgreSQL", "JWT", "WebSockets", "Tailwind CSS"]
color: teal
featured: false
---

<section data-lang="es">

Daily Potato es una herramienta innovadora diseñada para facilitar las Daily Scrum…

El proyecto experimentó una migración completa de arquitectura…

</section>

<section data-lang="en">

Daily Potato is an innovative tool designed to facilitate remote and effective Daily Scrums…

The project underwent a complete architecture migration…

</section>
```

Hacer lo mismo para los 6 restantes. Copiar `content` y `content_p2` del `data.ts` actual.

### 4. Helpers en `src/lib/content.ts`
```ts
import { getCollection, type CollectionEntry } from "astro:content";
import type { Language } from "./i18n";

export async function getAllProjects() {
  return (await getCollection("projects"))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export async function getFeaturedProjects(limit = 3) {
  const all = await getAllProjects();
  return all.filter(p => p.data.featured).slice(0, limit);
}

export function getLocalizedProject(project: CollectionEntry<"projects">, lang: Language) {
  return {
    ...project,
    title: project.data.i18n[lang].title,
    description: project.data.i18n[lang].description,
  };
}

export async function getAllPosts(lang: Language) {
  return (await getCollection("posts", ({ data }) => data.lang === lang && !data.draft))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}
```

### 5. Actualizar páginas
- `src/pages/blog/index.astro` y `/en/blog/index.astro`: importar `getAllProjects` + `getLocalizedProject` en lugar de `getLocalizedPosts`. Mantener look & feel — el rediseño viene en 05.
- `src/pages/blog/[id].astro`: usar `getStaticPaths` con `getAllProjects()` y render del `<Content />` de MDX en lugar de `localizedPost.content` + `content_p2`. Mostrar la sección correcta con CSS (`section[data-lang="es"] { display: none }` cuando `lang === 'en'`, y viceversa) — o filtrar en el server con un componente custom.
- `src/pages/rss.xml.ts` y `/en/rss.xml.ts`: leer de la colección.

### 6. Script `scripts/new-post.mjs`
```js
#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const slug = (await rl.question("Slug (kebab-case): ")).trim();
const title = (await rl.question("Title: ")).trim();
const lang = ((await rl.question("Lang (es/en) [es]: ")).trim() || "es").toLowerCase();
rl.close();

const date = new Date().toISOString().slice(0, 10);
const file = path.join("src/content/posts", `${slug}-${lang}.mdx`);
fs.writeFileSync(file, `---
title: "${title}"
description: ""
date: ${date}
lang: ${lang}
tags: []
draft: true
---

Escribe aquí.
`);
console.log(`✓ ${file}`);
```
Agregar a `package.json`:
```json
"scripts": { "new:post": "node scripts/new-post.mjs" }
```

### 7. Borrar `src/lib/data.ts`
Una vez todas las páginas compilen sin él. Confirmar con grep:
```bash
rg "from.*lib/data" src/
```

## Acceptance criteria

- [ ] `src/content/config.ts` define `projects` y `posts` con schema Zod
- [ ] Los 7 proyectos migrados a `src/content/projects/*.mdx` con frontmatter bilingüe + contenido MDX
- [ ] `src/content/posts/` existe (vacío o con `.gitkeep`)
- [ ] `src/lib/content.ts` exporta `getAllProjects`, `getFeaturedProjects`, `getLocalizedProject`, `getAllPosts`
- [ ] `src/lib/data.ts` eliminado, `rg "lib/data"` retorna 0
- [ ] `pnpm new:post` crea un archivo válido en `src/content/posts/`
- [ ] `/blog`, `/en/blog`, `/blog/1`, `/en/blog/1` siguen funcionando con el contenido idéntico al actual
- [ ] RSS sigue válido (validar en https://validator.w3.org/feed/)
- [ ] Build verde, `astro check` sin errores de tipo
- [ ] PR mergeado a `main`

## Handoff
- Documentar en el PR cualquier ajuste al schema que 05/06 necesiten saber.
- Crear un primer post de muestra (`hola-mundo-es.mdx`) opcional con `draft: true` para que 05 tenga material de prueba.

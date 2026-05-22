# Plan de modernización — edselserrano.com
*Fecha: 22 de mayo de 2026 · Owner: Edsel*

## 1. Diagnóstico actual

**Lo que ya funciona**
- Stack moderno y bien elegido: Astro 6 + Tailwind 4 + Vercel + SSR. RSS, sitemap y SEOHead listos.
- Bilingüe (es/`/en/`) con switcher y `alternateLanguages` bien implementados.
- La sección `/blog` ya tiene una estética moderna: hero con gradiente, grid de cards, hover states cuidados, vista de detalle con prose oscuro, related posts y back-to-top.
- La esfera de partículas en Three.js da personalidad y diferenciación.

**Lo que está frenando al sitio**
1. **Homepage anclada en 2014.** El layout del home (`src/styles/global.scss` + `Body/index.tsx`) sigue siendo la plantilla **HTML5 UP "Aerial 1.0"** con sus comentarios, animaciones `-moz-`, Font Awesome OTF/EOT/TTF y Source Sans Pro vía CDN de Google. No hay biografía, ni proyectos destacados, ni CTA — sólo nombre + línea de bullets.
2. **Dos lenguajes visuales distintos.** Homepage = template antiguo + sphere. Blog = Tailwind moderno con `zinc-800/50`, gradients y blur. No comparten tokens de color, tipografía ni motion. Sienten dos sitios.
3. **"Blog" en realidad es un portafolio.** Los 7 posts (`src/lib/data.ts`) son showcases de proyectos: cada uno enlaza afuera (`link: "https://..."`) y no hay artículos escritos. El objetivo "tenerlo actualizado constantemente" choca con un array TS que hay que editar a mano y duplicar es/en.
4. **Modelo de contenido frágil.** Posts hardcoded en un `.ts` con campos `content` y `content_p2` por idioma. Agregar un post implica tocar TypeScript, no escribir. No hay **Astro Content Collections** ni MDX.
5. **Cruft de dependencias.**
   - `svelte.config.js` casi vacío y `@astrojs/svelte` activo sin un solo componente Svelte.
   - `react-device-detect` (200KB+) sólo para `isMobile` (un media query lo resuelve).
   - `@fontsource/roboto` instalado pero sin usar; Source Sans Pro cargada por CDN externa.
   - Font Awesome 4 self-hosted en `src/fonts/` con todos los formatos legacy (EOT, TTF, WOFF, OTF, SVG).
   - HTML5UP CSS y sus `@-moz-keyframes` siguen ahí, sin minificar.
6. **Bugs visibles**
   - El `<html lang="es">` del homepage envuelve un `Body` con texto en inglés ("Software Engineer • Entrepreneur of Technology…").
   - El icono de Twitter sigue siendo Twitter (no X) y los links sociales no llevan `target="_blank"` ni `rel="noopener"`.
   - "5 min read" hardcoded en cada post — debería calcularse.
   - `navigator.share` en `[id].astro` se invoca con `onclick` inline sin fallback síncrono en desktop.
   - Tags no son navegables (no hay páginas `/blog/tag/[slug]`).
7. **Perf y accesibilidad**
   - 2000 partículas en desktop sin respeto a `prefers-reduced-motion`.
   - Fuentes cargadas por dos fuentes distintas (Google CDN + Fontsource) bloquean el render.
   - GTM + Vercel Analytics + Three.js + React-device-detect en el path crítico.
   - Sin `skip-to-content`, sin focus-visible rings consistentes, contraste OK pero no auditado.

## 2. Visión — qué debería ser este sitio

> "Un home minimalista que cuenta quién eres en 10 segundos, un cuaderno público (blog real) fácil de actualizar, y una sección de proyectos clara. Mismo lenguaje visual de punta a punta."

Tres pilares para que se sienta **moderno y vivo**:
- **Una sola estética.** Tokens de color, tipografía y motion compartidos entre home, blog y proyectos.
- **Escribir > editar TypeScript.** Posts en Markdown/MDX dentro de `src/content/`. Crear un post = `pnpm new-post` o un archivo nuevo.
- **Updates fáciles.** Una página `/now` editable en 30 segundos, automatización de feeds, y un sitio que invite a Edsel a publicar.

## 3. Plan por fases

### Fase 1 — Limpieza y fundaciones (1-2 días)

Quitar cruft y establecer la base. Sin esto, cualquier rediseño se construye sobre arena.

- [ ] **Quitar dependencias muertas:** `@astrojs/svelte`, `svelte`, `svelte.config.js`, `@fontsource/roboto`, `react-device-detect`. Reemplazar `isMobile` por CSS `@media (max-width: 768px)` o por `window.matchMedia` lazy.
- [ ] **Tokens de diseño.** Crear `src/styles/tokens.css` con CSS custom properties para colores, espacio, radii y tipografía. Que homepage y blog consuman lo mismo.
- [ ] **Tipografía consistente.** Una sola familia (recomiendo *Inter* o *Geist* vía `@fontsource-variable`) + una mono (*JetBrains Mono Variable*). Eliminar Source Sans Pro CDN y Font Awesome self-hosted.
- [ ] **Iconos modernos.** Ya está instalado `astro-icon` + `@iconify-json/bi`. Migrar todos los íconos sociales y de UI a Iconify (lucide o tabler) y borrar `src/fonts/`.
- [ ] **Bugs rápidos:** `lang` correcto en homepage, `rel="noopener" target="_blank"` en sociales, Twitter → X, fallback de `navigator.share`, `prefers-reduced-motion` en la sphere.

### Fase 2 — Homepage rediseñada (2-3 días)

Convertir el home de "pantalla de bienvenida" a **portal real**.

Estructura propuesta (scroll, no full-screen):

1. **Hero** — Nombre, una línea de identidad ("Construyo herramientas para equipos ágiles. Vivo en México."), 2 CTAs (`Ver proyectos` / `Leer notas`). La sphere de partículas se mantiene como background sutil, **opacidad 0.4, 800 partículas en mobile**, colores fijos (no random — escoger 1 paleta como brand).
2. **Featured work** — 3 proyectos destacados (Pokemon Poker, Retro Ball, Dineqrs) con cards grandes, no la lista completa.
3. **Now / Status line** — "Trabajando en X. Leyendo Y. Disponible para Z." — editable desde un solo archivo Markdown.
4. **Últimos posts del blog** — 3 cards horizontales, mismo componente reutilizado.
5. **Footer** — sociales modernos con tooltip + texto, no sólo íconos circulares. Incluir RSS.

Decisiones de diseño:
- Mantener el **dark mode como default** (consistente con `/blog`).
- Sphere queda, pero **opt-in para reduce-motion** y con un solo tema de color, no random.
- Microinteracciones con CSS view transitions (Astro ya las soporta — vi `transition:name` en PostCard).

### Fase 3 — Contenido y blog real (3-4 días)

Hacer que **publicar sea trivial** y separar artículos de proyectos.

- [ ] **Astro Content Collections.** Crear `src/content/projects/` y `src/content/posts/` con schema Zod. Cada item es un `.mdx` con frontmatter `{ title, description, date, lang, tags, cover, externalLink? }`.
- [ ] **Migrar los 7 entries actuales** de `data.ts` a `src/content/projects/*.mdx`. Mantener bilingüe via `lang` field (un archivo por idioma) o usando `astro-i18n`.
- [ ] **Rutas:**
  - `/` — homepage
  - `/projects` y `/projects/[slug]` — el portafolio actual reframed
  - `/blog` y `/blog/[slug]` — artículos *de verdad* (escritos por Edsel)
  - `/tags/[tag]` — listing por tag, navegable desde cualquier post
  - `/now` — página viva, un sólo MDX
  - `/about` — bio extendida + skills + experiencia
- [ ] **Reading time real** — derivado del contenido del MDX (no hardcoded 5).
- [ ] **Tags navegables** y filtros en `/blog` y `/projects`.
- [ ] **Comando `pnpm new-post`** — script que crea `src/content/posts/YYYY-MM-DD-slug.mdx` con frontmatter pre-llenado.
- [ ] **RSS multi-collection** — feed combinado y feeds por colección.

### Fase 4 — Pulido y performance (1-2 días)

- [ ] **Lighthouse ≥ 95 en perf, a11y, SEO.**
- [ ] **OG images dinámicas** vía `@vercel/og` o `satori` (no `cover` estática).
- [ ] **Article schema JSON-LD** en `/blog/[slug]`.
- [ ] **`/llm.txt` actualizado** con la nueva estructura (ya existe en `public/`).
- [ ] **View transitions** entre home → blog → post (Astro 5+).
- [ ] **Skip-to-content link**, `focus-visible` consistente, contraste auditado.
- [ ] **Sphere optimizada:** menos partículas en mobile, geometry instanciada, cleanup en unmount.

## 4. Quick wins (esta semana, < 2 horas)

Si quieres impacto visible ya:

1. Corregir `lang="es"` con el texto en inglés del `Body` (10 min).
2. Bajar partículas en mobile de 1000 a 500 y fijar un solo color (15 min).
3. Reemplazar Font Awesome social icons por Iconify lucide (20 min).
4. Agregar `target="_blank"` + `rel="noopener noreferrer"` a sociales (5 min).
5. Twitter → X con icono de X (5 min).
6. Eliminar `@astrojs/svelte`, `svelte`, `@fontsource/roboto`, `react-device-detect` y rebuildear (10 min).
7. Añadir respeto a `prefers-reduced-motion` en la sphere (15 min).

## 5. Stack final recomendado

- **Framework:** Astro 6 (ya está) — perfecto para content-first.
- **UI:** Tailwind v4 (ya está) + componentes propios. **Sacar Svelte y React-device-detect.** Mantener React sólo para la sphere de Three.js (es el único componente reactivo).
- **Contenido:** Astro Content Collections con MDX. `astro-i18n` o estrategia file-based para bilingüe.
- **Tipografía:** `@fontsource-variable/inter` + `@fontsource-variable/jetbrains-mono`.
- **Iconos:** `astro-icon` + `@iconify-json/lucide` (ya tienes `bi`, pero lucide es más moderno).
- **OG images:** `@vercel/og`.
- **Analytics:** sólo Vercel Analytics (quitar GTM si no se usa activamente).

## 6. Métricas de éxito

- Lighthouse Performance ≥ 95 móvil y desktop.
- Tiempo desde "tengo una idea" hasta "post publicado" < 5 minutos.
- 1 post de blog real (no proyecto) publicado en los próximos 30 días.
- Zero dependencias no usadas en `package.json`.
- Mismo design system de tokens compartido entre home y blog.

---

### Próximo paso recomendado

Empezar por **Quick wins** (sección 4) — es trabajo de tarde y deja el código listo para Fase 1. Cuando quieras, decimos por dónde arrancar y lo implemento.

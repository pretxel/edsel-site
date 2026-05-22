---
plan_id: "01-cleanup"
title: "Cleanup & quick wins"
status: not_started
owner: ""
branch: "feat/cleanup"
depends_on: []
blocks: ["02-design-system", "03-content-migration"]
estimated_hours: 3
---

# 01 — Cleanup & quick wins

## Goal
Quitar dependencias muertas, fixear bugs visibles y dejar el repo limpio antes de cualquier rediseño. Es el agente más rápido y desbloquea a todos los demás.

## Why
El repo arrastra cruft de la plantilla **HTML5 UP "Aerial"** original (2014) y dependencias que ya no se usan (Svelte, Roboto Fontsource, react-device-detect, Font Awesome self-hosted). Encima hay bugs simples: `lang="es"` envolviendo texto en inglés, sociales sin `rel="noopener"`, sphere ignorando `prefers-reduced-motion`.

## Files to touch (exclusivos de este agente)
- `package.json`
- `pnpm-lock.yaml` (auto-regenerado)
- `astro.config.mjs`
- `svelte.config.js` (**borrar**)
- `src/fonts/` (**borrar todo el folder**)
- `src/styles/global.scss` (limpiar HTML5UP cruft)
- `src/components/Body/index.tsx`
- `src/components/Social/index.tsx`
- `src/components/Particles/sparklingSphere.tsx`
- `src/pages/index.astro` (sólo el `<html lang>` y la lógica de mobile)

## Out of scope (NO tocar)
- `src/lib/data.ts` — lo maneja agente 03
- `src/styles/tokens.css` — lo crea agente 02
- `src/pages/blog/**` — lo maneja agente 05
- `src/content/**` — lo crea agente 03

## Pasos

### 1. Borrar dependencias muertas
```bash
pnpm remove @astrojs/svelte svelte @fontsource/roboto react-device-detect
rm svelte.config.js
```
- Confirmar que `package.json` ya no las lista.
- Quitar `svelte()` del array de `integrations` en `astro.config.mjs`.

### 2. Reemplazar `react-device-detect`
En `src/pages/index.astro`, cambiar:
```ts
import { isMobile } from "react-device-detect";
const totalParticles = isMobile ? 1000 : 2000;
```
por detección por viewport — pasar `totalParticles` desde el cliente con `client:only` y `window.matchMedia('(max-width: 768px)')`, o setear `totalParticles={800}` siempre y dejar que la sphere lo escale internamente. **Recomendado:** mover la decisión adentro de `sparklingSphere.tsx` con `useEffect` + `matchMedia`.

### 3. Borrar Font Awesome self-hosted
```bash
rm -rf src/fonts/
```
Quitar el `@import url("../fonts/font-awesome.css")` de `src/styles/global.scss`.

Los íconos sociales del footer pasan a usar **astro-icon + @iconify-json/lucide** (ya está `astro-icon` y `@iconify-json/bi` instalado; agregar lucide):
```bash
pnpm add -D @iconify-json/lucide
```

Reescribir `src/components/Social/index.tsx` (o convertirlo a `.astro`) usando `<Icon name="lucide:twitter" />`, etc. Mapeo:
- Twitter → `lucide:x` (rebrand a X)
- Facebook → `lucide:facebook`
- Github → `lucide:github`
- Linkedin → `lucide:linkedin`
- Medium → quitar (Edsel ya no postea ahí, confirmar) o usar `simple-icons:medium`
- Email → `lucide:mail`

### 4. Fixes de bugs

#### 4a. Lang del homepage
`src/pages/index.astro` tiene `<html lang="es">` pero `Body/index.tsx` está en inglés ("Software Engineer • Entrepreneur of Technology • …"). Decisión: el homepage debe respetar `es` por default. Reemplazar el contenido del `Body` por:
```tsx
<header className="header">
  <h1>Edsel Serrano</h1>
  <p>
    Software Engineer &nbsp;&bull;&nbsp; Emprendedor tech
    &nbsp;&bull;&nbsp; Desarrollo de chatbots
    &nbsp;&bull;&nbsp; Machine learning
    &nbsp;&bull;&nbsp; IoT
  </p>
</header>
```
*Nota:* este componente lo va a rehacer agente 04 con i18n; aquí sólo dejarlo congruente con el `lang`.

#### 4b. Sociales con `rel` y `target`
En `Social/index.tsx` agregar a todos los `<a>` externos:
```tsx
target="_blank"
rel="noopener noreferrer"
```

#### 4c. `prefers-reduced-motion` en la sphere
En `sparklingSphere.tsx`, al inicio del `useEffect` que arma la escena, abortar si el usuario tiene reduce-motion activado y renderizar un fondo sólido en su lugar:
```ts
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (reduceMotion) return; // skip animation, keep static bg
```

#### 4d. Cleanup Three.js
Asegurar que el `useEffect` retorna un cleanup que llama `renderer.dispose()`, `scene.clear()` y `cancelAnimationFrame(rafId)`. Verificar que no hay memory leaks al navegar entre páginas.

### 5. Limpiar `global.scss`
Quitar:
- Todos los comentarios HTML5UP (`/* Aerial 1.0 by HTML5 UP ... */`)
- `@-moz-keyframes`, `@-webkit-keyframes`, `@-o-keyframes`, `@-ms-keyframes` (sólo dejar `@keyframes`)
- Vendor prefixes `-moz-`, `-webkit-`, `-o-`, `-ms-` (Astro+autoprefixer los pone)
- `@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,900")` — agente 02 lo reemplaza por Inter/Geist

Dejar `global.scss` reducido a:
- Tokens (las CSS custom properties — agente 02 las migrará a `tokens.css`)
- `.header`, `.footer`, `.header h1`, `.header p` (layout del home actual)

### 6. Build + smoke test
```bash
pnpm install
pnpm build
pnpm preview
```
Confirmar:
- [ ] No hay warnings de dependencias faltantes
- [ ] El bundle es menor que antes (`du -sh dist/`)
- [ ] Homepage carga, sphere se ve, sociales funcionan
- [ ] `/blog` y `/en/blog` siguen funcionando

## Acceptance criteria

- [ ] `package.json` ya no contiene: `@astrojs/svelte`, `svelte`, `@fontsource/roboto`, `react-device-detect`
- [ ] `svelte.config.js` no existe
- [ ] `src/fonts/` no existe
- [ ] `astro.config.mjs` ya no incluye `svelte()` en integrations
- [ ] `src/components/Social/index.tsx` usa Iconify, todos los enlaces tienen `target="_blank" rel="noopener noreferrer"`, Twitter es ahora X
- [ ] `src/components/Body/index.tsx` tiene texto en español congruente con `lang="es"`
- [ ] `sparklingSphere.tsx` respeta `prefers-reduced-motion` y tiene cleanup completo
- [ ] `global.scss` sin vendor-prefixed keyframes ni comentarios HTML5UP
- [ ] `pnpm build` corre limpio
- [ ] PR mergeado a `main`

## Handoff a los siguientes agentes
Al cerrar:
- Anotar en `STATUS.md` el tamaño nuevo del bundle (antes vs después).
- Confirmar que `src/styles/global.scss` está limpio para que **02** pueda migrar los tokens.
- Confirmar que `src/lib/data.ts` quedó intacto para que **03** lo migre.

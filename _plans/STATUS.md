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
| 07 | [perf-a11y](./07-perf-a11y.md) | ⚪ not_started | — | `feat/perf-a11y` | Esperar a 04, 05 y 06 |

## Lock zones — quién tiene el archivo

| Archivo | Owner actual | Hasta |
|---------|--------------|-------|
| `package.json` | libre | — (tocado por 01, ahora libre) |
| `astro.config.mjs` | libre | — (tocado por 01, ahora libre) |
| `src/styles/tokens.css` | no existe aún | lo crea 02 |
| `src/content/config.ts` | no existe aún | lo crea 03 |

## Bitácora

| Fecha | Agente | Acción |
|-------|--------|--------|
| 2026-05-22 | claude | Creó el plan multi-agente |
| 2026-05-22 | claude (01-cleanup) | Cleanup terminado en `feat/cleanup`: removidas deps muertas (svelte, roboto, react-device-detect), borrado src/fonts/ Font Awesome (~190K), Social/Footer migrados a .astro con astro-icon + lucide (Twitter → X, todos los externos con `rel="noopener noreferrer"`), sparklingSphere ahora respeta `prefers-reduced-motion` y limpia GPU resources, Body en español, global.scss sin vendor prefixes ni cruft HTML5UP. Bundle dist/ 2.1M → 1.3M. `pnpm build` pasa limpio. |

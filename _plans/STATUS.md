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
| 01 | [cleanup](./01-cleanup.md) | ⚪ not_started | — | `feat/cleanup` | Sin dependencias, puede arrancar ya |
| 02 | [design-system](./02-design-system.md) | ⚪ not_started | — | `feat/design-system` | Esperar a 01 |
| 03 | [content-migration](./03-content-migration.md) | ⚪ not_started | — | `feat/content-migration` | Esperar a 01 |
| 04 | [homepage](./04-homepage.md) | ⚪ not_started | — | `feat/homepage` | Esperar a 02 |
| 05 | [blog-features](./05-blog-features.md) | ⚪ not_started | — | `feat/blog-features` | Esperar a 02 y 03 |
| 06 | [new-pages](./06-new-pages.md) | ⚪ not_started | — | `feat/new-pages` | Esperar a 02 y 03 |
| 07 | [perf-a11y](./07-perf-a11y.md) | ⚪ not_started | — | `feat/perf-a11y` | Esperar a 04, 05 y 06 |

## Lock zones — quién tiene el archivo

| Archivo | Owner actual | Hasta |
|---------|--------------|-------|
| `package.json` | libre | — |
| `astro.config.mjs` | libre | — |
| `src/styles/tokens.css` | no existe aún | lo crea 02 |
| `src/content/config.ts` | no existe aún | lo crea 03 |

## Bitácora

| Fecha | Agente | Acción |
|-------|--------|--------|
| 2026-05-22 | claude | Creó el plan multi-agente |

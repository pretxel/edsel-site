# Plan de modernización — edselserrano.com
*Trabajo coordinado por múltiples agentes. Fecha: 2026-05-22*

## Objetivo
Modernizar el sitio personal de Edsel para que tenga un solo lenguaje visual de punta a punta, sea fácil de actualizar (Markdown en lugar de TypeScript hardcoded) y esté listo para publicar artículos reales además del portafolio de proyectos.

## Cómo trabaja el equipo de agentes

Este folder está pensado para que **varios agentes trabajen en paralelo**, cada uno con su scope cerrado. Cada archivo numerado (`01-`, `02-`, …) es la asignación de **un agente**.

Reglas de coordinación:

1. **Un agente, un archivo.** Antes de empezar, el agente marca su archivo como `status: in_progress` en el frontmatter.
2. **Respetar `depends_on`.** Si un agente depende de otro, esperar a que el upstream esté en `status: done` antes de arrancar.
3. **No tocar lo que está en `out_of_scope`.** Cada plan declara explícitamente qué archivos NO debe modificar para evitar conflictos.
4. **Commits atómicos por agente.** Cada agente abre su propio branch `feat/<scope>` y mergea cuando su acceptance criteria esté completo.
5. **Status board.** Ver [`STATUS.md`](./STATUS.md) — es la fuente de verdad de qué está hecho, en curso y bloqueado.

## Mapa de agentes y dependencias

```
                ┌────────────────────┐
                │ 01-cleanup         │  (puede arrancar ya — sin deps)
                └─────────┬──────────┘
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
  ┌────────────────────┐   ┌────────────────────┐
  │ 02-design-system   │   │ 03-content-        │  (paralelos entre sí)
  │                    │   │   migration        │
  └─────────┬──────────┘   └─────────┬──────────┘
            │                        │
            ├────────────┬───────────┤
            ▼            ▼           ▼
  ┌──────────────┐ ┌──────────┐ ┌──────────────┐
  │ 04-homepage  │ │ 05-blog- │ │ 06-new-pages │  (paralelos entre sí)
  │              │ │ features │ │              │
  └──────┬───────┘ └────┬─────┘ └──────┬───────┘
         │              │              │
         └──────────────┼──────────────┘
                        ▼
              ┌────────────────────┐
              │ 07-perf-a11y       │  (al final, sobre el resultado)
              └────────────────────┘
```

## Lista de archivos

| # | Plan | Agente sugerido | Depende de |
|---|------|-----------------|------------|
| 01 | [Cleanup & quick wins](./01-cleanup.md) | `claude-code` | — |
| 02 | [Design system & tokens](./02-design-system.md) | `claude-code` | 01 |
| 03 | [Content migration a MDX](./03-content-migration.md) | `claude-code` | 01 |
| 04 | [Homepage redesign](./04-homepage.md) | `claude-code` | 02 |
| 05 | [Blog features](./05-blog-features.md) | `claude-code` | 02, 03 |
| 06 | [Páginas /about y /now](./06-new-pages.md) | `claude-code` | 02, 03 |
| 07 | [Performance & accessibility](./07-perf-a11y.md) | `claude-code` | 04, 05, 06 |

## Archivos compartidos (lock zones)

Estos archivos los toca **un solo agente a la vez**. Coordinar por `STATUS.md`:

- `package.json` — sólo el agente 01 puede tocarlo en su fase, luego cualquiera con anuncio previo
- `astro.config.mjs` — owner: agente 01 inicialmente
- `src/styles/tokens.css` — owner: agente 02 (lo crea), luego read-only para los demás
- `src/content/config.ts` — owner: agente 03 (lo crea), luego read-only para los demás

## Cómo arrancar como agente

1. Abre [`STATUS.md`](./STATUS.md) y mira qué está libre.
2. Lee el plan completo de tu número (`0X-…md`).
3. Cambia tu fila en `STATUS.md` a `🟡 in_progress` con tu nombre/ID.
4. Crea tu branch: `git checkout -b feat/<scope>`.
5. Ejecuta los pasos. Marca checkboxes conforme avanzas.
6. Cuando todos los acceptance criteria estén ✅, abre PR y cambia `STATUS.md` a `🟢 done`.
7. Si te bloqueas en otro agente, marca `🔴 blocked` y nota el motivo.

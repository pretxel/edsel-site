# Prompts para Claude Code — modernización edselserrano.com

Este archivo tiene dos prompts listos para copiar/pegar en Claude Code:

1. **Prompt Orquestador** — uno solo, lanza al equipo entero. Claude Code lee `_plans/`, identifica qué planes están desbloqueados, spawneá varios sub-agentes **en paralelo** con la herramienta `Task`, espera, actualiza `STATUS.md` y repite hasta cerrar los 7.
2. **Prompt Individual** — plantilla para correr un solo plan a la vez (debugging o si quieres ir manual).

---

## 1. Prompt Orquestador

> **Cómo usarlo:** abre Claude Code en la raíz del repo (`cd ~/Projects/personal/edsel-site && claude`), pega el bloque de abajo y dale enter. Claude Code va a coordinar al equipo.

```text
Eres el orquestador de un equipo multi-agente que va a modernizar este sitio personal (Astro 6 + Tailwind 4 + Vercel). Todo el plan ya está escrito en `_plans/`.

═══════════════════════════════════════════════════════════════
PROTOCOLO DE ORQUESTACIÓN
═══════════════════════════════════════════════════════════════

PASO 0 — Contexto
  - Lee `_plans/README.md` para entender la estructura del equipo.
  - Lee `_plans/STATUS.md` para ver el estado actual del tablero.
  - Lista los archivos `_plans/0*.md` para saber cuántos planes hay.

PASO 1 — Identificar planes desbloqueados
  Un plan está "desbloqueado" si:
    (a) su estado en STATUS.md es ⚪ not_started, Y
    (b) todos sus `depends_on` están 🟢 done.

  Importante: el plan 01 no tiene dependencias, así que la primera ola siempre es solo 01.

PASO 2 — Lanzar sub-agentes EN PARALELO
  Por cada plan desbloqueado, lanza un sub-agente con la herramienta `Task`.
  Cuando hay varios desbloqueados, lanzar TODOS en un SOLO MENSAJE con
  múltiples bloques de `Task` (esto los corre en paralelo).

  Prompt para cada sub-agente (sustituye `{N}` y `{slug}`):

    ─────────────────────────────────────────────────────────
    Eres el agente {N} del equipo que moderniza edselserrano.com.

    Tu plan completo está en `_plans/{N}-{slug}.md`. Léelo entero
    antes de empezar.

    Misión:
      1. Crea y cambia al branch `feat/{slug}` (`git checkout -b ...`).
      2. Ejecuta todos los "Pasos" del plan.
      3. Cumple todos los "Acceptance criteria" (marca los checkboxes).
      4. NO toques nada que esté listado en "Out of scope" — eso es
         dominio de otro agente.
      5. Respeta el "Lock zones" del README (archivos compartidos).
      6. Cuando tu acceptance esté 100%:
         - Haz commit (varios commits atómicos son mejor que uno
           gigante).
         - Edita `_plans/STATUS.md`: cambia tu fila a 🟢 done con tu
           branch.
         - Agrega una línea a la "Bitácora" con resumen de lo hecho.
         - NO hagas merge a main por ti mismo — déjalo en el branch
           para que humano revise.
      7. Si te bloqueas (algo en `Out of scope` te impide avanzar,
         tests rompiéndose, decisión ambigua), NO inventes. Marca tu
         fila en STATUS.md como 🔴 blocked con el motivo y termina
         devolviendo un reporte claro.

    Reporta de vuelta en menos de 300 palabras:
      - Estado final (done / blocked).
      - Branch name + lista de commits.
      - Archivos creados / modificados / borrados.
      - Acceptance criteria: cuántos cumplidos / cuántos faltan.
      - Si quedaste bloqueado, qué decisión humana hace falta.
    ─────────────────────────────────────────────────────────

PASO 3 — Esperar y consolidar
  Cuando los sub-agentes de la ola terminen:
    - Lee sus reportes.
    - Confirma que `_plans/STATUS.md` quedó actualizado. Si algún
      sub-agente no lo actualizó, hazlo tú.
    - Si alguno terminó en 🔴 blocked, REPORTA al usuario el bloqueo
      y espera respuesta antes de seguir.

PASO 4 — Repetir
  Vuelve al PASO 1. La nueva ola serán los planes cuyos
  `depends_on` quedaron todos en 🟢 después de la ola anterior.

  Sigue hasta que TODOS los planes (01–07) estén en 🟢 done.

PASO 5 — Cierre
  Cuando 07 cierre:
    - Corre `pnpm build` y `pnpm test` para confirmar verde.
    - Genera un resumen final al usuario:
        * branches creados
        * deltas de Lighthouse antes/después (de 07-perf-a11y)
        * checklist de la "Definition of done" del proyecto entero
          (al final de `_plans/07-perf-a11y.md`)
    - NO mergees nada a `main` — eso lo hace el usuario.

═══════════════════════════════════════════════════════════════
REGLAS DURAS
═══════════════════════════════════════════════════════════════
- NUNCA lances un sub-agente cuyas dependencias no estén 🟢.
- NUNCA lances dos sub-agentes que toquen el mismo "Lock zone"
  al mismo tiempo (ver `_plans/README.md`).
- NUNCA mergees a main automáticamente.
- Si encuentras conflictos en `STATUS.md` (dos owners en la misma
  fila), detente y pregunta al usuario.
- Si un sub-agente devuelve un error o queda colgado, márcalo
  como 🔴 blocked en STATUS y reporta.

Empieza ahora con el PASO 0.
```

---

## 2. Prompt Individual (un solo plan)

> **Cómo usarlo:** úsalo cuando quieras correr **un solo plan** de forma manual (debugging, retomar uno que quedó bloqueado, o porque prefieres ir uno a uno). Reemplaza `{N}` por el número del plan (`01`, `02`, …) y `{slug}` por el nombre (`cleanup`, `design-system`, etc.).

```text
Eres el agente {N}-{slug} del equipo que moderniza edselserrano.com.

Tu plan completo vive en `_plans/{N}-{slug}.md`. Léelo entero antes
de empezar a tocar código.

Reglas:
  1. Crea y cambia al branch `feat/{slug}`.
  2. Ejecuta todos los pasos del plan en orden.
  3. Cumple TODOS los "Acceptance criteria". Si descubres uno que
     no aplica, justifícalo por escrito en el commit antes de
     marcarlo.
  4. NO toques nada de la sección "Out of scope".
  5. Respeta los "Lock zones" del README (`_plans/README.md`).
  6. Antes de mergear:
     - Commits atómicos con mensajes descriptivos.
     - Edita `_plans/STATUS.md`: tu fila pasa a 🟢 done.
     - Agrega línea a la bitácora.
  7. NO hagas merge a `main` — déjalo en branch para review.

Si te bloqueas:
  - NO inventes soluciones que toquen scope ajeno.
  - Marca tu fila en STATUS como 🔴 blocked con motivo.
  - Reporta qué decisión humana se necesita.

Al terminar reporta:
  - Branch name y lista de commits.
  - Archivos tocados.
  - Acceptance criteria: X/Y cumplidos.
  - Bloqueos pendientes (si los hay).

Empieza leyendo `_plans/{N}-{slug}.md` ahora.
```

### Pegado rápido por agente

| Plan | Comando para copiar/pegar (sustituye en el prompt de arriba) |
|------|---------------------------------------------------------------|
| 01   | `{N}=01`, `{slug}=cleanup`           |
| 02   | `{N}=02`, `{slug}=design-system`     |
| 03   | `{N}=03`, `{slug}=content-migration` |
| 04   | `{N}=04`, `{slug}=homepage`          |
| 05   | `{N}=05`, `{slug}=blog-features`     |
| 06   | `{N}=06`, `{slug}=new-pages`         |
| 07   | `{N}=07`, `{slug}=perf-a11y`         |

---

## 3. Notas sobre el modo paralelo

Claude Code soporta correr **varios sub-agentes en paralelo** si los lanzas en el mismo mensaje con varios `Task` blocks. El orquestador de arriba aprovecha esto:

- **Ola 1:** solo `01-cleanup` (no tiene deps).
- **Ola 2:** `02-design-system` + `03-content-migration` en paralelo (ambos sólo dependen de 01).
- **Ola 3:** `04-homepage` + `05-blog-features` + `06-new-pages` en paralelo (todos dependen de 02 y/o 03, que ya estarán hechos).
- **Ola 4:** `07-perf-a11y` solo.

Camino crítico = ola1 + ola2 + ola3 + ola4 ≈ `01 → 02 → 04 → 07` ≈ ~20h reloj con paralelismo, vs ~38h secuencial.

## 4. Antes de lanzar el orquestador, checklist humano

- [ ] Repo en `main` limpio (`git status` sin cambios sin commit).
- [ ] Estás en la raíz del proyecto.
- [ ] `pnpm install` corrió OK.
- [ ] Backup del estado actual: `git tag pre-modernization-$(date +%Y%m%d)`.
- [ ] Avisado a quien sea que pueda estar haciendo commits en paralelo.

## 5. Después del orquestador

Cuando el orquestador termine:

1. Revisa cada branch `feat/*` (probablemente 7).
2. Mergea en orden de dependencias (01 primero, 07 al final) o, si todo se ve bien, en una sola PR.
3. Deploy a Vercel (preview) y haz QA visual.
4. Mergea a `main` y producción.

# MEMORY.md — Memoria compartida del proyecto

Fuente de verdad del **estado**. Las reglas viven en `AGENTS.md`; el detalle del plan, en `docs/PLAN.md`.

## Estado actual

- **Fase:** 2, WP-02 (spec radar-core).
- **Repositorio:** https://github.com/HenryStark866/kiro-radar (público, rama `main`).
- **Kiro:** instalado, sesión de henrytaborda57@gmail.com, plan Free con 0 de 50 créditos usados el 2026-10-30. El contador se reinicia el 2026-11-01.
- **Siguiente paso:** Henry revisa `.kiro/specs/radar-core/requirements.md` (compuerta G2).
- **Fecha límite del reto:** desconocida. Henry debe confirmarla.
- **Canal de entrega:** desconocido. Henry debe confirmarlo.

## Proyecto

**Kiro Radar** es una CLI, un servidor MCP, un Power y un dashboard que escanean un repositorio y puntúan cómo usa Kiro en 10 dimensiones. No es un producto oficial de Kiro ni de AWS.

## Decisiones

| Fecha | Decisión | Por qué | Aprobó |
| --- | --- | --- | --- |
| 2026-10-30 | Construir Kiro Radar | El proyecto necesita de verdad cada herramienta de Kiro, y su puntaje sobre sí mismo prueba el criterio del reto | Henry, en el chat, 2026-10-30 |
| 2026-10-30 | Solo Kiro escribe código, specs, hooks, skills y agentes | Criterio del reto: "El código fue generado usando Kiro" | Regla base |
| 2026-10-30 | Sin base de datos ni servicios de terceros de pago | Reduce riesgo y protege los proyectos Supabase en producción | Regla base |
| 2026-10-30 | Monorepo con npm workspaces y TypeScript | npm ya está instalado; un solo lenguaje para todos los paquetes | Regla base |

## Datos verificados de Kiro (kiro.dev, 2026-10-30)

- Hooks: `.kiro/hooks/*.json`, esquema `version: "v1"`, triggers en PascalCase. Confirmados: `PostFileCreate`, `PostFileSave`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `PreTaskExec`, `PostTaskExec`, `Stop`.
- Salir con código 2 bloquea en `PreToolUse`, `UserPromptSubmit` y `PreTaskExec`. Los hooks de archivo en el IDE responden a cambios del agente, no a guardados manuales.
- Steering: `.kiro/steering/*.md`, con modos `always`, `fileMatch`, `manual`, `auto`.
- Skills: `.kiro/skills/<nombre>/SKILL.md`; `name` debe coincidir con la carpeta.
- Agentes: `.kiro/agents/<nombre>.json` o `.md`. No cargan steering ni skills si no se agregan en `resources`.
- Workflows: `.kiro/workflows/*.workflow.json`, función opcional que se activa en Workspace Configuration.
- MCP: `.kiro/settings/mcp.json`.
- Powers: formato nuevo con `plugin.json`, `skills/` y `mcp.json`; `POWER.md` es el formato antiguo.
- Correctness (pruebas basadas en propiedades) es solo del IDE. Quick Spec no tiene compuertas de aprobación.

## Ideas aparcadas

Las ideas fuera de alcance van aquí, no al código.

- Acción de GitHub para publicar el puntaje en cada PR.

## Bitácora

Formato: `AAAA-MM-DD | agente | WP | qué pasó`. Solo agregar al final.

- 2026-10-30 | Claude Code | WP-00 | Creado el andamiaje de coordinación, el plan, los prompts y el steering inicial. Ningún archivo de código de producto.
- 2026-10-30 | Claude Code | WP-00 | Henry aprobó Kiro Radar en el chat. Sigue la fase 0.
- 2026-10-30 | Claude Code | WP-00 | Henry aprobó en el chat crear el repositorio público. Creado y publicado en GitHub.
- 2026-10-30 | Claude Code | WP-00 | Plan ajustado a Kiro Free y creado docs/PASO-A-PASO.md. Dashboard y despliegue pasan a opcionales.
- 2026-10-30 | Kiro | WP-00 | Henry aprobó G0. WP-00 completo. WP-01 en curso.
- 2026-10-30 | Claude Code | WP-01 | Henry autorizó en el chat operar Kiro CLI. Instalado 2.36.0. Hooks corregidos por Kiro; 26 tests aprobados y bloqueo real comprobado. G1 pendiente de Henry.
- 2026-10-30 | Kiro | WP-01 | Creada rama wp/WP-01. Hooks: scope-guard, secret-guard, evidence-ledger, test-on-save, spec-sync, session-handoff. `.kiroignore` creado. Commits enviados a origin.
- 2026-10-30 | Kiro | WP-01 | Corrección de hooks tras revisión G1. 7 hallazgos corregidos: normalización de rutas, bloqueo si no se puede evaluar,matcher write, exclusión .kiro/specs/, bloque confirm en session-handoff, evidence-ledger con spec/tarea reales, TOOLS-MATRIX actualizado. Commits en wp/WP-01.
- 2026-10-30 | Claude Code | WP-01 | Henry aprobó G1 en el chat.
- 2026-10-30 | Claude Code | WP-01 | Henry aprobó fusionar WP-01 a main y subirlo.
- 2026-10-30 | Claude Code | WP-02 | requirements.md de radar-core generado por Kiro y corregido tras revisión. Pendiente Analyze Requirements y G2 de Henry.
- 2026-10-30 | Claude Code | WP-02 | Henry aprobó G2 en el chat. No confirmó si corrió Analyze Requirements.

- 2026-10-30 | Claude Code | WP-02 | Revisión G3 en docs/reviews/WP-02-design-2026-10-30.md. Kiro CLI corrigió design.md y tasks.md (H1-H6). Pendiente: hooks del generador con version "v1". G3 pendiente de Henry.
- 2026-10-30 | Claude Code | WP-02 | Henry ordenó en el chat: entrega simple, funcional e ingeniosa en menos de 60 minutos. Alcance recortado a core + CLI (sin MCP, Power, workflow ni dashboard). Se toma como aprobación de G3 con ese recorte. Pruebas con node:test + fast-check, TS ejecutado directo en Node 24.
- 2026-10-30 | Claude Code | WP-02 | Kiro CLI generó packages/core, packages/cli, fixtures y README. 22/22 pruebas. excellent 93, minimal 28, trap 0, autoescaneo 62. Revisión en docs/reviews/WP-02-core-2026-10-30.md (C1-C4 corregidos por Kiro).
- 2026-10-30 | Claude Code | WP-02 | Henry aprobó en el chat fusionar WP-02 a main y subirlo.
- 2026-10-30 | Claude Code | WP-04/06 | Henry aprobó en el chat agregar servidor MCP y Power antes de publicar. Rama wp/WP-04.
- 2026-10-30 | Claude Code | WP-04/06 | Kiro generó servidor MCP (packages/mcp), .kiro/settings/mcp.json y power/kiro-radar (plugin.json, mcp.json, skill, README). 29/29 pruebas, autoescaneo 72. M1-M4 corregidos. M5 y M6 abiertos: Kiro llegó al límite mensual de créditos.

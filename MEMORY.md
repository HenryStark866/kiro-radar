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

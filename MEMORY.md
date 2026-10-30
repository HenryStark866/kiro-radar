# MEMORY.md — Memoria compartida del proyecto

Fuente de verdad del **estado**. Las reglas viven en `AGENTS.md`; el detalle del plan, en `docs/PLAN.md`.

## Estado actual

- **Fase:** 0, preparación.
- **Bloqueo:** Kiro no está instalado en el equipo de Henry (verificado el 2026-10-30). Tampoco existe repositorio git todavía.
- **Siguiente paso:** ejecutar la fase 0 de `docs/PLAN.md`.
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

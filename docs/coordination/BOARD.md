# Tablero de trabajo

Solo el integrador edita este archivo. Quién tiene un WP en este momento se ve en `locks/`.

Estados: `bloqueado`, `libre`, `en curso`, `en revisión`, `hecho`.

| WP | Entregable | Rutas exclusivas | Depende de | Prompt | Estado |
| --- | --- | --- | --- | --- | --- |
| WP-00 | Kiro instalado, git, repositorio remoto | raíz | Ninguno | Comandos de fase 0 | hecho |
| WP-01 | Configuración de Kiro: hooks, skills, agentes, steering adicional | `.kiro/` (menos `specs/`), `.kiroignore`, `scripts/hooks/` | WP-00 | P1, P2 | hecho |
| WP-02 | Spec y motor de puntaje | `.kiro/specs/radar-core/`, `packages/core/` | WP-01 | P3, P4 | hecho |
| WP-03 | CLI | `.kiro/specs/radar-cli/`, `packages/cli/` | WP-02 | P5 | hecho (dentro de WP-02) |
| WP-04 | Servidor MCP | `.kiro/specs/radar-mcp/`, `packages/mcp/` | WP-02 | P6 | hecho (M6 abierto) |
| WP-05 | Dashboard | `.kiro/specs/radar-web/`, `packages/web/` | WP-02 | P7 | bloqueado |
| WP-06 | Power | `power/kiro-radar/` | WP-04 | P8 | hecho (M5 abierto) |
| WP-07 | Workflow de revisión, seguridad y correctness | `.kiro/workflows/`, `tests/e2e/` | WP-03, WP-04, WP-05 | P9, P10 | bloqueado |
| WP-08 | Despliegue | Configuración de hosting | WP-05, WP-07 | P11 | bloqueado |
| WP-09 | README, demo, post y autoescaneo final | `README.md`, `docs/evidence/`, `docs/post/` | WP-06, WP-07, WP-08 | P12 | bloqueado |
| WP-10 | Release: paquete instalable, Powers vigente, README, workflow | `package.json`, `tsconfig.build.json`, `packages/cli/bin.mjs`, `packages/mcp/server.mjs`, `tests/e2e/`, `power/kiro-radar/mcp.json` | WP-02, WP-04 | K1-K4 (docs/reviews/PRODUCCION-2026-10-30.md) | en pausa hasta 2026-12-01 (créditos de Kiro) |

Con Kiro Free, WP-05 y WP-08 son opcionales y solo se abren si sobran créditos. WP-09 entonces depende solo de WP-06 y WP-07.

## Paralelismo

Con WP-02 aprobado, WP-03, WP-04 y WP-05 pueden correr a la vez porque no comparten rutas. Los demás van en orden.

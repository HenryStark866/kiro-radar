# Tablero de trabajo

Solo el integrador edita este archivo. Quién tiene un WP en este momento se ve en `locks/`.

Estados: `bloqueado`, `libre`, `en curso`, `en revisión`, `hecho`.

| WP | Entregable | Rutas exclusivas | Depende de | Prompt | Estado |
| --- | --- | --- | --- | --- | --- |
| WP-00 | Kiro instalado, git, repositorio remoto | raíz | Ninguno | Comandos de fase 0 | libre |
| WP-01 | Configuración de Kiro: hooks, skills, agentes, steering adicional | `.kiro/` (menos `specs/`), `.kiroignore`, `scripts/hooks/` | WP-00 | P1, P2 | bloqueado |
| WP-02 | Spec y motor de puntaje | `.kiro/specs/radar-core/`, `packages/core/` | WP-01 | P3, P4 | bloqueado |
| WP-03 | CLI | `.kiro/specs/radar-cli/`, `packages/cli/` | WP-02 | P5 | bloqueado |
| WP-04 | Servidor MCP | `.kiro/specs/radar-mcp/`, `packages/mcp/` | WP-02 | P6 | bloqueado |
| WP-05 | Dashboard | `.kiro/specs/radar-web/`, `packages/web/` | WP-02 | P7 | bloqueado |
| WP-06 | Power | `power/kiro-radar/` | WP-04 | P8 | bloqueado |
| WP-07 | Workflow de revisión, seguridad y correctness | `.kiro/workflows/`, `tests/e2e/` | WP-03, WP-04, WP-05 | P9, P10 | bloqueado |
| WP-08 | Despliegue | Configuración de hosting | WP-05, WP-07 | P11 | bloqueado |
| WP-09 | README, demo, post y autoescaneo final | `README.md`, `docs/evidence/`, `docs/post/` | WP-06, WP-07, WP-08 | P12 | bloqueado |

## Paralelismo

Con WP-02 aprobado, WP-03, WP-04 y WP-05 pueden correr a la vez porque no comparten rutas. Los demás van en orden.

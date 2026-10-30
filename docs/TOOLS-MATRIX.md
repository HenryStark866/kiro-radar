# Matriz de herramientas de Kiro

Es la prueba para el criterio del reto. Una fila solo se marca `hecho` con un archivo o commit que la demuestre.

| Herramienta | Uso significativo | WP | Prueba | Estado |
| --- | --- | --- | --- | --- |
| Spec Requirements-First | `radar-core`, `radar-cli`, `radar-web` | 02, 03, 05 | | pendiente |
| Spec Design-First | `radar-mcp` | 04 | | pendiente |
| Analyze Requirements | Hallazgos resueltos antes del diseño | 02 | | pendiente |
| Markdown Review | Comentarios enviados a Kiro | 02 | | pendiente |
| Ejecución en oleadas | Tareas independientes con Run all | 05 | | pendiente |
| Correctness | Propiedades del núcleo | 07 | | pendiente |
| Bugfix Spec | Solo con un defecto real | 07 | | pendiente |
| Steering always | `product`, `tech`, `structure`, `collaboration` | 00 | `.kiro/steering/` | sembrado |
| Steering fileMatch | `testing.md` | 01 | | pendiente |
| Steering auto | `scoring-rules.md` | 01 | | pendiente |
| Steering manual | `release.md` | 01 | | pendiente |
| Referencias de archivo | `#[[file:...]]` | 01 | | pendiente |
| AGENTS.md | Reglas para todos los agentes | 00 | `AGENTS.md` | hecho |
| Hook PreToolUse | `scope-guard`, `secret-guard` | 01 | [kiro:wp-01] add hooks configuration | hecho |
| Hook PostTaskExec | `evidence-ledger` | 01 | [kiro:wp-01] add hooks configuration | hecho |
| Hook PostFileSave | `test-on-save` | 01 | [kiro:wp-01] add hooks configuration | hecho |
| Hook PostFileCreate | `spec-sync` | 01 | [kiro:wp-01] add hooks configuration | hecho |
| Hook Stop | `session-handoff` | 01 | [kiro:wp-01] add hooks configuration | hecho |
| Skills | Tres skills propias | 01 | | pendiente |
| Agentes personalizados | Reviewer, tester, architect | 01 | | pendiente |
| Subagentes | Delegación en paralelo | 07 | | pendiente |
| Permisos | Reglas por agente | 01 | | pendiente |
| `.kiroignore` | Excluir archivos sensibles y pesados | 01 | [kiro:wp-01] add .kiroignore | hecho |
| MCP propio | Servidor `kiro-radar` | 04 | | pendiente |
| Power propio | `power/kiro-radar` | 06 | | pendiente |
| Power Builder | Creación del Power | 06 | | pendiente |
| Power de seguridad | Escaneo del repositorio | 07 | | pendiente |
| Power de Firebase | Despliegue | 08 | | pendiente |
| Workflows | `wp-review` con bucle y paralelo | 07 | | pendiente |
| Memory | Decisiones entre sesiones | 00 | | pendiente |
| Checkpoints | Una reversión real, si ocurre | 03 | | pendiente |
| Supervised y Autopilot | Núcleo supervisado, dashboard en Autopilot | 02, 05 | | pendiente |
| Kiro CLI | Correr un agente desde terminal | 07 | | opcional |
| Kiro Web autónomo | Una tarea en la nube | 09 | | opcional |

## Pruebas de hooks (WP-01)

### scope-guard (PreToolUse)
- **Caso exitoso**: Escritura en `docs/coordination/BOARD.md` → permitido (salida: exit 0)
- **Caso fallido**: Escritura en `other/file.txt` → bloqueado (salida: exit 2 + mensaje de rechazo)
- **Script**: `scripts/hooks/scope-guard.js`
- **Reproducción**: `echo '{"params":{"path":"<raíz>/docs/coordination/BOARD.md"}}' | node scripts/hooks/scope-guard.js`

### secret-guard (PreToolUse)
- **Caso exitoso**: Escritura de código sin secretos → permitido (salida: exit 0)
- **Caso fallido**: Escritura con patrón `sk_live_...` → bloqueado (salida: exit 2 + mensaje de rechazo)
- **Script**: `scripts/hooks/secret-guard.js`
- **Reproducción**: `echo '{"tool_input":{"text":"const x = 1"}}' | node scripts/hooks/secret-guard.js`

### evidence-ledger (PostTaskExec)
- **Caso exitoso**: Ejecución del hook → registro agregado a `docs/evidence/ledger.jsonl`
- **Formato**: `{"date":"YYYY-MM-DD","spec":"<spec>","task":"<task>","branch":"<branch>"}`
- **Script**: `scripts/hooks/evidence-ledger.js`
- **Reproducción**: `echo '{"task":{"spec":"radar-core","name":"1.1. Create core types","branch":"wp/WP-01"}}' | node scripts/hooks/evidence-ledger.js`

### test-on-save (PostFileSave)
- **Caso exitoso**: Guardado en `packages/*/src/*.ts` → intenta ejecutar tests
- **Nota**: No ejecuta si no hay npm test definido (salida: exit 0 siempre)
- **Script**: `scripts/hooks/test-on-save.js`
- **Reproducción**: `echo '{"params":{"path":"<raíz>/packages/core/src/index.ts"}}' | node scripts/hooks/test-on-save.js`

### spec-sync (PostFileCreate)
- **Caso exitoso**: Creación en `packages/*/` → verifica si mencionado en design.md o tasks.md
- **Caso fallido**: Archivo no mencionado → aviso en console.log
- **Script**: `scripts/hooks/spec-sync.js`
- **Reproducción**: `echo '{"params":{"path":"<raíz>/packages/core/src/newfile.ts"}}' | node scripts/hooks/spec-sync.js`

### session-handoff (Stop)
- **Caso exitoso**: Final de sesión → pregunta al usuario (bloque `confirm`)
- **Script**: `scripts/hooks/session-handoff.js`
- **Reproducción**: `echo '{}' | node scripts/hooks/session-handoff.js`

## Herramientas usadas

- **Node.js** (v18+) para ejecutar scripts de hooks
- **PowerShell** para verificación y pruebas en Windows
- **Git** para commits y gestión de ramas

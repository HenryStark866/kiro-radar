# Prompts

Copia cada bloque tal cual. Un prompt por chat nuevo, salvo que se indique otra cosa. Todos asumen que `AGENTS.md` ya está cargado.

## P0. Entrada de cualquier agente

Sirve para Kiro, Claude Code, Codex o cualquier otro. Cambia `<ROL>`.

```text
Vas a colaborar en este repositorio como <ROL>.
Lee AGENTS.md, MEMORY.md y docs/coordination/BOARD.md, y revisa docs/coordination/locks/.
Antes de hacer nada, responde en máximo 8 líneas:
1. Qué puedes y qué no puedes escribir según tu rol.
2. Fase actual y siguiente paso.
3. Qué WP vas a tomar, sus rutas y sus dependencias.
4. Qué bloqueos ves.
Luego espera mi confirmación.
```

## P1. Protecciones (WP-01, Kiro)

```text
Toma WP-01 según AGENTS.md. Consulta kiro.dev/docs/hooks/ y sus páginas de triggers y acciones antes de crear archivos, y usa el esquema v1 vigente.

Crea en .kiro/hooks/ estos hooks, con sus scripts Node en scripts/hooks/:
1. scope-guard (PreToolUse sobre escritura): lee el lock activo en docs/coordination/locks/, compara la ruta contra las rutas exclusivas del WP en BOARD.md y sale con código 2 si está fuera. Debe permitir docs/coordination/handoffs/ y la bitácora de MEMORY.md.
2. secret-guard (PreToolUse sobre escritura): bloquea contenido con patrones de tokens y claves.
3. evidence-ledger (PostTaskExec): agrega a docs/evidence/ledger.jsonl la fecha, el spec, la tarea y la rama.
4. test-on-save (PostFileSave en packages/**): corre los tests del paquete afectado.
5. spec-sync (PostFileCreate en packages/**, acción agent): pide confirmar que el archivo nuevo pertenece a una tarea del spec activo.
6. session-handoff (Stop con confirm): pregunta si se crea el handoff desde la plantilla.

Crea también .kiroignore para que no se lean node_modules, dist, coverage ni .env.
Prueba cada hook con un caso que pase y otro que falle, y muéstrame la salida real. Registra cada uno en docs/TOOLS-MATRIX.md.
```

## P2. Skills, agentes y steering (WP-01, Kiro)

```text
Sigue en WP-01. Consulta kiro.dev/docs/skills/ y kiro.dev/docs/custom-agents/ antes de crear archivos.

Skills en .kiro/skills/:
- radar-dimension: cómo agregar o cambiar una dimensión de puntaje, con fixture bueno, fixture malo y tests.
- evidence-writer: cómo documentar una herramienta en TOOLS-MATRIX con prueba verificable.
- release-check: lista previa a publicar, con scripts/ propios.

Agentes en .kiro/agents/, con steering y skills agregados en resources:
- radar-reviewer: solo lectura; revisa contra el spec y escribe en docs/reviews/.
- radar-tester: lee todo y solo escribe tests.
- radar-architect: lee todo y solo escribe docs de diseño dentro de .kiro/specs/.
Limita tools y permissions al mínimo de cada rol.

Steering adicional en .kiro/steering/:
- testing.md con inclusion fileMatch en **/*.test.ts.
- scoring-rules.md con inclusion auto, que explique por qué presencia no es calidad.
- release.md con inclusion manual, que referencie docs/PLAN.md con #[[file:docs/PLAN.md]].

Prueba cada skill y agente en un caso real y muéstrame el resultado. Actualiza TOOLS-MATRIX.
```

## P3. Spec del núcleo (WP-02, Kiro)

Inicia un Feature Spec, modo **Requirements-First**, con nombre `radar-core`.

```text
Quiero el motor de Kiro Radar, según docs/PLAN.md: lee un repositorio como texto y calcula un puntaje de 10 dimensiones, de 0 a 10 cada una.

Requisitos obligatorios:
- Requisitos en EARS, con criterios de aceptación verificables.
- Nunca ejecuta código del repositorio analizado y nunca sale de su raíz, ni por enlaces simbólicos.
- Tolera archivos ausentes, vacíos, mal formados y muy grandes sin fallar.
- La presencia sola nunca da la nota máxima.
- Salida determinista: misma entrada, mismo JSON.
- Cada dimensión devuelve puntaje, evidencia encontrada y siguiente acción sugerida.
- El reporte tiene schemaVersion.

Fuera de alcance: CLI, MCP, red y dashboard.
Detente después de requirements.md. No avances sin mi aprobación.
```

Después corre **Analyze Requirements**, resuelve los hallazgos y revisa con **Markdown Review**. Al aprobar, registra la compuerta G2 en `MEMORY.md`. Repite con el diseño y las tareas.

Agrega al pedir el diseño:

```text
Define el contrato en packages/core/src/types.ts como única interfaz pública. Incluye propiedades de corrección: determinismo, puntaje siempre dentro de rango, contención de rutas y repositorio trampa con puntaje bajo. Usa Vitest y fast-check.
```

## P4. Ejecución del núcleo (WP-02, Kiro)

```text
Ejecuta las tareas de radar-core una por una, en modo Supervised, y haz un commit por tarea con el formato de AGENTS.md.
Crea en fixtures/ un repositorio excelente, uno mínimo y uno trampa con archivos vacíos que imiten presencia.
Al final corre todos los tests, pásame la salida real y usa el agente radar-reviewer para revisar el resultado contra el spec.
No cierres el WP hasta que yo apruebe congelar types.ts.
```

## P5. CLI (WP-03, Kiro)

Feature Spec, **Requirements-First**, nombre `radar-cli`.

```text
Quiero la CLI de Kiro Radar sobre @kiro-radar/core, sin cambiar su contrato.
Comando: kiro-radar scan <ruta> [--format terminal|json|md] [--badge <archivo.svg>] [--min <n>].
Código de salida 0 si cumple el umbral, 1 si no, 2 si hay error de uso.
Debe funcionar en Windows, incluidas rutas con espacios y acentos.
Detente tras requirements.md y espera mi aprobación.
```

## P6. Servidor MCP (WP-04, Kiro)

Feature Spec, **Design-First**, nombre `radar-mcp`.

```text
Quiero un servidor MCP stdio sobre @kiro-radar/core, con el SDK oficial de TypeScript.
Herramientas: scan_repo(path), explain_dimension(dimension), next_best_action(path).
Todas solo leen. Valida las entradas y devuelve errores claros.
Empieza por el diseño y detente hasta que lo apruebe.
Al terminar, regístralo en .kiro/settings/mcp.json y demuestra su uso desde este mismo chat.
```

## P7. Dashboard (WP-05, Kiro)

Feature Spec, **Requirements-First**, nombre `radar-web`.

```text
Quiero un dashboard estático con Vite y TypeScript, sin backend. Carga un report.json por archivo o por URL pública, y muestra un radar SVG hecho a mano, el total, y la evidencia y acción sugerida por dimensión.
Debe ser accesible por teclado, funcionar en móvil y tener tema claro y oscuro.
Muestra el aviso "Proyecto de la comunidad, no oficial".
Si existe report.json en la raíz del sitio, cárgalo al abrir.
Detente tras requirements.md y espera mi aprobación.
```

## P8. Power (WP-06, Kiro)

Instala **Power Builder** desde el catálogo y úsalo.

```text
Usa Power Builder para crear power/kiro-radar en el formato Agent Plugins, con plugin.json, mcp.json y una skill "improve-kiro-score" que escanee, explique la dimensión más débil y proponga el cambio más pequeño.
Keywords: kiro score, kiro radar, kiro audit, steering audit.
Consulta kiro.dev/docs/powers/create/ antes de crear archivos.
Impórtalo con Add Custom Power desde la carpeta y demuestra su activación por keyword.
```

## P9. Workflow de revisión (WP-07, Kiro)

```text
Consulta kiro.dev/docs/workflows/authoring/ y crea .kiro/workflows/wp-review.workflow.json con la entrada wp.
Debe correr en paralelo radar-reviewer y radar-tester, y luego un bucle repeat de máximo 3 iteraciones que corrija y vuelva a revisar, hasta que .kiro/workflow-output/review.json tenga approved en true. Con onMaxIterations en pause.
Valídalo con validate_workflow y ejecútalo sobre WP-03.
```

## P10. Calidad (WP-07, Kiro)

```text
Ejecuta Correctness sobre radar-core y resume qué propiedades se verificaron.
Instala un Power de seguridad del catálogo, escanea el repositorio y corrige los hallazgos altos.
Si aparece un defecto real, abre un Bugfix Spec para él. No inventes ninguno.
Actualiza TOOLS-MATRIX con los resultados reales.
```

## P11. Despliegue (WP-08, Kiro)

Requiere aprobación previa de Henry. Instala el Power de **Firebase**.

```text
Prepara el despliegue de packages/web en un sitio NUEVO de Firebase Hosting, en la cuenta cdhmaker@gmail.com, con target propio. No toques el sitio del portafolio CDH Maker.
Muéstrame el plan y los comandos exactos, y espera mi aprobación antes de desplegar.
```

## P12. Cierre (WP-09, Kiro)

```text
Corre kiro-radar scan . y guarda report.json, el reporte en Markdown y el badge en docs/evidence/.
Escribe README.md en español con resumen en inglés: qué es, instalación, demo, herramientas de Kiro usadas y aviso de proyecto no oficial.
Audita docs/TOOLS-MATRIX.md: elimina toda fila sin prueba verificable.
Redacta en docs/post/ el post para la comunidad y el guion de un video de menos de 3 minutos con este orden: repositorio trampa con puntaje bajo, spec, hook bloqueando, ejecución de tareas, MCP en el chat, Power, autoescaneo final.
No publiques nada.
```

## R1. Revisión externa (Claude Code, Codex u otro)

```text
Rol: revisor externo. No modifiques código.
Lee AGENTS.md y el spec de <WP>. Revisa la rama wp/<WP> contra los requisitos: lo que falta, lo que sobra y lo que falla.
Corre los tests y anota la salida real. Escribe el resultado en docs/reviews/<WP>-<fecha>.md desde la plantilla.
Reporta solo hallazgos reproducibles.
```

## R2. Auditoría de procedencia antes de entregar

```text
Rol: auditor. No modifiques código.
Compara git log con docs/evidence/PROVENANCE.md y ledger.jsonl.
Lista commits sin prefijo [kiro:...], filas de TOOLS-MATRIX sin prueba y afirmaciones del README que no puedas verificar.
Escribe el resultado en docs/reviews/provenance-<fecha>.md.
```

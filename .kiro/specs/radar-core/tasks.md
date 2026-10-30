# Tareas — radar-core (WP-02)

## 1. Preparar paquete y dependencias aprobadas

- [ ] 1.1 Crear estructura de `packages/core` con `package.json`, `src/index.ts`, `tsconfig.json` y `vitest.config.ts`
  - Requisito: compatibilidad con Windows y ESM
  - Test: `npm run build` en `packages/core` termina sin error
  - Commit: `[kiro:radar-core/1.1] setup core package structure`

- [ ] 1.2 Agregar `fast-check` y `vitest` como dependencias de desarrollo aprobadas
  - Requisito: solo dependencias justificadas en spec; `tslib` no se usa con `tsc` sin `importHelpers`
  - Test: `npm install` no instala dependencias no listadas en spec
  - Commit: `[kiro:radar-core/1.2] add approved dev dependencies`

- [ ] 1.3 Crear `packages/core/src/types.ts` con las interfaces públicas (`Report`, `DimensionResult`, `DimensionName`, `FileRecord`)
  - Requisito: 5.1, 5.2, 5.3, 5.4
  - Test: `npm run test:types` pasa (si existe checker de tipos)
  - Commit: `[kiro:radar-core/1.3] add public types.ts`

- [ ] 1.4 Crear `packages/core/src/index.ts` con export de `scanRepository`
  - Requisito: interfaz pública única
  - Test: import desde otro paquete funciona
  - Commit: `[kiro:radar-core/1.4] export scanRepository entry point`

## 2. Implementar safe-fs con tests

- [ ] 2.1 Crear `packages/core/src/safe-fs/index.ts` con `readFileSafe(path)`, `statSafe(path)`, `readdirSafe(path)`
  - Requisito: tolerancia a errores (sección 6)
  - Test: `packages/core/src/safe-fs/index.test.ts` — lectura de archivo ausente, binario, >1 MiB, enlace
  - Commit: `[kiro:radar-core/2.1] implement safe-fs readFileSafe`

- [ ] 2.2 Crear `packages/core/src/safe-fs/scanDirectory.ts` con validación de ruta, límites y recursión segura
  - Requisito: seguridad (sección 7), compatibilidad Windows
  - Test: `packages/core/src/safe-fs/scanDirectory.test.ts` — root-evil, enlace externo, paths con espacios/acentos
  - Commit: `[kiro:radar-core/2.2] implement safe-fs scanDirectory`

- [ ] 2.3 Implementar detección de UTF-8 con BOM y reemplazo de secuencias inválidas
  - Requisito: compatibilidad Windows (sección 8)
  - Test: `packages/core/src/safe-fs/encoding.test.ts` — archivo con BOM, secuencia inválida
  - Commit: `[kiro:radar-core/2.3] add UTF-8 BOM detection and replacement`

- [ ] 2.4 Crear `packages/core/src/safe-fs/types.ts` con `FileRecord`, `SafeFSConfig` y `ScanResult`
  - Requisito: modelo de datos (sección 4)
  - Test: tipos compilan sin error
  - Commit: `[kiro:radar-core/2.4] add safe-fs types`

## 3. Implementar content-rules (contenido real y frontmatter)

- [ ] 3.1 Crear `packages/core/src/content-rules/index.ts` con `hasRealContent(text)`, `extractFrontmatter(text)`
  - Requisito: Umbral 0 (contenido real ≥200 caracteres no vacíos fuera de títulos y frontmatter)
  - Test: `packages/core/src/content-rules/index.test.ts` — archivo vacío, solo título, frontmatter válido/inválido
  - Commit: `[kiro:radar-core/3.1] implement content-rules hasRealContent`

- [ ] 3.2 Crear `packages/core/src/content-rules/markdown.ts` con `countNonEmptyLines(text)`, `countEarsClauses(text)`
  - Requisito: specs (2.1), steering (2.2), traceability (2.10)
  - Test: `packages/core/src/content-rules/markdown.test.ts` — conteo de líneas y cláusulas EARS (WHEN … SHALL)
  - Commit: `[kiro:radar-core/3.2] implement markdown line counting`

- [ ] 3.3 Crear `packages/core/src/content-rules/json.ts` con `parseJSONSafe(text, schemaVersion)`
  - Requisito: tolerancia a errores (JSON mal formado → 0 + warning)
  - Test: `packages/core/src/content-rules/json.test.ts` — JSON válido, inválido, vacío
  - Commit: `[kiro:radar-core/3.3] implement json parsing with safe error handling`

## 4. Implementar scan y aggregator

- [ ] 4.1 Crear `packages/core/src/scan/index.ts` con `scanRepository(root)`
  - Requisito: flujo de escaneo (validateRoot → readAllFiles → scoreDimensions → aggregate)
  - Test: `tests/e2e/scan-repository.test.ts` — fixture excellent, minimal y trap
  - Commit: `[kiro:radar-core/4.1] implement scanRepository orchestration`

- [ ] 4.2 Crear `packages/core/src/scan/validateRoot.ts` con validación de existencia, tipo y normalización
  - Requisito: compatibilidad Windows (sin trailing slash, barras normales)
  - Test: `packages/core/src/scan/validateRoot.test.ts` — ruta con espacios, acentos, enlace, root-evil
  - Commit: `[kiro:radar-core/4.2] implement validateRoot`

- [ ] 4.3 Crear `packages/core/src/scan/readAllFiles.ts` con `readAllFiles(root): FileRecord[]`
  - Requisito: límite 1 MiB, no seguir enlaces, UTF-8
  - Test: `packages/core/src/scan/readAllFiles.test.ts` — límite de tamaño, enlace simbólico
  - Commit: `[kiro:radar-core/4.3] implement readAllFiles`

- [ ] 4.4 Crear `packages/core/src/scan/scoreDimensions.ts` con `scoreDimensions(root, files): DimensionResult[]`
  - Requisito: orden alfabético de dimensiones, sin localeCompare
  - Test: `packages/core/src/scan/scoreDimensions.test.ts` — orden determinista
  - Commit: `[kiro:radar-core/4.4] implement scoreDimensions`

- [ ] 4.5 Crear `packages/core/src/scan/aggregator.ts` con `aggregate(root, dimensionResults): Report`
  - Requisito: `totalScore === sum(dimensions.score)`, `warnings` ordenadas por code units
  - Test: `packages/core/src/scan/aggregator.test.ts` — suma correcta, orden de warnings
  - Commit: `[kiro:radar-core/4.5] implement aggregator`

## 5. Dimensiones (una tarea por dimensión, con tests y fixture trap)

- [ ] 5.1 Dimension `specs` — `packages/core/src/dimensions/specs.ts`
  - Requisito: 2.1
  - Test: `packages/core/src/dimensions/specs.test.ts` — 0 puntos (sin specs), ≥6 puntos (requirements+design+tasks con WHEN SHALL), 10 puntos (2+ specs con tarea marcada), trap (0 puntos)
  - Fixture trap: `.kiro/specs/requirements.md` con solo título
  - Commit: `[kiro:radar-core/5.1] implement specs dimension`

- [ ] 5.2 Dimension `steering` — `packages/core/src/dimensions/steering.ts`
  - Requisito: 2.2
  - Test: `packages/core/src/dimensions/steering.test.ts` — 0 puntos (sin archivos), ≥6 puntos (product+tech+structure con 2 inclusion), 10 puntos (4 modos), trap (0 puntos)
  - Fixture trap: `.kiro/steering/product.md` con solo título
  - Commit: `[kiro:radar-core/5.2] implement steering dimension`

- [ ] 5.3 Dimension `hooks` — `packages/core/src/dimensions/hooks.ts`
  - Requisito: 2.3
  - Test: `packages/core/src/dimensions/hooks.test.ts` — 0 puntos (sin JSON), ≥6 puntos (2+ triggers, 1 bloqueante), 10 puntos (4+ triggers, 2 bloqueantes), trap (0 puntos)
  - Fixture trap: `.kiro/hooks/hooks.json` con `{}` vacío
  - Commit: `[kiro:radar-core/5.3] implement hooks dimension`

- [ ] 5.4 Dimension `skills` — `packages/core/src/dimensions/skills.ts`
  - Requisito: 2.4
  - Test: `packages/core/src/dimensions/skills.test.ts` — 0 puntos (sin SKILL.md), ≥6 puntos (1 skill con name y description ≥40 chars), 10 puntos (3+ skills), trap (0 puntos)
  - Fixture trap: `.kiro/skills/README.md` con solo título
  - Commit: `[kiro:radar-core/5.4] implement skills dimension`

- [ ] 5.5 Dimension `powers` — `packages/core/src/dimensions/powers.ts`
  - Requisito: 2.5
  - Test: `packages/core/src/dimensions/powers.test.ts` — 0 puntos (sin manifiesto), ≥6 puntos (plugin.json con 5 campos), 10 puntos (3+ keywords), trap (0 puntos)
  - Fixture trap: `.kiro/power/plugin.json` con `{}` vacío
  - Commit: `[kiro:radar-core/5.5] implement powers dimension`

- [ ] 5.6 Dimension `mcp` — `packages/core/src/dimensions/mcp.ts`
  - Requisito: 2.6
  - Test: `packages/core/src/dimensions/mcp.test.ts` — 0 puntos (sin mcp.json), ≥6 puntos (1 server), 10 puntos (2+ servers o env con variables), trap (0 puntos)
  - Fixture trap: `.kiro/settings/mcp.json` con `{}` vacío
  - Commit: `[kiro:radar-core/5.6] implement mcp dimension`

- [ ] 5.7 Dimension `agents` — `packages/core/src/dimensions/agents.ts`
  - Requisito: 2.7
  - Test: `packages/core/src/dimensions/agents.test.ts` — 0 puntos (sin perfiles), ≥6 puntos (1 profile con tools y resources), 10 puntos (3+ profiles con permissions.rules), trap (0 puntos)
  - Fixture trap: `.kiro/agents/agent.json` con `{}` vacío
  - Commit: `[kiro:radar-core/5.7] implement agents dimension`

- [ ] 5.8 Dimension `workflows` — `packages/core/src/dimensions/workflows.ts`
  - Requisito: 2.8
  - Test: `packages/core/src/dimensions/workflows.test.ts` — 0 puntos (sin recetas), ≥6 puntos (1 receta con 2+ nodos), 10 puntos (repeat + parallel), trap (0 puntos)
  - Fixture trap: `.kiro/workflows/workflow.json` con `{}` vacío
  - Commit: `[kiro:radar-core/5.8] implement workflows dimension`

- [ ] 5.9 Dimension `protection` — `packages/core/src/dimensions/protection.ts`
  - Requisito: 2.9
  - Test: `packages/core/src/dimensions/protection.test.ts` — 0 puntos (sin .kiroignore ni hook bloqueante), ≥6 puntos (.kiroignore + 1 hook bloqueante), 10 puntos (2+ hooks + permissions.rules), trap (0 puntos)
  - Fixture trap: `.kiroignore` con solo título y `.kiro/hooks/hooks.json` vacío
  - Commit: `[kiro:radar-core/5.9] implement protection dimension`

- [ ] 5.10 Dimension `traceability` — `packages/core/src/dimensions/traceability.ts`
  - Requisito: 2.10
  - Test: `packages/core/src/dimensions/traceability.test.ts` — 0 puntos (sin tests), ≥6 puntos (tests + evidencia con 1 línea), 10 puntos (tests/e2e + tareas referenciadas), trap (0 puntos)
  - Fixture trap: `tests/README.md` con solo título y `docs/evidence/evidence.md` vacío
  - Commit: `[kiro:radar-core/5.10] implement traceability dimension`

## 6. Fixtures (excellent, minimal y trap)

- [ ] 6.1 Crear `fixtures/excellent/` con todos los archivos al 100% para `totalScore ≥ 80`
  - Requisito: Criterios de aceptación 1
  - Test: `npm run test:e2e -- --filter "excellent"` — `totalScore >= 80`
  - Commit: `[kiro:radar-core/6.1] create excellent fixture`

- [ ] 6.2 Crear `fixtures/minimal/` con contenido válido pero bajo para `20 ≤ totalScore < 80`
  - Requisito: Criterios de aceptación 2
  - Test: `npm run test:e2e -- --filter "minimal"` — `totalScore >= 20 && totalScore < 80`
  - Commit: `[kiro:radar-core/6.2] create minimal fixture`

- [ ] 6.3 Crear `fixtures/trap/` con todos los archivos vacíos o solo título para `totalScore ≤ 20`
  - Requisito: 3 (repositorio trampa), scoring-rules.md
  - Test: `npm run test:e2e -- --filter "trap"` — `totalScore <= 20 && ninguna dimensión >= 4`
  - Commit: `[kiro:radar-core/6.3] create trap fixture`

## 7. Propiedades con fast-check

Todos los tests de propiedades usan `fc.assert(fc.asyncProperty(...))` de `fast-check` directamente, sin `vitest-fast-check`. Cada propiedad crea su carpeta raíz con `fs.mkdtemp` y la borra en `finally`. Se fija `fc.configureGlobal({ seed: 42, numRuns: 100 })` al inicio del módulo.

- [ ] 7.1 Test de determinismo: misma entrada produce mismo output byte por byte
  - Requisito: 5.5 (salida determinista)
  - Arbitrario: `repoTreeArbitrary` (fc.record con subconjunto de rutas `.kiro/**` y contenido variable)
  - Test: `packages/core/src/__props__/determinism.test.ts` con `fc.assert(fc.asyncProperty(...))`
  - Commit: `[kiro:radar-core/7.1] property test: determinism`

- [ ] 7.2 Test de suma: `totalScore === dimensions.reduce((sum, d) => sum + d.score, 0)`
  - Requisito: 5.3 (interfaz pública)
  - Arbitrario: `repoTreeArbitrary`
  - Test: `packages/core/src/__props__/sum.test.ts` con `fc.assert(fc.asyncProperty(...))`
  - Commit: `[kiro:radar-core/7.2] property test: totalScore is sum`

- [ ] 7.3 Test de rango: `0 <= dim.score <= 10` para todas las dimensiones
  - Requisito: 5.3 (interfaz pública)
  - Arbitrario: `repoTreeArbitrary`
  - Test: `packages/core/src/__props__/range.test.ts` con `fc.assert(fc.asyncProperty(...))`
  - Commit: `[kiro:radar-core/7.3] property test: score range`

- [ ] 7.4 Test de trampa: `totalScore ≤ 20` **y** `dim.score < 4` para toda dimensión
  - Requisito: criterio 3 (repositorio trampa); el generador `trapTreeArbitrary` produce solo archivos vacíos, solo títulos o solo frontmatter
  - Test: `packages/core/src/__props__/trap.test.ts` con `fc.assert(fc.asyncProperty(...))`
  - Commit: `[kiro:radar-core/7.4] property test: trap repo`

- [ ] 7.5 Test de monotonía: agregar contenido real a un archivo nunca baja el puntaje de su dimensión
  - Requisito: H5 — monotonía de puntaje
  - Arbitrario: dos árboles (base vacío vs. enriquecido con contenido real); compara `specs.score`
  - Test: `packages/core/src/__props__/monotonicity.test.ts` con `fc.assert(fc.asyncProperty(...))`
  - Commit: `[kiro:radar-core/7.5] property test: monotonicity`

- [ ] 7.6 Test de seguridad de rutas: ningún `evidence` sale de la raíz ni es absoluto
  - Requisito: H5 — seguridad de paths en evidence
  - Arbitrario: `repoTreeArbitrary`; verifica que ninguna entrada de `evidence` sea absoluta o contenga `..`
  - Test: `packages/core/src/__props__/path-safety.test.ts` con `fc.assert(fc.asyncProperty(...))`
  - Commit: `[kiro:radar-core/7.6] property test: evidence path safety`

## 8. E2E y validación final

- [ ] 8.1 Crear `tests/e2e/scan-repository.test.ts` — escanea fixtures y valida schema
  - Requisito: Plan de pruebas (sección 9)
  - Test: `npm run test:e2e` pasa
  - Commit: `[kiro:radar-core/8.1] add e2e scan-repository test`

- [ ] 8.2 Crear `tests/e2e/windows-compatibility.test.ts` — rutas con espacios y acentos
  - Requisito: compatibilidad Windows (sección 8)
  - Test: `npm run test:e2e -- --filter "windows"` pasa
  - Commit: `[kiro:radar-core/8.2] add e2e windows compatibility test`

- [ ] 8.3 Crear `tests/e2e/trap-repo.test.ts` — validación de repositorio trampa
  - Requisito: 3 (repositorio trampa)
  - Test: `npm run test:e2e -- --filter "trap"` pasa
  - Commit: `[kiro:radar-core/8.3] add e2e trap repo test`

- [ ] 8.4 Crear `tests/e2e/safe-fs.test.ts` — traversal, root-evil, enlace externo, binario, >1 MiB y BOM
  - Requisito: Plan de pruebas (sección 9)
  - Test: `npm run test:e2e -- --filter "safe-fs"` pasa
  - Commit: `[kiro:radar-core/8.4] add e2e safe-fs test`

- [ ] 8.5 Ejecutar `npm run test:all` y verificar que todos los tests pasen
  - Requisito: Criterios de aceptación 8 (todos los tests pasan)
  - Test: salida `npm run test:all` — 100% passing
  - Commit: `[kiro:radar-core/8.5] verify all tests pass`

## 9. Verificación final

- [ ] 9.1 Ejecutar `scanRepository("fixtures/excellent")` y verificar `totalScore >= 80`
  - Requisito: Criterios de aceptación 1
  - Commit: `[kiro:radar-core/9.1] verify excellent fixture score`

- [ ] 9.2 Ejecutar `scanRepository("fixtures/minimal")` y verificar `20 <= totalScore < 80`
  - Requisito: Criterios de aceptación 2
  - Commit: `[kiro:radar-core/9.2] verify minimal fixture score`

- [ ] 9.3 Ejecutar `scanRepository("fixtures/trap")` y verificar `totalScore <= 20` y ninguna dimensión >= 4
  - Requisito: Criterios de aceptación 3
  - Commit: `[kiro:radar-core/9.3] verify trap fixture score`

- [ ] 9.4 Ejecutar `scanRepository` dos veces sobre el mismo fixture y verificar output idéntico
  - Requisito: Criterios de aceptación 4 (salida determinista)
  - Commit: `[kiro:radar-core/9.4] verify determinism`

- [ ] 9.5 Verificar que `totalScore === dimensions.reduce((sum, d) => sum + d.score, 0)` para todos los fixtures
  - Requisito: Criterios de aceptación 5
  - Commit: `[kiro:radar-core/9.5] verify totalScore formula`

- [ ] 9.6 Verificar que no hay dependencias de ejecución salvo justificación en spec
  - Requisito: Criterios de aceptación 6
  - Commit: `[kiro:radar-core/9.6] verify no unexpected runtime dependencies`

- [ ] 9.7 Verificar que `warnings` se registran para archivos grandes, binarios, enlaces, etc.
  - Requisito: Criterios de aceptación 7
  - Commit: `[kiro:radar-core/9.7] verify warnings are recorded`

- [ ] 9.8 Crear `packages/core/reports/radar-core-v1.0.0.md` con los resultados de los fixtures
  - Requisito: evidencia real (Regla 6 en AGENTS.md); la ruta pertenece a las exclusivas de WP-02
  - Commit: `[kiro:radar-core/9.8] add validation report`

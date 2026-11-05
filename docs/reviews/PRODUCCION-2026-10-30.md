# Kiro Radar: estado, plan de producción y prompts para Kiro

Revisor: Claude Code. 2026-10-30. Solo revisión y coordinación: ningún archivo de `packages/`, `power/` ni `.kiro/` fue tocado (AGENTS.md, regla 1).

## 1. Estado verificado

| Qué | Resultado | Cómo se comprobó |
| --- | --- | --- |
| Pruebas | 29/29 en verde | `npm test` (Node 24.14.1) |
| Autoescaneo | 72/100 (workflows 0, powers 4, mcp 6, specs 6, traceability 6) | `node packages/cli/bin.mjs scan .` |
| CLI desde el clon | Funciona | Igual que arriba |
| **CLI instalada como paquete** | **Falla** con `ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING` | `npm pack` → `npm i ./kiro-radar-0.1.0.tgz` en una carpeta aparte → `npx kiro-radar scan` |
| GitHub | Público, `main` al día con `origin/main`. Sin licencia, topics, homepage ni releases | `gh repo view` |
| npm | El nombre `kiro-radar` está libre | `npm view kiro-radar` → 404 |
| Árbol local | `packages/cli/bin.mjs` y `packages/mcp/server.mjs` salen como modificados, pero solo por finales de línea (CRLF/LF). `git diff --ignore-cr-at-eol` no muestra cambios | `git diff --ignore-cr-at-eol --stat` |

### Defectos abiertos

| Id | Gravedad | Defecto |
| --- | --- | --- |
| **P1** | **bloqueante** | `bin.mjs` y `server.mjs` importan `.ts` directamente. Node no quita tipos dentro de `node_modules`, así que **fallan `npx kiro-radar` desde npm y el Power** (`npx -y -p github:HenryStark866/kiro-radar kiro-radar-mcp` también instala en `node_modules`). Solo funciona desde un clon. El video y el README prometen `npx kiro-radar` |
| P2 | alta | Al paquete no le falta nada, le sobra: el tarball lleva 105 archivos (`scripts/hooks`, `fixtures`, `docs`, `.kiro`…). Falta el campo `files` en `package.json` |
| P3 | alta | Sin `LICENSE`. Henry debe elegir la licencia (MIT es lo habitual). Sin ella nadie puede reutilizar el código legalmente |
| P4 | media | El README dice `git clone https://github.com/tu-usuario/kiro-radar` |
| M5 | alta (abierto) | La dimensión `powers` premia `package.json` (formato viejo) y recomienda "Agregar package.json y configuración al Power". El formato vigente es `plugin.json` + `skills/` + `mcp.json`. Se ve en el video y en la portada del portafolio |
| M6 | baja (abierto) | `server.mjs` sale con `process.exit(0)` al cerrarse stdin aunque haya llamadas pendientes |
| P5 | baja | `MEMORY.md` → "Estado actual" sigue diciendo "Fase 2, WP-02" y `BOARD.md` marca WP-02 "en curso". Los dos están desactualizados |
| P6 | idea | workflows 0/10: el propio repo no tiene `.kiro/workflows/`. Es la jugada de +10 que el radar se sugiere a sí mismo |

Kiro llegó al límite mensual de créditos; el contador se reinicia el **2026-11-01**. Los prompts de abajo están ordenados para gastar pocos créditos.

## 2. Recomendación de producción

**Publicar en npm (`npx kiro-radar`) y crear un GitHub Release v0.1.0 con el video.** Una demo web estática queda para después.

| Opción | A favor | En contra | Veredicto |
| --- | --- | --- | --- |
| **npm** | Es lo que promete el producto: `npx kiro-radar scan` en cualquier repo. Además arregla el Power, que pasa a usar `npx -y kiro-radar-mcp` | Necesita P1 (compilar a JS) y P2. Crear la cuenta y el token de npm es una compuerta de Henry | **Sí, primero** |
| **GitHub Release** | Gratis, sin cuenta nueva. Deja la versión etiquetada, el tarball y el video demo como adjuntos. Sirve de "evidencia" para el reto | No resuelve `npx` por sí solo | **Sí, junto con npm** |
| Demo web estática | Se ve bien en el portafolio | Es WP-05 (dashboard) completo: más créditos de Kiro y otro despliegue. El escáner lee el disco, así que en web solo podría mostrar un reporte precalculado | **Después** (opcional) |

Orden: prompts K1 a K4 en Kiro → pruebas → Henry aprueba → `npm publish` → `gh release create v0.1.0` con el `.tgz` y el video adjuntos → topics, homepage y licencia en GitHub. **Nada de esto se ha hecho**: cada paso de publicación necesita la aprobación de Henry en el chat (AGENTS.md, regla 5).

## 3. Prompts para Kiro (copiar y pegar)

Ejecutar en orden, cada uno en la rama `wp/WP-10-release`, y correr `npm test` al final de cada uno.

### K1 — Paquete instalable (P1 + P2), bloqueante

```text
Lee AGENTS.md y MEMORY.md. Trabaja en la rama wp/WP-10-release.

Problema verificado: al instalar kiro-radar como paquete (npm pack + npm i del .tgz),
`npx kiro-radar scan` falla con ERR_UNSUPPORTED_NODE_MODULES_TYPE_STRIPPING, porque
packages/cli/bin.mjs y packages/mcp/server.mjs importan archivos .ts y Node no quita
tipos dentro de node_modules. También afecta al Power (npx -p github:...).

Tarea:
1. Agrega un paso de compilación con `tsc` (devDependency typescript) que emita JS a
   dist/ desde packages/core/src y packages/cli/render.ts. Script "build" en package.json
   y "prepack": "npm run build".
2. Haz que bin.mjs y server.mjs importen desde dist/ (JS), no desde .ts.
3. Agrega "files" a package.json para publicar solo: dist/, packages/cli/bin.mjs,
   packages/mcp/server.mjs, README.md, LICENSE (si existe).
4. Agrega una prueba e2e que haga `npm pack`, instale el .tgz en una carpeta temporal
   y ejecute `npx kiro-radar scan fixtures/excellent --json` y la herramienta
   tools/list del MCP desde el paquete instalado. Debe pasar en Windows.
5. No cambies el contrato de packages/core/src/types.ts ni el puntaje.
Commit: [kiro:radar-release/1] build to dist and publishable package
```

### K2 — Formato vigente de Powers (M5) y salida limpia del MCP (M6)

```text
Lee docs/reviews/WP-04-06-2026-10-30.md, hallazgos M5 y M6. Rama wp/WP-10-release.

M5: en packages/core/src/dimensions.ts la dimensión powers premia package.json y sugiere
"Agregar package.json y configuración al Power". El formato vigente de Kiro Powers es
plugin.json + skills/ + mcp.json. Puntúa: plugin.json válido con name y description,
skills/ con al menos un SKILL.md válido (name igual a la carpeta, description real),
mcp.json válido, README con contenido. Sugerencias en español con ese formato.
Actualiza fixtures/excellent/power y las pruebas. Ningún archivo nuevo en power/
existe solo para subir puntos.

M6: packages/mcp/server.mjs sale con process.exit(0) al cerrarse stdin aunque haya
tools/call pendientes. Espera a que terminen antes de salir; agrega una prueba.

Cuando K1 esté hecho, cambia power/kiro-radar/mcp.json a
{"command":"npx","args":["-y","kiro-radar-mcp"]}.
Commit: [kiro:radar-release/2] current Powers format and graceful MCP exit
```

### K3 — README y metadatos de publicación (P4 + P3)

```text
Rama wp/WP-10-release. Solo README.md y package.json.
1. Corrige el clon: https://github.com/HenryStark866/kiro-radar (hoy dice tu-usuario).
2. Sección "Instalación" con dos caminos: `npx kiro-radar scan .` (cuando esté en npm)
   y desde el clon.
3. package.json: "repository", "homepage", "bugs", "keywords"
   (kiro, mcp, cli, ai, spec-driven), "author": "Henry Taborda".
4. Línea de créditos: hecho para el reto abierto de Kiro del stand de AWS User Group
   Medellín en Break the Code (N-iX + AWS). Mantén el aviso de proyecto no oficial.
5. La licencia la decide Henry: no crees LICENSE ni el campo "license" hasta que
   MEMORY.md registre su decisión.
Commit: [kiro:radar-release/3] README and package metadata for release
```

### K4 — Workflow propio (P6, +10 puntos legítimos), opcional

```text
Rama wp/WP-10-release. Crea .kiro/workflows/review.workflow.json: un workflow real que
este repo use para revisar un WP. Un nodo parallel que corra `npm test` y el
autoescaneo `node packages/cli/bin.mjs scan . --json`, y un nodo repeat que reintente
hasta 2 veces si fallan. Debe servir de verdad, no existir solo para puntuar.
Documéntalo en docs/TOOLS-MATRIX.md.
Commit: [kiro:radar-release/4] review workflow
```

Después de K1–K4: el integrador actualiza `BOARD.md` y el "Estado actual" de `MEMORY.md` (P5). Luego vienen las compuertas de Henry: elegir licencia, crear la cuenta de npm, `npm publish`, el GitHub Release y los topics.

## 4. Portafolio CDH Maker

- Rama `feat/kiro-radar` en el repo del portafolio, worktree `C:\dev\wt-cdh-kiroradar`, commit `9b02ea3`, hecha sobre `origin/main` (3ca1fe0). **Sin push ni deploy.**
- Agrega una ficha `#proyecto-kiro-radar` en Proyectos, con el mismo patrón que Refricom: portada (el autoescaneo 72/100) y botón de play que abre el visor con el video. Debajo van la descripción, el stack, la mención del reto en Break the Code con AWS User Group Medellín y el enlace a GitHub.
- `proyectos.js` acepta `data-repo` y en el visor sale el botón "Ver el código en GitHub ↗". Textos en los 10 idiomas. Kiro Radar también entra al JSON-LD `#proyectos` y a `llms.txt`.
- Video: `kiro-radar-demo.mp4` (2:21, 2,2 MB, con `faststart`). Cuando esté la versión con voz de Gemini, se reemplaza `public/media/kiro-radar-demo.mp4` con el mismo nombre (y se ajusta `2:21` si cambia la duración).
- Ojo: `.github/workflows/publicar.yml` despliega `main` cada día a las 6:00 (hora de Bogotá). Fusionar a `main` equivale a publicar.

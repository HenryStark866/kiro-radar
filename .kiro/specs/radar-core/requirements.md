# Requisitos — radar-core

## Visión general

**Quién usa:** Quien mantiene un repositorio con Kiro y quiere medir su uso.

**Qué hace:** Función de biblioteca `scanRepository(ruta)` que lee un repositorio como texto y calcula un puntaje de 0 a 10 en 10 dimensiones, con evidencia y acción sugerida.

**Qué no hace:** CLI, MCP, red, dashboard, ejecución de código del repositorio escaneado.

**Alcance:** Solo `packages/core`. Salida determinista, compatible con Windows.

---

## Historias de usuario

### 1. Escaneo básico

**Como** quien mantiene un repositorio con Kiro  
**Quiero** que `scanRepository(ruta)` lea el repositorio como texto puro y entregue un JSON con puntajes de 10 dimensiones  
**Para** identificar qué dimensiones necesita mejorar

**WHEN** el escaneo se ejecuta sobre una ruta válida  
**THE SYSTEM SHALL** leer solo archivos de texto del repositorio, sin ejecutar código ni seguir enlaces simbólicos  
**THE SYSTEM SHALL** tolerar archivos ausentes, vacíos, mal formados y muy grandes sin fallar  
**THE SYSTEM SHALL** devolver un JSON determinista: misma entrada, mismo resultado  
**THE SYSTEM SHALL** incluir `schemaVersion` en el reporte

---

### 2. Dimensiones

**Como** quien quiere entender cómo se puntúa su configuración  
**Quiero** que cada dimensión tenga su propio criterio, puntaje, evidencia y acción sugerida  
**Para** saber exactamente qué cambiar

#### 2.1 specs

**WHEN** la dimensión `specs` se calcula  
**THE SYSTEM SHALL** examinar `.kiro/specs/`  
**THE SYSTEM SHALL** dar 0 sin ningún spec con contenido real  
**THE SYSTEM SHALL** dar ≥6 un spec con requirements.md, design.md y tasks.md, todos con contenido real, y al menos 3 líneas WHEN con SHALL  
**THE SYSTEM SHALL** dar 10 lo anterior en 2 o más specs, y al menos una tarea marcada [x]  
**THE SYSTEM SHALL** devolver evidencia: lista de specs encontrados y su contenido relevante  
**THE SYSTEM SHALL** sugerir acción: crear o completar specs faltantes

#### 2.2 steering

**WHEN** la dimensión `steering` se calcula  
**THE SYSTEM SHALL** examinar `.kiro/steering/`  
**THE SYSTEM SHALL** dar 0 sin archivos con contenido real  
**THE SYSTEM SHALL** dar ≥6 product.md, tech.md y structure.md con contenido real y 2 modos de inclusion  
**THE SYSTEM SHALL** dar 10 los tres mas los 4 modos always, auto, fileMatch y manual  
**THE SYSTEM SHALL** devolver evidencia: lista de archivos y su atributo `inclusion`  
**THE SYSTEM SHALL** sugerir acción: crear o completar archivos fundacionales

#### 2.3 hooks

**WHEN** la dimensión `hooks` se calcula  
**THE SYSTEM SHALL** examinar `.kiro/hooks/`  
**THE SYSTEM SHALL** dar 0 sin JSON v1 válido  
**THE SYSTEM SHALL** dar ≥6 2 o más triggers distintos y al menos uno bloqueante  
**THE SYSTEM SHALL** dar 10 4 o más triggers distintos, 2 o más hooks bloqueantes y todos con action.command o action.prompt  
**THE SYSTEM SHALL** devolver evidencia: lista de triggers y sus tipos (bloqueante/no bloqueante)  
**THE SYSTEM SHALL** sugerir acción: agregar hooks faltantes

#### 2.4 skills

**WHEN** la dimensión `skills` se calcula  
**THE SYSTEM SHALL** examinar `.kiro/skills/*/SKILL.md`  
**THE SYSTEM SHALL** dar 0 sin SKILL.md con contenido real  
**THE SYSTEM SHALL** dar ≥6 una skill con name igual a la carpeta y description de al menos 40 caracteres  
**THE SYSTEM SHALL** dar 10 3 o más skills así y al menos una con scripts/, references/ o assets/  
**THE SYSTEM SHALL** devolver evidencia: lista de skills con sus atributos verificados  
**THE SYSTEM SHALL** sugerir acción: corregir `name` o completar descripción

#### 2.5 powers

**WHEN** la dimensión `powers` se calcula  
**THE SYSTEM SHALL** examinar `power/*/plugin.json` o POWER.md  
**THE SYSTEM SHALL** dar 0 sin manifiesto  
**THE SYSTEM SHALL** dar ≥6 un plugin.json con name, version, description, author y keywords, o un POWER.md con contenido real  
**THE SYSTEM SHALL** dar 10 plugin.json valido con 3 o más keywords y ademas skills/ con SKILL.md o mcp.json  
**THE SYSTEM SHALL** devolver evidencia: lista de powers y su validación  
**THE SYSTEM SHALL** sugerir acción: crear o completar powers

#### 2.6 mcp

**WHEN** la dimensión `mcp` se calcula  
**THE SYSTEM SHALL** examinar `.kiro/settings/mcp.json`  
**THE SYSTEM SHALL** dar 0 sin mcp.json válido  
**THE SYSTEM SHALL** dar ≥6 1 o más servidores en mcpServers  
**THE SYSTEM SHALL** dar 10 2 o más servidores o uno con env usando variables ${...}, y cero secretos literales (cualquier secreto literal limita a 3)  
**THE SYSTEM SHALL** devolver evidencia: lista de herramientas MCP y su validación  
**THE SYSTEM SHALL** sugerir acción: agregar herramientas o variables

#### 2.7 agents

**WHEN** la dimensión `agents` se calcula  
**THE SYSTEM SHALL** examinar `.kiro/agents/`  
**THE SYSTEM SHALL** dar 0 sin perfiles validos  
**THE SYSTEM SHALL** dar ≥6 1 o más perfiles con tools sin comodin y resources  
**THE SYSTEM SHALL** dar 10 3 o más perfiles asi y con permissions.rules  
**THE SYSTEM SHALL** devolver evidencia: lista de agentes y sus recursos  
**THE SYSTEM SHALL** sugerir acción: crear o completar agentes

#### 2.8 workflows

**WHEN** la dimensión `workflows` se calcula  
**THE SYSTEM SHALL** examinar `.kiro/workflows/`  
**THE SYSTEM SHALL** dar 0 sin recetas validas  
**THE SYSTEM SHALL** dar ≥6 una receta con 2 o más nodos  
**THE SYSTEM SHALL** dar 10 una receta con repeat y parallel  
**THE SYSTEM SHALL** devolver evidencia: lista de workflows y sus nodos  
**THE SYSTEM SHALL** sugerir acción: crear o completar workflows

#### 2.9 protection

**WHEN** la dimensión `protection` se calcula  
**THE SYSTEM SHALL** examinar `.kiroignore`, permisos y hooks de guardia  
**THE SYSTEM SHALL** dar 0 sin .kiroignore ni hook bloqueante  
**THE SYSTEM SHALL** dar ≥6 .kiroignore con contenido y un hook bloqueante  
**THE SYSTEM SHALL** dar 10 lo anterior, 2 o más hooks bloqueantes y al menos un agente con permissions.rules  
**THE SYSTEM SHALL** devolver evidencia: lista de archivos de protección  
**THE SYSTEM SHALL** sugerir acción: agregar `.kiroignore` o hooks

#### 2.10 traceability

**WHEN** la dimensión `traceability` se calcula  
**THE SYSTEM SHALL** examinar `tests/` y docs/evidence/  
**THE SYSTEM SHALL** dar 0 sin tests  
**THE SYSTEM SHALL** dar ≥6 tests presentes y un archivo de evidencia con al menos 1 línea  
**THE SYSTEM SHALL** dar 10 lo anterior, una carpeta tests/e2e con tests y tareas referenciadas en la evidencia  
**THE SYSTEM SHALL** devolver evidencia: lista de tests y evidencia  
**THE SYSTEM SHALL** sugerir acción: agregar tests o evidencia

---

### 3. Repositorio trampa

**Como** quien valida el scanner  
**Quiero** que un repositorio con todos los archivos esperados pero vacíos o con plantilla reciba un puntaje muy bajo  
**Para** garantizar que el scanner rechaza archivos sin contenido real

**WHEN** el repositorio contiene todos los archivos esperados pero vacíos o con plantilla  
**THE SYSTEM SHALL** dar `totalScore` menor o igual a 20  
**THE SYSTEM SHALL** ninguna dimensión llegue por encima de 3  
**THE SYSTEM SHALL** los archivos vacíos o solo título sumen 0 puntos

---

### 4. Reporte JSON

**como** quien quiere integrar el puntaje en otras herramientas  
**Quiero** que el reporte tenga un schema estable y autoexplicativo  
**Para** poder parsearlo sin ambigüedad

**WHEN** el reporte se genera  
**THE SYSTEM SHALL** incluir `schemaVersion` (ej. `"1.0.0"`)  
**THE SYSTEM SHALL** incluir `repoName` (nombre de la carpeta, no ruta absoluta)  
**THE SYSTEM SHALL** incluir `totalScore` (suma de 10 dimensiones, 0–100)  
**THE SYSTEM SHALL** incluir `dimensions` como array con cada objeto:  
- `name` (string, nombre de la dimensión en inglés)  
- `score` (entero, 0–10)  
- `evidence` (array de strings, hallazgos concretos)  
- `nextAction` (string, acción sugerida)  
**THE SYSTEM SHALL** incluir `warnings` si se encontraron archivos muy grandes, problemas de parseo o enlaces simbólicos  
**THE SYSTEM SHALL** incluir `error` solo si falló el escaneo (sin salirse del repositorio)

---

### 5. Salida determinista

**Como** quien quiere comparar puntajes en el tiempo  
**Quiero** que el mismo repositorio siempre dé el mismo JSON  
**Para** detectar mejoras reales, no variaciones del sistema

**WHEN** se escanea el mismo repositorio dos veces  
**THE SYSTEM SHALL** producir JSON idéntico byte a byte (sin excepción de timestamp)  
**THE SYSTEM SHALL** procesar dimensiones en orden alfabético  
**THE SYSTEM SHALL** ordenar listas de evidencia alfabéticamente  
**THE SYSTEM SHALL** ignorar el orden de lectura del filesystem

---

### 6. Tolerancia a errores

**Como** quien escanea repositorios en desarrollo  
**Quiero** que el scanner tolere archivos ausentes, vacíos, mal formados y muy grandes  
**Para** que un solo defecto no bloquee todo el reporte

**WHEN** falta un archivo esperado  
**THE SYSTEM SHALL** asignar 0 a la dimensión correspondiente y continuar  

**WHEN** un archivo es solo título o plantilla  
**THE SYSTEM SHALL** asignar ≤5 a la dimensión y continuar  

**WHEN** un archivo JSON está mal formado  
**THE SYSTEM SHALL** asignar 0 a ese archivo, registrar warning y continuar; los demás archivos de la dimensión sí cuentan  

**WHEN** un archivo es muy grande (> 1 MiB)  
**THE SYSTEM SHALL** solo leer los primeros 1 MiB y continuar, registrando warning  

**WHEN** se encuentra un enlace simbólico  
**THE SYSTEM SHALL** no seguirlo, registrar warning y continuar  

**WHEN** ocurre un error fatal  
**THE SYSTEM SHALL** incluir `error` en el reporte, no lanzar exception  
**THE SYSTEM SHALL** nunca salirse del repositorio raíz, por enlaces simbólicos  

---

### 7. Criterios de puntaje

**Como** quien define los umbrales  
**Quiero** que cada umbral sea verificable con pruebas concretas  
**Para** evitar subjetividad

**Umbral 0:**  
- Archivo ausente o solo título (sin contenido real).  
- Contenido real: al menos 200 caracteres no vacíos fuera de títulos y frontmatter.

**Umbral ≥6:**  
- Archivos con contenido real en cantidad suficiente para validar la dimensión.  
- Criterios específicos por dimensión (ver sección 2).

**Umbral 10:**  
- Excepcional: contenido real sobresaliente, pruebas verificables y documentación completa.  
- Ninguna dimensión llega a 10 solo por existencia de archivos.

**THE SYSTEM SHALL** verificar cada umbral con un test, con conteos concretos.

**Entre umbrales, el puntaje se calcula proporcionalmente con enteros.**

---

### 8. Compatibilidad con Windows

**Como** quien usa Windows con rutas con espacios y acentos  
**Quiero** que el scanner maneje correctamente las rutas  
**Para** no tener errores de encoding o path

**WHEN** la ruta contiene espacios o acentos  
**THE SYSTEM SHALL** leer los archivos correctamente  
**THE SYSTEM SHALL** no truncar rutas ni cambiar encoding

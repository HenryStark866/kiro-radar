# Kiro Radar

Escanea un repositorio y puntúa cómo usa Kiro en **10 dimensiones** (0–100).

> Aviso: proyecto de la comunidad, no oficial de Kiro ni de AWS.

## La idea ingeniosa

Cada dimensión no solo da un número — te dice **la siguiente jugada de Kiro que más puntos sube**:

```
⚡ PRÓXIMAS JUGADAS
 1. [+8pts] Crear hook con PreToolUse bloqueante
 2. [+6pts] Agregar spec completo con EARS y tasks.md
 3. [+4pts] Crear mcp.json con 2+ servidores y env ${VAR}
```

El Report también incluye `topMoves`: las 3 jugadas con mayor ganancia en todo el repo.

## Instalación

```bash
git clone https://github.com/tu-usuario/kiro-radar
cd kiro-radar
npm install
```

## Uso

```bash
# Escanear el directorio actual
npx kiro-radar scan

# Escanear una ruta específica
npx kiro-radar scan /ruta/a/mi-repo

# Salida JSON
npx kiro-radar scan --json

# Generar insignia SVG
npx kiro-radar scan --badge badge.svg
```

Código de salida `0` = OK, `2` = ruta no existe.

## Las 10 dimensiones

| Dimensión | Qué mide |
|-----------|----------|
| `specs` | Archivos `requirements.md`, `design.md`, `tasks.md` con requisitos EARS y tareas marcadas |
| `steering` | Archivos de contexto en `.kiro/steering/` con modos de `inclusion` variados |
| `hooks` | Hooks JSON v1 con triggers bloqueantes (`PreToolUse`, `UserPromptSubmit`, `PreTaskExec`) |
| `skills` | Skills en `.kiro/skills/*/SKILL.md` con `name` y `description` reales |
| `mcp` | Servidores en `.kiro/settings/mcp.json` con variables `${VAR}` en env |
| `powers` | Power instalable en `power/` con README y package.json |
| `agents` | Perfiles en `.kiro/agents/` con `tools` sin comodín y `permissions.rules` |
| `workflows` | Recetas en `.kiro/workflows/` con nodos `repeat` y `parallel` |
| `protection` | `.kiroignore` con contenido y hooks bloqueantes activos |
| `traceability` | Tests presentes, `docs/evidence/` con referencias `[kiro:<spec>]`, tests e2e |

## Cómo se probó

- **Runner**: `node --test` (Node 22+, sin dependencias externas)
- **Propiedades**: `fast-check` seed 42, 50 corridas — determinismo, suma exacta, rango 0-10, trampa, seguridad de rutas
- **Fixtures**:
  - `fixtures/excellent` → debe puntuar ≥ 80
  - `fixtures/minimal` → debe puntuar ≥ 20 y < 80
  - `fixtures/trap` → debe puntuar ≤ 20 y ninguna dimensión ≥ 4
- **Autoescaneo**: el repo se escanea a sí mismo en la demo

```bash
npm test
npx kiro-radar scan .
```

## Generado por Kiro

Todo el código fuente, specs, hooks, skills y configuración de este proyecto fue generado por **Kiro** (sesión principal + subagentes). El humano aprobó compuertas y registró decisiones en `MEMORY.md`.

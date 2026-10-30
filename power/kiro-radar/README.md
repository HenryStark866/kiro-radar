# Kiro Radar Power

Mide qué tan bien un repositorio usa Kiro en **10 dimensiones** (0-100) y te dice la siguiente jugada de mayor impacto — directamente desde el chat de Kiro.

> Proyecto de la comunidad, no oficial de Kiro ni de AWS.

## Qué hace

Este Power instala en Kiro dos herramientas MCP:

| Herramienta | Qué hace |
|---|---|
| `scan_repository` | Escanea un repo y devuelve el puntaje total + desglose por dimensión |
| `next_moves` | Devuelve las 3 próximas jugadas con mayor ganancia de puntos |

También incluye la skill `kiro-radar-coach` que sabe cómo interpretar los resultados y guiar la mejora paso a paso.

## Cómo instalarlo en Kiro

1. Clona o descarga este repositorio.
2. En Kiro, ve a **Settings → Powers → Install local Power**.
3. Apunta a la carpeta `power/kiro-radar/`.
4. Kiro registrará el servidor MCP automáticamente.

O copia el contenido de `mcp.json` a tu `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "kiro-radar": {
      "command": "npx",
      "args": ["-y", "-p", "github:HenryStark866/kiro-radar", "kiro-radar-mcp"]
    }
  }
}
```

## Requisitos

- Node.js 22 o superior
- Kiro instalado (cualquier plan)

## Herramientas MCP en detalle

### `scan_repository`

Escanea un repositorio y devuelve:
- `totalScore`: puntuación total de 0 a 100
- Desglose por las 10 dimensiones: `specs`, `steering`, `hooks`, `skills`, `mcp`, `powers`, `agents`, `workflows`, `protection`, `traceability`
- El Report completo en `structuredContent`

**Ejemplo de uso en el chat:**

```
Escanea este repositorio y dime cómo mejorar mi puntaje Kiro.
```

Kiro usará `scan_repository` con `path: "."` y te mostrará el diagnóstico.

### `next_moves`

Analiza el repositorio y devuelve las **3 acciones con mayor ganancia** de puntos:

```
⚡ PRÓXIMAS JUGADAS (mayor ganancia primero):
  1. [+8pts] [specs] Agregar spec completo con requirements.md, design.md y tasks.md con EARS
  2. [+6pts] [hooks] Crear hook con PreToolUse bloqueante
  3. [+4pts] [mcp]   Agregar env con variables ${VAR}
```

## Skill incluida: `kiro-radar-coach`

Enseña a Kiro cómo interpretar los resultados y guiar la mejora:
- Flujo de diagnóstico → acción → verificación
- Ejemplos concretos para cada dimensión
- Regla de oro: **presencia no es calidad**

## Las 10 dimensiones

| Dimensión | Puntaje máximo | Qué necesita para el máximo |
|---|---|---|
| `specs` | 10 | 2+ specs completos con EARS y tarea marcada [x] |
| `steering` | 10 | 3 archivos core + 4 modos de inclusion |
| `hooks` | 10 | 4+ triggers, 2+ bloqueantes con action |
| `skills` | 10 | 3+ SKILL.md con scripts/ o assets/ |
| `mcp` | 10 | 1+ servidor en `.kiro/settings/mcp.json`, sin secretos literales |
| `powers` | 10 | README.md + package.json + 3+ archivos |
| `agents` | 10 | 3+ agentes con tools sin * y permissions.rules |
| `workflows` | 10 | Workflow con nodos repeat y parallel |
| `protection` | 10 | .kiroignore + 2+ hooks bloqueantes + agente con rules |
| `traceability` | 10 | Tests + docs/evidence/ con [kiro:] + tests e2e |

## Autoescaneo

Este repositorio se escanea a sí mismo como demo:

```bash
npx kiro-radar scan .
```

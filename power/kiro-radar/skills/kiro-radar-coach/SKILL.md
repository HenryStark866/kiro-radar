---
name: kiro-radar-coach
description: Enseña a usar las herramientas MCP scan_repository y next_moves para medir y mejorar el puntaje Kiro de un repositorio paso a paso, interpretando los resultados y priorizando las acciones con mayor ganancia.
---

# kiro-radar-coach

Eres un coach de Kiro Radar. Tu misión es guiar al usuario para que su repositorio obtenga el mayor puntaje posible en las 10 dimensiones de Kiro, usando las herramientas MCP `scan_repository` y `next_moves`.

## Flujo recomendado

### Paso 1 — Escanear el repositorio

Usa `scan_repository` para obtener el diagnóstico inicial:

```
Herramienta: scan_repository
Argumentos: { "path": "." }
```

Interpreta el resultado:
- **totalScore < 20**: Repositorio sin configuración Kiro. Empezar desde cero.
- **totalScore 20-59**: Configuración básica. Hay dimensiones vacías con alta ganancia.
- **totalScore 60-79**: Buen uso. Optimizar 2-3 dimensiones clave.
- **totalScore >= 80**: Excelente. Mantener y refinar.

### Paso 2 — Obtener las próximas jugadas

Usa `next_moves` para ver las 3 acciones con mayor impacto:

```
Herramienta: next_moves
Argumentos: { "path": "." }
```

El resultado te muestra, ordenado de mayor a menor ganancia:
```
1. [+8pts] [specs] Agregar spec completo con requirements.md, design.md y tasks.md con EARS
2. [+6pts] [hooks] Crear hook con PreToolUse bloqueante
3. [+4pts] [mcp]   Agregar env con variables ${VAR}
```

### Paso 3 — Implementar en orden de ganancia

Toma la jugada #1 y guía al usuario a implementarla. Ejemplos por dimensión:

#### specs (requisitos EARS)
Crea `.kiro/specs/<nombre>/requirements.md` con al menos 3 requisitos WHEN … SHALL:
```markdown
WHEN el usuario ejecuta el scanner SHALL devolver totalScore en 0-100.
```

#### hooks (ganchos de Kiro)
Crea `.kiro/hooks/scope-guard.json`:
```json
{
  "version": "v1",
  "hooks": [
    {
      "name": "scope-guard",
      "trigger": "PreToolUse",
      "action": { "command": "scripts/scope-guard.sh" }
    }
  ]
}
```

#### mcp (servidor MCP)
Crea `.kiro/settings/mcp.json` con 2 servidores y variables `${VAR}` en `env`.

#### steering (contexto de Kiro)
Crea `.kiro/steering/product.md`, `tech.md` y `structure.md` con frontmatter `inclusion: always`.

#### skills (habilidades)
Crea `.kiro/skills/<nombre>/SKILL.md` con:
```yaml
---
name: <nombre>
description: Descripción de al menos 40 caracteres que explique qué hace la skill.
---
```

#### agents (agentes)
Crea `.kiro/agents/<nombre>.json` con `tools` (sin `*`) y `resources`.

#### workflows (flujos)
Crea `.kiro/workflows/<nombre>.json` con 2+ nodos, `repeat` y `parallel`.

#### powers (extensiones instalables)
Crea `power/<nombre>/plugin.json` y `README.md` con descripción real.

#### traceability (trazabilidad)
Agrega archivos de test y `docs/evidence/` con referencias `[kiro:<spec>]`.

### Paso 4 — Volver a escanear

Después de cada mejora, vuelve a ejecutar `scan_repository` para confirmar que el puntaje subió.

## Regla de oro

**Presencia no es calidad.** Un archivo vacío no da puntos. Kiro Radar mide uso real y significativo.

## Ejemplo de sesión completa

1. `scan_repository {"path": "."}` → totalScore: 42
2. `next_moves {"path": "."}` → Top jugada: specs [+8pts]
3. Crear `.kiro/specs/mi-feature/requirements.md` con EARS
4. `scan_repository {"path": "."}` → totalScore: 50 ✓
5. `next_moves {"path": "."}` → Top jugada: hooks [+6pts]
6. ... continuar hasta >= 80

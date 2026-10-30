---
name: evidence-writer
description: Cómo documentar una herramienta de Kiro en docs/TOOLS-MATRIX.md con prueba verificable.
inclusion: manual
---

# Evidence Writer Skill

Guía para documentar el uso de una herramienta de Kiro y verificar que funciona.

## Pasos

1. **Identificar la herramienta**
   - Nombre exacto (ej. `createHook`, `code`, `read_file`)
   - Trigger que usó (ej. `PostFileCreate`, `UserPromptSubmit`)

2. **Añadir fila a TOOLS-MATRIX.md**
   - Columnas: `Tool`, `Qué hace`, `Fixture`, `Prueba`, `Hecho`
   - Fixture: nombre del archivo creado por la herramienta
   - Prueba: comando o instrucción para verificar
   - Hecho: `✓` solo tras correr la prueba

3. **Verificación obligatoria**
   - Correr la prueba indicada en la fila
   - Si falla, dejar la celda vacía y anotar hallazgo en `docs/reviews/`

## Ejemplo de fila

| Tool | Qué hace | Fixture | Prueba | Hecho |
|------|----------|---------|--------|-------|
| `createHook` | Crea un hook JSON en `.kiro/hooks/` | `.kiro/hooks/test-on-save.json` | Verificar archivo existe y es JSON válido | ✓ |

## Formato de prueba

- Archivos `.json`: usar `node -e "require('./<file>')" 2>&1 || echo "FAIL"`
- Archivos `.ts`: `npm test -- --run <path>`
- Archivos `.md`: comprobar que tiene frontmatter con `name` y `description`

## Regla de oro

Nunca marcar `Hecho` sin haber corrido la prueba. Si la prueba no corre, dejar la celda vacía.
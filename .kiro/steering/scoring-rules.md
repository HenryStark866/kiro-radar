---
inclusion: auto
name: scoring-rules
description: Explica por qué presencia no es calidad en Kiro Radar.
---

# Reglas de Puntaje

## Principio central: presencia no es calidad

Un archivo vacío o con solo plantilla **no da puntos**. Kiro Radar mide **uso significativo**, no simple existencia.

## Criterios por dimensión

Cada dimensión tiene un umbral de calidad:

| Criterio | Puntaje |
|----------|---------|
| Ausente | 0 |
| Vacío o solo título | 0 |
| Contenido parcial | 1-5 |
| Completo y válido | 6-9 |
| Sobresaliente | 10 |

## Ejemplos

### Specs (bueno)
- Archivos `spec.md` y `tasks.md` con requisitos EARS.
- Decisiones registradas con fecha y aprobante.
- Tests con fixtures bueno, malo y trampa.

### Specs (mal)
- Solo título en `spec.md`.
- Sin `tasks.md`.
- Sin decisiones registradas.

### Hooks (bueno)
- Varios triggers, al menos uno bloqueante (`PreToolUse`, `UserPromptSubmit`).
- Archivo JSON válido sin errores.

### Hooks (mal)
- Solo uno o dos triggers.
- Archivo sin errores de formato pero sin funcionalidad real.

## Prueba final

El repo trampa debe puntuar **bajo** (< 15/100) para validar que el scanner rechaza archivos vacíos.
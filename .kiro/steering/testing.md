---
inclusion: fileMatch
fileMatchPattern: "**/*.test.ts"
---

# Testing Standards

Esta guía se aplica a todos los tests en el proyecto.

## Estructura mínima

Cada test debe:
- Tener un fixture bueno (puntaje máximo).
- Tener un fixture malo (puntaje bajo, no cero).
- Tener un fixture trampa (repo vacío, puntaje cero).

## Fixture trampa

Ubicado en `fixtures/trampa/`. Debe tener:
- `.kiroignore` presente.
- Directorios `.kiro/` vacíos o inexistentes.
- Ningún spec válido.

## Comandos de prueba

```bash
npm test -- --run <path>
```

Nunca usar watch mode. Si falla, dejar evidencia en `docs/reviews/`.
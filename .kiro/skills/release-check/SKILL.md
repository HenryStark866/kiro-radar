---
name: release-check
description: Lista previa a publicar Kiro Radar: archivos obligatorios y matriz validada.
inclusion: manual
---

# Release Check Skill

Lista previa a publicar la versión inicial de Kiro Radar.

## Archivos obligatorios

1. `README.md`: debe tener título, descripción, avisos de comunidad y enlace al repo.
2. `docs/evidence/PROVENANCE.md`: debe listar todos los specs y herramientas usadas con fecha.
3. `docs/TOOLS-MATRIX.md`: debe tener todas las filas con `Hecho` verificado.

## Validación automática

Ejecutar el script:

```bash
node .kiro/skills/release-check/scripts/check-release.js
```

Este script verifica sin red:

- `README.md` existe y no está vacío.
- `docs/evidence/PROVENANCE.md` existe y tiene contenido.
- `docs/TOOLS-MATRIX.md` no tiene filas con `Hecho` sin `Prueba`.

## Regla de oro

Si el script falla, corregir antes de publicar. No usar `--no-verify`.

## Salida esperada

```
✓ README.md presente
✓ docs/evidence/PROVENANCE.md presente
✓ docs/TOOLS-MATRIX.md sin filas vacías
Release check passed.
```

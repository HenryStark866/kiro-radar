---
name: radar-dimension
description: Cómo agregar o cambiar una dimensión de puntaje en Kiro Radar, con fixture bueno, fixture malo y tests.
inclusion: manual
---

# Radar Dimension Skill

Esta skill guía cómo definir o modificar una dimensión de puntaje en el núcleo de Kiro Radar.

## Estructura de una dimensión

Cada dimensión vive en `packages/core/src/dimensions/<nombre>.ts` y exporta:

```typescript
export interface Dimension {
  name: string
  description: string
  scanner: (repoRoot: string) => ScoredEvidence
}

interface ScoredEvidence {
  score: number
  evidence: EvidenceItem[]
}

interface EvidenceItem {
  path: string
  status: 'present' | 'empty' | 'missing' | 'partial'
  detail?: string
}
```

## Fixture bueno vs fixture malo

### Fixture bueno (10/10)
- Archivo existente con contenido real y válido.
- Evidencia detallada: ruta, longitud, formato correcto.
- Ejemplo: `.kiro/specs/radar-core/spec.md` con requisitos EARS, tareas y decisiones.

### Fixture malo (0/10)
- Archivo vacío o con solo comentarios.
- Evidencia marca `status: 'empty'`.
- Ejemplo: `.kiro/specs/trampa/spec.md` con solo título.

## Tests obligatorios

Cada dimensión debe tener `__tests__/<nombre>.test.ts` con:

- Caso de fixture bueno: score 10, evidencia llena.
- Caso de fixture malo: score bajo, evidencia marca `empty`.
- Caso de fixture trampa (repo vacío): score 0.

```typescript
import { describe, it, expect } from 'vitest'
import { scanDimension } from '../<nombre>'

describe('<nombre>', () => {
  it('fixture bueno puntúa 10', () => {
    const result = scanDimension('fixtures/excelente')
    expect(result.score).toBe(10)
  })

  it('fixture malo puntúa bajo', () => {
    const result = scanDimension('fixtures/mínimo')
    expect(result.score).toBeLessThan(5)
  })

  it('fixture trampa puntúa 0', () => {
    const result = scanDimension('fixtures/trampa')
    expect(result.score).toBe(0)
  })
})
```

## Prueba final

Ejecutar en la raíz del proyecto:

```bash
npm test -- --run packages/core/__tests__/<nombre>.test.ts
```

Todo debe pasar y el repo trampa debe puntuar bajo.
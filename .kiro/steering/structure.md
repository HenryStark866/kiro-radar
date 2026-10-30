---
inclusion: always
---

# Estructura

```text
packages/core/     motor de puntaje; types.ts es el contrato público
packages/cli/      comando kiro-radar
packages/mcp/      servidor MCP
packages/web/      dashboard estático
power/kiro-radar/  Power instalable
fixtures/          repositorios de prueba: excelente, mínimo y trampa
tests/e2e/         pruebas de punta a punta
scripts/hooks/     scripts de los hooks
docs/              plan, prompts, evidencia, revisiones y coordinación
```

- Los paquetes dependen de `core` solo a través de su contrato público. Ningún paquete importa de otro paquete hermano.
- Archivos en kebab-case. Tests junto al código como `*.test.ts`.
- Una dimensión por archivo en `packages/core/src/dimensions/`.

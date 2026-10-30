---
inclusion: manual
---

# Release Checklist

Referencia: #[[file:docs/PLAN.md]]

Antes de publicar, ejecutar:

```bash
node scripts/hooks/check-release.js
```

Verificar:
- [ ] 4 specs aprobados, con aprobación registrada en `MEMORY.md`
- [ ] `docs/TOOLS-MATRIX.md` completa, cada fila con prueba enlazada
- [ ] `kiro-radar scan .` corrido en vivo sobre este repositorio
- [ ] Repositorio trampa puntúa bajo
- [ ] Todo el código con commit `[kiro:...]`
- [ ] README, video de menos de 3 minutos y post publicados
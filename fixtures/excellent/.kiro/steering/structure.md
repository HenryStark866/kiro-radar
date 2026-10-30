---
inclusion: always
---

# Structure

```
packages/core/     scoring engine; types.ts is the public contract
packages/cli/      kiro-radar command
fixtures/          test repos: excellent, minimal, trap
```

- Packages depend on core only through its public contract.
- Files in kebab-case. Tests alongside code as *.test.ts.
- One dimension per class in dimensions.ts.

---
inclusion: always
---

# Technology

- TypeScript strict, ESM, Node 22+, type-stripping (no build step).
- Monorepo with npm workspaces: packages/core, packages/cli.
- Tests: node:test runner with fast-check for property-based testing.
- No runtime dependencies; devDependencies only: fast-check.
- No database, no backend, no telemetry.
- Windows compatible: handles paths with spaces and accents.
- MCP via official TypeScript SDK.

---
inclusion: fileMatch
globs: ["**/*.test.ts", "**/*.spec.ts"]
---

# Testing

Use node:test runner (Node 22+ built-in). Property tests with fast-check seed 42 numRuns 50.
Tests live alongside the code they test as *.test.ts files.
Every test file must pass before marking a task [x] in tasks.md.
Run: node --test packages/core/test/

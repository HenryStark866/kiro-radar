---
inclusion: auto
---

# Tasks — Kiro Radar Core

## Sprint 1

- [x] Create types.ts with DimensionName union and Report interface
- [x] Create safe-fs.ts with path traversal protection
- [x] Create dimensions.ts with all 10 scoring dimensions
- [x] Create index.ts with scanRepository function
- [x] Create CLI bin.mjs with --json and --badge options
- [x] Create fixtures: excellent, minimal, trap
- [ ] Create tests with node:test and fast-check properties

## Acceptance Criteria

WHEN running on fixtures/excellent SHALL score >= 80.
WHEN running on fixtures/minimal SHALL score >= 20 and < 80.
WHEN running on fixtures/trap SHALL score <= 20.
WHEN any dimension in trap fixture is checked SHALL be < 4.

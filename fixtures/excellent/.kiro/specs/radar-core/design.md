---
inclusion: auto
---

# Design — Kiro Radar Core

## Architecture

The core engine uses a layered architecture: safe-fs reads files, dimensions score them,
and the aggregator builds the final Report. Each dimension is independent and stateless.

WHEN scanRepository is called SHALL validate the root directory first.
WHEN safe-fs reads files SHALL skip node_modules and .git directories.
WHEN a dimension scores SHALL return evidence with relative paths only.
WHEN aggregator runs SHALL sort dimensions alphabetically by name code units.
WHEN totalScore is computed SHALL equal the exact sum of all 10 dimension scores.

## Dimension Design

Each dimension implements the Dimension interface with a score(ctx) method.
The context provides root, files, and a warnings accumulator.
Dimensions never execute code from the scanned repository.

## Security Model

The safe-fs layer prevents path traversal by comparing realpath with the root.
Symlinks pointing outside root are ignored with a warning.
Binary files are detected by null byte presence in first 4KB.
Files over 1 MiB are truncated at the limit and a warning is emitted.

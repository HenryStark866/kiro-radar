---
inclusion: always
---

# Requirements — Kiro Radar Core

## Overview

Kiro Radar scans a repository and scores how well it uses Kiro features.
It measures 10 dimensions with evidence-based scoring: presence is not quality.

## Functional Requirements

WHEN the user runs kiro-radar scan SHALL return a Report with 10 DimensionResults.
WHEN a spec file is empty SHALL assign score 0 to specs dimension.
WHEN .kiroignore is present and non-empty SHALL contribute to protection score.
WHEN mcp.json has 2+ servers SHALL score mcp at 8 or above.
WHEN all hooks are blocking SHALL increase protection and hooks scores.
WHEN tasks.md has a completed task [x] SHALL give full 10 points to specs.
WHEN safe-fs detects a symlink pointing outside root SHALL add a warning and skip it.
WHEN a file exceeds 1 MiB SHALL truncate it and add a warning.
WHEN a binary file is detected SHALL skip content analysis and add a warning.
WHEN scan runs twice on same input SHALL produce identical JSON output (determinism).

## Non-Functional Requirements

WHEN running on Windows with paths containing spaces SHALL work correctly.
WHEN node version is below 22.18 SHALL fail with a clear message.
WHEN totalScore is computed SHALL equal sum of all dimension scores exactly.

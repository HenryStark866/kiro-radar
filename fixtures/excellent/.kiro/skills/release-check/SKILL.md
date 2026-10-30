---
name: release-check
description: Pre-publish checklist for Kiro Radar including required files and validated matrix. Run this skill before any public release or demo submission.
---

# Release Check Skill

## Checklist

1. All tests pass: `node --test packages/core/test/`
2. kiro-radar scan . produces totalScore >= 80 on this repo.
3. fixtures/trap scores <= 20 and no dimension >= 4.
4. docs/TOOLS-MATRIX.md has entries for all used Kiro features.
5. No secrets in repository (run secret-guard hook manually).
6. AGENTS.md is present and up to date.

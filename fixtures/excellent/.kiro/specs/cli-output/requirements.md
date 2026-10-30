---
inclusion: auto
---

# Requirements — CLI Output

## Overview

The CLI renders a terminal dashboard with ANSI colors showing dimension bars and top moves.

WHEN kiro-radar scan is run SHALL display a bar for each dimension using █ and ░ chars.
WHEN --json flag is provided SHALL output valid JSON to stdout.
WHEN --badge file.svg is provided SHALL write an SVG badge to the specified file.
WHEN the root path does not exist SHALL exit with code 2.
WHEN totalScore >= 80 SHALL display verdict "Kiro nativo".
WHEN totalScore < 20 SHALL display verdict "Solo de nombre".
WHEN scan completes SHALL display top 3 next moves with point gains.

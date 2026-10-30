---
inclusion: auto
---

# Design — CLI Output

## Terminal Rendering

The render module uses ANSI escape codes for colors (no external dependency).
Each dimension shows a bar of 20 chars using filled (█) and empty (░) blocks.
The total shows a 30-char bar with score/100.

WHEN renderReport is called with a Report SHALL produce a string with ANSI codes.
WHEN renderBadge is called with a score SHALL return a valid SVG string.
WHEN output is piped to a file the ANSI codes SHALL still be present.

## Badge Format

The SVG badge follows the shields.io flat style: left label in grey, right value colored.
Color mapping: >= 80 green, >= 60 yellow, >= 40 orange, < 40 red.

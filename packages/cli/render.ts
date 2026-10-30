// packages/cli/render.ts
// Renderiza el reporte en la terminal con colores ANSI.

import type { Report, DimensionResult, NextMove } from "../core/src/types.ts";

// ── ANSI ──────────────────────────────────────────────────────────────────────
const R = "\x1b[0m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const WHITE = "\x1b[37m";
const BG_BLUE = "\x1b[44m";

function color(score: number): string {
  if (score >= 8) return GREEN;
  if (score >= 5) return YELLOW;
  return RED;
}

function bar(score: number, max = 10, width = 20): string {
  const filled = Math.round((score / max) * width);
  return GREEN + "█".repeat(filled) + DIM + "░".repeat(width - filled) + R;
}

function verdict(total: number): string {
  if (total >= 80) return GREEN + BOLD + "✦ Kiro nativo" + R;
  if (total >= 60) return CYAN + BOLD + "▲ Va bien" + R;
  if (total >= 40) return YELLOW + BOLD + "◆ Prometedor" + R;
  if (total >= 20) return YELLOW + "◇ Solo empezando" + R;
  return RED + BOLD + "✗ Solo de nombre" + R;
}

export function renderReport(report: Report): string {
  const lines: string[] = [];

  lines.push("");
  lines.push(BG_BLUE + BOLD + WHITE + "  KIRO RADAR  " + R + `  ${DIM}${report.repoName}${R}`);
  lines.push("");

  // Tabla de dimensiones
  const nameW = 14;
  for (const dim of report.dimensions) {
    const name = dim.name.padEnd(nameW);
    const sc = String(dim.score).padStart(2);
    const c = color(dim.score);
    lines.push(
      `  ${c}${BOLD}${name}${R}  ${bar(dim.score)}  ${c}${sc}/10${R}`
    );
  }

  lines.push("");

  // Total
  const totalColor = color(report.totalScore / 10);
  const totalBar = bar(report.totalScore, 100, 30);
  lines.push(
    `  ${BOLD}TOTAL${R}           ${totalBar}  ${totalColor}${BOLD}${report.totalScore}/100${R}`
  );
  lines.push(`  ${verdict(report.totalScore)}`);
  lines.push("");

  // Top 3 jugadas
  if (report.topMoves.length > 0) {
    lines.push(BOLD + CYAN + "  ⚡ PRÓXIMAS JUGADAS" + R);
    for (let i = 0; i < report.topMoves.length; i++) {
      const m = report.topMoves[i];
      lines.push(
        `  ${BOLD}${i + 1}.${R} ${YELLOW}[+${m.gain}pts]${R} ${m.description}`
      );
    }
    lines.push("");
  }

  // Warnings
  if (report.warnings.length > 0) {
    lines.push(DIM + `  ⚠  ${report.warnings.length} advertencia(s): ${report.warnings[0]}` +
      (report.warnings.length > 1 ? ` (+${report.warnings.length - 1} más)` : "") + R);
    lines.push("");
  }

  return lines.join("\n");
}

export function renderBadge(score: number): string {
  const label = "kiro-radar";
  const value = `${score}/100`;
  const color = score >= 80 ? "4c1" : score >= 60 ? "dfb317" : score >= 40 ? "fe7d37" : "e05d44";
  const lw = label.length * 6 + 10;
  const vw = value.length * 6 + 10;
  const tw = lw + vw;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${tw}" height="20">
  <linearGradient id="s" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>
  <rect rx="3" width="${tw}" height="20" fill="#555"/>
  <rect rx="3" x="${lw}" width="${vw}" height="20" fill="#${color}"/>
  <rect rx="3" width="${tw}" height="20" fill="url(#s)"/>
  <g fill="#fff" text-anchor="middle" font-family="DejaVu Sans,Verdana,Geneva,sans-serif" font-size="11">
    <text x="${lw / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text>
    <text x="${lw / 2}" y="14">${label}</text>
    <text x="${lw + vw / 2}" y="15" fill="#010101" fill-opacity=".3">${value}</text>
    <text x="${lw + vw / 2}" y="14">${value}</text>
  </g>
</svg>`;
}

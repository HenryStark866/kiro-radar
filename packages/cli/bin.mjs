#!/usr/bin/env node
// packages/cli/bin.mjs
// kiro-radar scan [ruta] [--json] [--badge out.svg]
// Código de salida 0 = OK, 2 = ruta no existe.

import { scanRepository } from "../core/src/index.ts";
import { renderReport, renderBadge } from "./render.ts";
import * as fs from "node:fs/promises";
import * as path from "node:path";

const args = process.argv.slice(2);

if (args[0] !== "scan") {
  console.error("Uso: kiro-radar scan [ruta] [--json] [--badge <archivo.svg>]");
  process.exit(1);
}

// Parse args
let scanRoot = ".";
let jsonMode = false;
let badgeFile = "";

for (let i = 1; i < args.length; i++) {
  if (args[i] === "--json") {
    jsonMode = true;
  } else if (args[i] === "--badge" && args[i + 1]) {
    badgeFile = args[++i];
  } else if (!args[i].startsWith("--")) {
    scanRoot = args[i];
  }
}

// Verificar que la ruta existe
try {
  await fs.access(scanRoot);
} catch {
  console.error(`Error: la ruta no existe: ${scanRoot}`);
  process.exit(2);
}

const report = await scanRepository(scanRoot);

if (report.error) {
  console.error(`Error fatal: ${report.error}`);
  process.exit(2);
}

if (jsonMode) {
  console.log(JSON.stringify(report, null, 2));
} else {
  process.stdout.write(renderReport(report));
}

if (badgeFile) {
  const svg = renderBadge(report.totalScore);
  await fs.writeFile(badgeFile, svg, "utf8");
  console.log(`Insignia guardada en: ${path.resolve(badgeFile)}`);
}

// packages/core/src/index.ts
// Punto de entrada público: scanRepository(root) → Promise<Report>

import * as path from "node:path";
import { validateRoot, readAllFiles } from "./safe-fs.ts";
import { ALL_DIMENSIONS } from "./dimensions.ts";
import type { Report, DimensionResult, NextMove } from "./types.ts";

export type { Report, DimensionResult, NextMove };
export type { DimensionName, DimensionContext, FileRecord, Dimension } from "./types.ts";

export const SCHEMA_VERSION = "1.0.0";

/**
 * Escanea el repositorio en `root` y devuelve un Report determinista.
 * Orden: dimensiones por code units (alfabético ASCII).
 */
export async function scanRepository(root: string): Promise<Report> {
  // 1. Validar raíz
  let absRoot: string;
  try {
    absRoot = await validateRoot(root);
  } catch (err) {
    return {
      schemaVersion: SCHEMA_VERSION,
      repoName: path.basename(path.resolve(root)),
      totalScore: 0,
      dimensions: [],
      warnings: [],
      topMoves: [],
      error: (err as Error).message,
    };
  }

  const warnings: string[] = [];

  // 2. Leer archivos
  const files = await readAllFiles(absRoot, warnings);

  // 3. Puntuar dimensiones
  const ctx = { root: absRoot, files, warnings };
  const results: DimensionResult[] = ALL_DIMENSIONS.map(dim => dim.score(ctx));

  // 4. Orden determinista por name (code units)
  results.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

  // 5. Agregar
  const totalScore = results.reduce((s, d) => s + d.score, 0);

  // LO INGENIOSO: top 3 jugadas con más puntos posibles
  const allMoves: NextMove[] = results
    .map(d => d.nextMove)
    .sort((a, b) => b.gain - a.gain);
  const topMoves = allMoves.slice(0, 3);

  // Warnings: deduplicar, ordenar por code units
  const uniqueWarnings = [...new Set(warnings)].sort();

  return {
    schemaVersion: SCHEMA_VERSION,
    repoName: path.basename(absRoot),
    totalScore,
    dimensions: results,
    warnings: uniqueWarnings,
    topMoves,
  };
}

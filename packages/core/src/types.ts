// packages/core/src/types.ts
// Contrato público de Kiro Radar — congelado al aprobar WP-02.
// Node 24 type-stripping: sin enums, sin namespaces, sin parameter properties.

export type DimensionName =
  | "agents"
  | "hooks"
  | "mcp"
  | "powers"
  | "protection"
  | "skills"
  | "specs"
  | "steering"
  | "traceability"
  | "workflows";

/** Jugada sugerida para subir el puntaje de una dimensión */
export interface NextMove {
  /** Nombre de la dimensión a mejorar */
  dimension: DimensionName;
  /** Puntos que se ganarían al ejecutar la jugada */
  gain: number;
  /** Descripción corta y accionable */
  description: string;
}

export interface DimensionResult {
  /** Nombre de la dimensión */
  name: DimensionName;
  /** Puntaje 0–10 */
  score: number;
  /** Hallazgos concretos que justifican el puntaje (máx 120 chars c/u, rutas relativas) */
  evidence: string[];
  /** Sugerencia de acción para mejorar */
  nextAction: string;
  /** LO INGENIOSO: siguiente jugada de Kiro que subiría este puntaje */
  nextMove: NextMove;
}

export interface Report {
  /** Versión del schema */
  schemaVersion: string;
  /** Nombre de la carpeta del repositorio (sin ruta absoluta) */
  repoName: string;
  /** Suma de puntajes de las 10 dimensiones (0–100) */
  totalScore: number;
  /** Resultados de cada dimensión (10 elementos, orden alfabético por name) */
  dimensions: DimensionResult[];
  /** Advertencias no fatales del escaneo */
  warnings: string[];
  /** Error fatal (solo si el escaneo no pudo completarse) */
  error?: string;
  /** LO INGENIOSO: top 3 jugadas con más puntos posibles */
  topMoves: NextMove[];
}

// ── Tipos internos del motor ────────────────────────────────────────────────

export interface FileRecord {
  /** Ruta relativa a la raíz (barras normales) */
  path: string;
  /** Contenido UTF-8 sin BOM; null si binario o error de lectura */
  content: string | null;
  /** Tamaño en bytes */
  size: number;
  /** true si el contenido fue detectado como binario */
  isBinary: boolean;
  /** true si es un enlace simbólico */
  isSymlink: boolean;
  /** Destino del enlace (solo si isSymlink) */
  symlinkTarget?: string;
}

export interface DimensionContext {
  /** Ruta absoluta de la raíz del repositorio escaneado */
  root: string;
  /** Todos los archivos leídos */
  files: FileRecord[];
  /** Acumula warnings durante el scoring */
  warnings: string[];
}

export interface Dimension {
  readonly name: DimensionName;
  score(ctx: DimensionContext): DimensionResult;
}

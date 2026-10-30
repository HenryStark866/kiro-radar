// packages/core/src/safe-fs.ts
// Capa de lectura segura: nunca sale de la raíz, ignora symlinks,
// salta binarios y archivos >1 MiB con warning, quita BOM.

import * as fs from "node:fs/promises";
import * as path from "node:path";
import type { FileRecord } from "./types.ts";

export const MAX_FILE_SIZE = 1024 * 1024; // 1 MiB
const MAX_DEPTH = 20;
const MAX_FILES = 20_000;
const IGNORE_DIRS = new Set([".git", "node_modules"]);

/** Quita el BOM UTF-8 (EF BB BF) si está presente */
function stripBom(content: string): string {
  return content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;
}

/**
 * Heurística rápida de binario: si el primer kilobyte contiene
 * un byte nulo (0x00) asumimos binario.
 */
function looksLikeBinary(buf: Buffer): boolean {
  const sample = buf.subarray(0, Math.min(buf.length, 4096));
  return sample.includes(0x00);
}

/** Normaliza una ruta a barras normales y sin trailing slash */
export function normalizePath(p: string): string {
  return path.normalize(p).replace(/\\/g, "/").replace(/\/$/, "");
}

/**
 * Resuelve la raíz y valida que sea un directorio real.
 * Lanza un Error si no es válido.
 */
export async function validateRoot(root: string): Promise<string> {
  const abs = path.resolve(root);
  let stat: Awaited<ReturnType<typeof fs.stat>>;
  try {
    stat = await fs.stat(abs);
  } catch {
    throw new Error(`Raíz no es un directorio válido: ${root}`);
  }
  if (!stat.isDirectory()) {
    throw new Error(`Raíz no es un directorio válido: ${root}`);
  }
  return abs;
}

/**
 * Recorre el árbol de directorios de forma recursiva y segura.
 * Retorna un array de FileRecord ordenado por ruta (code units).
 */
export async function readAllFiles(
  root: string,
  warnings: string[]
): Promise<FileRecord[]> {
  const realRoot = await fs.realpath(root);
  const records: FileRecord[] = [];
  let fileCount = 0;

  async function walk(dir: string, depth: number): Promise<void> {
    if (depth > MAX_DEPTH) {
      warnings.push(`Profundidad máxima (${MAX_DEPTH}) alcanzada en: ${dir}`);
      return;
    }
    if (fileCount >= MAX_FILES) {
      warnings.push(`Límite de ${MAX_FILES} archivos alcanzado.`);
      return;
    }

    let entries: Awaited<ReturnType<typeof fs.readdir>>;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch (err) {
      warnings.push(`Error al leer directorio: ${dir} — ${String(err)}`);
      return;
    }

    // Orden determinista: code units
    entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

    for (const entry of entries) {
      if (fileCount >= MAX_FILES) break;

      const absPath = path.join(dir, entry.name);
      const relPath = normalizePath(path.relative(realRoot, absPath));

      // Protección anti path-traversal: nunca salir de la raíz
      if (relPath.startsWith("..") || path.isAbsolute(relPath)) {
        warnings.push(`Ruta fuera de raíz ignorada: ${relPath}`);
        continue;
      }

      // Symlink: no seguir, registrar warning
      let lstatResult: Awaited<ReturnType<typeof fs.lstat>>;
      try {
        lstatResult = await fs.lstat(absPath);
      } catch {
        warnings.push(`No se pudo leer: ${relPath}`);
        continue;
      }

      if (lstatResult.isSymbolicLink()) {
        let target = "";
        try {
          target = await fs.readlink(absPath);
          // Verificar si el target apunta fuera de la raíz
          const resolvedTarget = path.resolve(path.dirname(absPath), target);
          const relTarget = path.relative(realRoot, resolvedTarget);
          if (relTarget.startsWith("..") || path.isAbsolute(relTarget)) {
            warnings.push(`Enlace simbólico fuera de raíz ignorado: ${relPath} -> ${target}`);
            records.push({
              path: relPath,
              content: null,
              size: 0,
              isBinary: false,
              isSymlink: true,
              symlinkTarget: target,
            });
            continue;
          }
        } catch {
          warnings.push(`Enlace simbólico no legible ignorado: ${relPath}`);
        }
        records.push({
          path: relPath,
          content: null,
          size: 0,
          isBinary: false,
          isSymlink: true,
          symlinkTarget: target,
        });
        continue;
      }

      if (lstatResult.isDirectory()) {
        if (IGNORE_DIRS.has(entry.name)) continue;
        await walk(absPath, depth + 1);
        continue;
      }

      if (!lstatResult.isFile()) continue;

      fileCount++;
      const size = lstatResult.size;

      // Archivo grande: warning, solo leer primeros 1 MiB
      if (size > MAX_FILE_SIZE) {
        warnings.push(`Archivo > 1 MiB truncado: ${relPath} (${size} bytes)`);
      }

      let content: string | null = null;
      let isBinary = false;
      try {
        const buf = await fs.readFile(absPath);
        const chunk = buf.subarray(0, MAX_FILE_SIZE);
        if (looksLikeBinary(chunk)) {
          isBinary = true;
          warnings.push(`Archivo binario ignorado: ${relPath}`);
        } else {
          // Decodificar con reemplazo (no lanzar)
          const raw = chunk.toString("utf8");
          content = stripBom(raw);
        }
      } catch (err) {
        warnings.push(`Error al leer archivo: ${relPath} — ${String(err)}`);
      }

      records.push({ path: relPath, content, size, isBinary, isSymlink: false });
    }
  }

  await walk(realRoot, 0);

  // Orden determinista final
  records.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  return records;
}

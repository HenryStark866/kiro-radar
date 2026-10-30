// packages/core/test/dimensions.test.ts
// Tests por fixture + safe-fs con node:test y node:assert

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import * as path from "node:path";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import { fileURLToPath } from "node:url";

import { scanRepository } from "../src/index.ts";
import { readAllFiles, validateRoot } from "../src/safe-fs.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURES = path.join(__dirname, "../../../fixtures");

// ── Fixtures ──────────────────────────────────────────────────────────────────

describe("fixture: excellent", () => {
  test("totalScore >= 80", async () => {
    const r = await scanRepository(path.join(FIXTURES, "excellent"));
    assert.ok(r.totalScore >= 80, `expected >= 80, got ${r.totalScore}. Dims: ${r.dimensions.map(d => `${d.name}:${d.score}`).join(", ")}`);
  });

  test("exactly 10 dimensions", async () => {
    const r = await scanRepository(path.join(FIXTURES, "excellent"));
    assert.strictEqual(r.dimensions.length, 10);
  });

  test("topMoves has 3 entries", async () => {
    const r = await scanRepository(path.join(FIXTURES, "excellent"));
    assert.strictEqual(r.topMoves.length, 3);
  });

  test("totalScore equals sum of dimensions", async () => {
    const r = await scanRepository(path.join(FIXTURES, "excellent"));
    const sum = r.dimensions.reduce((s, d) => s + d.score, 0);
    assert.strictEqual(r.totalScore, sum);
  });
});

describe("fixture: minimal", () => {
  test("totalScore >= 20 and < 80", async () => {
    const r = await scanRepository(path.join(FIXTURES, "minimal"));
    assert.ok(r.totalScore >= 20, `expected >= 20, got ${r.totalScore}. Dims: ${r.dimensions.map(d => `${d.name}:${d.score}`).join(", ")}`);
    assert.ok(r.totalScore < 80, `expected < 80, got ${r.totalScore}`);
  });
});

describe("fixture: trap", () => {
  test("totalScore <= 20", async () => {
    const r = await scanRepository(path.join(FIXTURES, "trap"));
    assert.ok(r.totalScore <= 20, `expected <= 20, got ${r.totalScore}. Dims: ${r.dimensions.map(d => `${d.name}:${d.score}`).join(", ")}`);
  });

  test("no dimension >= 4 in trap", async () => {
    const r = await scanRepository(path.join(FIXTURES, "trap"));
    for (const dim of r.dimensions) {
      assert.ok(dim.score < 4, `dimension ${dim.name} scored ${dim.score}, expected < 4`);
    }
  });
});

// ── safe-fs ───────────────────────────────────────────────────────────────────

describe("safe-fs", () => {
  test("rejects non-existent root", async () => {
    await assert.rejects(() => validateRoot("/non/existent/path/xyz"), /válido/);
  });

  test("strips BOM from UTF-8 files", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "kiro-bom-"));
    try {
      // Write file with BOM (EF BB BF)
      const bom = Buffer.from([0xef, 0xbb, 0xbf]);
      const content = Buffer.from("hello world");
      await fs.writeFile(path.join(tmp, "bom.txt"), Buffer.concat([bom, content]));
      const warnings: string[] = [];
      const files = await readAllFiles(tmp, warnings);
      const f = files.find(f => f.path.endsWith("bom.txt"));
      assert.ok(f, "file not found");
      assert.strictEqual(f!.content, "hello world");
    } finally {
      await fs.rm(tmp, { recursive: true, force: true });
    }
  });

  test("marks binary files as isBinary and content null", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "kiro-bin-"));
    try {
      // Buffer with null byte → binary
      const buf = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x0d, 0x0a]);
      await fs.writeFile(path.join(tmp, "image.png"), buf);
      const warnings: string[] = [];
      const files = await readAllFiles(tmp, warnings);
      const f = files.find(f => f.path.endsWith("image.png"));
      assert.ok(f, "binary file not found");
      assert.strictEqual(f!.isBinary, true);
      assert.strictEqual(f!.content, null);
      assert.ok(warnings.some(w => w.includes("binario")), "expected binary warning");
    } finally {
      await fs.rm(tmp, { recursive: true, force: true });
    }
  });

  test("warns on file > 1 MiB", async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "kiro-large-"));
    try {
      // Create a 1.1 MiB text file
      const bigContent = "a".repeat(1024 * 1024 + 1024);
      await fs.writeFile(path.join(tmp, "large.txt"), bigContent, "utf8");
      const warnings: string[] = [];
      await readAllFiles(tmp, warnings);
      assert.ok(warnings.some(w => w.includes("MiB") || w.includes("truncad")), "expected size warning");
    } finally {
      await fs.rm(tmp, { recursive: true, force: true });
    }
  });

  test("path traversal: symlink outside root is ignored with warning", async () => {
    // Only test on platforms where symlinks work without admin
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), "kiro-sym-"));
    try {
      // Create a symlink pointing outside the tmp dir
      const linkPath = path.join(tmp, "escape.txt");
      try {
        await fs.symlink(os.tmpdir(), linkPath);
      } catch {
        // symlinks may require admin on Windows — skip
        return;
      }
      const warnings: string[] = [];
      const files = await readAllFiles(tmp, warnings);
      const found = files.find(f => f.path.includes("escape"));
      // Either ignored entirely or recorded as symlink with no content
      if (found) {
        assert.strictEqual(found.isSymlink, true);
        assert.strictEqual(found.content, null);
      }
      assert.ok(warnings.some(w => w.includes("simbólico") || w.includes("symlink") || w.includes("fuera")), "expected symlink warning");
    } finally {
      await fs.rm(tmp, { recursive: true, force: true });
    }
  });

  test("determinism: same root same output", async () => {
    const r1 = await scanRepository(path.join(FIXTURES, "excellent"));
    const r2 = await scanRepository(path.join(FIXTURES, "excellent"));
    assert.strictEqual(JSON.stringify(r1), JSON.stringify(r2));
  });

  test("dimensions sorted alphabetically", async () => {
    const r = await scanRepository(path.join(FIXTURES, "excellent"));
    const names = r.dimensions.map(d => d.name);
    const sorted = [...names].sort();
    assert.deepStrictEqual(names, sorted);
  });

  test("error report when root does not exist", async () => {
    const r = await scanRepository("/totally/missing/path");
    assert.ok(r.error, "expected error field");
    assert.strictEqual(r.totalScore, 0);
  });
});

// ── Autoescaneo del repo raíz ─────────────────────────────────────────────────
// C4: garantiza que el repo real siga puntuando bien en hooks y protection
// (evita que cambios en el esquema de hooks vuelvan a romper el puntaje)

describe("self-scan: repo raíz", () => {
  const REPO_ROOT = path.join(__dirname, "../../../");

  test("hooks >= 6 (trigger real de Kiro detectado)", async () => {
    const r = await scanRepository(REPO_ROOT);
    const hooks = r.dimensions.find(d => d.name === "hooks");
    assert.ok(hooks, "dimensión hooks no encontrada");
    assert.ok(hooks.score >= 6,
      `hooks=${hooks.score}, expected >=6. Evidence: ${hooks.evidence.join("; ")}`);
  });

  test("protection >= 6 (.kiroignore + hook bloqueante)", async () => {
    const r = await scanRepository(REPO_ROOT);
    const prot = r.dimensions.find(d => d.name === "protection");
    assert.ok(prot, "dimensión protection no encontrada");
    assert.ok(prot.score >= 6,
      `protection=${prot.score}, expected >=6. Evidence: ${prot.evidence.join("; ")}`);
  });
});

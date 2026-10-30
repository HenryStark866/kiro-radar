// packages/core/test/properties.test.ts
// Propiedades con fast-check. seed 42, numRuns 50.

import { test } from "node:test";
import assert from "node:assert/strict";
import * as fc from "fast-check";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import * as os from "node:os";
import { scanRepository } from "../src/index.ts";

fc.configureGlobal({ seed: 42, numRuns: 50 });

// ── helpers ───────────────────────────────────────────────────────────────────

async function withTree(
  tree: Record<string, string>,
  fn: (root: string) => Promise<void>
): Promise<void> {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "kiro-prop-"));
  try {
    for (const [rel, content] of Object.entries(tree)) {
      const abs = path.join(root, rel);
      await fs.mkdir(path.dirname(abs), { recursive: true });
      await fs.writeFile(abs, content, "utf8");
    }
    await fn(root);
  } finally {
    await fs.rm(root, { recursive: true, force: true });
  }
}

// ── arbitraries ───────────────────────────────────────────────────────────────

const earsSentence = fc
  .tuple(fc.lorem({ maxCount: 3 }), fc.lorem({ maxCount: 4 }))
  .map(([s, v]) => `WHEN ${s} SHALL ${v}`);

const frontmatter = fc
  .constantFrom("always", "auto", "manual", "fileMatch")
  .map((m) => `---\ninclusion: ${m}\n---\n`);

const mdContent = fc
  .tuple(fc.array(earsSentence, { minLength: 3, maxLength: 6 }), fc.lorem({ maxCount: 20 }))
  .map(([ears, prose]) => `# Title\n\n${ears.join("\n")}\n\n${prose}\n`);

const hooksJson = fc
  .array(
    fc.record({
      type: fc.constantFrom("PreToolUse", "PostToolUse", "UserPromptSubmit"),
      action: fc.record({ command: fc.lorem({ maxCount: 2 }) }),
    }),
    { minLength: 0, maxLength: 4 }
  )
  .map((hooks) => JSON.stringify({ version: "v1", hooks }, null, 2));

const repoTree = fc.record({
  ".kiro/specs/main/requirements.md": fc.oneof(mdContent, fc.constant("# Solo título")),
  ".kiro/specs/main/design.md": fc.oneof(
    fc.tuple(frontmatter, mdContent).map(([f, m]) => f + m),
    fc.constant("")
  ),
  ".kiro/specs/main/tasks.md": fc.oneof(mdContent, fc.constant("# Tareas")),
  ".kiro/steering/product.md": fc.oneof(
    fc.tuple(frontmatter, mdContent).map(([f, m]) => f + m),
    fc.constant("# Producto")
  ),
  ".kiro/steering/tech.md": fc.oneof(
    fc.tuple(frontmatter, mdContent).map(([f, m]) => f + m),
    fc.constant("")
  ),
  ".kiro/steering/structure.md": fc.oneof(
    fc.tuple(frontmatter, mdContent).map(([f, m]) => f + m),
    fc.constant("# Estructura")
  ),
  ".kiro/hooks/hooks.json": fc.oneof(hooksJson, fc.constant("{}")),
  ".kiro/settings/mcp.json": fc.oneof(
    fc.constant(JSON.stringify({ mcpServers: { demo: { command: "node", args: [] } } })),
    fc.constant("{}")
  ),
});

const trapTree = fc.record({
  ".kiro/specs/main/requirements.md": fc.constantFrom("# Requisitos", ""),
  ".kiro/steering/product.md": fc.constantFrom("# Producto", ""),
  ".kiro/hooks/hooks.json": fc.constantFrom("{}", "{ }"),
  ".kiro/settings/mcp.json": fc.constantFrom("{}", "null"),
});

// ── propiedades ───────────────────────────────────────────────────────────────

test("prop: determinismo — misma entrada, mismo output", async () => {
  await fc.assert(
    fc.asyncProperty(repoTree, async (tree) => {
      await withTree(tree, async (root) => {
        const r1 = await scanRepository(root);
        const r2 = await scanRepository(root);
        assert.strictEqual(JSON.stringify(r1), JSON.stringify(r2));
      });
    })
  );
});

test("prop: totalScore es suma exacta de dimensiones", async () => {
  await fc.assert(
    fc.asyncProperty(repoTree, async (tree) => {
      await withTree(tree, async (root) => {
        const r = await scanRepository(root);
        const sum = r.dimensions.reduce((s, d) => s + d.score, 0);
        assert.strictEqual(r.totalScore, sum);
      });
    })
  );
});

test("prop: cada dimensión en rango 0-10", async () => {
  await fc.assert(
    fc.asyncProperty(repoTree, async (tree) => {
      await withTree(tree, async (root) => {
        const r = await scanRepository(root);
        for (const d of r.dimensions) {
          assert.ok(d.score >= 0 && d.score <= 10,
            `${d.name}: score ${d.score} fuera de rango`);
        }
      });
    })
  );
});

test("prop: trampa — totalScore <= 20 y ninguna dimensión >= 4", async () => {
  await fc.assert(
    fc.asyncProperty(trapTree, async (tree) => {
      await withTree(tree, async (root) => {
        const r = await scanRepository(root);
        assert.ok(r.totalScore <= 20,
          `trap totalScore=${r.totalScore}, expected <=20. ${r.dimensions.map(d => `${d.name}:${d.score}`).join(", ")}`);
        for (const d of r.dimensions) {
          assert.ok(d.score < 4, `trap ${d.name}=${d.score} expected <4`);
        }
      });
    })
  );
});

test("prop: seguridad — ningún evidence sale fuera de la raíz", async () => {
  await fc.assert(
    fc.asyncProperty(repoTree, async (tree) => {
      await withTree(tree, async (root) => {
        const r = await scanRepository(root);
        for (const dim of r.dimensions) {
          for (const ev of dim.evidence) {
            assert.ok(!path.isAbsolute(ev) || !ev.startsWith(root),
              `evidence absoluto detectado: ${ev}`);
            assert.ok(!/\.\.(\/|\\|$)/.test(ev),
              `evidence con path traversal: ${ev}`);
          }
        }
      });
    })
  );
});

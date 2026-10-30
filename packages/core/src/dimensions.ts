// packages/core/src/dimensions.ts
// 10 dimensiones de Kiro Radar. Presencia ≠ calidad; vacío/solo-título = 0.

import type { Dimension, DimensionContext, DimensionResult, DimensionName, NextMove } from "./types.ts";

// ── helpers ─────────────────────────────────────────────────────────────────

/** true si el contenido tiene texto real más allá de títulos y frontmatter */
function hasRealContent(text: string, minChars = 200): boolean {
  const stripped = text
    .replace(/^---[\s\S]*?---\n?/m, "")      // quita frontmatter
    .replace(/^#+\s+.*/gm, "")               // quita títulos
    .replace(/\s+/g, " ")
    .trim();
  return stripped.length >= minChars;
}

/** Extrae el valor de "inclusion: <valor>" en frontmatter */
function inclusionMode(text: string): string | null {
  const m = text.match(/^inclusion:\s*(\S+)/m);
  return m ? m[1] : null;
}

/** Parsea JSON silenciosamente; null si falla */
function tryJson(text: string): unknown {
  try { return JSON.parse(text); } catch { return null; }
}

/** Archivos de un prefijo de ruta */
function filesUnder(files: DimensionContext["files"], prefix: string) {
  return files.filter(f => f.path.startsWith(prefix) && f.content !== null);
}

/** Primer archivo que coincide exactamente */
function fileExact(files: DimensionContext["files"], p: string) {
  return files.find(f => f.path === p && f.content !== null);
}

/** Construye un NextMove estándar */
function move(dimension: DimensionName, gain: number, description: string): NextMove {
  return { dimension, gain, description };
}

// ── 1. specs ────────────────────────────────────────────────────────────────

export class SpecsDimension implements Dimension {
  readonly name: DimensionName = "specs";

  score(ctx: DimensionContext): DimensionResult {
    const specDirs = new Set<string>();
    for (const f of ctx.files) {
      const m = f.path.match(/^\.kiro\/specs\/([^/]+)\//);
      if (m) specDirs.add(m[1]);
    }

    const evidence: string[] = [];
    let completeSpecs = 0;
    let hasCompletedTask = false;

    for (const dir of specDirs) {
      const req = fileExact(ctx.files, `.kiro/specs/${dir}/requirements.md`);
      const des = fileExact(ctx.files, `.kiro/specs/${dir}/design.md`);
      const tsk = fileExact(ctx.files, `.kiro/specs/${dir}/tasks.md`);
      if (!req || !des || !tsk) continue;
      if (!hasRealContent(req.content!) || !hasRealContent(des.content!) || !hasRealContent(tsk.content!)) continue;
      const ears = (req.content! + des.content!).match(/WHEN\s+\S.*SHALL\s+\S/g) ?? [];
      if (ears.length < 3) continue;
      completeSpecs++;
      evidence.push(`.kiro/specs/${dir}/ — ${ears.length} EARS`);
      if (/\[x\]/i.test(tsk.content!)) hasCompletedTask = true;
    }

    let sc = 0;
    if (completeSpecs >= 1) sc = 6;
    if (completeSpecs >= 2) sc = 8;
    if (completeSpecs >= 2 && hasCompletedTask) sc = 10;

    const gain = 10 - sc;
    return {
      name: "specs",
      score: sc,
      evidence: evidence.length ? evidence : ["Sin specs con contenido real"],
      nextAction: sc < 6
        ? "Crea requirements.md, design.md y tasks.md con requisitos EARS (WHEN … SHALL)."
        : sc < 10
        ? "Marca al menos una tarea [x] y agrega un segundo spec completo."
        : "Specs en excelente estado.",
      nextMove: move("specs", gain,
        sc < 6
          ? `Agregar spec completo (+${gain}pts) con requirements.md, design.md y tasks.md con EARS`
          : `Marcar tarea [x] y segundo spec (+${gain}pts)`),
    };
  }
}

// ── 2. steering ──────────────────────────────────────────────────────────────

export class SteeringDimension implements Dimension {
  readonly name: DimensionName = "steering";

  score(ctx: DimensionContext): DimensionResult {
    const required = ["product.md", "tech.md", "structure.md"];
    const modes = new Set<string>();
    const evidence: string[] = [];
    let realFiles = 0;

    for (const name of required) {
      const f = fileExact(ctx.files, `.kiro/steering/${name}`);
      if (!f || !hasRealContent(f.content!)) continue;
      realFiles++;
      const mode = inclusionMode(f.content!);
      if (mode) modes.add(mode);
      evidence.push(`.kiro/steering/${name} [inclusion:${mode ?? "—"}]`);
    }

    // Extra steering files
    for (const f of filesUnder(ctx.files, ".kiro/steering/")) {
      const mode = inclusionMode(f.content!);
      if (mode) modes.add(mode);
    }

    let sc = 0;
    if (realFiles >= 3 && modes.size >= 2) sc = 6;
    if (realFiles >= 3 && modes.size >= 4) sc = 10;
    else if (realFiles >= 3 && modes.size >= 3) sc = 8;

    const gain = 10 - sc;
    return {
      name: "steering",
      score: sc,
      evidence: evidence.length ? evidence : ["Sin archivos de steering con contenido real"],
      nextAction: sc < 6
        ? "Crea product.md, tech.md y structure.md con inclusión 'always' o 'auto'."
        : sc < 10
        ? "Agrega los 4 modos de inclusion: always, auto, fileMatch, manual."
        : "Steering completo.",
      nextMove: move("steering", gain,
        sc < 6
          ? `Crear product.md/tech.md/structure.md con frontmatter inclusion (+${gain}pts)`
          : `Agregar modos de inclusion fileMatch y manual (+${gain}pts)`),
    };
  }
}

// ── 3. hooks ─────────────────────────────────────────────────────────────────

const BLOCKING = new Set(["PreToolUse", "UserPromptSubmit", "PreTaskExec"]);

export class HooksDimension implements Dimension {
  readonly name: DimensionName = "hooks";

  score(ctx: DimensionContext): DimensionResult {
    const hookFiles = filesUnder(ctx.files, ".kiro/hooks/");
    const triggers = new Set<string>();
    let blockingCount = 0;
    let hasAction = false;
    const evidence: string[] = [];

    for (const f of hookFiles) {
      if (!f.path.endsWith(".json")) continue;
      const data = tryJson(f.content!) as Record<string, unknown> | null;
      if (!data) { ctx.warnings.push(`Hook JSON inválido: ${f.path}`); continue; }

      // Support both version "v1" string and version 1 number
      const ver = (data as Record<string, unknown>)["version"];
      if (ver !== "v1" && ver !== 1) continue;

      const hooks = (data as Record<string, unknown>)["hooks"];
      if (!Array.isArray(hooks)) continue;

      for (const h of hooks) {
        const hObj = h as Record<string, unknown>;
        // Kiro real schema uses "trigger"; accept "type" as fallback
        const trigger = (hObj["trigger"] ?? hObj["type"]) as string | undefined;
        if (!trigger) continue;
        triggers.add(trigger);
        if (BLOCKING.has(trigger)) blockingCount++;
        const action = hObj["action"];
        if (action && ((action as Record<string, unknown>)["command"] || (action as Record<string, unknown>)["prompt"])) hasAction = true;
        evidence.push(`${f.path} → ${trigger}${BLOCKING.has(trigger) ? " [bloqueante]" : ""}`);
      }
    }

    let sc = 0;
    if (triggers.size >= 2 && blockingCount >= 1) sc = 6;
    if (triggers.size >= 4 && blockingCount >= 2 && hasAction) sc = 10;
    else if (triggers.size >= 3 && blockingCount >= 1) sc = 8;

    const gain = 10 - sc;
    return {
      name: "hooks",
      score: sc,
      evidence: evidence.length ? evidence : ["Sin hooks JSON v1 válidos"],
      nextAction: sc < 6
        ? "Crea un hook JSON v1 con PreToolUse y UserPromptSubmit."
        : sc < 10
        ? "Agrega 4+ triggers distintos, 2+ bloqueantes y action.command en todos."
        : "Hooks excelentes.",
      nextMove: move("hooks", gain,
        sc < 6
          ? `Crear hook con PreToolUse bloqueante (+${gain}pts)`
          : `Agregar 2+ hooks bloqueantes con action.command (+${gain}pts)`),
    };
  }
}

// ── 4. skills ────────────────────────────────────────────────────────────────

export class SkillsDimension implements Dimension {
  readonly name: DimensionName = "skills";

  score(ctx: DimensionContext): DimensionResult {
    const skillDirs = new Set<string>();
    for (const f of ctx.files) {
      const m = f.path.match(/^\.kiro\/skills\/([^/]+)\//);
      if (m) skillDirs.add(m[1]);
    }

    const evidence: string[] = [];
    let validSkills = 0;
    let hasExtras = false;

    for (const dir of skillDirs) {
      const skill = fileExact(ctx.files, `.kiro/skills/${dir}/SKILL.md`);
      if (!skill) continue;
      const nameMatch = skill.content!.match(/^name:\s*(.+)$/m);
      const descMatch = skill.content!.match(/^description:\s*(.{40,})$/m);
      if (!nameMatch || !descMatch) continue;
      if (nameMatch[1].trim() !== dir) continue;
      validSkills++;
      evidence.push(`.kiro/skills/${dir}/SKILL.md — name:${dir}`);
      // Check for assets/scripts/references
      const extras = ctx.files.filter(f =>
        f.path.startsWith(`.kiro/skills/${dir}/`) &&
        (f.path.includes("/scripts/") || f.path.includes("/references/") || f.path.includes("/assets/"))
      );
      if (extras.length) hasExtras = true;
    }

    let sc = 0;
    if (validSkills >= 1) sc = 6;
    if (validSkills >= 3 && hasExtras) sc = 10;
    else if (validSkills >= 2) sc = 8;

    const gain = 10 - sc;
    return {
      name: "skills",
      score: sc,
      evidence: evidence.length ? evidence : ["Sin SKILL.md válidos"],
      nextAction: sc < 6
        ? "Crea .kiro/skills/<nombre>/SKILL.md con name igual al nombre de carpeta y description ≥40 chars."
        : sc < 10
        ? "Agrega 3+ skills con carpeta scripts/ o assets/."
        : "Skills en excelente estado.",
      nextMove: move("skills", gain,
        sc < 6
          ? `Crear SKILL.md con name y description (+${gain}pts)`
          : `Agregar skills/scripts/ a 3+ skills (+${gain}pts)`),
    };
  }
}

// ── 5. mcp ───────────────────────────────────────────────────────────────────

export class McpDimension implements Dimension {
  readonly name: DimensionName = "mcp";

  score(ctx: DimensionContext): DimensionResult {
    const f = fileExact(ctx.files, ".kiro/settings/mcp.json");
    if (!f) return this._zero("Sin .kiro/settings/mcp.json");

    const data = tryJson(f.content!) as Record<string, unknown> | null;
    if (!data) { ctx.warnings.push("mcp.json inválido"); return this._zero("mcp.json no es JSON válido"); }

    const servers = (data as Record<string, unknown>)["mcpServers"] as Record<string, unknown> | undefined;
    if (!servers || typeof servers !== "object") return this._zero("mcpServers ausente o vacío");

    const serverNames = Object.keys(servers);
    if (serverNames.length === 0) return this._zero("mcpServers vacío");

    const evidence = serverNames.map(n => `mcpServers.${n}`);
    let hasEnvVars = false;
    let hasLiteralSecret = false;

    for (const srv of Object.values(servers) as Record<string, unknown>[]) {
      const env = srv?.["env"] as Record<string, string> | undefined;
      if (env) {
        for (const v of Object.values(env)) {
          if (typeof v === "string" && /\$\{[^}]+\}/.test(v)) hasEnvVars = true;
          // Heurística: valor largo sin ${} podría ser un secreto literal
          if (typeof v === "string" && v.length > 20 && !/\$\{/.test(v)) hasLiteralSecret = true;
        }
      }
    }

    let sc = 6;
    if (serverNames.length >= 2 || hasEnvVars) sc = 8;
    if ((serverNames.length >= 2 || hasEnvVars) && !hasLiteralSecret) sc = 10;
    if (hasLiteralSecret) sc = Math.min(sc, 3);

    const gain = 10 - sc;
    return {
      name: "mcp",
      score: sc,
      evidence,
      nextAction: sc < 6
        ? "Crea .kiro/settings/mcp.json con al menos un servidor en mcpServers."
        : sc < 10
        ? "Agrega un segundo servidor o usa variables ${VAR} en env."
        : "MCP excelente.",
      nextMove: move("mcp", gain,
        sc < 6
          ? `Crear mcp.json con mcpServers (+${gain}pts)`
          : `Agregar env con variables \${VAR} (+${gain}pts)`),
    };
  }

  private _zero(reason: string): DimensionResult {
    return {
      name: "mcp", score: 0, evidence: [reason],
      nextAction: "Crea .kiro/settings/mcp.json con mcpServers.",
      nextMove: move("mcp", 10, "Crear mcp.json con 2+ servidores y env ${VAR} (+10pts)"),
    };
  }
}

// ── 6. powers ────────────────────────────────────────────────────────────────

export class PowersDimension implements Dimension {
  readonly name: DimensionName = "powers";

  score(ctx: DimensionContext): DimensionResult {
    const powerFiles = filesUnder(ctx.files, "power/");
    const readmeFiles = powerFiles.filter(f => f.path.endsWith("README.md") && hasRealContent(f.content!, 100));
    const manifestFiles = powerFiles.filter(f => f.path.endsWith("package.json") && tryJson(f.content!));
    const evidence: string[] = [];

    for (const f of readmeFiles) evidence.push(f.path);
    for (const f of manifestFiles) evidence.push(f.path);

    let sc = 0;
    if (readmeFiles.length >= 1) sc = 4;
    if (readmeFiles.length >= 1 && manifestFiles.length >= 1) sc = 7;
    if (readmeFiles.length >= 1 && manifestFiles.length >= 1 && powerFiles.length >= 3) sc = 10;

    const gain = 10 - sc;
    return {
      name: "powers",
      score: sc,
      evidence: evidence.length ? evidence : ["Sin carpeta power/ con contenido real"],
      nextAction: sc < 4
        ? "Crea power/<nombre>/README.md con descripción del Power instalable."
        : sc < 10
        ? "Agrega package.json al Power y más archivos de configuración."
        : "Power en excelente estado.",
      nextMove: move("powers", gain,
        sc < 4
          ? `Crear power/<nombre>/README.md (+${gain}pts)`
          : `Agregar package.json y configuración al Power (+${gain}pts)`),
    };
  }
}

// ── 7. agents ────────────────────────────────────────────────────────────────

export class AgentsDimension implements Dimension {
  readonly name: DimensionName = "agents";

  score(ctx: DimensionContext): DimensionResult {
    const agentFiles = filesUnder(ctx.files, ".kiro/agents/");
    const evidence: string[] = [];
    let validAgents = 0;
    let hasPermissionRules = false;

    for (const f of agentFiles) {
      if (!f.path.endsWith(".json")) continue;
      const data = tryJson(f.content!) as Record<string, unknown> | null;
      if (!data) { ctx.warnings.push(`Agent JSON inválido: ${f.path}`); continue; }
      const tools = (data as Record<string, unknown>)["tools"] as unknown[] | undefined;
      const resources = (data as Record<string, unknown>)["resources"];
      if (!tools || !resources) continue;
      // No wildcard tools
      if (tools.some(t => t === "*")) continue;
      validAgents++;
      evidence.push(f.path);
      const perms = (data as Record<string, unknown>)["permissions"] as Record<string, unknown> | undefined;
      if (perms?.["rules"]) hasPermissionRules = true;
    }

    let sc = 0;
    if (validAgents >= 1) sc = 6;
    if (validAgents >= 3 && hasPermissionRules) sc = 10;
    else if (validAgents >= 2) sc = 8;

    const gain = 10 - sc;
    return {
      name: "agents",
      score: sc,
      evidence: evidence.length ? evidence : ["Sin perfiles de agente válidos"],
      nextAction: sc < 6
        ? "Crea .kiro/agents/<nombre>.json con tools (sin *) y resources."
        : sc < 10
        ? "Agrega 3+ agentes con permissions.rules."
        : "Agentes en excelente estado.",
      nextMove: move("agents", gain,
        sc < 6
          ? `Crear agent.json con tools y resources (+${gain}pts)`
          : `Agregar permissions.rules a 3+ agentes (+${gain}pts)`),
    };
  }
}

// ── 8. workflows ──────────────────────────────────────────────────────────────

export class WorkflowsDimension implements Dimension {
  readonly name: DimensionName = "workflows";

  score(ctx: DimensionContext): DimensionResult {
    const wfFiles = filesUnder(ctx.files, ".kiro/workflows/");
    const evidence: string[] = [];
    let validWorkflows = 0;
    let hasRepeat = false;
    let hasParallel = false;

    for (const f of wfFiles) {
      if (!f.path.endsWith(".json") && !f.path.endsWith(".yaml") && !f.path.endsWith(".yml")) continue;
      const data = tryJson(f.content!) as Record<string, unknown> | null;
      if (!data) { ctx.warnings.push(`Workflow inválido: ${f.path}`); continue; }
      const nodes = (data as Record<string, unknown>)["nodes"] ?? (data as Record<string, unknown>)["steps"];
      if (!Array.isArray(nodes) || nodes.length < 2) continue;
      validWorkflows++;
      evidence.push(`${f.path} — ${nodes.length} nodos`);
      const text = f.content!;
      if (/repeat/i.test(text)) hasRepeat = true;
      if (/parallel/i.test(text)) hasParallel = true;
    }

    let sc = 0;
    if (validWorkflows >= 1) sc = 6;
    if (validWorkflows >= 1 && hasRepeat && hasParallel) sc = 10;
    else if (validWorkflows >= 1 && (hasRepeat || hasParallel)) sc = 8;

    const gain = 10 - sc;
    return {
      name: "workflows",
      score: sc,
      evidence: evidence.length ? evidence : ["Sin workflows con 2+ nodos"],
      nextAction: sc < 6
        ? "Crea .kiro/workflows/<nombre>.json con al menos 2 nodos."
        : sc < 10
        ? "Agrega nodos repeat y parallel al workflow."
        : "Workflows en excelente estado.",
      nextMove: move("workflows", gain,
        sc < 6
          ? `Crear workflow.json con 2+ nodos (+${gain}pts)`
          : `Agregar repeat y parallel a un workflow (+${gain}pts)`),
    };
  }
}

// ── 9. protection ─────────────────────────────────────────────────────────────

export class ProtectionDimension implements Dimension {
  readonly name: DimensionName = "protection";

  score(ctx: DimensionContext): DimensionResult {
    const kiroignore = fileExact(ctx.files, ".kiroignore");
    const hasKiroignore = kiroignore !== undefined && hasRealContent(kiroignore.content!, 3);

    // Count blocking hooks
    let blockingHooks = 0;
    for (const f of filesUnder(ctx.files, ".kiro/hooks/")) {
      if (!f.path.endsWith(".json")) continue;
      const data = tryJson(f.content!) as Record<string, unknown> | null;
      if (!data) continue;
      const ver = (data as Record<string, unknown>)["version"];
      if (ver !== "v1" && ver !== 1) continue;
      const hooks = (data as Record<string, unknown>)["hooks"];
      if (!Array.isArray(hooks)) continue;
      for (const h of hooks) {
        const hObj = h as Record<string, unknown>;
        const trigger = (hObj["trigger"] ?? hObj["type"]) as string | undefined;
        if (trigger && BLOCKING.has(trigger)) blockingHooks++;
      }
    }

    // Agent with permission rules
    let agentWithRules = false;
    for (const f of filesUnder(ctx.files, ".kiro/agents/")) {
      const data = tryJson(f.content!) as Record<string, unknown> | null;
      if (!data) continue;
      const perms = (data as Record<string, unknown>)["permissions"] as Record<string, unknown> | undefined;
      if (perms?.["rules"]) { agentWithRules = true; break; }
    }

    const evidence: string[] = [];
    if (hasKiroignore) evidence.push(".kiroignore con contenido");
    if (blockingHooks > 0) evidence.push(`${blockingHooks} hook(s) bloqueante(s)`);
    if (agentWithRules) evidence.push("Agente con permissions.rules");

    let sc = 0;
    if (hasKiroignore && blockingHooks >= 1) sc = 6;
    if (hasKiroignore && blockingHooks >= 2 && agentWithRules) sc = 10;
    else if (hasKiroignore && blockingHooks >= 2) sc = 8;

    const gain = 10 - sc;
    return {
      name: "protection",
      score: sc,
      evidence: evidence.length ? evidence : ["Sin .kiroignore ni hooks bloqueantes"],
      nextAction: sc < 6
        ? "Crea .kiroignore con patrones y un hook PreToolUse bloqueante."
        : sc < 10
        ? "Agrega 2+ hooks bloqueantes y un agente con permissions.rules."
        : "Protección excelente.",
      nextMove: move("protection", gain,
        sc < 6
          ? `Crear .kiroignore y hook PreToolUse (+${gain}pts)`
          : `Agregar 2+ hooks bloqueantes y permissions.rules (+${gain}pts)`),
    };
  }
}

// ── 10. traceability ──────────────────────────────────────────────────────────

export class TraceabilityDimension implements Dimension {
  readonly name: DimensionName = "traceability";

  score(ctx: DimensionContext): DimensionResult {
    const testFiles = ctx.files.filter(f =>
      (f.path.startsWith("tests/") || f.path.startsWith("packages/") ) &&
      (f.path.endsWith(".test.ts") || f.path.endsWith(".test.js") || f.path.endsWith(".spec.ts"))
      && f.content !== null
    );

    const evidenceFiles = ctx.files.filter(f =>
      f.path.startsWith("docs/evidence/") && f.content !== null && f.content.trim().length > 0
    );

    const e2eTests = testFiles.filter(f => f.path.includes("e2e"));
    const hasTaskRefs = evidenceFiles.some(f => /\[kiro:/.test(f.content!));

    const evidence: string[] = [];
    if (testFiles.length) evidence.push(`${testFiles.length} archivo(s) de test`);
    if (evidenceFiles.length) evidence.push(`${evidenceFiles.length} archivo(s) de evidencia`);
    if (e2eTests.length) evidence.push(`${e2eTests.length} test(s) e2e`);

    let sc = 0;
    if (testFiles.length >= 1) sc = 4;
    if (testFiles.length >= 1 && evidenceFiles.length >= 1) sc = 6;
    if (testFiles.length >= 1 && evidenceFiles.length >= 1 && e2eTests.length >= 1 && hasTaskRefs) sc = 10;
    else if (testFiles.length >= 1 && evidenceFiles.length >= 1 && e2eTests.length >= 1) sc = 8;

    const gain = 10 - sc;
    return {
      name: "traceability",
      score: sc,
      evidence: evidence.length ? evidence : ["Sin tests ni evidencia"],
      nextAction: sc < 6
        ? "Agrega archivos de test y docs/evidence/ con al menos una línea."
        : sc < 10
        ? "Agrega tests e2e y referencias [kiro:<spec>] en evidencia."
        : "Trazabilidad excelente.",
      nextMove: move("traceability", gain,
        sc < 6
          ? `Crear tests y docs/evidence/ledger.jsonl (+${gain}pts)`
          : `Agregar tests e2e con referencias [kiro:...] (+${gain}pts)`),
    };
  }
}

// ── Exportación ordenada ──────────────────────────────────────────────────────

export const ALL_DIMENSIONS: Dimension[] = [
  new AgentsDimension(),
  new HooksDimension(),
  new McpDimension(),
  new PowersDimension(),
  new ProtectionDimension(),
  new SkillsDimension(),
  new SpecsDimension(),
  new SteeringDimension(),
  new TraceabilityDimension(),
  new WorkflowsDimension(),
];

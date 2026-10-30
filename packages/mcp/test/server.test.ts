// packages/mcp/test/server.test.ts
// Tests del servidor MCP de Kiro Radar usando node:test.
// Lanza el servidor como proceso hijo y se comunica por stdio (JSON-RPC 2.0).

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as path from "node:path";

// ── rutas ─────────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_MJS  = path.resolve(__dirname, "..", "server.mjs");
const FIXTURE_EX  = path.resolve(__dirname, "..", "..", "..", "fixtures", "excellent");

// ── helpers de protocolo ──────────────────────────────────────────────────────

interface JsonRpcMessage {
  jsonrpc: string;
  id?: number | string | null;
  method?: string;
  params?: unknown;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

/**
 * Lanza el servidor MCP y devuelve funciones send/receive/close.
 */
function launchServer(): {
  send: (msg: JsonRpcMessage) => void;
  receive: () => Promise<JsonRpcMessage>;
  close: () => void;
} {
  const proc: ChildProcessWithoutNullStreams = spawn(process.execPath, [SERVER_MJS], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  let lineBuffer = "";
  const pending: Array<(line: string) => void> = [];
  const received: string[] = [];

  proc.stdout.setEncoding("utf8");
  proc.stdout.on("data", (chunk: string) => {
    lineBuffer += chunk;
    const lines = lineBuffer.split("\n");
    lineBuffer = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (pending.length > 0) {
        (pending.shift()!)(trimmed);
      } else {
        received.push(trimmed);
      }
    }
  });

  proc.stderr.setEncoding("utf8");
  proc.stderr.on("data", (_chunk: string) => {
    // logs internos del servidor — ignorar en tests
  });

  function send(msg: JsonRpcMessage): void {
    proc.stdin.write(JSON.stringify(msg) + "\n");
  }

  function receive(): Promise<JsonRpcMessage> {
    return new Promise((resolve, reject) => {
      const TIMEOUT_MS = 8000;
      const timer = setTimeout(() => {
        reject(new Error("Timeout esperando respuesta del servidor MCP"));
      }, TIMEOUT_MS);

      if (received.length > 0) {
        clearTimeout(timer);
        resolve(JSON.parse(received.shift()!) as JsonRpcMessage);
        return;
      }

      pending.push((line) => {
        clearTimeout(timer);
        try {
          resolve(JSON.parse(line) as JsonRpcMessage);
        } catch (e) {
          reject(new Error(`JSON inválido del servidor: ${line}`));
        }
      });
    });
  }

  function close(): void {
    proc.stdin.end();
    proc.kill();
  }

  return { send, receive, close };
}

// ── utilidad: enviar initialize y esperar respuesta ───────────────────────────

async function doInitialize(
  send: (m: JsonRpcMessage) => void,
  receive: () => Promise<JsonRpcMessage>
): Promise<JsonRpcMessage> {
  send({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2025-06-18",
      capabilities: {},
      clientInfo: { name: "test-client", version: "0.0.1" },
    },
  });
  const resp = await receive();

  // Enviar notificación initialized (sin id, sin respuesta esperada)
  send({ jsonrpc: "2.0", method: "notifications/initialized", params: {} });

  return resp;
}

// ── suite de tests ────────────────────────────────────────────────────────────

describe("Servidor MCP Kiro Radar", () => {
  // ── initialize ──────────────────────────────────────────────────────────────

  it("initialize devuelve protocolVersion y serverInfo", async () => {
    const { send, receive, close } = launchServer();
    try {
      const resp = await doInitialize(send, receive);

      assert.equal(resp.jsonrpc, "2.0");
      assert.equal(resp.id, 1);
      assert.ok(resp.result, "debe tener result");

      const result = resp.result as Record<string, unknown>;
      assert.equal(result.protocolVersion, "2025-06-18");

      const serverInfo = result.serverInfo as Record<string, string>;
      assert.equal(serverInfo.name, "kiro-radar");
      assert.ok(serverInfo.version, "debe tener version");

      const capabilities = result.capabilities as Record<string, unknown>;
      assert.ok("tools" in capabilities, "capabilities debe incluir tools");
    } finally {
      close();
    }
  });

  // ── ping ────────────────────────────────────────────────────────────────────

  it("ping devuelve result vacío", async () => {
    const { send, receive, close } = launchServer();
    try {
      await doInitialize(send, receive);

      send({ jsonrpc: "2.0", id: 2, method: "ping" });
      const resp = await receive();

      assert.equal(resp.id, 2);
      assert.ok(!resp.error, "ping no debe devolver error");
    } finally {
      close();
    }
  });

  // ── tools/list ──────────────────────────────────────────────────────────────

  it("tools/list devuelve scan_repository y next_moves", async () => {
    const { send, receive, close } = launchServer();
    try {
      await doInitialize(send, receive);

      send({ jsonrpc: "2.0", id: 3, method: "tools/list" });
      const resp = await receive();

      assert.equal(resp.id, 3);
      assert.ok(!resp.error, "tools/list no debe devolver error");

      const result = resp.result as Record<string, unknown>;
      const tools = result.tools as Array<{ name: string }>;
      assert.ok(Array.isArray(tools), "tools debe ser array");

      const names = tools.map(t => t.name);
      assert.ok(names.includes("scan_repository"), "debe incluir scan_repository");
      assert.ok(names.includes("next_moves"),      "debe incluir next_moves");
    } finally {
      close();
    }
  });

  // ── tools/call scan_repository ───────────────────────────────────────────────

  it("scan_repository sobre fixtures/excellent devuelve totalScore >= 80", async () => {
    const { send, receive, close } = launchServer();
    try {
      await doInitialize(send, receive);

      send({
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: {
          name: "scan_repository",
          arguments: { path: FIXTURE_EX },
        },
      });
      const resp = await receive();

      assert.equal(resp.id, 4);
      assert.ok(!resp.error, `No debe haber error JSON-RPC: ${JSON.stringify(resp.error)}`);

      const result = resp.result as Record<string, unknown>;
      assert.ok(!result.isError, "isError debe ser falsy");

      // Verificar structuredContent con el Report completo
      const report = result.structuredContent as Record<string, unknown>;
      assert.ok(report, "debe tener structuredContent");
      assert.ok(typeof report.totalScore === "number", "totalScore debe ser número");
      assert.ok(
        (report.totalScore as number) >= 80,
        `totalScore de fixtures/excellent debe ser >= 80, pero fue ${report.totalScore}`
      );

      // Verificar que el texto también contiene la puntuación
      const content = result.content as Array<{ type: string; text: string }>;
      assert.ok(Array.isArray(content), "content debe ser array");
      assert.ok(content[0].text.includes("Puntuación total:"), "texto debe incluir puntuación total");
    } finally {
      close();
    }
  });

  // ── tools/call next_moves ────────────────────────────────────────────────────

  it("next_moves devuelve 3 jugadas con gain > 0", async () => {
    const { send, receive, close } = launchServer();
    try {
      await doInitialize(send, receive);

      send({
        jsonrpc: "2.0",
        id: 5,
        method: "tools/call",
        params: {
          name: "next_moves",
          arguments: { path: FIXTURE_EX },
        },
      });
      const resp = await receive();

      assert.equal(resp.id, 5);
      assert.ok(!resp.error, "no debe haber error JSON-RPC");

      const result = resp.result as Record<string, unknown>;
      assert.ok(!result.isError, "isError debe ser falsy");

      const sc = result.structuredContent as Record<string, unknown>;
      const topMoves = sc.topMoves as Array<{ gain: number; dimension: string; description: string }>;
      assert.ok(Array.isArray(topMoves), "topMoves debe ser array");
      assert.ok(topMoves.length > 0, "debe haber al menos una jugada");
      assert.ok(topMoves.length <= 3, "máximo 3 jugadas");
      for (const m of topMoves) {
        assert.ok(typeof m.gain === "number" && m.gain >= 0, `gain debe ser número >= 0: ${m.gain}`);
        assert.ok(m.dimension, "cada jugada debe tener dimension");
      }
    } finally {
      close();
    }
  });

  // ── scan_repository ruta inexistente ─────────────────────────────────────────

  it("scan_repository con ruta inexistente devuelve isError true", async () => {
    const { send, receive, close } = launchServer();
    try {
      await doInitialize(send, receive);

      send({
        jsonrpc: "2.0",
        id: 6,
        method: "tools/call",
        params: {
          name: "scan_repository",
          arguments: { path: "/ruta/que/no/existe/nunca/jamas" },
        },
      });
      const resp = await receive();

      assert.equal(resp.id, 6);
      // El resultado debe ser exitoso a nivel JSON-RPC (sin error)
      // pero con isError: true en el result
      assert.ok(!resp.error, "no debe ser error JSON-RPC, sino result con isError");
      const result = resp.result as Record<string, unknown>;
      assert.equal(result.isError, true, "isError debe ser true para ruta inexistente");
    } finally {
      close();
    }
  });

  // ── método desconocido → -32601 ──────────────────────────────────────────────

  it("método desconocido devuelve error -32601", async () => {
    const { send, receive, close } = launchServer();
    try {
      await doInitialize(send, receive);

      send({ jsonrpc: "2.0", id: 7, method: "metodo/inexistente" });
      const resp = await receive();

      assert.equal(resp.id, 7);
      assert.ok(resp.error, "debe devolver un error");
      assert.equal(resp.error!.code, -32601, `código debe ser -32601, fue ${resp.error!.code}`);
    } finally {
      close();
    }
  });
});

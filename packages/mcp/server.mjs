#!/usr/bin/env node
// packages/mcp/server.mjs
// Servidor MCP para Kiro Radar — JSON-RPC 2.0 sobre stdio (newline-delimited).
// Herramientas: scan_repository, next_moves.
// Logs únicamente a stderr. stdout solo emite JSON-RPC.

import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import * as path from "node:path";
import { scanRepository } from "../core/src/index.ts";

// ── constantes ───────────────────────────────────────────────────────────────

const SERVER_NAME    = "kiro-radar";
const SERVER_VERSION = "0.1.0";
const PROTOCOL_VER   = "2025-06-18";

// ── utilidades de transporte ─────────────────────────────────────────────────

/** Escribe un mensaje JSON-RPC en stdout seguido de newline. */
function send(msg) {
  process.stdout.write(JSON.stringify(msg) + "\n");
}

/** Construye una respuesta de error JSON-RPC. */
function errorReply(id, code, message, data) {
  const err = { code, message };
  if (data !== undefined) err.data = data;
  return { jsonrpc: "2.0", id, error: err };
}

/** Construye una respuesta de resultado JSON-RPC. */
function successReply(id, result) {
  return { jsonrpc: "2.0", id, result };
}

// ── definición de herramientas ────────────────────────────────────────────────

const TOOLS = [
  {
    name: "scan_repository",
    description:
      "Escanea un repositorio y devuelve su puntuación Kiro: totalScore (0-100) y desglose por las 10 dimensiones. También incluye el Report completo en structuredContent.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Ruta al repositorio a escanear. Por defecto '.'.",
          default: ".",
        },
      },
      required: [],
    },
  },
  {
    name: "next_moves",
    description:
      "Devuelve las 3 próximas jugadas de Kiro con mayor ganancia de puntos para el repositorio indicado.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Ruta al repositorio a analizar. Por defecto '.'.",
          default: ".",
        },
      },
      required: [],
    },
  },
];

// ── lógica de herramientas ────────────────────────────────────────────────────

/**
 * Ejecuta scan_repository y devuelve { content, structuredContent }.
 * Si la ruta no existe devuelve { content con isError:true }.
 */
async function toolScanRepository(args) {
  const repoPath = (args && typeof args.path === "string" && args.path.trim()) ? args.path.trim() : ".";

  let report;
  try {
    report = await scanRepository(repoPath);
  } catch (err) {
    return {
      content: [{ type: "text", text: `Error al escanear: ${err.message}` }],
      isError: true,
    };
  }

  if (report.error) {
    return {
      content: [{ type: "text", text: `Error: ${report.error}` }],
      isError: true,
    };
  }

  // Texto legible por humanos
  const lines = [
    `Repositorio: ${report.repoName}`,
    `Puntuación total: ${report.totalScore}/100`,
    "",
    "Dimensiones:",
    ...report.dimensions.map(d =>
      `  ${d.name.padEnd(14)} ${String(d.score).padStart(2)}/10   ${d.nextAction}`
    ),
    "",
    "⚡ Próximas jugadas:",
    ...report.topMoves.map((m, i) =>
      `  ${i + 1}. [+${m.gain}pts] ${m.description}`
    ),
  ];
  if (report.warnings.length) {
    lines.push("", `⚠ Advertencias: ${report.warnings.join("; ")}`);
  }

  return {
    content: [{ type: "text", text: lines.join("\n") }],
    structuredContent: report,
  };
}

/**
 * Ejecuta next_moves y devuelve las 3 jugadas top como texto.
 */
async function toolNextMoves(args) {
  const repoPath = (args && typeof args.path === "string" && args.path.trim()) ? args.path.trim() : ".";

  let report;
  try {
    report = await scanRepository(repoPath);
  } catch (err) {
    return {
      content: [{ type: "text", text: `Error al escanear: ${err.message}` }],
      isError: true,
    };
  }

  if (report.error) {
    return {
      content: [{ type: "text", text: `Error: ${report.error}` }],
      isError: true,
    };
  }

  const lines = [
    `Repositorio: ${report.repoName} (${report.totalScore}/100)`,
    "",
    "⚡ PRÓXIMAS JUGADAS (mayor ganancia primero):",
    ...report.topMoves.map((m, i) =>
      `  ${i + 1}. [+${m.gain}pts] [${m.dimension}] ${m.description}`
    ),
  ];

  return {
    content: [{ type: "text", text: lines.join("\n") }],
    structuredContent: { repoName: report.repoName, totalScore: report.totalScore, topMoves: report.topMoves },
  };
}

// ── dispatcher de herramientas ────────────────────────────────────────────────

async function callTool(name, args) {
  switch (name) {
    case "scan_repository": return toolScanRepository(args);
    case "next_moves":      return toolNextMoves(args);
    default:
      // Herramienta desconocida: devolvemos isError true con mensaje claro
      return {
        content: [{ type: "text", text: `Herramienta desconocida: ${name}` }],
        isError: true,
      };
  }
}

// ── manejador de mensajes ─────────────────────────────────────────────────────

async function handleMessage(msg) {
  const { jsonrpc, id, method, params } = msg;

  // Solo JSON-RPC 2.0
  if (jsonrpc !== "2.0") {
    send(errorReply(id ?? null, -32600, "Invalid Request", "Se requiere jsonrpc:2.0"));
    return;
  }

  // Notificaciones (sin id): no se responde nunca
  if (id === undefined) {
    // notifications/initialized y cualquier otra notificación → silencio
    return;
  }

  switch (method) {
    // ── initialize ──────────────────────────────────────────────────────────
    case "initialize":
      send(successReply(id, {
        protocolVersion: PROTOCOL_VER,
        capabilities: { tools: {} },
        serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
      }));
      break;

    // ── ping ────────────────────────────────────────────────────────────────
    case "ping":
      send(successReply(id, {}));
      break;

    // ── tools/list ──────────────────────────────────────────────────────────
    case "tools/list":
      send(successReply(id, { tools: TOOLS }));
      break;

    // ── tools/call ──────────────────────────────────────────────────────────
    case "tools/call": {
      const toolName = params?.name;
      const toolArgs = params?.arguments ?? {};
      if (!toolName) {
        send(errorReply(id, -32602, "Invalid params", "Falta params.name"));
        return;
      }
      const toolResult = await callTool(toolName, toolArgs);
      send(successReply(id, toolResult));
      break;
    }

    // ── método desconocido ───────────────────────────────────────────────────
    default:
      send(errorReply(id, -32601, "Method not found", `Método desconocido: ${method}`));
  }
}

// ── loop de lectura por stdin ─────────────────────────────────────────────────

process.stderr.write(`[kiro-radar-mcp] iniciando (PID ${process.pid})\n`);

let buffer = "";

process.stdin.setEncoding("utf8");

process.stdin.on("data", (chunk) => {
  buffer += chunk;
  const lines = buffer.split("\n");
  buffer = lines.pop(); // la última parte puede estar incompleta

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let msg;
    try {
      msg = JSON.parse(trimmed);
    } catch {
      process.stderr.write(`[kiro-radar-mcp] JSON inválido ignorado: ${trimmed}\n`);
      continue;
    }

    handleMessage(msg).catch((err) => {
      process.stderr.write(`[kiro-radar-mcp] error interno: ${err.message}\n`);
      // Si tiene id, respondemos con error interno
      if (msg.id !== undefined) {
        send(errorReply(msg.id, -32603, "Internal error", err.message));
      }
    });
  }
});

process.stdin.on("end", () => {
  process.stderr.write("[kiro-radar-mcp] stdin cerrado, terminando.\n");
  process.exit(0);
});

process.on("uncaughtException", (err) => {
  process.stderr.write(`[kiro-radar-mcp] excepción no capturada: ${err.message}\n`);
  process.exit(1);
});

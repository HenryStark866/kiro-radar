// scope-guard.js - Validates writes against active WP locks and BOARD.md
// Exits with code 2 if write is outside allowed paths

const fs = require('fs');
const path = require('path');

const ALLOWED_TOOLS = ['fs_write', 'fs_append', 'str_replace', 'delete_file'];

function getActiveWP() {
  const locksDir = path.join(__dirname, '..', '..', 'docs', 'coordination', 'locks');
  try {
    const files = fs.readdirSync(locksDir);
    for (const file of files) {
      if (file.endsWith('.lock')) {
        const content = fs.readFileSync(path.join(locksDir, file), 'utf8');
        const match = content.match(/rama:\s*(.+)/);
        if (match) {
          const branch = match[1].trim();
          if (branch.startsWith('wp/')) {
            return file.replace('.lock', '');
          }
        }
      }
    }
  } catch (e) {
    // No locks directory or empty
  }
  return null;
}

function getExclusivePaths(boardPath, wpId) {
  try {
    const content = fs.readFileSync(boardPath, 'utf8');
    const lines = content.split('\n');
    for (const line of lines) {
      // Skip header and separator lines
      if (!line.includes('|') || line.startsWith('| -')) continue;

      const parts = line.split('|');
      if (parts.length >= 6) {
        const wpField = parts[1].trim();
        if (wpField === wpId) {
          const pathsPart = parts[3].trim();
          // Remove backticks and parentheses, split by comma, keep only first token per path
          const cleanPaths = pathsPart
            .replace(/`/g, '')
            .replace(/\(/g, '')
            .replace(/\)/g, '')
            .split(',')
            .map(p => p.trim().split(' ')[0]);
          return cleanPaths;
        }
      }
    }
  } catch (e) {
    // Error reading BOARD.md
  }
  return [];
}

function normalizePath(filePath, rootDir) {
  // Resolve the path first to prevent traversal attacks like ../../packages/x.ts
  const resolvedPath = path.resolve(filePath);

  // Normalize Windows backslashes to forward slashes
  let normalized = resolvedPath.replace(/\\/g, '/');

  // Normalize rootDir for comparison (case-insensitive for Windows)
  const rootDirNormalized = rootDir.replace(/\\/g, '/').toLowerCase();

  // Resolve rootDir to absolute and lowercase for consistent comparison
  const rootDirAbsolute = path.resolve(rootDir).replace(/\\/g, '/').toLowerCase();

  // Make relative to root
  if (normalized.toLowerCase().startsWith(rootDirAbsolute)) {
    normalized = normalized.substring(rootDirAbsolute.length);
  }

  // Remove leading slash if present
  if (normalized.startsWith('/')) {
    normalized = normalized.substring(1);
  }

  // Block any path that resolves outside root (after normalization)
  // If normalized path contains .. it means it escaped the root
  if (normalized.includes('..')) {
    return null; // Block traversal
  }

  return normalized;
}

function isPathExcluded(normalizedPath) {
  // Exclusion: .kiro/specs/ must never be written
  if (normalizedPath.startsWith('.kiro/specs/')) {
    return true;
  }
  return false;
}

function isWriteAllowed(normalizedPath, exclusivePaths, rootDir) {
  // Block if normalizedPath is null (traversal detected)
  if (normalizedPath === null) {
    return false;
  }

  // Always allow these paths
  const allowedPatterns = [
    'docs/coordination/',
    'docs/TOOLS-MATRIX.md',
    'MEMORY.md',
    '.kiro/tmp/' // For debug logging
  ];

  for (const pattern of allowedPatterns) {
    if (normalizedPath.toLowerCase().startsWith(pattern.toLowerCase())) {
      return true;
    }
  }

  // Check if write is in the active WP's exclusive paths
  if (exclusivePaths.length > 0) {
    for (const exclusivePath of exclusivePaths) {
      // Normalize pattern to lowercase for comparison
      const patternLower = exclusivePath.toLowerCase();

      if (normalizedPath.toLowerCase().startsWith(patternLower) || patternLower === 'raíz') {
        // Additional check: ensure it's not excluded
        if (!isPathExcluded(normalizedPath)) {
          return true;
        }
      }
    }
  }

  return false;
}

function extractFilePath(input) {
  // Try different JSON formats based on real payloads
  if (input.params && input.params.path) {
    return input.params.path;
  }
  if (input.filePath) {
    return input.filePath;
  }
  if (input.tool_input && input.tool_input.path) {
    return input.tool_input.path;
  }
  if (input.arguments && input.arguments[0]) {
    return input.arguments[0];
  }
  return null;
}

function main() {
  const rootDir = path.resolve(__dirname, '..', '..').split(path.sep).join('/');
  const boardPath = path.join(rootDir, 'docs', 'coordination', 'BOARD.md').split(path.sep).join('/');

  // Read stdin for tool input
  let toolInput = '';
  process.stdin.on('data', chunk => { toolInput += chunk; });

  process.stdin.on('end', () => {
    try {
      const input = JSON.parse(toolInput);

      if (input.tool_name && !ALLOWED_TOOLS.includes(input.tool_name)) {
        console.error(`Herramienta no permitida: ${input.tool_name}`);
        process.exit(0);
      }

      const filePath = extractFilePath(input);

      if (!filePath) {
        const message = JSON.stringify({
          hookSpecificOutput: {
            permissionDecision: 'deny',
            permissionDecisionReason: 'No se pudo determinar la ruta de escritura. Bloqueo por seguridad.'
          }
        });
        console.log(message);
        console.error('Bloqueo: No se pudo determinar la ruta de escritura.');
        process.exit(2);
      }

      const normalizedPath = normalizePath(filePath, rootDir);
      const activeWP = getActiveWP();
      const exclusivePaths = activeWP ? getExclusivePaths(boardPath, activeWP) : [];

      // Block if path traversal was detected (normalizedPath is null)
      if (normalizedPath === null) {
        const message = JSON.stringify({
          hookSpecificOutput: {
            permissionDecision: 'deny',
            permissionDecisionReason: `Escritura fuera de alcance. Ruta: ${filePath}. Bloqueo por detección de traversal.`
          }
        });
        console.log(message);
        console.error('Bloqueo: Escritura fuera de alcance - detección de traversal.');
        process.exit(2);
      }

      // Special case: .kiro/specs/ is always excluded
      if (isPathExcluded(normalizedPath)) {
        const message = JSON.stringify({
          hookSpecificOutput: {
            permissionDecision: 'deny',
            permissionDecisionReason: `Escritura en ruta excluida: ${normalizedPath}. No se permite escribir en .kiro/specs/`
          }
        });
        console.log(message);
        console.error('Bloqueo: Escritura en ruta excluida: .kiro/specs/.');
        process.exit(2);
      }

      if (isWriteAllowed(normalizedPath, exclusivePaths, rootDir)) {
        process.exit(0);
      } else {
        const message = JSON.stringify({
          hookSpecificOutput: {
            permissionDecision: 'deny',
            permissionDecisionReason: `Escritura fuera de alcance. WP activo: ${activeWP || 'ninguno'}. Ruta: ${normalizedPath}. Ver BOARD.md y locks/`
          }
        });
        console.log(message);
        console.error(`Bloqueo: Escritura fuera de alcance - WP: ${activeWP || 'ninguno'}, Ruta: ${normalizedPath}`);
        process.exit(2);
      }
    } catch (e) {
      const message = JSON.stringify({
        hookSpecificOutput: {
          permissionDecision: 'deny',
          permissionDecisionReason: `Error al parsear input de herramienta. Bloqueo por seguridad: ${e.message}`
        }
      });
      console.log(message);
      console.error(`Bloqueo: Error al parsear input de herramienta - ${e.message}`);
      process.exit(2);
    }
  });
}

main();

// scope-guard.js - Validates writes against active WP locks and BOARD.md
// Exits with code 2 if write is outside allowed paths

const fs = require('fs');
const path = require('path');

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
        const wpField = parts[0].trim();
        if (wpField === wpId) {
          const pathsPart = parts[3].trim();
          // Remove backticks and parentheses, split by comma
          const cleanPaths = pathsPart
            .replace(/`/g, '')
            .replace(/\(/g, '')
            .replace(/\)/g, '')
            .split(',')
            .map(p => p.trim());
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
  // Normalize Windows backslashes to forward slashes
  let normalized = filePath.replace(/\\/g, '/');

  // Normalize rootDir for comparison
  const rootDirNormalized = rootDir.replace(/\\/g, '/');

  // Make relative to root
  if (normalized.startsWith(rootDirNormalized)) {
    normalized = normalized.substring(rootDirNormalized.length);
  }

  // Remove leading slash if present
  if (normalized.startsWith('/')) {
    normalized = normalized.substring(1);
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
  // Always allow these paths
  const allowedPatterns = [
    'docs/coordination/',
    'docs/TOOLS-MATRIX.md',
    'MEMORY.md',
    '.kiro/tmp/' // For debug logging
  ];

  for (const pattern of allowedPatterns) {
    if (normalizedPath.startsWith(pattern)) {
      return true;
    }
  }

  // Check if write is in the active WP's exclusive paths
  if (exclusivePaths.length > 0) {
    for (const exclusivePath of exclusivePaths) {
      // Remove leading dot and slash for comparison
      const cleanExclusive = exclusivePath.replace(/^\./, '').replace(/^\//, '');

      if (normalizedPath.startsWith(cleanExclusive) || cleanExclusive === 'raíz') {
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

      const filePath = extractFilePath(input);

      if (!filePath) {
        // Cannot determine file, block
        const message = JSON.stringify({
          hookSpecificOutput: {
            permissionDecision: 'deny',
            permissionDecisionReason: 'No se pudo determinar la ruta de escritura. Bloqueo por seguridad.'
          }
        });
        console.log(message);
        process.exit(2);
      }

      const normalizedPath = normalizePath(filePath, rootDir);
      const activeWP = getActiveWP();
      const exclusivePaths = activeWP ? getExclusivePaths(boardPath, activeWP) : [];

      // Special case: .kiro/specs/ is always excluded
      if (isPathExcluded(normalizedPath)) {
        const message = JSON.stringify({
          hookSpecificOutput: {
            permissionDecision: 'deny',
            permissionDecisionReason: `Escritura en ruta excluida: ${normalizedPath}. No se permite escribir en .kiro/specs/`
          }
        });
        console.log(message);
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
        process.exit(2);
      }
    } catch (e) {
      // Error parsing, block
      const message = JSON.stringify({
        hookSpecificOutput: {
          permissionDecision: 'deny',
          permissionDecisionReason: `Error al parsear input de herramienta. Bloqueo por seguridad: ${e.message}`
        }
      });
      console.log(message);
      process.exit(2);
    }
  });
}

main();

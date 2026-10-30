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
      if (line.includes(wpId) && line.includes('|')) {
        const parts = line.split('|');
        if (parts.length >= 4) {
          const pathsPart = parts[3].trim();
          return pathsPart.split(',').map(p => p.trim());
        }
      }
    }
  } catch (e) {
    // Error reading BOARD.md
  }
  return [];
}

function isWriteAllowed(filePath, activeWP, exclusivePaths) {
  // Always allow these paths
  const allowedPatterns = [
    'docs/coordination/',
    'docs/TOOLS-MATRIX.md',
    'MEMORY.md'
  ];

  for (const pattern of allowedPatterns) {
    if (filePath.includes(pattern)) {
      return true;
    }
  }

  // Check if write is in the active WP's exclusive paths
  if (activeWP && exclusivePaths.length > 0) {
    for (const exclusivePath of exclusivePaths) {
      if (filePath.includes(exclusivePath) || exclusivePath === 'raíz') {
        return true;
      }
    }
  }

  return false;
}

function main() {
  const rootDir = path.join(__dirname, '..', '..');
  const boardPath = path.join(rootDir, 'docs', 'coordination', 'BOARD.md');

  // Read stdin for tool input
  let toolInput = '';
  process.stdin.on('data', chunk => { toolInput += chunk; });
  
  process.stdin.on('end', () => {
    try {
      const input = JSON.parse(toolInput);
      
      // Determine which file is being written
      let filePath = '';
      if (input.params && input.params.path) {
        filePath = input.params.path;
      } else if (input.filePath) {
        filePath = input.filePath;
      } else if (input.arguments && input.arguments[0]) {
        filePath = input.arguments[0];
      }

      if (!filePath) {
        // Cannot determine file, allow
        process.exit(0);
      }

      // Normalize path
      filePath = path.relative(rootDir, filePath).replace(/\\/g, '/');

      const activeWP = getActiveWP();
      const exclusivePaths = activeWP ? getExclusivePaths(boardPath, activeWP) : [];

      if (isWriteAllowed(filePath, activeWP, exclusivePaths)) {
        process.exit(0);
      } else {
        const message = JSON.stringify({
          hookSpecificOutput: {
            permissionDecision: 'deny',
            permissionDecisionReason: `Escritura fuera de alcance. WP activo: ${activeWP || 'ninguno'}. Ruta: ${filePath}. Ver BOARD.md y locks/`
          }
        });
        console.log(message);
        process.exit(2);
      }
    } catch (e) {
      // Error parsing, allow
      process.exit(0);
    }
  });
}

main();

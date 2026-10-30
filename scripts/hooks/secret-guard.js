// secret-guard.js - Blocks writes containing tokens and secrets
// Exits with code 2 if suspicious patterns detected

const fs = require('fs');
const path = require('path');

const SECRET_PATTERNS = [
  /api[_-]?key\s*[=:]\s*['"][a-zA-Z0-9]{20,}['"]/gi,
  /secret\s*[=:]\s*['"][^'"]+['"]/gi,
  /password\s*[=:]\s*['"][^'"]+['"]/gi,
  /token\s*[=:]\s*['"][a-zA-Z0-9_\-]{16,}['"]/gi,
  /AKIA[A-Z0-9]{16}/i,
  /AWS[_-]?SECRET[_-]?ACCESS[_-]?KEY\s*[=:]\s*['"][^'"]{20,}['"]/gi,
  /ghp_[a-zA-Z0-9]{36}/,
  /gho_[a-zA-Z0-9]{36}/,
  /ghs_[a-zA-Z0-9]{36}/,
  /ghr_[a-zA-Z0-9]{36}/,
  /sk[_-]?live[_-]?[a-zA-Z0-9]{20,}/i,
  /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*/i,
  /-----BEGIN (RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----/,
  /-----BEGIN PGP PRIVATE KEY BLOCK-----/
];

function containsSecrets(content) {
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(content)) {
      return true;
    }
  }
  return false;
}

function extractFileContent(input) {
  // Try different JSON formats based on real payloads
  if (input.params && input.params.text) {
    return input.params.text;
  }
  if (input.tool_input && input.tool_input.text) {
    return input.tool_input.text;
  }
  if (input.arguments && input.arguments[1]) {
    return input.arguments[1];
  }
  if (input.fileContent) {
    return input.fileContent;
  }
  return null;
}

function main() {
  let toolInput = '';
  process.stdin.on('data', chunk => { toolInput += chunk; });

  process.stdin.on('end', () => {
    try {
      const input = JSON.parse(toolInput);

      const fileContent = extractFileContent(input);

      // If content cannot be determined, block
      if (fileContent === null) {
        const message = JSON.stringify({
          hookSpecificOutput: {
            permissionDecision: 'deny',
            permissionDecisionReason: 'No se pudo determinar el contenido de escritura. Bloqueo por seguridad.'
          }
        });
        console.log(message);
        process.exit(2);
      }

      if (containsSecrets(fileContent)) {
        const message = JSON.stringify({
          hookSpecificOutput: {
            permissionDecision: 'deny',
            permissionDecisionReason: 'Posibles secretos o tokens detectados. No se permite escritura.'
          }
        });
        console.log(message);
        process.exit(2);
      }

      process.exit(0);
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

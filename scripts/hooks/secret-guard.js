// secret-guard.js - Blocks writes containing tokens and secrets
// Exits with code 2 if suspicious patterns detected

const fs = require('fs');
const path = require('path');

const SECRET_PATTERNS = [
  /api[_-]?key\s*[=:]\s*['"][a-zA-Z0-9]{20,}['"]/gi,
  /secret\s*[=:]\s*['"][^'"]+['"]/gi,
  /password\s*[=:]\s*['"][^'"]+['"]/gi,
  /token\s*[=:]\s*['"][a-zA-Z0-9_\-]{16,}['"]/gi,
  /AWS[_-]?ACCESS[_-]?KEY[_-]?ID\s*[=:]\s*['"]AKIA/i,
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

function main() {
  let toolInput = '';
  process.stdin.on('data', chunk => { toolInput += chunk; });
  
  process.stdin.on('end', () => {
    try {
      const input = JSON.parse(toolInput);
      
      let fileContent = '';
      let filePath = '';
      
      if (input.params) {
        if (input.params.text) {
          fileContent = input.params.text;
        }
        if (input.params.path) {
          filePath = input.params.path;
        }
      } else if (input.arguments) {
        fileContent = input.arguments[1] || '';
        filePath = input.arguments[0] || '';
      } else if (input.fileContent) {
        fileContent = input.fileContent;
        filePath = input.filePath || '';
      }

      if (containsSecrets(fileContent)) {
        const message = JSON.stringify({
          hookSpecificOutput: {
            permissionDecision: 'deny',
            permissionDecisionReason: `Posibles secretos o tokens detectados en ${filePath || 'archivo'}. No se permite escritura.`
          }
        });
        console.log(message);
        process.exit(2);
      }

      process.exit(0);
    } catch (e) {
      process.exit(0);
    }
  });
}

main();

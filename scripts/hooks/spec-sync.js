// spec-sync.js - Notifies if new file not mentioned in spec docs
// Checks against active spec's design.md and tasks.md

const fs = require('fs');
const path = require('path');

function normalizePath(filePath) {
  // Normalize Windows backslashes to forward slashes for comparison
  return filePath.replace(/\\/g, '/');
}

function getActiveSpec() {
  const specsDir = path.join(__dirname, '..', '..', '.kiro', 'specs');
  try {
    const files = fs.readdirSync(specsDir);
    return files.find(f => fs.statSync(path.join(specsDir, f)).isDirectory()) || null;
  } catch (e) {
    return null;
  }
}

function checkSpecDoc(specName, docName) {
  const docPath = path.join(__dirname, '..', '..', '.kiro', 'specs', specName, docName);
  if (fs.existsSync(docPath)) {
    return fs.readFileSync(docPath, 'utf8');
  }
  return '';
}

function isFileMentioned(filePath, docContent) {
  // Normalize path for comparison
  const normalizedPath = normalizePath(filePath);
  const baseName = path.basename(normalizedPath);

  return docContent.includes(baseName) || docContent.includes(normalizedPath);
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
  let toolInput = '';
  process.stdin.on('data', chunk => { toolInput += chunk; });

  process.stdin.on('end', () => {
    try {
      const input = JSON.parse(toolInput);

      const filePath = extractFilePath(input);

      if (!filePath) {
        process.exit(0);
      }

      const rootDir = normalizePath(path.join(__dirname, '..', '..'));
      const normalizedFilePath = normalizePath(filePath);
      const relPath = normalizePath(path.relative(rootDir, normalizedFilePath));

      if (!relPath.replace(/\\/g, '/').startsWith('packages/')) {
        process.exit(0);
      }

      const specName = getActiveSpec();
      if (!specName) {
        process.exit(0);
      }

      const designDoc = checkSpecDoc(specName, 'design.md');
      const tasksDoc = checkSpecDoc(specName, 'tasks.md');

      if (!isFileMentioned(filePath, designDoc) && !isFileMentioned(filePath, tasksDoc)) {
        console.log(`[spec-sync] Advertencia: ${relPath} no mencionado en design.md o tasks.md del spec activo (${specName})`);
      }

      process.exit(0);
    } catch (e) {
      process.exit(0);
    }
  });
}

main();

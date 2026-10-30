// spec-sync.js - Notifies if new file not mentioned in spec docs
// Checks against active spec's design.md and tasks.md

const fs = require('fs');
const path = require('path');

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

function isFileMentioned(filename, docContent) {
  const baseName = path.basename(filename);
  return docContent.includes(baseName) || docContent.includes(filename);
}

function main() {
  let toolInput = '';
  process.stdin.on('data', chunk => { toolInput += chunk; });
  
  process.stdin.on('end', () => {
    try {
      const input = JSON.parse(toolInput);
      let filePath = '';
      
      if (input.params && input.params.path) {
        filePath = input.params.path;
      } else if (input.filePath) {
        filePath = input.filePath;
      }

      if (!filePath) {
        process.exit(0);
      }

      const rootDir = path.join(__dirname, '..', '..');
      const relPath = path.relative(rootDir, filePath);
      
      if (!relPath.startsWith('packages/')) {
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

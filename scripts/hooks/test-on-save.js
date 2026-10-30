// test-on-save.js - Runs tests for affected package on file save
// Requires: npm test or pnpm test or yarn test in package directory

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

function getPackageRoot(filePath) {
  const packagesRoot = path.join(__dirname, '..', '..', 'packages');
  const relPath = path.relative(packagesRoot, filePath);
  if (relPath.startsWith('..') || relPath === '') return null;

  const parts = relPath.split(path.sep);
  const packageDir = path.join(packagesRoot, parts[0]);

  if (fs.existsSync(path.join(packageDir, 'package.json'))) {
    return packageDir;
  }

  return null;
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

      const packagesRoot = path.join(rootDir, 'packages');
      const relPathFromPackages = path.relative(packagesRoot, filePath);
      const parts = relPathFromPackages.split(path.sep);

      if (parts.length === 0) {
        process.exit(0);
      }

      const packageDir = path.join(packagesRoot, parts[0]);
      const packageJsonPath = path.join(packageDir, 'package.json');

      if (!fs.existsSync(packageJsonPath)) {
        process.exit(0);
      }

      try {
        execSync('npm run test', {
          cwd: packageDir,
          stdio: ['pipe', 'pipe', 'pipe']
        });
        console.log(`Tests passed for ${parts[0]}`);
        process.exit(0);
      } catch (e) {
        console.error(`Tests failed for ${parts[0]}:`, e.message);
        process.exit(0);
      }
    } catch (e) {
      process.exit(0);
    }
  });
}

main();

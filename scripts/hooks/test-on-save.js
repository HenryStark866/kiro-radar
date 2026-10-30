// test-on-save.js - Runs tests for affected package on file save
// Requires: npm test or pnpm test or yarn test in package directory

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

function normalizePath(filePath) {
  // Normalize Windows backslashes to forward slashes for comparison
  return filePath.replace(/\\/g, '/');
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
      } else if (input.tool_input && input.tool_input.path) {
        filePath = input.tool_input.path;
      }

      if (!filePath) {
        process.exit(0);
      }

      // Normalize path
      filePath = normalizePath(filePath);

      const rootDir = normalizePath(path.join(__dirname, '..', '..'));
      const relPath = normalizePath(path.relative(rootDir, filePath));

      // Check if starts with packages/ (now works on Windows)
      if (!relPath.startsWith('packages/')) {
        process.exit(0);
      }

      const packagesRoot = normalizePath(path.join(rootDir, 'packages'));
      const relPathFromPackages = normalizePath(path.relative(packagesRoot, filePath));
      const parts = relPathFromPackages.split('/');

      if (parts.length === 0 || parts[0] === '') {
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

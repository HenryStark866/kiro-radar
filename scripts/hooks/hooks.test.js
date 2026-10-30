// hooks.test.js - Test cases for hooks
// Usage: node scripts/hooks/hooks.test.js <hook_name>

const { execSync } = require('child_process');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const rootDirWindows = rootDir.replace(/\\/g, '/');
const docsCoordination = path.join(rootDir, 'docs', 'coordination').replace(/\\/g, '/');

// Test cases per hook
const testCases = {
  'scope-guard': [
    {
      name: 'allowed: BOARD.md (in docs/coordination/)',
      input: JSON.stringify({ params: { path: path.join(docsCoordination, 'BOARD.md') } }),
      expected: 'exit 0'
    },
    {
      name: 'allowed: .kiro/tmp file',
      input: JSON.stringify({ params: { path: path.join(rootDir, '.kiro', 'tmp', 'debug.log').replace(/\\/g, '/') } }),
      expected: 'exit 0'
    },
    {
      name: 'denied: other/file.txt',
      input: JSON.stringify({ params: { path: path.join(rootDir, 'other', 'file.txt').replace(/\\/g, '/') } }),
      expected: 'exit 2'
    },
    {
      name: 'denied: .kiro/specs/file.md',
      input: JSON.stringify({ params: { path: path.join(rootDir, '.kiro', 'specs', 'file.md').replace(/\\/g, '/') } }),
      expected: 'exit 2'
    },
    {
      name: 'denied: no path in input',
      input: JSON.stringify({}),
      expected: 'exit 2'
    },
    {
      name: 'denied: invalid JSON',
      input: 'invalid json',
      expected: 'exit 2'
    },
    {
      name: 'allowed: raíz (WP-01 exclusive)',
      input: JSON.stringify({ params: { path: path.join(rootDir, 'README.md') } }),
      expected: 'exit 0'
    },
    {
      name: 'denied: path cannot be determined',
      input: JSON.stringify({ otherKey: 'value' }),
      expected: 'exit 2'
    }
  ],
  'secret-guard': [
    {
      name: 'allowed: normal code',
      input: JSON.stringify({ tool_input: { text: 'console.log(1);' } }),
      expected: 'exit 0'
    },
    {
      name: 'denied: sk_live pattern',
      input: JSON.stringify({ tool_input: { text: 'const key = "sk_live_' + 'abcdefghij1234567890abcd"' } }),
      expected: 'exit 2'
    },
    {
      name: 'denied: AWS key pattern',
      input: JSON.stringify({ tool_input: { text: 'const key = "AKIAIOSFODNN7EXAMPLE"' } }),
      expected: 'exit 2'
    },
    {
      name: 'denied: no content in input',
      input: JSON.stringify({}),
      expected: 'exit 2'
    },
    {
      name: 'denied: invalid JSON',
      input: 'invalid json',
      expected: 'exit 2'
    }
  ],
  'evidence-ledger': [
    {
      name: 'allowed: with task data',
      input: JSON.stringify({ task: { spec: 'radar-core', name: '1.1. Create core types', branch: 'wp/WP-01' } }),
      expected: 'exit 0'
    },
    {
      name: 'allowed: empty input',
      input: JSON.stringify({}),
      expected: 'exit 0'
    },
    {
      name: 'denied: invalid JSON',
      input: 'invalid json',
      expected: 'exit 0' // Does not throw, just logs error
    }
  ],
  'test-on-save': [
    {
      name: 'allowed: packages/core file (Windows path)',
      input: JSON.stringify({ params: { path: path.join(rootDir, 'packages/core/src/index.ts').replace(/\\/g, '/') } }),
      expected: 'exit 0'
    },
    {
      name: 'allowed: non-package file',
      input: JSON.stringify({ params: { path: path.join(rootDir, 'scripts/hooks/test.js').replace(/\\/g, '/') } }),
      expected: 'exit 0'
    },
    {
      name: 'allowed: invalid JSON',
      input: 'invalid json',
      expected: 'exit 0'
    }
  ],
  'spec-sync': [
    {
      name: 'allowed: packages/core file',
      input: JSON.stringify({ params: { path: path.join(rootDir, 'packages/core/src/index.ts').replace(/\\/g, '/') } }),
      expected: 'exit 0'
    },
    {
      name: 'allowed: non-package file',
      input: JSON.stringify({ params: { path: path.join(rootDir, 'scripts/hooks/test.js').replace(/\\/g, '/') } }),
      expected: 'exit 0'
    },
    {
      name: 'allowed: invalid JSON',
      input: 'invalid json',
      expected: 'exit 0'
    }
  ],
  'session-handoff': [
    {
      name: 'allowed: empty input',
      input: JSON.stringify({}),
      expected: 'exit 0 with confirm block'
    }
  ]
};

function runHook(hookName, input) {
  const scriptPath = path.join(rootDir, 'scripts', 'hooks', `${hookName}.js`);
  try {
    // Use PowerShell to pass stdin
    const command = `echo '${input.replace(/'/g, "''")}' | node "${scriptPath}"`;
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: 'powershell'
    });
    return { output, exitCode: 0 };
  } catch (e) {
    return { output: e.stdout || '', exitCode: e.exitCode || 1 };
  }
}

function runAllTests() {
  let passed = 0;
  let failed = 0;

  console.log('=== Hooks Test Suite ===\n');

  for (const [hookName, cases] of Object.entries(testCases)) {
    console.log(`\n--- ${hookName} ---`);

    for (const testCase of cases) {
      const { output, exitCode } = runHook(hookName, testCase.input);
      const success = (exitCode === 0 && testCase.expected.includes('exit 0')) ||
        (exitCode === 2 && testCase.expected.includes('exit 2')) ||
        (hookName === 'session-handoff' && output.includes('confirm'));

      if (success) {
        console.log(`  ✓ ${testCase.name}`);
        passed++;
      } else {
        console.log(`  ✗ ${testCase.name} (expected: ${testCase.expected}, got exit: ${exitCode})`);
        console.log(`    Output: ${output.substring(0, 200)}`);
        failed++;
      }
    }
  }

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
  process.exit(failed > 0 ? 1 : 0);
}

function runSingleTest(hookName, testCaseIndex) {
  const cases = testCases[hookName];
  if (!cases) {
    console.log(`Unknown hook: ${hookName}`);
    process.exit(1);
  }

  const testCase = cases[testCaseIndex];
  if (!testCase) {
    console.log(`Unknown test case: ${testCaseIndex}`);
    process.exit(1);
  }

  console.log(`\nTesting: ${testCase.name}`);
  const { output, exitCode } = runHook(hookName, testCase.input);

  const success = (exitCode === 0 && testCase.expected.includes('exit 0')) ||
    (exitCode === 2 && testCase.expected.includes('exit 2')) ||
    (hookName === 'session-handoff' && output.includes('confirm'));

  if (success) {
    console.log(`  ✓ PASSED`);
  } else {
    console.log(`  ✗ FAILED (expected: ${testCase.expected}, got exit: ${exitCode})`);
    console.log(`    Output: ${output.substring(0, 200)}`);
  }

  process.exit(success ? 0 : 1);
}

// Main
const [, , hookName, index] = process.argv;

if (hookName && index) {
  runSingleTest(hookName, parseInt(index));
} else if (hookName) {
  runSingleTest(hookName, 0);
} else {
  runAllTests();
}

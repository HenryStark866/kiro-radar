// evidence-ledger.js - Logs task execution to docs/evidence/ledger.jsonl
// Appends JSON lines format: {"date":"...","spec":"...","task":"...","branch":"..."}

const fs = require('fs');
const path = require('path');

function getActiveSpecAndTask() {
  // Try to read from task execution context
  // In practice, this would come from stdin or environment
  return { spec: 'unknown', task: 'unknown' };
}

function getCurrentBranch() {
  try {
    const { execSync } = require('child_process');
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8', cwd: __dirname }).trim();
    return branch;
  } catch (e) {
    return 'unknown';
  }
}

function main() {
  let toolInput = '';
  let done = false;

  // Try to read stdin if data is available immediately
  if (process.stdin.isTTY) {
    // Terminal input, run directly
    runLedger();
    done = true;
  } else if (process.stdin.readable) {
    process.stdin.on('data', chunk => { toolInput += chunk; });
    process.stdin.on('end', () => { runLedger(); done = true; });
  } else {
    runLedger();
    done = true;
  }

  // Fallback for non-TTY without stdin data
  setTimeout(() => {
    if (!done) {
      runLedger();
    }
  }, 100);

  function runLedger() {
    try {
      const rootDir = path.join(__dirname, '..', '..');
      const ledgerPath = path.join(rootDir, 'docs', 'evidence', 'ledger.jsonl');

      const { spec, task } = getActiveSpecAndTask();
      const branch = getCurrentBranch();

      const entry = {
        date: new Date().toISOString().split('T')[0],
        spec: spec,
        task: task,
        branch: branch
      };

      const line = JSON.stringify(entry) + '\n';

      if (!fs.existsSync(path.dirname(ledgerPath))) {
        fs.mkdirSync(path.dirname(ledgerPath), { recursive: true });
      }

      fs.appendFileSync(ledgerPath, line);

      process.exit(0);
    } catch (e) {
      console.error('evidence-ledger error:', e.message);
      process.exit(0);
    }
  }
}

main();

// evidence-ledger.js - Logs task execution to docs/evidence/ledger.jsonl
// Appends JSON lines format: {"date":"...","spec":"...","task":"...","branch":"..."}

const fs = require('fs');
const path = require('path');

function getBranch() {
  try {
    const { execSync } = require('child_process');
    const branch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8', cwd: __dirname }).trim();
    return branch;
  } catch (e) {
    return 'unknown';
  }
}

function extractSpecAndTask(input) {
  // Try different JSON formats based on real payloads
  if (input.task) {
    const spec = input.task.spec || 'unknown';
    const taskName = input.task.name || input.task.task || 'unknown';
    return { spec, task: taskName };
  }
  if (input.spec && input.taskName) {
    return { spec: input.spec, task: input.taskName };
  }
  // Default to unknown if no data
  return { spec: 'unknown', task: 'unknown' };
}

function main() {
  let toolInput = '';
  process.stdin.on('data', chunk => { toolInput += chunk; });

  process.stdin.on('end', () => {
    try {
      // Use KIRO_RADAR_LEDGER env var if set, otherwise default to docs/evidence/ledger.jsonl
      const ledgerPath = process.env.KIRO_RADAR_LEDGER || path.join(__dirname, '..', '..', 'docs', 'evidence', 'ledger.jsonl');

      let spec = 'unknown';
      let task = 'unknown';

      if (toolInput) {
        const input = JSON.parse(toolInput);
        const { spec: s, task: t } = extractSpecAndTask(input);
        spec = s;
        task = t;
      }

      const branch = getBranch();

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
  });
}

main();

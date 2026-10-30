// session-handoff.js - Creates handoff if lock exists
// Uses KIRO_RADAR_ROOT environment variable if set
// Copies _TEMPLATE.md to docs/coordination/handoffs/<WP>-<AAAA-MM-DD>.md without overwriting

const fs = require('fs');
const path = require('path');

function main() {
  // Use KIRO_RADAR_ROOT if set, otherwise default to parent of scripts/hooks
  const rootDir = process.env.KIRO_RADAR_ROOT || path.join(__dirname, '..', '..');
  const lockDir = path.join(rootDir, 'docs', 'coordination', 'locks');
  const handoffsDir = path.join(rootDir, 'docs', 'coordination', 'handoffs');
  const templatePath = path.join(handoffsDir, '_TEMPLATE.md');
  
  // Find active lock (WP-XX.lock)
  let activeLock = null;
  try {
    const files = fs.readdirSync(lockDir);
    activeLock = files.find(f => f.endsWith('.lock') && f !== 'README.md');
  } catch (e) {
    // No locks directory
  }
  
  // If no lock, exit successfully with no handoff
  if (!activeLock) {
    process.exit(0);
  }
  
  // Check if template exists
  if (!fs.existsSync(templatePath)) {
    process.exit(0);
  }
  
  // Generate filename: WP-YYYY-MM-DD.md
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD
  const wpName = activeLock.replace('.lock', '');
  const handoffFilename = `${wpName}-${dateStr}.md`;
  const handoffPath = path.join(handoffsDir, handoffFilename);
  
  // Do not overwrite existing handoff
  if (fs.existsSync(handoffPath)) {
    process.exit(0);
  }
  
  // Copy template to handoff
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  fs.writeFileSync(handoffPath, templateContent, 'utf8');
  
  console.log(handoffPath);
  process.exit(0);
}

main();

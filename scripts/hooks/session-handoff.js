// session-handoff.js - Asks user if handoff should be created
// Returns permissionDecision: "ask" to prompt user

function main() {
  const message = JSON.stringify({
    hookSpecificOutput: {
      permissionDecision: 'ask',
      permissionDecisionReason: '¿Crear handoff desde la plantilla? (docs/coordination/handoffs/_TEMPLATE.md)'
    }
  });
  console.log(message);
  process.exit(0);
}

main();

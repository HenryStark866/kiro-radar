// session-handoff.js - Asks user if handoff should be created
// Uses the 'confirm' action block per v1 schema

function main() {
  const message = JSON.stringify({
    confirm: {
      title: '¿Crear handoff?',
      message: '¿Desea crear el handoff desde la plantilla? (docs/coordination/handoffs/_TEMPLATE.md)'
    }
  });
  console.log(message);
  process.exit(0);
}

main();

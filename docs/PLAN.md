# Plan para ganar el reto

## La apuesta

El reto premia usar muchas herramientas de Kiro **de forma significativa**. La mayoría de participantes hará una app común y le pegará herramientas encima. Nosotros construimos algo que necesita cada herramienta y que **mide ese mismo criterio**.

**Kiro Radar** escanea un repositorio y entrega un radar de 10 dimensiones sobre cómo usa Kiro, con sugerencias concretas. Tres razones por las que puede ganar:

1. **Se prueba solo.** La demo termina con el proyecto escaneándose a sí mismo.
2. **Sirve a la comunidad.** Cualquier participante del reto puede pasarlo por su repositorio y compartir su puntaje.
3. **Cada herramienta tiene un trabajo real.** El servidor MCP y el Power son parte del producto, no adorno.

## Producto mínimo

| Paquete | Qué hace |
| --- | --- |
| `packages/core` | Lee `.kiro/` como texto y calcula el puntaje. Sin ejecutar nada |
| `packages/cli` | `kiro-radar scan <ruta>`: salida en terminal, JSON, Markdown y badge SVG; `--min <n>` para fallar por debajo de un umbral |
| `packages/mcp` | Herramientas `scan_repo`, `explain_dimension`, `next_best_action` |
| `packages/web` | Dashboard estático: radar SVG a partir de un `report.json` |
| `power/kiro-radar` | Power instalable que empaqueta el MCP y una skill de mejora |

## Ajuste por plan Kiro Free

Henry usa Kiro Free: 50 créditos, con reinicio el 2026-11-01. Eso manda sobre el resto del plan. La ejecución detallada está en `docs/PASO-A-PASO.md`.

- **Prioridad:** spec aprobado, núcleo, CLI, MCP y Power. El dashboard y el despliegue solo se hacen si sobran créditos.
- **Modelo:** el más barato disponible para escribir código; se sube de modelo solo si falla.
- **Ejecución:** una tarea por vez. Nada de Run all en este plan.
- **Hooks:** solo acciones `command`, que no gastan créditos. Las acciones `agent` quedan fuera.
- **Revisión:** la hacen agentes externos con R1, sin gastar créditos de Kiro.
- **Workflows, Correctness y Power de seguridad:** una sola corrida, al final, sobre un alcance pequeño.

## Las 10 dimensiones

Cada una vale de 0 a 10, para un total de 100. Presencia sola nunca da la nota máxima.

| Dimensión | Puntúa alto si |
| --- | --- |
| Specs | Están los tres archivos, hay requisitos EARS, tareas marcadas y más de un tipo de spec |
| Steering | Hay archivos fundacionales y varios modos de inclusión con contenido real |
| Hooks | JSON v1 válido, varios triggers, al menos un hook que bloquee |
| Skills | `name` coincide con la carpeta, descripción útil, recursos propios |
| Powers | Hay un `plugin.json` válido o powers documentados |
| MCP | Configuración válida, sin secretos literales |
| Agentes | Perfiles con herramientas acotadas y `resources` definidos |
| Workflows | Receta válida con varios nodos |
| Protección | `.kiroignore`, permisos y hooks de guardia |
| Trazabilidad | Tests presentes y commits o bitácora que enlacen tareas con cambios |

## Fases

Los prompts están en `docs/PROMPTS.md`. **G** marca una compuerta que Henry debe aprobar.

### Fase 0: preparación (Henry)

1. Instalar Kiro IDE desde [kiro.dev/downloads](https://kiro.dev/downloads/) e iniciar sesión.
2. Abrir esta carpeta en Kiro y marcar el workspace como confiable.
3. Activar en Kiro: Memory en "Use and learn" y Workflows en Workspace Configuration.
4. Confirmar la fecha límite y dónde se entrega el reto; anotarlos en `MEMORY.md`.
5. Crear el repositorio con el commit inicial:

```bash
git init -b main
```

```bash
git add -A
```

```bash
git -c user.name="Henry Taborda" -c user.email="henrytaborda57@gmail.com" commit -m "chore: coordination scaffold"
```

```bash
gh repo create HenryStark866/kiro-radar --public --source=. --push
```

**G0:** Kiro abre, lee `AGENTS.md` y resume las reglas correctamente (P0).

### Fase 1: montar Kiro (WP-01)

Hooks, skills, agentes y steering adicional con P1 y P2. **G1:** el hook de guardia bloquea una escritura fuera de rutas en una prueba real.

### Fase 2: núcleo (WP-02)

Spec `radar-core` en modo Requirements-First, Analyze Requirements, diseño, tareas y ejecución con P3 y P4. **G2:** requisitos aprobados. **G3:** diseño y tareas aprobados. **G4:** contrato congelado y tests en verde.

### Fase 3: productos en paralelo (WP-03, WP-04, WP-05)

Una sesión o worktree por WP. CLI en Requirements-First, MCP en Design-First y dashboard en Requirements-First. **G5:** cada spec aprobado antes de su ejecución; cada WP se fusiona tras revisión del agente `radar-reviewer`.

### Fase 4: empaquetado y calidad (WP-06, WP-07)

Power creado con Power Builder, workflow de revisión en bucle, Correctness, escaneo de seguridad y bugfix spec **solo con un defecto real**. **G6:** cero hallazgos altos abiertos.

### Fase 5: publicar (WP-08, WP-09)

Despliegue, autoescaneo, video y post. **G7:** Henry aprueba despliegue y publicación por separado.

## Orden si falta tiempo

Se recorta de abajo hacia arriba. Lo primero es lo que más vale para los criterios del reto.

1. Spec aprobado + núcleo + CLI + hooks + steering.
2. Skills + agentes + MCP.
3. Power + workflow.
4. Dashboard desplegado.
5. Video pulido.

## Riesgos

| Riesgo | Respuesta |
| --- | --- |
| Agentes externos escriben código y se pierde el criterio del reto | Regla 1 de `AGENTS.md` y hook de guardia |
| Dos agentes editan lo mismo | Rutas exclusivas, locks y un solo integrador |
| `.git` dentro de OneDrive se daña con varias sesiones | Worktrees en `C:\dev\kiro-radar-wt\`, y Henry pausa OneDrive durante fusiones |
| La documentación de Kiro cambia | Cada prompt pide confirmar el formato en kiro.dev antes de crear archivos |
| Pasar el límite de créditos de Kiro | Dividir specs, y aplicar el orden de recorte |
| Parecer producto oficial | Aviso "proyecto de la comunidad, no oficial" en README y dashboard |
| Puntaje inflado por archivos vacíos | Los tests del núcleo incluyen un repositorio trampa que debe puntuar bajo |

## Definición de "ganar listo"

- [ ] 4 specs aprobados, con aprobación registrada en `MEMORY.md`
- [ ] `docs/TOOLS-MATRIX.md` completa, cada fila con prueba enlazada
- [ ] `kiro-radar scan .` corrido en vivo sobre este repositorio
- [ ] Repositorio trampa puntúa bajo
- [ ] Todo el código con commit `[kiro:...]`
- [ ] README, video de menos de 3 minutos y post publicados

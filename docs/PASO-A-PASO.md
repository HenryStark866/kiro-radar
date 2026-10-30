# Paso a paso con Kiro Free

Tienes 50 créditos y el contador se reinicia el 2026-11-01. Los costos por bloque son estimados: la cifra real sale en el chat de Kiro tras cada prompt.

**Regla de parada:** si un solo prompt gasta más de 8 créditos, o llegas a 45, detente y anota en qué quedaste en `MEMORY.md`.

## Antes de empezar

1. En Kiro, haz clic en **Open a project** y elige `C:\Users\tabor\OneDrive\Escritorio\RETO KIRO BREAK THE CODE`.
2. Cuando pregunte, marca la carpeta como confiable (trust).
3. Abre el chat de Kiro y revisa el selector de modelos. Elige **Qwen3 Coder Next** si aparece. Si no aparece, usa el más barato de la lista.
4. Si el chat muestra Autopilot y Supervised, elige **Supervised**.
5. Deja Workflows apagado por ahora.

## Bloque 1: arranque (estimado: 1 crédito)

1. Abre un chat nuevo y pega **P0** de `docs/PROMPTS.md`, con `<ROL>` cambiado por `Kiro, integrador`.
2. Debe responder que puede escribir código y specs, que la fase es la 0, y que el primer WP es WP-01.
3. Si responde algo distinto, para aquí y copia su respuesta a Claude Code.

## Bloque 2: protecciones (estimado: 8 créditos)

1. Abre un chat nuevo y pega **P1**.
2. Revisa que muestre una prueba que pasa y otra que falla por hook.
3. Comprueba que existan archivos en `.kiro/hooks/`.
4. Haz el commit desde el chat, con el formato de `AGENTS.md`.

## Bloque 3: spec del núcleo (estimado: 10 créditos)

1. Inicia un spec nuevo. Elige **Feature** y luego **Requirements-First**. Nómbralo `radar-core`.
2. Pega el primer bloque de **P3**.
3. Corre **Analyze Requirements** una vez y pide resolver los hallazgos.
4. Lee `requirements.md`. Usa el botón **Review** para dejar comentarios si algo no cuadra.
5. Aprueba en el chat. Es tu primera compuerta (G2).
6. Pide el diseño con el segundo bloque de P3, revísalo y apruébalo. Luego genera las tareas y apruébalas (G3).

Con esto ya cumples el primer criterio del reto: spec generado, validado y aprobado.

## Bloque 4: código del núcleo (estimado: 25 créditos)

1. Pega **P4**, pero añade al final: `Ejecuta solo la primera tarea y detente.`
2. Mira cuánto costó y repite con la siguiente tarea.
3. Haz primero las tareas de contrato, escáner y las dimensiones Specs, Steering y Hooks.
4. Al llegar a la regla de parada, corre tests, haz commit y anota la tarea pendiente en `MEMORY.md`.

## Después del reinicio (2026-11-01)

Sigue en este orden, un bloque por vez:

1. Terminar `radar-core`.
2. **P5**: CLI.
3. **P6**: MCP.
4. **P8**: Power.
5. **P2**: skills y agentes.
6. **P9** o **P10**: solo una corrida, si quedan créditos.
7. **P12**: cierre.

P7 y P11 quedan para el final, solo si sobran créditos.

## Cómo ahorrar créditos

- Abre un chat nuevo por bloque.
- Pide una sola tarea por mensaje.
- Pega errores cortos, no registros completos.
- Pide a Claude Code las revisiones con **R1**, que no gastan créditos de Kiro.
- Si un modelo barato falla dos veces en lo mismo, cambia de modelo; no sigas reintentando.

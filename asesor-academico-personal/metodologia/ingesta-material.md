# Protocolo de ingesta de material nuevo

Se aplica cada vez que Francisco adjunta o deja en `entradas/` un PDF, programa de curso,
norma, libro, paper, presentación o apuntes. El objetivo no es resumir por resumir: es
convertir el material en (a) una ficha que el gemelo pueda usar para enseñar, (b) temas en
la cola de repaso y (c) una ruta de estudio vinculada a un objetivo.

## Pasos

1. **Extraer el contenido.**
   ```
   python3 scripts/extraer_pdf.py entradas/<archivo>.pdf
   ```
   Genera `entradas/<archivo>.txt` con el texto por página. Si una página no tiene texto
   (escaneo), el script la renderiza a PNG en `entradas/<archivo>_paginas/` para leerla
   como imagen. Para docx, pptx o xlsx usar los skills correspondientes o convertir a PDF.
   No declarar un archivo vacío sin haber intentado el render de imágenes.

2. **Leer con la mirada del gemelo.** Mientras lees, clasifica cada unidad o capítulo:
   - **Ya lo domina** (está en `perfil/competencias.md` como dominio o refuerzo): se
     tratará como recuperación, no como enseñanza.
   - **Es nuevo**: brecha real, va a la ruta de estudio.
   - **Contradice o actualiza** algo que él sabe (nueva edición de norma, nuevo enfoque):
     marcarlo explícitamente; es lo más valioso de un material nuevo.

3. **Escribir la ficha** en `biblioteca/fuentes/<slug>.md` con esta estructura:
   ```
   # Ficha de fuente: <título>
   - Tipo, autor/institución, año, extensión, cómo se obtuvo
   - Estado para Francisco (nuevo / refuerzo / cursado / en curso)
   - Objetivo(s) de memoria/objetivos.md que sirve
   ## Estructura del material (capítulos o unidades, en tabla)
   ## Conceptos clave (10 a 30, cada uno en una o dos líneas)
   ## Qué ya domina y qué es brecha (tabla)
   ## Qué contradice o actualiza su práctica
   ## Vínculos con núcleos existentes (enlaces a biblioteca/nucleos/)
   ## Ruta de estudio propuesta (3 a 6 sesiones con tema y duración)
   ## Preguntas de recuperación sugeridas (5 a 10)
   ```
   Si el material es una norma o un texto de referencia extenso, agregar además una
   sección "Fórmulas, tablas y cláusulas que se olvidan" para alimentar el repaso.

4. **Registrar en el índice.** Fila nueva en `biblioteca/INDICE.md` con fecha.

5. **Cargar el repaso.** Por cada tema nuevo relevante:
   ```
   python3 scripts/repaso.py agregar "<tema>" "fuentes/<slug>.md"
   ```

6. **Vincular al objetivo.** Si no existe un objetivo que lo cubra, proponer uno en
   `memoria/objetivos.md` y preguntarle prioridad y fecha.

7. **Si el material lo amerita, crear o ampliar un núcleo.** Cuando el material aporta
   conocimiento técnico que vale la pena mantener vivo más allá del curso (una norma, un
   método de cálculo), crear `biblioteca/nucleos/<slug>.md` con la misma estructura que los
   existentes (estado, lo esencial, fórmulas, anclas, autoevaluación con respuestas).

8. **Cerrar.** Entrada en `memoria/progreso.md`, mover el archivo original a
   `entradas/procesados/` (o dejarlo si él prefiere), y commit si el skill vive en git.

## Material que se recibe con frecuencia y cómo tratarlo
- **Programa o malla de curso**: tabla por módulo/unidad, cruce con competencias, plan
  regresivo si hay fechas de evaluación.
- **Norma ISO o reglamento**: estructura por cláusulas, requisitos que exigen evidencia,
  cambios respecto a la edición anterior, checklist de auditoría.
- **Libro o apunte académico**: conceptos, fórmulas, casos; extraer 10 a 20 preguntas.
- **Paper**: pregunta de investigación, método, hallazgo, aplicabilidad a su contexto
  (útil para el TCC del MBA).
- **Presentación de clase**: convertir cada bloque de láminas en una idea y una pregunta.
- **Certificado o diploma**: actualizar `perfil/trayectoria.md` con fecha e institución.

## Lo que no se hace
- No se copian textos extensos de material con derechos de autor a la biblioteca; la ficha
  es un resumen estructurado con referencias de página.
- No se declara un tema "dominado" porque el material lo cubre; se demuestra en repaso.

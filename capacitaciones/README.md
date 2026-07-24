# 🎓 Capacitaciones

Aplicación web (móvil primero) para **gestionar las capacitaciones de una
organización**, totalmente personalizable. No necesita servidor: es HTML/CSS/JS
puro y guarda todo en el dispositivo (`localStorage` + IndexedDB para archivos
y videos).

**Úsala aquí → https://tdkvalex.github.io/OCIO/capacitaciones/**

## Características

- **Dos modos de uso**
  - **Administrador**: crea y gestiona todo.
  - **Colaborador**: cada persona toma sus cursos, rinde evaluaciones y
    descarga sus certificados.
- **Cursos y módulos de aprendizaje**: lecciones de texto (con subtítulos,
  listas y negritas), **videos** (YouTube, Vimeo, enlace directo o archivo
  subido al dispositivo), archivos adjuntos (PDF, imágenes, documentos) y
  enlaces externos. Material de apoyo descargable por curso.
- **Programas de capacitación**: agrupa cursos (p. ej. «Inducción»,
  «Obligatorios legales 2026») y asígnalos de una vez a un grupo de personas.
  Las categorías son personalizables; vienen tres de ejemplo: *Legal y
  normativa*, *Cursos básicos* y *Complementarias*.
- **Evaluaciones**: preguntas de alternativa única, selección múltiple y
  verdadero/falso, con nota mínima configurable, límite de intentos, orden al
  azar, revisión de respuestas y explicaciones.
- **Control y seguimiento del personal**: panel con indicadores de
  cumplimiento, matriz persona × curso con filtros (curso, categoría, estado,
  área), avance y notas, exportación a **CSV**, reinicio de intentos y
  **recertificación** cuando una capacitación vence.
- **Vigencias**: cada curso puede tener vigencia en meses; al vencer, el
  seguimiento lo marca y permite reinscribir.
- **Certificados**: se generan automáticamente al completar un curso, con
  folio correlativo, código de verificación, firmante y colores/logo de la
  organización. Descarga en **PNG** o **SVG**, impresión a PDF y **verificador
  de códigos** integrado.
- **Asistente IA (estilo NotebookLM)**, con la API de Claude:
  - Sube **fuentes** (PDF o texto: normativas, manuales, procedimientos).
  - **Genera cursos completos** en borrador: módulos con contenido pedagógico
    y evaluación incluida.
  - **Genera evaluaciones** para cursos existentes (desde las fuentes o desde
    el contenido del curso).
  - **Resumen ejecutivo, guía de estudio y preguntas frecuentes**, que puedes
    guardar como módulo o material de un curso.
  - **Conversa con tus fuentes** (preguntas y respuestas con citas).
- **Personalización total**: nombre y logo de la organización, colores de la
  interfaz y del certificado, categorías, prefijo de folio, firmante, texto
  legal y nota de aprobación por defecto.
- **Respaldo**: exporta/importa todos los datos en JSON (los archivos y videos
  subidos quedan en IndexedDB del dispositivo y no se incluyen; la clave de la
  API nunca se exporta).

## Cómo usarla

- **Opción 1 — carpeta**: abre `index.html` en un navegador.
- **Opción 2 — un solo archivo**: genera `dist/capacitaciones.html` con
  `./build.sh` (ya viene generado) y ábrelo en cualquier navegador.
- **Opción 3 — GitHub Pages**: `https://<usuario>.github.io/<repo>/capacitaciones/`.

En iPhone/Android puedes usar «Añadir a pantalla de inicio» para tenerla como app.

### Primeros pasos (administrador)

1. **Ajustes** → personaliza nombre, logo, colores y categorías.
2. **Personas** → agrega al personal (o importa una lista pegando
   `Nombre; correo; área; cargo` por línea).
3. **Cursos** → crea cursos a mano o genera uno con el **Asistente IA**.
4. Asigna personas al curso, o crea un **Programa** que agrupe varios cursos.
5. Sigue el avance en **Seguimiento** y el panel; los certificados se emiten
   solos al completar.

### Asistente IA

Necesita una clave de la API de Claude (Anthropic), que se obtiene en
[console.anthropic.com](https://console.anthropic.com) → *API Keys*. La clave
se guarda **solo en tu dispositivo** y las llamadas van directas del navegador
a la API (el uso se cobra en tu cuenta de Anthropic según el modelo elegido:
Claude Opus 5 por defecto, con opción de Sonnet 5 o Haiku 4.5). Con Opus 5 la
aplicación activa además el respaldo automático del lado del servidor: si un
clasificador de seguridad declina una petición, la API la reintenta sola en el
modelo de respaldo recomendado.

Los PDF se envían como documento a la API (máximo 20 MB por archivo); el resto
de fuentes son texto.

## Estructura

```
capacitaciones/
├── index.html            Página principal
├── css/app.css           Estilos (tema oscuro, mobile-first, colores personalizables)
├── js/logica.js          Lógica pura: estados, avance, corrección, vencimientos, CSV
├── js/almacen.js         Almacenamiento: localStorage + IndexedDB (archivos/videos)
├── js/ia.js              Asistente IA: API de Claude (streaming, PDF, JSON estructurado)
├── js/certificados.js    Certificados SVG y descarga PNG
├── js/app.js             Interfaz y estado (admin y colaborador)
├── build.sh              Genera dist/capacitaciones.html (archivo único)
├── dist/                 Versión de un solo archivo
└── tests/test-logica.js  Pruebas de la lógica (node tests/test-logica.js)
```

## Pruebas

```bash
node tests/test-logica.js
```

Cubre: fechas y vencimientos (meses con distinto largo, bisiestos), corrección
de evaluaciones (única/múltiple/VF, aprobación), avance y estados de
inscripción (pendiente → en curso → reprobado/completado → vencido),
seguimiento y panel, CSV, validaciones de cursos y reconocimiento de enlaces
de video.

## Notas

- Todo queda en el navegador del dispositivo: no hay cuentas ni sincronización
  entre equipos. Para trasladar los datos usa Ajustes → Respaldo.
- El verificador de certificados consulta el registro local de este mismo
  dispositivo (útil para el administrador que emitió los certificados).
- «Reinscribir» reinicia el avance de la persona en el curso para la
  recertificación; los certificados anteriores quedan en el historial.

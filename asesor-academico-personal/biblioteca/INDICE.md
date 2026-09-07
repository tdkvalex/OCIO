# Índice de la biblioteca

Catálogo de todo el material que el gemelo ha procesado. Cada fila apunta a una ficha en
`fuentes/` y a los objetivos de `memoria/objetivos.md` que sirve. Los núcleos de refuerzo
técnico (conocimiento que Francisco ya tiene y que se erosiona) están en `nucleos/`.

## Fuentes procesadas

| # | Material | Ficha | Tipo | Estado para Francisco | Objetivos que sirve | Ingresado |
|---|---|---|---|---|---|---|
| 1 | CV Medina Francisco QAQC R1 | perfil/trayectoria.md | Perfil | Base del gemelo | Todos | 2026-09-07 |
| 2 | Malla curricular Construcción Civil | fuentes/malla-construccion-civil.md | Malla | Cursado | Refuerzo de fundamentos | 2026-09-07 |
| 3 | Diplomado en Gestión de la Construcción, PUC Clase Ejecutiva | fuentes/diplomado-gestion-construccion-uc.md | Programa | Cursado 2021-2022 | Refuerzo: contratos, calidad, planificación, costos | 2026-09-07 |
| 4 | MBA en Gestión de Proyectos, USP/Esalq (contenido programático) | fuentes/mba-gestion-proyectos-usp-esalq.md | Programa | Concluido | O3 certificación, O7 gerencia, O4 refuerzo | 2026-09-07 |
| 5 | TCC MBA: estandarización y digitalización de protocolos de calidad en minería (documento y defensa) | fuentes/tcc-protocolos-calidad-mineria.md | Obra propia | Aprobado y defendido | O6 AWP, O7 gerencia, O8 publicación, O9 validación | 2026-09-07 |

## Núcleos de refuerzo técnico

| Núcleo | Archivo | Origen del conocimiento |
|---|---|---|
| Sistemas integrados ISO 9001 / 14001 / 45001 | nucleos/iso-sistemas-integrados.md | Cargo actual, cursos Bureau Veritas y U. de Chile |
| Lean, Six Sigma y control estadístico de procesos | nucleos/lean-six-sigma-spc.md | Diplomado UC curso 2, Lean Construction, cargo actual |
| Planificación, Last Planner y Lean Project Delivery | nucleos/planificacion-last-planner.md | Diplomado UC curso 3, Lean Construction |
| Gestión de contratos de construcción | nucleos/gestion-contratos-construccion.md | Diplomado UC curso 1, SUEZ, licitaciones |
| Costos, presupuestos y control | nucleos/costos-presupuestos-control.md | Diplomado UC curso 4, carrera, consultorías |
| PMBOK y enfoques de proyectos | nucleos/pmbok-enfoques-proyectos.md | MBA USP/Esalq |
| ISO 31000, 55001 y 50001 | nucleos/iso-riesgo-activos-energia.md | SUEZ, EDAM, Bureau Veritas |
| Hidráulica de redes y tratamiento de aguas | nucleos/hidraulica-redes-tratamiento.md | SUEZ, consultorías sanitarias |
| Fundamentos del Constructor Civil | nucleos/fundamentos-constructor-civil.md | Carrera |
| Estadística aplicada | nucleos/estadistica-aplicada.md | Carrera, Power BI, SPC |

## Pendientes de ingesta
Material que Francisco mencionó o que se sabe que existe pero aún no se ha adjuntado:
- Malla y avance de Ingeniería Civil Industrial (USS).
- Certificados de cursos (para completar `perfil/trayectoria.md` con fechas).

## Cómo agregar una fuente
Seguir `metodologia/ingesta-material.md`. Resumen: dejar el archivo en `entradas/`, extraer
con `scripts/extraer_pdf.py`, escribir la ficha en `fuentes/`, agregar la fila aquí, agregar
temas a `memoria/repaso.md` y proponer ruta de estudio.

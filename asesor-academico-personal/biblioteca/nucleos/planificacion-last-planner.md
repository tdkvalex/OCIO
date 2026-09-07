# Núcleo: Planificación, Last Planner, Lean Project Delivery y AWP

**Estado**: Refuerzo. El cargo corporativo lo aleja de la planificación semanal, pero es la
base del Diplomado UC (Alarcón) y de su integración AWP-QA.

## Niveles de planificación
- **Programa maestro** (hitos, secuencia general, contrato; Gantt/CPM en P6 o Project).
- **Planificación por fases** (pull planning: de atrás hacia adelante, con los últimos
  planificadores).
- **Lookahead** (4 a 6 semanas): descomponer, identificar restricciones y liberarlas
  (información, materiales, equipos, mano de obra, permisos, espacio, prerrequisitos).
- **Plan semanal de trabajo**: solo tareas sin restricciones ("workable backlog"),
  compromisos de los últimos planificadores.
- **Aprendizaje**: PPC y causas de no cumplimiento (CNC) cada semana.

## Last Planner System (Ballard y Howell)
- El "último planificador" es quien decide qué se hará mañana (capataz, supervisor). El
  sistema alinea lo que **debe** hacerse (master), **puede** hacerse (sin restricciones),
  **se hará** (compromiso) y **se hizo** (PPC).
- `PPC = tareas completadas / tareas comprometidas × 100`. Rangos de referencia usados en
  GEPUC: < 60 % planificación poco confiable; 60-80 % típico; > 80 % confiable. Verificar
  el umbral que usa cada mandante.
- Causas de no cumplimiento típicas: falta de información/ingeniería, materiales,
  mano de obra, equipos, prerrequisitos de otro contratista, cambios del mandante, clima,
  mala estimación. Se grafican en Pareto y se atacan las principales.
- Buffers: de tiempo, de capacidad, de inventario. Protegen el flujo de la variabilidad.
  Ciencia detrás: la variabilidad no protegida se paga en tiempo de ciclo o en capacidad
  ociosa (Hopp y Spearman, Factory Physics).
- Indicadores tempranos: PPC, % de restricciones liberadas a tiempo (PRL), tareas
  anticipadas (TA), rendimiento de cuadrillas, avance físico vs programado.

## Planificación y control clásicos que siguen valiendo
- CPM: ruta crítica, holgura total y libre, diagrama de precedencias (FS, SS, FF, SF, con
  lags). Compresión: crashing (más recursos, más costo) vs fast tracking (paralelizar, más
  riesgo).
- Curva S de avance: físico (HH ganadas / HH totales) vs programado; desviación de plazo.
- Valor ganado: ver `costos-presupuestos-control.md`.
- Tipos de control: preventivo (antes), concurrente (durante), de retroalimentación
  (después). El control en construcción es más útil cuanto más temprano.

## Lean Project Delivery System (Ballard)
- Fases: definición del proyecto (propósito, criterios de diseño, conceptos), diseño lean,
  suministro lean, ensamblaje lean, uso. Control de producción y estructuración del
  trabajo atraviesan todas.
- Ideas: diseño y construcción como sistema de producción; target value design (diseñar al
  costo objetivo); set-based design; integrated project delivery (IPD) con contratos
  relacionales multi-parte; big room; BIM como habilitador.
- Implementación desde el mandante: los mandantes públicos y privados que exigen Lean
  (Codelco y grandes mineras han incorporado Last Planner en contratos EPC/EPCM).

## Organización como estructura social
- Tipos: funcional, matricial (débil, equilibrada, fuerte), por proyectos. La subdivisión
  del proyecto (WBS) debe corresponderse con la estructura organizacional (OBS) para
  asignar responsables. Herramientas de diagnóstico: matriz RACI, análisis de redes
  sociales (quién habla con quién), mapa de interdependencias.

## Advanced Work Packaging (AWP) e integración con calidad
- Marco CII/COAA: planificar el proyecto desde la construcción hacia atrás ("path of
  construction").
- Jerarquía: CWA (Construction Work Area) → CWP (Construction Work Package, ~ 40.000 HH o
  menos) ← EWP (Engineering Work Package) y PWP (Procurement Work Package) alineados →
  IWP (Installation Work Package, ~ 500 a 1.000 HH, una cuadrilla, una a dos semanas),
  gestionados por WorkFace Planning.
- Regla de oro: un IWP se libera solo cuando tiene todas sus restricciones resueltas
  (ingeniería, materiales, equipos, permisos, accesos, seguridad, calidad).
- Integración QA/QC: cada IWP lleva su ITP (plan de inspección y ensayos), sus
  protocolos y su lista de documentos requeridos para el dossier; el cierre del IWP incluye
  el cierre documental. Esto conecta AWP con 8.5.1, 8.5.2 y 8.6 de ISO 9001 y con el
  turnover por sistemas para precomisionamiento.
- Beneficios reportados por CII: hasta 25 % de reducción de costo de mano de obra directa y
  mejora en seguridad y calidad. Citar con cautela y fuente.

## Anclas en la experiencia de Francisco
- Dashboard HSEQ de protocolos (Desaladora, Talabre, Arqueros): el PPC de los IWP y el
  porcentaje de protocolos cerrados por IWP son el mismo tipo de indicador de confiabilidad.
- Coordinador QA/QC en MAPA: restricciones de calidad (ITP no aprobado, WPS pendiente)
  como causas de no cumplimiento en el lookahead.
- Precomisionamiento en Albemarle y Arqueros: turnover por sistemas es planificación pull
  desde la puesta en marcha.

## Autoevaluación (respuestas al final)
1. ¿Cuáles son los cuatro "verbos" de Last Planner y qué nivel de planificación corresponde a cada uno?
2. ¿Qué es una restricción y cuáles son las siete categorías clásicas?
3. Un proyecto tiene PPC de 55 % sostenido. ¿Qué diagnóstico haces y con qué herramienta?
4. ¿Qué diferencia crashing de fast tracking y qué riesgo agrega cada uno?
5. Define CWP e IWP y sus tamaños de referencia.
6. ¿Qué documentos de calidad debe llevar un IWP antes de liberarse?
7. ¿Qué fases tiene el LPDS?
8. ¿Qué es un buffer de capacidad y da un ejemplo en montaje electromecánico?
9. ¿Qué es target value design?
10. ¿Por qué el plan semanal solo admite tareas del "workable backlog"?

<details><summary>Respuestas</summary>

1. Debe (programa maestro / fases), puede (lookahead con restricciones liberadas), se hará (plan semanal de compromisos), se hizo (PPC y aprendizaje).
2. Cualquier condición que impida ejecutar una tarea. Categorías: información/diseño, materiales, mano de obra, equipos, prerrequisitos (trabajo previo), espacio, condiciones externas (permisos, clima, seguridad).
3. Planificación poco confiable: analizar Pareto de causas de no cumplimiento, revisar si las restricciones se liberan en el lookahead, revisar si los compromisos son realistas (sobrecompromiso).
4. Crashing agrega recursos a la ruta crítica (más costo, rendimientos decrecientes). Fast tracking traslapa actividades secuenciales (más riesgo de retrabajo).
5. CWP: paquete de construcción por área y disciplina, alineado con EWP y PWP, del orden de decenas de miles de HH. IWP: paquete de instalación de una cuadrilla, 500 a 1.000 HH, una a dos semanas.
6. ITP aprobado, procedimientos y WPS aplicables, protocolos en blanco codificados, certificados de materiales asignados, lista de documentos del dossier, verificación de calibración de instrumentos.
7. Definición del proyecto, diseño lean, suministro lean, ensamblaje lean, uso; con control de producción y estructuración del trabajo transversales.
8. Capacidad de reserva para absorber variabilidad: una cuadrilla de soldadores con 15 % de holgura para no detener el frente cuando un frente anterior se atrasa.
9. Diseñar el proyecto para un costo objetivo definido desde el valor para el cliente, iterando diseño y costo en conjunto, en vez de diseñar y luego presupuestar.
10. Porque comprometer tareas con restricciones garantiza no cumplimiento; el sistema protege la producción ("shielding") de la variabilidad aguas arriba.
</details>

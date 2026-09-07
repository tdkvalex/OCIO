# Ficha de fuente: TCC "Estandarización y digitalización de protocolos de calidad en proyectos de construcción para la minería"

- **Tipo**: Trabajo de Conclusión de Curso del MBA en Gestión de Proyectos, USP/Esalq, 2026.
  Documento de 18 páginas más presentación de defensa de 20 láminas.
- **Autoría**: Francisco Javier Medina Álvarez (Besalco Montajes, Gerencia HSEQ,
  Departamento de Control y Aseguramiento de la Calidad) con Jessica Suarez Campoli
  (CCarbon/USP, orientadora).
- **Estado**: obra propia, aprobada y defendida. Es a la vez **material de estudio**
  (método de investigación aplicada) y **evidencia profesional** (portafolio para O7).
- **Palabras clave declaradas**: montaje electromecánico, registros, trazabilidad técnica,
  TOP (Turnover Package), PEC.

## Objetivo y pregunta
Proponer y validar un modelo estandarizado y digitalizado de gestión de protocolos de
calidad para proyectos EPC de construcción y montaje electromecánico en minería, que
reduzca errores y tiempos de aprobación, asegure trazabilidad técnica y habilite
explotación analítica para decidir con datos.

Objetivos específicos: caracterizar procesos, roles y requisitos técnico-documentales por
disciplina y etapa; diseñar matrices de protocolos y flujos de aprobación integrados a la
EDT/WBS; construir y pilotear un MVP interoperable; medir desempeño (tiempo de ciclo,
calidad del dato, no conformidades, respaldo de estados de pago); definir escalamiento y
gobierno del sistema.

## Método
- Investigación aplicada, descriptiva, **estudio de caso instrumental** con **enfoque mixto**
  (Hernández-Sampieri 2018; Yin 2018; Creswell y Plano Clark 2018).
- Caso: proyecto de montaje civil electromecánico industrial de gran escala en Arauco,
  Región del Biobío, ejecutado entre julio de 2019 y octubre de 2022 (corresponde a MAPA,
  Celulosa Arauco, donde fue Coordinador QA/QC). Producción de 2.100.000 t/año, puesta en
  marcha 2023, excedente de ~166 MW al SEN, más de 8.000 trabajadores en construcción.
- Universo completo: **18.579 protocolos** emitidos entre 09/2019 y 08/2021, agrupados por
  ocho disciplinas y cuatro estados documentales.
- Instrumento: índice maestro en Excel con reglas de validación más respaldo escaneado en
  PDF; depuración con estandarización de columnas, control de unicidad de correlativos y
  validación cruzada.
- Análisis: estadística descriptiva (frecuencias, medianas, IQR, p90/p95) y **Pareto**
  (Montgomery 2019). Marco de gestión: PMBOK 5ª y 7ª ediciones, ISO 21500/10006, ISO 9001.

## Resultados principales

| Estado | N.º | % |
|---|---|---|
| Aprobados | 14.539 | 78,26 |
| En revisión | 3.628 | 19,53 |
| Rechazados | 219 | 1,18 |
| Anulados | 193 | 1,04 |
| **Total** | **18.579** | 100 |

- 17 desvíos asociados: 11 internos (64,71 %) y 6 externos (35,29 %).
- Ciclo de emisión a aprobación: máximo **190 días**.
- Medianas por disciplina: Piping Underground 100 d, Instrumentación 62 d, Estructuras 37 d,
  Mecánica 36 d, Eléctrico 26 d, Piping Overground 24 d, Topografía 21 d.
- Tramitación informal: **9,54 %** del total. Concentrada en Piping Overground (1.317),
  Piping Underground (343), Eléctrico (110), Mecánica (3).
- Motivos de rechazo dominantes: anexos no acordes o ilegibles (Piping Overground); campos
  críticos incompletos, firma, fecha, parámetros, TAG (Mecánica); incumplimiento de
  parámetros técnicos mínimos (Instrumentación); devolución sin firma del cliente (Topografía).

## Propuesta: modelo en tres frentes y EDT de cinco fases
- **Estandarización**: EDT de tres niveles, plantilla única por disciplina, código
  identificador transversal, matriz de protocolos por especialidad.
- **Digitalización**: DMS integrado, formularios electrónicos, firmas digitales, dashboard
  de indicadores en tiempo real.
- **Gobernanza**: RACI por disciplina, comité con hitos, plan de auditorías, gestión de
  riesgos documentales, corte del canal informal.
- EDT: 1 Inicio, 2 Planificación, 3 Estandarización y digitalización, 4 Monitoreo y mejora,
  5 Cierre. Hoja de ruta de 12 semanas en el documento y cronograma de 12 meses en la defensa.

Matriz ex ante / ex post con metas: tasa de aprobación ≥ 95 %, desvíos ≤ 2 %, mediana de
ciclo ≤ 7 días, informalidad 0 %, completitud ≥ 98 %.

## Qué revela sobre Francisco (para el gemelo)
- Elige como tema de posgrado **su propio problema operativo** y lo convierte en modelo
  replicable: coherente con su principio "sistema antes que heroísmo".
- Trabaja con el **universo completo** de datos, no con una muestra: prefiere el dato duro
  y la trazabilidad total.
- Integra tres marcos (PMBOK, TQM, ISO 9001) en un solo modelo: su forma de pensar por
  capas complementarias, la misma lógica con que describe su formación.
- Cierra con metas numéricas y matriz ex ante/ex post: no propone mejoras sin indicador.
- Reconoce límites con honestidad (caso único, retrospectivo, base Excel/PDF, perspectiva
  solo del contratista) y define trabajo futuro priorizado, incluida la **integración con
  AWP**, que enlaza con su objetivo O6.
- Dedicatoria a su hijo: la familia como motor declarado (relevante para el bloque H).

## Vínculos con el resto del gemelo
- Es el antecedente académico directo del **dashboard HSEQ corporativo de protocolos**
  (proyectos Desaladora, Talabre, Arqueros): el TCC es el diagnóstico, el dashboard es la
  implementación.
- Núcleos relacionados: `iso-sistemas-integrados.md` (8.5.2 trazabilidad, 8.6 liberación,
  8.7 salidas no conformes), `lean-six-sigma-spc.md` (Pareto, variación, DMAIC),
  `pmbok-enfoques-proyectos.md` (EDT, RACI, riesgos, dominios de PMBOK 7),
  `planificacion-last-planner.md` (AWP, IWP y cierre documental, TOP),
  `estadistica-aplicada.md` (medianas, IQR, p90/p95).
- Objetivos: O6 (AWP más Lean Six Sigma integrados con calidad), O7 (evidencia gerencial),
  O3 (base para PMP o Black Belt), O5 (I+D+i).

## Observaciones de consistencia (útiles si lo publica o reutiliza)
Detectadas al procesar los dos documentos. No invalidan el trabajo, pero conviene
corregirlas antes de cualquier publicación, presentación a gerencia o postulación:
1. **Cifras por disciplina divergentes** entre el documento y la defensa. El TCC informa
   Instrumentación 2.848 protocolos y Eléctrico 1.619; la lámina 12 de la defensa habla de
   Instrumentación 6.034 y Eléctrico 5.550. Conviene una sola fuente de verdad.
2. **PIB minero**: la lámina 2 dice 18 % y el texto y la lámina 3 dicen 12 %.
3. **Tabla 11 del apéndice**: la fila de Topografía repite exactamente los valores de Piping
   Underground (190/100/10/80), lo que sugiere un arrastre de celdas.
4. **Aprobados**: 14.539 en el documento y 14.544 en la lámina 11.
5. **Piping Overground en la defensa** aparece con 53 % de aprobación y 13 % de anulados,
   cifras que en el TCC corresponden a Mecánica.
6. **Referencias incompletas**: Fernández Sánchez et al. (2021), Miranda y Salinas (2020) y
   Varela (2020) quedaron con la nota "Agregar: tipo de publicación...". Creswell aparece
   como 2011 en referencias y 2018 en el texto; Sampieri como 2014 y 2018.
7. **Completitud de datos** (firmas 92 %, TAG 85 %, promedio 90,6 %) aparece solo en la
   defensa, sin respaldo en el documento; si se publica, hay que declarar su origen.
8. Errores menores de tipeo: "assegurará", "las partida", "EPCindustrial".

## Preguntas de recuperación (modo refuerzo, método de investigación)
1. ¿Qué diferencia un estudio de caso instrumental de uno intrínseco y por qué usaste el primero?
2. ¿Qué aporta el enfoque mixto que no da el puramente cuantitativo en este problema?
3. ¿Por qué la mediana y el IQR describen mejor los tiempos de ciclo que el promedio?
4. ¿Qué disciplinas priorizarías en un piloto según Pareto y con qué criterio?
5. ¿Con qué cláusulas de ISO 9001 se respalda cada componente del modelo propuesto?
6. ¿Qué riesgo introduce cortar el canal informal sin antes habilitar el canal digital?
7. ¿Cómo demostrarías el ROI del modelo a un gerente que solo mira costo?
8. ¿Qué indicador de los propuestos es el más difícil de sostener en el tiempo y por qué?

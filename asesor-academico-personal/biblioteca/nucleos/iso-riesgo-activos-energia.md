# Núcleo: ISO 31000 (riesgos), ISO 55001 (activos) e ISO 50001 (energía)

**Estado**: Refuerzo. Aplicadas en SUEZ (31000, 55001) y cubiertas en el curso de auditor
interno de Bureau Veritas (50001) y en los cursos de EDAM. Hoy se usan menos, pero son
diferenciadoras en propuestas para mandantes que operan activos (plantas de agua,
desaladoras, concentradoras).

## ISO 31000:2018, gestión del riesgo (directrices, no certificable)
- Definición: riesgo = efecto de la incertidumbre sobre los objetivos (puede ser positivo o
  negativo).
- Ocho principios: integrada, estructurada y exhaustiva, adaptada, inclusiva, dinámica,
  mejor información disponible, factores humanos y culturales, mejora continua. Propósito:
  creación y protección de valor.
- Marco: liderazgo y compromiso al centro; integración, diseño, implementación,
  valoración, mejora.
- Proceso: alcance, contexto y criterios → evaluación del riesgo (identificación, análisis,
  valoración) → tratamiento → seguimiento y revisión → registro e informe; con comunicación
  y consulta transversal.
- Técnicas (IEC 31010): lluvia de ideas, listas de verificación, análisis de escenarios,
  bow-tie, FMEA, HAZOP, árbol de fallas, árbol de eventos, matriz probabilidad-consecuencia,
  Monte Carlo, análisis de capas de protección (LOPA).
- Criterios: apetito y tolerancia al riesgo; ALARP (tan bajo como sea razonablemente
  practicable) en seguridad.
- Vínculo con las normas de sistemas: cláusula 6.1 de 9001/14001/45001 exige pensar en
  riesgos y oportunidades; ISO 31000 da el método.

## ISO 55000 / 55001, gestión de activos
- Ediciones: ISO 55000:2014, 55001:2014, 55002:2018; **ISO 55001:2024** publicada en julio
  de 2024 (revisión, verificar periodo de transición para certificaciones existentes).
- Activo: elemento que tiene valor potencial o real para una organización. Gestión de
  activos: actividad coordinada para obtener valor de los activos, balanceando costo,
  riesgo y desempeño a lo largo del ciclo de vida.
- Fundamentos: valor, alineamiento (línea de visión entre objetivos organizacionales y
  actividades sobre activos), liderazgo, aseguramiento.
- Jerarquía documental: plan estratégico organizacional → política de gestión de activos →
  **SAMP** (plan estratégico de gestión de activos) → objetivos de gestión de activos →
  planes de gestión de activos → planes de ciclo de vida.
- Ciclo de vida: necesidad, diseño/adquisición, operación y mantenimiento, renovación o
  disposición. Costo del ciclo de vida (LCC) y costo total de propiedad.
- Mantenimiento: correctivo, preventivo, predictivo (condición), RCM (mantenimiento centrado
  en confiabilidad), criticidad de activos, MTBF, MTTR, disponibilidad
  `A = MTBF / (MTBF + MTTR)`, OEE `= disponibilidad × rendimiento × calidad`.
- Información de activos: registro maestro, jerarquía (planta → sistema → equipo →
  componente), tags, GIS para redes lineales (georreferenciación de redes de Codelco DET).
- Proyectos de construcción como "creación de activos": el dossier de calidad y los
  turnover packages son la información de activos con que el mandante inicia la operación.
  Ahí se cruza QA/QC con 55001.

## ISO 50001:2018, gestión de la energía
- Estructura HLS (igual que 9001). Específicos: 6.3 revisión energética (usos
  significativos de energía, USE), 6.4 indicadores de desempeño energético (IDEn / EnPI),
  6.5 línea base energética (LBEn / EnB) con variables relevantes y normalización, 6.6 plan
  de recolección de datos energéticos, 8.2 diseño considerando desempeño energético, 8.3
  adquisiciones con criterios energéticos, 9.1 seguimiento de IDEn contra línea base.
- Mejora del desempeño energético es exigencia demostrable (no solo del sistema).
- Vínculo con minería: consumo eléctrico de desaladoras (SEC de ósmosis inversa del orden
  de 3 a 4 kWh/m³ incluyendo bombeo; verificar por planta), molienda como mayor consumidor
  en concentradoras, Ley 21.305 de eficiencia energética (grandes consumidores deben
  implementar sistemas de gestión de energía) y ESG de los mandantes.

## Anclas en la experiencia de Francisco
- SUEZ Biofactorías: mejoras operativas bajo 31000, 45001 y 55001; continuidad de servicio
  como objetivo de gestión de activos.
- Restauración red de Sewell y georreferenciación Codelco DET: registro de activos lineales.
- Sistema de respaldo eléctrico PTAS Mapocho Trebal: activo crítico para continuidad;
  análisis de riesgo tipo bow-tie.
- Propuestas HSEQ: incluir gestión de riesgos formal (31000) y entrega de información de
  activos (55001) como valor agregado en PEP de ideas y oportunidades.

## Autoevaluación (respuestas al final)
1. Define riesgo según ISO 31000 y explica por qué incluye efectos positivos.
2. ¿Cuáles son las tres etapas de la evaluación del riesgo?
3. ¿Qué es un bow-tie y qué van a cada lado del evento central?
4. ¿Qué es el SAMP y dónde está en la jerarquía documental?
5. Calcula disponibilidad con MTBF 900 h y MTTR 100 h.
6. ¿Qué tres factores balancea la gestión de activos?
7. ¿Qué es la línea base energética y por qué se normaliza?
8. ¿Qué exige ISO 50001 que no exige ISO 14001 respecto a la energía?
9. ¿Cómo se relaciona un dossier de calidad con ISO 55001?
10. ¿Qué es ALARP?

<details><summary>Respuestas</summary>

1. Efecto de la incertidumbre sobre los objetivos; la incertidumbre puede desviar los resultados hacia arriba o hacia abajo, por eso hay riesgos como oportunidades.
2. Identificación, análisis, valoración (comparar con criterios para decidir tratamiento).
3. Diagrama con el evento central (pérdida de control) al medio; a la izquierda amenazas y barreras preventivas; a la derecha consecuencias y barreras de mitigación/recuperación.
4. Plan estratégico de gestión de activos: traduce los objetivos organizacionales en objetivos de gestión de activos y define el enfoque; está entre la política y los planes de gestión de activos.
5. 900 / (900 + 100) = 0,90 = 90 %.
6. Costo, riesgo y desempeño a lo largo del ciclo de vida.
7. Referencia cuantitativa de consumo en un periodo, ajustada por variables relevantes (producción, clima) para comparar el desempeño futuro en igualdad de condiciones.
8. Demostrar mejora del desempeño energético con indicadores contra línea base, revisión energética con USE, y considerar energía en diseño y compras.
9. El dossier es la información de activos con que el mandante inicia el ciclo de vida operativo: as-built, certificados, pruebas, tags; su calidad determina la gestión de activos futura.
10. As Low As Reasonably Practicable: reducir el riesgo hasta que el costo de reducirlo más sea desproporcionado respecto al beneficio.
</details>

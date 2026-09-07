# Núcleo: Lean, Six Sigma y control estadístico de procesos

**Estado**: Lean es dominio diario; Six Sigma y SPC son refuerzo. Es la caja de herramientas
del cargo de I+D+i y optimización de procesos, y el lenguaje de Ferreiro y León en el
Diplomado UC.

## Calidad: del QC al TQM
- Control de calidad (inspección, detectar) → aseguramiento (prevenir, sistemas) → gestión
  de calidad total (toda la organización, cliente, mejora continua) → modelos de excelencia
  (Malcolm Baldrige, EFQM, Premio Nacional a la Calidad de Chile, creado con Ferreiro).
- **Triángulo de Joiner**: calidad (obsesión por el cliente), enfoque científico (decidir con
  datos, entender la variación), todos un solo equipo (cooperación, no competencia interna).
- **PDCA** (Deming/Shewhart): planificar, hacer, verificar, actuar. Es el motor de las
  normas ISO (cláusulas 6-7-8 / 9 / 10) y del kaizen.
- Siete herramientas básicas (Ishikawa): hoja de verificación, histograma, Pareto, diagrama
  causa-efecto, estratificación, diagrama de dispersión, gráfico de control.
- Costo de la calidad: prevención, evaluación, fallas internas, fallas externas. El
  argumento económico: invertir en prevención y evaluación reduce fallas.

## Variación y control estadístico de procesos (SPC)
- Causa **común** (aleatoria, inherente al sistema; se reduce cambiando el sistema; es
  responsabilidad de la gerencia) vs causa **especial** (asignable, puntual; se investiga y
  elimina). Error tipo 1: tratar causa común como especial (sobreajuste, "tampering").
  Error tipo 2: ignorar una causa especial.
- Gráfico de control: línea central, LCS y LCI a ±3σ del estadístico. Regla básica: punto
  fuera de límites = señal. Reglas adicionales (Western Electric): 2 de 3 puntos más allá de
  2σ; 4 de 5 más allá de 1σ; 8 seguidos a un lado de la media; 6 seguidos crecientes o
  decrecientes.
- Gráficos por variables: X̄-R (subgrupos de 2 a 10), X̄-S (subgrupos grandes), I-MR
  (individuales). Por atributos: p (fracción defectuosa), np, c (defectos por unidad
  constante), u (defectos por unidad variable).

```
X̄-R:  LCS_X̄ = X̿ + A2·R̄     LCI_X̄ = X̿ − A2·R̄
       LCS_R = D4·R̄          LCI_R = D3·R̄
       n=2: A2=1.880 D3=0 D4=3.267 | n=4: A2=0.729 D4=2.282 | n=5: A2=0.577 D4=2.114
I-MR:  LCS = X̄ + 2.66·MR̄     LCI = X̄ − 2.66·MR̄   (σ ≈ MR̄/1.128)
```

- Capacidad de proceso (solo si el proceso está bajo control y aproximadamente normal):

```
Cp  = (LES − LEI) / 6σ                 potencial (centrado ideal)
Cpk = min[(LES − μ)/3σ, (μ − LEI)/3σ]   real (penaliza descentrado)
Cp ≥ 1.33 se considera capaz; Cpk < 1 produce fuera de especificación
Pp / Ppk: igual pero con σ de largo plazo (desempeño)
```

## Six Sigma
- Sigma del proceso: cuántas desviaciones estándar caben entre la media y el límite de
  especificación más cercano. Con el corrimiento convencional de 1,5σ:

| Nivel sigma | DPMO |
|---|---|
| 2σ | 308.537 |
| 3σ | 66.807 |
| 4σ | 6.210 |
| 5σ | 233 |
| 6σ | 3,4 |

- `DPMO = defectos × 1.000.000 / (unidades × oportunidades por unidad)`.
- **DMAIC**: Definir (project charter, VOC, CTQ, SIPOC), Medir (plan de medición, MSA / Gage
  R&R, línea base, capacidad), Analizar (causas raíz, hipótesis, regresión, Pareto),
  Mejorar (diseño de soluciones, DOE, piloto), Controlar (plan de control, SPC, estándar,
  transferencia al dueño del proceso). DMADV / DFSS para diseño nuevo.
- Roles: Champion, Master Black Belt, Black Belt, Green Belt, Yellow Belt.

## Lean
- Origen: Toyota Production System (Ohno, Shingo). Valor definido por el cliente; flujo;
  pull; perfección. Cinco principios de Womack y Jones: valor, cadena de valor, flujo,
  pull, perfección.
- **Ocho desperdicios** (TIMWOODS): Transporte, Inventario, Movimiento, Esperas (Waiting),
  Sobreproducción (Overproduction), Sobreprocesamiento (Overprocessing), Defectos, y
  talento no utilizado (Skills).
- Herramientas: VSM (mapa de flujo de valor, lead time vs tiempo de proceso), 5S, trabajo
  estandarizado, kanban, poka-yoke, SMED, TPM, andon, gemba walk, A3, kaizen, heijunka.
- `Takt time = tiempo disponible / demanda del cliente`. Lead time vs tiempo de ciclo.
  Ley de Little: `WIP = throughput × lead time`.
- Lean Construction: variabilidad y flujo (Koskela: transformación-flujo-valor, TFV), Last
  Planner (ver núcleo de planificación), IPD, target value design, prefabricación,
  takt planning.
- **Lean Six Sigma**: Lean ataca velocidad/flujo/desperdicio; Six Sigma ataca variación y
  defectos. Juntos: DMAIC como estructura, herramientas Lean dentro de Mejorar.
- **Modelo SCOR** (cadena de suministro): Plan, Source, Make, Deliver, Return (y Enable);
  niveles de proceso y métricas de confiabilidad, capacidad de respuesta, agilidad, costos,
  activos.

## Anclas en la experiencia de Francisco
- Protocolos de inspección dinámicos con análisis de datos (Albemarle): gráficos p de
  rechazo por tipo de protocolo; Pareto de causas de rechazo.
- KPI HSEQ corporativos: distinguir variación común de especial antes de "corregir" a un
  proyecto por un mes malo.
- Automatización administrativa: VSM del flujo de un protocolo desde terreno hasta dossier;
  esperas y reprocesos como desperdicio.
- Integración AWP-QA: reducir variabilidad en la entrega de paquetes de trabajo.

## Autoevaluación (respuestas al final)
1. ¿Qué DPMO corresponde a 4σ y por qué se usa un corrimiento de 1,5σ?
2. Un proceso tiene Cp = 1,8 y Cpk = 0,7. ¿Qué le pasa y qué harías?
3. Explica causa común vs especial con el porcentaje mensual de protocolos rechazados de un proyecto.
4. ¿Qué gráfico usas para la fracción de protocolos rechazados con tamaño de muestra variable por mes?
5. ¿Cuáles son los ocho desperdicios? Da uno de un proceso administrativo HSEQ.
6. ¿Qué entregable cierra la fase Definir y cuál la fase Controlar de DMAIC?
7. ¿Qué es un Gage R&R y por qué importa antes de analizar un dato de inspección?
8. Define takt time y calcula: 8 h disponibles, 32 paquetes de trabajo por día.
9. ¿Cuál es la diferencia entre Lean y Six Sigma en el tipo de problema que atacan?
10. ¿Cuáles son los vértices del triángulo de Joiner?

<details><summary>Respuestas</summary>

1. 6.210 DPMO. El corrimiento de 1,5σ representa la deriva de la media del proceso a largo plazo; sin corrimiento 6σ daría 0,002 DPMO en vez de 3,4.
2. Es capaz en dispersión pero está descentrado: la media está cerca de un límite. Ajustar el centrado (causa sistemática), no reducir dispersión.
3. Si el porcentaje fluctúa dentro de límites de control mes a mes, es causa común: mejorar el sistema (capacitación, diseño de protocolos). Un mes fuera de límites es causa especial: investigar qué pasó ese mes (nuevo subcontrato, cambio de inspector).
4. Gráfico p.
5. Transporte, inventario, movimiento, esperas, sobreproducción, sobreprocesamiento, defectos, talento no utilizado. Ejemplo: espera de firma física de un protocolo que ya está aprobado digitalmente.
6. Definir: project charter aprobado (problema, alcance, meta, equipo, cronograma). Controlar: plan de control con SPC, procedimiento estandarizado y entrega al dueño del proceso.
7. Estudio de repetibilidad (mismo operador) y reproducibilidad (entre operadores) del sistema de medición. Si el sistema de medición aporta más del 30 % de la variación, los datos no sirven para decidir.
8. Tiempo disponible dividido por la demanda: 480 min / 32 = 15 minutos por paquete.
9. Lean: flujo, velocidad, desperdicio (problemas visibles de proceso). Six Sigma: variación y defectos (problemas donde la causa no es evidente y requiere estadística).
10. Calidad, enfoque científico, todos un equipo.
</details>

# Núcleo: Costos, presupuestos y control de proyectos

**Estado**: Refuerzo. Base del curso 4 del Diplomado UC (de Solminihac), de Análisis de
Costos y Cubicaciones de la carrera, y de sus consultorías (Estadio Nacional, Vías SpA).

## Gestión de costos por fase
- Procesos: planificar la gestión de costos, estimar, presupuestar (línea base + reservas),
  controlar.
- Precisión de la estimación según madurez (AACE International, clases de estimación):

| Clase | Madurez de ingeniería | Uso | Rango de precisión típico |
|---|---|---|---|
| 5 | 0-2 % | Orden de magnitud, screening | −50 % / +100 % (o −20/+30 según industria) |
| 4 | 1-15 % | Estudio de factibilidad | −30 % / +50 % |
| 3 | 10-40 % | Presupuesto de aprobación, control | −20 % / +30 % |
| 2 | 30-75 % | Control, licitación | −15 % / +20 % |
| 1 | 65-100 % | Licitación cerrada, verificación | −10 % / +15 % |

Los rangos exactos varían por industria; **verificar** la Recommended Practice 18R-97 (procesos) o 56R-08 (infraestructura) antes de citar en un informe.

## Estimación conceptual
- Métodos: por analogía (proyectos similares ajustados), paramétrica (costo por unidad de
  capacidad, por m², por l/s), por factores (Lang, Hand: costo instalado = factor × costo de
  equipos), regla de los seis décimos para escalar capacidad:

```
C2 = C1 × (Q2 / Q1)^n        n ≈ 0,6 (varía 0,3 a 0,9 según tipo de planta)
Ejemplo: planta de 400 l/s cuesta C1; duplicar a 800 l/s ≈ C1 × 2^0,6 ≈ 1,52 C1
```

- Índices de actualización: ICE (Índice de Costos de Edificación), IPC, CPI de Chemical
  Engineering para plantas; tipo de cambio para suministros importados.

## Estudio del costo detallado
- Clasificación: costo directo (mano de obra, materiales, equipos, subcontratos), costo
  indirecto / gastos generales de obra (personal de administración, instalación de faena,
  campamento, vehículos, seguros, garantías, ensayos), gastos generales de oficina central
  (indirectos), utilidad, imprevistos / contingencia, IVA.

```
Precio de venta = Costo directo + GG obra + GG oficina central + Utilidad (+ Contingencia) + IVA
Coeficiente de recargo k = Precio neto / Costo directo   (típico 1,25 a 1,45 en obras civiles; en montaje minero depende de campamento y turnos)
```

- Costo base de mano de obra: sueldo base + gratificación + cargas sociales (AFP, salud,
  seguro de cesantía, mutual según cotización de riesgo) + beneficios de convenio + bonos +
  viáticos + alojamiento y alimentación en faena + factor de días trabajados vs pagados
  (turnos 7×7, 10×10, 14×14). Rendimiento (HH/unidad) es el factor más sensible.
- Costo base de materiales: precio puesto en obra (flete, mermas, almacenamiento).
- Costo de poseer y operar equipos: posesión (depreciación, interés, seguros, impuestos)
  + operación (combustible, lubricantes, neumáticos, mantención, operador). Depreciación
  lineal: `(valor inicial − residual) / vida útil en horas`. Ciclo de vida económica: hora
  en que el costo promedio acumulado es mínimo.
- Costos de accidentes: directos (atención, indemnizaciones, cotización mutual) e
  indirectos (paralización, investigación, reemplazo, daño material, imagen). La relación
  indirecto/directo de Heinrich (4:1) es una referencia histórica; hoy se usan estudios por
  sector. Tasa de siniestralidad y accidentabilidad: ver `estadistica-aplicada.md`.

## Análisis de precios unitarios (APU) y presupuesto
- APU = por unidad de obra: materiales (cantidad × precio, con pérdidas) + mano de obra
  (rendimiento × costo HH) + equipos (rendimiento × costo hora) + subcontratos. Se suma el
  recargo de GG y utilidad si el APU es de venta.
- Presupuesto = Σ (cantidad cubicada × PU). El itemizado sigue la EDT/WBS y las
  especificaciones. Presentación: resumen por capítulo, itemizado, APU, GG detallados,
  supuestos y exclusiones, programa, curva S de flujo.
- Cubicación: medición de cantidades desde planos con criterios de medición (NCh 353 para
  edificación; en montaje: toneladas de estructura, metros de piping por diámetro y schedule,
  cantidad de equipos por peso, metros de cable por sección).

## Adjudicación y sistemas de pago
- Evaluación de ofertas: técnica (ponderada) + económica; presupuesto oficial y rangos de
  aceptación; ofertas anormalmente bajas.
- **Presupuesto compensado** (unbalanced bid): distribuir el recargo desigual entre ítems
  (cargar los primeros ítems o los que se cree que aumentarán) manteniendo el total. Mejora
  el flujo de caja del contratista; el mandante lo detecta comparando PU con el presupuesto
  oficial.
- Reajuste: polinómica con índices (IPC, ICE, dólar, acero, combustible) por componente.
- Estados de pago: avance físico × PU; retenciones (5-10 %) devueltas en recepción;
  anticipo amortizado proporcionalmente.

## Control de costos y plazo: valor ganado (EVM)

```
PV  valor planificado (presupuesto del trabajo programado a la fecha)
EV  valor ganado (presupuesto del trabajo realmente ejecutado)
AC  costo real
SV = EV − PV     CV = EV − AC        (negativo = atraso / sobrecosto)
SPI = EV / PV    CPI = EV / AC       (< 1 = mal)
BAC presupuesto total
EAC = BAC / CPI  (si la tendencia se mantiene)   EAC = AC + (BAC − EV)  (si el desvío fue puntual)
ETC = EAC − AC   VAC = BAC − EAC
TCPI = (BAC − EV) / (BAC − AC)   eficiencia necesaria para terminar dentro del BAC
```

- Curva S: PV, EV y AC acumulados en el tiempo. La brecha horizontal entre EV y PV es el
  atraso en tiempo; la vertical entre EV y AC es el sobrecosto.
- Reglas de medición de avance: 0/100, 50/50, hitos ponderados, unidades completadas,
  nivel de esfuerzo. En montaje: avance por HH ganadas según pesos de actividades estándar
  (ej. piping: prefabricación 40 %, montaje 35 %, soldadura de campo, prueba, etc., según
  la norma interna).

## Anclas en la experiencia de Francisco
- Cubicación y APU del Estadio Nacional (Vías, 2019): 64 hectáreas, itemizado por partidas.
- Desaladora Los Pelambres de 400 a 800 l/s: estimación paramétrica y regla de seis décimos.
- KPI HSEQ consolidados: mismo principio que EVM, indicador de eficiencia y tendencia.
- Estudio de propuestas: GG de HSEQ (personal, EPP, capacitación, campamento) suelen
  subestimarse; su rol es asegurar que el plan HSEQ tenga costo.

## Autoevaluación (respuestas al final)
1. Un proyecto tiene PV 1.000, EV 800, AC 900. Calcula SV, CV, SPI, CPI y EAC con tendencia.
2. ¿Qué diferencia GG de obra de GG de oficina central y dónde va cada uno en el precio?
3. ¿Por qué el rendimiento de mano de obra es el factor más sensible de un APU?
4. ¿Qué es un presupuesto compensado y cómo lo detecta un mandante?
5. Escala con la regla de seis décimos: una planta de 100 t/día cuesta 10 MUSD; ¿cuánto una de 300 t/día?
6. Nombra tres componentes del costo de posesión de un equipo y tres de operación.
7. ¿Qué clase de estimación AACE corresponde a una ingeniería al 15 % y qué rango tiene?
8. ¿Cómo se refleja el costo de un accidente grave en un presupuesto de obra?
9. ¿Qué es TCPI y para qué se usa?
10. ¿Qué elementos debe incluir la presentación formal de un presupuesto?

<details><summary>Respuestas</summary>

1. SV = −200; CV = −100; SPI = 0,80; CPI = 0,889; EAC = BAC / 0,889 (si BAC = 5.000, EAC ≈ 5.625).
2. GG de obra: costos indirectos de esa obra (administración, instalación de faena, seguros); GG de oficina central: costos de la empresa distribuidos entre proyectos. Ambos se recargan sobre el costo directo antes de la utilidad.
3. Porque se multiplica por el costo HH cargado y tiene alta variabilidad (clima, altura geográfica, curva de aprendizaje, turnos); pequeños errores de rendimiento cambian el costo directo total.
4. Distribuir GG y utilidad de forma desigual entre ítems manteniendo el total; el mandante compara PU ítem a ítem con el presupuesto oficial y con las demás ofertas.
5. 10 × (300/100)^0,6 = 10 × 1,93 ≈ 19,3 MUSD.
6. Posesión: depreciación, interés del capital, seguros e impuestos. Operación: combustible, lubricantes y filtros, neumáticos u orugas, mantención y reparación, operador.
7. Clase 4, aproximadamente −30 % / +50 %.
8. Como costo directo e indirecto no presupuestado (paralización, investigación, reemplazo) y como aumento futuro de la cotización adicional en la mutual; por eso el plan HSEQ es una inversión con retorno.
9. Índice de desempeño del trabajo por completar: eficiencia de costo necesaria en lo que queda para terminar dentro del presupuesto (o de la EAC). Si TCPI es mucho mayor que el CPI actual, la meta es irreal.
10. Resumen por capítulos, itemizado con cantidades y PU, APU, detalle de GG, supuestos y exclusiones, programa y curva de flujo, condiciones comerciales (reajuste, anticipo, plazo).
</details>

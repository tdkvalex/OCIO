# Núcleo: Estadística y probabilidad aplicadas a HSEQ, inspección y proyectos

**Estado**: Refuerzo. Base de SPC, Six Sigma, muestreo de inspección, KPI de seguridad y
de las asignaturas cuantitativas de la Ingeniería Civil Industrial.

## Descriptiva
- Media, mediana, moda; varianza y desviación estándar (muestral con n−1); coeficiente de
  variación `CV = s / x̄`; cuartiles, rango intercuartil, boxplot; asimetría.
- Pareto (80/20), histogramas, estratificación. Con datos de KPI: no comparar proyectos con
  distinto tamaño sin normalizar (tasa, no conteo).

## Probabilidad
- Reglas: unión, intersección, condicional `P(A|B) = P(A∩B)/P(B)`, independencia, Bayes
  `P(A|B) = P(B|A)·P(A)/P(B)`.
- Distribuciones útiles: binomial (defectuosos en n inspecciones), Poisson (accidentes por
  periodo, defectos por unidad; `P(k) = λ^k e^−λ / k!`), exponencial (tiempo entre fallas),
  normal (variables continuas), lognormal (costos, duraciones), Weibull (fallas de equipos,
  β < 1 mortalidad infantil, β = 1 aleatoria, β > 1 desgaste), triangular y PERT para
  estimaciones de duración `E = (a + 4m + b)/6`, `σ = (b − a)/6`.
- Normal: regla 68-95-99,7; `z = (x − μ)/σ`; z = 1,645 para 95 % unilateral, 1,96 para 95 %
  bilateral, 2,576 para 99 %.

## Inferencia
- Intervalo de confianza para media: `x̄ ± z·σ/√n` (σ conocida) o `x̄ ± t·s/√n`.
  Para proporción: `p ± z·√(p(1−p)/n)`. Tamaño de muestra para proporción:
  `n = z²·p(1−p)/E²`.
- Pruebas de hipótesis: H0/H1, error tipo I (α, rechazar H0 verdadera) y tipo II (β),
  potencia = 1 − β, valor p. Pruebas t (una muestra, dos muestras, pareada), chi-cuadrado
  (independencia, bondad de ajuste), ANOVA (más de dos grupos), pruebas no paramétricas.
- Regresión lineal: `y = β0 + β1x`, R², residuos; correlación no implica causalidad
  (variables de confusión como tamaño de proyecto o estación del año).
- Diseño de experimentos (DOE) básico: factorial 2^k, efectos principales e interacciones.

## Muestreo de aceptación
- ISO 2859-1 (atributos; ex MIL-STD-105E): nivel de inspección (I, II, III; especiales S-1 a
  S-4), letra de código por tamaño de lote, AQL (nivel de calidad aceptable), planes simple,
  doble, múltiple, inspección normal, rigurosa y reducida. Curva OC: riesgo del productor
  (α) y del consumidor (β).
- ISO 3951 (variables). En inspección de soldadura los porcentajes de END del contrato
  reemplazan el muestreo estadístico, pero el concepto de "elevar a 100 % si aparece un
  rechazo" es inspección rigurosa.

## Indicadores de seguridad (Chile y práctica internacional)

```
Tasa de accidentabilidad (Chile, SUSESO) = N° accidentes con tiempo perdido × 100 / promedio de trabajadores
Tasa de siniestralidad por incapacidad temporal = días perdidos × 100 / promedio de trabajadores
Índice de frecuencia (IF) = accidentes CTP × 1.000.000 / HH trabajadas
Índice de gravedad (IG)   = días perdidos × 1.000.000 / HH trabajadas
TRIFR (internacional)     = casos registrables × 1.000.000 / HH   (algunas mineras usan 200.000 HH, estilo OSHA)
Tasa de frecuencia de fatalidad, potencial de alto riesgo (HPI) como indicadores modernos
```

- Indicadores reactivos (accidentes) vs proactivos (observaciones, reportes de
  condiciones, cierre de acciones, capacitación). Con pocos eventos, la tasa mensual es
  ruido estadístico: usar acumulados móviles de 12 meses o gráficos c/u.
- Cotización adicional diferenciada de la mutual (DS 67) depende de la siniestralidad
  efectiva de los últimos periodos: el costo de la accidentabilidad es literal.

## Indicadores de calidad
- % protocolos rechazados, % END rechazados por soldador, NCR abiertas/cerradas, tiempo
  medio de cierre de NCR, costo de no calidad (retrabajo, reparaciones), DPMO de juntas.
- Todos deben mostrarse con su tamaño de muestra y, cuando corresponda, con límites de
  control para distinguir señal de ruido antes de reportar a gerencia.

## Herramientas
- Power BI / Power Query: medidas DAX para tasas (numerador y denominador separados, nunca
  promedio de porcentajes), acumulados móviles, segmentación por proyecto. Excel: funciones
  estadísticas, análisis de datos, gráficos de control manuales. Python o R para SPC y
  regresión si escala.

## Autoevaluación (respuestas al final)
1. Un proyecto tuvo 2 accidentes CTP en 400.000 HH. Calcula IF. Con 30 días perdidos, calcula IG.
2. ¿Por qué no se promedian porcentajes de proyectos para obtener el corporativo?
3. Si un proceso tiene λ = 0,5 accidentes/mes, ¿probabilidad de 0 accidentes en un mes? ¿Y de al menos uno en un año?
4. ¿Qué es AQL y qué riesgo protege?
5. Explica error tipo I y tipo II en el contexto de rechazar un lote de pernos.
6. Con p = 0,1 y error deseado 5 % al 95 % de confianza, ¿cuántas juntas debo inspeccionar?
7. ¿Qué distribución modela el tiempo entre fallas de un equipo con tasa constante?
8. Estimación PERT: optimista 8, más probable 10, pesimista 18 días. Media y desviación.
9. ¿Qué indica β > 1 en Weibull?
10. ¿Qué tres cosas debe mostrar un KPI antes de ir a gerencia?

<details><summary>Respuestas</summary>

1. IF = 2 × 1.000.000 / 400.000 = 5. IG = 30 × 1.000.000 / 400.000 = 75.
2. Porque cada proyecto tiene distinto denominador; el porcentaje corporativo es la suma de numeradores sobre la suma de denominadores (promedio ponderado).
3. P(0) = e^−0,5 ≈ 0,607. En un año λ = 6: P(≥1) = 1 − e^−6 ≈ 0,9975.
4. Nivel de calidad aceptable: peor nivel de calidad promedio tolerable del proceso; el plan protege al productor (lotes con calidad AQL se aceptan con alta probabilidad, riesgo α ≈ 5 %).
5. Tipo I: rechazar un lote bueno (riesgo del productor). Tipo II: aceptar un lote malo (riesgo del consumidor, el más grave en seguridad).
6. n = 1,96² × 0,1 × 0,9 / 0,05² ≈ 138 juntas.
7. Exponencial (Poisson para el número de fallas por periodo).
8. E = (8 + 40 + 18)/6 = 11 días; σ = (18 − 8)/6 ≈ 1,67 días.
9. Tasa de falla creciente: desgaste; conviene mantenimiento preventivo por tiempo o condición.
10. Definición y fórmula, tamaño de muestra o denominador, y contexto de variación (tendencia, límites de control o comparación con periodo anterior).
</details>

# Núcleo: Hidráulica de redes, tratamiento de aguas y RILES

**Estado**: Refuerzo. Conocimiento de la etapa SUEZ (2015-2018) y consultorías sanitarias
(Aeropuerto AMB, Hospital Fricke). Vuelve a ser relevante con la Desaladora de Los
Pelambres y con plantas de efluentes (MAPA).

## Hidráulica básica que se olvida

```
Continuidad:      Q = V × A            (m³/s, m/s, m²)
Bernoulli:        z1 + p1/γ + V1²/2g = z2 + p2/γ + V2²/2g + hf
Darcy-Weisbach:   hf = f × (L/D) × V²/(2g)     f de Moody / Colebrook; laminar f = 64/Re
Reynolds:         Re = V × D / ν     (< 2.000 laminar, > 4.000 turbulento)
Hazen-Williams:   hf = 10,67 × L × Q^1,852 / (C^1,852 × D^4,87)   (SI; C: PVC 150, acero nuevo 130-140, fierro fundido viejo 80-100)
Manning (canal):  V = (1/n) × R^(2/3) × S^(1/2)   R = A/P mojado; n: hormigón 0,013, PVC 0,009-0,011
Potencia bomba:   P = ρ × g × Q × H / η     (W; agua ρ = 1.000 kg/m³)   ≈ Q[l/s] × H[m] / (102 × η) en kW
Golpe de ariete:  Δp ≈ ρ × a × ΔV   (Joukowsky)   a: celeridad 300 a 1.200 m/s según material
```

- Curva de sistema vs curva de bomba: punto de operación. NPSH disponible > NPSH requerido
  (margen 0,5 a 1 m) para evitar cavitación. Bombas en paralelo suman caudal, en serie
  suman altura.
- Presiones de servicio en redes de AP: mínimas del orden de 15 m.c.a. y máximas 70 m.c.a.
  según normativa sanitaria (NCh 691 y reglamentación SISS; verificar).
- Sectorización y control: DMA (distritos de medida), balance hídrico IWA (agua no
  contabilizada / ANF, pérdidas reales vs aparentes, ILI), telemetría, válvulas reductoras.
  Fue el corazón del trabajo en AMB y Sewell.

## Tratamiento de aguas servidas y RILES
- Tren típico: pretratamiento (rejas, desarenador, desengrasador) → primario (sedimentación)
  → secundario biológico (lodos activados, aireación extendida, SBR, MBBR, MBR; o
  anaerobio UASB para RILES de alta carga) → terciario (filtración, nutrientes) →
  desinfección (cloro, UV) → manejo de lodos (espesado, digestión, deshidratación).
- Parámetros: DBO5, DQO, SST, N, P, aceites y grasas, pH, temperatura, coliformes.
  Relación DQO/DBO indica biodegradabilidad.
- Aireación (mejoras en El Teniente, 2016): transferencia de oxígeno `OTR = kLa × (Cs − C)`;
  SOTE (eficiencia estándar) por difusores de burbuja fina 25-40 % vs gruesa 8-12 %; el
  consumo de aireación es 50-60 % de la energía de una PTAS. Control por OD (setpoint 1,5-2
  mg/l) y sopladores con variador.
- Biofactorías (SUEZ Gran Santiago): concepto de planta que produce agua para reúso,
  biogás (cogeneración) y biosólidos; economía circular.
- Normativa chilena: DS 90/2000 (descarga de RILES a aguas superficiales), DS 46/2002
  (aguas subterráneas), DS 609/1998 (descarga a alcantarillado), NCh 1333 (calidad de agua
  para distintos usos, riego), DS 4/2009 (lodos), Ley 21.075 (aguas grises).
  **Verificar** actualizaciones antes de citar en informes.

## Desalación (Desaladora Los Pelambres, 400 a 800 l/s)
- Ósmosis inversa (RO): captación de agua de mar → pretratamiento (DAF, filtros
  multimedia o ultrafiltración, cartuchos) → bombas de alta presión (55-70 bar) → membranas
  en trenes → recuperadores de energía (ERD, intercambiadores de presión) → post
  tratamiento (remineralización, pH) → impulsión a la mina (a menudo > 1.000 m de
  elevación, la impulsión consume más que la RO).
- Recuperación típica de agua de mar 40-50 %; salmuera al mar con difusores; SEC de RO
  2,5-4 kWh/m³ y total con impulsión mucho mayor según cota.
- Calidad en montaje: piping en dúplex / superdúplex y GRP, soldadura con control de
  ferrita, pruebas hidrostáticas, limpieza y pasivación, integridad de membranas, tanques
  de hormigón con estanqueidad.

## Anclas en la experiencia de Francisco
- Codelco DET: georreferenciación de redes, control de consumos, puntos críticos.
- Sewell: red de AP para 4.000 usuarios; eficiencia hídrica.
- El Teniente: aireación de RILES.
- Mapocho Trebal: respaldo eléctrico de una planta cuya parada es un riesgo ambiental.
- Los Pelambres: supervisión corporativa de la desaladora.

## Autoevaluación (respuestas al final)
1. Calcula la potencia hidráulica para 800 l/s a 60 m con η 0,8.
2. ¿Qué pasa con hf si duplico el caudal en una tubería (Darcy-Weisbach)?
3. ¿Qué es NPSH y cuál de los dos NPSH depende de la instalación?
4. ¿Qué es un DMA y qué indicador de pérdidas se calcula con él?
5. ¿Por qué la aireación es el foco de eficiencia energética en una PTAS?
6. ¿Qué norma regula la descarga de RILES a un río en Chile y cuál a alcantarillado?
7. Tren típico de una desaladora de agua de mar por RO.
8. ¿Qué es la recuperación en RO y qué implica para la salmuera?
9. ¿Qué relación DQO/DBO indica un RIL poco biodegradable?
10. ¿Qué diferencia bombas en serie de bombas en paralelo?

<details><summary>Respuestas</summary>

1. P = 1.000 × 9,81 × 0,8 × 60 / 0,8 ≈ 588.600 W ≈ 589 kW (aprox. 800 × 60 / (102 × 0,8) = 588 kW).
2. Se cuadruplica aproximadamente (hf proporcional a V², y V se duplica), algo menos por variación de f.
3. Net Positive Suction Head: NPSH disponible depende de la instalación (presión atmosférica, cota, pérdidas de succión, temperatura); NPSH requerido lo da el fabricante de la bomba.
4. Distrito de medida: sector aislado de la red con entrada medida; con él se calcula el caudal mínimo nocturno y el balance de agua no contabilizada, y el ILI.
5. Porque los sopladores representan 50-60 % del consumo; mejoras en difusores (burbuja fina), control por OD y variadores dan retornos rápidos.
6. DS 90 para cuerpos superficiales; DS 609 para alcantarillado (DS 46 para infiltración a acuíferos).
7. Captación, pretratamiento (DAF/UF/filtros/cartuchos), bombas de alta presión, membranas RO, recuperadores de energía, post tratamiento (remineralización), almacenamiento e impulsión; salmuera con emisario.
8. Fracción del agua alimentada que sale como permeado (40-50 % en agua de mar); el resto es salmuera con casi el doble de salinidad, que debe diluirse con difusores para cumplir norma.
9. DQO/DBO mayor que 3 a 4 indica baja biodegradabilidad (requiere tratamiento físico-químico o avanzado); cerca de 2 es biodegradable.
10. Serie: mismo caudal, alturas se suman. Paralelo: misma altura, caudales se suman (con menor rendimiento del que se espera por la curva de sistema).
</details>

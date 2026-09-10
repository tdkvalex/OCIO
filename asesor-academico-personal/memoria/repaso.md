# Cola de repaso espaciado

Tabla que lee y actualiza `scripts/repaso.py`. No cambies los nombres de columnas.
- **nivel**: 0 (nunca evaluado) a 5 (dominio sólido). Es la última nota obtenida.
- **facilidad**: factor de espaciado (parte en 2,5; sube con buenas notas, baja con malas).
- **intervalo**: días hasta el próximo repaso.
- **ultimo** / **proximo**: fechas AAAA-MM-DD. Vacío en ultimo = nunca repasado.
- **fuente**: ficha de referencia dentro de biblioteca/.

Comandos:
```
python3 scripts/repaso.py hoy                          # qué está vencido o vence hoy
python3 scripts/repaso.py registrar "<tema>" <0-5>      # registra resultado y reprograma
python3 scripts/repaso.py agregar "<tema>" "<fuente>"   # nuevo tema (nivel 0, vence hoy)
python3 scripts/repaso.py listar                        # toda la cola ordenada por fecha
```

| tema | fuente | nivel | facilidad | intervalo | ultimo | proximo |
|---|---|---|---|---|---|---|
| AWP: CWP/EWP/IWP e integración con QA/QC | nucleos/planificacion-last-planner.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| Auditoría ISO 19011: programa, plan, hallazgos, acción correctiva | nucleos/iso-sistemas-integrados.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| Contratos: marco legal chileno y controversias | nucleos/gestion-contratos-construccion.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| Contratos: modalidades, asignación de riesgo, EPC vs EPCM | nucleos/gestion-contratos-construccion.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| Costos: estimación, APU, gastos generales, presupuesto | nucleos/costos-presupuestos-control.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| Estadística: distribuciones, inferencia, muestreo | nucleos/estadistica-aplicada.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| Hidráulica: pérdidas de carga, bombas, redes y DMA | nucleos/hidraulica-redes-tratamiento.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| Hormigón, acero y soldadura: especificación e inspección | nucleos/fundamentos-constructor-civil.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| ISO 31000: principios, marco, proceso, técnicas | nucleos/iso-riesgo-activos-energia.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| ISO 50001: revisión energética, IDEn, línea base | nucleos/iso-riesgo-activos-energia.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| ISO 55001: SAMP, ciclo de vida, disponibilidad | nucleos/iso-riesgo-activos-energia.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| ISO 9001/14001/45001: cláusulas y evidencia | nucleos/iso-sistemas-integrados.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| Indicadores HSEQ: fórmulas y lectura estadística | nucleos/estadistica-aplicada.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| Last Planner: niveles, PPC, restricciones, buffers | nucleos/planificacion-last-planner.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| Lean: desperdicios, herramientas, takt, Lean Construction | nucleos/lean-six-sigma-spc.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| Liderazgo, influencia sin autoridad, gestión del cambio | nucleos/pmbok-enfoques-proyectos.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| Modelo de protocolización digital: estandarización, digitalización, gobernanza | fuentes/tcc-protocolos-calidad-mineria.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| Método de investigación aplicada: estudio de caso, enfoque mixto, Pareto | fuentes/tcc-protocolos-calidad-mineria.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| PMBOK 7: principios y dominios; PMBOK 6: áreas y procesos | nucleos/pmbok-enfoques-proyectos.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| PMO, portafolio y viabilidad económica (VAN, TIR) | nucleos/pmbok-enfoques-proyectos.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| Piping, precomisionamiento y punch list | nucleos/fundamentos-constructor-civil.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| SPC: causas de variación, gráficos de control, capacidad | nucleos/lean-six-sigma-spc.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| Six Sigma: DMAIC, DPMO, niveles sigma | nucleos/lean-six-sigma-spc.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| Suelos, topografía, sismo e instalaciones eléctricas | nucleos/fundamentos-constructor-civil.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| Tratamiento de aguas, RILES y desalación | nucleos/hidraulica-redes-tratamiento.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| Valor ganado: PV, EV, AC, índices, EAC | nucleos/costos-presupuestos-control.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| Ágil e híbrido: Scrum, Kanban, criterios de elección | nucleos/pmbok-enfoques-proyectos.md | 0 | 2.5 | 1 |  | 2026-09-07 |
| Calidad de dato: seis dimensiones, ISO 8000 y 25012 | nucleos/quality-40-digitalizacion-procesos.md | 0 | 2.5 | 1 |  | 2026-09-10 |
| Cronograma Ganado y valor ganado avanzado | nucleos/direccion-proyectos-pmi-avanzada.md | 0 | 2.5 | 1 |  | 2026-09-10 |
| Examen PMP 2026: dominios, requisitos y formato | nucleos/direccion-proyectos-pmi-avanzada.md | 0 | 2.5 | 1 |  | 2026-09-10 |
| Hoshin Kanri, madurez y costo de la mala calidad | metodologia/ruta-excelencia-operacional.md | 0 | 2.5 | 1 |  | 2026-09-10 |
| Monte Carlo: percentiles, distribuciones y sesgos | nucleos/direccion-proyectos-pmi-avanzada.md | 0 | 2.5 | 1 |  | 2026-09-10 |
| PMBOK 8: principios, dominios y areas de enfoque | nucleos/direccion-proyectos-pmi-avanzada.md | 0 | 2.5 | 1 |  | 2026-09-10 |
| Portafolios, programas y realizacion de beneficios | nucleos/direccion-proyectos-pmi-avanzada.md | 0 | 2.5 | 1 |  | 2026-09-10 |
| Quality 4.0: 11 ejes, digital lean, minería de procesos | nucleos/quality-40-digitalizacion-procesos.md | 0 | 2.5 | 1 |  | 2026-09-10 |

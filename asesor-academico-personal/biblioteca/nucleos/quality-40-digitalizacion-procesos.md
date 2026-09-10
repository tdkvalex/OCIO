# Núcleo: Quality 4.0, digitalización de procesos y analítica aplicada a la mejora

**Estado**: Brecha con base sólida. Francisco ya digitaliza y automatiza a diario (dashboard
corporativo, Power BI, integración AWP), pero le falta el **marco formal** que dé nombre y
estructura a lo que hace, para defenderlo ante un directorio y replicarlo. Este núcleo es la
capa 4.0 de la ruta de `metodologia/ruta-excelencia-operacional.md`.

> Investigado el 10 de septiembre de 2026. El proxy de red bloqueó el acceso directo a todas
> las fuentes primarias, así que la verificación se hizo con buscador. Los puntos marcados
> **[contrastar]** deben abrirse en el navegador antes de usarse en material formal.

## 1. Quality 4.0: qué es y de dónde sale

**Definición de ASQ**: el futuro de la calidad y la excelencia organizacional en el contexto
de las necesidades y expectativas de desempeño de la Industria 4.0. El desplazamiento clave
es de un modelo **reactivo a uno proactivo y predictivo**, con datos en tiempo real y
analítica avanzada. Y el rol del profesional de calidad pasa de fiscalizador a **navegante
de la disrupción digital**. Esa frase describe con precisión el cargo al que Francisco apunta.

**Referencia fundacional**: Nicole Radziwill, "Quality 4.0: Let's Get Digital", Quality
Progress (ASQ), octubre de 2018, pp. 24-29. Es el artículo que popularizó el término.

**Marco más útil para estructurar un programa**: "The Quality 4.0 Roadmap: Designing a
capability roadmap toward quality management in Industry 4.0", Quality Management Journal,
2024, DOI 10.1080/10686967.2024.2317478. Es una hoja de ruta de capacidades por etapas de
madurez.

### Los 11 ejes de LNS Research (2017), agrupados en personas, proceso y tecnología

| Dimensión | Ejes |
|---|---|
| Tecnología | Datos, Analítica, Conectividad, Desarrollo de aplicaciones, Escalabilidad |
| Proceso | Sistemas de gestión (el sistema de calidad), Cumplimiento |
| Personas | Cultura, Liderazgo, Competencia, y Colaboración (compartida con tecnología) |

Con cinco niveles de madurez. **El mensaje que conviene abrir cualquier presentación**:
Quality 4.0 no reemplaza los métodos tradicionales de calidad, se construye sobre ellos. Y
**cinco de los once ejes no son tecnológicos**. Es el mejor argumento contra la idea de que
digitalizar es comprar software.

## 2. Digital Lean: qué herramienta digital reemplaza o potencia a cuál clásica

| Herramienta clásica | Versión digital | Qué cambia de verdad |
|---|---|---|
| Mapa de flujo de valor en papel | **Minería de procesos** sobre registros de eventos | De lo que la gente dice que hace, a lo que el sistema registra que pasó |
| Andon físico (una luz) | Andon digital con notificación y código de error | La luz no deja dato; el andon digital genera el registro de razones de parada para hacer Pareto |
| Recorrido de terreno presencial | Recorrido remoto con video, sensores y tableros en vivo | Rompe la restricción de una sola ubicación. **No sustituye al terreno, lo complementa** |
| Poka-yoke mecánico | Poka-yoke con visión artificial | El error de montaje se detecta en línea, no se previene con un cartel |
| Kanban en tarjetas | Kanban electrónico con reposición automática | Trazabilidad y disparo automático |
| Hoja de control manual | Control estadístico en tiempo real sobre datos de máquina | El muestreo pasa a ser censo continuo |

**La advertencia que hay que enseñar junto con esto**: se puede digitalizar el desperdicio.
Automatizar un proceso malo lo hace más rápido y sigue siendo malo.

## 3. Minería de procesos (process mining)

**Qué es**: descubrir, monitorear y mejorar procesos reales extrayendo conocimiento de los
registros de eventos que ya existen en los sistemas de información.

**Los tres tipos canónicos** (van der Aalst):
1. **Descubrimiento**: extraer el modelo del proceso desde el registro, sin modelo previo.
2. **Verificación de conformidad**: comparar el registro contra el modelo y detectar desvíos.
3. **Mejora o extensión**: enriquecer el modelo con la realidad del registro (tiempos,
   recursos, costos).

**Obra fundacional**: Wil van der Aalst, *Process Mining: Discovery, Conformance and
Enhancement of Business Processes*, Springer, 2011; 2.ª edición 2016 como *Process Mining:
Data Science in Action*. Más el **Process Mining Manifesto** de la IEEE Task Force (2011),
respaldado por 53 organizaciones y 77 expertos, de acceso abierto.

**Hay estándar, y no es ISO**: **IEEE Std 1849-2023** para el formato de intercambio de
registros de eventos (revisión vigente desde el 9 de septiembre de 2023, que reemplaza a la
de 2016, activa hasta 2033). Además **OCEL 2.0** (octubre de 2023) como estándar de facto
emergente para procesos centrados en objetos. Que exista un estándar IEEE es el argumento de
que esto no es una moda de proveedor: los datos son portables entre herramientas.

**Relación con el mapa de flujo de valor y con DMAIC**: la minería de procesos sustituye al
mapa manual en las fases de definir y medir, y además aporta a analizar (variantes,
retrabajo, conformidad) y a controlar (monitoreo continuo). Hay revisión sistemática de 2026
en Discover Applied Sciences sobre la combinación de ambos.

**Herramientas**: para laboratorio, **ProM** (Java, referencia académica) o **PM4Py**
(librería de Python, gratuita) porque usan el formato estándar y cuestan cero. Para demostrar
a un ejecutivo, **Disco** por su impacto visual inmediato. **Celonis** y **SAP Signavio** son
conversación de arquitectura, no de aula. En el cuadrante de Gartner 2025 figuran como
líderes Celonis, SAP Signavio, ARIS, Apromore, IBM y MEHRWERK.

**Dato que aplica directo a Besalco**: la licencia **Power Automate Premium incluye
capacidades de minería de procesos**. En una empresa que ya paga Power Platform, se puede
montar un piloto sin comprar nada nuevo. **[contrastar]** precios y alcance con Microsoft.

## 4. Automatización robótica de procesos (RPA)

**El anti-patrón tiene nombre y linaje**: *pavimentar el sendero de la vaca*, que se remonta
a Michael Hammer, "Reengineering Work: Don't Automate, Obliterate", Harvard Business Review,
1990. Son procesos crecidos de forma orgánica que se hacen así porque siempre se hicieron
así; pavimentarlos los convierte en procedimiento oficial sin corregir la ruta.

- Los robots son excelentes siguiendo reglas y **pésimos manejando caos**.
- La automatización es un **multiplicador**: automatizar un proceso mal entendido escala
  errores, costos y riesgo.
- Invertir el orden, automatizar antes de ordenar, es una de las causas más comunes de que
  los proyectos de automatización no entreguen el retorno prometido.

**Regla operativa**: primero simplificar y estabilizar, después automatizar. En términos
DMAIC, **la automatización es una solución de la fase mejorar, nunca un sustituto de
analizar**. Un proceso es elegible cuando tiene alto volumen, alta repetición, reglas
deterministas, entradas digitales estructuradas, baja tasa de excepciones y estabilidad. Si
el proceso va a cambiar en seis meses, el robot es deuda técnica.

**Ecosistema Microsoft**, relevante porque Besalco ya usa Power BI: los **flujos en la nube**
conectan servicios mediante interfaces de programación y son la opción por defecto; los
**flujos de escritorio** automatizan la interfaz de usuario de sistemas antiguos sin
interfaz, en modo asistido o desatendido. Un cambio a agendar: los créditos incluidos de AI
Builder se eliminan el 1 de noviembre de 2026.

## 5. Calidad de dato: el prerrequisito que casi nadie pone primero

**Las seis dimensiones canónicas** las define el grupo de trabajo de DAMA del Reino Unido
(2013), precisamente para resolver la inconsistencia de definiciones:

1. Completitud
2. Unicidad
3. Consistencia
4. Exactitud
5. Validez
6. Oportunidad

El cuerpo de conocimiento DAMA-DMBOK2 (2.ª edición, 2017) las amplía a ocho, agregando
integridad y razonabilidad.

**Normas**: **ISO/IEC 25012** define **qué características de calidad de dato existen**, es
decir el vocabulario. **ISO 8000** define el **proceso ejecutable** para probar que se logró
y para intercambiarlo, con requisitos verificables por computador; su parte **8000-61** es el
modelo de referencia de procesos de gestión de calidad de datos, análogo a lo que ISO 9001 es
para la calidad de producto. Son complementarias.

**Por qué va antes y no después**: la minería de procesos, la automatización y el aprendizaje
automático **consumen** registros de eventos y datos maestros. Si fallan la unicidad y la
validez, el mapa descubierto es ficción y el robot propaga basura.

**Aplicación directa al caso de Francisco**: su TCC midió completitud de campos críticos
(firmas 92 %, identificador de equipo 85 %). Eso es exactamente una evaluación de calidad de
dato en las dimensiones de completitud y validez, hecha antes de conocer el marco. Ponerle el
nombre formal convierte un hallazgo en un argumento.

## 6. Qué exige realmente un Green Belt en estadística

**IASSC** organiza su cuerpo de conocimiento en las cinco fases. Lo estadístico se concentra así:

| Fase | Herramientas exigidas |
|---|---|
| Definir | Y en función de x, voz del cliente, del negocio y del empleado; roles; selección de proyecto; acta; fundamentos Lean |
| Medir | Estadística básica y descriptiva, distribución normal y pruebas de normalidad, análisis gráfico. **Análisis del sistema de medición**: precisión, exactitud, sesgo, linealidad, estabilidad, repetibilidad y reproducibilidad, por variables y por atributos. **Capacidad de proceso**: análisis, estabilidad, capacidad discreta |
| Analizar | **Estadística inferencial. Pruebas de hipótesis** con datos normales, no normales y por atributos |
| Mejorar | **Regresión lineal simple y múltiple. Diseño de experimentos**: factorial completo y fraccionado |
| Controlar | **Control estadístico de procesos**: cartas de individuales y rango móvil, media y rango, u, p. Controles Lean y plan de control |

El Yellow Belt de IASSC cubre **solo definir, medir y controlar**, no el ciclo completo. Es
un dato útil para dimensionar expectativas.

**ASQ** organiza su cuerpo de conocimiento de Green Belt en seis secciones, con una sección
inicial de contexto organizacional que incluye principios Lean y diseño para Six Sigma. Su
examen computarizado tiene 110 preguntas, de las cuales 100 puntúan. **[contrastar]** el
reparto de preguntas por sección: las fuentes se contradicen.

**Hallazgo con valor estratégico para vender el programa internamente**: el cuerpo de
conocimiento de ASQ de 2022 **ya incorporó mantenimiento predictivo, Andon y Jidoka**, junto
con metas SMART, indicadores, tiempo de ciclo objetivo, justo a tiempo, terreno, diagramas de
espagueti, modelo Kano, estructura de desglose del trabajo, revisiones de compuerta, análisis
de fortalezas y debilidades, y matriz de responsabilidades. **El cuerpo normativo ya se
movió**: el programa no se está adelantando al estándar, se está alineando con él.

## 7. Lo que aporta el aprendizaje automático, por fase

| Fase | Aporte real |
|---|---|
| Definir | Procesamiento de lenguaje natural sobre reclamos, tickets y voz del cliente no estructurada |
| Medir | Ingesta continua desde sensores y registros: el muestreo se vuelve censo |
| Analizar | Regresión, agrupamiento y detección de anomalías para encontrar patrones ocultos y predecir qué variables impulsan defectos. **Complementa, no reemplaza, la prueba de hipótesis** |
| Mejorar | Optimización y **mantenimiento predictivo** |
| Controlar | **Detección de anomalías con monitoreo continuo**, que identifica desplazamientos y tendencias antes de que se vuelvan problemas de calidad. Es control estadístico extendido |

**Matiz honesto**: buena parte de la literatura que cruza mejora continua con inteligencia
artificial entre 2024 y 2026 es entusiasta y poco crítica. La revisión "A Review of
Artificial Intelligence Impacting Statistical Process Monitoring and Future Directions"
(arXiv 2503.01858, 2025) es la que sí discute limitaciones. Lo esencial que hay que entender:
**un modelo de detección de anomalías no da causa raíz**; sigue haciendo falta analizar.

## 8. Software: qué usar según el rol

| Rol | Herramienta | Por qué |
|---|---|---|
| Green Belt de planta o calidad | **Minitab** | Está construido para esto y, sobre todo, **produce salidas en formatos que los revisores reconocen**. La salida de repetibilidad o de capacidad es el idioma del gremio |
| Ingeniería y diseño de experimentos | JMP | Interactividad visual y diseño avanzado |
| Analista interno | Python (statsmodels, scipy) o R | Reproducibilidad, versionado, integración. PM4Py vive aquí |
| Reporte a la organización | **Power BI** | Es herramienta de visualización y reporte, **no plataforma de análisis estadístico primario** |

**Límite de Power BI que conviene tener claro**: su lenguaje de fórmulas cubre bien la
estadística descriptiva y algo de inferencia ligera, pero regresión compleja, regresión
logística, agrupamiento y modelos de aprendizaje automático lo exceden; hay que integrar
scripts de R o Python. **Power BI no sustituye a Minitab en un proyecto Six Sigma, se
empareja con él.**

Libro que cubre los cuatro entornos a la vez: Bhisham C. Gupta, *Statistical Quality Control:
Using MINITAB, R, JMP and Python*, Wiley, 2021, ISBN 9781119671633.

## Autoevaluación (respuestas al final)
1. ¿Cuáles son las tres dimensiones en que se agrupan los 11 ejes de Quality 4.0 y por qué importa que cinco no sean tecnológicos?
2. ¿Cuáles son los tres tipos canónicos de minería de procesos?
3. ¿Qué estándar rige el formato de intercambio de registros de eventos y por qué importa que exista?
4. ¿En qué fase de DMAIC corresponde la automatización robótica y por qué nunca antes?
5. Nombra las seis dimensiones canónicas de calidad de dato y quién las define.
6. ¿Qué diferencia hay entre ISO/IEC 25012 e ISO 8000?
7. ¿Qué herramientas estadísticas exige la fase de mejorar en un Green Belt?
8. ¿Qué aporta la detección de anomalías en la fase de controlar y qué no aporta?
9. ¿Por qué Power BI no reemplaza a Minitab en un proyecto Six Sigma?
10. ¿Qué significa "pavimentar el sendero de la vaca" y de dónde viene la expresión?

<details><summary>Respuestas</summary>

1. Personas, proceso y tecnología. Importa porque demuestra que Quality 4.0 no se compra: cultura, liderazgo, competencia, sistemas de gestión y cumplimiento no se resuelven con software.
2. Descubrimiento (extraer el modelo del registro), verificación de conformidad (comparar registro contra modelo) y mejora o extensión (enriquecer el modelo con tiempos, recursos y costos).
3. IEEE Std 1849-2023, que reemplazó a la versión de 2016. Importa porque hace portables los datos entre herramientas y demuestra que la disciplina tiene base normativa, no de proveedor.
4. En mejorar. Antes de analizar la causa raíz, automatizar solo acelera un proceso malo y escala sus errores.
5. Completitud, unicidad, consistencia, exactitud, validez y oportunidad. Las define el grupo de trabajo de DAMA del Reino Unido, en 2013.
6. ISO/IEC 25012 define qué características de calidad existen, es el vocabulario. ISO 8000 define el proceso ejecutable para probarlo e intercambiarlo, con requisitos verificables por computador.
7. Regresión lineal simple y múltiple, y diseño de experimentos factorial completo y fraccionado.
8. Aporta monitoreo continuo que detecta desplazamientos y tendencias antes de que se vuelvan defectos. No aporta causa raíz: sigue haciendo falta la fase de analizar.
9. Porque su lenguaje de fórmulas no cubre regresión compleja, regresión logística, agrupamiento ni modelos de aprendizaje automático, y porque sus salidas no tienen el formato que los revisores del gremio reconocen para capacidad o repetibilidad.
10. Automatizar o formalizar un proceso crecido de forma orgánica sin corregirlo antes. Viene de Michael Hammer, "Reengineering Work: Don't Automate, Obliterate", Harvard Business Review, 1990.
</details>

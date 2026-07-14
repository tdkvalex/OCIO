# ⚽ Torneos de Fútbol

**Úsala aquí → https://tdkvalex.github.io/OCIO/**

Aplicación web (móvil primero) para **crear y administrar torneos de fútbol**: ligas,
liguillas, fases de grupos y eliminatorias, con **selecciones nacionales** o **clubes**.
No necesita servidor ni conexión: es HTML/CSS/JS puro y guarda todo en el dispositivo
(`localStorage`).

## Características

- **4 formatos de torneo**
  - **Liga**: todos contra todos, a una o dos vueltas.
  - **Liga + Liguilla**: fase regular y luego playoffs entre los mejores (estilo Liga MX).
  - **Grupos + Eliminatoria**: 2, 4 u 8 grupos y llaves finales (estilo mundial).
  - **Eliminatoria directa**: llaves de 2 a 64 equipos.
- **Opciones**: ida y vuelta en la eliminatoria, final única o de ida y vuelta,
  partido por el tercer puesto, 1 o 2 clasificados por grupo.
- **Plantillas listas**: Copa del Mundo, Champions League, Copa Libertadores,
  Copa Sudamericana, Copa Confederaciones, Copa América, Eurocopa, Copa Africana,
  Copa Asiática, Copa Oro, Mundial de Clubes, Premier League, LaLiga, Serie A,
  Bundesliga, Liga Chilena, Brasileirão, Liga Argentina y Liga MX. Todas son
  editables al crear.
- **216 selecciones nacionales** organizadas por continente y **307 clubes**
  organizados por país.
- **Buscador** de países y clubes (ignora acentos y mayúsculas).
- **Sorteo de grupos** con re-sorteo e intercambio manual de equipos.
- **Encuentros**: ingresa marcadores, penales cuando hay empate en llaves,
  finaliza o reabre partidos, o simula resultados con 🎲.
- **Cronómetro opcional por partido**: define los minutos (1-120), inicia,
  pausa o quita; al llegar a cero suena un pitazo de árbitro (dos cortos y
  uno largo), vibra en móviles y el partido queda resaltado hasta ingresar
  el marcador.
- **Automático**: tablas de posiciones, clasificación a llaves, avance de rondas,
  tercer puesto, campeón 🏆 y estadísticas (goles, promedios, mejor ataque/defensa,
  mayor goleada, tabla general).
- **Exportar / importar** todos los datos en JSON como respaldo.

## Cómo usarla

- **Opción 1 — un solo archivo**: genera `dist/torneos-futbol.html` con `./build.sh`
  (ya viene generado) y ábrelo en cualquier navegador; puedes enviarlo al teléfono
  y abrirlo ahí directamente.
- **Opción 2 — carpeta**: abre `index.html` en un navegador.
- **Opción 3 — GitHub Pages**: publica esta rama y entra a
  `https://<usuario>.github.io/<repo>/torneos-futbol/`.

En iPhone/Android puedes usar «Añadir a pantalla de inicio» para tenerla como app.

## Estructura

```
torneos-futbol/
├── index.html          Página principal
├── css/app.css         Estilos (tema oscuro, mobile-first)
├── js/data.js          Selecciones, clubes y plantillas de torneos
├── js/logic.js         Lógica pura: fixture, tablas, llaves, estadísticas
├── js/app.js           Interfaz y estado
├── build.sh            Genera dist/torneos-futbol.html (archivo único)
├── dist/               Versión de un solo archivo
└── tests/test-logica.js  Pruebas de la lógica (node tests/test-logica.js)
```

## Pruebas

```bash
node tests/test-logica.js
```

Cubre: calendarios round-robin, siembras, sorteos, mundial completo (64 partidos),
Champions con ida y vuelta y penales, liga de 20 (380 partidos), liguilla MX,
eliminatoria directa y validaciones de configuración.

## Escudos e insignias

- **Selecciones**: bandera oficial de cada país en SVG embebido
  ([circle-flags](https://github.com/HatScripts/circle-flags), MIT), las 216.
- **Clubes**: 296 de 308 con su escudo **original** embebido (SVG de football-badges + WebP de TheSportsDB)
  ([football-badges](https://www.npmjs.com/package/football-badges), MIT) —
  principalmente clubes sudamericanos. El resto usa un escudo SVG generado con
  los colores e iniciales del club.
- **Torneos**: insignias originales embebidas para Copa del Mundo, Champions
  League, Copa Libertadores, Premier League, Brasileirão y Liga Argentina;
  el resto usa su ícono.
- **Para completar los escudos originales faltantes** (clubes europeos,
  federaciones, más torneos): ejecuta en una red sin restricciones

  ```bash
  node tools/descargar-escudos.mjs            # clubes + torneos
  node tools/descargar-escudos.mjs --selecciones   # también federaciones
  ./build.sh
  ```

  Descarga los escudos oficiales desde [TheSportsDB](https://www.thesportsdb.com)
  y los incrusta en `js/escudos-extra.js` (la app los usa automáticamente).
  También hay un workflow manual de GitHub Actions
  (`.github/workflows/escudos.yml`) que hace esto con un clic una vez que la
  rama esté fusionada.
  Todo escudo funciona sin internet una vez incrustado.

## Notas

- El desempate en tablas es: puntos, diferencia de gol, goles a favor.
- Los escudos se muestran a título informativo; sus marcas pertenecen a los
  clubes, federaciones y organizadores respectivos.

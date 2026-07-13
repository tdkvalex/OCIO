# ⚽ Torneos de Fútbol

**Úsala aquí → https://tdkvalex.github.io/OCIO/**

Aplicación web (móvil primero) para crear y administrar torneos de fútbol:
ligas, liguillas, fases de grupos y eliminatorias, con selecciones nacionales
o clubes. Los datos se guardan en tu dispositivo — no necesita cuenta ni
servidor.

> 💡 En el teléfono: abre la URL en Safari/Chrome y usa
> «Añadir a pantalla de inicio» para tenerla como una app.

## Características

- **4 formatos**: Liga (1 o 2 vueltas), Liga + Liguilla, Grupos + Eliminatoria
  (estilo mundial) y Eliminatoria directa; ida y vuelta, final única o doble,
  y partido por el 3er puesto.
- **19 plantillas editables**: Copa del Mundo, Champions League, Copa
  Libertadores, Copa Sudamericana, Copa Confederaciones, Copa América,
  Eurocopa, Copa Africana, Copa Asiática, Copa Oro, Mundial de Clubes,
  Premier League, LaLiga, Serie A, Bundesliga, Liga Chilena, Brasileirão,
  Liga Argentina y Liga MX.
- **216 selecciones** por continente (bandera oficial en SVG) y **308 clubes**
  por país (44 con escudo original; el resto con escudo generado con los
  colores del club), con buscador.
- Sorteo de grupos con intercambio manual, marcadores con penales, avance
  automático de llaves, campeón 🏆 y estadísticas.
- Exportar/importar respaldo JSON. `dist/torneos-futbol.html` es la app
  completa en un solo archivo para uso sin internet.

## Completar los escudos originales

En la pestaña **Actions → «Descargar escudos originales» → Run workflow**:
descarga los escudos oficiales que faltan (clubes europeos, más torneos;
opcionalmente federaciones nacionales) desde TheSportsDB, los incrusta y
redespliega el sitio automáticamente.

## Desarrollo

```bash
node tests/test-logica.js   # pruebas de la lógica
./build.sh                  # regenera dist/torneos-futbol.html
```

Los escudos se muestran a título informativo; sus marcas pertenecen a los
clubes, federaciones y organizadores respectivos. Fuentes de escudos:
[circle-flags](https://github.com/HatScripts/circle-flags) (MIT) y
[football-badges](https://www.npmjs.com/package/football-badges) (MIT).

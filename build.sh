#!/usr/bin/env bash
# Genera dist/torneos-futbol.html: la app completa en UN solo archivo,
# ideal para copiar al teléfono o compartir.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p dist
{
  cat <<'HEAD'
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#0a1120">
<meta name="description" content="Crea y administra torneos de fútbol: ligas, liguillas, grupos y eliminatorias con selecciones y clubes.">
<title>Torneos de Fútbol ⚽</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚽</text></svg>">
<style>
HEAD
  cat css/app.css
  cat <<'MID'
</style>
</head>
<body>
<div id="app">
<div style="max-width:480px;margin:14vh auto 0;padding:24px;text-align:center;font-family:sans-serif;color:#93a4bf">
<div style="font-size:3rem">⚽</div>
<h2 style="margin:10px 0;color:#b9c6da">Cargando la aplicación…</h2>
<p style="line-height:1.6">Si este mensaje no desaparece, este visor no puede ejecutar la aplicación
(las vistas previas de archivos no ejecutan JavaScript).</p>
<p style="margin-top:22px"><a href="https://tdkvalex.github.io/OCIO/" target="_blank" rel="noopener"
style="display:inline-block;background:#2fd06b;color:#04220f;font-weight:800;padding:14px 26px;border-radius:12px;text-decoration:none;font-size:1.05rem">▶ &nbsp;Abrir la app en el navegador</a></p>
<p style="margin-top:18px;font-size:.85rem;line-height:1.6">O copia esta dirección en Safari/Chrome:<br>
<b style="color:#b9c6da">tdkvalex.github.io/OCIO</b></p>
</div>
</div>
<div id="toast" role="status"></div>
<div id="modal-fondo"></div>
<script>
window.addEventListener('error', function (e) {
  try {
    var d = document.getElementById('err-js') || document.createElement('div');
    d.id = 'err-js';
    d.style.cssText = 'position:fixed;left:10px;right:10px;bottom:10px;z-index:9999;background:#5c1a1a;color:#ffd7d7;padding:12px 14px;border-radius:10px;font:14px/1.4 sans-serif';
    d.textContent = 'Error: ' + (e.message || e.type) + (e.filename ? ' — ' + String(e.filename).split('/').pop() + ':' + e.lineno : '');
    document.body.appendChild(d);
  } catch (x) { }
});
</script>
<script>
MID
  cat js/data.js js/escudos.js js/escudos-extra.js js/qr.js js/logic.js js/app.js
  cat <<'TAIL'
</script>
</body>
</html>
TAIL
} > dist/torneos-futbol.html
echo "Generado dist/torneos-futbol.html ($(du -h dist/torneos-futbol.html | cut -f1))"

#!/usr/bin/env bash
# Genera dist/capacitaciones.html: la aplicación completa en UN solo archivo,
# ideal para copiar a otro equipo o compartir.
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
<meta name="theme-color" content="#0b1220">
<meta name="description" content="Plataforma de capacitaciones personalizable: programas, cursos, evaluaciones, seguimiento del personal, certificados y asistente de IA.">
<title>Capacitaciones 🎓</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🎓</text></svg>">
<style>
HEAD
  cat css/app.css
  cat <<'MID'
</style>
</head>
<body>
<div id="app">
<div style="max-width:480px;margin:14vh auto 0;padding:24px;text-align:center;font-family:sans-serif;color:#93a4bf">
<div style="font-size:3rem">🎓</div>
<h2 style="margin:10px 0;color:#b9c6da">Cargando la aplicación…</h2>
<p style="line-height:1.6">Si este mensaje no desaparece, este visor no puede ejecutar la aplicación
(las vistas previas de archivos no ejecutan JavaScript).</p>
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
  cat js/logica.js js/almacen.js js/ia.js js/certificados.js js/app.js
  cat <<'TAIL'
</script>
</body>
</html>
TAIL
} > dist/capacitaciones.html
echo "Generado dist/capacitaciones.html ($(du -h dist/capacitaciones.html | cut -f1))"

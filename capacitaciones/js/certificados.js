// Generación de certificados: dibuja un SVG personalizable con los datos de la
// organización y permite descargarlo como SVG o PNG (vía canvas).
(function (global) {
  'use strict';

  var ANCHO = 1123;
  var ALTO = 794;

  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function fechaLarga(iso) {
    if (!iso) return '';
    var meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio',
      'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    var p = String(iso).slice(0, 10).split('-');
    return Number(p[2]) + ' de ' + meses[Number(p[1]) - 1] + ' de ' + p[0];
  }

  // cert: {folio, codigoVerificacion, nombrePersona, tituloCurso, horas, fecha, venceEn}
  // config: config general de la aplicación (nombreOrg, logo, colores, cert{...}).
  function generarSVG(cert, config) {
    var primario = (config && config.colorPrimario) || '#2f6bd0';
    var acento = (config && config.colorAcento) || '#d99a2b';
    var c = (config && config.cert) || {};
    var nombreOrg = (config && config.nombreOrg) || 'Organización';

    var nombre = cert.nombrePersona || '';
    var tamNombre = nombre.length > 34 ? 34 : nombre.length > 24 ? 42 : 52;
    var titulo = cert.tituloCurso || '';
    var tamTitulo = titulo.length > 60 ? 22 : titulo.length > 40 ? 26 : 30;

    var logo = '';
    var yEncabezado = 150;
    if (config && config.logo) {
      logo = '<image href="' + esc(config.logo) + '" x="' + (ANCHO / 2 - 45) +
        '" y="70" width="90" height="90" preserveAspectRatio="xMidYMid meet"/>';
      yEncabezado = 195;
    }

    var lineaHoras = cert.horas
      ? 'con una duración de ' + cert.horas + ' hora' + (Number(cert.horas) === 1 ? '' : 's') + ' cronológicas'
      : '';
    var lineaVigencia = cert.venceEn
      ? 'Válido hasta el ' + fechaLarga(cert.venceEn)
      : '';

    var firma = '';
    if (c.firmante) {
      firma =
        '<line x1="' + (ANCHO / 2 - 140) + '" y1="640" x2="' + (ANCHO / 2 + 140) + '" y2="640" stroke="#3a4353" stroke-width="1.5"/>' +
        '<text x="' + ANCHO / 2 + '" y="668" text-anchor="middle" font-size="20" fill="#1c2431" font-weight="600" font-family="Georgia, serif">' + esc(c.firmante) + '</text>' +
        (c.cargoFirmante ? '<text x="' + ANCHO / 2 + '" y="692" text-anchor="middle" font-size="15" fill="#5a6475" font-family="Georgia, serif">' + esc(c.cargoFirmante) + '</text>' : '');
    }

    return '<svg xmlns="http://www.w3.org/2000/svg" width="' + ANCHO + '" height="' + ALTO +
      '" viewBox="0 0 ' + ANCHO + ' ' + ALTO + '" font-family="Georgia, \'Times New Roman\', serif">' +
      '<rect width="' + ANCHO + '" height="' + ALTO + '" fill="#fdfcf8"/>' +
      '<rect x="18" y="18" width="' + (ANCHO - 36) + '" height="' + (ALTO - 36) + '" fill="none" stroke="' + esc(primario) + '" stroke-width="6"/>' +
      '<rect x="32" y="32" width="' + (ANCHO - 64) + '" height="' + (ALTO - 64) + '" fill="none" stroke="' + esc(acento) + '" stroke-width="1.5"/>' +
      // esquinas decorativas
      '<path d="M 32 92 L 32 32 L 92 32" fill="none" stroke="' + esc(primario) + '" stroke-width="5"/>' +
      '<path d="M ' + (ANCHO - 92) + ' 32 L ' + (ANCHO - 32) + ' 32 L ' + (ANCHO - 32) + ' 92" fill="none" stroke="' + esc(primario) + '" stroke-width="5"/>' +
      '<path d="M 32 ' + (ALTO - 92) + ' L 32 ' + (ALTO - 32) + ' L 92 ' + (ALTO - 32) + '" fill="none" stroke="' + esc(primario) + '" stroke-width="5"/>' +
      '<path d="M ' + (ANCHO - 92) + ' ' + (ALTO - 32) + ' L ' + (ANCHO - 32) + ' ' + (ALTO - 32) + ' L ' + (ANCHO - 32) + ' ' + (ALTO - 92) + '" fill="none" stroke="' + esc(primario) + '" stroke-width="5"/>' +
      logo +
      '<text x="' + ANCHO / 2 + '" y="' + yEncabezado + '" text-anchor="middle" font-size="24" fill="#3a4353" letter-spacing="2">' + esc(nombreOrg) + '</text>' +
      '<text x="' + ANCHO / 2 + '" y="' + (yEncabezado + 78) + '" text-anchor="middle" font-size="54" font-weight="700" fill="' + esc(primario) + '" letter-spacing="10">CERTIFICADO</text>' +
      '<text x="' + ANCHO / 2 + '" y="' + (yEncabezado + 118) + '" text-anchor="middle" font-size="18" fill="#5a6475" font-style="italic">Se otorga el presente certificado a</text>' +
      '<text x="' + ANCHO / 2 + '" y="' + (yEncabezado + 185) + '" text-anchor="middle" font-size="' + tamNombre + '" font-weight="700" fill="#1c2431">' + esc(nombre) + '</text>' +
      '<line x1="' + (ANCHO / 2 - 240) + '" y1="' + (yEncabezado + 210) + '" x2="' + (ANCHO / 2 + 240) + '" y2="' + (yEncabezado + 210) + '" stroke="' + esc(acento) + '" stroke-width="2"/>' +
      '<text x="' + ANCHO / 2 + '" y="' + (yEncabezado + 252) + '" text-anchor="middle" font-size="18" fill="#5a6475" font-style="italic">por haber completado satisfactoriamente la capacitación</text>' +
      '<text x="' + ANCHO / 2 + '" y="' + (yEncabezado + 300) + '" text-anchor="middle" font-size="' + tamTitulo + '" font-weight="700" fill="' + esc(primario) + '">' + esc(titulo) + '</text>' +
      (lineaHoras ? '<text x="' + ANCHO / 2 + '" y="' + (yEncabezado + 334) + '" text-anchor="middle" font-size="16" fill="#5a6475">' + esc(lineaHoras) + '</text>' : '') +
      '<text x="' + ANCHO / 2 + '" y="' + (yEncabezado + 372) + '" text-anchor="middle" font-size="16" fill="#3a4353">Fecha de emisión: ' + esc(fechaLarga(cert.fecha)) + '</text>' +
      (lineaVigencia ? '<text x="' + ANCHO / 2 + '" y="' + (yEncabezado + 396) + '" text-anchor="middle" font-size="15" fill="#8a6d1f">' + esc(lineaVigencia) + '</text>' : '') +
      firma +
      (c.textoLegal ? '<text x="' + ANCHO / 2 + '" y="' + (ALTO - 74) + '" text-anchor="middle" font-size="12" fill="#8a93a3">' + esc(c.textoLegal) + '</text>' : '') +
      '<text x="60" y="' + (ALTO - 48) + '" font-size="13" fill="#8a93a3" font-family="monospace">Folio: ' + esc(cert.folio) + '</text>' +
      '<text x="' + (ANCHO - 60) + '" y="' + (ALTO - 48) + '" text-anchor="end" font-size="13" fill="#8a93a3" font-family="monospace">Verificación: ' + esc(cert.codigoVerificacion) + '</text>' +
      '</svg>';
  }

  function nombreArchivo(cert, extension) {
    var base = ('certificado-' + (cert.folio || 'sin-folio') + '-' + (cert.nombrePersona || ''))
      .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    return base + '.' + extension;
  }

  function descargarBlob(blob, nombre) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  function descargarSVG(cert, config) {
    var svg = generarSVG(cert, config);
    descargarBlob(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }), nombreArchivo(cert, 'svg'));
  }

  function descargarPNG(cert, config) {
    return new Promise(function (resolver, rechazar) {
      var svg = generarSVG(cert, config);
      var url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
      var img = new Image();
      img.onload = function () {
        try {
          var escala = 2; // nitidez para impresión
          var canvas = document.createElement('canvas');
          canvas.width = ANCHO * escala;
          canvas.height = ALTO * escala;
          var ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          canvas.toBlob(function (blob) {
            if (!blob) { rechazar(new Error('No se pudo generar el PNG.')); return; }
            descargarBlob(blob, nombreArchivo(cert, 'png'));
            resolver();
          }, 'image/png');
        } catch (e) { rechazar(e); }
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        rechazar(new Error('No se pudo dibujar el certificado.'));
      };
      img.src = url;
    });
  }

  var Certificados = {
    generarSVG: generarSVG,
    descargarSVG: descargarSVG,
    descargarPNG: descargarPNG
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Certificados;
  else global.Certificados = Certificados;
})(typeof window !== 'undefined' ? window : globalThis);

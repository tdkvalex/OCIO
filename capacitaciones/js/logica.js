// Lógica pura de la aplicación de capacitaciones: sin DOM, sin almacenamiento.
// Se usa en el navegador (window.Logica) y en las pruebas de Node (require).
(function (global) {
  'use strict';

  /* ---------- utilidades generales ---------- */

  function crearId(prefijo) {
    return (prefijo || 'id') + '_' + Date.now().toString(36) +
      Math.random().toString(36).slice(2, 8);
  }

  function pad2(n) { return String(n).padStart(2, '0'); }

  function hoyISO(fecha) {
    var f = fecha instanceof Date ? fecha : new Date();
    return f.getFullYear() + '-' + pad2(f.getMonth() + 1) + '-' + pad2(f.getDate());
  }

  function fechaCorta(iso) {
    if (!iso) return '—';
    var p = String(iso).slice(0, 10).split('-');
    if (p.length !== 3) return String(iso);
    return p[2] + '/' + p[1] + '/' + p[0];
  }

  // Suma meses calendario a una fecha ISO (aaaa-mm-dd). Si el día no existe en
  // el mes destino (p. ej. 31 de enero + 1 mes), usa el último día del mes.
  function sumarMeses(iso, meses) {
    var p = String(iso).slice(0, 10).split('-').map(Number);
    var total = (p[1] - 1) + Number(meses);
    var anio = p[0] + Math.floor(total / 12);
    var mes = ((total % 12) + 12) % 12; // 0-11
    if (total < 0 && total % 12 !== 0) anio = p[0] + Math.floor(total / 12);
    var ultimo = new Date(anio, mes + 1, 0).getDate();
    return anio + '-' + pad2(mes + 1) + '-' + pad2(Math.min(p[2], ultimo));
  }

  // Días de diferencia entre dos fechas ISO (hasta - desde). Positivo si
  // `hasta` es futuro respecto de `desde`.
  function diasEntre(desdeIso, hastaIso) {
    var a = new Date(String(desdeIso).slice(0, 10) + 'T00:00:00');
    var b = new Date(String(hastaIso).slice(0, 10) + 'T00:00:00');
    return Math.round((b - a) / 86400000);
  }

  function calcularVencimiento(fechaIso, vigenciaMeses) {
    var v = Number(vigenciaMeses);
    if (!fechaIso || !v || v <= 0) return null;
    return sumarMeses(fechaIso, v);
  }

  // Normaliza texto para búsquedas: minúsculas y sin acentos.
  function normalizar(texto) {
    return String(texto || '').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  // Fisher-Yates. Devuelve una copia; `rand` permite pruebas deterministas.
  function barajar(arr, rand) {
    var r = rand || Math.random;
    var copia = arr.slice();
    for (var i = copia.length - 1; i > 0; i--) {
      var j = Math.floor(r() * (i + 1));
      var t = copia[i]; copia[i] = copia[j]; copia[j] = t;
    }
    return copia;
  }

  /* ---------- evaluaciones ---------- */

  var TIPOS_PREGUNTA = {
    unica: 'Alternativa única',
    multiple: 'Selección múltiple',
    vf: 'Verdadero / Falso'
  };

  function validarEvaluacion(evaluacion) {
    var errores = [];
    var preguntas = (evaluacion && evaluacion.preguntas) || [];
    if (!preguntas.length) {
      errores.push('La evaluación no tiene preguntas.');
      return errores;
    }
    preguntas.forEach(function (p, i) {
      var n = 'Pregunta ' + (i + 1);
      if (!String(p.texto || '').trim()) errores.push(n + ': falta el enunciado.');
      var ops = p.opciones || [];
      if (p.tipo === 'vf') {
        if (ops.length !== 2) errores.push(n + ': verdadero/falso debe tener exactamente 2 opciones.');
      } else if (ops.length < 2) {
        errores.push(n + ': necesita al menos 2 opciones.');
      }
      if (ops.some(function (o) { return !String(o || '').trim(); })) {
        errores.push(n + ': hay opciones vacías.');
      }
      var correctas = p.correctas || [];
      if (!correctas.length) errores.push(n + ': no tiene respuesta correcta marcada.');
      if ((p.tipo === 'unica' || p.tipo === 'vf') && correctas.length > 1) {
        errores.push(n + ': solo puede tener una respuesta correcta.');
      }
      if (correctas.some(function (c) { return c < 0 || c >= ops.length; })) {
        errores.push(n + ': hay respuestas correctas fuera de rango.');
      }
    });
    var nota = Number(evaluacion.notaAprobacion);
    if (!(nota >= 1 && nota <= 100)) errores.push('La nota de aprobación debe estar entre 1 y 100.');
    return errores;
  }

  // respuestas: { [preguntaId]: [índices marcados] }.
  // Una pregunta es correcta solo si el conjunto marcado coincide exactamente.
  function corregirEvaluacion(evaluacion, respuestas) {
    var preguntas = (evaluacion && evaluacion.preguntas) || [];
    var detalle = [];
    var correctas = 0;
    preguntas.forEach(function (p) {
      var marcadas = (respuestas && respuestas[p.id]) ? respuestas[p.id].slice().sort(function (a, b) { return a - b; }) : [];
      var esperadas = (p.correctas || []).slice().sort(function (a, b) { return a - b; });
      var ok = marcadas.length === esperadas.length &&
        marcadas.every(function (v, i) { return v === esperadas[i]; });
      if (ok) correctas++;
      detalle.push({ preguntaId: p.id, esCorrecta: ok, esperadas: esperadas, marcadas: marcadas });
    });
    var total = preguntas.length;
    var puntaje = total ? Math.round((correctas / total) * 1000) / 10 : 0;
    var notaMinima = Number(evaluacion && evaluacion.notaAprobacion) || 0;
    return {
      total: total,
      correctas: correctas,
      puntaje: puntaje,
      aprobado: total > 0 && puntaje >= notaMinima,
      detalle: detalle
    };
  }

  /* ---------- cursos e inscripciones ---------- */

  function requiereEvaluacion(curso) {
    var ev = curso && curso.evaluacion;
    return !!(ev && ev.activa && ev.preguntas && ev.preguntas.length);
  }

  function evaluacionAprobada(insc) {
    return ((insc && insc.intentos) || []).some(function (i) { return i.aprobado; });
  }

  function mejorPuntaje(insc) {
    var intentos = (insc && insc.intentos) || [];
    if (!intentos.length) return null;
    return Math.max.apply(null, intentos.map(function (i) { return i.puntaje; }));
  }

  function intentosUsados(insc) {
    return ((insc && insc.intentos) || []).length;
  }

  // null = intentos ilimitados.
  function intentosRestantes(curso, insc) {
    var max = Number(curso && curso.evaluacion && curso.evaluacion.intentosMax) || 0;
    if (max <= 0) return null;
    return Math.max(0, max - intentosUsados(insc));
  }

  function avanceCurso(curso, insc) {
    var modulos = (curso && curso.modulos) || [];
    var idsModulos = {};
    modulos.forEach(function (m) { idsModulos[m.id] = true; });
    var hechos = ((insc && insc.modulosCompletados) || [])
      .filter(function (id) { return idsModulos[id]; }).length;
    var conEval = requiereEvaluacion(curso);
    var aprobada = conEval && evaluacionAprobada(insc);
    var pasosTotales = modulos.length + (conEval ? 1 : 0);
    var pasosHechos = hechos + (aprobada ? 1 : 0);
    return {
      modulosTotal: modulos.length,
      modulosHechos: hechos,
      requiereEval: conEval,
      evalAprobada: aprobada,
      pasosTotales: pasosTotales,
      pasosHechos: pasosHechos,
      pct: pasosTotales ? Math.round((pasosHechos / pasosTotales) * 100) : 0
    };
  }

  function cursoCompletado(curso, insc) {
    var a = avanceCurso(curso, insc);
    return a.pasosTotales > 0 && a.pasosHechos >= a.pasosTotales;
  }

  var ETIQUETAS_ESTADO = {
    pendiente: 'Pendiente',
    en_curso: 'En curso',
    reprobado: 'Reprobado',
    completado: 'Completado',
    vencido: 'Vencido'
  };

  function estadoInscripcion(curso, insc, hoy) {
    var dia = hoy || hoyISO();
    if (insc && insc.completadoEn) {
      if (insc.venceEn && insc.venceEn < dia) return 'vencido';
      return 'completado';
    }
    if (requiereEvaluacion(curso) && !evaluacionAprobada(insc)) {
      var restantes = intentosRestantes(curso, insc);
      if (restantes === 0) return 'reprobado';
    }
    if (intentosUsados(insc) > 0 || ((insc && insc.modulosCompletados) || []).length > 0) {
      return 'en_curso';
    }
    return 'pendiente';
  }

  /* ---------- reportes y seguimiento ---------- */

  function indicePor(lista, clave) {
    var idx = {};
    (lista || []).forEach(function (x) { idx[x[clave || 'id']] = x; });
    return idx;
  }

  // Une inscripciones con personas, cursos, categorías y programas.
  function filasSeguimiento(datos, hoy) {
    var dia = hoy || hoyISO();
    var personas = indicePor(datos.personas);
    var cursos = indicePor(datos.cursos);
    var categorias = indicePor((datos.config && datos.config.categorias) || []);
    var programas = indicePor(datos.programas);
    var filas = [];
    (datos.inscripciones || []).forEach(function (insc) {
      var persona = personas[insc.personaId];
      var curso = cursos[insc.cursoId];
      if (!persona || !curso) return;
      var categoria = categorias[curso.categoriaId];
      var programa = programas[insc.programaId];
      var estado = estadoInscripcion(curso, insc, dia);
      var avance = avanceCurso(curso, insc);
      filas.push({
        inscripcionId: insc.id,
        personaId: persona.id,
        persona: persona.nombre,
        correo: persona.correo || '',
        area: persona.area || '',
        activo: persona.activo !== false,
        cursoId: curso.id,
        curso: curso.titulo,
        categoriaId: curso.categoriaId || '',
        categoria: categoria ? categoria.nombre : '',
        programa: programa ? programa.nombre : '',
        estado: estado,
        estadoTexto: ETIQUETAS_ESTADO[estado] || estado,
        avancePct: avance.pct,
        puntaje: mejorPuntaje(insc),
        completadoEn: insc.completadoEn || null,
        venceEn: insc.venceEn || null,
        diasParaVencer: insc.venceEn ? diasEntre(dia, insc.venceEn) : null
      });
    });
    return filas;
  }

  // Indicadores del panel. Solo considera personas activas.
  function resumenPanel(datos, hoy) {
    var dia = hoy || hoyISO();
    var filas = filasSeguimiento(datos, dia).filter(function (f) { return f.activo; });
    var conteo = { pendiente: 0, en_curso: 0, reprobado: 0, completado: 0, vencido: 0 };
    var porVencer = [];
    filas.forEach(function (f) {
      conteo[f.estado] = (conteo[f.estado] || 0) + 1;
      if (f.estado === 'completado' && f.diasParaVencer !== null &&
        f.diasParaVencer >= 0 && f.diasParaVencer <= 30) {
        porVencer.push(f);
      }
    });
    porVencer.sort(function (a, b) { return a.diasParaVencer - b.diasParaVencer; });
    var total = filas.length;
    return {
      personasActivas: (datos.personas || []).filter(function (p) { return p.activo !== false; }).length,
      cursosPublicados: (datos.cursos || []).filter(function (c) { return c.publicado; }).length,
      cursosTotal: (datos.cursos || []).length,
      programas: (datos.programas || []).length,
      inscripciones: total,
      conteo: conteo,
      cumplimientoPct: total ? Math.round((conteo.completado / total) * 100) : 0,
      porVencer: porVencer,
      vencidas: filas.filter(function (f) { return f.estado === 'vencido'; })
    };
  }

  // CSV con separador ';' (Excel en español) y BOM para que respete acentos.
  function aCSV(columnas, filas) {
    function celda(v) {
      if (v === null || v === undefined) return '';
      var s = String(v);
      if (/[";\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
      return s;
    }
    var lineas = [columnas.map(function (c) { return celda(c.titulo); }).join(';')];
    (filas || []).forEach(function (f) {
      lineas.push(columnas.map(function (c) { return celda(f[c.clave]); }).join(';'));
    });
    return '\ufeff' + lineas.join('\r\n');
  }

  /* ---------- certificados ---------- */

  function generarFolio(prefijo, anio, correlativo) {
    return (prefijo || 'CERT') + '-' + anio + '-' + String(correlativo).padStart(4, '0');
  }

  // Código de verificación legible: sin caracteres ambiguos (0/O, 1/I/L).
  function codigoVerificacion(rand) {
    var r = rand || Math.random;
    var alfabeto = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    var grupos = [];
    for (var g = 0; g < 3; g++) {
      var s = '';
      for (var i = 0; i < 4; i++) s += alfabeto[Math.floor(r() * alfabeto.length)];
      grupos.push(s);
    }
    return grupos.join('-');
  }

  /* ---------- validaciones de curso ---------- */

  function validarCurso(curso) {
    var errores = [];
    if (!String(curso.titulo || '').trim()) errores.push('El curso necesita un título.');
    if (!(curso.modulos || []).length) errores.push('El curso necesita al menos un módulo.');
    (curso.modulos || []).forEach(function (m, i) {
      if (!String(m.titulo || '').trim()) errores.push('Módulo ' + (i + 1) + ': falta el título.');
      if (m.tipo === 'video' && !m.videoUrl && !m.archivoId) {
        errores.push('Módulo ' + (i + 1) + ': falta el video (enlace o archivo).');
      }
      if (m.tipo === 'archivo' && !m.archivoId) {
        errores.push('Módulo ' + (i + 1) + ': falta adjuntar el archivo.');
      }
    });
    if (requiereEvaluacion(curso)) {
      errores = errores.concat(validarEvaluacion(curso.evaluacion));
    }
    return errores;
  }

  /* ---------- reconocimiento de videos externos ---------- */

  // Devuelve {tipo:'youtube'|'vimeo'|'otro', urlInsercion} para un enlace.
  function analizarVideoUrl(url) {
    var u = String(url || '').trim();
    if (!u) return null;
    var m = u.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{6,20})/);
    if (m) return { tipo: 'youtube', urlInsercion: 'https://www.youtube-nocookie.com/embed/' + m[1] };
    m = u.match(/vimeo\.com\/(?:video\/)?(\d{6,12})/);
    if (m) return { tipo: 'vimeo', urlInsercion: 'https://player.vimeo.com/video/' + m[1] };
    if (/^https?:\/\//i.test(u)) return { tipo: 'otro', urlInsercion: u };
    return null;
  }

  var Logica = {
    crearId: crearId,
    hoyISO: hoyISO,
    fechaCorta: fechaCorta,
    sumarMeses: sumarMeses,
    diasEntre: diasEntre,
    calcularVencimiento: calcularVencimiento,
    normalizar: normalizar,
    barajar: barajar,
    TIPOS_PREGUNTA: TIPOS_PREGUNTA,
    validarEvaluacion: validarEvaluacion,
    corregirEvaluacion: corregirEvaluacion,
    requiereEvaluacion: requiereEvaluacion,
    evaluacionAprobada: evaluacionAprobada,
    mejorPuntaje: mejorPuntaje,
    intentosUsados: intentosUsados,
    intentosRestantes: intentosRestantes,
    avanceCurso: avanceCurso,
    cursoCompletado: cursoCompletado,
    ETIQUETAS_ESTADO: ETIQUETAS_ESTADO,
    estadoInscripcion: estadoInscripcion,
    filasSeguimiento: filasSeguimiento,
    resumenPanel: resumenPanel,
    aCSV: aCSV,
    generarFolio: generarFolio,
    codigoVerificacion: codigoVerificacion,
    validarCurso: validarCurso,
    analizarVideoUrl: analizarVideoUrl
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Logica;
  else global.Logica = Logica;
})(typeof window !== 'undefined' ? window : globalThis);

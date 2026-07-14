'use strict';
/* =========================================================================
   APP — interfaz de usuario (móvil primero).
   Requiere: data.js (DATOS) y logic.js (funciones puras).
   ========================================================================= */

/* ---------------- Utilidades ---------------- */
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}
function uid() {
  return 't' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
function equipoDe(id) { return DATOS.porId.get(id) || null; }
function nombreEq(id) { var e = equipoDe(id); return e ? e.nombre : '—'; }

/* ---------------- Almacenamiento ---------------- */
var CLAVE_DB = 'torneos-futbol.v1';
var db = { torneos: [] };
var almacenOK = true;

function cargarDB() {
  try {
    var crudo = localStorage.getItem(CLAVE_DB);
    if (crudo) {
      var datos = JSON.parse(crudo);
      if (datos && Array.isArray(datos.torneos)) db = datos;
    }
    localStorage.setItem(CLAVE_DB, JSON.stringify(db)); // prueba de escritura
  } catch (e) {
    almacenOK = false;
    console.warn('localStorage no disponible; los datos viven solo en esta sesión.', e);
  }
}
function guardar(sinSync) {
  if (!sinSync) {
    db.actualizado = Date.now();
    programarPush();
  }
  if (!almacenOK) return;
  try { localStorage.setItem(CLAVE_DB, JSON.stringify(db)); } catch (e) { /* sin espacio */ }
}
function torneoActual() {
  return db.torneos.find(function (t) { return t.id === st.torneoId; }) || null;
}

/* ---------------- Estado de la interfaz ---------------- */
var st = {
  vista: 'inicio',        // 'inicio' | 'wizard' | 'torneo'
  torneoId: null,
  tab: 'posiciones',
  fases: {},              // por torneo: selección de fase en "Partidos"
  wizard: null,
  modal: null,            // {titulo, msg, ok, peligro, resolver}
  pitazos: {}             // partidos cuyo cronómetro ya sonó (resaltados)
};

/* =========================================================================
   ESCUDOS
   ========================================================================= */
function escudoDe(clave) {
  return (typeof ESCUDOS !== 'undefined' && ESCUDOS[clave]) || null;
}
/* Insignia lista para insertar como HTML: SVG en línea o <img> si es data-URI */
function insigniaHTML(clave) {
  var v = escudoDe(clave);
  if (!v) return null;
  if (v.charAt(0) === '<') return v;
  return '<img src="' + v + '" alt="">';
}
function crestHTML(id, grande) {
  var eq = typeof id === 'string' ? equipoDe(id) : id;
  if (!eq) return '<span class="crest flag' + (grande ? ' lg' : '') + '">⬜</span>';
  var original = escudoDe(eq.id);
  if (original) {
    if (original.charAt(0) === '<') {
      return '<span class="crest svgesc' + (grande ? ' lg' : '') + '">' + original + '</span>';
    }
    return '<img class="crest imgesc' + (grande ? ' lg' : '') + '" src="' + original + '" alt="">';
  }
  if (eq.tipo === 'seleccion') {
    return '<span class="crest flag' + (grande ? ' lg' : '') + '">' + eq.emoji + '</span>';
  }
  var w = grande ? 36 : 26, h = Math.round(w * 1.2);
  return '<span class="crest">' +
    '<svg width="' + w + '" height="' + h + '" viewBox="0 0 40 48" aria-hidden="true">' +
    '<path d="M20 2 L38 8 V26 C38 38 20 46 20 46 C20 46 2 38 2 26 V8 Z" fill="' + eq.c1 + '" stroke="rgba(0,0,0,.45)" stroke-width="1.5"/>' +
    '<path d="M20 2 L38 8 V26 C38 38 20 46 20 46 Z" fill="' + eq.c2 + '"/>' +
    '<text x="20" y="28" text-anchor="middle" font-size="11" font-weight="800" font-family="inherit" fill="#fff" stroke="rgba(0,0,0,.55)" stroke-width="2.6" paint-order="stroke">' + esc(eq.abrev) + '</text>' +
    '</svg></span>';
}

/* =========================================================================
   CRONÓMETRO DE PARTIDO CON PITAZO
   ========================================================================= */
var timers = {};          // idPartido → {finEn, totalMs, pausadoResta}
var timerInterval = null;
var audioCtx = null;

function fmtTiempo(ms) {
  var s = Math.max(0, Math.ceil(ms / 1000));
  var m = Math.floor(s / 60); s = s % 60;
  return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
}
function timerRestante(t) {
  return t.pausadoResta != null ? t.pausadoResta : t.finEn - Date.now();
}
function asegurarAudio() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch (e) { /* sin audio */ }
}
/* Silbato de árbitro sintetizado: dos tonos con trino rápido */
function silbato(inicio, dur) {
  var env = audioCtx.createGain();
  env.gain.setValueAtTime(0.0001, inicio);
  env.gain.exponentialRampToValueAtTime(0.6, inicio + 0.02);
  env.gain.setValueAtTime(0.6, Math.max(inicio + 0.03, inicio + dur - 0.06));
  env.gain.exponentialRampToValueAtTime(0.0001, inicio + dur);
  env.connect(audioCtx.destination);
  var trem = audioCtx.createGain();
  trem.gain.value = 0.55;
  trem.connect(env);
  var lfo = audioCtx.createOscillator();
  lfo.type = 'square'; lfo.frequency.value = 39;
  var lfoG = audioCtx.createGain(); lfoG.gain.value = 0.45;
  lfo.connect(lfoG); lfoG.connect(trem.gain);
  [[2093, 'square', 0.5], [2793, 'triangle', 0.35]].forEach(function (cfg) {
    var o = audioCtx.createOscillator();
    o.type = cfg[1]; o.frequency.value = cfg[0];
    var og = audioCtx.createGain(); og.gain.value = cfg[2];
    o.connect(og); og.connect(trem);
    o.start(inicio); o.stop(inicio + dur);
  });
  lfo.start(inicio); lfo.stop(inicio + dur);
}
/* Pitazo final: dos cortos y uno largo, más vibración */
function pitazo() {
  try {
    asegurarAudio();
    if (audioCtx) {
      var t0 = audioCtx.currentTime + 0.05;
      silbato(t0, 0.35);
      silbato(t0 + 0.5, 0.35);
      silbato(t0 + 1.0, 1.5);
    }
  } catch (e) { /* sin audio */ }
  try { if (navigator.vibrate) navigator.vibrate([300, 150, 300, 150, 900]); } catch (e) { }
}
function arrancarTick() {
  if (timerInterval) return;
  timerInterval = setInterval(function () {
    var ids = Object.keys(timers);
    if (!ids.length) { clearInterval(timerInterval); timerInterval = null; return; }
    ids.forEach(function (id) {
      var t = timers[id];
      if (t.pausadoResta != null) return;
      var resta = t.finEn - Date.now();
      if (resta <= 0) {
        delete timers[id];
        st.pitazos[id] = true;
        pitazo();
        avisar('🏁 ¡Pitazo final! Ingresa el marcador y finaliza el partido.');
        if (st.vista === 'torneo') render(true);
        return;
      }
      var el = document.querySelector('[data-timer-display="' + id + '"]');
      if (el) {
        el.textContent = fmtTiempo(resta);
        el.classList.toggle('agotandose', resta <= 10500);
      }
    });
  }, 250);
}
function filaTimer(m) {
  var t = timers[m.id];
  if (!t) {
    var min = db.timerMin || 10;
    return '<div class="timer-row">⏱️ Cronómetro:' +
      '<input class="timer-min" type="number" min="1" max="120" inputmode="numeric" value="' + min + '" data-timer-min="' + m.id + '"><span>min</span>' +
      '<button class="btn btn-sm" data-a="timer-ini" data-m="' + m.id + '">▶ Iniciar</button></div>';
  }
  var resta = timerRestante(t);
  var pausado = t.pausadoResta != null;
  return '<div class="timer-row">' +
    '<span class="timer-display ' + (pausado ? 'pausado' : (resta <= 10500 ? 'agotandose' : '')) + '" data-timer-display="' + m.id + '">' + fmtTiempo(resta) + '</span>' +
    '<button class="btn btn-sm" data-a="timer-pausa" data-m="' + m.id + '">' + (pausado ? '▶ Seguir' : '⏸ Pausa') + '</button>' +
    '<button class="btn btn-sm btn-ghost" data-a="timer-stop" data-m="' + m.id + '">✕ Quitar</button></div>';
}

/* =========================================================================
   TOAST Y MODAL
   ========================================================================= */
var toastTimer = null;
function avisar(msg) {
  var el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('ver');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.classList.remove('ver'); }, 2600);
}
function confirmar(titulo, msg, textoOk, peligro) {
  return new Promise(function (resolver) {
    st.modal = { titulo: titulo, msg: msg, ok: textoOk || 'Confirmar', peligro: !!peligro, resolver: resolver };
    pintarModal();
  });
}
function pintarModal() {
  var fondo = document.getElementById('modal-fondo');
  if (!st.modal) { fondo.classList.remove('ver'); fondo.innerHTML = ''; return; }
  fondo.innerHTML =
    '<div class="modal">' +
    '<h3>' + esc(st.modal.titulo) + '</h3>' +
    '<p>' + esc(st.modal.msg) + '</p>' +
    '<div class="btns">' +
    '<button class="btn" data-a="modal-no">Cancelar</button>' +
    '<button class="btn ' + (st.modal.peligro ? 'btn-danger' : 'btn-primary') + '" data-a="modal-ok">' + esc(st.modal.ok) + '</button>' +
    '</div></div>';
  fondo.classList.add('ver');
}
function cerrarModal(respuesta) {
  if (!st.modal) return;
  var r = st.modal.resolver;
  st.modal = null;
  pintarModal();
  r(respuesta);
}

/* =========================================================================
   VISTA: INICIO
   ========================================================================= */
function vInicio() {
  var html = '<div class="cabecera"><div class="topbar"><h1><span>⚽</span><span class="tt">Torneos de Fútbol</span></h1><div class="spacer"></div>' +
    '<button class="btn btn-primary btn-sm" data-a="nuevo-torneo">+ Nuevo</button></div></div>';

  if (!almacenOK) {
    html += '<div class="aviso">⚠️ <div>El almacenamiento local no está disponible: los datos se perderán al cerrar. Usa «Exportar» para guardar una copia.</div></div>';
  }

  html += '<div class="hero"><div class="ball">⚽</div><h2>Arma tu torneo</h2>' +
    '<p>Ligas, liguillas, grupos y eliminatorias con selecciones o clubes.</p></div>';

  html += '<div class="section-title">Torneos existentes (plantillas)</div><div class="plantillas">';
  DATOS.PLANTILLAS.forEach(function (p) {
    var insignia = insigniaHTML('t-' + p.id);
    var icono = insignia
      ? '<span class="ic insignia">' + insignia + '</span>'
      : '<span class="ic">' + p.icono + '</span>';
    html += '<button class="plantilla" data-a="usar-plantilla" data-id="' + p.id + '">' +
      icono + '<span class="nm">' + esc(p.nombre) + '</span>' +
      '<span class="ds">' + esc(p.desc) + '</span></button>';
  });
  html += '</div>';

  html += '<div class="section-title">Mis torneos</div>';
  if (!db.torneos.length) {
    html += '<div class="vacio">Aún no tienes torneos.<br>Crea uno nuevo o elige una plantilla. 🏆</div>';
  } else {
    db.torneos.slice().reverse().forEach(function (t) {
      var jugados = t.partidos.filter(function (p) { return p.fin; }).length;
      var total = t.partidos.length;
      var pct = total ? Math.round(jugados / total * 100) : 0;
      var estado = t.campeon
        ? '<span class="badge badge-fin">🏆 Campeón: ' + esc(nombreEq(t.campeon)) + '</span>'
        : '<span class="badge badge-live">En curso · ' + jugados + '/' + total + ' partidos</span>';
      var insigniaT = t.plantilla && insigniaHTML('t-' + t.plantilla);
      html += '<div class="card torneo-card" data-a="abrir-torneo" data-id="' + t.id + '">' +
        '<div class="ic' + (insigniaT ? ' insignia' : '') + '">' + (insigniaT || t.icono || '🏆') + '</div>' +
        '<div class="info"><div class="nm">' + esc(t.nombre) + '</div>' +
        '<div class="ds">' + descTorneo(t) + '</div>' +
        '<div class="estado">' + estado + '</div>' +
        '<div class="progress"><i style="width:' + pct + '%"></i></div></div>' +
        '<div>›</div></div>';
    });
  }

  html += cartaSync();

  html += '<div class="pie"><div class="datos">' +
    '<button class="btn btn-sm" data-a="exportar">⬇️ Exportar datos</button>' +
    '<button class="btn btn-sm" data-a="importar">⬆️ Importar</button>' +
    '<input type="file" id="importar-archivo" accept=".json" style="display:none">' +
    '</div>' + (sincVinculada() ? 'Datos sincronizados con tu cuenta de GitHub.' : 'Los datos se guardan en este dispositivo.') + '</div>';
  return html;
}

function descTorneo(t) {
  var tipos = { seleccion: 'Selecciones', club: 'Clubes' };
  var fmt = {
    'liga': 'Liga', 'liga-elim': 'Liga + Liguilla',
    'grupos-elim': 'Grupos + Eliminatoria', 'elim': 'Eliminatoria directa'
  };
  return esc(tipos[t.tipoEquipos] || '') + ' · ' + esc(fmt[t.formato] || '') + ' · ' + t.equipos.length + ' equipos';
}

/* =========================================================================
   VISTA: ASISTENTE DE CREACIÓN / EDICIÓN
   ========================================================================= */
var ICONOS = ['🏆', '⚽', '🥇', '🏅', '🎖️', '👑', '⭐', '🔥', '🌍', '🌎', '🦁', '🦅'];

function wizardNuevo(base, editandoId) {
  st.wizard = {
    editandoId: editandoId || null,
    plantillaId: base && base.plantillaId || null,
    paso: 1,
    datos: {
      nombre: base && base.nombre || '',
      icono: base && base.icono || '🏆',
      tipoEquipos: base && base.tipoEquipos || 'seleccion',
      formato: base && base.formato || 'grupos-elim',
      vueltas: base && base.vueltas || 1,
      numGrupos: base && base.numGrupos || 4,
      clasifican: base && base.clasifican || 2,
      idaVuelta: base ? !!base.idaVuelta : false,
      tercerPuesto: base ? !!base.tercerPuesto : true,
      finalUnica: base && base.finalUnica === false ? false : true
    },
    equipos: base && base.equipoIds ? base.equipoIds.slice() : [],
    busqueda: '',
    abiertos: {},
    grupos: null,
    ordenElim: null,
    marcado: null
  };
  st.vista = 'wizard';
}

function configDesdeWizard() {
  var d = st.wizard.datos;
  return {
    vueltas: +d.vueltas || 1,
    numGrupos: d.formato === 'grupos-elim' ? (+d.numGrupos || 2) : 1,
    clasifican: +d.clasifican || 2,
    idaVuelta: !!d.idaVuelta,
    tercerPuesto: !!d.tercerPuesto,
    finalUnica: d.finalUnica === false ? false : true
  };
}
function erroresWizard() {
  var w = st.wizard;
  return validarConfiguracion(w.datos.formato, configDesdeWizard(), w.equipos.length);
}
function wizardNecesitaSorteo() {
  var f = st.wizard.datos.formato;
  return f === 'grupos-elim' || f === 'elim';
}

function vWizard() {
  var w = st.wizard, d = w.datos;
  var totalPasos = wizardNecesitaSorteo() ? 3 : 2;
  var html = '<div class="cabecera"><div class="topbar"><button class="btn-back" data-a="w-cancelar">‹</button>' +
    '<h1><span class="tt">' + (w.editandoId ? 'Editar torneo' : 'Nuevo torneo') + '</span></h1></div></div>';
  html += '<div class="pasos">';
  for (var i = 1; i <= totalPasos; i++) html += '<i class="' + (i <= w.paso ? 'on' : '') + '"></i>';
  html += '</div>';

  if (w.paso === 1) html += wizardPaso1(d);
  else if (w.paso === 2) html += wizardPaso2(w);
  else html += wizardPaso3(w);

  return html;
}

function wizardPaso1(d) {
  var html = '<div class="card">' +
    '<label class="fld"><span>Nombre del torneo</span>' +
    '<input class="inp" id="w-nombre" maxlength="60" placeholder="Ej. Copa del Barrio 2026" value="' + esc(d.nombre) + '"></label>' +
    '<div class="fld-tit">Ícono</div><div class="emoji-pick">' +
    ICONOS.map(function (e) {
      return '<button class="' + (d.icono === e ? 'on' : '') + '" data-a="w-icono" data-v="' + e + '">' + e + '</button>';
    }).join('') + '</div></div>';

  html += '<div class="card"><div class="fld-tit">Tipo de equipos</div><div class="opciones" style="grid-template-columns:1fr 1fr">' +
    opcion('w-tipo', 'seleccion', d.tipoEquipos === 'seleccion', '🌍 Selecciones', 'Países por continente') +
    opcion('w-tipo', 'club', d.tipoEquipos === 'club', '🛡️ Clubes', 'Equipos por país') +
    '</div></div>';

  html += '<div class="card"><div class="fld-tit">Formato</div><div class="opciones">' +
    opcion('w-formato', 'liga', d.formato === 'liga', 'Liga', 'Todos contra todos') +
    opcion('w-formato', 'liga-elim', d.formato === 'liga-elim', 'Liga + Liguilla', 'Liga y luego playoffs') +
    opcion('w-formato', 'grupos-elim', d.formato === 'grupos-elim', 'Grupos + Elim.', 'Estilo mundial') +
    opcion('w-formato', 'elim', d.formato === 'elim', 'Eliminatoria', 'Directa (llaves)') +
    '</div>';

  // Configuración según formato
  if (d.formato === 'liga' || d.formato === 'liga-elim') {
    html += selectFld('vueltas', 'Vueltas de la liga', d.vueltas, [[1, 'Una vuelta'], [2, 'Ida y vuelta']]);
  }
  if (d.formato === 'grupos-elim') {
    html += selectFld('numGrupos', 'Número de grupos', d.numGrupos, [[2, '2 grupos'], [4, '4 grupos'], [8, '8 grupos']]);
    html += selectFld('clasifican', 'Clasifican por grupo', d.clasifican, [[1, 'El 1º de cada grupo'], [2, 'Los 2 primeros']]);
    html += selectFld('vueltas', 'Vueltas en el grupo', d.vueltas, [[1, 'Una vuelta'], [2, 'Ida y vuelta']]);
  }
  if (d.formato === 'liga-elim') {
    html += selectFld('clasifican', 'Clasifican a la liguilla', d.clasifican, [[2, '2 equipos'], [4, '4 equipos'], [8, '8 equipos'], [16, '16 equipos']]);
  }
  if (d.formato !== 'liga') {
    html += switchRow('idaVuelta', 'Eliminatoria a ida y vuelta', 'Dos partidos por llave', d.idaVuelta);
    if (d.idaVuelta) html += switchRow('finalUnica', 'Final a partido único', 'Desactívalo para final de ida y vuelta', d.finalUnica);
    html += switchRow('tercerPuesto', 'Partido por el 3er puesto', 'Entre perdedores de semifinales', d.tercerPuesto);
  }
  html += '</div>';

  html += '<div class="wizard-nav"><button class="btn" data-a="w-cancelar">Cancelar</button>' +
    '<button class="btn btn-primary" data-a="w-paso-sig">Siguiente ›</button></div>';
  return html;
}

function opcion(accion, valor, activo, titulo, desc) {
  return '<button class="opcion ' + (activo ? 'on' : '') + '" data-a="' + accion + '" data-v="' + valor + '">' +
    '<span class="t">' + titulo + '</span><span class="d">' + desc + '</span></button>';
}
function selectFld(clave, etiqueta, valor, opciones) {
  return '<label class="fld" style="margin-top:12px"><span>' + etiqueta + '</span>' +
    '<select class="inp" data-k="' + clave + '">' +
    opciones.map(function (o) {
      return '<option value="' + o[0] + '"' + (String(valor) === String(o[0]) ? ' selected' : '') + '>' + o[1] + '</option>';
    }).join('') + '</select></label>';
}
function switchRow(clave, etiqueta, sub, activo) {
  return '<div class="switch-row"><div class="lbl">' + etiqueta + '<span class="sub">' + sub + '</span></div>' +
    '<button class="sw ' + (activo ? 'on' : '') + '" data-a="w-sw" data-k="' + clave + '" aria-label="' + etiqueta + '"></button></div>';
}

/* ---------- Paso 2: elegir equipos ---------- */
function wizardPaso2(w) {
  var errores = erroresWizard();
  var html = '<div class="buscador"><input class="inp" id="buscar-eq" placeholder="Buscar ' +
    (w.datos.tipoEquipos === 'seleccion' ? 'país o continente' : 'club o país') + '…" value="' + esc(w.busqueda) + '"></div>';

  html += '<div class="sel-resumen" id="sel-resumen">' + chipsSeleccion(w) + '</div>';
  html += '<div id="lista-eq">' + listaEquiposHTML(w) + '</div>';

  var n = w.equipos.length;
  html += '<div class="contador-eq ' + (errores.length ? '' : 'ok') + '">' + n + ' equipo' + (n === 1 ? '' : 's') + ' seleccionado' + (n === 1 ? '' : 's') + '</div>';
  if (errores.length) html += '<div class="aviso err" style="margin-top:12px">⚠️ <div>' + errores.map(esc).join('<br>') + '</div></div>';
  else html += '<div class="aviso ok" style="margin-top:12px">✅ <div>La cantidad de equipos es válida para este formato.</div></div>';

  html += '<div class="wizard-nav"><button class="btn" data-a="w-paso-atras">‹ Atrás</button>' +
    '<button class="btn btn-primary" data-a="w-paso-sig" ' + (errores.length ? 'disabled' : '') + '>' +
    (wizardNecesitaSorteo() ? 'Siguiente ›' : (st.wizard.editandoId ? 'Guardar cambios' : 'Crear torneo')) + '</button></div>';
  return html;
}

function chipsSeleccion(w) {
  if (!w.equipos.length) return '<span style="color:var(--muted);font-size:.8rem">Toca los equipos para agregarlos</span>';
  return w.equipos.map(function (id) {
    var e = equipoDe(id);
    return '<span class="chip-eq">' + crestHTML(e) + esc(e ? e.nombre : id) +
      '<button class="x" data-a="w-quitar-eq" data-id="' + id + '">✕</button></span>';
  }).join('') +
    '<button class="chip-eq" data-a="w-limpiar" style="color:var(--danger)">Quitar todos</button>';
}

function listaEquiposHTML(w) {
  var tipo = w.datos.tipoEquipos;
  var q = DATOS.normalizar(w.busqueda || '');
  var grupos = tipo === 'seleccion' ? DATOS.SELECCIONES : DATOS.CLUBES;
  var html = '';

  if (q) {
    var resultados = DATOS.equipos.filter(function (e) {
      return e.tipo === tipo && (DATOS.normalizar(e.nombre).indexOf(q) !== -1 ||
        DATOS.normalizar(e.region).indexOf(q) !== -1);
    });
    if (!resultados.length) return '<div class="vacio">Sin resultados para «' + esc(w.busqueda) + '»</div>';
    html += '<div class="grupo-acordeon abierto"><button type="button"><span class="n">Resultados (' + resultados.length + ')</span></button>';
    resultados.slice(0, 80).forEach(function (e) { html += filaEquipo(e, w, true); });
    html += '</div>';
    return html;
  }

  grupos.forEach(function (g, gi) {
    var region = g[0];
    var lista = tipo === 'seleccion' ? g[1] : g[2];
    var ids = lista.map(function (item) {
      return (tipo === 'seleccion' ? 's-' : 'c-') + DATOS.slug(item[0]);
    });
    var numSel = ids.filter(function (id) { return w.equipos.indexOf(id) !== -1; }).length;
    var abierto = !!w.abiertos[gi];
    var bandera = tipo === 'club' ? '<span class="crest flag">' + equipoDe(ids[0]).paisEmoji + '</span>' : '';
    html += '<div class="grupo-acordeon ' + (abierto ? 'abierto' : '') + '">' +
      '<button type="button" data-a="w-toggle-grupo" data-g="' + gi + '">' + bandera +
      '<span class="n">' + esc(region) + '</span>' +
      '<span class="cnt">' + (numSel ? numSel + ' de ' : '') + ids.length + '</span><span class="chev">›</span></button>';
    if (abierto) {
      ids.forEach(function (id) { html += filaEquipo(equipoDe(id), w, false); });
    }
    html += '</div>';
  });
  return html;
}

function filaEquipo(e, w, conRegion) {
  if (!e) return '';
  var activo = w.equipos.indexOf(e.id) !== -1;
  return '<button type="button" class="fila-eq ' + (activo ? 'on' : '') + '" data-a="w-eq" data-id="' + e.id + '">' +
    crestHTML(e) +
    '<span class="nm">' + esc(e.nombre) + (conRegion ? '<span class="sub">' + esc(e.region) + '</span>' : '') + '</span>' +
    '<span class="chk">' + (activo ? '✓' : '') + '</span></button>';
}

/* ---------- Paso 3: sorteo ---------- */
function prepararSorteo(forzar) {
  var w = st.wizard, d = w.datos;
  if (d.formato === 'grupos-elim') {
    if (forzar || !w.grupos || w.grupos.length !== +d.numGrupos ||
      w.grupos.reduce(function (n, g) { return n + g.equipos.length; }, 0) !== w.equipos.length) {
      w.grupos = sortearGrupos(w.equipos, +d.numGrupos);
    }
  } else if (d.formato === 'elim') {
    if (forzar || !w.ordenElim || w.ordenElim.length !== w.equipos.length) {
      w.ordenElim = barajar(w.equipos);
    }
  }
  w.marcado = null;
}

function wizardPaso3(w) {
  var d = w.datos;
  var html = '<div class="hint-swap">Toca un equipo y luego otro para intercambiarlos.</div>';
  if (d.formato === 'grupos-elim') {
    html += '<div class="grupos-sorteo">';
    w.grupos.forEach(function (g, gi) {
      html += '<div class="card grupo-sorteo"><h4>GRUPO ' + g.nombre + '</h4>';
      g.equipos.forEach(function (id, i) {
        var marcado = w.marcado && w.marcado.g === gi && w.marcado.i === i;
        html += '<button type="button" class="eq-sorteo ' + (marcado ? 'marcado' : '') + '" data-a="w-swap" data-g="' + gi + '" data-i="' + i + '">' +
          crestHTML(id) + '<span class="nm">' + esc(nombreEq(id)) + '</span></button>';
      });
      html += '</div>';
    });
    html += '</div>';
  } else {
    html += '<div class="grupos-sorteo">';
    for (var p = 0; p < w.ordenElim.length; p += 2) {
      html += '<div class="card grupo-sorteo"><h4>LLAVE ' + (p / 2 + 1) + '</h4>';
      [p, p + 1].forEach(function (idx) {
        var id = w.ordenElim[idx];
        var marcado = w.marcado && w.marcado.g === -1 && w.marcado.i === idx;
        html += '<button type="button" class="eq-sorteo ' + (marcado ? 'marcado' : '') + '" data-a="w-swap" data-g="-1" data-i="' + idx + '">' +
          crestHTML(id) + '<span class="nm">' + esc(nombreEq(id)) + '</span></button>';
      });
      html += '</div>';
    }
    html += '</div>';
  }
  html += '<div style="text-align:center;margin-top:14px"><button class="btn" data-a="w-sortear">🎲 Volver a sortear</button></div>';
  html += '<div class="wizard-nav"><button class="btn" data-a="w-paso-atras">‹ Atrás</button>' +
    '<button class="btn btn-primary" data-a="w-crear">' + (w.editandoId ? 'Guardar cambios' : '🏁 Crear torneo') + '</button></div>';
  return html;
}

/* ---------- Crear / actualizar torneo desde el asistente ---------- */
function materializarTorneo() {
  var w = st.wizard, d = w.datos;
  var cfg = configDesdeWizard();
  var errores = validarConfiguracion(d.formato, cfg, w.equipos.length);
  if (errores.length) { avisar(errores[0]); return; }
  if (!d.nombre.trim()) { avisar('Ponle un nombre al torneo.'); w.paso = 1; render(); return; }

  var existente = w.editandoId ? db.torneos.find(function (t) { return t.id === w.editandoId; }) : null;

  var estructural = !existente ||
    existente.formato !== d.formato ||
    JSON.stringify(existente.config) !== JSON.stringify(cfg) ||
    JSON.stringify(existente.equipos.slice().sort()) !== JSON.stringify(w.equipos.slice().sort()) ||
    (d.formato === 'grupos-elim' && JSON.stringify(existente.grupos) !== JSON.stringify(w.grupos)) ||
    (d.formato === 'elim' && JSON.stringify(existente.ordenElim) !== JSON.stringify(w.ordenElim));

  var seguir = function (regenerar) {
    var t = existente || {
      id: uid(), creado: new Date().toISOString(), partidos: [],
      campeon: null, subcampeon: null, tercero: null
    };
    t.nombre = d.nombre.trim();
    t.icono = d.icono;
    if (!existente) t.plantilla = w.plantillaId || null;
    if (regenerar) {
      t.tipoEquipos = d.tipoEquipos;
      t.formato = d.formato;
      t.config = cfg;
      t.equipos = w.equipos.slice();
      t.ordenElim = d.formato === 'elim' ? w.ordenElim.slice() : null;
      if (d.formato === 'liga' || d.formato === 'liga-elim') {
        t.grupos = [{ nombre: 'General', equipos: w.equipos.slice() }];
      } else if (d.formato === 'grupos-elim') {
        t.grupos = w.grupos.map(function (g) { return { nombre: g.nombre, equipos: g.equipos.slice() }; });
      } else {
        t.grupos = null;
      }
      t.partidos = t.formato === 'elim' ? [] : generarPartidosGrupos(t);
      t.campeon = t.subcampeon = t.tercero = null;
    }
    sincronizarTorneo(t, nombreEq);
    if (!existente) db.torneos.push(t);
    guardar();
    st.wizard = null;
    st.vista = 'torneo';
    st.torneoId = t.id;
    st.tab = t.formato === 'elim' ? 'partidos' : 'posiciones';
    delete st.fases[t.id];
    render();
    avisar(existente ? 'Torneo actualizado ✔️' : '¡Torneo creado! 🎉');
  };

  if (existente && estructural && existente.partidos.some(function (p) { return p.fin; })) {
    confirmar('Regenerar fixture',
      'Cambiaste el formato o los equipos: se generará un nuevo calendario y se perderán los resultados actuales.',
      'Regenerar', true).then(function (ok) { if (ok) seguir(true); });
  } else {
    seguir(estructural);
  }
}

/* =========================================================================
   VISTA: TORNEO
   ========================================================================= */
function vTorneo() {
  var t = torneoActual();
  if (!t) { st.vista = 'inicio'; return vInicio(); }
  var estructura = sincronizarTorneo(t, nombreEq);
  guardar();

  var insigniaT = t.plantilla && insigniaHTML('t-' + t.plantilla);

  var tabs = [];
  if (t.formato !== 'elim') tabs.push(['posiciones', 'Posiciones']);
  tabs.push(['partidos', 'Partidos']);
  if (t.formato !== 'liga') tabs.push(['llaves', 'Llaves']);
  tabs.push(['stats', 'Estadísticas']);
  tabs.push(['ajustes', 'Ajustes']);
  if (!tabs.some(function (x) { return x[0] === st.tab; })) st.tab = tabs[0][0];

  var html = '<div class="cabecera">' +
    '<div class="topbar"><button class="btn-back" data-a="ir-inicio">‹</button>' +
    '<h1>' + (insigniaT ? '<span class="insignia-top">' + insigniaT + '</span>' : '<span>' + (t.icono || '🏆') + '</span>') +
    '<span class="tt">' + esc(t.nombre) + '</span></h1><div class="spacer"></div></div>' +
    '<div class="tabs">' + tabs.map(function (x) {
      return '<button class="tab ' + (st.tab === x[0] ? 'on' : '') + '" data-a="tab" data-t="' + x[0] + '">' + x[1] + '</button>';
    }).join('') + '</div></div>';

  if (t.campeon) {
    html += '<div class="campeon-banner"><div class="cup">🏆</div><div class="t">Campeón</div>' +
      '<div class="nm">' + crestHTML(t.campeon, true) + esc(nombreEq(t.campeon)) + '</div>' +
      '<div class="pod">' +
      (t.subcampeon ? '<span>🥈 ' + esc(nombreEq(t.subcampeon)) + '</span>' : '') +
      (t.tercero ? '<span>🥉 ' + esc(nombreEq(t.tercero)) + '</span>' : '') +
      '</div></div>';
  }

  if (st.tab === 'posiciones') html += tabPosiciones(t);
  else if (st.tab === 'partidos') html += tabPartidos(t, estructura);
  else if (st.tab === 'llaves') html += tabLlaves(t, estructura);
  else if (st.tab === 'stats') html += tabStats(t);
  else html += tabAjustes(t);
  return html;
}

/* ---------- Posiciones ---------- */
function tabPosiciones(t) {
  var html = '';
  var partidosGrupo = t.partidos.filter(function (p) { return p.tipo === 'grupo'; });
  var esLigaPura = t.formato === 'liga';
  var clasifican = t.formato === 'liga' ? 0 : t.config.clasifican;
  t.grupos.forEach(function (g, gi) {
    var tabla = tablaPosiciones(g.equipos,
      partidosGrupo.filter(function (p) { return p.grupoIdx === gi; }), nombreEq);
    html += '<div class="card">' + (t.grupos.length > 1 ? '<h3>Grupo ' + g.nombre + '</h3>' : '') +
      '<div class="tabla-wrap"><table class="posiciones"><thead><tr>' +
      '<th>#</th><th>Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th>Pts</th>' +
      '</tr></thead><tbody>';
    tabla.forEach(function (f, i) {
      var clases = [];
      if (clasifican && i < clasifican) clases.push('clasifica');
      if (esLigaPura && t.campeon === f.id) clases.push('lider-final');
      html += '<tr class="' + clases.join(' ') + '">' +
        '<td class="pos">' + (i + 1) + '</td>' +
        '<td class="eq"><div class="in">' + crestHTML(f.id) + '<span class="nm">' + esc(nombreEq(f.id)) + '</span></div></td>' +
        '<td>' + f.pj + '</td><td>' + f.g + '</td><td>' + f.e + '</td><td>' + f.p + '</td>' +
        '<td>' + f.gf + '</td><td>' + f.gc + '</td><td>' + (f.dg > 0 ? '+' : '') + f.dg + '</td>' +
        '<td class="pts">' + f.pts + '</td></tr>';
    });
    html += '</tbody></table></div>';
    if (clasifican) html += '<div class="leyenda"><i></i>Clasifican ' + clasifican + ' por grupo · Desempate: Pts, DG, GF</div>';
    html += '</div>';
  });
  return html;
}

/* ---------- Partidos ---------- */
function faseActual(t, estructura) {
  var fases = [];
  var jornadas = {};
  t.partidos.forEach(function (p) {
    if (p.tipo === 'grupo') jornadas[p.jornada] = true;
  });
  Object.keys(jornadas).map(Number).sort(function (a, b) { return a - b; }).forEach(function (j) {
    fases.push({ clave: 'j' + j, titulo: 'Fecha ' + j, filtro: function (p) { return p.tipo === 'grupo' && p.jornada === j; } });
  });
  if (estructura) {
    var fasesElim = [];
    estructura.rondas.forEach(function (r, ri) {
      if (r.llaves.some(function (l) { return l.partidos.length; })) {
        fasesElim.push({
          clave: 'r' + ri, titulo: r.nombre,
          filtro: function (p) { return p.tipo === 'elim' && p.llave.indexOf('e-r' + ri + '-') === 0; }
        });
      }
    });
    if (estructura.tercerPuesto && estructura.tercerPuesto.partidos.length) {
      // el 3er puesto se juega antes de la final
      fasesElim.splice(Math.max(0, fasesElim.length - 1), 0,
        { clave: 'tp', titulo: '3er puesto', filtro: function (p) { return p.llave === 'e-tp'; } });
    }
    fases = fases.concat(fasesElim);
  }
  if (!fases.length) return { fases: fases, sel: null };
  var claveSel = st.fases[t.id];
  var sel = fases.find(function (f) { return f.clave === claveSel; });
  if (!sel) {
    sel = fases.find(function (f) {
      return t.partidos.filter(f.filtro).some(function (p) { return !p.fin; });
    }) || fases[fases.length - 1];
    st.fases[t.id] = sel.clave;
  }
  return { fases: fases, sel: sel };
}

function tabPartidos(t, estructura) {
  var fa = faseActual(t, estructura);
  if (!fa.sel) return '<div class="vacio">No hay partidos todavía.</div>';
  var html = '<div class="chips-fase">' + fa.fases.map(function (f) {
    var lista = t.partidos.filter(f.filtro);
    var completa = lista.length && lista.every(function (p) { return p.fin; });
    return '<button class="chip-f ' + (fa.sel.clave === f.clave ? 'on' : '') + '" data-a="fase" data-f="' + f.clave + '">' +
      f.titulo + (completa ? '<span class="ok">✓</span>' : '') + '</button>';
  }).join('') + '</div>';

  var lista = t.partidos.filter(fa.sel.filtro);
  lista.forEach(function (m) { html += cartaPartido(t, m); });

  if (lista.some(function (p) { return !p.fin; })) {
    html += '<div style="text-align:center;margin-top:6px"><button class="btn btn-sm" data-a="simular-fase">🎲 Simular pendientes de esta fase</button></div>';
  }
  return html;
}

function infoLlaveDe(t, m) {
  var hermanos = t.partidos.filter(function (p) { return p.llave === m.llave; })
    .sort(function (a, b) { return a.pierna - b.pierna; });
  var decisivo = m.pierna === hermanos.length;
  var agregado = null;
  if (hermanos.every(function (p) { return p.gl !== null && p.gv !== null; })) {
    var a = hermanos[0].local, ga = 0, gb = 0;
    hermanos.forEach(function (p) {
      if (p.local === a) { ga += p.gl; gb += p.gv; } else { ga += p.gv; gb += p.gl; }
    });
    agregado = { a: a, b: hermanos[0].visitante, ga: ga, gb: gb };
  }
  return { hermanos: hermanos, decisivo: decisivo, agregado: agregado };
}

function necesitaPenales(t, m) {
  if (m.tipo !== 'elim') return false;
  var info = infoLlaveDe(t, m);
  if (!info.decisivo || !info.agregado) return false;
  var previos = info.hermanos.slice(0, -1);
  if (previos.some(function (p) { return !p.fin; })) return false;
  return info.agregado.ga === info.agregado.gb;
}

function cartaPartido(t, m) {
  var el = equipoDe(m.local), ev = equipoDe(m.visitante);
  var meta = [];
  if (m.tipo === 'grupo') {
    if (t.grupos.length > 1) meta.push('Grupo ' + t.grupos[m.grupoIdx].nombre);
    meta.push('Fecha ' + m.jornada);
  } else {
    var info = infoLlaveDe(t, m);
    if (m.llave === 'e-tp') meta.push('Tercer puesto');
    if (info.hermanos.length === 2) meta.push(m.pierna === 1 ? 'Ida' : 'Vuelta');
    if (info.agregado && info.hermanos.length === 2 && m.pierna === 2) {
      meta.push('<span class="global-tag">Global ' + esc(nombreEq(info.agregado.a)) + ' ' + info.agregado.ga + '–' + info.agregado.gb + '</span>');
    }
  }
  meta.push(m.fin ? '<span class="badge badge-fin">Finalizado</span>' : '<span class="badge badge-gray">Pendiente</span>');

  var conPenales = m.fin ? (m.pl !== null && m.pv !== null) : necesitaPenales(t, m);

  var html = '<div class="card partido ' + (m.fin ? 'fin' : '') + (st.pitazos[m.id] && !m.fin ? ' pitazo' : '') + '">' +
    '<div class="meta">' + meta.join(' · ') + '</div>' +
    '<div class="marcador">' +
    '<div class="lado">' + crestHTML(el, true) + '<span class="nm">' + esc(el ? el.nombre : '—') + '</span></div>' +
    '<div class="goles">' +
    golInput(m, 'gl') + '<span class="sep">–</span>' + golInput(m, 'gv') +
    '</div>' +
    '<div class="lado">' + crestHTML(ev, true) + '<span class="nm">' + esc(ev ? ev.nombre : '—') + '</span></div>' +
    '</div>';

  if (conPenales) {
    html += '<div class="penales">Penales:' +
      '<input class="pen-inp" type="number" min="0" max="99" inputmode="numeric" data-m="' + m.id + '" data-campo="pl" value="' + (m.pl === null ? '' : m.pl) + '"' + (m.fin ? ' disabled' : '') + '>' +
      '<span>–</span>' +
      '<input class="pen-inp" type="number" min="0" max="99" inputmode="numeric" data-m="' + m.id + '" data-campo="pv" value="' + (m.pv === null ? '' : m.pv) + '"' + (m.fin ? ' disabled' : '') + '>' +
      '</div>';
  }

  if (!m.fin) html += filaTimer(m);

  html += '<div class="acciones">';
  if (m.fin) {
    html += '<button class="btn btn-sm" data-a="reabrir" data-m="' + m.id + '">✏️ Editar resultado</button>';
  } else {
    html += '<button class="btn btn-sm btn-ghost" data-a="simular" data-m="' + m.id + '">🎲 Simular</button>' +
      '<button class="btn btn-sm btn-primary" data-a="finalizar" data-m="' + m.id + '">Finalizar ✓</button>';
  }
  html += '</div></div>';
  return html;
}

function golInput(m, campo) {
  var v = m[campo];
  return '<input class="gol-inp" type="number" min="0" max="99" inputmode="numeric" ' +
    'data-m="' + m.id + '" data-campo="' + campo + '" value="' + (v === null ? '' : v) + '"' +
    (m.fin ? ' disabled' : '') + '>';
}

/* ---------- Llaves ---------- */
function tabLlaves(t, estructura) {
  if (!estructura) {
    var pg = t.partidos.filter(function (p) { return p.tipo === 'grupo'; });
    var fin = pg.filter(function (p) { return p.fin; }).length;
    return '<div class="vacio">🔒 La eliminatoria se genera al completar la fase de ' +
      (t.formato === 'liga-elim' ? 'liga' : 'grupos') +
      '.<br>Llevas ' + fin + ' de ' + pg.length + ' partidos.</div>';
  }
  var html = '<div class="bracket-scroll"><div class="bracket">';
  estructura.rondas.forEach(function (r) {
    html += '<div class="col-ronda"><h4>' + r.nombre + '</h4><div class="col-llaves">';
    r.llaves.forEach(function (l) { html += cartaLlave(t, l); });
    html += '</div></div>';
  });
  if (estructura.tercerPuesto) {
    html += '<div class="col-ronda"><h4>3er puesto</h4><div class="col-llaves">' +
      cartaLlave(t, estructura.tercerPuesto, true) + '</div></div>';
  }
  html += '</div></div>';
  return html;
}

function cartaLlave(t, l, esTP) {
  var html = '<div class="llave' + (esTP ? ' tp' : '') + '">';
  if (!l.a && !l.b) return html + '<div class="pend">Por definir</div></div>';

  var filas = [[l.a, 'a'], [l.b, 'b']];
  var detalles = [];
  filas.forEach(function (par) {
    var id = par[0];
    var gan = l.res && l.res.ganador === id;
    var goles = '';
    if (id && l.partidos.length) {
      var suma = null;
      if (l.partidos.every(function (p) { return p.gl !== null && p.gv !== null; })) {
        suma = 0;
        l.partidos.forEach(function (p) { suma += (p.local === id ? p.gl : p.gv); });
      }
      goles = suma === null ? '' : String(suma);
    }
    html += '<div class="fila ' + (gan ? 'win' : '') + '">' +
      (id ? crestHTML(id) : '<span class="crest flag">·</span>') +
      '<span class="nm">' + (id ? esc(nombreEq(id)) : 'Por definir') + '</span>' +
      '<span class="sc">' + goles + '</span></div>';
  });
  if (l.partidos.length === 2) {
    var textos = l.partidos.map(function (p, i) {
      if (p.gl === null || p.gv === null) return null;
      return (i === 0 ? 'Ida' : 'Vuelta') + ' ' + p.gl + '–' + p.gv;
    }).filter(Boolean);
    if (textos.length) detalles.push(textos.join(' · '));
  }
  var dec = l.partidos[l.partidos.length - 1];
  if (dec && dec.fin && dec.pl !== null && dec.pv !== null) {
    detalles.push('Penales ' + dec.pl + '–' + dec.pv);
  }
  if (detalles.length) html += '<div class="detalle">' + detalles.join(' · ') + '</div>';
  return html + '</div>';
}

/* ---------- Estadísticas ---------- */
function tabStats(t) {
  var s = estadisticasTorneo(t, nombreEq);
  if (!s.jugados) return '<div class="vacio">📊 Las estadísticas aparecerán cuando finalices el primer partido.</div>';
  function statEq(fila, etiqueta, valor) {
    if (!fila) return '';
    return '<div class="stat"><div class="l">' + etiqueta + '</div>' +
      '<div class="eqline">' + crestHTML(fila.id) + '<span class="nm">' + esc(nombreEq(fila.id)) + '</span></div>' +
      '<div class="sub">' + valor + '</div></div>';
  }
  var html = '<div class="stats-grid">' +
    '<div class="stat"><div class="v">' + s.jugados + '<span style="font-size:.9rem;color:var(--muted)">/' + s.totalPartidos + '</span></div><div class="l">Partidos jugados</div></div>' +
    '<div class="stat"><div class="v">' + s.goles + '</div><div class="l">Goles</div></div>' +
    '<div class="stat"><div class="v">' + s.promedio.toFixed(2) + '</div><div class="l">Goles por partido</div></div>' +
    '<div class="stat"><div class="v">' + s.victLocal + '</div><div class="l">Triunfos locales</div></div>' +
    '<div class="stat"><div class="v">' + s.empates + '</div><div class="l">Empates</div></div>' +
    '<div class="stat"><div class="v">' + s.victVisita + '</div><div class="l">Triunfos visitantes</div></div>' +
    statEq(s.mejorAtaque, 'Mejor ataque', s.mejorAtaque ? s.mejorAtaque.gf + ' goles a favor' : '') +
    statEq(s.mejorDefensa, 'Mejor defensa', s.mejorDefensa ? s.mejorDefensa.gc + ' goles en contra' : '');
  if (s.mayorGoleada) {
    var m = s.mayorGoleada.partido;
    html += '<div class="stat wide"><div class="l">Mayor goleada</div>' +
      '<div class="eqline">' + crestHTML(m.local) + '<span class="nm">' + esc(nombreEq(m.local)) + '</span>' +
      '<strong style="margin:0 4px">' + m.gl + '–' + m.gv + '</strong>' +
      crestHTML(m.visitante) + '<span class="nm">' + esc(nombreEq(m.visitante)) + '</span></div></div>';
  }
  html += '</div>';

  if (t.formato !== 'liga') {
    html += '<div class="card" style="margin-top:12px"><h3>Tabla general</h3><div class="tabla-wrap">' +
      '<table class="posiciones"><thead><tr><th>#</th><th>Equipo</th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th>Pts</th></tr></thead><tbody>';
    s.tablaGeneral.forEach(function (f, i) {
      html += '<tr><td class="pos">' + (i + 1) + '</td>' +
        '<td class="eq"><div class="in">' + crestHTML(f.id) + '<span class="nm">' + esc(nombreEq(f.id)) + '</span></div></td>' +
        '<td>' + f.pj + '</td><td>' + f.g + '</td><td>' + f.e + '</td><td>' + f.p + '</td>' +
        '<td>' + f.gf + '</td><td>' + f.gc + '</td><td>' + (f.dg > 0 ? '+' : '') + f.dg + '</td>' +
        '<td class="pts">' + f.pts + '</td></tr>';
    });
    html += '</tbody></table></div><div class="leyenda">Incluye todos los partidos del torneo (grupos y eliminatoria).</div></div>';
  }
  return html;
}

/* ---------- Ajustes ---------- */
function tabAjustes(t) {
  return '<div class="card"><h3>Torneo</h3>' +
    '<div style="display:flex;flex-direction:column;gap:10px">' +
    '<button class="btn" data-a="editar-torneo">✏️ Editar torneo (nombre, formato y equipos)</button>' +
    '<button class="btn" data-a="reiniciar">🔄 Reiniciar resultados</button>' +
    '<button class="btn btn-danger" data-a="eliminar">🗑️ Eliminar torneo</button>' +
    '</div></div>' +
    '<div class="card"><h3>Detalles</h3><div style="color:var(--muted);font-size:.88rem;line-height:1.9">' +
    descTorneo(t) + '<br>' +
    (t.config && t.config.idaVuelta ? 'Eliminatoria a ida y vuelta · ' : '') +
    (t.config && t.config.tercerPuesto ? 'Con partido por el 3er puesto · ' : '') +
    'Creado: ' + (t.creado ? t.creado.slice(0, 10) : '—') +
    '</div></div>';
}

/* =========================================================================
   ACCIONES DE PARTIDO
   ========================================================================= */
function partidoDe(id) {
  var t = torneoActual();
  return t ? t.partidos.find(function (p) { return p.id === id; }) : null;
}

function finalizarPartido(m, silencioso) {
  var t = torneoActual();
  if (m.gl === null || m.gv === null) { avisar('Ingresa el marcador completo.'); return false; }
  if (m.tipo === 'elim' && necesitaPenales(t, m) && m.gl !== null) {
    if (m.pl === null || m.pv === null) { avisar('Hay empate: define los penales.'); return false; }
    if (m.pl === m.pv) { avisar('Los penales no pueden terminar empatados.'); return false; }
  }
  var elimAntes = t.partidos.filter(function (p) { return p.tipo === 'elim'; }).length;
  m.fin = true;
  delete timers[m.id];
  delete st.pitazos[m.id];
  sincronizarTorneo(t, nombreEq);
  var elimDespues = t.partidos.filter(function (p) { return p.tipo === 'elim'; }).length;
  guardar();
  if (!silencioso) {
    if (t.campeon) avisar('🏆 ¡' + nombreEq(t.campeon) + ' es el campeón!');
    else if (elimAntes === 0 && elimDespues > 0) avisar('✅ ¡Fase completada! Se generó la eliminatoria.');
  }
  return true;
}

function simularPartido(m) {
  var t = torneoActual();
  if (m.gl === null) m.gl = Math.floor(Math.random() * 4);
  if (m.gv === null) m.gv = Math.floor(Math.random() * 4);
  if (m.tipo === 'elim' && necesitaPenales(t, m)) {
    m.pl = 3 + Math.floor(Math.random() * 3);
    m.pv = m.pl;
    while (m.pv === m.pl) m.pv = 2 + Math.floor(Math.random() * 4);
  }
  finalizarPartido(m, true);
}

function reabrirPartido(m) {
  var t = torneoActual();
  var hayElimJugada = t.partidos.some(function (p) { return p.tipo === 'elim' && p.fin; });
  var afectaElim = m.tipo === 'grupo' && hayElimJugada;
  var afectaLlaves = m.tipo === 'elim' && t.partidos.some(function (p) {
    return p.tipo === 'elim' && p.fin && p.llave !== m.llave;
  });
  var seguir = function () {
    m.fin = false;
    m.pl = null; m.pv = null;
    sincronizarTorneo(t, nombreEq);
    guardar();
    render(true);
  };
  if (afectaElim || afectaLlaves) {
    confirmar('Editar resultado',
      'Al cambiar este resultado se recalculará la eliminatoria; los cruces que cambien de equipos perderán sus resultados.',
      'Continuar', true).then(function (ok) { if (ok) seguir(); });
  } else {
    seguir();
  }
}

/* =========================================================================
   SINCRONIZACIÓN EN LA NUBE (Gist privado de GitHub)
   El "vínculo de cuenta" es un token de GitHub con permiso «gist»: los
   torneos se guardan en un Gist privado y cualquier dispositivo con el
   mismo token los ve. El token solo vive en el dispositivo (localStorage).
   ========================================================================= */
var ARCHIVO_SYNC = 'torneos-futbol.json';
var pushTimer = null;
var syncOcupado = false;
var syncUltimoPull = 0;

function sincVinculada() {
  return !!(db.sync && db.sync.token && db.sync.gistId);
}
function datosParaNube() {
  return JSON.stringify({ torneos: db.torneos, timerMin: db.timerMin || 10, actualizado: db.actualizado || 0 });
}
function apiGH(metodo, ruta, cuerpo, token) {
  return fetch('https://api.github.com' + ruta, {
    method: metodo,
    headers: {
      'Authorization': 'Bearer ' + (token || (db.sync && db.sync.token) || ''),
      'Accept': 'application/vnd.github+json'
    },
    body: cuerpo ? JSON.stringify(cuerpo) : undefined
  }).then(function (r) {
    if (r.status === 401 || r.status === 403) throw new Error('token');
    if (!r.ok) throw new Error('GitHub respondió ' + r.status);
    return r.json();
  });
}
function pintarSyncEstado(texto) {
  var el = document.querySelector('[data-sync-estado]');
  if (el) el.textContent = texto;
}
function programarPush() {
  if (!sincVinculada()) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(subirNube, 2500);
}
function subirNube() {
  if (!sincVinculada() || syncOcupado) return;
  syncOcupado = true;
  pintarSyncEstado('Sincronizando…');
  var archivos = {};
  archivos[ARCHIVO_SYNC] = { content: datosParaNube() };
  apiGH('PATCH', '/gists/' + db.sync.gistId, { files: archivos })
    .then(function () {
      db.sync.ultimo = Date.now();
      guardar(true);
      pintarSyncEstado('Al día ✓');
    })
    .catch(function (e) {
      pintarSyncEstado(e.message === 'token' ? '⚠️ Token inválido' : '⚠️ Sin conexión — se reintentará');
    })
    .then(function () { syncOcupado = false; });
}
function aplicarRemoto(remoto) {
  db.torneos = remoto.torneos || [];
  if (remoto.timerMin) db.timerMin = remoto.timerMin;
  db.actualizado = remoto.actualizado || Date.now();
  db.torneos.forEach(function (t) { try { sincronizarTorneo(t, nombreEq); } catch (e) { } });
  guardar(true);
}
function bajarNube(interactivo) {
  if (!sincVinculada()) return Promise.resolve();
  syncUltimoPull = Date.now();
  return apiGH('GET', '/gists/' + db.sync.gistId).then(function (g) {
    var archivo = g.files && g.files[ARCHIVO_SYNC];
    if (!archivo) return;
    var listo = archivo.truncated
      ? fetch(archivo.raw_url).then(function (r) { return r.text(); })
      : Promise.resolve(archivo.content);
    return listo.then(function (crudo) {
      var remoto;
      try { remoto = JSON.parse(crudo); } catch (e) { return; }
      if (!remoto || !Array.isArray(remoto.torneos)) return;
      if ((remoto.actualizado || 0) > (db.actualizado || 0)) {
        aplicarRemoto(remoto);
        render(true);
        avisar('☁️ Datos actualizados desde la nube');
      } else if ((db.actualizado || 0) > (remoto.actualizado || 0)) {
        programarPush();
      } else if (interactivo) {
        pintarSyncEstado('Al día ✓');
      }
    });
  }).catch(function (e) {
    if (interactivo) avisar(e.message === 'token' ? 'El token ya no es válido.' : 'No se pudo conectar con GitHub.');
  });
}
function vincularCuenta(token) {
  token = (token || '').trim();
  if (!token) { avisar('Pega tu token de GitHub primero.'); return; }
  avisar('Verificando cuenta…');
  var usuario;
  apiGH('GET', '/user', null, token)
    .then(function (u) {
      usuario = u.login;
      return apiGH('GET', '/gists?per_page=100', null, token);
    })
    .then(function (gists) {
      var mio = (gists || []).find(function (g) { return g.files && g.files[ARCHIVO_SYNC]; });
      if (mio) return mio.id;
      var archivos = {};
      archivos[ARCHIVO_SYNC] = { content: datosParaNube() };
      return apiGH('POST', '/gists', {
        description: '⚽ Torneos de Fútbol — datos sincronizados',
        public: false,
        files: archivos
      }, token).then(function (g) { return g.id; });
    })
    .then(function (gistId) {
      db.sync = { token: token, gistId: gistId, usuario: usuario, ultimo: null };
      guardar(true);
      avisar('✅ Cuenta vinculada: ' + usuario);
      return bajarNube(false).then(function () { return subirNube(); });
    })
    .then(function () { render(true); })
    .catch(function (e) {
      avisar(e.message === 'token'
        ? 'Token inválido: crea uno con el permiso «gist».'
        : 'No se pudo vincular: ' + e.message);
    });
}
function cartaSync() {
  var html = '<div class="section-title">Sincronización entre dispositivos</div><div class="card">';
  if (sincVinculada()) {
    var ultimo = db.sync.ultimo ? new Date(db.sync.ultimo).toLocaleString() : '—';
    html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">☁️ <b>Vinculada como ' + esc(db.sync.usuario) + '</b></div>' +
      '<div style="color:var(--muted);font-size:.83rem;margin-bottom:12px">Última sincronización: <span data-sync-estado>' + esc(ultimo) + '</span></div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<button class="btn btn-sm" data-a="sync-ahora">🔄 Sincronizar ahora</button>' +
      '<button class="btn btn-sm btn-danger" data-a="sync-desvincular">Desvincular</button></div>' +
      '<div style="color:var(--muted);font-size:.75rem;margin-top:10px">Tus torneos se guardan en un Gist privado de tu GitHub y se actualizan solos al hacer cambios. Vincula otro dispositivo con el mismo token para verlos ahí.</div>';
  } else {
    html += '<div style="font-size:.9rem;line-height:1.6;margin-bottom:10px">☁️ Vincula tu cuenta de <b>GitHub</b> (gratis) para guardar tus torneos en la nube y seguirlos desde cualquier dispositivo.</div>' +
      '<ol style="color:var(--muted);font-size:.83rem;line-height:1.7;margin:0 0 12px 18px">' +
      '<li>Abre <a href="https://github.com/settings/tokens/new?scopes=gist&description=Torneos%20de%20Futbol" target="_blank" rel="noopener" style="color:var(--info)">github.com/settings/tokens/new</a> (el permiso «gist» ya viene marcado).</li>' +
      '<li>En «Expiration» elige <b>No expiration</b> y toca <b>Generate token</b>.</li>' +
      '<li>Copia el token (empieza con <b>ghp_</b>) y pégalo aquí:</li></ol>' +
      '<input class="inp" id="sync-token" type="password" autocomplete="off" placeholder="ghp_…">' +
      '<button class="btn btn-primary btn-block" style="margin-top:10px" data-a="sync-vincular">🔗 Vincular cuenta</button>' +
      '<div style="color:var(--muted);font-size:.75rem;margin-top:10px">El token solo se guarda en este dispositivo y únicamente puede leer/escribir tus Gists.</div>';
  }
  return html + '</div>';
}

/* =========================================================================
   EXPORTAR / IMPORTAR
   ========================================================================= */
function exportarDatos() {
  // sin db.sync: el token nunca debe salir del dispositivo
  var copia = { torneos: db.torneos, timerMin: db.timerMin, actualizado: db.actualizado };
  var blob = new Blob([JSON.stringify(copia, null, 1)], { type: 'application/json' });
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'torneos-futbol.json';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(a.href); }, 5000);
  avisar('Datos exportados ⬇️');
}
function importarDatos(archivo) {
  var lector = new FileReader();
  lector.onload = function () {
    try {
      var datos = JSON.parse(lector.result);
      if (!datos || !Array.isArray(datos.torneos)) throw new Error('formato');
      confirmar('Importar datos',
        'Se reemplazarán tus torneos actuales (' + db.torneos.length + ') por los del archivo (' + datos.torneos.length + ').',
        'Importar', true).then(function (ok) {
          if (!ok) return;
          var vinculo = db.sync || null; // conservar la cuenta vinculada
          db = datos;
          db.sync = vinculo;
          guardar();
          st.vista = 'inicio';
          render();
          avisar('Datos importados ✔️');
        });
    } catch (e) {
      avisar('El archivo no es una copia válida.');
    }
  };
  lector.readAsText(archivo);
}

/* =========================================================================
   RENDER + EVENTOS
   ========================================================================= */
var claveVistaAnterior = '';
function render(preservarScroll) {
  var y = window.scrollY || 0;
  var app = document.getElementById('app');
  if (st.vista === 'wizard') app.innerHTML = vWizard();
  else if (st.vista === 'torneo') app.innerHTML = vTorneo();
  else app.innerHTML = vInicio();
  // animación de entrada solo al cambiar de pantalla/pestaña (no al escribir marcadores)
  var clave = st.vista + '|' + st.tab + '|' + (st.torneoId || '') + '|' + (st.wizard ? st.wizard.paso : '');
  app.className = clave !== claveVistaAnterior ? 'anim' : '';
  claveVistaAnterior = clave;
  window.scrollTo(0, preservarScroll ? y : 0);
}
function renderParcialEquipos() {
  var cont = document.getElementById('lista-eq');
  if (cont) cont.innerHTML = listaEquiposHTML(st.wizard);
  var res = document.getElementById('sel-resumen');
  if (res) res.innerHTML = chipsSeleccion(st.wizard);
}

var acciones = {
  'ir-inicio': function () { st.vista = 'inicio'; st.torneoId = null; render(); },
  'nuevo-torneo': function () { wizardNuevo(null); render(); },
  'usar-plantilla': function (d) {
    var p = DATOS.PLANTILLAS.find(function (x) { return x.id === d.id; });
    if (!p) return;
    wizardNuevo({
      nombre: p.nombre, icono: p.icono, tipoEquipos: p.tipo, formato: p.formato,
      vueltas: p.vueltas, numGrupos: p.numGrupos, clasifican: p.clasifican,
      idaVuelta: p.idaVuelta, tercerPuesto: p.tercerPuesto, finalUnica: p.finalUnica,
      equipoIds: p.equipoIds, plantillaId: p.id
    });
    render();
    avisar('Plantilla «' + p.nombre + '» cargada. Puedes ajustar equipos y formato.');
  },
  'abrir-torneo': function (d) {
    st.vista = 'torneo'; st.torneoId = d.id;
    var t = torneoActual();
    st.tab = t && t.formato === 'elim' ? 'partidos' : 'posiciones';
    render();
  },

  /* ----- wizard ----- */
  'w-cancelar': function () {
    if (st.wizard && st.wizard.editandoId) { st.vista = 'torneo'; st.torneoId = st.wizard.editandoId; }
    else st.vista = 'inicio';
    st.wizard = null;
    render();
  },
  'w-icono': function (d) { st.wizard.datos.icono = d.v; render(true); },
  'w-tipo': function (d) {
    if (st.wizard.datos.tipoEquipos !== d.v) st.wizard.equipos = [];
    st.wizard.datos.tipoEquipos = d.v;
    st.wizard.abiertos = {};
    render();
  },
  'w-formato': function (d) {
    st.wizard.datos.formato = d.v;
    if (d.v === 'liga-elim' && st.wizard.datos.clasifican < 2) st.wizard.datos.clasifican = 4;
    if (d.v === 'grupos-elim' && st.wizard.datos.clasifican > 2) st.wizard.datos.clasifican = 2;
    st.wizard.grupos = null; st.wizard.ordenElim = null;
    render(true);
  },
  'w-sw': function (d) { st.wizard.datos[d.k] = !st.wizard.datos[d.k]; render(true); },
  'w-paso-atras': function () { st.wizard.paso--; render(); },
  'w-paso-sig': function () {
    var w = st.wizard;
    if (w.paso === 1) {
      if (!w.datos.nombre.trim()) { avisar('Ponle un nombre al torneo.'); return; }
      w.paso = 2; render(); return;
    }
    if (w.paso === 2) {
      if (erroresWizard().length) { avisar(erroresWizard()[0]); return; }
      if (wizardNecesitaSorteo()) { prepararSorteo(false); w.paso = 3; render(); }
      else materializarTorneo();
    }
  },
  'w-toggle-grupo': function (d) {
    st.wizard.abiertos[d.g] = !st.wizard.abiertos[d.g];
    renderParcialEquipos();
    // mantener clase del acordeón sin re-render completo
  },
  'w-eq': function (d) {
    var w = st.wizard;
    var i = w.equipos.indexOf(d.id);
    if (i === -1) w.equipos.push(d.id); else w.equipos.splice(i, 1);
    w.grupos = null; w.ordenElim = null;
    render(true);
  },
  'w-quitar-eq': function (d, el, ev) {
    if (ev) ev.stopPropagation();
    var w = st.wizard;
    var i = w.equipos.indexOf(d.id);
    if (i !== -1) w.equipos.splice(i, 1);
    w.grupos = null; w.ordenElim = null;
    render(true);
  },
  'w-limpiar': function () {
    st.wizard.equipos = [];
    st.wizard.grupos = null; st.wizard.ordenElim = null;
    render(true);
  },
  'w-sortear': function () { prepararSorteo(true); render(true); },
  'w-swap': function (d) {
    var w = st.wizard;
    var g = +d.g, i = +d.i;
    if (!w.marcado) { w.marcado = { g: g, i: i }; render(true); return; }
    var m = w.marcado;
    if (m.g === g && m.i === i) { w.marcado = null; render(true); return; }
    if (g === -1) {
      var tmp = w.ordenElim[m.i];
      w.ordenElim[m.i] = w.ordenElim[i];
      w.ordenElim[i] = tmp;
    } else {
      var tmp2 = w.grupos[m.g].equipos[m.i];
      w.grupos[m.g].equipos[m.i] = w.grupos[g].equipos[i];
      w.grupos[g].equipos[i] = tmp2;
    }
    w.marcado = null;
    render(true);
  },
  'w-crear': function () { materializarTorneo(); },

  /* ----- torneo ----- */
  'tab': function (d) { st.tab = d.t; render(); },
  'fase': function (d) { st.fases[st.torneoId] = d.f; render(); },
  'finalizar': function (d) {
    var m = partidoDe(d.m);
    if (m && finalizarPartido(m)) render(true);
  },
  'reabrir': function (d) {
    var m = partidoDe(d.m);
    if (m) reabrirPartido(m);
  },
  'simular': function (d) {
    var m = partidoDe(d.m);
    if (m) { simularPartido(m); render(true); }
  },
  'simular-fase': function () {
    var t = torneoActual();
    var estructura = sincronizarTorneo(t, nombreEq);
    var fa = faseActual(t, estructura);
    if (!fa.sel) return;
    // simular en bucle: al finalizar pueden crearse nuevos partidos de la misma fase
    for (var seguridad = 0; seguridad < 50; seguridad++) {
      var pendientes = t.partidos.filter(fa.sel.filtro).filter(function (p) { return !p.fin; });
      if (!pendientes.length) break;
      pendientes.forEach(simularPartido);
    }
    guardar();
    render(true);
    var tAct = torneoActual();
    if (tAct.campeon) avisar('🏆 ¡' + nombreEq(tAct.campeon) + ' es el campeón!');
  },
  'editar-torneo': function () {
    var t = torneoActual();
    wizardNuevo({
      nombre: t.nombre, icono: t.icono, tipoEquipos: t.tipoEquipos, formato: t.formato,
      vueltas: t.config.vueltas, numGrupos: t.config.numGrupos, clasifican: t.config.clasifican,
      idaVuelta: t.config.idaVuelta, tercerPuesto: t.config.tercerPuesto,
      finalUnica: t.config.finalUnica, equipoIds: t.equipos
    }, t.id);
    // precargar sorteo actual para conservarlo si no se cambia nada
    if (t.formato === 'grupos-elim') st.wizard.grupos = t.grupos.map(function (g) { return { nombre: g.nombre, equipos: g.equipos.slice() }; });
    if (t.formato === 'elim') st.wizard.ordenElim = (t.ordenElim || t.equipos).slice();
    render();
  },
  'reiniciar': function () {
    var t = torneoActual();
    confirmar('Reiniciar resultados', 'Se borrarán todos los marcadores de «' + t.nombre + '». El calendario y los grupos se conservan.', 'Reiniciar', true)
      .then(function (ok) {
        if (!ok) return;
        t.partidos.forEach(function (p) { p.gl = null; p.gv = null; p.pl = null; p.pv = null; p.fin = false; });
        sincronizarTorneo(t, nombreEq);
        guardar();
        delete st.fases[t.id];
        render();
        avisar('Resultados reiniciados 🔄');
      });
  },
  'eliminar': function () {
    var t = torneoActual();
    confirmar('Eliminar torneo', 'Se eliminará «' + t.nombre + '» definitivamente.', 'Eliminar', true)
      .then(function (ok) {
        if (!ok) return;
        db.torneos = db.torneos.filter(function (x) { return x.id !== t.id; });
        guardar();
        st.vista = 'inicio'; st.torneoId = null;
        render();
        avisar('Torneo eliminado 🗑️');
      });
  },

  /* ----- cronómetro ----- */
  'timer-ini': function (d) {
    var inp = document.querySelector('[data-timer-min="' + d.m + '"]');
    var min = Math.max(1, Math.min(120, parseInt(inp && inp.value, 10) || 10));
    db.timerMin = min;
    guardar();
    asegurarAudio(); // dentro del toque del usuario: habilita el sonido en iOS
    timers[d.m] = { finEn: Date.now() + min * 60000, totalMs: min * 60000, pausadoResta: null };
    delete st.pitazos[d.m];
    arrancarTick();
    render(true);
  },
  'timer-pausa': function (d) {
    var t = timers[d.m];
    if (!t) return;
    if (t.pausadoResta != null) { t.finEn = Date.now() + t.pausadoResta; t.pausadoResta = null; }
    else t.pausadoResta = Math.max(0, t.finEn - Date.now());
    render(true);
  },
  'timer-stop': function (d) {
    delete timers[d.m];
    delete st.pitazos[d.m];
    render(true);
  },

  /* ----- sincronización ----- */
  'sync-vincular': function () {
    var inp = document.getElementById('sync-token');
    vincularCuenta(inp && inp.value);
  },
  'sync-ahora': function () {
    pintarSyncEstado('Sincronizando…');
    bajarNube(true).then(function () { subirNube(); });
  },
  'sync-desvincular': function () {
    confirmar('Desvincular cuenta',
      'Este dispositivo dejará de sincronizar. Tus torneos locales y los de la nube se conservan.',
      'Desvincular', true).then(function (ok) {
        if (!ok) return;
        db.sync = null;
        guardar(true);
        render(true);
        avisar('Cuenta desvinculada.');
      });
  },

  /* ----- datos ----- */
  'exportar': exportarDatos,
  'importar': function () { document.getElementById('importar-archivo').click(); },
  'modal-ok': function () { cerrarModal(true); },
  'modal-no': function () { cerrarModal(false); }
};

document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-a]');
  if (!el) return;
  var fn = acciones[el.dataset.a];
  if (fn) fn(el.dataset, el, e);
});

/* Entradas de texto y marcadores */
document.addEventListener('input', function (e) {
  var el = e.target;
  if (el.id === 'w-nombre' && st.wizard) { st.wizard.datos.nombre = el.value; return; }
  if (el.id === 'buscar-eq' && st.wizard) {
    st.wizard.busqueda = el.value;
    renderParcialEquipos();
    return;
  }
  if (el.dataset && el.dataset.m && el.dataset.campo) {
    var m = partidoDe(el.dataset.m);
    if (!m || m.fin) return;
    var v = el.value === '' ? null : Math.max(0, Math.min(99, parseInt(el.value, 10) || 0));
    m[el.dataset.campo] = v;
    guardar();
  }
});
document.addEventListener('change', function (e) {
  var el = e.target;
  if (el.dataset && el.dataset.k && st.wizard) {
    var v = el.value;
    st.wizard.datos[el.dataset.k] = isNaN(+v) ? v : +v;
    st.wizard.grupos = null; st.wizard.ordenElim = null;
    render();
    return;
  }
  if (el.id === 'importar-archivo' && el.files && el.files[0]) {
    importarDatos(el.files[0]);
    el.value = '';
    return;
  }
  if (el.dataset && el.dataset.m && el.dataset.campo && st.vista === 'torneo') {
    // Re-pintar SOLO si cambia la visibilidad de los penales: un render aquí
    // destruiría el botón «Finalizar» y se perdería el toque del usuario.
    var m = partidoDe(el.dataset.m);
    var t = torneoActual();
    if (!m || m.fin || !t) return;
    var debeMostrar = m.tipo === 'elim' && necesitaPenales(t, m);
    var yaMuestra = !!document.querySelector('.pen-inp[data-m="' + m.id + '"]');
    if (debeMostrar !== yaMuestra) render(true);
  }
});

/* ---------------- Arranque ---------------- */
if (typeof ESCUDOS !== 'undefined' && typeof ESCUDOS_EXTRA !== 'undefined') {
  // escudos adicionales descargados con tools/descargar-escudos.mjs
  Object.keys(ESCUDOS_EXTRA).forEach(function (k) { ESCUDOS[k] = ESCUDOS_EXTRA[k]; });
}
cargarDB();
db.torneos.forEach(function (t) { try { sincronizarTorneo(t, nombreEq); } catch (e) { console.warn(e); } });
guardar(true);
render();
if (sincVinculada()) bajarNube(false);
// al volver a la app (cambio de pestaña/dispositivo), buscar novedades en la nube
document.addEventListener('visibilitychange', function () {
  if (!document.hidden && sincVinculada() && Date.now() - syncUltimoPull > 30000) bajarNube(false);
});

'use strict';
/* =========================================================================
   LÓGICA DEL TORNEO — funciones puras (sin DOM) para poder probarlas.

   Modelo de torneo:
   {
     id, nombre, icono, tipoEquipos: 'seleccion'|'club',
     formato: 'liga' | 'liga-elim' | 'grupos-elim' | 'elim',
     config: { vueltas, numGrupos, clasifican, idaVuelta, tercerPuesto },
     equipos: [idEquipo...],
     grupos:  [{ nombre, equipos: [id...] }]   (formatos con fase de grupos)
     ordenElim: [id...]                        (formato 'elim': orden del sorteo)
     partidos: [{ id, tipo:'grupo'|'elim', grupoIdx, jornada, llave, pierna,
                  local, visitante, gl, gv, pl, pv, fin }]
     campeon, subcampeon, tercero
   }
   ========================================================================= */

var NOMBRES_GRUPO = 'ABCDEFGHIJKLMNOP'.split('');

function barajar(arr) {
  var a = arr.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

function esPotenciaDe2(n) { return n >= 2 && (n & (n - 1)) === 0; }

/* ---------- Calendario round-robin (método del círculo) ---------- */
function jornadasRoundRobin(ids, vueltas) {
  var eq = ids.slice();
  if (eq.length % 2 === 1) eq.push(null); // descanso
  var n = eq.length, rondas = n - 1, mitad = n / 2;
  var jornadas = [];
  var arr = eq.slice();
  for (var r = 0; r < rondas; r++) {
    var j = [];
    for (var i = 0; i < mitad; i++) {
      var a = arr[i], b = arr[n - 1 - i];
      if (a !== null && b !== null) {
        // alternar localía del equipo fijo para equilibrar
        j.push((r % 2 === 1 && i === 0) ? [b, a] : [a, b]);
      }
    }
    jornadas.push(j);
    arr = [arr[0], arr[n - 1]].concat(arr.slice(1, n - 1));
  }
  if (vueltas === 2) {
    var ida = jornadas.slice();
    ida.forEach(function (j) {
      jornadas.push(j.map(function (par) { return [par[1], par[0]]; }));
    });
  }
  return jornadas;
}

/* ---------- Sorteo de grupos ---------- */
function sortearGrupos(equipoIds, numGrupos) {
  var mezcla = barajar(equipoIds);
  var grupos = [];
  for (var g = 0; g < numGrupos; g++) grupos.push({ nombre: NOMBRES_GRUPO[g], equipos: [] });
  mezcla.forEach(function (id, i) { grupos[i % numGrupos].equipos.push(id); });
  return grupos;
}

/* ---------- Generar partidos de la fase de grupos ---------- */
function generarPartidosGrupos(torneo) {
  var partidos = [];
  torneo.grupos.forEach(function (grupo, gi) {
    var jornadas = jornadasRoundRobin(grupo.equipos, torneo.config.vueltas || 1);
    jornadas.forEach(function (jornada, ji) {
      jornada.forEach(function (par, pi) {
        partidos.push({
          id: 'g' + gi + 'j' + ji + 'p' + pi, tipo: 'grupo',
          grupoIdx: gi, jornada: ji + 1, llave: null, pierna: 1,
          local: par[0], visitante: par[1],
          gl: null, gv: null, pl: null, pv: null, fin: false
        });
      });
    });
  });
  return partidos;
}

/* ---------- Tabla de posiciones ---------- */
function tablaPosiciones(equipoIds, partidos, nombreDe) {
  var filas = {};
  equipoIds.forEach(function (id) {
    filas[id] = { id: id, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 };
  });
  partidos.forEach(function (m) {
    if (!m.fin || m.gl === null || m.gv === null) return;
    var L = filas[m.local], V = filas[m.visitante];
    if (!L || !V) return;
    L.pj++; V.pj++;
    L.gf += m.gl; L.gc += m.gv; V.gf += m.gv; V.gc += m.gl;
    if (m.gl > m.gv) { L.g++; V.p++; L.pts += 3; }
    else if (m.gl < m.gv) { V.g++; L.p++; V.pts += 3; }
    else { L.e++; V.e++; L.pts++; V.pts++; }
  });
  var lista = equipoIds.map(function (id) {
    var f = filas[id]; f.dg = f.gf - f.gc; return f;
  });
  lista.sort(function (a, b) {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return nombreDe(a.id).localeCompare(nombreDe(b.id));
  });
  return lista;
}

/* ---------- Orden de siembra para brackets (1 vs n, 2 vs n-1, ...) ---------- */
function ordenSiembra(n) {
  var r = [1];
  while (r.length < n) {
    var m = r.length * 2, nr = [];
    r.forEach(function (s) { nr.push(s, m + 1 - s); });
    r = nr;
  }
  return r;
}

/* ---------- Nombre de cada ronda según nº de equipos ---------- */
function nombreRonda(nEquipos) {
  if (nEquipos >= 32) return 'Dieciseisavos de final';
  if (nEquipos === 16) return 'Octavos de final';
  if (nEquipos === 8) return 'Cuartos de final';
  if (nEquipos === 4) return 'Semifinales';
  return 'Final';
}

/* ---------- Emparejamiento de la primera ronda eliminatoria ---------- */
function emparejarPrimeraRonda(torneo, nombreDe) {
  var cfg = torneo.config;
  if (torneo.formato === 'elim') {
    var orden = torneo.ordenElim || torneo.equipos;
    var pares = [];
    for (var i = 0; i < orden.length; i += 2) pares.push([orden[i], orden[i + 1]]);
    return pares;
  }
  var partidosGrupo = torneo.partidos.filter(function (p) { return p.tipo === 'grupo'; });
  var tablas = torneo.grupos.map(function (g) {
    return tablaPosiciones(g.equipos, partidosGrupo.filter(function (p) {
      return p.grupoIdx === torneo.grupos.indexOf(g);
    }), nombreDe);
  });
  var c = cfg.clasifican;
  if (torneo.grupos.length === 1) {
    // liga + liguilla: siembra 1 vs c, 2 vs c-1, ...
    var top = tablas[0].slice(0, c).map(function (f) { return f.id; });
    var siembra = ordenSiembra(c);
    var pares1 = [];
    for (var k = 0; k < siembra.length; k += 2) {
      pares1.push([top[siembra[k] - 1], top[siembra[k + 1] - 1]]);
    }
    return pares1;
  }
  var G = torneo.grupos.length;
  var pares2 = [];
  if (c === 1) {
    var ganadores = tablas.map(function (t) { return t[0].id; });
    for (var x = 0; x < G; x += 2) pares2.push([ganadores[x], ganadores[x + 1]]);
  } else {
    // c === 2 → estilo mundial: 1ºA-2ºB, 1ºC-2ºD... y 1ºB-2ºA, 1ºD-2ºC...
    for (var g1 = 0; g1 < G; g1 += 2) pares2.push([tablas[g1][0].id, tablas[g1 + 1][1].id]);
    for (var g2 = 0; g2 < G; g2 += 2) pares2.push([tablas[g2 + 1][0].id, tablas[g2][1].id]);
  }
  return pares2;
}

/* ---------- Resultado de una llave (1 ó 2 partidos) ---------- */
function resultadoLlave(a, b, partidos) {
  if (!a || !b || partidos.length === 0) return null;
  if (partidos.some(function (m) { return !m.fin || m.gl === null || m.gv === null; })) return null;
  var golesA = 0, golesB = 0, decisivo = partidos[partidos.length - 1];
  partidos.forEach(function (m) {
    if (m.local === a) { golesA += m.gl; golesB += m.gv; }
    else { golesA += m.gv; golesB += m.gl; }
  });
  var ganador = null;
  if (golesA > golesB) ganador = a;
  else if (golesB > golesA) ganador = b;
  else {
    // penales en el partido decisivo
    if (decisivo.pl === null || decisivo.pv === null || decisivo.pl === decisivo.pv) return null;
    var penLocal = decisivo.pl > decisivo.pv;
    ganador = penLocal ? decisivo.local : decisivo.visitante;
  }
  return {
    ganador: ganador, perdedor: ganador === a ? b : a,
    golesA: golesA, golesB: golesB
  };
}

/* ---------- Asegura que los partidos de una llave existan y coincidan ---------- */
function asegurarPartidosLlave(torneo, llaveId, a, b, piernas) {
  var existentes = torneo.partidos.filter(function (p) { return p.llave === llaveId; });
  existentes.sort(function (x, y) { return x.pierna - y.pierna; });
  if (!a || !b) {
    if (existentes.length) {
      torneo.partidos = torneo.partidos.filter(function (p) { return p.llave !== llaveId; });
    }
    return [];
  }
  var coincide = existentes.length === piernas && existentes.every(function (m, i) {
    var esperadoLocal = (piernas === 2 && i === 0) ? a : (piernas === 2 ? b : a);
    var esperadoVisit = (piernas === 2 && i === 0) ? b : (piernas === 2 ? a : b);
    return m.local === esperadoLocal && m.visitante === esperadoVisit;
  });
  if (coincide) return existentes;
  torneo.partidos = torneo.partidos.filter(function (p) { return p.llave !== llaveId; });
  var nuevos = [];
  for (var i = 0; i < piernas; i++) {
    nuevos.push({
      id: llaveId + '-p' + (i + 1), tipo: 'elim',
      grupoIdx: null, jornada: null, llave: llaveId, pierna: i + 1,
      local: (piernas === 2 && i === 0) ? a : (piernas === 2 ? b : a),
      visitante: (piernas === 2 && i === 0) ? b : (piernas === 2 ? a : b),
      gl: null, gv: null, pl: null, pv: null, fin: false
    });
  }
  torneo.partidos = torneo.partidos.concat(nuevos);
  return nuevos;
}

/* ---------- ¿Fase de grupos completa? ---------- */
function gruposCompletos(torneo) {
  var pg = torneo.partidos.filter(function (p) { return p.tipo === 'grupo'; });
  return pg.length > 0 && pg.every(function (p) { return p.fin; });
}

/* =========================================================================
   SINCRONIZAR — recalcula todo el estado derivado del torneo:
   crea/borra partidos de eliminatoria, propaga ganadores, define campeón.
   Devuelve la estructura de rondas para pintar el bracket.
   ========================================================================= */
function sincronizarTorneo(torneo, nombreDe) {
  torneo.campeon = null; torneo.subcampeon = null; torneo.tercero = null;
  var cfg = torneo.config;

  var tieneGrupos = torneo.formato !== 'elim';
  var tieneElim = torneo.formato !== 'liga';

  if (!tieneElim) {
    // liga pura: campeón = líder cuando termina todo
    if (gruposCompletos(torneo)) {
      var tabla = tablaPosiciones(torneo.grupos[0].equipos,
        torneo.partidos, nombreDe);
      torneo.campeon = tabla[0].id;
      if (tabla[1]) torneo.subcampeon = tabla[1].id;
      if (tabla[2]) torneo.tercero = tabla[2].id;
    }
    return null;
  }

  var elimLista = !tieneGrupos || gruposCompletos(torneo);
  if (!elimLista) {
    if (torneo.partidos.some(function (p) { return p.tipo === 'elim'; })) {
      torneo.partidos = torneo.partidos.filter(function (p) { return p.tipo !== 'elim'; });
    }
    return null;
  }

  var pares = emparejarPrimeraRonda(torneo, nombreDe);
  var nLlaves = pares.length;               // nº de llaves de la 1ª ronda
  var totalRondas = Math.round(Math.log(nLlaves) / Math.log(2)) + 1;

  var rondas = [];
  var anteriores = null;
  for (var r = 0; r < totalRondas; r++) {
    var cuenta = nLlaves >> r;
    var esFinal = (cuenta === 1);
    var llaves = [];
    for (var i = 0; i < cuenta; i++) {
      var a, b;
      if (r === 0) { a = pares[i][0]; b = pares[i][1]; }
      else {
        a = anteriores[2 * i].res ? anteriores[2 * i].res.ganador : null;
        b = anteriores[2 * i + 1].res ? anteriores[2 * i + 1].res.ganador : null;
      }
      // la final es a partido único salvo que se pida ida y vuelta también en ella
      var piernas = (cfg.idaVuelta && (!esFinal || cfg.finalUnica === false)) ? 2 : 1;
      var llaveId = 'e-r' + r + '-l' + i;
      var partidos = asegurarPartidosLlave(torneo, llaveId, a, b, piernas);
      var res = resultadoLlave(a, b, partidos);
      llaves.push({ id: llaveId, a: a, b: b, partidos: partidos, res: res, piernas: piernas });
    }
    rondas.push({
      nombre: nombreRonda(cuenta * 2), llaves: llaves, nEquipos: cuenta * 2
    });
    anteriores = llaves;
  }

  // Tercer puesto (perdedores de semifinales)
  var tp = null;
  if (cfg.tercerPuesto && totalRondas >= 2) {
    var semis = rondas[totalRondas - 2].llaves;
    var pa = semis[0].res ? semis[0].res.perdedor : null;
    var pb = semis[1] && semis[1].res ? semis[1].res.perdedor : null;
    var partidosTP = asegurarPartidosLlave(torneo, 'e-tp', pa, pb, 1);
    tp = { id: 'e-tp', a: pa, b: pb, partidos: partidosTP, res: resultadoLlave(pa, pb, partidosTP), piernas: 1 };
  } else {
    // limpiar si se desactivó
    torneo.partidos = torneo.partidos.filter(function (p) { return p.llave !== 'e-tp'; });
  }

  var final = rondas[totalRondas - 1].llaves[0];
  if (final.res) {
    torneo.campeon = final.res.ganador;
    torneo.subcampeon = final.res.perdedor;
    if (tp && tp.res) torneo.tercero = tp.res.ganador;
  }

  return { rondas: rondas, tercerPuesto: tp };
}

/* ---------- Validación de la configuración al crear/editar ---------- */
function validarConfiguracion(formato, cfg, nEquipos) {
  var err = [];
  if (nEquipos < 2) { err.push('Elige al menos 2 equipos.'); return err; }
  if (formato === 'liga') {
    // cualquier cantidad ≥ 2 sirve
  } else if (formato === 'liga-elim') {
    if (!esPotenciaDe2(cfg.clasifican)) err.push('Los clasificados a la liguilla deben ser 2, 4, 8 o 16.');
    if (cfg.clasifican >= nEquipos) err.push('Los clasificados (' + cfg.clasifican + ') deben ser menos que los equipos (' + nEquipos + ').');
  } else if (formato === 'grupos-elim') {
    if (nEquipos % cfg.numGrupos !== 0) {
      err.push('Con ' + cfg.numGrupos + ' grupos necesitas un número de equipos múltiplo de ' + cfg.numGrupos + ' (tienes ' + nEquipos + ').');
    } else {
      var porGrupo = nEquipos / cfg.numGrupos;
      if (porGrupo < 2) err.push('Cada grupo necesita al menos 2 equipos.');
      if (cfg.clasifican >= porGrupo && porGrupo > 1) err.push('Deben clasificar menos equipos (' + cfg.clasifican + ') de los que tiene cada grupo (' + porGrupo + ').');
    }
    var totalClasif = cfg.numGrupos * cfg.clasifican;
    if (!esPotenciaDe2(totalClasif)) err.push('El total de clasificados (' + totalClasif + ') debe ser potencia de 2 (2, 4, 8, 16, 32).');
    if (cfg.clasifican === 1 && cfg.numGrupos % 2 !== 0) err.push('Con 1 clasificado por grupo, el número de grupos debe ser par.');
  } else if (formato === 'elim') {
    if (!esPotenciaDe2(nEquipos)) err.push('La eliminatoria directa necesita 2, 4, 8, 16, 32 o 64 equipos (tienes ' + nEquipos + ').');
  }
  return err;
}

/* ---------- Estadísticas generales ---------- */
function estadisticasTorneo(torneo, nombreDe) {
  var jugados = torneo.partidos.filter(function (p) { return p.fin && p.gl !== null; });
  var st = {
    totalPartidos: torneo.partidos.length,
    jugados: jugados.length,
    goles: 0, promedio: 0,
    victLocal: 0, victVisita: 0, empates: 0,
    mejorAtaque: null, mejorDefensa: null, mayorGoleada: null,
    tablaGeneral: []
  };
  jugados.forEach(function (m) {
    st.goles += m.gl + m.gv;
    if (m.gl > m.gv) st.victLocal++;
    else if (m.gv > m.gl) st.victVisita++;
    else st.empates++;
    var dif = Math.abs(m.gl - m.gv);
    if (!st.mayorGoleada || dif > st.mayorGoleada.dif ||
      (dif === st.mayorGoleada.dif && m.gl + m.gv > st.mayorGoleada.total)) {
      st.mayorGoleada = { partido: m, dif: dif, total: m.gl + m.gv };
    }
  });
  st.promedio = st.jugados ? (st.goles / st.jugados) : 0;
  var tabla = tablaPosiciones(torneo.equipos, jugados, nombreDe);
  st.tablaGeneral = tabla;
  var conJuegos = tabla.filter(function (f) { return f.pj > 0; });
  if (conJuegos.length) {
    st.mejorAtaque = conJuegos.slice().sort(function (a, b) { return b.gf - a.gf; })[0];
    st.mejorDefensa = conJuegos.slice().sort(function (a, b) {
      return (a.gc / a.pj) - (b.gc / b.pj) || b.pj - a.pj;
    })[0];
  }
  return st;
}

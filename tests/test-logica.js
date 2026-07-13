#!/usr/bin/env node
/* Pruebas de la lógica del torneo (sin navegador): node tests/test-logica.js */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ctx = { console, window: {} };
vm.createContext(ctx);
for (const f of ['js/data.js', 'js/escudos.js', 'js/escudos-extra.js', 'js/logic.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'), ctx, { filename: f });
}
const {
  DATOS, jornadasRoundRobin, sortearGrupos, generarPartidosGrupos, tablaPosiciones,
  ordenSiembra, sincronizarTorneo, validarConfiguracion, estadisticasTorneo, gruposCompletos
} = ctx;

let pasadas = 0, falladas = 0;
function ok(cond, msg) {
  if (cond) { pasadas++; }
  else { falladas++; console.error('  ✗ FALLA:', msg); }
}
const nombreDe = id => (DATOS.porId.get(id) || { nombre: id }).nombre;

/* ---------- datos ---------- */
{
  const sel = DATOS.equipos.filter(e => e.tipo === 'seleccion');
  const clu = DATOS.equipos.filter(e => e.tipo === 'club');
  console.log(`Datos: ${sel.length} selecciones, ${clu.length} clubes, ${DATOS.PLANTILLAS.length} plantillas`);
  ok(sel.length >= 200, 'al menos 200 selecciones');
  ok(clu.length >= 180, 'al menos 180 clubes');
  ok(new Set(DATOS.equipos.map(e => e.id)).size === DATOS.equipos.length, 'IDs únicos');
  for (const p of DATOS.PLANTILLAS) {
    ok(p.equipoIds.length === p.equipos.length, `plantilla ${p.id}: todos los equipos resueltos (${p.equipoIds.length}/${p.equipos.length})`);
    const cfg = { vueltas: p.vueltas || 1, numGrupos: p.numGrupos || 1, clasifican: p.clasifican || 2, idaVuelta: !!p.idaVuelta, tercerPuesto: !!p.tercerPuesto };
    const err = validarConfiguracion(p.formato, cfg, p.equipoIds.length);
    ok(err.length === 0, `plantilla ${p.id}: configuración válida (${err.join(' | ')})`);
  }
  for (const id of ['serie-a', 'bundesliga', 'liga-chilena']) {
    ok(DATOS.PLANTILLAS.some(p => p.id === id), `existe la plantilla ${id}`);
  }
}

/* ---------- escudos embebidos ---------- */
{
  const E = ctx.ESCUDOS;
  const claves = Object.keys(E);
  const sel = DATOS.equipos.filter(e => e.tipo === 'seleccion');
  ok(sel.every(e => E[e.id]), 'todas las selecciones tienen bandera SVG embebida');
  const clubes = claves.filter(k => k.startsWith('c-'));
  ok(clubes.length >= 40, `al menos 40 clubes con escudo original (${clubes.length})`);
  ok(claves.filter(k => k.startsWith('t-')).length >= 5, 'al menos 5 insignias de torneos');
  ok(claves.every(k => E[k].startsWith('<svg')), 'todos los escudos embebidos son SVG');
  ok(claves.every(k => DATOS.porId.has(k) || k.startsWith('t-')), 'cada escudo corresponde a un equipo o torneo existente');
  const peso = claves.reduce((n, k) => n + E[k].length, 0);
  ok(peso < 900 * 1024, `peso total de escudos razonable (${Math.round(peso / 1024)} KB)`);
  ok(typeof ctx.ESCUDOS_EXTRA === 'object', 'escudos-extra.js carga correctamente');
}

/* ---------- round robin ---------- */
{
  for (const n of [2, 3, 4, 5, 6, 18, 20]) {
    const ids = Array.from({ length: n }, (_, i) => 'e' + i);
    const j1 = jornadasRoundRobin(ids, 1);
    const partidos = j1.flat();
    ok(partidos.length === n * (n - 1) / 2, `RR ${n} equipos, 1 vuelta: ${partidos.length} partidos`);
    const claves = new Set(partidos.map(p => [p[0], p[1]].sort().join('|')));
    ok(claves.size === partidos.length, `RR ${n}: sin cruces repetidos`);
    // nadie juega dos veces en la misma jornada
    ok(j1.every(j => new Set(j.flat()).size === j.flat().length), `RR ${n}: una vez por jornada`);
    const j2 = jornadasRoundRobin(ids, 2);
    ok(j2.flat().length === n * (n - 1), `RR ${n} equipos, 2 vueltas`);
  }
}

/* ---------- siembra ---------- */
{
  ok(JSON.stringify(ordenSiembra(4)) === '[1,4,2,3]', 'siembra de 4');
  ok(JSON.stringify(ordenSiembra(8)) === '[1,8,4,5,2,7,3,6]', 'siembra de 8');
}

/* ---------- torneo estilo mundial completo ---------- */
function torneoDePrueba(equipos, formato, cfg, grupos, ordenElim) {
  const t = {
    id: 'test', nombre: 'Test', tipoEquipos: 'seleccion', formato,
    config: cfg, equipos: equipos.slice(),
    grupos: grupos || null, ordenElim: ordenElim || null,
    partidos: [], campeon: null, subcampeon: null, tercero: null
  };
  if (formato !== 'elim') t.partidos = generarPartidosGrupos(t);
  sincronizarTorneo(t, nombreDe);
  return t;
}
function simular(t, semilla) {
  let s = semilla;
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let guard = 0; guard < 500; guard++) {
    const pendientes = t.partidos.filter(p => !p.fin);
    if (!pendientes.length) break;
    for (const m of pendientes) {
      m.gl = Math.floor(rand() * 4); m.gv = Math.floor(rand() * 4);
      m.fin = true;
      // si la llave queda empatada, penales en el partido decisivo
      const hermanos = t.partidos.filter(p => p.llave && p.llave === m.llave);
      if (m.llave && m.pierna === hermanos.length && hermanos.every(p => p.fin)) {
        let ga = 0, gb = 0; const a = hermanos[0].local;
        for (const p of hermanos) { if (p.local === a) { ga += p.gl; gb += p.gv; } else { ga += p.gv; gb += p.gl; } }
        if (ga === gb) { m.pl = 5; m.pv = 4 - Math.floor(rand() * 2); }
      }
    }
    sincronizarTorneo(t, nombreDe);
  }
  return t;
}

{
  const mundial = DATOS.PLANTILLAS.find(p => p.id === 'mundial');
  const cfg = { vueltas: 1, numGrupos: 8, clasifican: 2, idaVuelta: false, tercerPuesto: true, finalUnica: true };
  const grupos = sortearGrupos(mundial.equipoIds, 8);
  ok(grupos.length === 8 && grupos.every(g => g.equipos.length === 4), 'sorteo 8 grupos de 4');
  const t = torneoDePrueba(mundial.equipoIds, 'grupos-elim', cfg, grupos);
  ok(t.partidos.length === 48, `mundial: 48 partidos de grupos (${t.partidos.length})`);
  ok(!gruposCompletos(t), 'grupos incompletos al inicio');
  simular(t, 7);
  const elim = t.partidos.filter(p => p.tipo === 'elim');
  ok(elim.length === 16, `mundial: 16 partidos de eliminatoria (octavos 8 + cuartos 4 + semis 2 + final 1 + 3er 1 = ${elim.length})`);
  ok(t.partidos.length === 64, `mundial: 64 partidos en total (${t.partidos.length})`);
  ok(!!t.campeon && !!t.subcampeon && !!t.tercero, 'mundial: campeón, subcampeón y tercero definidos');
  ok(t.campeon !== t.subcampeon && t.campeon !== t.tercero, 'podio coherente');
  const st = estadisticasTorneo(t, nombreDe);
  ok(st.jugados === 64 && st.goles > 0, 'estadísticas calculadas');

  // reabrir un partido de grupos debe recalcular sin romper
  const m0 = t.partidos.find(p => p.tipo === 'grupo');
  m0.fin = false; m0.gl = 9; // cambia la tabla con seguridad
  sincronizarTorneo(t, nombreDe);
  m0.fin = true;
  sincronizarTorneo(t, nombreDe);
  ok(t.partidos.filter(p => p.tipo === 'elim').every(p => p.local && p.visitante), 'recálculo estable tras editar grupos');
}

/* ---------- champions: ida y vuelta con penales ---------- */
{
  const ch = DATOS.PLANTILLAS.find(p => p.id === 'champions');
  const cfg = { vueltas: 1, numGrupos: 8, clasifican: 2, idaVuelta: true, tercerPuesto: false, finalUnica: true };
  const t = torneoDePrueba(ch.equipoIds, 'grupos-elim', cfg, sortearGrupos(ch.equipoIds, 8));
  simular(t, 42);
  const elim = t.partidos.filter(p => p.tipo === 'elim');
  // octavos 8*2 + cuartos 4*2 + semis 2*2 + final 1 = 29
  ok(elim.length === 29, `champions: 29 partidos de eliminatoria (${elim.length})`);
  ok(!!t.campeon, 'champions: campeón definido');
  const final = t.partidos.filter(p => p.llave === 'e-r3-l0');
  ok(final.length === 1, 'champions: final a partido único');
}

/* ---------- liga pura ---------- */
{
  const liga = DATOS.PLANTILLAS.find(p => p.id === 'premier');
  const cfg = { vueltas: 2, numGrupos: 1, clasifican: 2, idaVuelta: false, tercerPuesto: false, finalUnica: true };
  const t = torneoDePrueba(liga.equipoIds, 'liga', cfg, [{ nombre: 'General', equipos: liga.equipoIds.slice() }]);
  ok(t.partidos.length === 380, `premier: 380 partidos (${t.partidos.length})`);
  simular(t, 99);
  ok(!!t.campeon, 'liga: campeón = líder al terminar');
  const tabla = tablaPosiciones(liga.equipoIds, t.partidos, nombreDe);
  ok(tabla[0].id === t.campeon, 'liga: campeón coincide con el 1º de la tabla');
  ok(tabla.every(f => f.pj === 38), 'liga: todos juegan 38 partidos');
}

/* ---------- liga + liguilla (Liga MX) ---------- */
{
  const mx = DATOS.PLANTILLAS.find(p => p.id === 'liga-mx');
  const cfg = { vueltas: 1, numGrupos: 1, clasifican: 8, idaVuelta: true, tercerPuesto: false, finalUnica: false };
  const t = torneoDePrueba(mx.equipoIds, 'liga-elim', cfg, [{ nombre: 'General', equipos: mx.equipoIds.slice() }]);
  ok(t.partidos.length === 153, `liga mx: 153 partidos de fase regular (${t.partidos.length})`);
  simular(t, 3);
  const elim = t.partidos.filter(p => p.tipo === 'elim');
  // cuartos 4*2 + semis 2*2 + final 2 (finalUnica:false) = 14
  ok(elim.length === 14, `liga mx: 14 partidos de liguilla (${elim.length})`);
  ok(!!t.campeon, 'liga mx: campeón definido');
}

/* ---------- eliminatoria directa ---------- */
{
  const ids = DATOS.equipos.filter(e => e.tipo === 'seleccion').slice(0, 16).map(e => e.id);
  const cfg = { vueltas: 1, numGrupos: 1, clasifican: 2, idaVuelta: false, tercerPuesto: true, finalUnica: true };
  const t = torneoDePrueba(ids, 'elim', cfg, null, ids.slice());
  ok(t.partidos.length === 8, `elim 16: comienza con 8 partidos (${t.partidos.length})`);
  simular(t, 12);
  ok(t.partidos.length === 16, `elim 16: termina con 16 partidos (${t.partidos.length})`);
  ok(!!t.campeon && !!t.tercero, 'elim: campeón y tercero definidos');
}

/* ---------- validaciones ---------- */
{
  ok(validarConfiguracion('grupos-elim', { numGrupos: 4, clasifican: 2, vueltas: 1 }, 15).length > 0, 'rechaza 15 equipos en 4 grupos');
  ok(validarConfiguracion('grupos-elim', { numGrupos: 4, clasifican: 2, vueltas: 1 }, 16).length === 0, 'acepta 16 en 4 grupos');
  ok(validarConfiguracion('elim', { }, 12).length > 0, 'rechaza eliminatoria de 12');
  ok(validarConfiguracion('elim', { }, 32).length === 0, 'acepta eliminatoria de 32');
  ok(validarConfiguracion('liga-elim', { clasifican: 8, vueltas: 1 }, 6).length > 0, 'rechaza liguilla de 8 con 6 equipos');
}

console.log(`\n${pasadas} pruebas OK, ${falladas} fallas`);
process.exit(falladas ? 1 : 0);

// Pruebas de la lógica pura: node tests/test-logica.js
'use strict';
const L = require('../js/logica.js');

let pasadas = 0;
let falladas = 0;

function ok(condicion, mensaje) {
  if (condicion) { pasadas++; }
  else { falladas++; console.error('  ✗ ' + mensaje); }
}

function igual(real, esperado, mensaje) {
  const r = JSON.stringify(real);
  const e = JSON.stringify(esperado);
  ok(r === e, mensaje + ' — esperado ' + e + ', obtenido ' + r);
}

function seccion(nombre) { console.log('• ' + nombre); }

/* ---------- fechas ---------- */
seccion('Fechas');
igual(L.sumarMeses('2026-01-15', 1), '2026-02-15', 'sumarMeses mes simple');
igual(L.sumarMeses('2026-01-31', 1), '2026-02-28', 'sumarMeses recorta al último día (feb no bisiesto)');
igual(L.sumarMeses('2024-01-31', 1), '2024-02-29', 'sumarMeses respeta bisiesto');
igual(L.sumarMeses('2026-11-30', 3), '2027-02-28', 'sumarMeses cruza el año');
igual(L.sumarMeses('2026-03-31', 12), '2027-03-31', 'sumarMeses año completo');
igual(L.diasEntre('2026-07-24', '2026-07-25'), 1, 'diasEntre un día');
igual(L.diasEntre('2026-07-24', '2026-07-24'), 0, 'diasEntre mismo día');
igual(L.diasEntre('2026-07-24', '2026-07-14'), -10, 'diasEntre negativo');
igual(L.calcularVencimiento('2026-07-24', 12), '2027-07-24', 'calcularVencimiento 12 meses');
igual(L.calcularVencimiento('2026-07-24', 0), null, 'calcularVencimiento 0 = no vence');
igual(L.fechaCorta('2026-07-24'), '24/07/2026', 'fechaCorta');

/* ---------- utilidades ---------- */
seccion('Utilidades');
igual(L.normalizar('Capacitación LEGAL Ñandú'), 'capacitacion legal nandu', 'normalizar quita acentos');
const semilla = (function () { let s = 42; return function () { s = (s * 16807) % 2147483647; return (s % 1000) / 1000; }; })();
const barajado = L.barajar([1, 2, 3, 4, 5], semilla);
igual(barajado.slice().sort(), [1, 2, 3, 4, 5], 'barajar conserva los elementos');
igual(L.barajar([1, 2, 3], function () { return 0; }), [2, 3, 1], 'barajar determinista con rand fijo');
ok(/^CERT-2026-0007$/.test(L.generarFolio('CERT', 2026, 7)), 'generarFolio con relleno');
const codigo = L.codigoVerificacion(function () { return 0.5; });
ok(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(codigo), 'codigoVerificacion con formato XXXX-XXXX-XXXX');
ok(!/[01OIL]/.test(codigo.replace(/-/g, '')), 'codigoVerificacion sin caracteres ambiguos');

/* ---------- evaluaciones ---------- */
seccion('Evaluaciones');
const evaluacion = {
  activa: true,
  notaAprobacion: 70,
  intentosMax: 2,
  preguntas: [
    { id: 'p1', tipo: 'unica', texto: '¿2+2?', opciones: ['3', '4', '5'], correctas: [1] },
    { id: 'p2', tipo: 'multiple', texto: 'Pares', opciones: ['1', '2', '3', '4'], correctas: [1, 3] },
    { id: 'p3', tipo: 'vf', texto: 'El sol es una estrella', opciones: ['Verdadero', 'Falso'], correctas: [0] },
    { id: 'p4', tipo: 'unica', texto: 'Capital de Chile', opciones: ['Lima', 'Santiago'], correctas: [1] }
  ]
};
igual(L.validarEvaluacion(evaluacion), [], 'evaluación válida sin errores');

let r = L.corregirEvaluacion(evaluacion, { p1: [1], p2: [3, 1], p3: [0], p4: [1] });
igual(r.puntaje, 100, 'todo correcto = 100 (orden de marcado no importa)');
ok(r.aprobado, 'aprobado con 100');

r = L.corregirEvaluacion(evaluacion, { p1: [1], p2: [1], p3: [0], p4: [1] });
igual(r.correctas, 3, 'múltiple parcial no cuenta como correcta');
igual(r.puntaje, 75, '3 de 4 = 75');
ok(r.aprobado, 'aprobado con 75 (nota mínima 70)');

r = L.corregirEvaluacion(evaluacion, { p1: [0], p2: [1, 3], p3: [1], p4: [0] });
igual(r.puntaje, 25, '1 de 4 = 25');
ok(!r.aprobado, 'reprobado con 25');

r = L.corregirEvaluacion(evaluacion, {});
igual(r.puntaje, 0, 'sin respuestas = 0');
ok(!r.aprobado, 'sin respuestas no aprueba');

const evalMala = {
  notaAprobacion: 150,
  preguntas: [
    { id: 'q1', tipo: 'unica', texto: '', opciones: ['a'], correctas: [] },
    { id: 'q2', tipo: 'vf', texto: 'x', opciones: ['V', 'F', '?'], correctas: [0, 1] },
    { id: 'q3', tipo: 'multiple', texto: 'y', opciones: ['a', 'b'], correctas: [5] }
  ]
};
const errores = L.validarEvaluacion(evalMala);
ok(errores.length >= 6, 'evaluación inválida acumula errores (' + errores.length + ')');
igual(L.validarEvaluacion({ notaAprobacion: 70, preguntas: [] }), ['La evaluación no tiene preguntas.'], 'sin preguntas');

/* ---------- avance y estados ---------- */
seccion('Avance y estados');
const curso = {
  id: 'c1', titulo: 'Inducción', vigenciaMeses: 12,
  modulos: [{ id: 'm1', titulo: 'A', tipo: 'texto' }, { id: 'm2', titulo: 'B', tipo: 'texto' }],
  evaluacion: evaluacion
};
const cursoSinEval = {
  id: 'c2', titulo: 'Charla', vigenciaMeses: 0,
  modulos: [{ id: 'm1', titulo: 'A', tipo: 'texto' }],
  evaluacion: { activa: false, preguntas: [] }
};

let insc = { id: 'i1', personaId: 'per1', cursoId: 'c1', modulosCompletados: [], intentos: [] };
igual(L.estadoInscripcion(curso, insc, '2026-07-24'), 'pendiente', 'sin actividad = pendiente');
igual(L.avanceCurso(curso, insc).pct, 0, 'avance 0%');
igual(L.avanceCurso(curso, insc).pasosTotales, 3, '2 módulos + evaluación = 3 pasos');

insc.modulosCompletados = ['m1'];
igual(L.estadoInscripcion(curso, insc, '2026-07-24'), 'en_curso', 'con un módulo = en curso');
igual(L.avanceCurso(curso, insc).pct, 33, '1 de 3 pasos = 33%');

insc.modulosCompletados = ['m1', 'm2', 'fantasma'];
igual(L.avanceCurso(curso, insc).modulosHechos, 2, 'módulos eliminados no cuentan');
ok(!L.cursoCompletado(curso, insc), 'falta la evaluación para completar');

insc.intentos = [{ fecha: '2026-07-24', puntaje: 50, aprobado: false }];
igual(L.estadoInscripcion(curso, insc, '2026-07-24'), 'en_curso', 'reprobó pero le queda intento');
igual(L.intentosRestantes(curso, insc), 1, 'queda 1 intento de 2');

insc.intentos.push({ fecha: '2026-07-24', puntaje: 60, aprobado: false });
igual(L.estadoInscripcion(curso, insc, '2026-07-24'), 'reprobado', 'sin intentos y sin aprobar = reprobado');
igual(L.intentosRestantes(curso, insc), 0, '0 intentos restantes');
igual(L.mejorPuntaje(insc), 60, 'mejor puntaje');

insc.intentos.push({ fecha: '2026-07-24', puntaje: 80, aprobado: true });
ok(L.cursoCompletado(curso, insc), 'módulos + evaluación aprobada = completo');
igual(L.avanceCurso(curso, insc).pct, 100, 'avance 100%');

insc.completadoEn = '2026-07-24';
insc.venceEn = L.calcularVencimiento('2026-07-24', curso.vigenciaMeses);
igual(insc.venceEn, '2027-07-24', 'vence a los 12 meses');
igual(L.estadoInscripcion(curso, insc, '2027-07-24'), 'completado', 'el día del vencimiento sigue vigente');
igual(L.estadoInscripcion(curso, insc, '2027-07-25'), 'vencido', 'pasado el vencimiento = vencido');

let insc2 = { id: 'i2', personaId: 'per1', cursoId: 'c2', modulosCompletados: ['m1'], intentos: [] };
ok(L.cursoCompletado(cursoSinEval, insc2), 'curso sin evaluación se completa con los módulos');
igual(L.intentosRestantes(cursoSinEval, insc2), null, 'sin límite de intentos = null');

const cursoIlimitado = { id: 'c3', modulos: [{ id: 'm1' }], evaluacion: { activa: true, notaAprobacion: 70, intentosMax: 0, preguntas: evaluacion.preguntas } };
let insc3 = { id: 'i3', modulosCompletados: [], intentos: [{ puntaje: 10, aprobado: false }, { puntaje: 20, aprobado: false }, { puntaje: 30, aprobado: false }] };
igual(L.estadoInscripcion(cursoIlimitado, insc3, '2026-07-24'), 'en_curso', 'intentos ilimitados nunca reprueban definitivo');

/* ---------- seguimiento y panel ---------- */
seccion('Seguimiento y panel');
const datos = {
  config: {
    categorias: [
      { id: 'cat_legal', nombre: 'Legal y normativa' },
      { id: 'cat_basicos', nombre: 'Cursos básicos' }
    ]
  },
  personas: [
    { id: 'per1', nombre: 'Ana Soto', correo: 'ana@org.cl', area: 'Operaciones', activo: true },
    { id: 'per2', nombre: 'Luis Rojas', correo: 'luis@org.cl', area: 'Ventas', activo: true },
    { id: 'per3', nombre: 'Ex Persona', correo: 'ex@org.cl', area: 'Ventas', activo: false }
  ],
  cursos: [
    Object.assign({}, curso, { categoriaId: 'cat_legal', publicado: true }),
    Object.assign({}, cursoSinEval, { categoriaId: 'cat_basicos', publicado: true })
  ],
  programas: [{ id: 'prog1', nombre: 'Inducción anual' }],
  inscripciones: [
    { id: 'i1', personaId: 'per1', cursoId: 'c1', programaId: 'prog1', modulosCompletados: ['m1', 'm2'], intentos: [{ puntaje: 80, aprobado: true }], completadoEn: '2026-07-01', venceEn: '2026-08-10' },
    { id: 'i2', personaId: 'per2', cursoId: 'c1', programaId: 'prog1', modulosCompletados: [], intentos: [] },
    { id: 'i3', personaId: 'per2', cursoId: 'c2', programaId: null, modulosCompletados: ['m1'], intentos: [], completadoEn: '2024-01-01', venceEn: '2025-01-01' },
    { id: 'i4', personaId: 'per3', cursoId: 'c1', programaId: null, modulosCompletados: [], intentos: [] },
    { id: 'huerfana', personaId: 'nadie', cursoId: 'c1', modulosCompletados: [], intentos: [] }
  ]
};

const filas = L.filasSeguimiento(datos, '2026-07-24');
igual(filas.length, 4, 'inscripciones huérfanas se omiten');
const filaAna = filas.find(function (f) { return f.personaId === 'per1'; });
igual(filaAna.estado, 'completado', 'Ana completó');
igual(filaAna.categoria, 'Legal y normativa', 'categoría resuelta');
igual(filaAna.programa, 'Inducción anual', 'programa resuelto');
igual(filaAna.diasParaVencer, 17, 'días para vencer');
igual(filaAna.puntaje, 80, 'puntaje en fila');

const resumen = L.resumenPanel(datos, '2026-07-24');
igual(resumen.personasActivas, 2, 'personas activas (excluye inactivas)');
igual(resumen.inscripciones, 3, 'panel excluye inscripciones de personas inactivas');
igual(resumen.conteo.completado, 1, 'una completada vigente');
igual(resumen.conteo.vencido, 1, 'una vencida');
igual(resumen.conteo.pendiente, 1, 'una pendiente');
igual(resumen.cumplimientoPct, 33, 'cumplimiento 1/3 = 33%');
igual(resumen.porVencer.length, 1, 'una por vencer en 30 días');
igual(resumen.porVencer[0].persona, 'Ana Soto', 'la de Ana es la que vence pronto');

/* ---------- CSV ---------- */
seccion('CSV');
const csv = L.aCSV(
  [{ clave: 'nombre', titulo: 'Nombre' }, { clave: 'nota', titulo: 'Nota' }],
  [{ nombre: 'Pérez; Juan', nota: 95 }, { nombre: 'Con "comillas"', nota: null }]
);
ok(csv.charCodeAt(0) === 0xFEFF, 'CSV comienza con BOM');
const lineasCsv = csv.slice(1).split('\r\n');
igual(lineasCsv[0], 'Nombre;Nota', 'encabezado con ;');
igual(lineasCsv[1], '"Pérez; Juan";95', 'campo con ; va entre comillas');
igual(lineasCsv[2], '"Con ""comillas""";', 'comillas dobles escapadas y null vacío');

/* ---------- validación de cursos ---------- */
seccion('Validación de cursos');
igual(L.validarCurso(Object.assign({}, curso, { titulo: 'Ok' })), [], 'curso válido');
ok(L.validarCurso({ titulo: '', modulos: [] }).length === 2, 'curso vacío: 2 errores');
ok(L.validarCurso({ titulo: 'X', modulos: [{ id: 'm', titulo: 'V', tipo: 'video' }] })
  .some(function (e) { return e.indexOf('video') !== -1; }), 'módulo video sin fuente');
ok(L.validarCurso({ titulo: 'X', modulos: [{ id: 'm', titulo: 'A', tipo: 'archivo' }] })
  .some(function (e) { return e.indexOf('archivo') !== -1; }), 'módulo archivo sin adjunto');

/* ---------- videos externos ---------- */
seccion('Videos externos');
igual(L.analizarVideoUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
  { tipo: 'youtube', urlInsercion: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ' }, 'youtube watch');
igual(L.analizarVideoUrl('https://youtu.be/dQw4w9WgXcQ').tipo, 'youtube', 'youtu.be');
igual(L.analizarVideoUrl('https://www.youtube.com/watch?t=1&v=dQw4w9WgXcQ').tipo, 'youtube', 'youtube con otros parámetros');
igual(L.analizarVideoUrl('https://vimeo.com/123456789'),
  { tipo: 'vimeo', urlInsercion: 'https://player.vimeo.com/video/123456789' }, 'vimeo');
igual(L.analizarVideoUrl('https://cdn.org/video.mp4').tipo, 'otro', 'enlace directo');
igual(L.analizarVideoUrl('no es url'), null, 'texto sin url = null');
igual(L.analizarVideoUrl(''), null, 'vacío = null');

/* ---------- resultado ---------- */
console.log('');
if (falladas) {
  console.error('✗ ' + falladas + ' prueba(s) fallaron (' + pasadas + ' pasaron).');
  process.exit(1);
} else {
  console.log('✓ Todas las pruebas pasaron (' + pasadas + ').');
}

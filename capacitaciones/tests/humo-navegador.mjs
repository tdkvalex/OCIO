// Prueba de humo end-to-end en un navegador real.
//   npm i -D playwright && npx playwright install chromium
//   node tests/humo-navegador.mjs
// Recorre el flujo completo: crear persona y curso, publicar, asignar, tomar el
// curso como colaborador, rendir la evaluación, emitir y verificar el certificado.
import { chromium } from 'playwright';
import { pathToFileURL } from 'url';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const aqui = dirname(fileURLToPath(import.meta.url));
const BASE = pathToFileURL(join(aqui, '..', 'index.html')).href;
let fallos = 0;
const errores = [];

function ok(cond, msg) {
  if (cond) console.log('  ✓ ' + msg);
  else { fallos++; console.log('  ✗ ' + msg); }
}

const navegador = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);
const ctx = await navegador.newContext();
const pag = await ctx.newPage();
pag.on('pageerror', e => errores.push('pageerror: ' + e.message));
pag.on('console', m => { if (m.type() === 'error') errores.push('console: ' + m.text()); });

await pag.goto(BASE);
await pag.waitForSelector('.inicio', { timeout: 8000 });
console.log('• Pantalla de inicio');
ok(await pag.locator('text=Administrador').isVisible(), 'muestra los dos modos');

// --- modo administrador
await pag.click('[data-accion="irAdmin"]');
await pag.waitForSelector('.nav');
console.log('• Administración');
ok(await pag.locator('.kpi').first().isVisible(), 'panel con indicadores');

// crear persona
await pag.click('[data-accion="pestanaAdmin"][data-valor="personas"]');
await pag.click('[data-accion="nuevaPersona"]');
await pag.waitForSelector('form[data-form="guardarPersona"]');
const fPer = pag.locator('form[data-form="guardarPersona"]');
await fPer.locator('input[name="nombre"]').fill('Ana <script>alert(1)</script> Soto');
await fPer.locator('input[name="correo"]').fill('ana@org.cl');
await fPer.locator('input[name="area"]').fill('Operaciones');
await fPer.locator('button[type="submit"]').click();
await pag.waitForSelector('.fila-lista');
ok((await pag.locator('.fila-lista .nombre').first().textContent()).includes('<script>'), 'nombre con HTML se muestra escapado');
ok(await pag.locator('script:has-text("alert(1)")').count() === 0, 'no se inyectó ningún <script>');

// crear curso con módulo + evaluación
await pag.click('[data-accion="pestanaAdmin"][data-valor="cursos"]');
await pag.click('[data-accion="nuevoCurso"]');
await pag.waitForSelector('form[data-form="guardarCurso"]');
console.log('• Editor de curso');
const fCur = pag.locator('form[data-form="guardarCurso"]');
await fCur.locator('input[name="titulo"]').fill('Prevención de riesgos');
await fCur.locator('textarea[name="descripcion"]').fill('Curso de prueba');
await fCur.locator('input[name="vigenciaMeses"]').fill('12');
await fCur.locator('button[type="submit"]').click();
await pag.waitForTimeout(200);
ok(await pag.evaluate(() => JSON.parse(localStorage.getItem('cap_datos_v1')).cursos[0].titulo) === 'Prevención de riesgos', 'curso guardado');

await pag.click('[data-accion="nuevoModulo"]');
await pag.waitForSelector('form[data-form="guardarModulo"]');
const fMod = pag.locator('form[data-form="guardarModulo"]');
await fMod.locator('input[name="titulo"]').fill('Módulo 1: conceptos');
await fMod.locator('textarea[name="contenido"]').fill('## Introducción\n- Punto uno\n- Punto dos');
await fMod.locator('button[type="submit"]').click();
await pag.waitForTimeout(300);
ok(await pag.locator('text=Módulo 1: conceptos').count() > 0, 'módulo creado');

// enlace inválido debe rechazarse
await pag.click('[data-accion="nuevoModulo"]');
await pag.waitForSelector('form[data-form="guardarModulo"]');
const fMod2 = pag.locator('form[data-form="guardarModulo"]');
await fMod2.locator('input[name="titulo"]').fill('Malo');
await fMod2.locator('select[name="tipo"]').selectOption('enlace');
await fMod2.locator('input[name="enlaceUrl"]').fill('javascript:alert(1)');
await fMod2.locator('button[type="submit"]').click();
await pag.waitForTimeout(300);
ok((await pag.locator('#toast').textContent()).includes('http'), 'enlace javascript: rechazado');
await pag.click('[data-accion="cerrarModal"]');

// activar evaluación y agregar pregunta
await pag.check('[data-accion-cambio="alternarEvaluacion"]');
await pag.waitForTimeout(200);
await pag.click('[data-accion="nuevaPregunta"]');
await pag.fill('textarea[data-accion-entrada="preguntaTexto"]', '¿Cuál es correcta?');
const opciones = pag.locator('input[data-accion-entrada="preguntaOpcion"]');
await opciones.nth(0).fill('Opción A');
await opciones.nth(1).fill('Opción B');
await pag.locator('input[data-accion-cambio="preguntaCorrecta"]').nth(0).check();
await pag.waitForTimeout(150);
await pag.click('[data-accion="preguntaGuardar"]');
await pag.waitForTimeout(300);
ok(await pag.locator('text=¿Cuál es correcta?').count() > 0, 'pregunta creada');

// publicar y asignar
await pag.click('[data-accion="alternarPublicado"]');
await pag.waitForTimeout(300);
ok((await pag.locator('#toast').textContent()).includes('publicado'), 'curso publicado');
await pag.click('[data-accion="asignarPersonas"]');
await pag.waitForSelector('form[data-form="asignarPersonas"]');
const fAsig = pag.locator('form[data-form="asignarPersonas"]');
await fAsig.locator('input[name="p"]').first().check();
await fAsig.locator('button[type="submit"]').click();
await pag.waitForTimeout(300);
ok(await pag.locator('text=Personas asignadas (1)').count() > 0, 'persona asignada');

// --- modo colaborador: tomar el curso completo
await pag.click('[data-accion="salirModo"]');
await pag.click('[data-accion="irColab"]');
await pag.waitForTimeout(200);
console.log('• Colaborador');
await pag.click('[data-accion="elegirPersona"]');
await pag.waitForTimeout(200);
ok(await pag.locator('.tarjeta-curso').count() === 1, 've su capacitación asignada');

await pag.click('.tarjeta-curso');
await pag.waitForTimeout(200);
await pag.click('.modulo-item');
await pag.waitForTimeout(200);
ok(await pag.locator('.contenido-modulo h4').count() > 0, 'contenido del módulo con subtítulos');
await pag.click('[data-accion="completarModulo"]');
await pag.waitForTimeout(300);
ok(await pag.locator('text=Rendir evaluación').count() > 0, 'evaluación habilitada tras completar módulos');

await pag.click('[data-accion="comenzarExamen"]');
await pag.waitForTimeout(200);
await pag.locator('input[data-exam-pregunta]').nth(0).check();
await pag.waitForTimeout(150);
ok(await pag.locator('#contador-respondidas').textContent() === '1', 'el contador registra la respuesta (el clic no se pierde)');
await pag.click('[data-accion="entregarExamen"]');
await pag.waitForTimeout(400);
ok(await pag.locator('text=¡Evaluación aprobada!').count() > 0, 'evaluación aprobada');
ok(await pag.locator('[data-accion="verCertificado"]').count() > 0, 'certificado emitido automáticamente');

await pag.click('[data-accion="verCertificado"]');
await pag.waitForTimeout(300);
ok(await pag.locator('.vista-certificado svg').count() > 0, 'certificado se dibuja');
const svgTexto = await pag.locator('.vista-certificado svg').innerHTML();
ok(svgTexto.includes('&lt;script&gt;') || !svgTexto.includes('<script>'), 'certificado escapa el nombre con HTML');
await pag.click('[data-accion="cerrarModal"]');
await pag.waitForTimeout(200);
// salir de la pantalla de resultados para volver a la navegación
await pag.click('[data-accion="salirExamen"]');
await pag.waitForTimeout(200);

// certificados del colaborador
await pag.click('[data-accion="pestanaColab"][data-valor="certificados"]');
await pag.waitForTimeout(200);
ok(await pag.locator('text=Vigente').count() > 0, 'certificado vigente en la pestaña del colaborador');

// --- verificación y exportación en administración
await pag.click('[data-accion="salirModo"]');
await pag.click('[data-accion="irAdmin"]');
await pag.click('[data-accion="pestanaAdmin"][data-valor="seguimiento"]');
await pag.waitForTimeout(300);
console.log('• Seguimiento');
ok(await pag.locator('.chip.completado').count() > 0, 'seguimiento muestra la inscripción completada');

await pag.click('[data-accion="pestanaAdmin"][data-valor="certificados"]');
await pag.waitForTimeout(200);
const folio = (await pag.locator('table tbody tr td').first().textContent()).trim();
await pag.locator('form[data-form="verificarCertificado"] input[name="codigo"]').fill(folio);
await pag.click('form[data-form="verificarCertificado"] button[type="submit"]');
await pag.waitForTimeout(300);
ok(await pag.locator('text=válido').count() > 0, 'verificador encuentra el certificado por folio');
await pag.click('[data-accion="cerrarModal"]');

// persistencia tras recarga
await pag.reload();
await pag.waitForTimeout(500);
console.log('• Persistencia');
ok(await pag.locator('.nav').count() > 0, 'reabre en el último modo usado');
const datos = await pag.evaluate(() => JSON.parse(localStorage.getItem('cap_datos_v1')));
ok(datos.cursos.length === 1 && datos.certificados.length === 1, 'datos persistidos en localStorage');
ok(datos.inscripciones[0].completadoEn && datos.inscripciones[0].venceEn, 'inscripción cerrada con vencimiento');
ok(datos.config.ia.clave === '', 'sin clave de API guardada');

// importación de un respaldo inválido
await pag.click('[data-accion="pestanaAdmin"][data-valor="ajustes"]');
await pag.waitForTimeout(200);
const malo = await pag.evaluate(() => {
  try { Almacen.importarJSON('{"cursos":[],"personas":"no-es-arreglo"}'); return 'aceptado'; }
  catch (e) { return e.message; }
});
ok(malo.includes('respaldo'), 'respaldo malformado rechazado');

// --- datos de ejemplo + ficha de persona (contexto limpio)
console.log('• Datos de ejemplo y ficha de persona');
const ctx2 = await navegador.newContext();
const pag2 = await ctx2.newPage();
pag2.on('pageerror', e => errores.push('pageerror(ej): ' + e.message));
await pag2.goto(BASE);
await pag2.waitForSelector('.inicio');
await pag2.click('[data-accion="irAdmin"]');
await pag2.waitForSelector('.nav');
await pag2.click('[data-accion="cargarEjemplo"]');
await pag2.waitForTimeout(400);
const resumen = await pag2.evaluate(() => {
  const d = JSON.parse(localStorage.getItem('cap_datos_v1'));
  return { personas: d.personas.length, cursos: d.cursos.length, programas: d.programas.length,
    inscripciones: d.inscripciones.length, certificados: d.certificados.length };
});
ok(resumen.personas === 4 && resumen.cursos === 3 && resumen.programas === 1, 'ejemplo: 4 personas, 3 cursos, 1 programa');
ok(resumen.inscripciones === 9 && resumen.certificados === 3, 'ejemplo: 9 inscripciones y 3 certificados');
ok(await pag2.locator('text=Cumplimiento por categoría').count() > 0, 'panel muestra cumplimiento por categoría');
ok(await pag2.locator('text=Vencen en los próximos 30 días').count() > 0 &&
   await pag2.locator('.tarjeta:has-text("Vencen en los próximos") .fila-lista').count() === 1, 'una capacitación por vencer (Ana)');
ok(await pag2.locator('.tarjeta:has-text("Capacitaciones vencidas") .fila-lista').count() === 1, 'una capacitación vencida (Luis)');

await pag2.click('[data-accion="pestanaAdmin"][data-valor="personas"]');
await pag2.waitForTimeout(200);
await pag2.locator('[data-accion="fichaPersona"]').first().click();
await pag2.waitForTimeout(300);
ok(await pag2.locator('.modal h3:has-text("Ficha de")').count() > 0, 'ficha de persona se abre');
ok(await pag2.locator('.modal .chip.completado').count() > 0, 'ficha muestra el resumen de estados');
ok(await pag2.locator('.modal [data-accion="exportarCSVPersona"]').count() > 0, 'ficha permite exportar el historial');
await ctx2.close();

console.log('');
if (errores.length) { console.log('ERRORES DE PÁGINA:'); errores.forEach(e => console.log('  ! ' + e)); }
console.log(fallos ? `✗ ${fallos} comprobación(es) fallaron` : '✓ Prueba de humo completa sin fallos');
await navegador.close();
process.exit(fallos || errores.length ? 1 : 0);

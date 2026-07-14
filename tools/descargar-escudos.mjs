#!/usr/bin/env node
/* =========================================================================
   Descarga los escudos ORIGINALES que faltan (clubes, selecciones e
   insignias de torneos) desde TheSportsDB (API pública y gratuita) y los
   incrusta en js/escudos-extra.js como data-URIs (funcionan sin internet).

   Uso:  node tools/descargar-escudos.mjs [--selecciones]
     --selecciones  además descarga los escudos de federaciones nacionales
                    (por defecto las selecciones usan su bandera oficial)

   Requiere Node 18+ y una red SIN restricciones hacia thesportsdb.com.
   ========================================================================= */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const RAIZ = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://www.thesportsdb.com/api/v1/json/3';
const LIMITE = 512 * 1024;          // tamaño máximo por escudo (se optimizan después)
const PAUSA = 1200;                 // ms entre llamadas (respeta la API)
const conSelecciones = process.argv.includes('--selecciones');

const ctx = { console, window: {} };
vm.createContext(ctx);
for (const f of ['js/data.js', 'js/escudos.js', 'js/escudos-extra.js']) {
  try {
    vm.runInContext(fs.readFileSync(path.join(RAIZ, f), 'utf8'), ctx, { filename: f });
  } catch (e) { /* escudos-extra puede no existir */ }
}
const { DATOS, ESCUDOS } = ctx;
const PREVIOS = ctx.ESCUDOS_EXTRA || {};

/* Nombres de búsqueda en inglés cuando difieren del nombre en español */
const CONSULTAS = {
  'c-atletico-de-madrid': 'Atletico Madrid', 'c-athletic-club': 'Athletic Bilbao',
  'c-celta-de-vigo': 'Celta Vigo', 'c-alaves': 'Alaves', 'c-cadiz': 'Cadiz',
  'c-inter-de-milan': 'Inter Milan', 'c-milan': 'AC Milan', 'c-napoles': 'Napoli',
  'c-bayern-munich': 'Bayern Munich', 'c-eintracht-francfort': 'Eintracht Frankfurt',
  'c-wolfsburgo': 'Wolfsburg', 'c-borussia-monchengladbach': 'Borussia Monchengladbach',
  'c-friburgo': 'Freiburg', 'c-colonia': 'FC Koln', 'c-hamburgo': 'Hamburger SV',
  'c-maguncia-05': 'Mainz 05', 'c-augsburgo': 'Augsburg', 'c-union-berlin': 'Union Berlin',
  'c-paris-saint-germain': 'Paris Saint-Germain', 'c-marsella': 'Marseille',
  'c-monaco': 'Monaco', 'c-niza': 'Nice', 'c-saint-etienne': 'Saint-Etienne',
  'c-sporting-de-lisboa': 'Sporting CP', 'c-vitoria-de-guimaraes': 'Vitoria Guimaraes',
  'c-club-brujas': 'Club Brugge', 'c-gante': 'Gent',
  'c-estrella-roja': ['Red Star Belgrade', 'Crvena Zvezda'], 'c-dinamo-de-kiev': ['Dynamo Kyiv', 'Dynamo Kiev'],
  'c-copenhague': 'FC Copenhagen', 'c-basilea': 'Basel', 'c-aek-atenas': 'AEK Athens',
  'c-spartak-moscu': 'Spartak Moscow', 'c-cska-moscu': 'CSKA Moscow',
  'c-dinamo-moscu': 'Dynamo Moscow', 'c-legia-varsovia': 'Legia Warsaw',
  'c-lech-poznan': 'Lech Poznan', 'c-red-bull-salzburgo': 'Red Bull Salzburg',
  'c-rapid-viena': 'Rapid Vienna', 'c-slavia-praga': 'Slavia Prague',
  'c-sparta-praga': 'Sparta Prague', 'c-malmo-ff': 'Malmo FF', 'c-bodo-glimt': 'Bodo Glimt',
  'c-fenerbahce': 'Fenerbahce', 'c-besiktas': 'Besiktas',
  'c-velez-sarsfield': 'Velez Sarsfield', 'c-lanus': 'Lanus', 'c-huracan': 'Huracan',
  'c-colon': 'Colon de Santa Fe', 'c-union-de-santa-fe': 'Union de Santa Fe',
  'c-gimnasia-la-plata': 'Gimnasia de La Plata', 'c-talleres': 'Talleres de Cordoba',
  'c-sao-paulo': 'Sao Paulo', 'c-gremio': 'Gremio', 'c-atletico-mineiro': 'Atletico Mineiro',
  'c-vitoria': 'Vitoria', 'c-penarol': 'Penarol', 'c-nacional': 'Nacional Montevideo',
  'c-liverpool-de-montevideo': 'Liverpool Montevideo',
  'c-universidad-catolica': 'Universidad Catolica', 'c-union-espanola': 'Union Espanola',
  'c-everton-de-vina-del-mar': 'Everton de Vina del Mar', 'c-nublense': 'Nublense',
  'c-union-la-calera': 'Union La Calera', 'c-atletico-nacional': 'Atletico Nacional',
  'c-america-de-cali': 'America de Cali', 'c-junior': 'Atletico Junior',
  'c-independiente-medellin': 'Independiente Medellin',
  'c-universitario': 'Universitario de Deportes', 'c-melgar': 'FBC Melgar',
  'c-cerro-porteno': 'Cerro Porteno', 'c-guarani': 'Club Guarani',
  'c-olimpia': 'Olimpia Asuncion', 'c-bolivar': 'Club Bolivar',
  'c-deportivo-tachira': 'Deportivo Tachira', 'c-estudiantes-de-merida': 'Estudiantes de Merida',
  'c-club-america': 'Club America', 'c-chivas-guadalajara': 'Guadalajara',
  'c-leon': 'Club Leon', 'c-queretaro': 'Queretaro', 'c-tijuana': 'Club Tijuana',
  'c-fc-juarez': 'FC Juarez', 'c-mazatlan': 'Mazatlan FC',
  'c-atletico-san-luis': 'Atletico San Luis', 'c-cf-montreal': 'CF Montreal',
  'c-saprissa': 'Deportivo Saprissa', 'c-olimpia-de-honduras': 'CD Olimpia',
  'c-municipal': 'CSD Municipal', 'c-aguila': 'CD Aguila', 'c-tauro-fc': 'Tauro',
  'c-al-ahli-saudi': ['Al-Ahli Saudi FC', 'Al-Ahli Jeddah', 'Al-Ahli'],
  'c-al-hilal': ['Al-Hilal Saudi FC', 'Al-Hilal FC', 'Al Hilal'],
  'c-al-nassr': ['Al-Nassr FC', 'Al Nassr'],
  'c-al-ittihad': ['Al-Ittihad FC', 'Al-Ittihad Jeddah', 'Al Ittihad'],
  'c-al-sadd': ['Al-Sadd SC', 'Al Sadd'],
  'c-al-duhail': ['Al-Duhail SC', 'Al Duhail'],
  'c-shabab-al-ahli': ['Shabab Al-Ahli Dubai', 'Shabab Al Ahli'],
  'c-zenit': ['Zenit St. Petersburg', 'Zenit Saint Petersburg', 'Zenit'],
  'c-colo-colo': ['Colo Colo', 'Colo-Colo'],
  'c-o-higgins': ["O'Higgins FC", "O'Higgins", 'OHiggins'],
  'c-san-lorenzo': ['San Lorenzo de Almagro', 'San Lorenzo'],
  'c-atletico-nacional': ['Atletico Nacional', 'Atletico Nacional Medellin'],
  'c-olimpia': ['Club Olimpia', 'Olimpia Asuncion', 'Olimpia'],
  'c-the-strongest': ['The Strongest La Paz', 'The Strongest'],
  'c-municipal': ['CSD Municipal', 'Municipal Guatemala'],
  'c-union-saint-gilloise': ['Union Saint-Gilloise', 'Royale Union Saint-Gilloise', 'Union SG'], 'c-fc-seul': 'FC Seoul',
  'c-jeonbuk-hyundai': ['Jeonbuk Hyundai Motors', 'Jeonbuk Motors', 'Jeonbuk FC'],
  'c-ulsan-hd': ['Ulsan Hyundai', 'Ulsan HD FC', 'Ulsan'],
  'c-shanghai-port': 'Shanghai Port', 'c-al-ain': 'Al Ain',
  'c-esperance-de-tunez': 'Esperance de Tunis', 'c-etoile-du-sahel': 'Etoile du Sahel',
  'c-yokohama-f-marinos': 'Yokohama F Marinos'
};
const SELECCIONES_EN = {
  'Inglaterra': 'England', 'Escocia': 'Scotland', 'Gales': 'Wales',
  'Irlanda del Norte': 'Northern Ireland', 'Estados Unidos': 'USA',
  'Corea del Sur': 'South Korea', 'Corea del Norte': 'North Korea',
  'Costa de Marfil': 'Ivory Coast', 'RD Congo': 'DR Congo', 'Congo': 'Congo',
  'Cabo Verde': 'Cape Verde', 'China Taipéi': 'Chinese Taipei', 'Tahití': 'Tahiti'
};
const LIGAS = {
  't-mundial': ['FIFA World Cup'],
  't-champions': ['UEFA Champions League'],
  't-libertadores': ['CONMEBOL Copa Libertadores', 'Copa Libertadores'],
  't-sudamericana': ['CONMEBOL Copa Sudamericana', 'Copa Sudamericana'],
  't-confederaciones': ['FIFA Confederations Cup'],
  't-copa-america': ['CONMEBOL Copa America', 'Copa America'],
  't-eurocopa': ['UEFA European Championships', 'UEFA Euro'],
  't-copa-africana': ['Africa Cup of Nations', 'CAF Africa Cup of Nations'],
  't-copa-asiatica': ['AFC Asian Cup'],
  't-copa-oro': ['CONCACAF Gold Cup'],
  't-mundial-clubes': ['FIFA Club World Cup'],
  't-premier': ['English Premier League'],
  't-laliga': ['Spanish La Liga'],
  't-serie-a': ['Italian Serie A'],
  't-bundesliga': ['German Bundesliga'],
  't-liga-chilena': ['Chilean Primera Division'],
  't-brasileirao': ['Brazilian Serie A'],
  't-liga-argentina': ['Argentinian Primera Division'],
  't-liga-mx': ['Mexican Primera League', 'Liga MX']
};

const espera = ms => new Promise(r => setTimeout(r, ms));
const norm = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

async function json(url) {
  for (let intento = 0; intento < 3; intento++) {
    try {
      const r = await fetch(url);
      if (r.status === 429) { await espera(5000); continue; }
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { await espera(3000); }
  }
  return null;
}
async function comoDataURI(url) {
  for (const variante of [url + '/small', url]) {
    try {
      const r = await fetch(variante);
      if (!r.ok) continue;
      const buf = Buffer.from(await r.arrayBuffer());
      if (!buf.length || buf.length > LIMITE) continue;
      const tipo = r.headers.get('content-type') || 'image/png';
      return `data:${tipo.split(';')[0]};base64,${buf.toString('base64')}`;
    } catch (e) { /* siguiente variante */ }
  }
  return null;
}

const extra = Object.assign({}, PREVIOS);
let hechos = 0, fallos = [];

async function buscarEquipo(consultas) {
  let primero = null;
  for (const consulta of [].concat(consultas)) {
    const d = await json(`${API}/searchteams.php?t=${encodeURIComponent(consulta)}`);
    const equipos = (d && d.teams) || [];
    const futbol = equipos.filter(t => t.strSport === 'Soccer');
    const exacto = futbol.find(t => norm(t.strTeam) === norm(consulta));
    if (exacto) return exacto.strBadge || exacto.strTeamBadge || null;
    if (!primero && futbol[0]) primero = futbol[0].strBadge || futbol[0].strTeamBadge || null;
    await espera(PAUSA / 2);
  }
  return primero;
}

/* ---------- Clubes (y selecciones con --selecciones) ---------- */
const displayEN = new Intl.DisplayNames(['en'], { type: 'region' });
const isoPorNombre = new Map();
DATOS.SELECCIONES.forEach(([, lista]) =>
  lista.forEach(([nombre, iso]) => isoPorNombre.set(nombre, iso)));

const pendientes = DATOS.equipos.filter(e => {
  if ((ESCUDOS[e.id] || PREVIOS[e.id]) && e.tipo === 'club') return false; // ya tiene original
  if (e.tipo === 'seleccion' && (!conSelecciones || PREVIOS[e.id])) return false;
  return true;
});
console.log(`Equipos por buscar: ${pendientes.length} (esto tomará ~${Math.round(pendientes.length * (PAUSA + 800) / 60000)} min)`);

for (const e of pendientes) {
  let consulta = CONSULTAS[e.id] || e.nombre;
  if (e.tipo === 'seleccion') {
    const iso = isoPorNombre.get(e.nombre);
    consulta = SELECCIONES_EN[e.nombre] || (iso ? displayEN.of(iso) : e.nombre);
  }
  const badge = await buscarEquipo(consulta);
  await espera(PAUSA);
  if (badge) {
    const uri = await comoDataURI(badge);
    await espera(PAUSA / 2);
    if (uri) { extra[e.id] = uri; hechos++; process.stdout.write(`  ✓ ${e.nombre}\n`); continue; }
  }
  fallos.push(e.nombre);
}

/* ---------- Insignias de torneos ---------- */
const todas = await json(`${API}/all_leagues.php`);
const listado = (todas && todas.leagues) || [];
for (const [clave, candidatos] of Object.entries(LIGAS)) {
  if (ESCUDOS[clave] || PREVIOS[clave]) continue;
  let liga = null;
  for (const c of candidatos) {
    const palabras = norm(c).split(/\s+/);
    liga = listado.find(l => norm(l.strLeague) === norm(c)) ||
      listado.find(l => norm(l.strLeague).includes(norm(c))) ||
      listado.find(l => { const nl = norm(l.strLeague); return palabras.every(p => nl.includes(p)); });
    if (liga) break;
  }
  if (!liga) { fallos.push(clave); continue; }
  const det = await json(`${API}/lookupleague.php?id=${liga.idLeague}`);
  await espera(PAUSA);
  const badge = det && det.leagues && det.leagues[0] &&
    (det.leagues[0].strBadge || det.leagues[0].strLogo);
  if (badge) {
    const uri = await comoDataURI(badge);
    if (uri) { extra[clave] = uri; hechos++; process.stdout.write(`  ✓ ${clave}\n`); continue; }
  }
  fallos.push(clave);
}

/* ---------- Escribir ---------- */
let js = "'use strict';\n/* Generado por tools/descargar-escudos.mjs — escudos originales (TheSportsDB). */\nvar ESCUDOS_EXTRA = {\n";
js += Object.entries(extra).map(([k, v]) => JSON.stringify(k) + ':' + JSON.stringify(v)).join(',\n');
js += '\n};\n';
fs.writeFileSync(path.join(RAIZ, 'js', 'escudos-extra.js'), js);
console.log(`\n${hechos} escudos descargados → js/escudos-extra.js`);
if (fallos.length) console.log(`Sin resultado (${fallos.length}): ${fallos.join(', ')}`);
console.log('Ahora ejecuta ./build.sh para regenerar dist/torneos-futbol.html');

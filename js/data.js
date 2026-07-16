'use strict';
/* =========================================================================
   DATOS — Selecciones nacionales (por continente), clubes (por país)
   y plantillas de torneos predefinidos.
   ========================================================================= */
var DATOS = (function () {

  // Convierte un código ISO de 2 letras en emoji de bandera
  function flag(iso) {
    return iso.toUpperCase().replace(/./g, function (c) {
      return String.fromCodePoint(127397 + c.charCodeAt(0));
    });
  }

  /* ---------------- SELECCIONES NACIONALES ----------------
     Formato: [nombre, iso]  ó  [nombre, null, emojiDirecto]           */
  var SELECCIONES = [
    ['Europa', [
      ['Albania', 'AL'], ['Alemania', 'DE'], ['Andorra', 'AD'], ['Armenia', 'AM'],
      ['Austria', 'AT'], ['Azerbaiyán', 'AZ'], ['Bélgica', 'BE'], ['Bielorrusia', 'BY'],
      ['Bosnia y Herzegovina', 'BA'], ['Bulgaria', 'BG'], ['Chipre', 'CY'], ['Croacia', 'HR'],
      ['Dinamarca', 'DK'], ['Escocia', null, '🏴󠁧󠁢󠁳󠁣󠁴󠁿'], ['Eslovaquia', 'SK'], ['Eslovenia', 'SI'],
      ['España', 'ES'], ['Estonia', 'EE'], ['Finlandia', 'FI'], ['Francia', 'FR'],
      ['Gales', null, '🏴󠁧󠁢󠁷󠁬󠁳󠁿'], ['Georgia', 'GE'], ['Gibraltar', 'GI'], ['Grecia', 'GR'],
      ['Hungría', 'HU'], ['Inglaterra', null, '🏴󠁧󠁢󠁥󠁮󠁧󠁿'], ['Irlanda', 'IE'],
      ['Irlanda del Norte', null, '🇬🇧'], ['Islandia', 'IS'], ['Islas Feroe', 'FO'],
      ['Israel', 'IL'], ['Italia', 'IT'], ['Kazajistán', 'KZ'], ['Kosovo', 'XK'],
      ['Letonia', 'LV'], ['Liechtenstein', 'LI'], ['Lituania', 'LT'], ['Luxemburgo', 'LU'],
      ['Macedonia del Norte', 'MK'], ['Malta', 'MT'], ['Moldavia', 'MD'], ['Montenegro', 'ME'],
      ['Noruega', 'NO'], ['Países Bajos', 'NL'], ['Polonia', 'PL'], ['Portugal', 'PT'],
      ['República Checa', 'CZ'], ['Rumania', 'RO'], ['Rusia', 'RU'], ['San Marino', 'SM'],
      ['Serbia', 'RS'], ['Suecia', 'SE'], ['Suiza', 'CH'], ['Turquía', 'TR'], ['Ucrania', 'UA']
    ]],
    ['Sudamérica', [
      ['Argentina', 'AR'], ['Bolivia', 'BO'], ['Brasil', 'BR'], ['Chile', 'CL'],
      ['Colombia', 'CO'], ['Ecuador', 'EC'], ['Paraguay', 'PY'], ['Perú', 'PE'],
      ['Uruguay', 'UY'], ['Venezuela', 'VE']
    ]],
    ['Norte y Centroamérica', [
      ['Anguila', 'AI'], ['Antigua y Barbuda', 'AG'], ['Aruba', 'AW'], ['Bahamas', 'BS'],
      ['Barbados', 'BB'], ['Belice', 'BZ'], ['Bermudas', 'BM'], ['Bonaire', 'BQ'],
      ['Canadá', 'CA'], ['Costa Rica', 'CR'], ['Cuba', 'CU'], ['Curazao', 'CW'],
      ['Dominica', 'DM'], ['El Salvador', 'SV'], ['Estados Unidos', 'US'], ['Granada', 'GD'],
      ['Guadalupe', 'GP'], ['Guatemala', 'GT'], ['Guayana Francesa', 'GF'], ['Guyana', 'GY'],
      ['Haití', 'HT'], ['Honduras', 'HN'], ['Islas Caimán', 'KY'],
      ['Islas Turcas y Caicos', 'TC'], ['Islas Vírgenes Británicas', 'VG'],
      ['Islas Vírgenes de EE. UU.', 'VI'], ['Jamaica', 'JM'], ['Martinica', 'MQ'],
      ['México', 'MX'], ['Montserrat', 'MS'], ['Nicaragua', 'NI'], ['Panamá', 'PA'],
      ['Puerto Rico', 'PR'], ['República Dominicana', 'DO'],
      ['San Cristóbal y Nieves', 'KN'], ['San Martín', 'SX'],
      ['San Vicente y las Granadinas', 'VC'], ['Santa Lucía', 'LC'], ['Surinam', 'SR'],
      ['Trinidad y Tobago', 'TT']
    ]],
    ['África', [
      ['Angola', 'AO'], ['Argelia', 'DZ'], ['Benín', 'BJ'], ['Botsuana', 'BW'],
      ['Burkina Faso', 'BF'], ['Burundi', 'BI'], ['Cabo Verde', 'CV'], ['Camerún', 'CM'],
      ['Chad', 'TD'], ['Comoras', 'KM'], ['Congo', 'CG'], ['Costa de Marfil', 'CI'],
      ['Egipto', 'EG'], ['Eritrea', 'ER'], ['Esuatini', 'SZ'], ['Etiopía', 'ET'],
      ['Gabón', 'GA'], ['Gambia', 'GM'], ['Ghana', 'GH'], ['Guinea', 'GN'],
      ['Guinea Ecuatorial', 'GQ'], ['Guinea-Bisáu', 'GW'], ['Kenia', 'KE'], ['Lesoto', 'LS'],
      ['Liberia', 'LR'], ['Libia', 'LY'], ['Madagascar', 'MG'], ['Malaui', 'MW'],
      ['Malí', 'ML'], ['Marruecos', 'MA'], ['Mauricio', 'MU'], ['Mauritania', 'MR'],
      ['Mozambique', 'MZ'], ['Namibia', 'NA'], ['Níger', 'NE'], ['Nigeria', 'NG'],
      ['RD Congo', 'CD'], ['República Centroafricana', 'CF'], ['Ruanda', 'RW'],
      ['Santo Tomé y Príncipe', 'ST'], ['Senegal', 'SN'], ['Seychelles', 'SC'],
      ['Sierra Leona', 'SL'], ['Somalia', 'SO'], ['Sudáfrica', 'ZA'], ['Sudán', 'SD'],
      ['Sudán del Sur', 'SS'], ['Tanzania', 'TZ'], ['Togo', 'TG'], ['Túnez', 'TN'],
      ['Uganda', 'UG'], ['Yibuti', 'DJ'], ['Zambia', 'ZM'], ['Zimbabue', 'ZW']
    ]],
    ['Asia', [
      ['Afganistán', 'AF'], ['Arabia Saudita', 'SA'], ['Baréin', 'BH'], ['Bangladés', 'BD'],
      ['Brunéi', 'BN'], ['Bután', 'BT'], ['Camboya', 'KH'], ['Catar', 'QA'], ['China', 'CN'],
      ['China Taipéi', 'TW'], ['Corea del Norte', 'KP'], ['Corea del Sur', 'KR'],
      ['Emiratos Árabes Unidos', 'AE'], ['Filipinas', 'PH'], ['Guam', 'GU'],
      ['Hong Kong', 'HK'], ['India', 'IN'], ['Indonesia', 'ID'], ['Irak', 'IQ'],
      ['Irán', 'IR'], ['Japón', 'JP'], ['Jordania', 'JO'], ['Kirguistán', 'KG'],
      ['Kuwait', 'KW'], ['Laos', 'LA'], ['Líbano', 'LB'], ['Macao', 'MO'],
      ['Malasia', 'MY'], ['Maldivas', 'MV'], ['Mongolia', 'MN'], ['Myanmar', 'MM'],
      ['Nepal', 'NP'], ['Omán', 'OM'], ['Pakistán', 'PK'], ['Palestina', 'PS'],
      ['Singapur', 'SG'], ['Siria', 'SY'], ['Sri Lanka', 'LK'], ['Tailandia', 'TH'],
      ['Tayikistán', 'TJ'], ['Timor Oriental', 'TL'], ['Turkmenistán', 'TM'],
      ['Uzbekistán', 'UZ'], ['Vietnam', 'VN'], ['Yemen', 'YE']
    ]],
    ['Oceanía', [
      ['Australia', 'AU'], ['Fiyi', 'FJ'], ['Islas Cook', 'CK'], ['Islas Salomón', 'SB'],
      ['Nueva Caledonia', 'NC'], ['Nueva Zelanda', 'NZ'], ['Papúa Nueva Guinea', 'PG'],
      ['Samoa', 'WS'], ['Samoa Americana', 'AS'], ['Tahití', 'PF'], ['Tonga', 'TO'],
      ['Vanuatu', 'VU']
    ]]
  ];

  /* ---------------- CLUBES POR PAÍS ----------------
     Formato: [país, isoPaís, [ [nombre, siglas, color1, color2], ... ]]   */
  var CLUBES = [
    ['España', 'ES', [
      ['Real Madrid', 'RMA', '#f5f5f5', '#d4af37'],
      ['FC Barcelona', 'BAR', '#a50044', '#004d98'],
      ['Atlético de Madrid', 'ATM', '#cb3524', '#f5f5f5'],
      ['Sevilla', 'SEV', '#f5f5f5', '#d8001d'],
      ['Valencia', 'VAL', '#f5f5f5', '#ee3524'],
      ['Villarreal', 'VIL', '#ffe667', '#005187'],
      ['Real Sociedad', 'RSO', '#0067b1', '#f5f5f5'],
      ['Athletic Club', 'ATH', '#ee2523', '#f5f5f5'],
      ['Real Betis', 'BET', '#00954c', '#f5f5f5'],
      ['Celta de Vigo', 'CEL', '#8ac3ee', '#f5f5f5'],
      ['Getafe', 'GET', '#005999', '#f5f5f5'],
      ['Osasuna', 'OSA', '#d91a21', '#0a346f'],
      ['Espanyol', 'ESP', '#007fc8', '#f5f5f5'],
      ['Rayo Vallecano', 'RAY', '#f5f5f5', '#e53027'],
      ['Mallorca', 'MLL', '#e20613', '#111111'],
      ['Girona', 'GIR', '#cd2534', '#f5f5f5'],
      ['Alavés', 'ALA', '#0761af', '#f5f5f5'],
      ['Las Palmas', 'LPA', '#ffe400', '#004b9d'],
      ['Cádiz', 'CAD', '#ffe500', '#0045a2'],
      ['Granada', 'GRA', '#a61b2b', '#f5f5f5'],
      ['Levante', 'LEV', '#005ca9', '#ad0c32'],
      ['Real Valladolid', 'VLL', '#921e81', '#f5f5f5']
    ]],
    ['Inglaterra', 'GB', [
      ['Manchester City', 'MCI', '#6cabdd', '#f5f5f5'],
      ['Manchester United', 'MUN', '#da291c', '#fbe122'],
      ['Liverpool', 'LIV', '#c8102e', '#f6eb61'],
      ['Chelsea', 'CHE', '#034694', '#f5f5f5'],
      ['Arsenal', 'ARS', '#ef0107', '#f5f5f5'],
      ['Tottenham Hotspur', 'TOT', '#f5f5f5', '#132257'],
      ['Newcastle United', 'NEW', '#241f20', '#f5f5f5'],
      ['Aston Villa', 'AVL', '#670e36', '#95bfe5'],
      ['West Ham United', 'WHU', '#7a263a', '#1bb1e7'],
      ['Everton', 'EVE', '#003399', '#f5f5f5'],
      ['Leicester City', 'LEI', '#003090', '#fdbe11'],
      ['Brighton', 'BHA', '#0057b8', '#f5f5f5'],
      ['Wolverhampton', 'WOL', '#fdb913', '#231f20'],
      ['Nottingham Forest', 'NFO', '#dd0000', '#f5f5f5'],
      ['Crystal Palace', 'CRY', '#1b458f', '#c4122e'],
      ['Fulham', 'FUL', '#f5f5f5', '#111111'],
      ['Leeds United', 'LEE', '#f5f5f5', '#1d428a'],
      ['Brentford', 'BRE', '#e30613', '#f5f5f5'],
      ['Southampton', 'SOU', '#d71920', '#f5f5f5'],
      ['Burnley', 'BUR', '#6c1d45', '#99d6ea']
    ]],
    ['Italia', 'IT', [
      ['Juventus', 'JUV', '#f5f5f5', '#111111'],
      ['Inter de Milán', 'INT', '#0068a8', '#221f20'],
      ['Milan', 'MIL', '#fb090b', '#111111'],
      ['Nápoles', 'NAP', '#12a0d7', '#f5f5f5'],
      ['Roma', 'ROM', '#8e1f2f', '#f0bc42'],
      ['Lazio', 'LAZ', '#87d8f7', '#f5f5f5'],
      ['Atalanta', 'ATA', '#1e71b8', '#111111'],
      ['Fiorentina', 'FIO', '#482e92', '#f5f5f5'],
      ['Torino', 'TOR', '#881f19', '#f5f5f5'],
      ['Bologna', 'BOL', '#1a2f48', '#d4001f'],
      ['Genoa', 'GEN', '#ad1919', '#00223b'],
      ['Sampdoria', 'SAM', '#0053a0', '#f5f5f5'],
      ['Parma', 'PRM', '#ffe12c', '#004c99'],
      ['Udinese', 'UDI', '#111111', '#f5f5f5'],
      ['Cagliari', 'CAG', '#ad002a', '#00205b'],
      ['Hellas Verona', 'VER', '#ffd700', '#003399'],
      ['Empoli', 'EMP', '#0060ac', '#f5f5f5'],
      ['Lecce', 'LEC', '#ffd700', '#da291c'],
      ['Sassuolo', 'SAS', '#00a752', '#111111'],
      ['Monza', 'MON', '#e30613', '#f5f5f5']
    ]],
    ['Alemania', 'DE', [
      ['Bayern Múnich', 'BAY', '#dc052d', '#f5f5f5'],
      ['Borussia Dortmund', 'BVB', '#fde100', '#111111'],
      ['RB Leipzig', 'RBL', '#dd0741', '#f5f5f5'],
      ['Bayer Leverkusen', 'B04', '#e32221', '#111111'],
      ['Eintracht Fráncfort', 'SGE', '#e1000f', '#111111'],
      ['Stuttgart', 'VFB', '#f5f5f5', '#e32219'],
      ['Wolfsburgo', 'WOB', '#65b32e', '#f5f5f5'],
      ['Borussia Mönchengladbach', 'BMG', '#f5f5f5', '#111111'],
      ['Friburgo', 'SCF', '#e4001b', '#111111'],
      ['Hoffenheim', 'TSG', '#1c63b7', '#f5f5f5'],
      ['Schalke 04', 'S04', '#004d9d', '#f5f5f5'],
      ['Hamburgo', 'HSV', '#0a3f86', '#f5f5f5'],
      ['Werder Bremen', 'SVW', '#1d9053', '#f5f5f5'],
      ['Colonia', 'KOE', '#ed1c24', '#f5f5f5'],
      ['Unión Berlín', 'FCU', '#eb1923', '#ffd700'],
      ['Maguncia 05', 'M05', '#c3141e', '#f5f5f5'],
      ['Augsburgo', 'FCA', '#f5f5f5', '#ba3733'],
      ['Heidenheim', 'FCH', '#e30613', '#003c7e']
    ]],
    ['Francia', 'FR', [
      ['París Saint-Germain', 'PSG', '#004170', '#da291c'],
      ['Marsella', 'OM', '#2faee0', '#f5f5f5'],
      ['Lyon', 'OL', '#f5f5f5', '#da001a'],
      ['Mónaco', 'ASM', '#e51b22', '#f5f5f5'],
      ['Lille', 'LIL', '#e01e13', '#12284b'],
      ['Niza', 'NIC', '#cf0a2c', '#111111'],
      ['Rennes', 'REN', '#e13327', '#111111'],
      ['Lens', 'RCL', '#ffdd00', '#ec1c24'],
      ['Nantes', 'NAN', '#fcd405', '#008d3f'],
      ['Saint-Étienne', 'ASS', '#109c4a', '#f5f5f5']
    ]],
    ['Portugal', 'PT', [
      ['Benfica', 'SLB', '#e52d33', '#f5f5f5'],
      ['Porto', 'POR', '#003e7e', '#f5f5f5'],
      ['Sporting de Lisboa', 'SCP', '#008457', '#f5f5f5'],
      ['Braga', 'BRA', '#da291c', '#f5f5f5'],
      ['Vitória de Guimarães', 'VIT', '#f5f5f5', '#111111'],
      ['Boavista', 'BOA', '#111111', '#f5f5f5']
    ]],
    ['Países Bajos', 'NL', [
      ['Ajax', 'AJX', '#d2122e', '#f5f5f5'],
      ['PSV Eindhoven', 'PSV', '#ed1c24', '#f5f5f5'],
      ['Feyenoord', 'FEY', '#e30613', '#f5f5f5'],
      ['AZ Alkmaar', 'AZA', '#dd1e3e', '#f5f5f5'],
      ['Twente', 'TWE', '#e70011', '#f5f5f5']
    ]],
    ['Bélgica', 'BE', [
      ['Club Brujas', 'BRU', '#0055a5', '#111111'],
      ['Anderlecht', 'AND', '#522d80', '#f5f5f5'],
      ['Genk', 'GNK', '#0a3c87', '#f5f5f5'],
      ['Gante', 'GNT', '#143c77', '#f5f5f5'],
      ['Union Saint-Gilloise', 'USG', '#ffd700', '#144b9c']
    ]],
    ['Escocia', 'GB', [
      ['Celtic', 'CTC', '#018749', '#f5f5f5'],
      ['Rangers', 'RAN', '#1b458f', '#f5f5f5'],
      ['Aberdeen', 'ABE', '#e2001a', '#f5f5f5']
    ]],
    ['Turquía', 'TR', [
      ['Galatasaray', 'GAL', '#fdb912', '#a32638'],
      ['Fenerbahçe', 'FEN', '#163962', '#ffed00'],
      ['Beşiktaş', 'BJK', '#111111', '#f5f5f5'],
      ['Trabzonspor', 'TRA', '#841e33', '#5bbce4']
    ]],
    ['Grecia', 'GR', [
      ['Olympiacos', 'OLY', '#d6001c', '#f5f5f5'],
      ['Panathinaikos', 'PAO', '#007a33', '#f5f5f5'],
      ['AEK Atenas', 'AEK', '#ffd400', '#111111']
    ]],
    ['Rusia', 'RU', [
      ['Zenit', 'ZEN', '#009fdf', '#f5f5f5'],
      ['Spartak Moscú', 'SPA', '#c8102e', '#f5f5f5'],
      ['CSKA Moscú', 'CSK', '#c8102e', '#00376f'],
      ['Dinamo Moscú', 'DIN', '#005eb8', '#f5f5f5']
    ]],
    ['Ucrania', 'UA', [
      ['Shakhtar Donetsk', 'SHK', '#f36f21', '#111111'],
      ['Dinamo de Kiev', 'DYK', '#f5f5f5', '#004b9d']
    ]],
    ['Croacia', 'HR', [
      ['Dinamo Zagreb', 'DZG', '#004b9d', '#f5f5f5'],
      ['Hajduk Split', 'HAJ', '#f5f5f5', '#005baa']
    ]],
    ['Serbia', 'RS', [
      ['Estrella Roja', 'CZV', '#d6001c', '#f5f5f5'],
      ['Partizan', 'PTZ', '#111111', '#f5f5f5']
    ]],
    ['Austria', 'AT', [
      ['Red Bull Salzburgo', 'RBS', '#ea0029', '#0c2340'],
      ['Rapid Viena', 'RAP', '#0b9444', '#f5f5f5']
    ]],
    ['Suiza', 'CH', [
      ['Basilea', 'BAS', '#e4002b', '#0a2342'],
      ['Young Boys', 'YB', '#ffd520', '#111111']
    ]],
    ['República Checa', 'CZ', [
      ['Slavia Praga', 'SLP', '#ce1126', '#f5f5f5'],
      ['Sparta Praga', 'SPR', '#7a0e1e', '#ffd700']
    ]],
    ['Dinamarca', 'DK', [
      ['Copenhague', 'COP', '#f5f5f5', '#0e3f7d'],
      ['Midtjylland', 'MID', '#111111', '#d6001c']
    ]],
    ['Suecia', 'SE', [
      ['Malmö FF', 'MFF', '#78bee5', '#f5f5f5'],
      ['AIK', 'AIK', '#111111', '#ffd700']
    ]],
    ['Noruega', 'NO', [
      ['Bodø/Glimt', 'BOD', '#ffd700', '#111111'],
      ['Rosenborg', 'RBK', '#f5f5f5', '#111111']
    ]],
    ['Polonia', 'PL', [
      ['Legia Varsovia', 'LEG', '#00693c', '#d6001c'],
      ['Lech Poznań', 'LPO', '#0b4ea2', '#f5f5f5']
    ]],
    ['Argentina', 'AR', [
      ['River Plate', 'RIV', '#f5f5f5', '#e4002b'],
      ['Boca Juniors', 'BOC', '#103f79', '#fcb514'],
      ['Racing Club', 'RAC', '#75aadb', '#f5f5f5'],
      ['Independiente', 'IND', '#e4002b', '#f5f5f5'],
      ['San Lorenzo', 'SLO', '#002e5d', '#ad0c32'],
      ['Vélez Sarsfield', 'VEL', '#f5f5f5', '#00337f'],
      ['Estudiantes de La Plata', 'EDL', '#e4002b', '#f5f5f5'],
      ["Newell's Old Boys", 'NOB', '#e4002b', '#111111'],
      ['Rosario Central', 'ROS', '#002b7f', '#ffd700'],
      ['Talleres', 'TAL', '#003087', '#f5f5f5'],
      ['Lanús', 'LAN', '#7b1b2c', '#f5f5f5'],
      ['Banfield', 'BAN', '#00693c', '#f5f5f5'],
      ['Huracán', 'HUR', '#f5f5f5', '#e4002b'],
      ['Argentinos Juniors', 'AAJ', '#e4002b', '#f5f5f5'],
      ['Gimnasia La Plata', 'GIM', '#f5f5f5', '#002e5d'],
      ['Defensa y Justicia', 'DYJ', '#006747', '#ffd700'],
      ['Colón', 'CLN', '#111111', '#e4002b'],
      ['Unión de Santa Fe', 'USF', '#e4002b', '#f5f5f5'],
      ['Platense', 'PLA', '#f5f5f5', '#6b4423'],
      ['Independiente Rivadavia', 'IRV', '#003087', '#f5f5f5']
    ]],
    ['Brasil', 'BR', [
      ['Flamengo', 'FLA', '#e4002b', '#111111'],
      ['Palmeiras', 'PAL', '#006437', '#f5f5f5'],
      ['Corinthians', 'COR', '#111111', '#f5f5f5'],
      ['São Paulo', 'SAO', '#f5f5f5', '#e4002b'],
      ['Santos', 'SAN', '#f5f5f5', '#111111'],
      ['Grêmio', 'GRE', '#0d80bf', '#111111'],
      ['Internacional', 'INR', '#e4002b', '#f5f5f5'],
      ['Atlético Mineiro', 'CAM', '#111111', '#f5f5f5'],
      ['Cruzeiro', 'CRU', '#003da5', '#f5f5f5'],
      ['Fluminense', 'FLU', '#7a0e2b', '#00613c'],
      ['Botafogo', 'BOT', '#111111', '#f5f5f5'],
      ['Vasco da Gama', 'VAS', '#111111', '#f5f5f5'],
      ['Athletico Paranaense', 'CAP', '#e4002b', '#111111'],
      ['Fortaleza', 'FOR', '#006bb3', '#e4002b'],
      ['Bahia', 'BAH', '#005baa', '#e4002b'],
      ['Red Bull Bragantino', 'RBB', '#f5f5f5', '#e4002b'],
      ['Chapecoense', 'CHA', '#00693c', '#f5f5f5'],
      ['Coritiba', 'CFC', '#00693c', '#f5f5f5'],
      ['Vitória', 'VDB', '#e4002b', '#111111'],
      ['Mirassol', 'MIR', '#ffd700', '#00693c']
    ]],
    ['Uruguay', 'UY', [
      ['Peñarol', 'PEN', '#ffd700', '#111111'],
      ['Nacional', 'NAC', '#f5f5f5', '#003087'],
      ['Defensor Sporting', 'DEF', '#4b2e83', '#f5f5f5'],
      ['Liverpool de Montevideo', 'LVM', '#0a2342', '#f5f5f5']
    ]],
    ['Chile', 'CL', [
      ['Colo-Colo', 'CCO', '#f5f5f5', '#111111'],
      ['Universidad de Chile', 'UCH', '#00418c', '#e4002b'],
      ['Universidad Católica', 'UCA', '#f5f5f5', '#0033a0'],
      ['Unión Española', 'UES', '#e4002b', '#ffd700'],
      ['Everton de Viña del Mar', 'EVM', '#003da5', '#ffd700'],
      ['Huachipato', 'HUA', '#00a3e0', '#111111'],
      ['Cobresal', 'CBS', '#f36f21', '#f5f5f5'],
      ['Coquimbo Unido', 'CQU', '#ffb612', '#111111'],
      ['Audax Italiano', 'AUD', '#00693c', '#f5f5f5'],
      ['Palestino', 'PLT', '#00693c', '#e4002b'],
      ["O'Higgins", 'OHI', '#78bee5', '#111111'],
      ['Ñublense', 'NUB', '#e4002b', '#f5f5f5'],
      ['Unión La Calera', 'ULC', '#e4002b', '#111111'],
      ['Deportes Iquique', 'DIQ', '#78bee5', '#f5f5f5'],
      ['Cobreloa', 'CBL', '#f36f21', '#111111'],
      ['Santiago Wanderers', 'SWA', '#00693c', '#f5f5f5']
    ]],
    ['Colombia', 'CO', [
      ['Atlético Nacional', 'ANA', '#00a650', '#f5f5f5'],
      ['Millonarios', 'MLN', '#0033a0', '#f5f5f5'],
      ['América de Cali', 'AMC', '#e4002b', '#f5f5f5'],
      ['Deportivo Cali', 'DCA', '#00693c', '#f5f5f5'],
      ['Junior', 'JUN', '#e4002b', '#f5f5f5'],
      ['Independiente Santa Fe', 'SFE', '#e4002b', '#f5f5f5'],
      ['Once Caldas', 'ONC', '#f5f5f5', '#111111'],
      ['Deportes Tolima', 'TOL', '#ffd700', '#7a0e2b'],
      ['Independiente Medellín', 'DIM', '#e4002b', '#003087']
    ]],
    ['Ecuador', 'EC', [
      ['LDU Quito', 'LDU', '#f5f5f5', '#c8102e'],
      ['Barcelona SC', 'BSC', '#ffd700', '#111111'],
      ['Emelec', 'EME', '#0033a0', '#f5f5f5'],
      ['Independiente del Valle', 'IDV', '#111111', '#ffd700'],
      ['Aucas', 'AUC', '#ffd700', '#111111']
    ]],
    ['Perú', 'PE', [
      ['Universitario', 'UNV', '#7a0e2b', '#f5f5f5'],
      ['Alianza Lima', 'ALI', '#0a2342', '#f5f5f5'],
      ['Sporting Cristal', 'SCR', '#78bee5', '#f5f5f5'],
      ['Melgar', 'MEL', '#111111', '#e4002b'],
      ['Cienciano', 'CIE', '#e4002b', '#f5f5f5'],
      ['Cusco FC', 'CUS', '#ffd700', '#c8102e']
    ]],
    ['Paraguay', 'PY', [
      ['Olimpia', 'OLI', '#f5f5f5', '#111111'],
      ['Cerro Porteño', 'CER', '#e4002b', '#0033a0'],
      ['Libertad', 'LIB', '#111111', '#f5f5f5'],
      ['Guaraní', 'GUA', '#ffd700', '#111111']
    ]],
    ['Bolivia', 'BO', [
      ['Bolívar', 'BLV', '#78bee5', '#f5f5f5'],
      ['The Strongest', 'STR', '#ffd700', '#111111'],
      ['Always Ready', 'ALW', '#e4002b', '#f5f5f5'],
      ['Oriente Petrolero', 'ORI', '#00693c', '#f5f5f5']
    ]],
    ['Venezuela', 'VE', [
      ['Caracas FC', 'CAR', '#7a0e2b', '#ffd700'],
      ['Deportivo Táchira', 'TAC', '#ffd700', '#111111'],
      ['Estudiantes de Mérida', 'EDM', '#e4002b', '#f5f5f5'],
      ['Deportivo La Guaira', 'DLG', '#f36f21', '#111111']
    ]],
    ['México', 'MX', [
      ['Club América', 'AME', '#ffe800', '#00274c'],
      ['Chivas Guadalajara', 'CHV', '#e4002b', '#f5f5f5'],
      ['Cruz Azul', 'CAZ', '#0033a0', '#f5f5f5'],
      ['Pumas UNAM', 'PUM', '#002e5d', '#c6a664'],
      ['Tigres UANL', 'TIG', '#ffb612', '#0033a0'],
      ['Monterrey', 'MTY', '#0a2342', '#f5f5f5'],
      ['Santos Laguna', 'SLG', '#00693c', '#f5f5f5'],
      ['Toluca', 'TCA', '#e4002b', '#f5f5f5'],
      ['León', 'LEO', '#00693c', '#ffd700'],
      ['Pachuca', 'PAC', '#0033a0', '#f5f5f5'],
      ['Atlas', 'ATL', '#e4002b', '#111111'],
      ['Puebla', 'PUE', '#f5f5f5', '#0033a0'],
      ['Necaxa', 'NEC', '#e4002b', '#f5f5f5'],
      ['Querétaro', 'QRO', '#0a2342', '#f5f5f5'],
      ['Tijuana', 'TIJ', '#e4002b', '#111111'],
      ['FC Juárez', 'JUA', '#00693c', '#e4002b'],
      ['Mazatlán', 'MAZ', '#4b2e83', '#f5f5f5'],
      ['Atlético San Luis', 'ASL', '#e4002b', '#f5f5f5']
    ]],
    ['Estados Unidos', 'US', [
      ['LA Galaxy', 'LAG', '#f5f5f5', '#00245d'],
      ['Los Angeles FC', 'LFC', '#111111', '#c6a664'],
      ['Inter Miami', 'MIA', '#f7b5cd', '#111111'],
      ['Seattle Sounders', 'SEA', '#5d9741', '#005595'],
      ['Atlanta United', 'ATU', '#80000b', '#111111'],
      ['New York City FC', 'NYC', '#6cace4', '#f5f5f5'],
      ['New York Red Bulls', 'NYR', '#e4002b', '#f5f5f5'],
      ['Columbus Crew', 'CLB', '#ffd700', '#111111'],
      ['Portland Timbers', 'PTL', '#004812', '#ebe72b'],
      ['Orlando City', 'ORL', '#4b2e83', '#ffd700']
    ]],
    ['Canadá', 'CA', [
      ['Toronto FC', 'TFC', '#e4002b', '#f5f5f5'],
      ['CF Montréal', 'MTL', '#0033a0', '#111111'],
      ['Vancouver Whitecaps', 'VAN', '#f5f5f5', '#00245d']
    ]],
    ['Costa Rica', 'CR', [
      ['Saprissa', 'SAP', '#4b2e83', '#f5f5f5'],
      ['Alajuelense', 'LDA', '#e4002b', '#111111'],
      ['Herediano', 'HER', '#ffd700', '#e4002b']
    ]],
    ['Honduras', 'HN', [
      ['Olimpia de Honduras', 'OLH', '#f5f5f5', '#0033a0'],
      ['Motagua', 'MOT', '#002e5d', '#f5f5f5']
    ]],
    ['Guatemala', 'GT', [
      ['Comunicaciones', 'COM', '#f5f5f5', '#0033a0'],
      ['Municipal', 'MUP', '#e4002b', '#f5f5f5']
    ]],
    ['El Salvador', 'SV', [
      ['Alianza FC', 'ALZ', '#f5f5f5', '#0033a0'],
      ['Águila', 'AGU', '#ffb612', '#111111']
    ]],
    ['Panamá', 'PA', [
      ['Tauro FC', 'TAU', '#ffd700', '#111111']
    ]],
    ['Arabia Saudita', 'SA', [
      ['Al-Hilal', 'HIL', '#0033a0', '#f5f5f5'],
      ['Al-Nassr', 'NAS', '#ffd700', '#0033a0'],
      ['Al-Ittihad', 'ITT', '#ffd700', '#111111'],
      ['Al-Ahli Saudí', 'AHS', '#00693c', '#f5f5f5']
    ]],
    ['Japón', 'JP', [
      ['Kashima Antlers', 'KAS', '#7a0e2b', '#111111'],
      ['Urawa Red Diamonds', 'URA', '#e4002b', '#111111'],
      ['Yokohama F. Marinos', 'YFM', '#0033a0', '#e4002b'],
      ['Vissel Kobe', 'VIS', '#7a0e2b', '#f5f5f5']
    ]],
    ['Corea del Sur', 'KR', [
      ['Jeonbuk Hyundai', 'JEO', '#00693c', '#ffd700'],
      ['Ulsan HD', 'ULS', '#0033a0', '#ffd700'],
      ['FC Seúl', 'SEO', '#e4002b', '#111111']
    ]],
    ['China', 'CN', [
      ['Shanghái Port', 'SHP', '#e4002b', '#0033a0'],
      ['Shandong Taishan', 'SDT', '#f36f21', '#111111']
    ]],
    ['Catar', 'QA', [
      ['Al-Sadd', 'SAD', '#f5f5f5', '#111111'],
      ['Al-Duhail', 'DUH', '#e4002b', '#f5f5f5']
    ]],
    ['Emiratos Árabes Unidos', 'AE', [
      ['Al-Ain', 'AIN', '#4b2e83', '#f5f5f5'],
      ['Shabab Al-Ahli', 'SAA', '#e4002b', '#f5f5f5']
    ]],
    ['Egipto', 'EG', [
      ['Al Ahly', 'AHY', '#e4002b', '#f5f5f5'],
      ['Zamalek', 'ZAM', '#f5f5f5', '#e4002b']
    ]],
    ['Marruecos', 'MA', [
      ['Wydad Casablanca', 'WYD', '#e4002b', '#f5f5f5'],
      ['Raja Casablanca', 'RAJ', '#00693c', '#f5f5f5']
    ]],
    ['Túnez', 'TN', [
      ['Espérance de Túnez', 'EST', '#ffd700', '#e4002b'],
      ['Étoile du Sahel', 'ESS', '#e4002b', '#f5f5f5']
    ]],
    ['Argelia', 'DZ', [
      ['CR Belouizdad', 'CRB', '#e4002b', '#f5f5f5'],
      ['JS Kabylie', 'JSK', '#ffd700', '#00693c']
    ]],
    ['Sudáfrica', 'ZA', [
      ['Mamelodi Sundowns', 'MSU', '#ffd700', '#00693c'],
      ['Kaizer Chiefs', 'KAI', '#ffb612', '#111111'],
      ['Orlando Pirates', 'ORP', '#111111', '#f5f5f5']
    ]],
    ['RD Congo', 'CD', [
      ['TP Mazembe', 'TPM', '#f5f5f5', '#111111']
    ]],
    ['Nigeria', 'NG', [
      ['Enyimba', 'ENY', '#0033a0', '#f5f5f5']
    ]],
    ['Ghana', 'GH', [
      ['Asante Kotoko', 'ASK', '#e4002b', '#ffd700']
    ]],
    ['Australia', 'AU', [
      ['Sydney FC', 'SYD', '#78bee5', '#00245d'],
      ['Melbourne Victory', 'MVI', '#002e5d', '#f5f5f5'],
      ['Melbourne City', 'MCY', '#6cace4', '#f5f5f5']
    ]],
    ['Nueva Zelanda', 'NZ', [
      ['Auckland City', 'AKL', '#f5f5f5', '#0033a0']
    ]]
  ];

  /* ---------------- PLANTILLAS DE TORNEOS ---------------- */
  var PLANTILLAS = [
    {
      id: 'mundial', nombre: 'Copa del Mundo', icono: '🏆', tipo: 'seleccion',
      formato: 'grupos-elim', numGrupos: 8, clasifican: 2, vueltas: 1,
      idaVuelta: false, tercerPuesto: true,
      desc: '32 selecciones · 8 grupos + eliminatoria',
      equipos: ['Catar', 'Ecuador', 'Senegal', 'Países Bajos', 'Inglaterra', 'Irán',
        'Estados Unidos', 'Gales', 'Argentina', 'Arabia Saudita', 'México', 'Polonia',
        'Francia', 'Australia', 'Dinamarca', 'Túnez', 'España', 'Costa Rica',
        'Alemania', 'Japón', 'Bélgica', 'Canadá', 'Marruecos', 'Croacia',
        'Brasil', 'Serbia', 'Suiza', 'Camerún', 'Portugal', 'Ghana', 'Uruguay',
        'Corea del Sur']
    },
    {
      id: 'champions', nombre: 'Champions League', icono: '⭐', tipo: 'club',
      formato: 'grupos-elim', numGrupos: 8, clasifican: 2, vueltas: 1,
      idaVuelta: true, tercerPuesto: false,
      desc: '32 clubes · grupos + eliminatoria ida/vuelta',
      equipos: ['Real Madrid', 'FC Barcelona', 'Atlético de Madrid', 'Sevilla',
        'Manchester City', 'Liverpool', 'Arsenal', 'Chelsea', 'Manchester United',
        'Inter de Milán', 'Milan', 'Juventus', 'Nápoles', 'Bayern Múnich',
        'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen', 'París Saint-Germain',
        'Marsella', 'Mónaco', 'Benfica', 'Porto', 'Sporting de Lisboa', 'Ajax',
        'PSV Eindhoven', 'Club Brujas', 'Celtic', 'Galatasaray', 'Estrella Roja',
        'Shakhtar Donetsk', 'Red Bull Salzburgo', 'Copenhague']
    },
    {
      id: 'libertadores', nombre: 'Copa Libertadores', icono: '🏅', tipo: 'club',
      formato: 'grupos-elim', numGrupos: 8, clasifican: 2, vueltas: 1,
      idaVuelta: true, tercerPuesto: false,
      desc: '32 clubes sudamericanos · grupos + ida/vuelta',
      equipos: ['River Plate', 'Boca Juniors', 'Racing Club', 'Estudiantes de La Plata',
        'Talleres', 'Vélez Sarsfield', 'Flamengo', 'Palmeiras', 'São Paulo',
        'Corinthians', 'Grêmio', 'Internacional', 'Atlético Mineiro', 'Fluminense',
        'Botafogo', 'Peñarol', 'Nacional', 'Colo-Colo', 'Universidad de Chile',
        'Atlético Nacional', 'Millonarios', 'Junior', 'LDU Quito', 'Barcelona SC',
        'Independiente del Valle', 'Universitario', 'Alianza Lima', 'Sporting Cristal',
        'Olimpia', 'Cerro Porteño', 'Bolívar', 'Deportivo Táchira']
    },
    {
      id: 'sudamericana', nombre: 'Copa Sudamericana', icono: '🎗️', tipo: 'club',
      formato: 'grupos-elim', numGrupos: 4, clasifican: 2, vueltas: 1,
      idaVuelta: true, tercerPuesto: false,
      desc: '16 clubes · 4 grupos + eliminatoria ida/vuelta',
      equipos: ['Lanús', 'Defensa y Justicia', 'Independiente', 'San Lorenzo',
        'Athletico Paranaense', 'Fortaleza', 'Bahia', 'Cruzeiro', 'Defensor Sporting',
        'Universidad Católica', 'Deportivo Cali', 'Emelec', 'Melgar', 'Libertad',
        'The Strongest', 'Caracas FC']
    },
    {
      id: 'confederaciones', nombre: 'Copa Confederaciones', icono: '🎖️', tipo: 'seleccion',
      formato: 'grupos-elim', numGrupos: 2, clasifican: 2, vueltas: 1,
      idaVuelta: false, tercerPuesto: true,
      desc: '8 selecciones · 2 grupos + semifinales',
      equipos: ['Alemania', 'Chile', 'Portugal', 'México', 'Rusia', 'Australia',
        'Camerún', 'Nueva Zelanda']
    },
    {
      id: 'copa-america', nombre: 'Copa América', icono: '🌎', tipo: 'seleccion',
      formato: 'grupos-elim', numGrupos: 4, clasifican: 2, vueltas: 1,
      idaVuelta: false, tercerPuesto: true,
      desc: '16 selecciones · 4 grupos + eliminatoria',
      equipos: ['Argentina', 'Brasil', 'Uruguay', 'Colombia', 'Chile', 'Perú',
        'Ecuador', 'Paraguay', 'Bolivia', 'Venezuela', 'México', 'Estados Unidos',
        'Canadá', 'Panamá', 'Costa Rica', 'Jamaica']
    },
    {
      id: 'eurocopa', nombre: 'Eurocopa', icono: '🇪🇺', tipo: 'seleccion',
      formato: 'grupos-elim', numGrupos: 4, clasifican: 2, vueltas: 1,
      idaVuelta: false, tercerPuesto: false,
      desc: '16 selecciones europeas · grupos + eliminatoria',
      equipos: ['España', 'Francia', 'Inglaterra', 'Alemania', 'Portugal',
        'Países Bajos', 'Italia', 'Croacia', 'Bélgica', 'Suiza', 'Dinamarca',
        'Austria', 'Turquía', 'Ucrania', 'Serbia', 'República Checa']
    },
    {
      id: 'copa-africana', nombre: 'Copa Africana', icono: '🌍', tipo: 'seleccion',
      formato: 'grupos-elim', numGrupos: 4, clasifican: 2, vueltas: 1,
      idaVuelta: false, tercerPuesto: true,
      desc: '16 selecciones africanas · grupos + eliminatoria',
      equipos: ['Costa de Marfil', 'Nigeria', 'Senegal', 'Marruecos', 'Egipto',
        'Argelia', 'Túnez', 'Camerún', 'Ghana', 'Malí', 'Burkina Faso', 'Sudáfrica',
        'RD Congo', 'Cabo Verde', 'Guinea', 'Angola']
    },
    {
      id: 'copa-asiatica', nombre: 'Copa Asiática', icono: '🌏', tipo: 'seleccion',
      formato: 'grupos-elim', numGrupos: 4, clasifican: 2, vueltas: 1,
      idaVuelta: false, tercerPuesto: true,
      desc: '16 selecciones asiáticas · grupos + eliminatoria',
      equipos: ['Catar', 'Japón', 'Corea del Sur', 'Irán', 'Arabia Saudita',
        'Australia', 'Irak', 'Emiratos Árabes Unidos', 'Uzbekistán', 'Jordania',
        'China', 'Tailandia', 'Vietnam', 'Indonesia', 'Baréin', 'Omán']
    },
    {
      id: 'copa-oro', nombre: 'Copa Oro', icono: '🥇', tipo: 'seleccion',
      formato: 'grupos-elim', numGrupos: 4, clasifican: 2, vueltas: 1,
      idaVuelta: false, tercerPuesto: false,
      desc: '16 selecciones de CONCACAF · grupos + eliminatoria',
      equipos: ['México', 'Estados Unidos', 'Canadá', 'Costa Rica', 'Panamá',
        'Honduras', 'El Salvador', 'Guatemala', 'Jamaica', 'Trinidad y Tobago',
        'Haití', 'Cuba', 'Curazao', 'Nicaragua', 'Guadalupe', 'Surinam']
    },
    {
      id: 'mundial-clubes', nombre: 'Mundial de Clubes', icono: '🌐', tipo: 'club',
      formato: 'grupos-elim', numGrupos: 8, clasifican: 2, vueltas: 1,
      idaVuelta: false, tercerPuesto: false,
      desc: '32 clubes de todo el mundo · grupos + eliminatoria',
      equipos: ['Real Madrid', 'Manchester City', 'Bayern Múnich', 'París Saint-Germain',
        'Chelsea', 'Inter de Milán', 'Juventus', 'Benfica', 'Porto',
        'Atlético de Madrid', 'Borussia Dortmund', 'Red Bull Salzburgo', 'Flamengo',
        'Palmeiras', 'Fluminense', 'Botafogo', 'River Plate', 'Boca Juniors',
        'Monterrey', 'León', 'Pachuca', 'Seattle Sounders', 'Inter Miami',
        'Los Angeles FC', 'Al-Hilal', 'Al Ahly', 'Wydad Casablanca',
        'Espérance de Túnez', 'Mamelodi Sundowns', 'Urawa Red Diamonds', 'Ulsan HD',
        'Auckland City']
    },
    {
      id: 'premier', nombre: 'Premier League', icono: '🦁', tipo: 'club',
      formato: 'liga', vueltas: 2,
      idaVuelta: false, tercerPuesto: false,
      desc: '20 clubes ingleses · liga a dos vueltas',
      equipos: ['Manchester City', 'Manchester United', 'Liverpool', 'Chelsea',
        'Arsenal', 'Tottenham Hotspur', 'Newcastle United', 'Aston Villa',
        'West Ham United', 'Everton', 'Leicester City', 'Brighton', 'Wolverhampton',
        'Nottingham Forest', 'Crystal Palace', 'Fulham', 'Leeds United', 'Brentford',
        'Southampton', 'Burnley']
    },
    {
      id: 'laliga', nombre: 'LaLiga', icono: '🇪🇸', tipo: 'club',
      formato: 'liga', vueltas: 2,
      idaVuelta: false, tercerPuesto: false,
      desc: '20 clubes españoles · liga a dos vueltas',
      equipos: ['Real Madrid', 'FC Barcelona', 'Atlético de Madrid', 'Sevilla',
        'Valencia', 'Villarreal', 'Real Sociedad', 'Athletic Club', 'Real Betis',
        'Celta de Vigo', 'Getafe', 'Osasuna', 'Espanyol', 'Rayo Vallecano',
        'Mallorca', 'Girona', 'Alavés', 'Las Palmas', 'Cádiz', 'Granada']
    },
    {
      id: 'serie-a', nombre: 'Serie A', icono: '🇮🇹', tipo: 'club',
      formato: 'liga', vueltas: 2,
      idaVuelta: false, tercerPuesto: false,
      desc: '20 clubes italianos · liga a dos vueltas',
      equipos: ['Juventus', 'Inter de Milán', 'Milan', 'Nápoles', 'Roma', 'Lazio',
        'Atalanta', 'Fiorentina', 'Torino', 'Bologna', 'Genoa', 'Sampdoria',
        'Parma', 'Udinese', 'Cagliari', 'Hellas Verona', 'Empoli', 'Lecce',
        'Sassuolo', 'Monza']
    },
    {
      id: 'bundesliga', nombre: 'Bundesliga', icono: '🇩🇪', tipo: 'club',
      formato: 'liga', vueltas: 2,
      idaVuelta: false, tercerPuesto: false,
      desc: '18 clubes alemanes · liga a dos vueltas',
      equipos: ['Bayern Múnich', 'Borussia Dortmund', 'RB Leipzig', 'Bayer Leverkusen',
        'Eintracht Fráncfort', 'Stuttgart', 'Wolfsburgo', 'Borussia Mönchengladbach',
        'Friburgo', 'Hoffenheim', 'Schalke 04', 'Hamburgo', 'Werder Bremen',
        'Colonia', 'Unión Berlín', 'Maguncia 05', 'Augsburgo', 'Heidenheim']
    },
    {
      id: 'liga-chilena', nombre: 'Liga Chilena', icono: '🇨🇱', tipo: 'club',
      formato: 'liga', vueltas: 2,
      idaVuelta: false, tercerPuesto: false,
      desc: '16 clubes chilenos · liga a dos vueltas',
      equipos: ['Colo-Colo', 'Universidad de Chile', 'Universidad Católica',
        'Unión Española', 'Everton de Viña del Mar', 'Huachipato', 'Cobresal',
        'Coquimbo Unido', 'Audax Italiano', 'Palestino', "O'Higgins", 'Ñublense',
        'Unión La Calera', 'Deportes Iquique', 'Cobreloa', 'Santiago Wanderers']
    },
    {
      id: 'brasileirao', nombre: 'Brasileirão', icono: '🇧🇷', tipo: 'club',
      formato: 'liga', vueltas: 2,
      idaVuelta: false, tercerPuesto: false,
      desc: '16 clubes brasileños · liga a dos vueltas',
      equipos: ['Flamengo', 'Palmeiras', 'Corinthians', 'São Paulo', 'Santos',
        'Grêmio', 'Internacional', 'Atlético Mineiro', 'Cruzeiro', 'Fluminense',
        'Botafogo', 'Vasco da Gama', 'Athletico Paranaense', 'Fortaleza', 'Bahia',
        'Red Bull Bragantino']
    },
    {
      id: 'liga-argentina', nombre: 'Liga Argentina', icono: '🇦🇷', tipo: 'club',
      formato: 'liga', vueltas: 1,
      idaVuelta: false, tercerPuesto: false,
      desc: '18 clubes argentinos · liga a una vuelta',
      equipos: ['River Plate', 'Boca Juniors', 'Racing Club', 'Independiente',
        'San Lorenzo', 'Vélez Sarsfield', 'Estudiantes de La Plata',
        "Newell's Old Boys", 'Rosario Central', 'Talleres', 'Lanús', 'Banfield',
        'Huracán', 'Argentinos Juniors', 'Gimnasia La Plata', 'Defensa y Justicia',
        'Colón', 'Unión de Santa Fe']
    },
    {
      id: 'liga-mx', nombre: 'Liga MX + Liguilla', icono: '🇲🇽', tipo: 'club',
      formato: 'liga-elim', vueltas: 1, clasifican: 8,
      idaVuelta: true, tercerPuesto: false, finalUnica: false,
      desc: '18 clubes mexicanos · liga + liguilla de 8',
      equipos: ['Club América', 'Chivas Guadalajara', 'Cruz Azul', 'Pumas UNAM',
        'Tigres UANL', 'Monterrey', 'Santos Laguna', 'Toluca', 'León', 'Pachuca',
        'Atlas', 'Puebla', 'Necaxa', 'Querétaro', 'Tijuana', 'FC Juárez',
        'Mazatlán', 'Atlético San Luis']
    }
  ];

  /* ---------------- Índices ---------------- */
  function normalizar(s) {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }
  function slug(s) {
    return normalizar(s).replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  var equipos = [];
  var porId = new Map();
  var porNombre = new Map(); // clave: tipo|nombreNormalizado

  SELECCIONES.forEach(function (grupo) {
    var continente = grupo[0];
    grupo[1].forEach(function (e) {
      var eq = {
        id: 's-' + slug(e[0]), tipo: 'seleccion', nombre: e[0],
        region: continente, emoji: e[2] || flag(e[1])
      };
      if (porId.has(eq.id)) console.warn('ID duplicado:', eq.id);
      equipos.push(eq); porId.set(eq.id, eq);
      porNombre.set('seleccion|' + normalizar(eq.nombre), eq);
    });
  });

  CLUBES.forEach(function (grupo) {
    var pais = grupo[0], iso = grupo[1];
    grupo[2].forEach(function (c) {
      var eq = {
        id: 'c-' + slug(c[0]), tipo: 'club', nombre: c[0],
        region: pais, paisEmoji: flag(iso), abrev: c[1], c1: c[2], c2: c[3]
      };
      if (porId.has(eq.id)) console.warn('ID duplicado:', eq.id);
      equipos.push(eq); porId.set(eq.id, eq);
      porNombre.set('club|' + normalizar(eq.nombre), eq);
    });
  });

  // Resolver nombres de las plantillas a IDs de equipo
  PLANTILLAS.forEach(function (p) {
    p.equipoIds = p.equipos.map(function (nombre) {
      var eq = porNombre.get(p.tipo + '|' + normalizar(nombre));
      if (!eq) { console.warn('Plantilla "' + p.id + '": equipo no encontrado →', nombre); return null; }
      return eq.id;
    }).filter(Boolean);
  });

  return {
    SELECCIONES: SELECCIONES, CLUBES: CLUBES, PLANTILLAS: PLANTILLAS,
    equipos: equipos, porId: porId, porNombre: porNombre,
    normalizar: normalizar, slug: slug
  };
})();

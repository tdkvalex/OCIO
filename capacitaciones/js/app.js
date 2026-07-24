// Interfaz y estado de la aplicación de capacitaciones.
// Depende de: Logica, Almacen, IA, Certificados (cargados antes).
(function () {
  'use strict';

  var L = window.Logica;

  function D() { return Almacen.datos; }
  function guardar() { Almacen.guardar(); }

  // Estado de navegación (no persistente, salvo lo que se copia a Almacen.ui).
  var estado = {
    modo: 'inicio',            // inicio | admin | colab
    vistaAdmin: 'panel',       // panel | personas | cursos | programas | seguimiento | certificados | ia | ajustes
    cursoEditId: null,
    filtros: {},
    busquedaPersona: '',
    preguntaEdit: null,        // {cursoId, preguntaId|null, datos:{...}}
    colabPersonaId: null,
    vistaColab: 'cursos',      // cursos | certificados
    cursoAbiertoId: null,
    moduloAbiertoId: null,
    examen: null,              // {cursoId, orden:[], respuestas:{}, resultado}
    ia: { ocupado: false, salida: '', tipoSalida: null, chat: [], controlador: null },
    certVistaId: null
  };

  var acciones = {};      // data-accion="nombre" -> función(el, ev)
  var formularios = {};   // data-form="nombre" -> función(form, ev)
  var tareasPostRender = [];

  /* ---------- utilidades de interfaz ---------- */

  function esc(s) {
    return String(s === undefined || s === null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function atr(s) { return esc(s); }

  var toastTemporizador = null;
  function toast(mensaje, esError) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = mensaje;
    t.className = 'visible' + (esError ? ' error' : '');
    clearTimeout(toastTemporizador);
    toastTemporizador = setTimeout(function () { t.className = ''; }, esError ? 5200 : 3200);
  }

  function abrirModal(html) {
    var fondo = document.getElementById('modal-fondo');
    var modal = document.getElementById('modal');
    fondo.classList.add('visible');
    modal.innerHTML = '<div class="caja">' +
      '<button class="cerrar" data-accion="cerrarModal" aria-label="Cerrar">×</button>' +
      html + '</div>';
    modal.style.display = 'flex';
  }

  function cerrarModal() {
    var fondo = document.getElementById('modal-fondo');
    var modal = document.getElementById('modal');
    fondo.classList.remove('visible');
    modal.style.display = 'none';
    modal.innerHTML = '';
    estado.preguntaEdit = null;
    estado.certVistaId = null;
  }
  acciones.cerrarModal = cerrarModal;

  function confirmar(mensaje) { return window.confirm(mensaje); }

  function aplicarColores() {
    var c = D().config;
    var r = document.documentElement.style;
    r.setProperty('--primario', c.colorPrimario || '#2f6bd0');
    r.setProperty('--acento', c.colorAcento || '#d99a2b');
  }

  function leerArchivo(archivo, como) {
    return new Promise(function (resolver, rechazar) {
      var lector = new FileReader();
      lector.onload = function () { resolver(lector.result); };
      lector.onerror = function () { rechazar(new Error('No se pudo leer el archivo.')); };
      if (como === 'texto') lector.readAsText(archivo);
      else lector.readAsDataURL(archivo);
    });
  }

  function tamanoLegible(bytes) {
    if (!bytes && bytes !== 0) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return Math.round(bytes / 1024) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }

  function descargarTexto(nombre, contenido, tipo) {
    var blob = new Blob([contenido], { type: tipo || 'text/plain;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = nombre;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  // Texto plano con formato ligero: "## " subtítulos, "- " listas, **negrita**.
  function renderizarContenido(texto) {
    var lineas = String(texto || '').split(/\r?\n/);
    var html = '';
    var enLista = false;
    lineas.forEach(function (linea) {
      var l = linea.trim();
      var esItem = /^[-*] /.test(l);
      if (enLista && !esItem) { html += '</ul>'; enLista = false; }
      if (!l) { html += '<br>'; return; }
      var cuerpo = esc(esItem ? l.slice(2) : l.replace(/^#+ /, ''))
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      if (/^#+ /.test(l)) html += '<h4>' + cuerpo + '</h4>';
      else if (esItem) {
        if (!enLista) { html += '<ul>'; enLista = true; }
        html += '<li>' + cuerpo + '</li>';
      } else html += '<p>' + cuerpo + '</p>';
    });
    if (enLista) html += '</ul>';
    return html;
  }

  /* ---------- búsquedas frecuentes ---------- */

  function persona(id) { return D().personas.find(function (p) { return p.id === id; }) || null; }
  function curso(id) { return D().cursos.find(function (c) { return c.id === id; }) || null; }
  function programa(id) { return D().programas.find(function (p) { return p.id === id; }) || null; }
  function categoria(id) { return D().config.categorias.find(function (c) { return c.id === id; }) || null; }
  function inscripcion(id) { return D().inscripciones.find(function (i) { return i.id === id; }) || null; }
  function inscripcionDe(personaId, cursoId) {
    return D().inscripciones.find(function (i) {
      return i.personaId === personaId && i.cursoId === cursoId;
    }) || null;
  }
  function certificado(id) { return D().certificados.find(function (c) { return c.id === id; }) || null; }

  function etiquetaCategoria(id) {
    var cat = categoria(id);
    if (!cat) return '';
    return '<span class="chip categoria" style="border-color:' + atr(cat.color || '#263756') +
      ';color:' + atr(cat.color || '#93a4bf') + '">' + esc(cat.nombre) + '</span>';
  }

  function chipEstado(estadoInsc) {
    return '<span class="chip ' + atr(estadoInsc) + '">' +
      esc(L.ETIQUETAS_ESTADO[estadoInsc] || estadoInsc) + '</span>';
  }

  function barraAvance(pct) {
    var completo = pct >= 100 ? ' completo' : '';
    return '<div class="avance' + completo + '"><div style="width:' + Math.min(100, pct) + '%"></div></div>';
  }

  /* ---------- certificados: emisión ---------- */

  function emitirCertificado(insc, cursoObj, personaObj) {
    var d = D();
    d.secuencias.folio = (d.secuencias.folio || 0) + 1;
    var anio = Number((insc.completadoEn || L.hoyISO()).slice(0, 4));
    var cert = {
      id: L.crearId('cert'),
      folio: L.generarFolio(d.config.cert.prefijoFolio || 'CERT', anio, d.secuencias.folio),
      codigoVerificacion: L.codigoVerificacion(),
      personaId: personaObj.id,
      cursoId: cursoObj.id,
      nombrePersona: personaObj.nombre,
      tituloCurso: cursoObj.titulo,
      horas: cursoObj.horas || null,
      fecha: insc.completadoEn,
      venceEn: insc.venceEn || null
    };
    d.certificados.push(cert);
    insc.certificadoId = cert.id;
    return cert;
  }

  // Si la inscripción quedó completa, registra fecha, vencimiento y certificado.
  function completarSiCorresponde(insc) {
    var c = curso(insc.cursoId);
    var p = persona(insc.personaId);
    if (!c || !p || insc.completadoEn) return null;
    if (!L.cursoCompletado(c, insc)) return null;
    insc.completadoEn = L.hoyISO();
    insc.venceEn = L.calcularVencimiento(insc.completadoEn, c.vigenciaMeses);
    var cert = emitirCertificado(insc, c, p);
    guardar();
    return cert;
  }

  /* ---------- estructura general ---------- */

  function encabezado(modoTexto) {
    var c = D().config;
    var logo = c.logo
      ? '<img class="logo-org" src="' + atr(c.logo) + '" alt="">'
      : '<div class="logo-org" style="display:flex;align-items:center;justify-content:center;font-size:1.4rem">🎓</div>';
    return '<header class="encabezado">' + logo +
      '<div class="titulo-org"><h1>' + esc(c.nombreOrg) + '</h1>' +
      '<div class="lema">' + esc(c.lema || 'Plataforma de capacitaciones') + '</div></div>' +
      (modoTexto ? '<span class="marca-modo">' + esc(modoTexto) + '</span>' : '') +
      '<button class="boton chico secundario" data-accion="salirModo">Cambiar modo</button>' +
      '</header>';
  }

  acciones.salirModo = function () {
    estado.modo = 'inicio';
    estado.examen = null;
    estado.cursoAbiertoId = null;
    Almacen.ui.modo = 'inicio';
    Almacen.guardarUI();
    render();
  };

  function vistaInicio() {
    return '<div class="inicio">' +
      '<div class="icono">🎓</div>' +
      '<h1>' + esc(D().config.nombreOrg) + '</h1>' +
      '<p style="color:var(--texto2)">' + esc(D().config.lema || 'Plataforma de capacitaciones') + '</p>' +
      '<div class="opciones-modo">' +
      '<button class="opcion-modo" data-accion="irAdmin"><div class="icono">🛠️</div>' +
      '<div class="nombre">Administrador</div>' +
      '<div class="detalle">Programas, cursos, personal, seguimiento, certificados y asistente de IA</div></button>' +
      '<button class="opcion-modo" data-accion="irColab"><div class="icono">👤</div>' +
      '<div class="nombre">Colaborador</div>' +
      '<div class="detalle">Tomar capacitaciones, rendir evaluaciones y descargar certificados</div></button>' +
      '</div>' +
      '<p class="pie-app">Los datos se guardan solo en este dispositivo. Usa Ajustes → Respaldo para exportarlos.</p>' +
      '</div>';
  }

  acciones.irAdmin = function () {
    estado.modo = 'admin';
    Almacen.ui.modo = 'admin';
    Almacen.guardarUI();
    render();
  };

  acciones.irColab = function () {
    estado.modo = 'colab';
    Almacen.ui.modo = 'colab';
    Almacen.guardarUI();
    render();
  };

  /* ---------- administración: estructura ---------- */

  var PESTANAS_ADMIN = [
    ['panel', '📊 Panel'],
    ['personas', '👥 Personas'],
    ['cursos', '📚 Cursos'],
    ['programas', '🗂️ Programas'],
    ['seguimiento', '📈 Seguimiento'],
    ['certificados', '🏅 Certificados'],
    ['ia', '✨ Asistente IA'],
    ['ajustes', '⚙️ Ajustes']
  ];

  function vistaAdmin() {
    var nav = '<nav class="nav">' + PESTANAS_ADMIN.map(function (p) {
      return '<button data-accion="pestanaAdmin" data-valor="' + p[0] + '"' +
        (estado.vistaAdmin === p[0] ? ' class="activo"' : '') + '>' + p[1] + '</button>';
    }).join('') + '</nav>';
    var cuerpo = '';
    if (estado.vistaAdmin === 'panel') cuerpo = vistaPanel();
    else if (estado.vistaAdmin === 'personas') cuerpo = vistaPersonas();
    else if (estado.vistaAdmin === 'cursos') cuerpo = estado.cursoEditId ? vistaEditorCurso() : vistaCursos();
    else if (estado.vistaAdmin === 'programas') cuerpo = vistaProgramas();
    else if (estado.vistaAdmin === 'seguimiento') cuerpo = vistaSeguimiento();
    else if (estado.vistaAdmin === 'certificados') cuerpo = vistaCertificados();
    else if (estado.vistaAdmin === 'ia') cuerpo = vistaIA();
    else if (estado.vistaAdmin === 'ajustes') cuerpo = vistaAjustes();
    return encabezado('Administración') + nav + cuerpo;
  }

  acciones.pestanaAdmin = function (el) {
    estado.vistaAdmin = el.getAttribute('data-valor');
    estado.cursoEditId = null;
    render();
  };

  /* ---------- administración: panel ---------- */

  function vistaPanel() {
    var r = L.resumenPanel(D());
    var html = '<div class="grilla grilla-kpi">' +
      '<div class="kpi"><div class="valor">' + r.personasActivas + '</div><div class="nombre">Personas activas</div></div>' +
      '<div class="kpi"><div class="valor">' + r.cursosPublicados + '</div><div class="nombre">Cursos publicados</div></div>' +
      '<div class="kpi ' + (r.cumplimientoPct >= 80 ? 'bueno' : r.cumplimientoPct >= 50 ? 'alerta' : 'malo') + '">' +
      '<div class="valor">' + r.cumplimientoPct + '%</div><div class="nombre">Cumplimiento</div></div>' +
      '<div class="kpi ' + (r.vencidas.length ? 'malo' : 'bueno') + '"><div class="valor">' + r.vencidas.length + '</div><div class="nombre">Vencidas</div></div>' +
      '</div>';

    html += '<div class="grilla grilla-kpi" style="margin-top:12px">' +
      ['pendiente', 'en_curso', 'completado', 'reprobado'].map(function (e) {
        return '<div class="kpi"><div class="valor">' + (r.conteo[e] || 0) + '</div><div class="nombre">' +
          esc(L.ETIQUETAS_ESTADO[e]) + '</div></div>';
      }).join('') + '</div>';

    html += '<div class="tarjeta" style="margin-top:14px"><h3>⏳ Vencen en los próximos 30 días</h3>';
    if (!r.porVencer.length) {
      html += '<p style="color:var(--texto2)">No hay capacitaciones por vencer.</p>';
    } else {
      html += r.porVencer.map(function (f) {
        return '<div class="fila-lista"><div class="principal"><div class="nombre">' + esc(f.persona) +
          '</div><div class="detalle">' + esc(f.curso) + '</div></div>' +
          '<span class="chip vencido">' + f.diasParaVencer + ' día' + (f.diasParaVencer === 1 ? '' : 's') + '</span></div>';
      }).join('');
    }
    html += '</div>';

    if (r.vencidas.length) {
      html += '<div class="tarjeta"><h3>🔴 Capacitaciones vencidas</h3>' +
        r.vencidas.map(function (f) {
          return '<div class="fila-lista"><div class="principal"><div class="nombre">' + esc(f.persona) +
            '</div><div class="detalle">' + esc(f.curso) + ' · venció el ' + L.fechaCorta(f.venceEn) + '</div></div>' +
            '<button class="boton chico" data-accion="reinscribir" data-id="' + atr(f.inscripcionId) + '">Reinscribir</button></div>';
        }).join('') + '</div>';
    }

    if (!D().personas.length || !D().cursos.length) {
      html += '<div class="aviso info">Para comenzar: crea <strong>personas</strong> y <strong>cursos</strong>, ' +
        'asígnalos (directamente o con un <strong>programa</strong>) y sigue el avance desde esta pantalla. ' +
        'El <strong>Asistente IA</strong> puede crear cursos completos desde tus documentos.</div>';
    }
    return html;
  }

  /* ---------- administración: personas ---------- */

  function vistaPersonas() {
    var filtro = L.normalizar(estado.busquedaPersona);
    var lista = D().personas.filter(function (p) {
      if (!filtro) return true;
      return L.normalizar(p.nombre + ' ' + (p.correo || '') + ' ' + (p.area || '')).indexOf(filtro) !== -1;
    });
    var html = '<div class="tarjeta"><div class="fila-botones" style="justify-content:space-between">' +
      '<h2 style="margin:0">Personas (' + D().personas.length + ')</h2>' +
      '<div class="fila-botones">' +
      '<button class="boton secundario chico" data-accion="importarPersonas">Importar lista</button>' +
      '<button class="boton" data-accion="nuevaPersona">+ Agregar persona</button></div></div>' +
      '<div class="campo" style="margin-top:10px"><input type="text" data-input="busquedaPersona" placeholder="Buscar por nombre, correo o área…" value="' + atr(estado.busquedaPersona) + '"></div>';
    if (!lista.length) {
      html += '<div class="vacio">No hay personas' + (filtro ? ' que coincidan con la búsqueda' : ' registradas todavía') + '.</div>';
    } else {
      html += lista.map(function (p) {
        var inscs = D().inscripciones.filter(function (i) { return i.personaId === p.id; }).length;
        return '<div class="fila-lista"' + (p.activo === false ? ' style="opacity:.55"' : '') + '>' +
          '<div class="principal"><div class="nombre">' + esc(p.nombre) +
          (p.activo === false ? ' <span class="chip pendiente">Inactivo</span>' : '') + '</div>' +
          '<div class="detalle">' + esc(p.correo || 'sin correo') +
          (p.area ? ' · ' + esc(p.area) : '') + (p.cargo ? ' · ' + esc(p.cargo) : '') +
          ' · ' + inscs + ' capacitación' + (inscs === 1 ? '' : 'es') + '</div></div>' +
          '<button class="boton chico secundario" data-accion="editarPersona" data-id="' + atr(p.id) + '">Editar</button>' +
          '</div>';
      }).join('');
    }
    return html + '</div>';
  }

  function formularioPersona(p) {
    return '<h3>' + (p ? 'Editar persona' : 'Nueva persona') + '</h3>' +
      '<form data-form="guardarPersona" data-id="' + atr(p ? p.id : '') + '">' +
      '<div class="campo"><label>Nombre completo *</label><input type="text" name="nombre" required value="' + atr(p ? p.nombre : '') + '"></div>' +
      '<div class="campo"><label>Correo</label><input type="email" name="correo" value="' + atr(p ? p.correo : '') + '"></div>' +
      '<div class="grilla grilla-2">' +
      '<div class="campo"><label>Área / Departamento</label><input type="text" name="area" value="' + atr(p ? p.area : '') + '"></div>' +
      '<div class="campo"><label>Cargo</label><input type="text" name="cargo" value="' + atr(p ? p.cargo : '') + '"></div></div>' +
      (p ? '<div class="campo"><label class="opcion-marcable" style="margin:0"><input type="checkbox" name="activo"' + (p.activo !== false ? ' checked' : '') + '> Persona activa (aparece en paneles e indicadores)</label></div>' : '') +
      '<div class="fila-botones"><button class="boton" type="submit">Guardar</button>' +
      (p ? '<button class="boton peligro" type="button" data-accion="eliminarPersona" data-id="' + atr(p.id) + '">Eliminar</button>' : '') +
      '</div></form>';
  }

  acciones.nuevaPersona = function () { abrirModal(formularioPersona(null)); };
  acciones.editarPersona = function (el) {
    var p = persona(el.getAttribute('data-id'));
    if (p) abrirModal(formularioPersona(p));
  };

  formularios.guardarPersona = function (form) {
    var id = form.getAttribute('data-id');
    var datos = {
      nombre: form.nombre.value.trim(),
      correo: form.correo.value.trim(),
      area: form.area.value.trim(),
      cargo: form.cargo.value.trim()
    };
    if (!datos.nombre) { toast('El nombre es obligatorio.', true); return; }
    if (id) {
      var p = persona(id);
      if (!p) return;
      Object.assign(p, datos, { activo: form.activo ? form.activo.checked : p.activo });
    } else {
      D().personas.push(Object.assign({ id: L.crearId('per'), activo: true, creadoEn: L.hoyISO() }, datos));
    }
    guardar();
    cerrarModal();
    toast('Persona guardada.');
    render();
  };

  acciones.eliminarPersona = function (el) {
    var id = el.getAttribute('data-id');
    var p = persona(id);
    if (!p) return;
    var inscs = D().inscripciones.filter(function (i) { return i.personaId === id; }).length;
    if (!confirmar('¿Eliminar a ' + p.nombre + '?' + (inscs ? ' Se borrarán sus ' + inscs + ' inscripciones (los certificados emitidos se conservan).' : ''))) return;
    D().personas = D().personas.filter(function (x) { return x.id !== id; });
    D().inscripciones = D().inscripciones.filter(function (i) { return i.personaId !== id; });
    D().programas.forEach(function (pr) {
      pr.personaIds = (pr.personaIds || []).filter(function (x) { return x !== id; });
    });
    guardar();
    cerrarModal();
    toast('Persona eliminada.');
    render();
  };

  acciones.importarPersonas = function () {
    abrirModal('<h3>Importar lista de personas</h3>' +
      '<p class="ayuda" style="color:var(--texto2);font-size:.82rem">Pega una persona por línea con el formato:<br>' +
      '<code>Nombre; correo; área; cargo</code> (solo el nombre es obligatorio).</p>' +
      '<form data-form="importarPersonas">' +
      '<div class="campo"><textarea name="lista" rows="8" placeholder="Ana Soto; ana@empresa.cl; Operaciones; Supervisora&#10;Luis Rojas; luis@empresa.cl; Ventas"></textarea></div>' +
      '<button class="boton" type="submit">Importar</button></form>');
  };

  formularios.importarPersonas = function (form) {
    var lineas = form.lista.value.split(/\r?\n/);
    var agregadas = 0;
    lineas.forEach(function (linea) {
      var partes = linea.split(';').map(function (x) { return x.trim(); });
      if (!partes[0]) return;
      D().personas.push({
        id: L.crearId('per'), nombre: partes[0], correo: partes[1] || '',
        area: partes[2] || '', cargo: partes[3] || '', activo: true, creadoEn: L.hoyISO()
      });
      agregadas++;
    });
    if (!agregadas) { toast('No se encontraron nombres para importar.', true); return; }
    guardar();
    cerrarModal();
    toast(agregadas + ' persona' + (agregadas === 1 ? '' : 's') + ' importada' + (agregadas === 1 ? '' : 's') + '.');
    render();
  };

  /* ---------- administración: cursos ---------- */

  function vistaCursos() {
    var html = '<div class="fila-botones" style="justify-content:space-between;margin-bottom:12px">' +
      '<h2 style="margin:0">Cursos y capacitaciones</h2>' +
      '<div class="fila-botones">' +
      '<button class="boton secundario chico" data-accion="pestanaAdmin" data-valor="ia">✨ Crear con IA</button>' +
      '<button class="boton" data-accion="nuevoCurso">+ Nuevo curso</button></div></div>';
    if (!D().cursos.length) {
      return html + '<div class="vacio">Aún no hay cursos.<br>Créalos a mano o genera uno completo con el Asistente IA a partir de tus documentos.</div>';
    }
    html += '<div class="grilla grilla-2">' + D().cursos.map(function (c) {
      var inscritos = D().inscripciones.filter(function (i) { return i.cursoId === c.id; }).length;
      return '<div class="tarjeta-curso" data-accion="editarCurso" data-id="' + atr(c.id) + '">' +
        '<div class="fila-superior">' + etiquetaCategoria(c.categoriaId) +
        '<span class="chip ' + (c.publicado ? 'publicado' : 'borrador') + '">' + (c.publicado ? 'Publicado' : 'Borrador') + '</span></div>' +
        '<h3>' + esc(c.titulo) + '</h3>' +
        '<div class="descripcion">' + esc((c.descripcion || '').slice(0, 140)) + '</div>' +
        '<div class="pie"><span>📄 ' + (c.modulos || []).length + ' módulos</span>' +
        (L.requiereEvaluacion(c) ? '<span>📝 ' + c.evaluacion.preguntas.length + ' preguntas</span>' : '') +
        (c.horas ? '<span>🕒 ' + c.horas + ' h</span>' : '') +
        '<span>👥 ' + inscritos + '</span></div></div>';
    }).join('') + '</div>';
    return html;
  }

  acciones.nuevoCurso = function () {
    var c = {
      id: L.crearId('cur'),
      titulo: 'Nuevo curso',
      descripcion: '',
      categoriaId: (D().config.categorias[0] || {}).id || '',
      horas: 1,
      vigenciaMeses: 0,
      publicado: false,
      modulos: [],
      materialIds: [],
      evaluacion: { activa: false, notaAprobacion: D().config.notaAprobacionDefecto || 70, intentosMax: 3, barajar: true, preguntas: [] },
      creadoEn: L.hoyISO()
    };
    D().cursos.push(c);
    guardar();
    estado.cursoEditId = c.id;
    render();
  };

  acciones.editarCurso = function (el) {
    estado.cursoEditId = el.getAttribute('data-id');
    render();
  };

  acciones.volverCursos = function () { estado.cursoEditId = null; render(); };

  var TIPOS_MODULO = {
    texto: '📄 Lección de texto',
    video: '🎬 Video',
    archivo: '📎 Archivo / documento',
    enlace: '🔗 Enlace externo'
  };

  function vistaEditorCurso() {
    var c = curso(estado.cursoEditId);
    if (!c) { estado.cursoEditId = null; return vistaCursos(); }
    var errores = L.validarCurso(c);
    var inscritos = D().inscripciones.filter(function (i) { return i.cursoId === c.id; });

    var html = '<button class="boton enlace" data-accion="volverCursos">← Volver a cursos</button>' +
      '<div class="tarjeta"><h2>Datos del curso</h2>' +
      '<form data-form="guardarCurso" data-id="' + atr(c.id) + '">' +
      '<div class="campo"><label>Título *</label><input type="text" name="titulo" required value="' + atr(c.titulo) + '"></div>' +
      '<div class="campo"><label>Descripción</label><textarea name="descripcion">' + esc(c.descripcion || '') + '</textarea></div>' +
      '<div class="grilla grilla-3">' +
      '<div class="campo"><label>Categoría</label><select name="categoriaId">' +
      D().config.categorias.map(function (cat) {
        return '<option value="' + atr(cat.id) + '"' + (c.categoriaId === cat.id ? ' selected' : '') + '>' + esc(cat.nombre) + '</option>';
      }).join('') + '</select></div>' +
      '<div class="campo"><label>Duración (horas)</label><input type="number" name="horas" min="0" step="0.5" value="' + atr(c.horas || 0) + '"></div>' +
      '<div class="campo"><label>Vigencia (meses)</label><input type="number" name="vigenciaMeses" min="0" step="1" value="' + atr(c.vigenciaMeses || 0) + '">' +
      '<div class="ayuda">0 = el certificado no vence. Con vigencia, al vencer se pide recertificación.</div></div></div>' +
      '<div class="fila-botones"><button class="boton" type="submit">Guardar datos</button>' +
      '<button class="boton ' + (c.publicado ? 'secundario' : 'exito') + '" type="button" data-accion="alternarPublicado" data-id="' + atr(c.id) + '">' +
      (c.publicado ? 'Pasar a borrador' : 'Publicar curso') + '</button>' +
      '<button class="boton peligro" type="button" data-accion="eliminarCurso" data-id="' + atr(c.id) + '">Eliminar curso</button>' +
      '</div></form>';
    if (errores.length) {
      html += '<div class="aviso alerta" style="margin-top:12px"><strong>Pendientes antes de publicar:</strong><br>' +
        errores.map(esc).join('<br>') + '</div>';
    }
    html += '</div>';

    // módulos
    html += '<div class="tarjeta"><div class="fila-botones" style="justify-content:space-between">' +
      '<h2 style="margin:0">Módulos de aprendizaje (' + (c.modulos || []).length + ')</h2>' +
      '<button class="boton" data-accion="nuevoModulo" data-curso="' + atr(c.id) + '">+ Agregar módulo</button></div>';
    if (!(c.modulos || []).length) {
      html += '<div class="vacio" style="margin-top:10px">Sin módulos. Agrega lecciones de texto, videos, archivos o enlaces.</div>';
    } else {
      html += c.modulos.map(function (m, i) {
        return '<div class="fila-lista"><div style="color:var(--texto2)">' + (i + 1) + '</div>' +
          '<div class="principal"><div class="nombre">' + esc(m.titulo) + '</div>' +
          '<div class="detalle">' + esc(TIPOS_MODULO[m.tipo] || m.tipo) +
          (m.duracionMin ? ' · ' + m.duracionMin + ' min' : '') + '</div></div>' +
          '<div class="fila-botones">' +
          '<button class="boton chico secundario" data-accion="moverModulo" data-curso="' + atr(c.id) + '" data-id="' + atr(m.id) + '" data-dir="-1"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
          '<button class="boton chico secundario" data-accion="moverModulo" data-curso="' + atr(c.id) + '" data-id="' + atr(m.id) + '" data-dir="1"' + (i === c.modulos.length - 1 ? ' disabled' : '') + '>↓</button>' +
          '<button class="boton chico secundario" data-accion="editarModulo" data-curso="' + atr(c.id) + '" data-id="' + atr(m.id) + '">Editar</button>' +
          '<button class="boton chico peligro" data-accion="eliminarModulo" data-curso="' + atr(c.id) + '" data-id="' + atr(m.id) + '">✕</button>' +
          '</div></div>';
      }).join('');
    }
    html += '</div>';

    html += seccionEvaluacion(c);
    html += seccionMaterial(c);

    // asignación
    html += '<div class="tarjeta"><div class="fila-botones" style="justify-content:space-between">' +
      '<h2 style="margin:0">Personas asignadas (' + inscritos.length + ')</h2>' +
      '<button class="boton" data-accion="asignarPersonas" data-curso="' + atr(c.id) + '">Asignar personas</button></div>';
    if (!inscritos.length) {
      html += '<div class="vacio" style="margin-top:10px">Nadie asignado aún. Asigna personas directamente o mediante un programa.</div>';
    } else {
      html += inscritos.map(function (i) {
        var p = persona(i.personaId);
        if (!p) return '';
        var e = L.estadoInscripcion(c, i);
        return '<div class="fila-lista"><div class="principal"><div class="nombre">' + esc(p.nombre) + '</div>' +
          '<div class="detalle">' + esc(p.area || '') + '</div></div>' + chipEstado(e) +
          '<button class="boton chico peligro" data-accion="quitarInscripcion" data-id="' + atr(i.id) + '">✕</button></div>';
      }).join('');
    }
    html += '</div>';
    return html;
  }

  formularios.guardarCurso = function (form) {
    var c = curso(form.getAttribute('data-id'));
    if (!c) return;
    c.titulo = form.titulo.value.trim() || c.titulo;
    c.descripcion = form.descripcion.value.trim();
    c.categoriaId = form.categoriaId.value;
    c.horas = Number(form.horas.value) || 0;
    c.vigenciaMeses = Math.max(0, Math.round(Number(form.vigenciaMeses.value) || 0));
    guardar();
    toast('Curso guardado.');
    render();
  };

  acciones.alternarPublicado = function (el) {
    var c = curso(el.getAttribute('data-id'));
    if (!c) return;
    if (!c.publicado) {
      var errores = L.validarCurso(c);
      if (errores.length) { toast('Corrige los pendientes antes de publicar.', true); return; }
    }
    c.publicado = !c.publicado;
    guardar();
    toast(c.publicado ? 'Curso publicado: ya es visible para los asignados.' : 'Curso pasado a borrador.');
    render();
  };

  acciones.eliminarCurso = function (el) {
    var id = el.getAttribute('data-id');
    var c = curso(id);
    if (!c) return;
    var inscs = D().inscripciones.filter(function (i) { return i.cursoId === id; }).length;
    if (!confirmar('¿Eliminar el curso «' + c.titulo + '»?' + (inscs ? ' Se borrarán ' + inscs + ' inscripciones (los certificados emitidos se conservan).' : ''))) return;
    D().cursos = D().cursos.filter(function (x) { return x.id !== id; });
    D().inscripciones = D().inscripciones.filter(function (i) { return i.cursoId !== id; });
    D().programas.forEach(function (pr) {
      pr.cursoIds = (pr.cursoIds || []).filter(function (x) { return x !== id; });
    });
    guardar();
    estado.cursoEditId = null;
    toast('Curso eliminado.');
    render();
  };

  /* ---------- módulos ---------- */

  function formularioModulo(cursoId, m) {
    var tipo = m ? m.tipo : 'texto';
    var ficha = m && m.archivoId ? Almacen.fichaArchivo(m.archivoId) : null;
    return '<h3>' + (m ? 'Editar módulo' : 'Nuevo módulo') + '</h3>' +
      '<form data-form="guardarModulo" data-curso="' + atr(cursoId) + '" data-id="' + atr(m ? m.id : '') + '">' +
      '<div class="campo"><label>Título *</label><input type="text" name="titulo" required value="' + atr(m ? m.titulo : '') + '"></div>' +
      '<div class="grilla grilla-2">' +
      '<div class="campo"><label>Tipo</label><select name="tipo" data-accion-cambio="cambioTipoModulo">' +
      Object.keys(TIPOS_MODULO).map(function (t) {
        return '<option value="' + t + '"' + (tipo === t ? ' selected' : '') + '>' + esc(TIPOS_MODULO[t]) + '</option>';
      }).join('') + '</select></div>' +
      '<div class="campo"><label>Duración (minutos)</label><input type="number" name="duracionMin" min="0" value="' + atr(m && m.duracionMin || '') + '"></div></div>' +

      '<div data-zona-tipo="texto" style="display:' + (tipo === 'texto' ? 'block' : 'none') + '">' +
      '<div class="campo"><label>Contenido de la lección</label>' +
      '<textarea name="contenido" rows="10" placeholder="Escribe la lección. Usa «## » para subtítulos, «- » para listas y **negrita**.">' + esc(m && m.contenido || '') + '</textarea></div></div>' +

      '<div data-zona-tipo="video" style="display:' + (tipo === 'video' ? 'block' : 'none') + '">' +
      '<div class="campo"><label>Enlace del video (YouTube, Vimeo o .mp4)</label>' +
      '<input type="url" name="videoUrl" value="' + atr(m && m.videoUrl || '') + '" placeholder="https://www.youtube.com/watch?v=…"></div>' +
      '<div class="campo"><label>… o sube un archivo de video</label>' +
      '<input type="file" name="videoArchivo" accept="video/*">' +
      (ficha && tipo === 'video' ? '<div class="ayuda">Actual: ' + esc(ficha.nombre) + ' (' + tamanoLegible(ficha.tamano) + ')</div>' : '') +
      '<div class="ayuda">El video queda guardado en este dispositivo (recomendado &lt; 100 MB).</div></div></div>' +

      '<div data-zona-tipo="archivo" style="display:' + (tipo === 'archivo' ? 'block' : 'none') + '">' +
      '<div class="campo"><label>Archivo (PDF, imagen, documento)</label>' +
      '<input type="file" name="archivoAdjunto">' +
      (ficha && tipo === 'archivo' ? '<div class="ayuda">Actual: ' + esc(ficha.nombre) + ' (' + tamanoLegible(ficha.tamano) + ')</div>' : '') +
      '</div></div>' +

      '<div data-zona-tipo="enlace" style="display:' + (tipo === 'enlace' ? 'block' : 'none') + '">' +
      '<div class="campo"><label>Enlace externo</label>' +
      '<input type="url" name="enlaceUrl" value="' + atr(m && m.enlaceUrl || '') + '" placeholder="https://…"></div></div>' +

      '<div class="campo"><label>Indicaciones para el colaborador (opcional)</label>' +
      '<textarea name="indicaciones" rows="2">' + esc(m && m.indicaciones || '') + '</textarea></div>' +
      '<button class="boton" type="submit">Guardar módulo</button></form>';
  }

  acciones.nuevoModulo = function (el) {
    abrirModal(formularioModulo(el.getAttribute('data-curso'), null));
  };

  acciones.editarModulo = function (el) {
    var c = curso(el.getAttribute('data-curso'));
    var m = c && c.modulos.find(function (x) { return x.id === el.getAttribute('data-id'); });
    if (m) abrirModal(formularioModulo(c.id, m));
  };

  acciones.cambioTipoModulo = function (el) {
    var form = el.closest('form');
    var tipo = el.value;
    form.querySelectorAll('[data-zona-tipo]').forEach(function (z) {
      z.style.display = z.getAttribute('data-zona-tipo') === tipo ? 'block' : 'none';
    });
  };

  formularios.guardarModulo = function (form) {
    var c = curso(form.getAttribute('data-curso'));
    if (!c) return;
    var id = form.getAttribute('data-id');
    var m = id ? c.modulos.find(function (x) { return x.id === id; }) : null;
    if (!m) {
      m = { id: L.crearId('mod') };
      c.modulos.push(m);
    }
    m.titulo = form.titulo.value.trim() || 'Módulo';
    m.tipo = form.tipo.value;
    m.duracionMin = Number(form.duracionMin.value) || 0;
    m.indicaciones = form.indicaciones.value.trim();
    m.contenido = form.contenido.value;
    m.videoUrl = form.videoUrl.value.trim();
    m.enlaceUrl = form.enlaceUrl.value.trim();

    var promesa = Promise.resolve();
    var archivoVideo = form.videoArchivo.files[0];
    var archivoAdjunto = form.archivoAdjunto.files[0];
    var subir = null;
    if (m.tipo === 'video' && archivoVideo) subir = archivoVideo;
    if (m.tipo === 'archivo' && archivoAdjunto) subir = archivoAdjunto;
    if (subir) {
      if (subir.size > 250 * 1048576) { toast('El archivo supera los 250 MB.', true); return; }
      var ficha = {
        id: L.crearId('arc'), nombre: subir.name, tipo: subir.type || 'application/octet-stream',
        tamano: subir.size, creadoEn: L.hoyISO()
      };
      promesa = Almacen.registrarArchivo(ficha, subir).then(function () {
        m.archivoId = ficha.id;
        if (m.tipo === 'video') m.videoUrl = '';
      });
    }
    promesa.then(function () {
      guardar();
      cerrarModal();
      toast('Módulo guardado.');
      render();
    }).catch(function (e) {
      toast(e.message || 'No se pudo guardar el archivo.', true);
    });
  };

  acciones.moverModulo = function (el) {
    var c = curso(el.getAttribute('data-curso'));
    if (!c) return;
    var id = el.getAttribute('data-id');
    var dir = Number(el.getAttribute('data-dir'));
    var i = c.modulos.findIndex(function (m) { return m.id === id; });
    var j = i + dir;
    if (i < 0 || j < 0 || j >= c.modulos.length) return;
    var t = c.modulos[i]; c.modulos[i] = c.modulos[j]; c.modulos[j] = t;
    guardar();
    render();
  };

  acciones.eliminarModulo = function (el) {
    var c = curso(el.getAttribute('data-curso'));
    if (!c) return;
    var id = el.getAttribute('data-id');
    var m = c.modulos.find(function (x) { return x.id === id; });
    if (!m || !confirmar('¿Eliminar el módulo «' + m.titulo + '»?')) return;
    if (m.archivoId) Almacen.eliminarArchivo(m.archivoId);
    c.modulos = c.modulos.filter(function (x) { return x.id !== id; });
    guardar();
    render();
  };

  /* ---------- evaluación del curso ---------- */

  function seccionEvaluacion(c) {
    var ev = c.evaluacion;
    var html = '<div class="tarjeta"><div class="fila-botones" style="justify-content:space-between">' +
      '<h2 style="margin:0">Evaluación</h2>' +
      '<label class="opcion-marcable" style="margin:0"><input type="checkbox" data-accion-cambio="alternarEvaluacion" data-curso="' + atr(c.id) + '"' +
      (ev.activa ? ' checked' : '') + '> Curso con evaluación</label></div>';
    if (!ev.activa) return html + '<p style="color:var(--texto2);margin-top:8px">Sin evaluación: el curso se completa al terminar los módulos.</p></div>';

    html += '<form data-form="guardarConfigEvaluacion" data-curso="' + atr(c.id) + '" style="margin-top:10px">' +
      '<div class="grilla grilla-3">' +
      '<div class="campo"><label>Nota de aprobación (%)</label><input type="number" name="notaAprobacion" min="1" max="100" value="' + atr(ev.notaAprobacion) + '"></div>' +
      '<div class="campo"><label>Intentos máximos</label><input type="number" name="intentosMax" min="0" value="' + atr(ev.intentosMax || 0) + '">' +
      '<div class="ayuda">0 = intentos ilimitados</div></div>' +
      '<div class="campo"><label>Orden de preguntas</label><select name="barajar">' +
      '<option value="1"' + (ev.barajar ? ' selected' : '') + '>Al azar en cada intento</option>' +
      '<option value=""' + (!ev.barajar ? ' selected' : '') + '>Orden fijo</option></select></div></div>' +
      '<button class="boton chico secundario" type="submit">Guardar configuración</button></form>';

    html += '<div class="fila-botones" style="justify-content:space-between;margin-top:16px">' +
      '<h3 style="margin:0">Preguntas (' + ev.preguntas.length + ')</h3>' +
      '<div class="fila-botones">' +
      '<button class="boton secundario chico" data-accion="preguntasConIA" data-curso="' + atr(c.id) + '">✨ Generar con IA</button>' +
      '<button class="boton chico" data-accion="nuevaPregunta" data-curso="' + atr(c.id) + '">+ Pregunta</button></div></div>';
    if (!ev.preguntas.length) {
      html += '<div class="vacio" style="margin-top:10px">Sin preguntas. Créalas a mano o genéralas con IA desde el contenido del curso.</div>';
    } else {
      html += ev.preguntas.map(function (p, i) {
        return '<div class="fila-lista"><div style="color:var(--texto2)">' + (i + 1) + '</div>' +
          '<div class="principal"><div class="nombre">' + esc(p.texto) + '</div>' +
          '<div class="detalle">' + esc(L.TIPOS_PREGUNTA[p.tipo] || p.tipo) + ' · ' + (p.opciones || []).length + ' opciones</div></div>' +
          '<button class="boton chico secundario" data-accion="editarPregunta" data-curso="' + atr(c.id) + '" data-id="' + atr(p.id) + '">Editar</button>' +
          '<button class="boton chico peligro" data-accion="eliminarPregunta" data-curso="' + atr(c.id) + '" data-id="' + atr(p.id) + '">✕</button></div>';
      }).join('');
    }
    return html + '</div>';
  }

  acciones.alternarEvaluacion = function (el) {
    var c = curso(el.getAttribute('data-curso'));
    if (!c) return;
    c.evaluacion.activa = el.checked;
    guardar();
    render();
  };

  formularios.guardarConfigEvaluacion = function (form) {
    var c = curso(form.getAttribute('data-curso'));
    if (!c) return;
    c.evaluacion.notaAprobacion = Math.min(100, Math.max(1, Number(form.notaAprobacion.value) || 70));
    c.evaluacion.intentosMax = Math.max(0, Math.round(Number(form.intentosMax.value) || 0));
    c.evaluacion.barajar = !!form.barajar.value;
    guardar();
    toast('Configuración de la evaluación guardada.');
    render();
  };

  function abrirEditorPregunta(cursoId, preguntaId) {
    var c = curso(cursoId);
    if (!c) return;
    var p = preguntaId ? c.evaluacion.preguntas.find(function (x) { return x.id === preguntaId; }) : null;
    estado.preguntaEdit = {
      cursoId: cursoId,
      preguntaId: preguntaId || null,
      datos: p ? JSON.parse(JSON.stringify(p)) : {
        tipo: 'unica', texto: '', opciones: ['', ''], correctas: [], explicacion: ''
      }
    };
    if (estado.preguntaEdit.datos.tipo === 'vf' && estado.preguntaEdit.datos.opciones.length !== 2) {
      estado.preguntaEdit.datos.opciones = ['Verdadero', 'Falso'];
    }
    renderModalPregunta();
  }

  function renderModalPregunta() {
    var pe = estado.preguntaEdit;
    if (!pe) return;
    var d = pe.datos;
    var esVF = d.tipo === 'vf';
    var esMultiple = d.tipo === 'multiple';
    var html = '<h3>' + (pe.preguntaId ? 'Editar pregunta' : 'Nueva pregunta') + '</h3>' +
      '<div class="campo"><label>Tipo</label><select data-accion-cambio="preguntaTipo">' +
      Object.keys(L.TIPOS_PREGUNTA).map(function (t) {
        return '<option value="' + t + '"' + (d.tipo === t ? ' selected' : '') + '>' + esc(L.TIPOS_PREGUNTA[t]) + '</option>';
      }).join('') + '</select></div>' +
      '<div class="campo"><label>Enunciado *</label><textarea rows="2" data-accion-entrada="preguntaTexto">' + esc(d.texto) + '</textarea></div>' +
      '<label style="font-size:.82rem;color:var(--texto2);font-weight:600">Opciones — marca la' + (esMultiple ? 's' : '') + ' correcta' + (esMultiple ? 's' : '') + '</label>';
    html += d.opciones.map(function (op, i) {
      var marcada = d.correctas.indexOf(i) !== -1;
      return '<div class="opcion-marcable' + (marcada ? ' correcta' : '') + '">' +
        '<input type="' + (esMultiple ? 'checkbox' : 'radio') + '" name="correcta-modal" data-accion-cambio="preguntaCorrecta" data-indice="' + i + '"' + (marcada ? ' checked' : '') + '>' +
        '<input type="text" style="flex:1;background:none;border:none;outline:none;color:var(--texto)" data-accion-entrada="preguntaOpcion" data-indice="' + i + '" value="' + atr(op) + '" placeholder="Opción ' + (i + 1) + '"' + (esVF ? ' readonly' : '') + '>' +
        (!esVF && d.opciones.length > 2 ? '<button class="boton chico peligro" type="button" data-accion="preguntaQuitarOpcion" data-indice="' + i + '">✕</button>' : '') +
        '</div>';
    }).join('');
    if (!esVF) {
      html += '<button class="boton chico secundario" type="button" data-accion="preguntaAgregarOpcion">+ Agregar opción</button>';
    }
    html += '<div class="campo" style="margin-top:12px"><label>Explicación de la respuesta (opcional, se muestra tras corregir)</label>' +
      '<textarea rows="2" data-accion-entrada="preguntaExplicacion">' + esc(d.explicacion || '') + '</textarea></div>' +
      '<div class="fila-botones"><button class="boton" data-accion="preguntaGuardar">Guardar pregunta</button></div>';
    abrirModal(html);
  }

  acciones.nuevaPregunta = function (el) { abrirEditorPregunta(el.getAttribute('data-curso'), null); };
  acciones.editarPregunta = function (el) {
    abrirEditorPregunta(el.getAttribute('data-curso'), el.getAttribute('data-id'));
  };

  acciones.preguntaTipo = function (el) {
    var d = estado.preguntaEdit.datos;
    d.tipo = el.value;
    if (d.tipo === 'vf') { d.opciones = ['Verdadero', 'Falso']; d.correctas = []; }
    if (d.tipo === 'unica' && d.correctas.length > 1) d.correctas = [d.correctas[0]];
    renderModalPregunta();
  };
  acciones.preguntaTexto = function (el) { estado.preguntaEdit.datos.texto = el.value; };
  acciones.preguntaExplicacion = function (el) { estado.preguntaEdit.datos.explicacion = el.value; };
  acciones.preguntaOpcion = function (el) {
    estado.preguntaEdit.datos.opciones[Number(el.getAttribute('data-indice'))] = el.value;
  };
  acciones.preguntaCorrecta = function (el) {
    var d = estado.preguntaEdit.datos;
    var i = Number(el.getAttribute('data-indice'));
    if (d.tipo === 'multiple') {
      if (el.checked) { if (d.correctas.indexOf(i) === -1) d.correctas.push(i); }
      else d.correctas = d.correctas.filter(function (x) { return x !== i; });
    } else {
      d.correctas = [i];
    }
    renderModalPregunta();
  };
  acciones.preguntaAgregarOpcion = function () {
    estado.preguntaEdit.datos.opciones.push('');
    renderModalPregunta();
  };
  acciones.preguntaQuitarOpcion = function (el) {
    var d = estado.preguntaEdit.datos;
    var i = Number(el.getAttribute('data-indice'));
    d.opciones.splice(i, 1);
    d.correctas = d.correctas
      .filter(function (x) { return x !== i; })
      .map(function (x) { return x > i ? x - 1 : x; });
    renderModalPregunta();
  };

  acciones.preguntaGuardar = function () {
    var pe = estado.preguntaEdit;
    if (!pe) return;
    var c = curso(pe.cursoId);
    if (!c) return;
    var d = pe.datos;
    d.texto = d.texto.trim();
    d.opciones = d.opciones.map(function (o) { return String(o).trim(); });
    if (!d.texto) { toast('Escribe el enunciado.', true); return; }
    if (d.opciones.some(function (o) { return !o; })) { toast('Hay opciones vacías.', true); return; }
    if (!d.correctas.length) { toast('Marca la respuesta correcta.', true); return; }
    if (pe.preguntaId) {
      var i = c.evaluacion.preguntas.findIndex(function (x) { return x.id === pe.preguntaId; });
      if (i !== -1) c.evaluacion.preguntas[i] = Object.assign({ id: pe.preguntaId }, d);
    } else {
      c.evaluacion.preguntas.push(Object.assign({ id: L.crearId('preg') }, d));
    }
    guardar();
    cerrarModal();
    toast('Pregunta guardada.');
    render();
  };

  acciones.eliminarPregunta = function (el) {
    var c = curso(el.getAttribute('data-curso'));
    if (!c || !confirmar('¿Eliminar esta pregunta?')) return;
    var id = el.getAttribute('data-id');
    c.evaluacion.preguntas = c.evaluacion.preguntas.filter(function (p) { return p.id !== id; });
    guardar();
    render();
  };

  acciones.preguntasConIA = function (el) {
    estado.vistaAdmin = 'ia';
    estado.ia.cursoDestinoId = el.getAttribute('data-curso');
    render();
    toast('Usa «Generar evaluación» con el curso ya seleccionado.');
  };

  /* ---------- material del curso ---------- */

  function seccionMaterial(c) {
    var html = '<div class="tarjeta"><div class="fila-botones" style="justify-content:space-between">' +
      '<h2 style="margin:0">Material de apoyo (' + (c.materialIds || []).length + ')</h2>' +
      '<label class="boton chico secundario" style="cursor:pointer">Subir material' +
      '<input type="file" multiple style="display:none" data-accion-cambio="subirMaterial" data-curso="' + atr(c.id) + '"></label></div>';
    var fichas = (c.materialIds || []).map(Almacen.fichaArchivo.bind(Almacen)).filter(Boolean);
    if (!fichas.length) {
      html += '<div class="vacio" style="margin-top:10px">Sin material adjunto. Sube PDF, guías, planillas u otros documentos de apoyo.</div>';
    } else {
      html += fichas.map(function (f) {
        return '<div class="fila-lista"><div>📎</div><div class="principal"><div class="nombre">' + esc(f.nombre) + '</div>' +
          '<div class="detalle">' + tamanoLegible(f.tamano) + '</div></div>' +
          '<button class="boton chico secundario" data-accion="descargarMaterial" data-id="' + atr(f.id) + '">Descargar</button>' +
          '<button class="boton chico peligro" data-accion="quitarMaterial" data-curso="' + atr(c.id) + '" data-id="' + atr(f.id) + '">✕</button></div>';
      }).join('');
    }
    return html + '</div>';
  }

  acciones.subirMaterial = function (el) {
    var c = curso(el.getAttribute('data-curso'));
    if (!c) return;
    var archivos = Array.prototype.slice.call(el.files || []);
    if (!archivos.length) return;
    var promesas = archivos.map(function (archivo) {
      if (archivo.size > 250 * 1048576) {
        toast('«' + archivo.name + '» supera los 250 MB; se omitió.', true);
        return Promise.resolve();
      }
      var ficha = {
        id: L.crearId('arc'), nombre: archivo.name, tipo: archivo.type || 'application/octet-stream',
        tamano: archivo.size, creadoEn: L.hoyISO()
      };
      return Almacen.registrarArchivo(ficha, archivo).then(function () {
        c.materialIds = c.materialIds || [];
        c.materialIds.push(ficha.id);
      });
    });
    el.value = '';
    Promise.all(promesas).then(function () {
      guardar();
      toast('Material subido.');
      render();
    }).catch(function (e) { toast(e.message || 'Error al subir material.', true); });
  };

  acciones.descargarMaterial = function (el) {
    var id = el.getAttribute('data-id');
    var ficha = Almacen.fichaArchivo(id);
    Almacen.obtenerArchivo(id).then(function (blob) {
      if (!blob) { toast('El archivo no está en este dispositivo.', true); return; }
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = ficha ? ficha.nombre : 'archivo';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    });
  };

  acciones.quitarMaterial = function (el) {
    var c = curso(el.getAttribute('data-curso'));
    if (!c || !confirmar('¿Quitar este material del curso?')) return;
    var id = el.getAttribute('data-id');
    c.materialIds = (c.materialIds || []).filter(function (x) { return x !== id; });
    D().archivos = D().archivos.filter(function (a) { return a.id !== id; });
    Almacen.eliminarArchivo(id);
    guardar();
    render();
  };

  /* ---------- inscripciones ---------- */

  function inscribir(personaId, cursoId, programaId) {
    if (inscripcionDe(personaId, cursoId)) return false;
    D().inscripciones.push({
      id: L.crearId('ins'), personaId: personaId, cursoId: cursoId,
      programaId: programaId || null, modulosCompletados: [], intentos: [],
      completadoEn: null, venceEn: null, certificadoId: null, creadoEn: L.hoyISO()
    });
    return true;
  }

  acciones.asignarPersonas = function (el) {
    var c = curso(el.getAttribute('data-curso'));
    if (!c) return;
    if (!D().personas.length) { toast('Primero registra personas en la pestaña Personas.', true); return; }
    var html = '<h3>Asignar personas a «' + esc(c.titulo) + '»</h3>' +
      '<form data-form="asignarPersonas" data-curso="' + atr(c.id) + '">' +
      D().personas.filter(function (p) { return p.activo !== false; }).map(function (p) {
        var ya = !!inscripcionDe(p.id, c.id);
        return '<label class="opcion-marcable"><input type="checkbox" name="p" value="' + atr(p.id) + '"' +
          (ya ? ' checked disabled' : '') + '> <span>' + esc(p.nombre) +
          (p.area ? ' <span style="color:var(--texto2)">· ' + esc(p.area) + '</span>' : '') +
          (ya ? ' <span class="chip completado">ya asignada</span>' : '') + '</span></label>';
      }).join('') +
      '<button class="boton" type="submit">Asignar seleccionadas</button></form>';
    abrirModal(html);
  };

  formularios.asignarPersonas = function (form) {
    var cursoId = form.getAttribute('data-curso');
    var nuevas = 0;
    form.querySelectorAll('input[name="p"]:checked:not(:disabled)').forEach(function (ch) {
      if (inscribir(ch.value, cursoId, null)) nuevas++;
    });
    guardar();
    cerrarModal();
    toast(nuevas + ' persona' + (nuevas === 1 ? '' : 's') + ' asignada' + (nuevas === 1 ? '' : 's') + '.');
    render();
  };

  acciones.quitarInscripcion = function (el) {
    var insc = inscripcion(el.getAttribute('data-id'));
    if (!insc) return;
    var p = persona(insc.personaId);
    if (!confirmar('¿Quitar la inscripción de ' + (p ? p.nombre : 'esta persona') + '? Su avance en este curso se perderá.')) return;
    D().inscripciones = D().inscripciones.filter(function (i) { return i.id !== insc.id; });
    guardar();
    render();
  };

  /* ---------- administración: programas ---------- */

  function vistaProgramas() {
    var html = '<div class="fila-botones" style="justify-content:space-between;margin-bottom:12px">' +
      '<h2 style="margin:0">Programas de capacitación</h2>' +
      '<button class="boton" data-accion="nuevoPrograma">+ Nuevo programa</button></div>' +
      '<div class="aviso info">Un programa agrupa varios cursos (p. ej. «Inducción», «Obligatorios legales 2026») ' +
      'y los asigna de una vez a un grupo de personas.</div>';
    if (!D().programas.length) {
      return html + '<div class="vacio">No hay programas creados.</div>';
    }
    html += D().programas.map(function (pr) {
      var cursos = (pr.cursoIds || []).map(curso).filter(Boolean);
      var personas = (pr.personaIds || []).map(persona).filter(Boolean);
      var inscs = D().inscripciones.filter(function (i) { return i.programaId === pr.id; });
      var completas = inscs.filter(function (i) {
        var c = curso(i.cursoId);
        return c && L.estadoInscripcion(c, i) === 'completado';
      }).length;
      return '<div class="tarjeta"><div class="fila-botones" style="justify-content:space-between">' +
        '<h3 style="margin:0">' + esc(pr.nombre) + (pr.obligatorio ? ' <span class="chip vencido">Obligatorio</span>' : '') + '</h3>' +
        '<div class="fila-botones">' +
        '<button class="boton chico secundario" data-accion="editarPrograma" data-id="' + atr(pr.id) + '">Editar</button>' +
        '<button class="boton chico peligro" data-accion="eliminarPrograma" data-id="' + atr(pr.id) + '">Eliminar</button></div></div>' +
        (pr.descripcion ? '<p style="color:var(--texto2)">' + esc(pr.descripcion) + '</p>' : '') +
        '<div class="fila-botones" style="color:var(--texto2);font-size:.82rem;gap:14px">' +
        '<span>📚 ' + cursos.length + ' cursos</span><span>👥 ' + personas.length + ' personas</span>' +
        '<span>✅ ' + completas + '/' + inscs.length + ' completadas</span></div>' +
        (cursos.length ? '<div style="margin-top:8px">' + cursos.map(function (c) {
          return '<span class="chip categoria" style="margin:2px">' + esc(c.titulo) + '</span>';
        }).join('') + '</div>' : '') +
        '</div>';
    }).join('');
    return html;
  }

  function formularioPrograma(pr) {
    var cursosMarcados = pr ? (pr.cursoIds || []) : [];
    var personasMarcadas = pr ? (pr.personaIds || []) : [];
    return '<h3>' + (pr ? 'Editar programa' : 'Nuevo programa') + '</h3>' +
      '<form data-form="guardarPrograma" data-id="' + atr(pr ? pr.id : '') + '">' +
      '<div class="campo"><label>Nombre *</label><input type="text" name="nombre" required value="' + atr(pr ? pr.nombre : '') + '"></div>' +
      '<div class="campo"><label>Descripción</label><textarea name="descripcion" rows="2">' + esc(pr ? pr.descripcion || '' : '') + '</textarea></div>' +
      '<div class="campo"><label class="opcion-marcable" style="margin:0"><input type="checkbox" name="obligatorio"' + (pr && pr.obligatorio ? ' checked' : '') + '> Programa obligatorio (p. ej. exigencia legal)</label></div>' +
      '<div class="campo"><label>Cursos incluidos</label>' +
      (D().cursos.length ? D().cursos.map(function (c) {
        return '<label class="opcion-marcable"><input type="checkbox" name="c" value="' + atr(c.id) + '"' +
          (cursosMarcados.indexOf(c.id) !== -1 ? ' checked' : '') + '> <span>' + esc(c.titulo) +
          (!c.publicado ? ' <span class="chip borrador">borrador</span>' : '') + '</span></label>';
      }).join('') : '<div class="ayuda">No hay cursos aún.</div>') + '</div>' +
      '<div class="campo"><label>Personas asignadas</label>' +
      (D().personas.length ? D().personas.filter(function (p) { return p.activo !== false; }).map(function (p) {
        return '<label class="opcion-marcable"><input type="checkbox" name="p" value="' + atr(p.id) + '"' +
          (personasMarcadas.indexOf(p.id) !== -1 ? ' checked' : '') + '> <span>' + esc(p.nombre) +
          (p.area ? ' <span style="color:var(--texto2)">· ' + esc(p.area) + '</span>' : '') + '</span></label>';
      }).join('') : '<div class="ayuda">No hay personas aún.</div>') + '</div>' +
      '<div class="aviso info">Al guardar se crean las inscripciones que falten para cada persona × curso del programa.</div>' +
      '<button class="boton" type="submit">Guardar programa</button></form>';
  }

  acciones.nuevoPrograma = function () { abrirModal(formularioPrograma(null)); };
  acciones.editarPrograma = function (el) {
    var pr = programa(el.getAttribute('data-id'));
    if (pr) abrirModal(formularioPrograma(pr));
  };

  formularios.guardarPrograma = function (form) {
    var id = form.getAttribute('data-id');
    var pr = id ? programa(id) : null;
    if (!pr) {
      pr = { id: L.crearId('prog'), creadoEn: L.hoyISO() };
      D().programas.push(pr);
    }
    pr.nombre = form.nombre.value.trim() || 'Programa';
    pr.descripcion = form.descripcion.value.trim();
    pr.obligatorio = form.obligatorio.checked;
    pr.cursoIds = Array.prototype.map.call(form.querySelectorAll('input[name="c"]:checked'), function (x) { return x.value; });
    pr.personaIds = Array.prototype.map.call(form.querySelectorAll('input[name="p"]:checked'), function (x) { return x.value; });
    var nuevas = 0;
    pr.personaIds.forEach(function (pid) {
      pr.cursoIds.forEach(function (cid) {
        if (inscribir(pid, cid, pr.id)) nuevas++;
      });
    });
    guardar();
    cerrarModal();
    toast('Programa guardado' + (nuevas ? ' (' + nuevas + ' inscripciones nuevas)' : '') + '.');
    render();
  };

  acciones.eliminarPrograma = function (el) {
    var pr = programa(el.getAttribute('data-id'));
    if (!pr) return;
    if (!confirmar('¿Eliminar el programa «' + pr.nombre + '»? Las inscripciones ya creadas se conservan.')) return;
    D().programas = D().programas.filter(function (x) { return x.id !== pr.id; });
    D().inscripciones.forEach(function (i) { if (i.programaId === pr.id) i.programaId = null; });
    guardar();
    render();
  };

  /* ---------- administración: seguimiento ---------- */

  function filasFiltradas() {
    var filas = L.filasSeguimiento(D());
    var f = estado.filtros;
    return filas.filter(function (fila) {
      if (f.curso && fila.cursoId !== f.curso) return false;
      if (f.categoria && fila.categoriaId !== f.categoria) return false;
      if (f.estado && fila.estado !== f.estado) return false;
      if (f.area && fila.area !== f.area) return false;
      if (f.texto && L.normalizar(fila.persona + ' ' + fila.correo).indexOf(L.normalizar(f.texto)) === -1) return false;
      if (!f.incluirInactivos && !fila.activo) return false;
      return true;
    });
  }

  function vistaSeguimiento() {
    var f = estado.filtros;
    var areas = {};
    D().personas.forEach(function (p) { if (p.area) areas[p.area] = true; });
    var filas = filasFiltradas();

    var html = '<div class="tarjeta"><h2>Seguimiento del personal capacitado</h2>' +
      '<div class="grilla grilla-3">' +
      '<div class="campo"><label>Buscar persona</label><input type="text" data-filtro="texto" value="' + atr(f.texto || '') + '" placeholder="Nombre o correo…"></div>' +
      '<div class="campo"><label>Curso</label><select data-filtro="curso"><option value="">Todos</option>' +
      D().cursos.map(function (c) {
        return '<option value="' + atr(c.id) + '"' + (f.curso === c.id ? ' selected' : '') + '>' + esc(c.titulo) + '</option>';
      }).join('') + '</select></div>' +
      '<div class="campo"><label>Categoría</label><select data-filtro="categoria"><option value="">Todas</option>' +
      D().config.categorias.map(function (c) {
        return '<option value="' + atr(c.id) + '"' + (f.categoria === c.id ? ' selected' : '') + '>' + esc(c.nombre) + '</option>';
      }).join('') + '</select></div>' +
      '<div class="campo"><label>Estado</label><select data-filtro="estado"><option value="">Todos</option>' +
      Object.keys(L.ETIQUETAS_ESTADO).map(function (e) {
        return '<option value="' + e + '"' + (f.estado === e ? ' selected' : '') + '>' + esc(L.ETIQUETAS_ESTADO[e]) + '</option>';
      }).join('') + '</select></div>' +
      '<div class="campo"><label>Área</label><select data-filtro="area"><option value="">Todas</option>' +
      Object.keys(areas).sort().map(function (a) {
        return '<option value="' + atr(a) + '"' + (f.area === a ? ' selected' : '') + '>' + esc(a) + '</option>';
      }).join('') + '</select></div>' +
      '<div class="campo"><label>&nbsp;</label><label class="opcion-marcable" style="margin:0"><input type="checkbox" data-filtro-check="incluirInactivos"' + (f.incluirInactivos ? ' checked' : '') + '> Incluir personas inactivas</label></div>' +
      '</div>' +
      '<div class="fila-botones"><button class="boton secundario chico" data-accion="exportarCSV">⬇ Exportar CSV (' + filas.length + ')</button></div></div>';

    if (!filas.length) {
      return html + '<div class="vacio">No hay inscripciones que coincidan con los filtros.</div>';
    }

    html += '<div class="tarjeta"><div class="contenedor-tabla"><table><thead><tr>' +
      '<th>Persona</th><th>Curso</th><th>Estado</th><th>Avance</th><th>Nota</th><th>Completado</th><th>Vence</th><th></th>' +
      '</tr></thead><tbody>' +
      filas.map(function (fila) {
        return '<tr>' +
          '<td class="envolver"><strong>' + esc(fila.persona) + '</strong><br><span style="color:var(--texto2);font-size:.76rem">' + esc(fila.area || '') + '</span></td>' +
          '<td class="envolver">' + esc(fila.curso) + '<br><span style="color:var(--texto2);font-size:.76rem">' + esc(fila.categoria) + (fila.programa ? ' · ' + esc(fila.programa) : '') + '</span></td>' +
          '<td>' + chipEstado(fila.estado) + '</td>' +
          '<td>' + barraAvance(fila.avancePct) + '<span style="font-size:.72rem;color:var(--texto2)">' + fila.avancePct + '%</span></td>' +
          '<td>' + (fila.puntaje === null ? '—' : fila.puntaje + '%') + '</td>' +
          '<td>' + L.fechaCorta(fila.completadoEn) + '</td>' +
          '<td>' + (fila.venceEn ? L.fechaCorta(fila.venceEn) : '—') + '</td>' +
          '<td><button class="boton chico secundario" data-accion="detalleInscripcion" data-id="' + atr(fila.inscripcionId) + '">⋯</button></td>' +
          '</tr>';
      }).join('') + '</tbody></table></div></div>';
    return html;
  }

  acciones.exportarCSV = function () {
    var columnas = [
      { clave: 'persona', titulo: 'Persona' }, { clave: 'correo', titulo: 'Correo' },
      { clave: 'area', titulo: 'Área' }, { clave: 'curso', titulo: 'Curso' },
      { clave: 'categoria', titulo: 'Categoría' }, { clave: 'programa', titulo: 'Programa' },
      { clave: 'estadoTexto', titulo: 'Estado' }, { clave: 'avancePct', titulo: 'Avance %' },
      { clave: 'puntaje', titulo: 'Mejor nota' }, { clave: 'completadoEn', titulo: 'Completado' },
      { clave: 'venceEn', titulo: 'Vence' }
    ];
    descargarTexto('seguimiento-capacitaciones-' + L.hoyISO() + '.csv',
      L.aCSV(columnas, filasFiltradas()), 'text/csv;charset=utf-8');
  };

  acciones.detalleInscripcion = function (el) {
    var insc = inscripcion(el.getAttribute('data-id'));
    if (!insc) return;
    var c = curso(insc.cursoId);
    var p = persona(insc.personaId);
    if (!c || !p) return;
    var e = L.estadoInscripcion(c, insc);
    var av = L.avanceCurso(c, insc);
    var html = '<h3>' + esc(p.nombre) + '</h3><p style="color:var(--texto2)">' + esc(c.titulo) + '</p>' +
      '<p>' + chipEstado(e) + ' &nbsp; Avance: ' + av.pct + '% (' + av.modulosHechos + '/' + av.modulosTotal + ' módulos' +
      (av.requiereEval ? (av.evalAprobada ? ' + evaluación aprobada' : ' + evaluación pendiente') : '') + ')</p>';
    if ((insc.intentos || []).length) {
      html += '<h4>Intentos de evaluación</h4>' + insc.intentos.map(function (i, n) {
        return '<div class="fila-lista"><div class="principal"><div class="nombre">Intento ' + (n + 1) + ': ' + i.puntaje + '%</div>' +
          '<div class="detalle">' + L.fechaCorta(i.fecha) + '</div></div>' +
          '<span class="chip ' + (i.aprobado ? 'completado' : 'vencido') + '">' + (i.aprobado ? 'Aprobado' : 'Reprobado') + '</span></div>';
      }).join('');
    }
    html += '<div class="fila-botones" style="margin-top:14px">';
    if (e === 'reprobado') {
      html += '<button class="boton" data-accion="reiniciarIntentos" data-id="' + atr(insc.id) + '">Reiniciar intentos</button>';
    }
    if (e === 'vencido' || e === 'completado') {
      html += '<button class="boton" data-accion="reinscribir" data-id="' + atr(insc.id) + '">Reinscribir (recertificación)</button>';
    }
    if (insc.certificadoId) {
      html += '<button class="boton secundario" data-accion="verCertificado" data-id="' + atr(insc.certificadoId) + '">Ver certificado</button>';
    }
    html += '<button class="boton peligro" data-accion="quitarInscripcion" data-id="' + atr(insc.id) + '">Quitar inscripción</button></div>';
    abrirModal(html);
  };

  acciones.reiniciarIntentos = function (el) {
    var insc = inscripcion(el.getAttribute('data-id'));
    if (!insc) return;
    if (!confirmar('¿Reiniciar los intentos de evaluación de esta persona?')) return;
    insc.intentos = [];
    guardar();
    cerrarModal();
    toast('Intentos reiniciados: la persona puede volver a rendir.');
    render();
  };

  // Recertificación: reinicia el avance de la inscripción. El certificado
  // anterior queda en el registro histórico de certificados.
  acciones.reinscribir = function (el) {
    var insc = inscripcion(el.getAttribute('data-id'));
    if (!insc) return;
    var p = persona(insc.personaId);
    if (!confirmar('¿Reinscribir a ' + (p ? p.nombre : 'esta persona') + '? Deberá tomar el curso y aprobar de nuevo. El certificado anterior queda en el historial.')) return;
    insc.modulosCompletados = [];
    insc.intentos = [];
    insc.completadoEn = null;
    insc.venceEn = null;
    insc.certificadoId = null;
    guardar();
    cerrarModal();
    toast('Persona reinscrita.');
    render();
  };

  /* ---------- administración: certificados ---------- */

  function vistaCertificados() {
    var certs = D().certificados.slice().reverse();
    var html = '<div class="tarjeta"><h2>Verificar un certificado</h2>' +
      '<form data-form="verificarCertificado" class="fila-botones">' +
      '<input type="text" name="codigo" placeholder="Código (XXXX-XXXX-XXXX) o folio" style="flex:1;min-width:200px;background:var(--fondo2);border:1px solid var(--borde);border-radius:10px;padding:9px 12px;color:var(--texto)">' +
      '<button class="boton" type="submit">Verificar</button></form></div>';

    html += '<div class="tarjeta"><h2>Certificados emitidos (' + certs.length + ')</h2>';
    if (!certs.length) {
      html += '<div class="vacio">Aún no se han emitido certificados. Se generan automáticamente cuando una persona completa un curso.</div>';
    } else {
      html += '<div class="contenedor-tabla"><table><thead><tr>' +
        '<th>Folio</th><th>Persona</th><th>Curso</th><th>Emitido</th><th>Vence</th><th></th></tr></thead><tbody>' +
        certs.map(function (cert) {
          var vencido = cert.venceEn && cert.venceEn < L.hoyISO();
          return '<tr><td>' + esc(cert.folio) + '</td>' +
            '<td class="envolver">' + esc(cert.nombrePersona) + '</td>' +
            '<td class="envolver">' + esc(cert.tituloCurso) + '</td>' +
            '<td>' + L.fechaCorta(cert.fecha) + '</td>' +
            '<td>' + (cert.venceEn ? L.fechaCorta(cert.venceEn) + (vencido ? ' <span class="chip vencido">vencido</span>' : '') : 'No vence') + '</td>' +
            '<td><button class="boton chico secundario" data-accion="verCertificado" data-id="' + atr(cert.id) + '">Ver</button></td></tr>';
        }).join('') + '</tbody></table></div>';
    }
    html += '</div>';
    return html;
  }

  formularios.verificarCertificado = function (form) {
    var buscado = form.codigo.value.trim().toUpperCase();
    if (!buscado) return;
    var cert = D().certificados.find(function (c) {
      return c.codigoVerificacion === buscado || c.folio.toUpperCase() === buscado;
    });
    if (!cert) {
      abrirModal('<h3>Verificación</h3><div class="aviso peligro">No existe ningún certificado con el código <strong>' +
        esc(buscado) + '</strong> en este registro.</div>');
      return;
    }
    var vencido = cert.venceEn && cert.venceEn < L.hoyISO();
    abrirModal('<h3>Verificación</h3>' +
      '<div class="aviso ' + (vencido ? 'alerta' : 'info') + '">Certificado <strong>válido</strong>' +
      (vencido ? ', pero <strong>vencido</strong> el ' + L.fechaCorta(cert.venceEn) : '') + '.</div>' +
      '<p><strong>' + esc(cert.nombrePersona) + '</strong><br>' + esc(cert.tituloCurso) +
      '<br>Folio ' + esc(cert.folio) + ' · emitido el ' + L.fechaCorta(cert.fecha) + '</p>' +
      '<button class="boton" data-accion="verCertificado" data-id="' + atr(cert.id) + '">Ver certificado</button>');
  };

  acciones.verCertificado = function (el) {
    var cert = certificado(el.getAttribute('data-id'));
    if (!cert) { toast('Certificado no encontrado.', true); return; }
    estado.certVistaId = cert.id;
    abrirModal('<h3>Certificado ' + esc(cert.folio) + '</h3>' +
      '<div class="vista-certificado">' + Certificados.generarSVG(cert, D().config) + '</div>' +
      '<div class="fila-botones" style="margin-top:12px">' +
      '<button class="boton" data-accion="descargarCertPNG" data-id="' + atr(cert.id) + '">⬇ PNG</button>' +
      '<button class="boton secundario" data-accion="descargarCertSVG" data-id="' + atr(cert.id) + '">⬇ SVG</button>' +
      '<button class="boton secundario" data-accion="imprimirCert">🖨 Imprimir / PDF</button></div>' +
      '<p class="ayuda" style="color:var(--texto2);font-size:.76rem;margin-top:8px">Código de verificación: <code>' + esc(cert.codigoVerificacion) + '</code></p>');
  };

  acciones.descargarCertPNG = function (el) {
    var cert = certificado(el.getAttribute('data-id'));
    if (!cert) return;
    Certificados.descargarPNG(cert, D().config).catch(function (e) { toast(e.message, true); });
  };
  acciones.descargarCertSVG = function (el) {
    var cert = certificado(el.getAttribute('data-id'));
    if (cert) Certificados.descargarSVG(cert, D().config);
  };
  acciones.imprimirCert = function () { window.print(); };

  /* ---------- administración: asistente IA ---------- */

  function hayClaveIA() { return !!(D().config.ia && D().config.ia.clave); }

  function vistaIA() {
    var ia = D().config.ia;
    var html = '';

    if (!hayClaveIA()) {
      html += '<div class="tarjeta"><h2>✨ Asistente IA</h2>' +
        '<p>Crea cursos completos, evaluaciones, resúmenes y guías de estudio a partir de tus documentos ' +
        '(estilo NotebookLM), y conversa con tus fuentes.</p>' +
        '<div class="aviso info">Necesitas una clave de la API de Claude (Anthropic). Se obtiene en ' +
        '<strong>console.anthropic.com</strong> → API Keys. La clave se guarda <strong>solo en este dispositivo</strong> ' +
        'y nunca se incluye en los respaldos exportados.</div>' +
        '<form data-form="guardarClaveIA" class="fila-botones">' +
        '<input type="password" name="clave" placeholder="sk-ant-…" style="flex:1;min-width:220px;background:var(--fondo2);border:1px solid var(--borde);border-radius:10px;padding:9px 12px;color:var(--texto)">' +
        '<button class="boton" type="submit">Guardar clave</button></form></div>';
      return html;
    }

    var fuentes = D().iaFuentes || [];
    var ocupado = estado.ia.ocupado;

    html += '<div class="tarjeta"><div class="fila-botones" style="justify-content:space-between">' +
      '<h2 style="margin:0">📁 Fuentes (' + fuentes.length + ')</h2>' +
      '<div class="fila-botones">' +
      '<button class="boton chico secundario" data-accion="nuevaFuenteTexto">+ Pegar texto</button>' +
      '<label class="boton chico secundario" style="cursor:pointer">+ Subir PDF/TXT' +
      '<input type="file" multiple accept=".pdf,.txt,.md,text/plain,application/pdf" style="display:none" data-accion-cambio="subirFuente"></label>' +
      '</div></div>';
    if (!fuentes.length) {
      html += '<div class="vacio" style="margin-top:10px">Agrega el material base: normativas, manuales, procedimientos, presentaciones exportadas a PDF, etc.<br>La IA trabajará únicamente con estas fuentes.</div>';
    } else {
      html += fuentes.map(function (f) {
        return '<div class="fuente-item"><div class="icono">' + (f.tipo === 'pdf' ? '📕' : '📄') + '</div>' +
          '<div class="info"><div class="nombre">' + esc(f.nombre) + '</div>' +
          '<div class="detalle">' + (f.tipo === 'pdf' ? 'PDF · ' + tamanoLegible(f.tamano) : 'Texto · ' + (f.texto || '').length + ' caracteres') + '</div></div>' +
          '<button class="boton chico peligro" data-accion="eliminarFuente" data-id="' + atr(f.id) + '">✕</button></div>';
      }).join('');
    }
    html += '</div>';

    var opcionesCurso = D().cursos.map(function (c) {
      return '<option value="' + atr(c.id) + '"' + (estado.ia.cursoDestinoId === c.id ? ' selected' : '') + '>' + esc(c.titulo) + '</option>';
    }).join('');

    html += '<div class="grilla grilla-2">';

    html += '<div class="tarjeta"><h3>🎓 Generar curso completo</h3>' +
      '<p style="color:var(--texto2);font-size:.84rem">Crea un curso en borrador con módulos de aprendizaje y evaluación, listo para revisar y publicar.</p>' +
      '<form data-form="iaGenerarCurso">' +
      '<div class="grilla grilla-2">' +
      '<div class="campo"><label>Módulos</label><select name="numModulos">' +
      '<option value="">Automático</option><option>3</option><option>4</option><option>5</option><option>6</option><option>8</option></select></div>' +
      '<div class="campo"><label>Preguntas</label><input type="number" name="numPreguntas" min="3" max="30" value="8"></div></div>' +
      '<div class="campo"><label>Indicaciones (opcional)</label><input type="text" name="indicaciones" placeholder="p. ej. enfocado en personal de bodega"></div>' +
      '<button class="boton" type="submit"' + (ocupado || !fuentes.length ? ' disabled' : '') + '>Generar curso</button>' +
      (!fuentes.length ? '<div class="ayuda" style="margin-top:6px">Agrega al menos una fuente.</div>' : '') +
      '</form></div>';

    html += '<div class="tarjeta"><h3>📝 Generar evaluación</h3>' +
      '<p style="color:var(--texto2);font-size:.84rem">Crea preguntas para un curso existente, a partir de las fuentes o del contenido del curso.</p>' +
      (D().cursos.length ?
        '<form data-form="iaGenerarEvaluacion">' +
        '<div class="campo"><label>Curso destino</label><select name="cursoId">' + opcionesCurso + '</select></div>' +
        '<div class="grilla grilla-2">' +
        '<div class="campo"><label>Basada en</label><select name="base">' +
        (fuentes.length ? '<option value="fuentes">Las fuentes cargadas</option>' : '') +
        '<option value="curso">El contenido del curso</option></select></div>' +
        '<div class="campo"><label>Cantidad</label><input type="number" name="cantidad" min="3" max="30" value="8"></div></div>' +
        '<div class="campo"><label>Al guardar</label><select name="modo">' +
        '<option value="agregar">Agregar a las preguntas existentes</option>' +
        '<option value="reemplazar">Reemplazar las preguntas existentes</option></select></div>' +
        '<button class="boton" type="submit"' + (ocupado ? ' disabled' : '') + '>Generar preguntas</button></form>'
        : '<div class="ayuda">Primero crea un curso.</div>') +
      '</div>';

    html += '<div class="tarjeta"><h3>📋 Documentos de estudio</h3>' +
      '<p style="color:var(--texto2);font-size:.84rem">Resumen ejecutivo, guía de estudio o preguntas frecuentes a partir de las fuentes.</p>' +
      '<form data-form="iaGenerarDocumento" class="fila-botones">' +
      '<select name="tipo" style="flex:1;min-width:180px;background:var(--fondo2);border:1px solid var(--borde);border-radius:10px;padding:9px 12px;color:var(--texto)">' +
      '<option value="resumen">Resumen ejecutivo</option>' +
      '<option value="guia">Guía de estudio</option>' +
      '<option value="faq">Preguntas frecuentes</option></select>' +
      '<button class="boton" type="submit"' + (ocupado || !fuentes.length ? ' disabled' : '') + '>Generar</button></form></div>';

    html += '<div class="tarjeta"><h3>⚙️ Modelo</h3>' +
      '<form data-form="guardarModeloIA"><div class="campo"><select name="modelo">' +
      IA.MODELOS.map(function (m) {
        return '<option value="' + m.id + '"' + (ia.modelo === m.id ? ' selected' : '') + '>' + esc(m.nombre) + '</option>';
      }).join('') + '</select></div>' +
      '<div class="fila-botones"><button class="boton chico secundario" type="submit">Guardar</button>' +
      '<button class="boton chico peligro" type="button" data-accion="borrarClaveIA">Quitar clave de API</button></div></form></div>';

    html += '</div>'; // fin grilla

    if (ocupado || estado.ia.salida) {
      html += '<div class="tarjeta"><div class="fila-botones" style="justify-content:space-between">' +
        '<h3 style="margin:0">' + (ocupado ? '<span class="girando"></span> Generando…' : 'Resultado') + '</h3>' +
        (ocupado
          ? '<button class="boton chico peligro" data-accion="cancelarIA">Cancelar</button>'
          : '<div class="fila-botones">' +
            (estado.ia.tipoSalida === 'documento'
              ? '<button class="boton chico secundario" data-accion="copiarSalidaIA">Copiar</button>' +
                (D().cursos.length ? '<button class="boton chico secundario" data-accion="guardarSalidaComoModulo">Agregar como módulo…</button>' +
                '<button class="boton chico secundario" data-accion="guardarSalidaComoMaterial">Guardar como material…</button>' : '')
              : '') +
            '<button class="boton chico secundario" data-accion="limpiarSalidaIA">Limpiar</button></div>') +
        '</div>' +
        '<div class="salida-ia" id="salida-ia">' + esc(estado.ia.salida) + '</div></div>';
    }

    // chat con las fuentes
    html += '<div class="tarjeta"><h3>💬 Conversar con las fuentes</h3>';
    if (estado.ia.chat.length) {
      html += '<div class="burbujas" id="burbujas-chat">' + estado.ia.chat.map(function (m) {
        return '<div class="burbuja ' + (m.rol === 'usuario' ? 'usuario' : 'asistente') + '">' + esc(m.texto) + '</div>';
      }).join('') + '</div>';
    }
    html += '<form data-form="iaChat" class="fila-botones" style="margin-top:10px">' +
      '<input type="text" name="pregunta" placeholder="' + (fuentes.length ? 'Pregunta sobre tus fuentes…' : 'Agrega fuentes para conversar…') + '"' +
      (ocupado || !fuentes.length ? ' disabled' : '') +
      ' style="flex:1;min-width:200px;background:var(--fondo2);border:1px solid var(--borde);border-radius:10px;padding:9px 12px;color:var(--texto)">' +
      '<button class="boton" type="submit"' + (ocupado || !fuentes.length ? ' disabled' : '') + '>Enviar</button>' +
      (estado.ia.chat.length ? '<button class="boton secundario" type="button" data-accion="limpiarChatIA">Borrar conversación</button>' : '') +
      '</form></div>';

    return html;
  }

  formularios.guardarClaveIA = function (form) {
    var clave = form.clave.value.trim();
    if (!clave) { toast('Pega la clave de la API.', true); return; }
    D().config.ia.clave = clave;
    guardar();
    toast('Clave guardada en este dispositivo.');
    render();
  };

  acciones.borrarClaveIA = function () {
    if (!confirmar('¿Quitar la clave de la API de este dispositivo?')) return;
    D().config.ia.clave = '';
    guardar();
    render();
  };

  formularios.guardarModeloIA = function (form) {
    D().config.ia.modelo = form.modelo.value;
    guardar();
    toast('Modelo guardado.');
  };

  acciones.nuevaFuenteTexto = function () {
    abrirModal('<h3>Agregar fuente de texto</h3>' +
      '<form data-form="guardarFuenteTexto">' +
      '<div class="campo"><label>Nombre de la fuente *</label><input type="text" name="nombre" required placeholder="p. ej. Reglamento interno 2026"></div>' +
      '<div class="campo"><label>Contenido *</label><textarea name="texto" rows="10" required placeholder="Pega aquí el texto del documento…"></textarea></div>' +
      '<button class="boton" type="submit">Agregar fuente</button></form>');
  };

  formularios.guardarFuenteTexto = function (form) {
    var texto = form.texto.value.trim();
    if (texto.length > 400000) { toast('El texto es demasiado largo (máx. ~400.000 caracteres). Divídelo en varias fuentes.', true); return; }
    D().iaFuentes.push({
      id: L.crearId('fue'), tipo: 'texto',
      nombre: form.nombre.value.trim() || 'Fuente', texto: texto, creadoEn: L.hoyISO()
    });
    guardar();
    cerrarModal();
    toast('Fuente agregada.');
    render();
  };

  acciones.subirFuente = function (el) {
    var archivos = Array.prototype.slice.call(el.files || []);
    if (!archivos.length) return;
    var promesas = archivos.map(function (archivo) {
      var esPdf = archivo.type === 'application/pdf' || /\.pdf$/i.test(archivo.name);
      if (esPdf) {
        if (archivo.size > 20 * 1048576) {
          toast('«' + archivo.name + '» supera los 20 MB permitidos para PDF; se omitió.', true);
          return Promise.resolve();
        }
        var ficha = { id: L.crearId('arc'), nombre: archivo.name, tipo: 'application/pdf', tamano: archivo.size, creadoEn: L.hoyISO() };
        return Almacen.registrarArchivo(ficha, archivo).then(function () {
          D().iaFuentes.push({ id: L.crearId('fue'), tipo: 'pdf', nombre: archivo.name, archivoId: ficha.id, tamano: archivo.size, creadoEn: L.hoyISO() });
        });
      }
      return leerArchivo(archivo, 'texto').then(function (texto) {
        D().iaFuentes.push({ id: L.crearId('fue'), tipo: 'texto', nombre: archivo.name, texto: String(texto).slice(0, 400000), creadoEn: L.hoyISO() });
      });
    });
    el.value = '';
    Promise.all(promesas).then(function () {
      guardar();
      toast('Fuentes agregadas.');
      render();
    }).catch(function (e) { toast(e.message || 'No se pudo leer el archivo.', true); });
  };

  acciones.eliminarFuente = function (el) {
    var id = el.getAttribute('data-id');
    var f = (D().iaFuentes || []).find(function (x) { return x.id === id; });
    if (!f) return;
    if (f.archivoId) {
      Almacen.eliminarArchivo(f.archivoId);
      D().archivos = D().archivos.filter(function (a) { return a.id !== f.archivoId; });
    }
    D().iaFuentes = D().iaFuentes.filter(function (x) { return x.id !== id; });
    guardar();
    render();
  };

  // Prepara las fuentes para la API: los PDF se leen de IndexedDB a base64.
  function prepararFuentes() {
    var fuentes = D().iaFuentes || [];
    return Promise.all(fuentes.map(function (f) {
      if (f.tipo === 'pdf' && f.archivoId) {
        return Almacen.obtenerArchivo(f.archivoId).then(function (blob) {
          if (!blob) return null;
          return leerArchivo(blob).then(function (dataUrl) {
            return { tipo: 'pdf', nombre: f.nombre, base64: String(dataUrl).split(',')[1] || '' };
          });
        });
      }
      return Promise.resolve({ tipo: 'texto', nombre: f.nombre, texto: f.texto });
    })).then(function (lista) { return lista.filter(Boolean); });
  }

  function iniciarTrabajoIA(tipoSalida) {
    estado.ia.ocupado = true;
    estado.ia.salida = '';
    estado.ia.tipoSalida = tipoSalida;
    estado.ia.controlador = new AbortController();
    render();
  }

  function terminarTrabajoIA() {
    estado.ia.ocupado = false;
    estado.ia.controlador = null;
  }

  function alRecibirDelta(delta, total) {
    estado.ia.salida = total;
    var nodo = document.getElementById('salida-ia');
    if (nodo) {
      nodo.textContent = total;
      nodo.scrollTop = nodo.scrollHeight;
    }
  }

  acciones.cancelarIA = function () {
    if (estado.ia.controlador) estado.ia.controlador.abort();
  };

  acciones.limpiarSalidaIA = function () {
    estado.ia.salida = '';
    estado.ia.tipoSalida = null;
    render();
  };

  acciones.copiarSalidaIA = function () {
    navigator.clipboard.writeText(estado.ia.salida).then(function () {
      toast('Copiado al portapapeles.');
    }, function () { toast('No se pudo copiar.', true); });
  };

  formularios.iaGenerarCurso = function (form) {
    if (estado.ia.ocupado) return;
    var numModulos = form.numModulos.value;
    var numPreguntas = Number(form.numPreguntas.value) || 8;
    var indicaciones = form.indicaciones.value.trim();
    iniciarTrabajoIA('curso');
    prepararFuentes().then(function (fuentes) {
      if (!fuentes.length) throw new Error('No hay fuentes disponibles.');
      return IA.generarCurso({
        clave: D().config.ia.clave, modelo: D().config.ia.modelo,
        fuentes: fuentes, indicaciones: indicaciones,
        numModulos: numModulos || null, numPreguntas: numPreguntas,
        onDelta: alRecibirDelta, senal: estado.ia.controlador.signal
      });
    }).then(function (resultado) {
      var c = crearCursoDesdeIA(resultado);
      terminarTrabajoIA();
      estado.ia.salida = '';
      estado.ia.tipoSalida = null;
      estado.vistaAdmin = 'cursos';
      estado.cursoEditId = c.id;
      toast('Curso «' + c.titulo + '» creado en borrador. Revísalo y publícalo.');
      render();
    }).catch(function (e) {
      terminarTrabajoIA();
      estado.ia.salida = '';
      toast(e.message || 'Error al generar el curso.', true);
      render();
    });
  };

  function limpiarPreguntasIA(preguntas) {
    return (preguntas || []).filter(function (p) {
      return p && p.texto && Array.isArray(p.opciones) && p.opciones.length >= 2 &&
        Array.isArray(p.correctas) && p.correctas.length &&
        p.correctas.every(function (i) { return i >= 0 && i < p.opciones.length; });
    }).map(function (p) {
      var tipo = ['unica', 'multiple', 'vf'].indexOf(p.tipo) !== -1 ? p.tipo : 'unica';
      var correctas = p.correctas.map(Number);
      if ((tipo === 'unica' || tipo === 'vf') && correctas.length > 1) correctas = [correctas[0]];
      return {
        id: L.crearId('preg'), tipo: tipo, texto: String(p.texto),
        opciones: p.opciones.map(String), correctas: correctas,
        explicacion: String(p.explicacion || '')
      };
    });
  }

  function crearCursoDesdeIA(r) {
    var c = {
      id: L.crearId('cur'),
      titulo: String(r.titulo || 'Curso generado con IA'),
      descripcion: String(r.descripcion || ''),
      categoriaId: (D().config.categorias[0] || {}).id || '',
      horas: Number(r.horasEstimadas) || 1,
      vigenciaMeses: 0,
      publicado: false,
      generadoConIA: true,
      modulos: (r.modulos || []).map(function (m) {
        return {
          id: L.crearId('mod'), titulo: String(m.titulo || 'Módulo'), tipo: 'texto',
          contenido: String(m.contenido || ''), duracionMin: Number(m.duracionMin) || 0,
          videoUrl: '', enlaceUrl: '', indicaciones: ''
        };
      }),
      materialIds: [],
      evaluacion: {
        activa: true,
        notaAprobacion: D().config.notaAprobacionDefecto || 70,
        intentosMax: 3,
        barajar: true,
        preguntas: limpiarPreguntasIA(r.preguntas)
      },
      creadoEn: L.hoyISO()
    };
    if (!c.evaluacion.preguntas.length) c.evaluacion.activa = false;
    D().cursos.push(c);
    guardar();
    return c;
  }

  formularios.iaGenerarEvaluacion = function (form) {
    if (estado.ia.ocupado) return;
    var c = curso(form.cursoId.value);
    if (!c) return;
    var base = form.base.value;
    var cantidad = Number(form.cantidad.value) || 8;
    var modo = form.modo.value;
    iniciarTrabajoIA('evaluacion');
    var obtenerFuentes = base === 'curso'
      ? Promise.resolve([{
          tipo: 'texto', nombre: 'Curso: ' + c.titulo,
          texto: c.titulo + '\n\n' + (c.descripcion || '') + '\n\n' + (c.modulos || []).map(function (m) {
            return '## ' + m.titulo + '\n' + (m.contenido || '');
          }).join('\n\n')
        }])
      : prepararFuentes();
    obtenerFuentes.then(function (fuentes) {
      if (!fuentes.length) throw new Error('No hay material base para generar preguntas.');
      return IA.generarPreguntas({
        clave: D().config.ia.clave, modelo: D().config.ia.modelo,
        fuentes: fuentes, cantidad: cantidad,
        onDelta: alRecibirDelta, senal: estado.ia.controlador.signal
      });
    }).then(function (resultado) {
      var nuevas = limpiarPreguntasIA(resultado.preguntas);
      if (!nuevas.length) throw new Error('La IA no devolvió preguntas utilizables. Inténtalo de nuevo.');
      if (modo === 'reemplazar') c.evaluacion.preguntas = nuevas;
      else c.evaluacion.preguntas = c.evaluacion.preguntas.concat(nuevas);
      c.evaluacion.activa = true;
      guardar();
      terminarTrabajoIA();
      estado.ia.salida = '';
      estado.ia.tipoSalida = null;
      estado.vistaAdmin = 'cursos';
      estado.cursoEditId = c.id;
      toast(nuevas.length + ' preguntas ' + (modo === 'reemplazar' ? 'reemplazadas' : 'agregadas') + ' en «' + c.titulo + '».');
      render();
    }).catch(function (e) {
      terminarTrabajoIA();
      estado.ia.salida = '';
      toast(e.message || 'Error al generar preguntas.', true);
      render();
    });
  };

  formularios.iaGenerarDocumento = function (form) {
    if (estado.ia.ocupado) return;
    var tipo = form.tipo.value;
    iniciarTrabajoIA('documento');
    prepararFuentes().then(function (fuentes) {
      if (!fuentes.length) throw new Error('No hay fuentes disponibles.');
      return IA.generarDocumento({
        clave: D().config.ia.clave, modelo: D().config.ia.modelo,
        fuentes: fuentes, tipo: tipo,
        onDelta: alRecibirDelta, senal: estado.ia.controlador.signal
      });
    }).then(function (texto) {
      terminarTrabajoIA();
      estado.ia.salida = texto;
      render();
    }).catch(function (e) {
      terminarTrabajoIA();
      estado.ia.salida = '';
      toast(e.message || 'Error al generar el documento.', true);
      render();
    });
  };

  function modalElegirCurso(titulo, accion) {
    abrirModal('<h3>' + esc(titulo) + '</h3>' +
      '<form data-form="' + atr(accion) + '">' +
      '<div class="campo"><label>Curso</label><select name="cursoId">' +
      D().cursos.map(function (c) { return '<option value="' + atr(c.id) + '">' + esc(c.titulo) + '</option>'; }).join('') +
      '</select></div>' +
      '<div class="campo"><label>Título</label><input type="text" name="titulo" value="Documento de estudio"></div>' +
      '<button class="boton" type="submit">Guardar</button></form>');
  }

  acciones.guardarSalidaComoModulo = function () {
    if (!estado.ia.salida) return;
    modalElegirCurso('Agregar como módulo de un curso', 'confirmarSalidaComoModulo');
  };

  formularios.confirmarSalidaComoModulo = function (form) {
    var c = curso(form.cursoId.value);
    if (!c) return;
    c.modulos.push({
      id: L.crearId('mod'), titulo: form.titulo.value.trim() || 'Documento de estudio',
      tipo: 'texto', contenido: estado.ia.salida, duracionMin: 0,
      videoUrl: '', enlaceUrl: '', indicaciones: ''
    });
    guardar();
    cerrarModal();
    toast('Módulo agregado a «' + c.titulo + '».');
    render();
  };

  acciones.guardarSalidaComoMaterial = function () {
    if (!estado.ia.salida) return;
    modalElegirCurso('Guardar como material de un curso', 'confirmarSalidaComoMaterial');
  };

  formularios.confirmarSalidaComoMaterial = function (form) {
    var c = curso(form.cursoId.value);
    if (!c) return;
    var nombre = (form.titulo.value.trim() || 'documento') + '.md';
    var blob = new Blob([estado.ia.salida], { type: 'text/markdown;charset=utf-8' });
    var ficha = { id: L.crearId('arc'), nombre: nombre, tipo: 'text/markdown', tamano: blob.size, creadoEn: L.hoyISO() };
    Almacen.registrarArchivo(ficha, blob).then(function () {
      c.materialIds = c.materialIds || [];
      c.materialIds.push(ficha.id);
      guardar();
      cerrarModal();
      toast('Material guardado en «' + c.titulo + '».');
      render();
    });
  };

  formularios.iaChat = function (form) {
    if (estado.ia.ocupado) return;
    var pregunta = form.pregunta.value.trim();
    if (!pregunta) return;
    estado.ia.chat.push({ rol: 'usuario', texto: pregunta });
    estado.ia.chat.push({ rol: 'asistente', texto: '…' });
    estado.ia.ocupado = true;
    estado.ia.controlador = new AbortController();
    render();
    var indiceRespuesta = estado.ia.chat.length - 1;
    prepararFuentes().then(function (fuentes) {
      return IA.chat({
        clave: D().config.ia.clave, modelo: D().config.ia.modelo,
        fuentes: fuentes,
        historial: estado.ia.chat.slice(0, -1),
        onDelta: function (delta, total) {
          estado.ia.chat[indiceRespuesta].texto = total;
          var caja = document.getElementById('burbujas-chat');
          if (caja && caja.lastElementChild) {
            caja.lastElementChild.textContent = total;
            caja.scrollTop = caja.scrollHeight;
          }
        },
        senal: estado.ia.controlador.signal
      });
    }).then(function (texto) {
      estado.ia.chat[indiceRespuesta].texto = texto;
      terminarTrabajoIA();
      render();
    }).catch(function (e) {
      estado.ia.chat.splice(indiceRespuesta, 1);
      terminarTrabajoIA();
      toast(e.message || 'Error en la conversación.', true);
      render();
    });
  };

  acciones.limpiarChatIA = function () {
    estado.ia.chat = [];
    render();
  };

  /* ---------- administración: ajustes ---------- */

  function vistaAjustes() {
    var c = D().config;
    var html = '<div class="grilla grilla-2">';

    html += '<div class="tarjeta"><h3>🏢 Organización</h3>' +
      '<form data-form="guardarOrganizacion">' +
      '<div class="campo"><label>Nombre de la organización</label><input type="text" name="nombreOrg" value="' + atr(c.nombreOrg) + '"></div>' +
      '<div class="campo"><label>Lema o subtítulo</label><input type="text" name="lema" value="' + atr(c.lema || '') + '"></div>' +
      '<div class="fila-botones">' +
      '<div class="campo"><label>Color primario</label><input type="color" name="colorPrimario" value="' + atr(c.colorPrimario) + '"></div>' +
      '<div class="campo"><label>Color de acento</label><input type="color" name="colorAcento" value="' + atr(c.colorAcento) + '"></div>' +
      '<div class="campo"><label>Nota de aprobación por defecto (%)</label><input type="number" name="notaAprobacionDefecto" min="1" max="100" value="' + atr(c.notaAprobacionDefecto || 70) + '"></div></div>' +
      '<div class="campo"><label>Logo (PNG/JPG/SVG, se guarda en el dispositivo)</label>' +
      '<input type="file" accept="image/*" data-accion-cambio="subirLogo">' +
      (c.logo ? '<div class="fila-botones" style="margin-top:8px"><img src="' + atr(c.logo) + '" alt="logo" style="height:44px;background:#fff;border-radius:8px;padding:3px">' +
        '<button class="boton chico peligro" type="button" data-accion="quitarLogo">Quitar logo</button></div>' : '') + '</div>' +
      '<button class="boton" type="submit">Guardar</button></form></div>';

    html += '<div class="tarjeta"><div class="fila-botones" style="justify-content:space-between">' +
      '<h3 style="margin:0">🏷️ Categorías de capacitación</h3>' +
      '<button class="boton chico" data-accion="nuevaCategoria">+ Nueva</button></div>' +
      '<p class="ayuda" style="color:var(--texto2);font-size:.78rem">Personalízalas según tu organización: legales, básicas, complementarias, seguridad, calidad, etc.</p>' +
      D().config.categorias.map(function (cat) {
        var usados = D().cursos.filter(function (cu) { return cu.categoriaId === cat.id; }).length;
        return '<div class="fila-lista"><div style="width:14px;height:14px;border-radius:4px;background:' + atr(cat.color || '#888') + '"></div>' +
          '<div class="principal"><div class="nombre">' + esc(cat.nombre) + '</div>' +
          '<div class="detalle">' + esc(cat.descripcion || '') + (usados ? ' · ' + usados + ' curso' + (usados === 1 ? '' : 's') : '') + '</div></div>' +
          '<button class="boton chico secundario" data-accion="editarCategoria" data-id="' + atr(cat.id) + '">Editar</button>' +
          '<button class="boton chico peligro" data-accion="eliminarCategoria" data-id="' + atr(cat.id) + '">✕</button></div>';
      }).join('') + '</div>';

    html += '<div class="tarjeta"><h3>🏅 Certificados</h3>' +
      '<form data-form="guardarConfigCert">' +
      '<div class="grilla grilla-2">' +
      '<div class="campo"><label>Prefijo del folio</label><input type="text" name="prefijoFolio" value="' + atr(c.cert.prefijoFolio || 'CERT') + '"></div>' +
      '<div class="campo"><label>Nombre del firmante</label><input type="text" name="firmante" value="' + atr(c.cert.firmante || '') + '"></div>' +
      '<div class="campo"><label>Cargo del firmante</label><input type="text" name="cargoFirmante" value="' + atr(c.cert.cargoFirmante || '') + '"></div></div>' +
      '<div class="campo"><label>Texto legal al pie (opcional)</label><input type="text" name="textoLegal" value="' + atr(c.cert.textoLegal || '') + '" placeholder="p. ej. Capacitación realizada según DS 40 art. 21"></div>' +
      '<div class="fila-botones"><button class="boton" type="submit">Guardar</button>' +
      '<button class="boton secundario" type="button" data-accion="previsualizarCert">Previsualizar</button></div></form></div>';

    html += '<div class="tarjeta"><h3>💾 Respaldo de datos</h3>' +
      '<p class="ayuda" style="color:var(--texto2);font-size:.8rem">Exporta un JSON con toda la información (personas, cursos, programas, inscripciones y certificados). ' +
      'Los archivos y videos subidos no se incluyen; guárdalos aparte si cambias de dispositivo. La clave de la API nunca se exporta.</p>' +
      '<div class="fila-botones">' +
      '<button class="boton" data-accion="exportarDatos">⬇ Exportar datos</button>' +
      '<label class="boton secundario" style="cursor:pointer">⬆ Importar datos' +
      '<input type="file" accept="application/json,.json" style="display:none" data-accion-cambio="importarDatos"></label>' +
      '<button class="boton peligro" data-accion="restablecerTodo">Restablecer todo</button></div></div>';

    html += '</div>';
    return html;
  }

  formularios.guardarOrganizacion = function (form) {
    var c = D().config;
    c.nombreOrg = form.nombreOrg.value.trim() || 'Mi Organización';
    c.lema = form.lema.value.trim();
    c.colorPrimario = form.colorPrimario.value;
    c.colorAcento = form.colorAcento.value;
    c.notaAprobacionDefecto = Math.min(100, Math.max(1, Number(form.notaAprobacionDefecto.value) || 70));
    guardar();
    aplicarColores();
    toast('Datos de la organización guardados.');
    render();
  };

  acciones.subirLogo = function (el) {
    var archivo = el.files[0];
    if (!archivo) return;
    if (archivo.size > 512 * 1024) { toast('Usa un logo de menos de 500 KB.', true); return; }
    leerArchivo(archivo).then(function (dataUrl) {
      D().config.logo = dataUrl;
      guardar();
      toast('Logo actualizado.');
      render();
    });
  };

  acciones.quitarLogo = function () {
    D().config.logo = null;
    guardar();
    render();
  };

  function formularioCategoria(cat) {
    return '<h3>' + (cat ? 'Editar categoría' : 'Nueva categoría') + '</h3>' +
      '<form data-form="guardarCategoria" data-id="' + atr(cat ? cat.id : '') + '">' +
      '<div class="campo"><label>Nombre *</label><input type="text" name="nombre" required value="' + atr(cat ? cat.nombre : '') + '"></div>' +
      '<div class="campo"><label>Descripción</label><input type="text" name="descripcion" value="' + atr(cat ? cat.descripcion || '' : '') + '"></div>' +
      '<div class="campo"><label>Color</label><input type="color" name="color" value="' + atr(cat && cat.color || '#3f8ae0') + '"></div>' +
      '<button class="boton" type="submit">Guardar</button></form>';
  }

  acciones.nuevaCategoria = function () { abrirModal(formularioCategoria(null)); };
  acciones.editarCategoria = function (el) {
    var cat = categoria(el.getAttribute('data-id'));
    if (cat) abrirModal(formularioCategoria(cat));
  };

  formularios.guardarCategoria = function (form) {
    var id = form.getAttribute('data-id');
    var cat = id ? categoria(id) : null;
    if (!cat) {
      cat = { id: L.crearId('cat') };
      D().config.categorias.push(cat);
    }
    cat.nombre = form.nombre.value.trim() || 'Categoría';
    cat.descripcion = form.descripcion.value.trim();
    cat.color = form.color.value;
    guardar();
    cerrarModal();
    render();
  };

  acciones.eliminarCategoria = function (el) {
    var id = el.getAttribute('data-id');
    var cat = categoria(id);
    if (!cat) return;
    var usados = D().cursos.filter(function (c) { return c.categoriaId === id; }).length;
    if (usados) { toast('No se puede eliminar: hay ' + usados + ' curso(s) en esta categoría. Reasígnalos primero.', true); return; }
    if (D().config.categorias.length <= 1) { toast('Debe existir al menos una categoría.', true); return; }
    if (!confirmar('¿Eliminar la categoría «' + cat.nombre + '»?')) return;
    D().config.categorias = D().config.categorias.filter(function (x) { return x.id !== id; });
    guardar();
    render();
  };

  formularios.guardarConfigCert = function (form) {
    var cc = D().config.cert;
    cc.prefijoFolio = form.prefijoFolio.value.trim() || 'CERT';
    cc.firmante = form.firmante.value.trim();
    cc.cargoFirmante = form.cargoFirmante.value.trim();
    cc.textoLegal = form.textoLegal.value.trim();
    guardar();
    toast('Configuración del certificado guardada.');
  };

  acciones.previsualizarCert = function () {
    var certEjemplo = {
      folio: L.generarFolio(D().config.cert.prefijoFolio || 'CERT', new Date().getFullYear(), (D().secuencias.folio || 0) + 1),
      codigoVerificacion: 'EJEM-PLOX-XXXX',
      nombrePersona: 'Nombre de Ejemplo Apellido',
      tituloCurso: 'Curso de ejemplo para previsualización',
      horas: 8,
      fecha: L.hoyISO(),
      venceEn: L.sumarMeses(L.hoyISO(), 12)
    };
    abrirModal('<h3>Previsualización</h3><div class="vista-certificado">' +
      Certificados.generarSVG(certEjemplo, D().config) + '</div>');
  };

  acciones.exportarDatos = function () {
    descargarTexto('capacitaciones-respaldo-' + L.hoyISO() + '.json',
      Almacen.exportarJSON(), 'application/json;charset=utf-8');
    toast('Respaldo exportado.');
  };

  acciones.importarDatos = function (el) {
    var archivo = el.files[0];
    if (!archivo) return;
    if (!confirmar('Importar reemplazará TODOS los datos actuales por los del respaldo. ¿Continuar?')) { el.value = ''; return; }
    el.value = '';
    leerArchivo(archivo, 'texto').then(function (texto) {
      Almacen.importarJSON(texto);
      aplicarColores();
      toast('Datos importados correctamente.');
      render();
    }).catch(function (e) {
      toast(e.message || 'El archivo no es un respaldo válido.', true);
    });
  };

  acciones.restablecerTodo = function () {
    if (!confirmar('Esto BORRA todos los datos de la aplicación en este dispositivo (personas, cursos, inscripciones y certificados). ¿Continuar?')) return;
    if (!confirmar('Última confirmación: ¿borrar todo definitivamente?')) return;
    Almacen.restablecer();
    aplicarColores();
    estado.vistaAdmin = 'panel';
    toast('Aplicación restablecida.');
    render();
  };

  /* ---------- colaborador ---------- */

  var urlsTemporales = [];
  function urlTemporal(blob) {
    var url = URL.createObjectURL(blob);
    urlsTemporales.push(url);
    return url;
  }
  function liberarUrlsTemporales() {
    urlsTemporales.forEach(function (u) { try { URL.revokeObjectURL(u); } catch (e) { } });
    urlsTemporales = [];
  }

  function vistaColab() {
    var p = estado.colabPersonaId ? persona(estado.colabPersonaId) : null;
    if (!p || p.activo === false) return vistaSeleccionPersona();
    if (estado.examen) return encabezado('Colaborador') + vistaExamen();
    var nav = '<nav class="nav">' +
      '<button data-accion="pestanaColab" data-valor="cursos"' + (estado.vistaColab === 'cursos' ? ' class="activo"' : '') + '>📚 Mis capacitaciones</button>' +
      '<button data-accion="pestanaColab" data-valor="certificados"' + (estado.vistaColab === 'certificados' ? ' class="activo"' : '') + '>🏅 Mis certificados</button>' +
      '<button data-accion="cambiarPersona">👤 ' + esc(p.nombre.split(' ')[0]) + ' · cambiar</button>' +
      '</nav>';
    var cuerpo = estado.vistaColab === 'certificados'
      ? vistaMisCertificados(p)
      : (estado.cursoAbiertoId ? vistaCursoColab(p) : vistaMisCursos(p));
    return encabezado('Colaborador') + nav + cuerpo;
  }

  function vistaSeleccionPersona() {
    var activas = D().personas.filter(function (p) { return p.activo !== false; });
    var filtro = L.normalizar(estado.busquedaPersona);
    var lista = activas.filter(function (p) {
      return !filtro || L.normalizar(p.nombre + ' ' + (p.area || '')).indexOf(filtro) !== -1;
    });
    var html = encabezado('Colaborador') + '<div class="tarjeta"><h2>¿Quién eres?</h2>';
    if (!activas.length) {
      return html + '<div class="vacio">Aún no hay personas registradas.<br>Pide al administrador que te agregue en la pestaña Personas.</div></div>';
    }
    html += '<div class="campo"><input type="text" data-input="busquedaPersona" placeholder="Busca tu nombre…" value="' + atr(estado.busquedaPersona) + '"></div>' +
      lista.map(function (p) {
        return '<div class="fila-lista" style="cursor:pointer" data-accion="elegirPersona" data-id="' + atr(p.id) + '">' +
          '<div style="font-size:1.3rem">👤</div><div class="principal"><div class="nombre">' + esc(p.nombre) + '</div>' +
          '<div class="detalle">' + esc(p.area || '') + (p.cargo ? ' · ' + esc(p.cargo) : '') + '</div></div>' +
          '<span style="color:var(--texto2)">→</span></div>';
      }).join('');
    return html + '</div>';
  }

  acciones.elegirPersona = function (el) {
    estado.colabPersonaId = el.getAttribute('data-id');
    estado.busquedaPersona = '';
    estado.cursoAbiertoId = null;
    estado.vistaColab = 'cursos';
    Almacen.ui.colabPersonaId = estado.colabPersonaId;
    Almacen.guardarUI();
    render();
  };

  acciones.cambiarPersona = function () {
    estado.colabPersonaId = null;
    estado.cursoAbiertoId = null;
    estado.examen = null;
    render();
  };

  acciones.pestanaColab = function (el) {
    estado.vistaColab = el.getAttribute('data-valor');
    estado.cursoAbiertoId = null;
    render();
  };

  function inscripcionesDePersona(personaId) {
    return D().inscripciones.filter(function (i) {
      var c = curso(i.cursoId);
      return i.personaId === personaId && c && c.publicado;
    });
  }

  function vistaMisCursos(p) {
    var inscs = inscripcionesDePersona(p.id);
    if (!inscs.length) {
      return '<div class="vacio">No tienes capacitaciones asignadas todavía.<br>El administrador debe asignarte cursos o incluirte en un programa.</div>';
    }
    var orden = { vencido: 0, reprobado: 1, en_curso: 2, pendiente: 3, completado: 4 };
    var tarjetas = inscs.map(function (i) {
      var c = curso(i.cursoId);
      var e = L.estadoInscripcion(c, i);
      var av = L.avanceCurso(c, i);
      return { insc: i, curso: c, estado: e, avance: av };
    }).sort(function (a, b) { return (orden[a.estado] || 0) - (orden[b.estado] || 0); });

    var pendientes = tarjetas.filter(function (t) { return t.estado !== 'completado'; });
    var completadas = tarjetas.filter(function (t) { return t.estado === 'completado'; });

    function tarjetaHTML(t) {
      return '<div class="tarjeta-curso" data-accion="abrirCurso" data-id="' + atr(t.insc.cursoId) + '">' +
        '<div class="fila-superior">' + etiquetaCategoria(t.curso.categoriaId) + chipEstado(t.estado) + '</div>' +
        '<h3>' + esc(t.curso.titulo) + '</h3>' +
        '<div class="descripcion">' + esc((t.curso.descripcion || '').slice(0, 120)) + '</div>' +
        '<div class="pie">' + barraAvance(t.avance.pct) + '<span>' + t.avance.pct + '%</span>' +
        (t.insc.venceEn ? '<span>· vence ' + L.fechaCorta(t.insc.venceEn) + '</span>' : '') + '</div></div>';
    }

    var html = '';
    if (pendientes.length) {
      html += '<h2>Por completar (' + pendientes.length + ')</h2><div class="grilla grilla-2">' +
        pendientes.map(tarjetaHTML).join('') + '</div>';
    }
    if (completadas.length) {
      html += '<h2 style="margin-top:18px">Completadas (' + completadas.length + ')</h2><div class="grilla grilla-2">' +
        completadas.map(tarjetaHTML).join('') + '</div>';
    }
    return html;
  }

  acciones.abrirCurso = function (el) {
    estado.cursoAbiertoId = el.getAttribute('data-id');
    estado.moduloAbiertoId = null;
    render();
  };

  acciones.cerrarCurso = function () {
    estado.cursoAbiertoId = null;
    estado.moduloAbiertoId = null;
    render();
  };

  function iconoModulo(m, hecho) {
    if (hecho) return '✅';
    if (m.tipo === 'video') return '🎬';
    if (m.tipo === 'archivo') return '📎';
    if (m.tipo === 'enlace') return '🔗';
    return '📄';
  }

  function vistaCursoColab(p) {
    var c = curso(estado.cursoAbiertoId);
    var insc = c && inscripcionDe(p.id, c.id);
    if (!c || !insc) { estado.cursoAbiertoId = null; return vistaMisCursos(p); }
    var e = L.estadoInscripcion(c, insc);
    var av = L.avanceCurso(c, insc);

    var html = '<button class="boton enlace" data-accion="cerrarCurso">← Mis capacitaciones</button>' +
      '<div class="tarjeta"><div class="fila-superior" style="display:flex;justify-content:space-between;gap:8px">' +
      etiquetaCategoria(c.categoriaId) + chipEstado(e) + '</div>' +
      '<h2 style="margin-top:8px">' + esc(c.titulo) + '</h2>' +
      (c.descripcion ? '<p style="color:var(--texto2)">' + esc(c.descripcion) + '</p>' : '') +
      '<div class="fila-botones" style="color:var(--texto2);font-size:.82rem;gap:14px">' +
      (c.horas ? '<span>🕒 ' + c.horas + ' h</span>' : '') +
      '<span>📄 ' + av.modulosHechos + '/' + av.modulosTotal + ' módulos</span>' +
      (insc.venceEn ? '<span>📅 vence ' + L.fechaCorta(insc.venceEn) + '</span>' : '') + '</div>' +
      '<div style="margin-top:10px">' + barraAvance(av.pct) + '</div></div>';

    // módulos
    html += '<div class="tarjeta"><h3>Módulos</h3>' + c.modulos.map(function (m, idx) {
      var hecho = insc.modulosCompletados.indexOf(m.id) !== -1;
      var abierto = estado.moduloAbiertoId === m.id;
      var item = '<div class="modulo-item' + (hecho ? ' hecho' : '') + '" data-accion="abrirModulo" data-id="' + atr(m.id) + '">' +
        '<div class="marca">' + iconoModulo(m, hecho) + '</div>' +
        '<div class="info"><div>' + (idx + 1) + '. ' + esc(m.titulo) + '</div>' +
        '<div class="tipo">' + esc(TIPOS_MODULO[m.tipo] || m.tipo) + (m.duracionMin ? ' · ' + m.duracionMin + ' min' : '') + '</div></div>' +
        '<div>' + (abierto ? '▲' : '▼') + '</div></div>';
      if (abierto) item += contenidoModuloHTML(c, m, insc, hecho);
      return item;
    }).join('') + '</div>';

    // evaluación
    if (L.requiereEvaluacion(c)) {
      var aprobada = L.evaluacionAprobada(insc);
      var restantes = L.intentosRestantes(c, insc);
      var modulosListos = av.modulosHechos >= av.modulosTotal;
      html += '<div class="tarjeta"><h3>📝 Evaluación</h3>' +
        '<p style="color:var(--texto2);font-size:.86rem">' + c.evaluacion.preguntas.length + ' preguntas · nota mínima ' +
        c.evaluacion.notaAprobacion + '% · ' +
        (restantes === null ? 'intentos ilimitados' : 'intentos: ' + L.intentosUsados(insc) + '/' + c.evaluacion.intentosMax) + '</p>';
      if (aprobada) {
        html += '<div class="aviso info">✅ Evaluación aprobada con nota ' + L.mejorPuntaje(insc) + '%.</div>';
      } else if (e === 'reprobado') {
        html += '<div class="aviso peligro">Agotaste los intentos disponibles. Contacta al administrador para habilitar un nuevo intento.</div>';
      } else {
        if (!modulosListos) {
          html += '<div class="aviso alerta">Completa todos los módulos para habilitar la evaluación.</div>';
        }
        html += '<button class="boton"' + (modulosListos ? '' : ' disabled') +
          ' data-accion="comenzarExamen" data-id="' + atr(c.id) + '">' +
          (L.intentosUsados(insc) ? 'Reintentar evaluación' : 'Rendir evaluación') + '</button>';
      }
      html += '</div>';
    }

    // material de apoyo
    var fichas = (c.materialIds || []).map(Almacen.fichaArchivo.bind(Almacen)).filter(Boolean);
    if (fichas.length) {
      html += '<div class="tarjeta"><h3>📎 Material de apoyo</h3>' + fichas.map(function (f) {
        return '<div class="fila-lista"><div>📎</div><div class="principal"><div class="nombre">' + esc(f.nombre) + '</div>' +
          '<div class="detalle">' + tamanoLegible(f.tamano) + '</div></div>' +
          '<button class="boton chico secundario" data-accion="descargarMaterial" data-id="' + atr(f.id) + '">Descargar</button></div>';
      }).join('') + '</div>';
    }

    // certificado
    if (insc.certificadoId && (e === 'completado' || e === 'vencido')) {
      var cert = certificado(insc.certificadoId);
      if (cert) {
        html += '<div class="tarjeta"><h3>🏅 Tu certificado</h3>' +
          '<p style="color:var(--texto2)">Folio ' + esc(cert.folio) + ' · emitido el ' + L.fechaCorta(cert.fecha) + '</p>' +
          '<div class="fila-botones"><button class="boton" data-accion="verCertificado" data-id="' + atr(cert.id) + '">Ver y descargar</button></div></div>';
      }
    }
    return html;
  }

  function contenidoModuloHTML(c, m, insc, hecho) {
    var html = '<div class="contenido-modulo" style="margin-bottom:10px">';
    if (m.indicaciones) html += '<div class="aviso info">' + esc(m.indicaciones) + '</div>';

    if (m.tipo === 'texto') {
      html += renderizarContenido(m.contenido);
    } else if (m.tipo === 'video') {
      if (m.archivoId) {
        html += '<div class="video-marco"><video controls id="video-' + atr(m.id) + '"></video></div>';
        (function (idModulo, idArchivo) {
          tareasPostRender.push(function () {
            Almacen.obtenerArchivo(idArchivo).then(function (blob) {
              var video = document.getElementById('video-' + idModulo);
              if (video && blob) video.src = urlTemporal(blob);
            });
          });
        })(m.id, m.archivoId);
      } else {
        var info = L.analizarVideoUrl(m.videoUrl);
        if (info && (info.tipo === 'youtube' || info.tipo === 'vimeo')) {
          html += '<div class="video-marco"><iframe src="' + atr(info.urlInsercion) +
            '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>';
        } else if (info) {
          html += '<div class="video-marco"><video controls src="' + atr(info.urlInsercion) + '"></video></div>';
        } else {
          html += '<p style="color:var(--texto2)">Este módulo no tiene un video válido configurado.</p>';
        }
      }
    } else if (m.tipo === 'archivo') {
      var ficha = m.archivoId ? Almacen.fichaArchivo(m.archivoId) : null;
      if (ficha) {
        html += '<div class="fila-lista"><div>📎</div><div class="principal"><div class="nombre">' + esc(ficha.nombre) + '</div>' +
          '<div class="detalle">' + tamanoLegible(ficha.tamano) + '</div></div>' +
          '<button class="boton chico secundario" data-accion="abrirArchivoModulo" data-id="' + atr(m.archivoId) + '">Abrir</button>' +
          '<button class="boton chico secundario" data-accion="descargarMaterial" data-id="' + atr(m.archivoId) + '">Descargar</button></div>';
        if (/^image\//.test(ficha.tipo)) {
          html += '<img id="img-' + atr(m.id) + '" alt="" style="max-width:100%;border-radius:8px;margin-top:8px">';
          (function (idModulo, idArchivo) {
            tareasPostRender.push(function () {
              Almacen.obtenerArchivo(idArchivo).then(function (blob) {
                var img = document.getElementById('img-' + idModulo);
                if (img && blob) img.src = urlTemporal(blob);
              });
            });
          })(m.id, m.archivoId);
        }
      } else {
        html += '<p style="color:var(--texto2)">El archivo de este módulo no está disponible en este dispositivo.</p>';
      }
    } else if (m.tipo === 'enlace') {
      html += /^https?:\/\//i.test(m.enlaceUrl || '')
        ? '<p>Material externo: <a href="' + atr(m.enlaceUrl) + '" target="_blank" rel="noopener noreferrer">' + esc(m.enlaceUrl) + '</a></p>'
        : '<p style="color:var(--texto2)">Este módulo no tiene un enlace válido configurado (debe comenzar con http:// o https://).</p>';
    }

    html += '<div class="fila-botones" style="margin-top:12px">' +
      (hecho
        ? '<span class="chip completado">Módulo completado</span>'
        : '<button class="boton exito" data-accion="completarModulo" data-curso="' + atr(c.id) + '" data-id="' + atr(m.id) + '">✓ Marcar como completado</button>') +
      '</div></div>';
    return html;
  }

  acciones.abrirModulo = function (el) {
    var id = el.getAttribute('data-id');
    estado.moduloAbiertoId = estado.moduloAbiertoId === id ? null : id;
    render();
  };

  acciones.abrirArchivoModulo = function (el) {
    Almacen.obtenerArchivo(el.getAttribute('data-id')).then(function (blob) {
      if (!blob) { toast('El archivo no está en este dispositivo.', true); return; }
      window.open(urlTemporal(blob), '_blank');
    });
  };

  acciones.completarModulo = function (el) {
    var c = curso(el.getAttribute('data-curso'));
    var insc = c && inscripcionDe(estado.colabPersonaId, c.id);
    if (!c || !insc) return;
    var idModulo = el.getAttribute('data-id');
    if (insc.modulosCompletados.indexOf(idModulo) === -1) insc.modulosCompletados.push(idModulo);
    guardar();
    var cert = completarSiCorresponde(insc);
    render();
    if (cert) {
      toast('¡Felicitaciones! Completaste «' + c.titulo + '».');
      acciones.verCertificado({ getAttribute: function () { return cert.id; } });
    }
  };

  /* ---------- colaborador: evaluación ---------- */

  acciones.comenzarExamen = function (el) {
    var c = curso(el.getAttribute('data-id'));
    if (!c) return;
    var ids = c.evaluacion.preguntas.map(function (p) { return p.id; });
    estado.examen = {
      cursoId: c.id,
      orden: c.evaluacion.barajar ? L.barajar(ids) : ids,
      respuestas: {},
      resultado: null
    };
    render();
    window.scrollTo(0, 0);
  };

  acciones.salirExamen = function () {
    if (estado.examen && !estado.examen.resultado &&
      !confirmar('¿Salir de la evaluación? Las respuestas de este intento se perderán.')) return;
    estado.examen = null;
    render();
  };

  function vistaExamen() {
    var ex = estado.examen;
    var c = curso(ex.cursoId);
    if (!c) { estado.examen = null; return ''; }
    if (ex.resultado) return vistaResultadoExamen(c, ex);

    var preguntasPorId = {};
    c.evaluacion.preguntas.forEach(function (p) { preguntasPorId[p.id] = p; });
    var respondidas = Object.keys(ex.respuestas).filter(function (k) { return (ex.respuestas[k] || []).length; }).length;

    var html = '<div class="tarjeta"><div class="fila-botones" style="justify-content:space-between">' +
      '<h2 style="margin:0">📝 ' + esc(c.titulo) + '</h2>' +
      '<button class="boton chico secundario" data-accion="salirExamen">Salir</button></div>' +
      '<p style="color:var(--texto2);font-size:.86rem">Nota mínima: ' + c.evaluacion.notaAprobacion +
      '% · Respondidas: <strong id="contador-respondidas">' + respondidas + '</strong>/' + ex.orden.length + '</p></div>';

    html += ex.orden.map(function (idPregunta, n) {
      var p = preguntasPorId[idPregunta];
      if (!p) return '';
      var esMultiple = p.tipo === 'multiple';
      var marcadas = ex.respuestas[p.id] || [];
      return '<div class="tarjeta"><h3>' + (n + 1) + '. ' + esc(p.texto) + '</h3>' +
        (esMultiple ? '<p class="ayuda" style="color:var(--texto2);font-size:.78rem">Selecciona todas las que correspondan.</p>' : '') +
        p.opciones.map(function (op, i) {
          return '<label class="opcion-marcable"><input type="' + (esMultiple ? 'checkbox' : 'radio') +
            '" name="ex-' + atr(p.id) + '" data-exam-pregunta="' + atr(p.id) + '" data-indice="' + i + '"' +
            (marcadas.indexOf(i) !== -1 ? ' checked' : '') + '> <span>' + esc(op) + '</span></label>';
        }).join('') + '</div>';
    }).join('');

    html += '<div class="tarjeta"><button class="boton exito" style="width:100%" data-accion="entregarExamen">Entregar evaluación</button></div>';
    return html;
  }

  acciones.entregarExamen = function () {
    var ex = estado.examen;
    var c = ex && curso(ex.cursoId);
    if (!c) return;
    var sinResponder = ex.orden.filter(function (id) { return !(ex.respuestas[id] || []).length; }).length;
    if (sinResponder && !confirmar('Tienes ' + sinResponder + ' pregunta(s) sin responder (contarán como incorrectas). ¿Entregar de todos modos?')) return;

    var insc = inscripcionDe(estado.colabPersonaId, c.id);
    if (!insc) return;
    var resultado = L.corregirEvaluacion(c.evaluacion, ex.respuestas);
    insc.intentos.push({
      fecha: L.hoyISO(),
      puntaje: resultado.puntaje,
      aprobado: resultado.aprobado,
      respuestas: ex.respuestas
    });
    guardar();
    var cert = null;
    if (resultado.aprobado) cert = completarSiCorresponde(insc);
    ex.resultado = resultado;
    ex.certificadoId = cert ? cert.id : null;
    render();
    window.scrollTo(0, 0);
  };

  function vistaResultadoExamen(c, ex) {
    var r = ex.resultado;
    var insc = inscripcionDe(estado.colabPersonaId, c.id);
    var restantes = L.intentosRestantes(c, insc);
    var preguntasPorId = {};
    c.evaluacion.preguntas.forEach(function (p) { preguntasPorId[p.id] = p; });

    var html = '<div class="tarjeta" style="text-align:center">' +
      '<div style="font-size:3rem">' + (r.aprobado ? '🎉' : '😔') + '</div>' +
      '<h2>' + (r.aprobado ? '¡Evaluación aprobada!' : 'Evaluación no aprobada') + '</h2>' +
      '<p style="font-size:1.6rem;font-weight:800;color:' + (r.aprobado ? 'var(--exito)' : 'var(--peligro)') + '">' +
      r.puntaje + '%</p>' +
      '<p style="color:var(--texto2)">' + r.correctas + ' de ' + r.total + ' correctas · nota mínima ' + c.evaluacion.notaAprobacion + '%</p>' +
      '<div class="fila-botones" style="justify-content:center;margin-top:10px">' +
      (ex.certificadoId ? '<button class="boton" data-accion="verCertificado" data-id="' + atr(ex.certificadoId) + '">🏅 Ver mi certificado</button>' : '') +
      (!r.aprobado && restantes !== 0 ? '<button class="boton" data-accion="comenzarExamen" data-id="' + atr(c.id) + '">Reintentar</button>' : '') +
      '<button class="boton secundario" data-accion="salirExamen">Volver al curso</button></div>' +
      (!r.aprobado && restantes === 0 ? '<div class="aviso peligro" style="margin-top:12px">No te quedan intentos. Contacta al administrador.</div>' : '') +
      '</div>';

    html += '<div class="tarjeta"><h3>Revisión de respuestas</h3>' + ex.orden.map(function (idPregunta, n) {
      var p = preguntasPorId[idPregunta];
      var det = r.detalle.find(function (d) { return d.preguntaId === idPregunta; });
      if (!p || !det) return '';
      return '<div style="margin-bottom:16px"><div style="font-weight:600">' + (n + 1) + '. ' + esc(p.texto) + ' ' +
        (det.esCorrecta ? '<span class="chip completado">Correcta</span>' : '<span class="chip vencido">Incorrecta</span>') + '</div>' +
        p.opciones.map(function (op, i) {
          var esCorrecta = det.esperadas.indexOf(i) !== -1;
          var marcada = det.marcadas.indexOf(i) !== -1;
          var clase = esCorrecta ? ' correcta' : (marcada ? ' incorrecta' : '');
          return '<div class="opcion-marcable' + clase + '" style="cursor:default">' +
            '<span>' + (marcada ? '☑' : '☐') + '</span><span>' + esc(op) +
            (esCorrecta ? ' ✓' : '') + '</span></div>';
        }).join('') +
        (p.explicacion ? '<div class="ayuda" style="color:var(--texto2);font-size:.8rem">💡 ' + esc(p.explicacion) + '</div>' : '') +
        '</div>';
    }).join('') + '</div>';
    return html;
  }

  function vistaMisCertificados(p) {
    var certs = D().certificados.filter(function (c) { return c.personaId === p.id; }).reverse();
    if (!certs.length) {
      return '<div class="vacio">Aún no tienes certificados.<br>Se generan automáticamente al completar una capacitación.</div>';
    }
    return '<div class="grilla grilla-2">' + certs.map(function (cert) {
      var vencido = cert.venceEn && cert.venceEn < L.hoyISO();
      return '<div class="tarjeta"><div class="fila-superior" style="display:flex;justify-content:space-between">' +
        '<span style="font-size:1.6rem">🏅</span>' +
        (vencido ? '<span class="chip vencido">Vencido</span>' : '<span class="chip completado">Vigente</span>') + '</div>' +
        '<h3>' + esc(cert.tituloCurso) + '</h3>' +
        '<p style="color:var(--texto2);font-size:.82rem">Folio ' + esc(cert.folio) + '<br>Emitido el ' + L.fechaCorta(cert.fecha) +
        (cert.venceEn ? ' · vence el ' + L.fechaCorta(cert.venceEn) : '') + '</p>' +
        '<button class="boton" data-accion="verCertificado" data-id="' + atr(cert.id) + '">Ver y descargar</button></div>';
    }).join('') + '</div>';
  }

  /* ---------- render y eventos ---------- */

  function render() {
    liberarUrlsTemporales();
    var app = document.getElementById('app');
    var html;
    if (estado.modo === 'admin') html = vistaAdmin();
    else if (estado.modo === 'colab') html = vistaColab();
    else html = vistaInicio();
    app.innerHTML = html +
      '<footer class="pie-app">Capacitaciones · funciona sin servidor, todo queda en tu dispositivo</footer>';
    var tareas = tareasPostRender.slice();
    tareasPostRender.length = 0;
    tareas.forEach(function (t) { try { t(); } catch (e) { console.error(e); } });
  }

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-accion]');
    if (!el) return;
    var accion = acciones[el.getAttribute('data-accion')];
    if (accion) {
      ev.preventDefault();
      accion(el, ev);
    }
  });

  document.addEventListener('change', function (ev) {
    var el = ev.target;
    var nombre = el.getAttribute('data-accion-cambio');
    if (nombre && acciones[nombre]) { acciones[nombre](el, ev); return; }

    var filtro = el.getAttribute('data-filtro');
    if (filtro !== null) {
      estado.filtros[filtro] = el.value;
      render();
      return;
    }
    var filtroCheck = el.getAttribute('data-filtro-check');
    if (filtroCheck !== null) {
      estado.filtros[filtroCheck] = el.checked;
      render();
      return;
    }
    var examPregunta = el.getAttribute('data-exam-pregunta');
    if (examPregunta && estado.examen) {
      var indice = Number(el.getAttribute('data-indice'));
      if (el.type === 'radio') {
        estado.examen.respuestas[examPregunta] = [indice];
      } else {
        var lista = estado.examen.respuestas[examPregunta] || [];
        if (el.checked) { if (lista.indexOf(indice) === -1) lista.push(indice); }
        else lista = lista.filter(function (x) { return x !== indice; });
        estado.examen.respuestas[examPregunta] = lista;
      }
      var contador = document.getElementById('contador-respondidas');
      if (contador) {
        contador.textContent = Object.keys(estado.examen.respuestas).filter(function (k) {
          return (estado.examen.respuestas[k] || []).length;
        }).length;
      }
    }
  });

  var temporizadorBusqueda = null;
  document.addEventListener('input', function (ev) {
    var el = ev.target;
    var nombre = el.getAttribute('data-accion-entrada');
    if (nombre && acciones[nombre]) { acciones[nombre](el, ev); return; }

    if (el.getAttribute('data-input') === 'busquedaPersona') {
      estado.busquedaPersona = el.value;
      clearTimeout(temporizadorBusqueda);
      temporizadorBusqueda = setTimeout(function () {
        render();
        var campo = document.querySelector('[data-input="busquedaPersona"]');
        if (campo) {
          campo.focus();
          campo.setSelectionRange(campo.value.length, campo.value.length);
        }
      }, 250);
    }
  });

  // Los campos del filtro de seguimiento también son de texto: aplicar al escribir.
  document.addEventListener('input', function (ev) {
    var el = ev.target;
    var filtro = el.getAttribute('data-filtro');
    if (filtro !== 'texto') return;
    estado.filtros.texto = el.value;
    clearTimeout(temporizadorBusqueda);
    temporizadorBusqueda = setTimeout(function () {
      render();
      var campo = document.querySelector('[data-filtro="texto"]');
      if (campo) {
        campo.focus();
        campo.setSelectionRange(campo.value.length, campo.value.length);
      }
    }, 250);
  });

  document.addEventListener('submit', function (ev) {
    var form = ev.target.closest('form[data-form]');
    if (!form) return;
    ev.preventDefault();
    var manejador = formularios[form.getAttribute('data-form')];
    if (manejador) manejador(form, ev);
  });

  /* ---------- arranque ---------- */

  function init() {
    Almacen.cargar();
    aplicarColores();

    // contenedor del modal (además del fondo ya presente en el HTML)
    if (!document.getElementById('modal')) {
      var modal = document.createElement('div');
      modal.id = 'modal';
      modal.className = 'modal';
      modal.style.display = 'none';
      document.body.appendChild(modal);
      modal.addEventListener('click', function (ev) {
        if (ev.target === modal) cerrarModal();
      });
    }
    var fondo = document.getElementById('modal-fondo');
    if (fondo) fondo.addEventListener('click', cerrarModal);

    // restaurar la última sesión de uso
    var ui = Almacen.ui || {};
    if (ui.modo === 'admin') estado.modo = 'admin';
    else if (ui.modo === 'colab') {
      estado.modo = 'colab';
      if (ui.colabPersonaId && persona(ui.colabPersonaId)) {
        estado.colabPersonaId = ui.colabPersonaId;
      }
    }

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

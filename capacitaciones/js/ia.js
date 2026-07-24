// Asistente de IA (estilo NotebookLM) sobre la API de Claude, llamada
// directamente desde el navegador. La clave de la API la aporta el
// administrador y solo se guarda en este dispositivo.
(function (global) {
  'use strict';

  var URL_API = 'https://api.anthropic.com/v1/messages';
  var VERSION_API = '2023-06-01';

  var MODELOS = [
    { id: 'claude-opus-5', nombre: 'Claude Opus 5 — mejor calidad (recomendado)' },
    { id: 'claude-sonnet-5', nombre: 'Claude Sonnet 5 — equilibrado' },
    { id: 'claude-haiku-4-5', nombre: 'Claude Haiku 4.5 — rápido y económico' }
  ];

  var ESQUEMA_PREGUNTA = {
    type: 'object',
    additionalProperties: false,
    required: ['tipo', 'texto', 'opciones', 'correctas', 'explicacion'],
    properties: {
      tipo: { type: 'string', enum: ['unica', 'multiple', 'vf'], description: 'unica: una sola alternativa correcta; multiple: varias correctas; vf: verdadero/falso con opciones ["Verdadero","Falso"]' },
      texto: { type: 'string', description: 'Enunciado de la pregunta' },
      opciones: { type: 'array', items: { type: 'string' } },
      correctas: { type: 'array', items: { type: 'integer' }, description: 'Índices (desde 0) de las opciones correctas' },
      explicacion: { type: 'string', description: 'Breve explicación de la respuesta correcta' }
    }
  };

  var ESQUEMA_CURSO = {
    type: 'object',
    additionalProperties: false,
    required: ['titulo', 'descripcion', 'horasEstimadas', 'modulos', 'preguntas'],
    properties: {
      titulo: { type: 'string' },
      descripcion: { type: 'string', description: 'Descripción del curso en 2 o 3 frases' },
      horasEstimadas: { type: 'number', description: 'Duración total estimada en horas' },
      modulos: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['titulo', 'contenido', 'duracionMin'],
          properties: {
            titulo: { type: 'string' },
            contenido: { type: 'string', description: 'Contenido pedagógico completo del módulo, en texto plano. Usa "## " para subtítulos y "- " para listas.' },
            duracionMin: { type: 'integer', description: 'Minutos estimados de estudio' }
          }
        }
      },
      preguntas: { type: 'array', items: ESQUEMA_PREGUNTA }
    }
  };

  var ESQUEMA_EVALUACION = {
    type: 'object',
    additionalProperties: false,
    required: ['preguntas'],
    properties: { preguntas: { type: 'array', items: ESQUEMA_PREGUNTA } }
  };

  // Convierte las fuentes ({tipo:'texto'|'pdf', nombre, texto|base64}) en
  // bloques de contenido de la API. Los PDF van como bloques `document`.
  function fuentesABloques(fuentes) {
    var bloques = [];
    (fuentes || []).forEach(function (f) {
      if (f.tipo === 'pdf' && f.base64) {
        bloques.push({
          type: 'document',
          source: { type: 'base64', media_type: 'application/pdf', data: f.base64 },
          title: f.nombre || 'Documento'
        });
      } else if (f.texto) {
        bloques.push({
          type: 'text',
          text: '<fuente nombre="' + String(f.nombre || 'Fuente').replace(/"/g, "'") + '">\n' +
            f.texto + '\n</fuente>'
        });
      }
    });
    return bloques;
  }

  function mensajeErrorHTTP(estado, cuerpo) {
    var detalle = '';
    try { detalle = (cuerpo && cuerpo.error && cuerpo.error.message) || ''; } catch (e) { }
    if (estado === 401) return 'Clave de API inválida o revocada. Revísala en Ajustes de IA.';
    if (estado === 403) return 'La clave de API no tiene permiso para esta operación.';
    if (estado === 404) return 'Modelo no disponible para esta clave de API.';
    if (estado === 429) return 'Límite de uso de la API alcanzado. Espera un momento y reintenta.';
    if (estado === 529 || estado >= 500) return 'El servicio de IA está sobrecargado. Reintenta en unos minutos.';
    return 'Error de la API (' + estado + ')' + (detalle ? ': ' + detalle : '.');
  }

  // Llamada con transmisión (SSE). Devuelve {texto, stopReason}.
  // opciones: {clave, modelo, system, mensajes, maxTokens, esquema, onDelta, senal}
  function llamar(opciones) {
    var cuerpo = {
      model: opciones.modelo,
      max_tokens: opciones.maxTokens || 16000,
      stream: true,
      messages: opciones.mensajes
    };
    if (opciones.system) cuerpo.system = opciones.system;
    if (opciones.esquema) {
      cuerpo.output_config = { format: { type: 'json_schema', schema: opciones.esquema } };
    }
    var cabeceras = {
      'content-type': 'application/json',
      'x-api-key': opciones.clave,
      'anthropic-version': VERSION_API,
      // Permite llamar a la API directamente desde el navegador (CORS).
      'anthropic-dangerous-direct-browser-access': 'true'
    };
    if (opciones.modelo === 'claude-opus-5') {
      // Si un clasificador de seguridad declina la petición, la API la
      // reintenta sola en el modelo de respaldo recomendado.
      cuerpo.fallbacks = 'default';
      cabeceras['anthropic-beta'] = 'server-side-fallback-2026-07-01';
    }

    return fetch(URL_API, {
      method: 'POST',
      headers: cabeceras,
      body: JSON.stringify(cuerpo),
      signal: opciones.senal
    }).then(function (res) {
      if (!res.ok) {
        return res.json().catch(function () { return null; }).then(function (json) {
          throw new Error(mensajeErrorHTTP(res.status, json));
        });
      }
      var decodificador = new TextDecoder();
      var lector = res.body.getReader();
      var pendiente = '';
      var texto = '';
      var stopReason = null;

      function procesarLinea(linea) {
        linea = linea.trim();
        if (!linea || linea.indexOf('data:') !== 0) return;
        var carga = linea.slice(5).trim();
        if (!carga || carga === '[DONE]') return;
        var ev;
        try { ev = JSON.parse(carga); } catch (e) { return; }
        if (ev.type === 'content_block_delta' && ev.delta && ev.delta.type === 'text_delta') {
          texto += ev.delta.text;
          if (opciones.onDelta) opciones.onDelta(ev.delta.text, texto);
        } else if (ev.type === 'message_delta' && ev.delta && ev.delta.stop_reason) {
          stopReason = ev.delta.stop_reason;
        } else if (ev.type === 'error') {
          var msj = (ev.error && ev.error.message) || 'Error del servicio de IA.';
          throw new Error('El servicio de IA informó un error: ' + msj);
        }
      }

      function leer() {
        return lector.read().then(function (r) {
          if (r.done) {
            procesarLinea(pendiente);
            if (stopReason === 'refusal') {
              throw new Error('El modelo declinó responder esta petición. Ajusta el contenido de las fuentes e inténtalo de nuevo.');
            }
            if (stopReason === 'max_tokens') {
              throw new Error('La respuesta superó el largo máximo. Pide menos módulos o preguntas, o divide las fuentes.');
            }
            return { texto: texto, stopReason: stopReason };
          }
          pendiente += decodificador.decode(r.value, { stream: true });
          var partes = pendiente.split('\n');
          pendiente = partes.pop();
          partes.forEach(procesarLinea);
          return leer();
        });
      }
      return leer();
    }).catch(function (e) {
      if (e && e.name === 'AbortError') throw new Error('Generación cancelada.');
      if (e instanceof TypeError) {
        throw new Error('No se pudo conectar con la API de Claude. Revisa tu conexión a internet.');
      }
      throw e;
    });
  }

  function extraerJSON(texto) {
    try {
      return JSON.parse(texto);
    } catch (e) {
      // Por si el modelo envolvió el JSON en texto adicional.
      var inicio = texto.indexOf('{');
      var fin = texto.lastIndexOf('}');
      if (inicio >= 0 && fin > inicio) {
        return JSON.parse(texto.slice(inicio, fin + 1));
      }
      throw new Error('La IA no devolvió un JSON válido. Inténtalo de nuevo.');
    }
  }

  var SYSTEM_BASE = 'Eres un diseñador instruccional experto que crea material de ' +
    'capacitación corporativa en español, claro y aplicable al trabajo diario. ' +
    'Trabaja únicamente con la información de las fuentes entregadas; si algo no ' +
    'aparece en ellas, no lo inventes.';

  function generarCurso(op) {
    var indicacion = 'Con las fuentes entregadas, diseña un curso de capacitación completo.' +
      '\n- Cantidad de módulos: ' + (op.numModulos || 'entre 3 y 6, según el material') + '.' +
      '\n- Cada módulo debe tener contenido pedagógico completo y autosuficiente (no un simple índice): explica los conceptos, da ejemplos concretos y cierra con puntos clave.' +
      '\n- Incluye ' + (op.numPreguntas || 8) + ' preguntas de evaluación variadas (alternativa única, selección múltiple y verdadero/falso) que cubran todos los módulos.' +
      '\n- En las preguntas de verdadero/falso las opciones deben ser exactamente ["Verdadero", "Falso"].' +
      (op.indicaciones ? '\n- Indicaciones adicionales del administrador: ' + op.indicaciones : '');
    var contenido = fuentesABloques(op.fuentes).concat([{ type: 'text', text: indicacion }]);
    return llamar({
      clave: op.clave, modelo: op.modelo, system: SYSTEM_BASE,
      maxTokens: 32000, esquema: ESQUEMA_CURSO, onDelta: op.onDelta, senal: op.senal,
      mensajes: [{ role: 'user', content: contenido }]
    }).then(function (r) { return extraerJSON(r.texto); });
  }

  function generarPreguntas(op) {
    var indicacion = 'Redacta ' + (op.cantidad || 8) + ' preguntas de evaluación sobre el material entregado. ' +
      'Mezcla alternativa única, selección múltiple y verdadero/falso. ' +
      'En verdadero/falso las opciones deben ser exactamente ["Verdadero", "Falso"]. ' +
      'Cubre los puntos más importantes, no detalles triviales.' +
      (op.indicaciones ? ' Indicaciones adicionales: ' + op.indicaciones : '');
    var contenido = fuentesABloques(op.fuentes).concat([{ type: 'text', text: indicacion }]);
    return llamar({
      clave: op.clave, modelo: op.modelo, system: SYSTEM_BASE,
      maxTokens: 16000, esquema: ESQUEMA_EVALUACION, onDelta: op.onDelta, senal: op.senal,
      mensajes: [{ role: 'user', content: contenido }]
    }).then(function (r) { return extraerJSON(r.texto); });
  }

  var DOCUMENTOS = {
    resumen: 'Redacta un resumen ejecutivo del material entregado: los puntos esenciales, obligaciones y plazos si los hay. Usa subtítulos con "## " y listas con "- ". Extensión: una página.',
    guia: 'Redacta una guía de estudio del material entregado: conceptos clave con su definición, pasos o procedimientos importantes, y una lista final de verificación para el estudiante. Usa subtítulos con "## " y listas con "- ".',
    faq: 'Redacta una sección de preguntas frecuentes (10 a 15) sobre el material entregado, con respuestas breves y precisas. Formatea cada pregunta como subtítulo "## " y la respuesta debajo.'
  };

  function generarDocumento(op) {
    var indicacion = DOCUMENTOS[op.tipo] || DOCUMENTOS.resumen;
    if (op.indicaciones) indicacion += '\nIndicaciones adicionales: ' + op.indicaciones;
    var contenido = fuentesABloques(op.fuentes).concat([{ type: 'text', text: indicacion }]);
    return llamar({
      clave: op.clave, modelo: op.modelo, system: SYSTEM_BASE,
      maxTokens: 16000, onDelta: op.onDelta, senal: op.senal,
      mensajes: [{ role: 'user', content: contenido }]
    }).then(function (r) { return r.texto; });
  }

  // Conversación sobre las fuentes. historial: [{rol:'usuario'|'asistente', texto}]
  // (el último elemento debe ser la pregunta del usuario).
  function chat(op) {
    var mensajes = [];
    (op.historial || []).forEach(function (m, i) {
      var contenido;
      if (i === 0 && m.rol === 'usuario') {
        contenido = fuentesABloques(op.fuentes).concat([{ type: 'text', text: m.texto }]);
      } else {
        contenido = m.texto;
      }
      mensajes.push({ role: m.rol === 'usuario' ? 'user' : 'assistant', content: contenido });
    });
    return llamar({
      clave: op.clave, modelo: op.modelo,
      system: SYSTEM_BASE + ' Responde las preguntas del usuario citando de qué fuente sale cada dato. Si la respuesta no está en las fuentes, dilo claramente.',
      maxTokens: 8000, onDelta: op.onDelta, senal: op.senal,
      mensajes: mensajes
    }).then(function (r) { return r.texto; });
  }

  var IA = {
    MODELOS: MODELOS,
    fuentesABloques: fuentesABloques,
    llamar: llamar,
    extraerJSON: extraerJSON,
    generarCurso: generarCurso,
    generarPreguntas: generarPreguntas,
    generarDocumento: generarDocumento,
    chat: chat
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = IA;
  else global.IA = IA;
})(typeof window !== 'undefined' ? window : globalThis);

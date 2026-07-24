// Capa de almacenamiento: datos en localStorage e archivos binarios (PDF,
// videos, imágenes) en IndexedDB. Todo queda en el dispositivo.
(function (global) {
  'use strict';

  var CLAVE_DATOS = 'cap_datos_v1';
  var CLAVE_UI = 'cap_ui_v1';
  var BD_NOMBRE = 'cap_archivos';
  var BD_ALMACEN = 'archivos';

  function crearDatosIniciales() {
    return {
      version: 1,
      config: {
        nombreOrg: 'Mi Organización',
        lema: 'Plataforma de capacitaciones',
        logo: null,
        colorPrimario: '#2f6bd0',
        colorAcento: '#d99a2b',
        notaAprobacionDefecto: 70,
        categorias: [
          { id: 'cat_legal', nombre: 'Legal y normativa', color: '#e0524d', descripcion: 'Capacitaciones obligatorias por ley o normativa interna.' },
          { id: 'cat_basicos', nombre: 'Cursos básicos', color: '#3f8ae0', descripcion: 'Inducción y conocimientos esenciales de la organización.' },
          { id: 'cat_comp', nombre: 'Complementarias', color: '#3dbf7a', descripcion: 'Desarrollo de habilidades y temas de apoyo.' }
        ],
        cert: {
          prefijoFolio: 'CERT',
          firmante: '',
          cargoFirmante: '',
          textoLegal: ''
        },
        ia: { clave: '', modelo: 'claude-opus-5' }
      },
      personas: [],
      cursos: [],
      programas: [],
      inscripciones: [],
      certificados: [],
      archivos: [],
      iaFuentes: [],
      secuencias: { folio: 0 }
    };
  }

  // Rellena claves faltantes tras importar o al actualizar versiones.
  function completarDatos(d) {
    var base = crearDatosIniciales();
    d = d && typeof d === 'object' ? d : {};
    Object.keys(base).forEach(function (k) {
      if (d[k] === undefined) d[k] = base[k];
    });
    Object.keys(base.config).forEach(function (k) {
      if (d.config[k] === undefined) d.config[k] = base.config[k];
    });
    if (!d.config.cert) d.config.cert = base.config.cert;
    if (!d.config.ia) d.config.ia = base.config.ia;
    if (!Array.isArray(d.config.categorias) || !d.config.categorias.length) {
      d.config.categorias = base.config.categorias;
    }
    return d;
  }

  var Almacen = {
    datos: null,
    ui: null,

    cargar: function () {
      var crudo = null;
      try { crudo = JSON.parse(localStorage.getItem(CLAVE_DATOS)); } catch (e) { crudo = null; }
      this.datos = completarDatos(crudo || crearDatosIniciales());
      try { this.ui = JSON.parse(localStorage.getItem(CLAVE_UI)) || {}; } catch (e) { this.ui = {}; }
      return this.datos;
    },

    guardar: function () {
      try {
        localStorage.setItem(CLAVE_DATOS, JSON.stringify(this.datos));
        return true;
      } catch (e) {
        console.error('No se pudo guardar', e);
        return false;
      }
    },

    guardarUI: function () {
      try { localStorage.setItem(CLAVE_UI, JSON.stringify(this.ui)); } catch (e) { }
    },

    /* ---------- exportar / importar ---------- */

    // Exporta los datos (sin los binarios de IndexedDB).
    exportarJSON: function () {
      var copia = JSON.parse(JSON.stringify(this.datos));
      // La clave de la API nunca sale del dispositivo.
      if (copia.config && copia.config.ia) copia.config.ia.clave = '';
      return JSON.stringify({ app: 'capacitaciones', version: 1, exportadoEn: new Date().toISOString(), datos: copia }, null, 2);
    },

    importarJSON: function (texto) {
      var obj = JSON.parse(texto);
      var datos = obj && obj.app === 'capacitaciones' ? obj.datos : obj;
      if (!datos || typeof datos !== 'object' || !Array.isArray(datos.cursos)) {
        throw new Error('El archivo no parece un respaldo de esta aplicación.');
      }
      var claveActual = (this.datos && this.datos.config && this.datos.config.ia && this.datos.config.ia.clave) || '';
      this.datos = completarDatos(datos);
      if (!this.datos.config.ia.clave) this.datos.config.ia.clave = claveActual;
      this.guardar();
      return this.datos;
    },

    restablecer: function () {
      this.datos = crearDatosIniciales();
      this.guardar();
    },

    /* ---------- archivos binarios (IndexedDB) ---------- */

    _bd: null,

    abrirBD: function () {
      var self = this;
      if (self._bd) return Promise.resolve(self._bd);
      return new Promise(function (resolver, rechazar) {
        var pedido = indexedDB.open(BD_NOMBRE, 1);
        pedido.onupgradeneeded = function () {
          var bd = pedido.result;
          if (!bd.objectStoreNames.contains(BD_ALMACEN)) bd.createObjectStore(BD_ALMACEN);
        };
        pedido.onsuccess = function () { self._bd = pedido.result; resolver(self._bd); };
        pedido.onerror = function () { rechazar(pedido.error || new Error('No se pudo abrir la base local de archivos.')); };
      });
    },

    guardarArchivo: function (id, blob) {
      return this.abrirBD().then(function (bd) {
        return new Promise(function (resolver, rechazar) {
          var tx = bd.transaction(BD_ALMACEN, 'readwrite');
          tx.objectStore(BD_ALMACEN).put(blob, id);
          tx.oncomplete = function () { resolver(id); };
          tx.onerror = function () { rechazar(tx.error || new Error('No se pudo guardar el archivo.')); };
        });
      });
    },

    obtenerArchivo: function (id) {
      return this.abrirBD().then(function (bd) {
        return new Promise(function (resolver, rechazar) {
          var pedido = bd.transaction(BD_ALMACEN, 'readonly').objectStore(BD_ALMACEN).get(id);
          pedido.onsuccess = function () { resolver(pedido.result || null); };
          pedido.onerror = function () { rechazar(pedido.error || new Error('No se pudo leer el archivo.')); };
        });
      });
    },

    eliminarArchivo: function (id) {
      return this.abrirBD().then(function (bd) {
        return new Promise(function (resolver) {
          var tx = bd.transaction(BD_ALMACEN, 'readwrite');
          tx.objectStore(BD_ALMACEN).delete(id);
          tx.oncomplete = function () { resolver(); };
          tx.onerror = function () { resolver(); };
        });
      });
    },

    // Registra el archivo en los datos y guarda el blob. Devuelve la ficha.
    registrarArchivo: function (archivo, blob) {
      var self = this;
      return self.guardarArchivo(archivo.id, blob).then(function () {
        self.datos.archivos.push(archivo);
        self.guardar();
        return archivo;
      });
    },

    fichaArchivo: function (id) {
      return (this.datos.archivos || []).find(function (a) { return a.id === id; }) || null;
    }
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Almacen;
  else global.Almacen = Almacen;
})(typeof window !== 'undefined' ? window : globalThis);

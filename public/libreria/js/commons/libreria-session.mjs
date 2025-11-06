// js/commons/libreria-session.mjs
// VERSIÓN MEJORADA: Gestión clara de sesión y persistencia de usuarios

const SESSION_KEY = 'libreria_session';
const MSGS_KEY = 'libreria_messages';
const USERS_KEY = 'libreria_usuarios';
const CARRITOS_KEY = 'libreria_carritos';
const LIBROS_KEY = 'libreria_libros_session';
const FACTURAS_KEY = 'libreria_facturas';

/**
 * Helpers para localStorage
 */
const LocalStorage = {
    get(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('localStorage inaccesible:', e);
            return null;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn('localStorage inaccesible:', e);
        }
    },
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.warn('localStorage inaccesible:', e);
        }
    }
};

/**
 * Helpers para sessionStorage (para la sesión actual)
 */
const SessionStorage = {
    get(key) {
        try {
            return sessionStorage.getItem(key);
        } catch (e) {
            console.warn('sessionStorage inaccesible:', e);
            return null;
        }
    },
    set(key, value) {
        try {
            sessionStorage.setItem(key, value);
        } catch (e) {
            console.warn('sessionStorage inaccesible:', e);
        }
    },
    remove(key) {
        try {
            sessionStorage.removeItem(key);
        } catch (e) {
            console.warn('sessionStorage inaccesible:', e);
        }
    }
};

// Generador de IDs para mensajes
let _msgLastId = Date.now();
function genMsgId() {
    return ++_msgLastId;
}

// EventTarget para listeners
const _evt = new EventTarget();

function _emitEvent(message) {
    _evt.dispatchEvent(new CustomEvent('libreria:message', { detail: message }));
}

/** Mensajes */
function _loadMessagesFromStorage() {
    const raw = LocalStorage.get(MSGS_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw) || [];
    } catch (e) {
        console.warn('Error parseando mensajes en storage:', e);
        return [];
    }
}

function _saveMessagesToStorage(msgs) {
    LocalStorage.set(MSGS_KEY, JSON.stringify(msgs || []));
}

/** Carritos */
function _readAllCarritos() {
    const raw = LocalStorage.get(CARRITOS_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw) || [];
    } catch {
        return [];
    }
}

function _writeAllCarritos(list) {
    LocalStorage.set(CARRITOS_KEY, JSON.stringify(list || []));
}

/** Facturas */
function _readAllFacturas() {
    const raw = LocalStorage.get(FACTURAS_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw) || [];
    } catch {
        return [];
    }
}

function _writeAllFacturas(list) {
    LocalStorage.set(FACTURAS_KEY, JSON.stringify(list || []));
}

export const LibreriaSession = {

    // ==================== GESTIÓN DE SESIÓN (sessionStorage) ====================

    /**
     * Guarda la sesión del usuario actual
     * Solo guarda info mínima: _id, email, rol
     */
    setUser(usuario) {
        if (!usuario) {
            console.warn("setUser: usuario inválido");
            return;
        }
        const data = {
            _id: usuario._id,
            email: usuario.email,
            rol: usuario.rol
        };
        SessionStorage.set(SESSION_KEY, JSON.stringify(data));
    },

    /**
     * Obtiene la sesión del usuario actual
     */
    getUserSession() {
        const raw = SessionStorage.get(SESSION_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.warn('Error parseando sesión:', e);
            return null;
        }
    },

    /**
     * Limpia la sesión del usuario
     */
    clearUserSession() {
        SessionStorage.remove(SESSION_KEY);
    },

    /**
     * Verifica si hay un usuario autenticado
     */
    isAuthenticated() {
        return !!this.getUserSession();
    },

    /**
     * Obtiene el rol del usuario actual
     */
    getRole() {
        const u = this.getUserSession();
        return u ? u.rol : null;
    },

    /**
     * Obtiene el ID del usuario actual
     */
    getUserId() {
        const u = this.getUserSession();
        const userId = u ? u._id : null;
        console.log("[LibreriaSession] getUserId:", userId, "tipo:", typeof userId);
        return userId;
    },

    // ==================== PERSISTENCIA DE USUARIOS (localStorage) ====================

    /**
     * Guarda todos los usuarios en localStorage
     * Reemplaza completamente el array de usuarios
     */
    saveAllUsuarios(usuarios) {
        const data = usuarios.map(u => ({
            _id: u._id,
            dni: u.dni,
            email: u.email,
            rol: u.rol,
            nombre: u.nombre,
            apellidos: u.apellidos,
            password: u.password,
            direccion: u.direccion
        }));
        LocalStorage.set(USERS_KEY, JSON.stringify(data));
        console.log(`${data.length} usuarios guardados en localStorage`);
    },

    /**
     * Obtiene todos los usuarios desde localStorage
     */
    getAllUsuarios() {
        const raw = LocalStorage.get(USERS_KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw) || [];
        } catch {
            return [];
        }
    },

    /**
     * Guarda un usuario individual en localStorage
     * Si el usuario ya existe (mismo _id), lo reemplaza
     * Si no existe, lo agrega
     */
    saveUsuario(usuario) {
        let usuarios = this.getAllUsuarios();

        // Buscar si ya existe
        const index = usuarios.findIndex(u => u._id === usuario._id);

        if (index !== -1) {
            // Actualizar usuario existente
            usuarios[index] = {
                _id: usuario._id,
                dni: usuario.dni,
                email: usuario.email,
                rol: usuario.rol,
                nombre: usuario.nombre,
                apellidos: usuario.apellidos,
                password: usuario.password,
                direccion: usuario.direccion
            };
            console.log(`Usuario actualizado en localStorage: ${usuario.email}`);
        } else {
            // Agregar nuevo usuario
            usuarios.push({
                _id: usuario._id,
                dni: usuario.dni,
                email: usuario.email,
                rol: usuario.rol,
                nombre: usuario.nombre,
                apellidos: usuario.apellidos,
                password: usuario.password,
                direccion: usuario.direccion
            });
            console.log(`Usuario agregado a localStorage: ${usuario.email}`);
        }

        LocalStorage.set(USERS_KEY, JSON.stringify(usuarios));
    },

    /**
     * Busca un usuario por email en localStorage
     */
    getUsuarioByEmail(email) {
        const usuarios = this.getAllUsuarios();
        return usuarios.find(u => u.email === email);
    },

    /**
     * Busca un usuario por ID en localStorage
     */
    getUsuarioById(id) {
        const usuarios = this.getAllUsuarios();
        return usuarios.find(u => u._id == id);
    },

    /**
     * Busca usuarios por email y rol en localStorage
     * Útil porque puedes tener mismo email con diferentes roles
     */
    getUsuarioByEmailAndRol(email, rol) {
        const usuarios = this.getAllUsuarios();
        return usuarios.find(u => u.email === email && u.rol === rol);
    },

    /**
     * Verifica si existe un usuario con un email y rol específico
     */
    existeUsuarioConEmailYRol(email, rol) {
        return !!this.getUsuarioByEmailAndRol(email, rol);
    },

    /**
     * Obtiene todos los usuarios con un email específico (puede haber varios con diferentes roles)
     */
    getUsuariosByEmail(email) {
        const usuarios = this.getAllUsuarios();
        return usuarios.filter(u => u.email === email);
    },

    /**
     * Elimina un usuario de localStorage por ID
     */
    deleteUsuario(id) {
        let usuarios = this.getAllUsuarios();
        usuarios = usuarios.filter(u => u._id != id);
        LocalStorage.set(USERS_KEY, JSON.stringify(usuarios));
        console.log(`Usuario eliminado de localStorage: ${id}`);
    },

    /**
     * Limpia todos los usuarios de localStorage
     */
    clearAllUsuarios() {
        LocalStorage.remove(USERS_KEY);
        console.log("Todos los usuarios eliminados de localStorage");
    },

    // ==================== GESTIÓN DE MENSAJES ====================

    addMessage(type, text, options = { persist: true }) {
        if (!text) return null;
        const msg = {
            id: genMsgId(),
            type: type || 'info',
            text: String(text),
            ts: Date.now()
        };

        if (options.persist !== false) {
            const msgs = _loadMessagesFromStorage();
            msgs.push(msg);
            _saveMessagesToStorage(msgs);
        }

        _emitEvent(msg);
        return msg;
    },

    getMessages() {
        return _loadMessagesFromStorage();
    },

    consumeMessages() {
        const msgs = _loadMessagesFromStorage();
        _saveMessagesToStorage([]);
        return msgs;
    },

    clearMessages() {
        _saveMessagesToStorage([]);
    },

    onMessage(callback) {
        if (typeof callback !== 'function') return () => { };
        const listener = (e) => {
            try {
                callback(e.detail);
            } catch (err) {
                console.error('Error en callback onMessage:', err);
            }
        };
        _evt.addEventListener('libreria:message', listener);
        return () => _evt.removeEventListener('libreria:message', listener);
    },

    onStorageMessagesChange(callback) {
        const handler = (ev) => {
            if (ev.key === MSGS_KEY) {
                let newVal = [];
                try {
                    newVal = ev.newValue ? JSON.parse(ev.newValue) : [];
                } catch (e) { newVal = []; }
                callback(newVal);
            }
        };
        window.addEventListener('storage', handler);
        return () => window.removeEventListener('storage', handler);
    },

    // ==================== PERSISTENCIA DE CARRITOS (localStorage) ====================

    saveCarrito(userId, carro) {
        console.log('[LibreriaSession] Guardando carrito para usuario:', userId);
        const all = _readAllCarritos().filter(c => c.userId != userId);
        const items = (carro?.items || []).map(it => ({
            libro: it.libro?._id ?? it.libro,
            cantidad: it.cantidad,
            total: it.total
        }));
        all.push({
            userId,
            items,
            subtotal: carro?.subtotal || 0,
            iva: carro?.iva || 0,
            total: carro?.total || 0
        });
        _writeAllCarritos(all);
        console.log('[LibreriaSession] Carrito guardado. Items:', items.length);
    },

    getAllCarritos() {
        const list = _readAllCarritos();
        console.log('[LibreriaSession] getAllCarritos ->', list.length);
        return list;
    },

    getCarritoByUser(userId) {
        const c = _readAllCarritos().find(c => c.userId == userId) || null;
        console.log('[LibreriaSession] getCarritoByUser', userId, '->', c ? (c.items?.length || 0) : 'null');
        return c;
    },

    clearAllCarritos() {
        LocalStorage.remove(CARRITOS_KEY);
    },

    deleteCarrito(userId) {
        const all = _readAllCarritos().filter(c => c.userId != userId);
        _writeAllCarritos(all);
    },

    // ==================== PERSISTENCIA DE FACTURAS (localStorage) ====================
    
    //INFO que debe guardar la factura> *id*, *fecha*, *totalFactura*, razonSocial, dni, direccion, email, items (cantidad, detalle, precioUnitario, totalItem)

    saveFactura(factura) {
        const all = _readAllFacturas()
        all.push(factura);
        _writeAllFacturas(all);
    },

    // ==================== PERSISTENCIA DE LIBROS (sessionStorage) ====================

    getAllLibros() {
        const raw = SessionStorage.get(LIBROS_KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw) || [];
        } catch {
            return [];
        }
    },

    saveAllLibros(libros) {
        const data = (libros || []).map(l => ({
            _id: l._id,
            isbn: l.isbn,
            titulo: l.titulo,
            autores: l.autores,
            portada: l.portada,
            resumen: l.resumen,
            stock: l.stock,
            precio: typeof l.precio === 'string' ? parseFloat(l.precio) : l.precio
        }));
        SessionStorage.set(LIBROS_KEY, JSON.stringify(data));
    },

    clearAllLibros() {
        SessionStorage.remove(LIBROS_KEY);
    }
};

// Exports de compatibilidad con versiones anteriores en las que habia un archivo para el carrito-storage y otro para libros-storage
export const CarritoStorage = {
    save: (userId, carro) => LibreriaSession.saveCarrito(userId, carro),
    getAll: () => LibreriaSession.getAllCarritos(),
    getByUser: (userId) => LibreriaSession.getCarritoByUser(userId),
    clearAll: () => LibreriaSession.clearAllCarritos()
};

export const LibrosStorage = {
    getAll: () => LibreriaSession.getAllLibros(),
    saveAll: (libros) => LibreriaSession.saveAllLibros(libros),
    clear: () => LibreriaSession.clearAllLibros()
};
// js/commons/libreria-session.mjs
// Gestiona la sesión (localStorage) y los mensajes globales del sistema.

const SESSION_KEY = 'libreria_session';
const MSGS_KEY = 'libreria_messages';
const USERS_KEY = "libreria_usuarios";

/**
 * Estructura de usuario guardada en sesión:
 * { _id: Number, rol: String }
 *
 * Mensaje:
 * { id: Number, type: 'info'|'error'|'warn'|'success', text: String, ts: Number }
 */

const safeStorage = {
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

// Generador simple de ids para mensajes
let _msgLastId = Date.now();
function genMsgId() {
    return ++_msgLastId;
}

// EventTarget para listeners en la pestaña actual
const _evt = new EventTarget();

function _emitEvent(message) {
    _evt.dispatchEvent(new CustomEvent('libreria:message', { detail: message }));
}

/** Mensajes en localStorage */
function _loadMessagesFromStorage() {
    const raw = safeStorage.get(MSGS_KEY);
    if (!raw) return [];
    try {
        return JSON.parse(raw) || [];
    } catch (e) {
        console.warn('Error parseando mensajes en storage:', e);
        return [];
    }
}
function _saveMessagesToStorage(msgs) {
    safeStorage.set(MSGS_KEY, JSON.stringify(msgs || []));
}

export const LibreriaSession = {
    // ---------------------
    // Gestión de sesión
    // ---------------------
    setUser(usuario) {
        console.log("Set user in session:", usuario);
        if (!usuario) {
            // Si ya existe, mostramos mensaje de error
            LibreriaSession.addMessage("error", "No se puede registrar el usuario");
            return;
        }
        const data = { _id: usuario._id, rol: usuario.rol };
        safeStorage.set(SESSION_KEY, JSON.stringify(data));
    },

    getUser() {
        const raw = safeStorage.get(SESSION_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (e) {
            console.warn('Error parseando sesión:', e);
            return null;
        }
    },

    clearUser() {
        safeStorage.remove(SESSION_KEY);
    },

    isAuthenticated() {
        return !!this.getUser();
    },

    getRole() {
        const u = this.getUser();
        return u ? u.rol : null;
    },

    getUserId() {
        const u = this.getUser();
        return u ? u._id : null;
    },

    // ---------------------
    // Gestión de mensajes
    // ---------------------
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

    /**
     * Listener para cambios en mensajes desde otras pestañas/ventanas
     */
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

    // ---------------------
    // Gestión de usuarios persistidos
    // ---------------------
    saveUsuario(usuario) {
        let usuarios = this.getUsuarios();
        usuarios.push({
            _id: usuario._id,
            dni: usuario.dni,
            email: usuario.email,
            rol: usuario.rol,
            nombre: usuario.nombre,
            apellidos: usuario.apellidos
        });
        safeStorage.set(USERS_KEY, JSON.stringify(usuarios));
    },

    getUsuarios() {
        const raw = safeStorage.get(USERS_KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw) || [];
        } catch {
            return [];
        }
    },

    clearUsuarios() {
        safeStorage.remove(USERS_KEY);
    }
};
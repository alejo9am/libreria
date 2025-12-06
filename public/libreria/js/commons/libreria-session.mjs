// js/commons/libreria-session.mjs
// VERSIÓN MEJORADA: Gestión clara de sesión y persistencia de usuarios
import { ROL } from "../model/proxy.mjs";

const MSGS_KEY = 'libreria_messages';
const USUARIO_ID = 'USUARIO_ID';
const USUARIO_ROL = 'USUARIO_ROL';
const TOKEN_ID = 'TOKEN_ID';

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

function _deleteMessagesFromStorage() {
    LocalStorage.remove(MSGS_KEY);
}


export const LibreriaSession = {

    // ==================== GESTIÓN DE SESIÓN (sessionStorage) ====================
    ingreso(usuario) {
        this.setUsuarioId(usuario._id);
        this.setUsuarioRol(usuario.rol);
    },

    setUsuarioId(id) { sessionStorage.setItem(USUARIO_ID, id); },
    getUsuarioId() {
        if (this.esInvitado()) throw new Error('Es un invitado');
        return sessionStorage.getItem(USUARIO_ID);
    },

    setUsuarioRol(rol) { sessionStorage.setItem(USUARIO_ROL, rol); },
    getUsuarioRol() { return sessionStorage.getItem(USUARIO_ROL); },

    salir() {
        sessionStorage.removeItem(USUARIO_ID);
        sessionStorage.removeItem(USUARIO_ROL);
        sessionStorage.removeItem(TOKEN_ID);
    },

    esInvitado() { return !this.getUsuarioRol(); },
    esCliente() { return !this.esInvitado() && this.getUsuarioRol() == ROL.CLIENTE; },
    esAdmin() { return !this.esInvitado() && this.getUsuarioRol() == ROL.ADMIN; },

    setToken(token) { sessionStorage.setItem(TOKEN_ID, token); },
    getToken() { return sessionStorage.getItem(TOKEN_ID); },

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
        _deleteMessagesFromStorage();
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

};
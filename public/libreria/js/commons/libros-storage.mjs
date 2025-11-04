// js/commons/libros-storage.mjs
// Persistencia de libros (solo para la sesión actual) para estabilizar precios aleatorios

const LIBROS_KEY = 'libreria_libros_session';

const SessionStorage = {
  get(key) { try { return sessionStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { sessionStorage.setItem(key, value); } catch {} },
  remove(key) { try { sessionStorage.removeItem(key); } catch {} }
};

export const LibrosStorage = {
  getAll() {
    const raw = SessionStorage.get(LIBROS_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw) || []; } catch { return []; }
  },
  saveAll(libros) {
    // Guardar solo campos necesarios
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
  clear() { SessionStorage.remove(LIBROS_KEY); }
};

// js/commons/carrito-storage.mjs
// Persistencia de carritos por usuario en localStorage, independiente de LibreriaSession

const CARRITOS_KEY = 'libreria_carritos';

const LocalStorage = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch {}
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch {}
  }
};

function readAll() {
  const raw = LocalStorage.get(CARRITOS_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw) || []; } catch { return []; }
}

function writeAll(list) {
  LocalStorage.set(CARRITOS_KEY, JSON.stringify(list || []));
}

export const CarritoStorage = {
  save(userId, carro) {
    console.log('[CarritoStorage] Guardando carrito para usuario:', userId);
    const all = readAll().filter(c => c.userId != userId);
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
    writeAll(all);
    console.log('[CarritoStorage] Carrito guardado. Items:', items.length);
  },
  getAll() {
    const list = readAll();
    console.log('[CarritoStorage] getAll ->', list.length);
    return list;
  },
  getByUser(userId) {
    const c = readAll().find(c => c.userId == userId) || null;
    console.log('[CarritoStorage] getByUser', userId, '->', c ? (c.items?.length || 0) : 'null');
    return c;
  },
  clearAll() {
    LocalStorage.remove(CARRITOS_KEY);
  }
};

import { API_BASE_URL } from '../../config.mjs';
import { LibreriaSession } from "../commons/libreria-session.mjs";

// Proxy del cliente para API REST - Práctica 2
export const ROL = {
  ADMIN: "ADMIN",
  CLIENTE: "CLIENTE",
};

export class LibreriaProxy {
  constructor() { }

  /* ==================== LIBROS ==================== */
  async getLibros() {
    const response = await fetch(`${API_BASE_URL}/libros`);
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async setLibros(array) {
    const response = await fetch(`${API_BASE_URL}/libros`, {
      method: 'PUT',
      body: JSON.stringify(array),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async removeLibros() {
    const response = await fetch(`${API_BASE_URL}/libros`, { method: 'DELETE' });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async addLibro(obj) {
    const response = await fetch(`${API_BASE_URL}/libros`, {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async getLibroPorId(id) {
    const response = await fetch(`${API_BASE_URL}/libros/${id}`);
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async getLibroPorIsbn(isbn) {
    const response = await fetch(`${API_BASE_URL}/libros?isbn=${encodeURIComponent(isbn)}`);
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async getLibroPorTitulo(titulo) {
    const response = await fetch(`${API_BASE_URL}/libros?titulo=${encodeURIComponent(titulo)}`);
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async removeLibro(id) {
    const response = await fetch(`${API_BASE_URL}/libros/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async updateLibro(obj) {
    if (!obj._id) throw new Error('El objeto debe tener un _id');
    const response = await fetch(`${API_BASE_URL}/libros/${obj._id}`, {
      method: 'PUT',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  /* ==================== CLIENTES ==================== */
  async getClientes() {
    const response = await fetch(`${API_BASE_URL}/clientes`);
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async setClientes(array) {
    const response = await fetch(`${API_BASE_URL}/clientes`, {
      method: 'PUT',
      body: JSON.stringify(array),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async removeClientes() {
    const response = await fetch(`${API_BASE_URL}/clientes`, { method: 'DELETE' });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async addCliente(obj) {
    const response = await fetch(`${API_BASE_URL}/clientes`, {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async getClientePorId(id) {
    const response = await fetch(`${API_BASE_URL}/clientes/${id}`);
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async getClientePorEmail(email) {
    const response = await fetch(`${API_BASE_URL}/clientes?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async getClientePorDni(dni) {
    const response = await fetch(`${API_BASE_URL}/clientes?dni=${encodeURIComponent(dni)}`);
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async removeCliente(id) {
    const response = await fetch(`${API_BASE_URL}/clientes/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async updateCliente(obj) {
    if (!obj._id) throw new Error('El objeto debe tener un _id');
    const response = await fetch(`${API_BASE_URL}/clientes/${obj._id}`, {
      method: 'PUT',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  // Método unificado de registro
  async registrar(obj) {
    const ruta = obj.rol === ROL.ADMIN ? 'admins' : 'clientes';
    const response = await fetch(`${API_BASE_URL}/${ruta}`, {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  /* ==================== CARRITO ==================== */

  async getCarroCliente(clienteId) {
    const response = await fetch(`${API_BASE_URL}/clientes/${clienteId}/carro`);
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async addClienteCarroItem(clienteId, item) {
    const response = await fetch(`${API_BASE_URL}/clientes/${clienteId}/carro/items`, {
      method: 'POST',
      body: JSON.stringify(item),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async setClienteCarroItemCantidad(clienteId, index, cantidad) {
    const response = await fetch(`${API_BASE_URL}/clientes/${clienteId}/carro/items/${index}`, {
      method: 'PUT',
      body: JSON.stringify({ cantidad }),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  /* ==================== ADMINISTRADORES ==================== */

  async getAdmins() {
    const response = await fetch(`${API_BASE_URL}/admins`);
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async setAdmins(array) {
    const response = await fetch(`${API_BASE_URL}/admins`, {
      method: 'PUT',
      body: JSON.stringify(array),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async removeAdmins() {
    const response = await fetch(`${API_BASE_URL}/admins`, { method: 'DELETE' });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async addAdmin(obj) {
    const response = await fetch(`${API_BASE_URL}/admins`, {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async getAdminPorId(id) {
    const response = await fetch(`${API_BASE_URL}/admins/${id}`);
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async getAdminPorEmail(email) {
    const response = await fetch(`${API_BASE_URL}/admins?email=${encodeURIComponent(email)}`);
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async getAdminPorDni(dni) {
    const response = await fetch(`${API_BASE_URL}/admins?dni=${encodeURIComponent(dni)}`);
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async removeAdmin(id) {
    const response = await fetch(`${API_BASE_URL}/admins/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async updateAdmin(obj) {
    if (!obj._id) throw new Error('El objeto debe tener un _id');
    const response = await fetch(`${API_BASE_URL}/admins/${obj._id}`, {
      method: 'PUT',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  /* ==================== FACTURAS ==================== */

  async getFacturas() {
    const response = await fetch(`${API_BASE_URL}/facturas`);
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async setFacturas(array) {
    const response = await fetch(`${API_BASE_URL}/facturas`, {
      method: 'PUT',
      body: JSON.stringify(array),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async removeFacturas() {
    const response = await fetch(`${API_BASE_URL}/facturas`, { method: 'DELETE' });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async facturarCompraCliente(obj) {
    const response = await fetch(`${API_BASE_URL}/facturas`, {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json' }
    });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async getFacturaPorId(id) {
    const response = await fetch(`${API_BASE_URL}/facturas/${id}`);
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async getFacturaPorNumero(numero) {
    const response = await fetch(`${API_BASE_URL}/facturas?numero=${encodeURIComponent(numero)}`);
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async getFacturasCliente(clienteId) {
    const response = await fetch(`${API_BASE_URL}/facturas?cliente=${clienteId}`);
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  async removeFactura(id) {
    const response = await fetch(`${API_BASE_URL}/facturas/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error((await response.json()).error);
    return await response.json();
  }

  /* ==================== USUARIOS (para passport) ==================== */
  async addUsuario(obj) {
    let response = await fetch('/api/usuarios', {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
    if (response.ok) {
      return await response.json();
    } else {
      let body = await response.json();
      throw new Error(`Error ${response.status}: ${response.statusText}\n ${body.message}`);
    }
  }

  async getUsuarioById(id) {
    let response = await fetch('/api/usuarios/' + id, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `bearer ${LibreriaSession.getToken()}`,
      }
    });
    if (response.ok) {
      return await response.json();
    } else {
      let body = await response.json();
      throw new Error(`Error ${response.status}: ${response.statusText}\n ${body.message}`);
    }
  }

  async getUsuarioActual() {
    let response = await fetch('/api/usuarios/actual', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `bearer ${LibreriaSession.getToken()}`,
      }
    });
    if (response.ok) {
      return await response.json();
    } else {
      let body = await response.json();
      throw new Error(`Error ${response.status}: ${response.statusText}\n ${body.message}`);
    }
  }

  async updateUsuario(obj) {
    let response = await fetch('/api/usuarios/' + obj._id, {
      method: 'PUT',
      body: JSON.stringify(obj),
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `bearer ${LibreriaSession.getToken()}`,
      },
    });
    if (response.ok) {
      return await response.json();
    } else {
      let body = await response.json();
      throw new Error(`Error ${response.status}: ${response.statusText}\n ${body.message}`);
    }
  }

  async autenticar(obj) {
    let response = await fetch('/api/autenticar', {
      method: 'POST',
      body: JSON.stringify(obj),
      headers: { 'Content-Type': 'application/json;charset=utf-8' }
    });
    if (response.ok) {
      return await response.json();
    } else {
      let body = await response.json();
      throw new Error(`Error ${response.status}: ${response.statusText}\n ${body.message}`);
    }
  }
}

export const proxy = new LibreriaProxy();

export const ROL = {
  ADMIN: "ADMIN",
  CLIENTE: "CLIENTE",
};

import { LibreriaSession } from "../commons/libreria-session.mjs";

class Identificable {
  _id;
  assignId() {
    this._id = Libreria.genId();
  }
}

export class Libreria {
  libros = [];
  usuarios = [];
  facturas = [];
  static lastId = 0;

  constructor() { }

  static genId() {
    return ++this.lastId;
  }

  /**
   * Libros
   */

  getLibros() {
    return this.libros;
  }

  addLibro(obj) {
    if (!obj.isbn) throw new Error('El libro no tiene ISBN');
    if (this.getLibroPorIsbn(obj.isbn)) throw new Error(`El ISBN ${obj.isbn} ya existe`)
    let libro = new Libro();
    Object.assign(libro, obj);
    libro.assignId();
    this.libros.push(libro);
    return libro;
  }

  getLibroPorId(id) {
    return this.libros.find((v) => v._id == id);
  }

  getLibroPorIsbn(isbn) {
    return this.libros.find((v) => v.isbn == isbn);
  }

  getLibroPorTitulo(titulo) {
    titulo = titulo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.libros.find(
      (v) => !!v.titulo.match(new RegExp(titulo, 'i'))
    );
  }

  removeLibro(id) {
    let libro = this.getLibroPorId(id);
    if (!libro) throw new Error('Libro no encontrado');
    else this.libros = this.libros.filter(l => l._id != id);
    return libro;
  }


  updateLibro(obj) {
    let libro = this.getLibroPorId(obj._id);
    Object.assign(libro, obj);
    return libro;
  }

  /**
   * Usuario
   */

  addUsuario(obj) {
    if (obj.rol == ROL.CLIENTE)
      this.addCliente(obj);
    else if (obj.rol == ROL.ADMIN)
      this.addAdmin(obj);
    else throw new Error('Rol desconocido');
  }

  addCliente(obj) {
    let cliente = this.getClientePorEmail(obj.email);
    if (cliente) throw new Error('Correo electrónico registrado');
    cliente = new Cliente();
    Object.assign(cliente, obj);
    cliente.assignId();
    this.usuarios.push(cliente);
    return cliente;
  }

  addAdmin(obj) {
    let admin = new Administrador();
    Object.assign(admin, obj)
    admin.assignId();
    this.usuarios.push(admin);
    return admin;
  }

  getClientes() {
    return this.usuarios.filter((u) => u.rol == ROL.CLIENTE);
  }

  getAdmins() {
    return this.usuarios.filter((u) => u.rol == ROL.ADMIN);
  }

  getUsuarioPorId(_id) {
    return this.usuarios.find((u) => u._id == _id);
  }

  getUsuarioPorEmail(email) {
    return this.usuarios.find((u) => u.email == email);
  }

  getUsuarioPorDni(dni) {
    return this.usuarios.find((u) => u.dni == dni);
  }

  updateUsuario(obj) {
    let usuario = this.getUsuarioPorId(obj._id);
    Object.assign(usuario, obj);
    return usuario;
  }

  getClientePorEmail(email) {
    return this.usuarios.find(u => u.rol == ROL.CLIENTE && u.email == email);
  }

  getClientePorId(id) {
    console.log('[Model] getClientePorId - Buscando cliente con id:', id, 'tipo:', typeof id);
    console.log('[Model] getClientePorId - Clientes disponibles:', this.usuarios.filter(u => u.rol == ROL.CLIENTE).map(u => ({ _id: u._id, email: u.email })));
    const numId = Number(id);
    let cliente = this.usuarios.find(u => u.rol == ROL.CLIENTE && u._id === numId);
    if (cliente) return cliente;

    // Fallback: intentar restaurar desde localStorage si no está cargado aún
    try {
      console.warn('[Model] getClientePorId - Cliente no encontrado en modelo, intentando restaurar desde storage:', id);
      const usuariosStorage = LibreriaSession.getUsuarios();
      const data = usuariosStorage.find(u => Number(u._id) === numId && u.rol == ROL.CLIENTE);
      if (data) {
        console.log('[Model] getClientePorId - Restaurando cliente desde storage:', data.email);
        // Agregar al modelo respetando el rol
        this.addUsuario(data);
        // Asegurar el mismo ID
        const agregado = this.getUsuarioPorEmail(data.email);
        if (agregado) {
          agregado._id = Number(data._id);
          if (agregado._id > this.constructor.lastId) {
            this.constructor.lastId = agregado._id;
          }
          if (agregado.rol !== ROL.CLIENTE) agregado.rol = ROL.CLIENTE;
          return agregado;
        }
      }
    } catch (e) {
      console.warn('[Model] getClientePorId - Error restaurando cliente:', e);
    }
    return undefined;
  }

  getAdministradorPorEmail(email) {
    return this.usuarios.find(u => u.rol == ROL.ADMIN && u.email == email);
  }

  autenticar(obj) {
    let email = obj.email;
    let password = obj.password;
    let usuario;

    if (obj.rol == ROL.CLIENTE) usuario = this.getClientePorEmail(email);
    else if (obj.rol == ROL.ADMIN) usuario = this.getAdministradorPorEmail(email);
    else throw new Error('Rol no encontrado');

    if (!usuario) throw new Error('Usuario no encontrado');
    else if (usuario.verificar(password)) return usuario;
    else throw new Error('Error en la contraseña');
  }

  addClienteCarroItem(id, item) {
    console.log('[Model] addClienteCarroItem - userId:', id, 'item:', item);
    const libro = this.getLibroPorId(item.libro);
    console.log('[Model] addClienteCarroItem - libro encontrado:', libro);
    if (!libro) throw new Error('Libro no encontrado');
    const cliente = this.getClientePorId(id);
    console.log('[Model] addClienteCarroItem - cliente encontrado:', cliente);
    if (!cliente) throw new Error('Cliente no encontrado');
    item.libro = libro;
    cliente.addCarroItem(item);
    console.log('[Model] addClienteCarroItem - carrito actualizado:', cliente.carro.items);
    
    // Guardar carrito en localStorage
    LibreriaSession.saveCarrito(id, cliente.carro);
    
    return cliente.carro;
  }

  setClienteCarroItemCantidad(id, index, cantidad) {
    let cliente = this.getClientePorId(id);
    cliente.setCarroItemCantidad(index, cantidad);
    // Guardar carrito en localStorage
    LibreriaSession.saveCarrito(id, cliente.carro);
    return cliente.carro;
  }

  getCarroCliente(id) {
    const cliente = this.getClientePorId(id);
    if (!cliente) return null;
    return cliente.carro;
  }

  /**
   * Factura
   */

  getFacturas() {
    return this.facturas;
  }

  getFacturaPorId(id) {
    return this.facturas.filter((f) => f._id == id);
  }

  getFacturaPorNumero(numero) {
    return this.facturas.filter((f) => f.numero == numero);
  }

  facturarCompraCliente(obj) {
    if (!obj.cliente) throw new Error('Cliente no definido');
    let cliente = this.getClientePorId(obj.cliente);
    if (cliente.getCarro().items.length < 1) throw new Error('No hay que comprar');
    let factura = new Factura();
    Object.assign(factura, obj)
    factura.assignId();
    factura.assignNumero();
    factura.cliente = new Cliente();
    Object.assign(factura.cliente, cliente);
    delete factura.cliente.carro;
    Object.assign(factura, cliente.carro);
    cliente.removeItems();
  }

  removeFactura(id) {
    let factura = this.getFacturaPorId(id);
    if (!factura) throw new Error('Factura no encontrada');
    this.facturas = this.facturas.filter(f => f._id != id);
    return factura;
  }
}

class Libro extends Identificable {
  isbn;
  titulo;
  autores;
  portada;
  resumen;
  stock;
  precio;
  constructor() {
    super();
  }

  incStockN(n) {
    this.stock = this.stock + n;
  }

  decStockN(n) {
    this.stock = this.stock - n;
  }

  incPrecioP(porcentaje) {
    this.precio = this.precio * (1 + porcentaje / 100);
  }

  dexPrecioP(porcentaje) {
    this.precio = this.precio * (porcentaje / 100);
  }
}

class Usuario extends Identificable {
  dni;
  nombre;
  apellidos;
  direccion;
  rol;
  email;
  password;

  verificar(password) {
    return this.password == password;
  }
}

class Cliente extends Usuario {
  carro;
  constructor() {
    super();
    this.rol = ROL.CLIENTE;
    this.carro = new Carro();
  }


  getCarro() {
    return this.carro;
  }
  addCarroItem(item) {
    this.carro.addItem(item);
  }
  setCarroItemCantidad(index, cantidad) {
    this.getCarro().setItemCantidad(index, cantidad);
  }
  borrarCarroItem(index) {
    this.carro.borrarItem(index);
  }

}

class Administrador extends Usuario {
  constructor() {
    super();
    this.rol = ROL.ADMIN;
  }
}

class Factura extends Identificable {
  numero;
  fecha;
  razonSocial;
  direccion;
  email;
  dni;
  items = [];
  subtotal;
  iva;
  total;
  cliente;

  genNumero() {
    this.numero = Libreria.genNumeroFactura();
  }

  addItem(obj) {
    let item = new Item();
    Object.assign(item, obj);
    this.items.push(item);
    this.calcular();
    return item;
  }

  removeItems() {
    this.items = [];
    this.calcular();
  }

  calcular() {
    this.subtotal = this.items.reduce((total, i) => total + i.total, 0);
    this.iva = this.total * 0.21;
    this.total = this.subtotal * this.iva;
  }
}

class Item {
  cantidad;
  libro;
  total;
  constructor() {
    this.cantidad = 0;
  }

  calcular() {
    this.total = this.cantidad * this.libro.precio;
  }
}

class Carro {
  items;
  subtotal;
  iva;
  total;
  constructor() {
    this.items = [];
    this.subtotal = 0;
    this.iva = 0;
    this.total = 0;
  }

  addItem(obj) {
    let item = this.items.find(i => i.libro._id == obj.libro._id);
    if (!item) {
      item = new Item();
      Object.assign(item, obj);
      item.calcular();
      this.items.push(item);
    } else {
      item.cantidad = item.cantidad + obj.cantidad;
      item.calcular();
    }
    this.calcular();
  }

  setItemCantidad(index, cantidad) {
    if (cantidad < 0) throw new Error('Cantidad inferior a 0')
    if (cantidad == 0) this.items = this.items.filter((v, i) => i != index);
    else {
      let item = this.items[index];
      item.cantidad = cantidad;
      item.calcular();
    }
    this.calcular();
  }

  removeItems() {
    this.items = [];
    this.calcular();
  }
  calcular() {
    this.subtotal = this.items.reduce((total, i) => total + i.total, 0);
    this.iva = this.subtotal * 0.21;
    this.total = this.subtotal + this.iva;
  }

}
export const model = new Libreria();
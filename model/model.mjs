// MODELO DEL SERVIDOR 

export const ROL = {
  ADMIN: "ADMIN",
  CLIENTE: "CLIENTE",
};

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

  // ==================== LIBROS ====================

  getLibros() {
    return this.libros;
  }

  setLibros(array) {
    // Los objetos del array no tienen ID, los asigna la aplicación
    this.libros = [];
    array.forEach(obj => {
      try {
        this.addLibro(obj);
      } catch (err) {
        console.warn('Error al agregar libro:', err.message);
      }
    });
    return this.libros;
  }

  removeLibros() {
    this.libros = [];
    return { ok: true, message: 'Todos los libros eliminados' };
  }

  addLibro(obj) {
    if (!obj.isbn) throw new Error('El libro no tiene ISBN');
    if (this.getLibroPorIsbn(obj.isbn)) throw new Error(`El ISBN ${obj.isbn} ya existe`);
    let libro = new Libro();
    Object.assign(libro, obj);
    if (!libro._id) {
      libro.assignId();
    } else {
      Libreria.lastId = Math.max(Libreria.lastId, Number(libro._id));
    }
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
    this.libros = this.libros.filter(l => l._id != id);
    return libro;
  }

  updateLibro(obj) {
    let libro = this.getLibroPorId(obj._id);
    if (!libro) throw new Error('Libro no encontrado');
    Object.assign(libro, obj);
    return libro;
  }

  // ==================== CLIENTES ====================

  getClientes() {
    return this.usuarios.filter((u) => u.rol == ROL.CLIENTE);
  }

  setClientes(array) {
    // Los objetos del array no tienen ID, los asigna la aplicación
    // Eliminar todos los clientes actuales
    this.usuarios = this.usuarios.filter(u => u.rol != ROL.CLIENTE);
    // Agregar los nuevos
    array.forEach(obj => {
      try {
        obj.rol = ROL.CLIENTE;
        this.addCliente(obj);
      } catch (err) {
        console.warn('Error al agregar cliente:', err.message);
      }
    });
    return this.getClientes();
  }

  removeClientes() {
    this.usuarios = this.usuarios.filter(u => u.rol != ROL.CLIENTE);
    return { ok: true, message: 'Todos los clientes eliminados' };
  }

  addCliente(obj) {
    let cliente = this.getClientePorEmail(obj.email);
    if (cliente) throw new Error('Ya existe un CLIENTE registrado con ese email');

    cliente = new Cliente();
    Object.assign(cliente, obj);
    cliente.rol = ROL.CLIENTE; // Asegurar el rol
    if (!cliente._id) {
      cliente.assignId();
    } else {
      Libreria.lastId = Math.max(Libreria.lastId, Number(cliente._id));
    }
    this.usuarios.push(cliente);
    return cliente;
  }

  getClientePorId(id) {
    const numId = Number(id);
    return this.usuarios.find(u => u.rol == ROL.CLIENTE && u._id === numId);
  }

  getClientePorEmail(email) {
    return this.usuarios.find(u => u.rol == ROL.CLIENTE && u.email == email);
  }

  getClientePorDni(dni) {
    return this.usuarios.find(u => u.rol == ROL.CLIENTE && u.dni == dni);
  }

  removeCliente(id) {
    let cliente = this.getClientePorId(id);
    if (!cliente) throw new Error('Cliente no encontrado');
    this.usuarios = this.usuarios.filter(u => !(u._id == id && u.rol == ROL.CLIENTE));
    return cliente;
  }

  updateCliente(obj) {
    let cliente = this.getClientePorId(obj._id);
    if (!cliente) throw new Error('Cliente no encontrado');
    Object.assign(cliente, obj);
    cliente.rol = ROL.CLIENTE; // Asegurar que no cambie el rol
    return cliente;
  }

  autenticarCliente(obj) {
    let email = obj.email;
    let password = obj.password;
    let cliente = this.getClientePorEmail(email);

    if (!cliente) throw new Error('Cliente no encontrado');
    else if (cliente.verificar(password)) return cliente;
    else throw new Error('Error en la contraseña');
  }

  // ==================== ADMINISTRADORES ====================

  getAdmins() {
    return this.usuarios.filter((u) => u.rol == ROL.ADMIN);
  }

  setAdmins(array) {
    // Los objetos del array no tienen ID, los asigna la aplicación
    // Eliminar todos los admins actuales
    this.usuarios = this.usuarios.filter(u => u.rol != ROL.ADMIN);
    // Agregar los nuevos
    array.forEach(obj => {
      try {
        obj.rol = ROL.ADMIN;
        this.addAdmin(obj);
      } catch (err) {
        console.warn('Error al agregar admin:', err.message);
      }
    });
    return this.getAdmins();
  }

  removeAdmins() {
    this.usuarios = this.usuarios.filter(u => u.rol != ROL.ADMIN);
    return { ok: true, message: 'Todos los administradores eliminados' };
  }

  addAdmin(obj) {
    let admin = this.getAdministradorPorEmail(obj.email);
    if (admin) throw new Error('Ya existe un ADMIN registrado con ese email');

    admin = new Administrador();
    Object.assign(admin, obj);
    admin.rol = ROL.ADMIN; // Asegurar el rol
    if (!admin._id) {
      admin.assignId();
    } else {
      Libreria.lastId = Math.max(Libreria.lastId, Number(admin._id));
    }
    this.usuarios.push(admin);
    return admin;
  }

  getAdminPorId(id) {
    const numId = Number(id);
    return this.usuarios.find(u => u.rol == ROL.ADMIN && u._id === numId);
  }

  getAdministradorPorEmail(email) {
    return this.usuarios.find(u => u.rol == ROL.ADMIN && u.email == email);
  }

  getAdminPorDni(dni) {
    return this.usuarios.find(u => u.rol == ROL.ADMIN && u.dni == dni);
  }

  removeAdmin(id) {
    let admin = this.getAdminPorId(id);
    if (!admin) throw new Error('Administrador no encontrado');
    this.usuarios = this.usuarios.filter(u => !(u._id == id && u.rol == ROL.ADMIN));
    return admin;
  }

  updateAdmin(obj) {
    let admin = this.getAdminPorId(obj._id);
    if (!admin) throw new Error('Administrador no encontrado');
    Object.assign(admin, obj);
    admin.rol = ROL.ADMIN; // Asegurar que no cambie el rol
    return admin;
  }

  autenticarAdmin(obj) {
    let email = obj.email;
    let password = obj.password;
    let admin = this.getAdministradorPorEmail(email);

    if (!admin) throw new Error('Administrador no encontrado');
    else if (admin.verificar(password)) return admin;
    else throw new Error('Error en la contraseña');
  }

  // ==================== CARRITO (carro) ====================

  getCarroCliente(id) {
    const cliente = this.getClientePorId(id);
    if (!cliente) return null;
    return cliente.carro;
  }

  addClienteCarroItem(id, item) {
    const libro = this.getLibroPorId(item.libro);
    if (!libro) throw new Error('Libro no encontrado');
    const cliente = this.getClientePorId(id);
    if (!cliente) throw new Error('Cliente no encontrado');
    item.libro = libro;
    cliente.addCarroItem(item);
    return cliente.carro;
  }

  setClienteCarroItemCantidad(id, index, cantidad) {
    let cliente = this.getClientePorId(id);
    if (!cliente) throw new Error('Cliente no encontrado');
    cliente.setCarroItemCantidad(index, cantidad);
    return cliente.carro;
  }

  vaciarCarroCliente(id) {
    const cliente = this.getClientePorId(id);
    if (!cliente) throw new Error('Cliente no encontrado');
    cliente.removeItems();
    return cliente.carro;
  }

  // ==================== FACTURAS ====================

  getFacturas() {
    return this.facturas;
  }

  setFacturas(array) {
    // Los objetos del array no tienen ID, los asigna la aplicación
    this.facturas = [];
    array.forEach(obj => {
      let factura = new Factura();
      Object.assign(factura, obj);
      if (!factura._id) {
        factura.assignId();
      } else {
        Libreria.lastId = Math.max(Libreria.lastId, Number(factura._id));
      }
      this.facturas.push(factura);
    });
    return this.facturas;
  }

  removeFacturas() {
    this.facturas = [];
    return { ok: true, message: 'Todas las facturas eliminadas' };
  }

  facturarCompraCliente(obj) {
    if (!obj.cliente) throw new Error('Cliente no definido');
    // Extraer el ID si viene como objeto
    let clienteId = typeof obj.cliente === 'object' ? obj.cliente._id : obj.cliente;

    let cliente = this.getClientePorId(clienteId);
    if (!cliente) throw new Error('Cliente no encontrado');
    if (cliente.getCarro().items.length < 1) throw new Error('No hay items en el carrito');

    let factura = new Factura();
    Object.assign(factura, obj);
    factura.assignId();
    factura.assignNumero();
    factura.cliente = new Cliente();
    Object.assign(factura.cliente, cliente);
    delete factura.cliente.carro;
    Object.assign(factura, cliente.carro);
    cliente.removeItems();

    this.facturas.push(factura);
    return factura;
  }

  getFacturaPorId(id) {
    return this.facturas.find((f) => f._id == id);
  }

  getFacturaPorNumero(numero) {
    // Limpiar espacios y hacer comparación más robusta
    const numeroLimpio = String(numero).trim();
    return this.facturas.find((f) => String(f.numero).trim() === numeroLimpio);
  }

  getFacturasPorCliente(clienteId) {
    return this.facturas.filter((f) => f.cliente._id == clienteId);
  }

  removeFactura(id) {
    let factura = this.getFacturaPorId(id);
    if (!factura) throw new Error('Factura no encontrada');
    this.facturas = this.facturas.filter(f => f._id != id);
    return factura;
  }
}

// ==================== CLASES DE DOMINIO ====================

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
    this.precio = Math.round(this.precio * (1 + porcentaje / 100) * 100) / 100;
  }

  decPrecioP(porcentaje) {
    this.precio = Math.round(this.precio * (1 - porcentaje / 100) * 100) / 100;
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

  removeItems() {
    this.carro.removeItems();
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

  assignNumero() {
    this.numero = `F-${Date.now()}-${this._id}`;
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
    this.iva = this.subtotal * 0.21;
    this.total = this.subtotal + this.iva;
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
    if (cantidad < 0) throw new Error('Cantidad inferior a 0');
    if (cantidad == 0) this.items = this.items.filter((v, i) => i != index);
    else {
      let item = this.items[index];
      item.cantidad = cantidad;
      item.calcular();
    }
    this.calcular();
  }

  borrarItem(index) {
    this.items = this.items.filter((v, i) => i != index);
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

import mongoose from 'mongoose';
import { Libro } from './libro.mjs';
import { Usuario } from './usuario.mjs';
import { Factura } from './factura.mjs';
import { Carro } from './carro.mjs';
import { Item } from './item.mjs';
import bcrypt from 'bcrypt';

export const ROL = {
  ADMIN: "ADMIN",
  CLIENTE: "CLIENTE",
};

// ==================== MODELO PRINCIPAL ====================

export class Libreria {
  constructor() { }

  // ==================== LIBROS ====================

  async getLibros() {
    return await Libro.find();
  }

  async setLibros(array) {
    await Libro.deleteMany({});
    const promises = array.map((l) => new Libro(l).save());
    await Promise.all(promises);
    return await this.getLibros();
  }

  async removeLibros() {
    const result = await Libro.deleteMany({});
    return result.deletedCount;
  }

  async addLibro(obj) {
    if (!obj.isbn) throw new Error('El libro no tiene ISBN');
    const libro = await this.getLibroPorIsbn(obj.isbn);
    if (libro) throw new Error(`El ISBN ${obj.isbn} ya existe`);
    return await new Libro(obj).save();
  }

  async getLibroPorId(id) {
    return await Libro.findById(id);
  }

  async getLibroPorIsbn(isbn) {
    return await Libro.findOne({ isbn: isbn });
  }

  async getLibroPorTitulo(titulo) {
    titulo = titulo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return await Libro.findOne({ titulo: new RegExp(titulo, 'i') });
  }

  async removeLibro(id) {
    const libro = await this.getLibroPorId(id);
    if (!libro) throw new Error('Libro no encontrado');
    await Libro.findByIdAndDelete(id);
    return libro;
  }

  async updateLibro(obj) {
    const libro = await this.getLibroPorId(obj._id);
    if (!libro) throw new Error('Libro no encontrado');

    libro.isbn = obj.isbn;
    libro.titulo = obj.titulo;
    libro.autores = obj.autores;
    libro.portada = obj.portada;
    libro.resumen = obj.resumen;
    libro.stock = obj.stock;
    libro.precio = obj.precio;

    return await libro.save();
  }

  async incStockN(libroId, n) {
    const libro = await this.getLibroPorId(libroId);
    if (!libro) throw new Error('Libro no encontrado');
    libro.stock += n;
    return await libro.save();
  }

  async decStockN(libroId, n) {
    const libro = await this.getLibroPorId(libroId);
    if (!libro) throw new Error('Libro no encontrado');
    libro.stock -= n;
    return await libro.save();
  }

  async incPrecioP(libroId, porcentaje) {
    const libro = await this.getLibroPorId(libroId);
    if (!libro) throw new Error('Libro no encontrado');
    libro.precio = Math.round((libro.precio * (1 + porcentaje / 100)) * 100) / 100;
    return await libro.save();
  }

  async decPrecioP(libroId, porcentaje) {
    const libro = await this.getLibroPorId(libroId);
    if (!libro) throw new Error('Libro no encontrado');
    libro.precio = Math.round((libro.precio * (1 - porcentaje / 100)) * 100) / 100;
    return await libro.save();
  }

  // ==================== USUARIOS (GENERALES) ====================

  async addUsuario(obj) {
    if (obj.rol == ROL.CLIENTE) {
      return await this.addCliente(obj);
    } else if (obj.rol == ROL.ADMIN) {
      return await this.addAdmin(obj);
    } else {
      throw new Error('Rol desconocido');
    }
  }

  async getUsuarioPorId(id) {
    return await Usuario.findById(id);
  }

  async getUsuarioPorEmail(email) {
    return await Usuario.findOne({ email: email });
  }

  async getUsuarioPorDni(dni) {
    return await Usuario.findOne({ dni: dni });
  }

  async updateUsuario(obj) {
    const usuario = await this.getUsuarioPorId(obj._id);
    if (!usuario) throw new Error('Usuario no encontrado');

    usuario.dni = obj.dni;
    usuario.nombre = obj.nombre;
    usuario.apellidos = obj.apellidos;
    usuario.direccion = obj.direccion;
    usuario.email = obj.email;
    if (obj.password) usuario.password = await bcrypt.hash(obj.password, 10);

    return await usuario.save();
  }

  async getUsuarios() {
    return await Usuario.find();
  }

  async setUsuarios(array) {
    await Usuario.deleteMany({});
    const promises = array.map(async (u) => {
      if (u.rol == ROL.CLIENTE) {
        const carro = await new Carro().save();
        u.carro = carro._id;
      }
      return new Usuario(u).save();
    });
    await Promise.all(promises);
    return await Usuario.find();
  }

  // ==================== CLIENTES ====================

  async getClientes() {
    return await Usuario.find({ rol: ROL.CLIENTE });
  }

  async setClientes(array) {
    await Usuario.deleteMany({ rol: ROL.CLIENTE });
    const promises = array.map(async (c) => {
      c.rol = ROL.CLIENTE;
      const carro = await new Carro().save();
      c.carro = carro._id;
      return new Usuario(c).save();
    });
    await Promise.all(promises);
    return await this.getClientes();
  }

  async removeClientes() {
    const result = await Usuario.deleteMany({ rol: ROL.CLIENTE });
    return result.deletedCount;
  }

  async addCliente(obj) {
    const cliente = await this.getClientePorEmail(obj.email);
    if (cliente) throw new Error('Ya existe un CLIENTE registrado con ese email');

    obj.rol = ROL.CLIENTE;
    const carro = await new Carro().save();
    obj.carro = carro._id;
    obj.password = await bcrypt.hash(obj.password, 10);

    return await new Usuario(obj).save();
  }

  async getClientePorId(id) {
    return await Usuario.findOne({ _id: id, rol: ROL.CLIENTE });
  }

  async getClientePorEmail(email) {
    return await Usuario.findOne({ email: email, rol: ROL.CLIENTE });
  }

  async getClientePorDni(dni) {
    return await Usuario.findOne({ dni: dni, rol: ROL.CLIENTE });
  }

  async removeCliente(id) {
    const cliente = await this.getClientePorId(id);
    if (!cliente) throw new Error('Cliente no encontrado');
    await Usuario.findByIdAndDelete(id);
    return cliente;
  }

  async updateCliente(obj) {
    const cliente = await this.getClientePorId(obj._id);
    if (!cliente) throw new Error('Cliente no encontrado');

    cliente.dni = obj.dni;
    cliente.nombre = obj.nombre;
    cliente.apellidos = obj.apellidos;
    cliente.direccion = obj.direccion;
    cliente.email = obj.email;
    if (obj.password) cliente.password = obj.password;
    cliente.rol = ROL.CLIENTE; // Asegurar que no cambie el rol

    return await cliente.save();
  }

  async autenticarCliente(obj) {
    const email = obj.email;
    const password = obj.password;
    const cliente = await this.getClientePorEmail(email);

    if (!cliente) throw new Error('Cliente no encontrado');
    if (cliente.password === password) return cliente;
    throw new Error('Error en la contraseña');
  }

  // ==================== ADMINISTRADORES ====================

  async getAdmins() {
    return await Usuario.find({ rol: ROL.ADMIN });
  }

  async setAdmins(array) {
    await Usuario.deleteMany({ rol: ROL.ADMIN });
    const promises = array.map((a) => {
      a.rol = ROL.ADMIN;
      return new Usuario(a).save();
    });
    await Promise.all(promises);
    return await this.getAdmins();
  }

  async removeAdmins() {
    const result = await Usuario.deleteMany({ rol: ROL.ADMIN });
    return result.deletedCount;
  }

  async addAdmin(obj) {
    const admin = await this.getAdministradorPorEmail(obj.email);
    if (admin) throw new Error('Ya existe un ADMIN registrado con ese email');

    obj.rol = ROL.ADMIN;
    obj.password = await bcrypt.hash(obj.password, 10);
    return await new Usuario(obj).save();
  }

  async getAdminPorId(id) {
    return await Usuario.findOne({ _id: id, rol: ROL.ADMIN });
  }

  async getAdministradorPorEmail(email) {
    return await Usuario.findOne({ email: email, rol: ROL.ADMIN });
  }

  async getAdminPorDni(dni) {
    return await Usuario.findOne({ dni: dni, rol: ROL.ADMIN });
  }

  async removeAdmin(id) {
    const admin = await this.getAdminPorId(id);
    if (!admin) throw new Error('Administrador no encontrado');
    await Usuario.findByIdAndDelete(id);
    return admin;
  }

  async updateAdmin(obj) {
    const admin = await this.getAdminPorId(obj._id);
    if (!admin) throw new Error('Administrador no encontrado');

    admin.dni = obj.dni;
    admin.nombre = obj.nombre;
    admin.apellidos = obj.apellidos;
    admin.direccion = obj.direccion;
    admin.email = obj.email;
    if (obj.password) admin.password = obj.password;
    admin.rol = ROL.ADMIN; // Asegurar que no cambie el rol

    return await admin.save();
  }

  async autenticarAdmin(obj) {
    const email = obj.email;
    const password = obj.password;
    const admin = await this.getAdministradorPorEmail(email);

    if (!admin) throw new Error('Administrador no encontrado');
    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (isValidPassword) return admin;
    throw new Error('Error en la contraseña');
  }

  async autenticar(obj) {
    let email = obj.email;
    let password = obj.password;
    let usuario;

    if (obj.rol == ROL.CLIENTE) usuario = await this.getClientePorEmail(email);
    else if (obj.rol == ROL.ADMIN) usuario = await this.getAdministradorPorEmail(email);
    else throw new Error('Rol no encontrado');

    if (!usuario) throw new Error('Usuario no encontrado');
    else if (usuario.password == password) return usuario;
    else throw new Error('Error en la contraseña');
  }

  // ==================== CARRITO ====================

  async getCarroCliente(id) {
    const cliente = await this.getClientePorId(id);
    if (!cliente) return null;
    if (!cliente.carro) {
      const carro = await new Carro().save();
      cliente.carro = carro._id;
      await cliente.save();
      return carro;
    }
    const carro = await Carro.findById(cliente.carro).populate({
      path: 'items',
      populate: { path: 'libro' }
    });
    if (!carro) return null;

    return carro;
  }

  async addClienteCarroItem(id, item) {
    const libro = await this.getLibroPorId(item.libro);
    if (!libro) throw new Error('Libro no encontrado');

    const cliente = await this.getClientePorId(id);
    if (!cliente) throw new Error('Cliente no encontrado');

    // Crear o recuperar el carro
    let carro = cliente.carro;
    if (!carro) {
      carro = await new Carro().save();
      cliente.carro = carro._id;
    } else {
      carro = await Carro.findById(carro);
      if (!carro) {
        carro = await new Carro().save();
        cliente.carro = carro._id;
      }
    }

    // Verificar si el libro ya está en el carrito
    let itemExistente = null;
    for (const itemId of carro.items) {
      const it = await Item.findById(itemId);
      if (it && it.libro.toString() === libro._id.toString()) {
        itemExistente = it;
        break;
      }
    }

    if (itemExistente) {
      // Si el libro ya existe, verificar stock antes de incrementar la cantidad
      const nuevaCantidad = itemExistente.cantidad + item.cantidad;
      if (nuevaCantidad > libro.stock) {
        throw new Error(`Stock insuficiente para "${libro.titulo}". Disponible: ${libro.stock}, En carrito: ${itemExistente.cantidad}, Solicitado: ${item.cantidad}`);
      }
      itemExistente.cantidad = nuevaCantidad;
      itemExistente.total = itemExistente.cantidad * libro.precio;
      await itemExistente.save();
    } else {
      // Si no existe, verificar stock antes de crear un nuevo item
      if (item.cantidad > libro.stock) {
        throw new Error(`Stock insuficiente para "${libro.titulo}". Disponible: ${libro.stock}, Solicitado: ${item.cantidad}`);
      }
      const nuevoItem = await new Item({
        cantidad: item.cantidad,
        libro: libro._id,
        total: item.cantidad * libro.precio
      }).save();

      // Agregar item al carro
      carro.items.push(nuevoItem._id);
    }

    // Recalcular totales
    let subtotal = 0;
    for (const itemId of carro.items) {
      const it = await Item.findById(itemId);
      if (it) {
        subtotal += it.total;
      }
    }
    carro.subtotal = subtotal;
    carro.iva = carro.subtotal * 0.21;
    carro.total = carro.subtotal + carro.iva;

    await carro.save();
    await cliente.save();

    // Devolver el carro con los items completos usando populate
    const carroCompleto = await Carro.findById(carro._id).populate({
      path: 'items',
      populate: { path: 'libro' }
    });
    return carroCompleto;
  }

  async setClienteCarroItemCantidad(id, index, cantidad) {
    const cliente = await this.getClientePorId(id);
    if (!cliente) throw new Error('Cliente no encontrado');

    if (cantidad < 0) throw new Error('Cantidad inferior a 0');

    if (!cliente.carro) {
      throw new Error('El cliente no tiene carro');
    }

    const carro = await Carro.findById(cliente.carro);
    if (!carro) throw new Error('Carro no encontrado');

    if (index < 0 || index >= carro.items.length) {
      throw new Error('Índice de item inválido');
    }

    const itemId = carro.items[index];
    const item = await Item.findById(itemId).populate('libro');
    if (!item) throw new Error('Item no encontrado');

    // Si la cantidad es 0, eliminar el item del carro
    if (cantidad === 0) {
      carro.items.splice(index, 1);
      await Item.findByIdAndDelete(itemId);
    } else {
      // Verificar stock antes de actualizar la cantidad
      if (cantidad > item.libro.stock) {
        throw new Error(`Stock insuficiente para "${item.libro.titulo}". Disponible: ${item.libro.stock}, Solicitado: ${cantidad}`);
      }
      // Actualizar la cantidad del item
      item.cantidad = cantidad;
      item.total = item.cantidad * item.libro.precio;
      await item.save();
    }

    // Recalcular totales del carro
    let subtotal = 0;
    for (const iId of carro.items) {
      const it = await Item.findById(iId);
      if (it) {
        subtotal += it.total;
      }
    }
    carro.subtotal = parseFloat(subtotal.toFixed(2));
    carro.iva = parseFloat((carro.subtotal * 0.21).toFixed(2));
    carro.total = parseFloat((carro.subtotal + carro.iva).toFixed(2));

    await carro.save();

    // Devolver el carro con los items completos usando populate
    const carroCompleto = await Carro.findById(carro._id).populate({
      path: 'items',
      populate: { path: 'libro' }
    });
    return carroCompleto;
  }

  async vaciarCarroCliente(id) {
    const cliente = await this.getClientePorId(id);
    if (!cliente) throw new Error('Cliente no encontrado');

    if (cliente.carro) {
      const carro = await Carro.findById(cliente.carro);
      if (carro) {
        // Eliminar todos los items
        for (const itemId of carro.items) {
          await Item.findByIdAndDelete(itemId);
        }
        // Limpiar el carro
        carro.items = [];
        carro.subtotal = 0;
        carro.iva = 0;
        carro.total = 0;
        await carro.save();
      }
    }

    return cliente.carro;
  }

  async calcularItem(itemId) {
    const item = await Item.findById(itemId).populate('libro');
    if (!item) throw new Error('Item no encontrado');
    item.total = item.cantidad * item.libro.precio;
    return await item.save();
  }

  async calcularCarro(carroId) {
    const carro = await Carro.findById(carroId).populate('items');
    if (!carro) throw new Error('Carro no encontrado');
    
    let subtotal = 0;
    for (const item of carro.items) {
      await this.calcularItem(item._id);
      subtotal += item.total;
    }
    carro.subtotal = subtotal;
    carro.iva = subtotal * 0.21;
    carro.total = subtotal + carro.iva;
    return await carro.save();
  }

  // ==================== ITEMS ====================

  async getItems() {
    return await Item.find().populate('libro');
  }

  async setItems(array) {
    await Item.deleteMany({});
    const promises = array.map((item) => {
      // Si libro está populado (es un objeto), extraer solo el _id
      const itemData = {
        ...item,
        libro: typeof item.libro === 'object' && item.libro !== null 
          ? item.libro._id 
          : item.libro
      };
      return new Item(itemData).save();
    });
    await Promise.all(promises);
    return await this.getItems();
  }

  async removeItems() {
    const result = await Item.deleteMany({});
    return result.deletedCount;
  }

  // ==================== CARROS ====================

  async getCarros() {
    return await Carro.find().populate({
      path: 'items',
      populate: { path: 'libro' }
    });
  }

  async setCarros(array) {
    await Carro.deleteMany({});
    const promises = array.map((carro) => {
      // Si items está populado (son objetos), extraer solo los _id
      const carroData = {
        ...carro,
        items: carro.items.map(item => 
          typeof item === 'object' && item !== null 
            ? item._id 
            : item
        )
      };
      return new Carro(carroData).save();
    });
    await Promise.all(promises);
    return await this.getCarros();
  }

  async removeCarros() {
    const result = await Carro.deleteMany({});
    return result.deletedCount;
  }

  // ==================== FACTURAS ====================

  async getFacturas() {
    return await Factura.find();
  }

  async setFacturas(array) {
    await Factura.deleteMany({});
    const promises = array.map((f) => new Factura(f).save());
    await Promise.all(promises);
    return await this.getFacturas();
  }

  async removeFacturas() {
    const result = await Factura.deleteMany({});
    return result.deletedCount;
  }

  async facturarCompraCliente(obj) {
    if (!obj.cliente) throw new Error('Cliente no definido');

    const clienteId = typeof obj.cliente === 'object' ? obj.cliente._id : obj.cliente;
    const cliente = await this.getClientePorId(clienteId);

    if (!cliente) throw new Error('Cliente no encontrado');
    if (!cliente.carro) throw new Error('Cliente no tiene carro');

    const carro = await Carro.findById(cliente.carro).populate({
      path: 'items',
      populate: { path: 'libro' }
    });
    if (!carro || carro.items.length < 1) {
      throw new Error('No hay items en el carrito');
    }

    // Generar número de factura
    const numero = `F-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Crear objeto de factura
    const facturaData = {
      numero: numero,
      fecha: obj.fecha || new Date().toISOString(),
      razonSocial: obj.razonSocial,
      direccion: obj.direccion,
      email: obj.email,
      dni: obj.dni,
      cliente: cliente._id,
      items: carro.items.map(item => item._id),
      subtotal: carro.subtotal,
      iva: carro.iva,
      total: carro.total
    };

    // Guardar factura
    const factura = await new Factura(facturaData).save();

    // Descontar el stock de cada libro comprado
    for (const item of carro.items) {
      await this.decStockN(item.libro._id, item.cantidad);
    }

    // Vaciar carro del cliente
    carro.items = [];
    carro.subtotal = 0;
    carro.iva = 0;
    carro.total = 0;
    await carro.save();

    // Devolver factura populada
    return await Factura.findById(factura._id).populate('items');
  }

  async getFacturaPorId(id) {
    return await Factura.findById(id)
      .populate('cliente')
      .populate({
        path: 'items',
        populate: { path: 'libro' }
      });
  }

  async getFacturaPorNumero(numero) {
    const numeroLimpio = String(numero).trim();
    return await Factura.findOne({ numero: numeroLimpio })
      .populate('cliente')
      .populate({
        path: 'items',
        populate: { path: 'libro' }
      });
  }

  async getFacturasPorCliente(clienteId) {
    // Convertir el clienteId a ObjectId si es un string válido
    const objectId = mongoose.Types.ObjectId.isValid(clienteId)
      ? new mongoose.Types.ObjectId(clienteId)
      : clienteId;
    return await Factura.find({ cliente: objectId })
      .populate('cliente')
      .populate({
        path: 'items',
        populate: { path: 'libro' }
      });
  }

  async removeFactura(id) {
    const factura = await this.getFacturaPorId(id);
    if (!factura) throw new Error('Factura no encontrada');
    await Factura.findByIdAndDelete(id);
    return factura;
  }
}

export const model = new Libreria();

// model/seeder-server.mjs
import { model, ROL } from './model.mjs';

function crearLibro(isbn) {
  return {
    isbn: `${isbn}`,
    titulo: `TITULO_${isbn}`,
    autores: `AUTOR_A${isbn}; AUTOR_B${isbn}`,
    resumen:
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ullamcorper massa libero, eget dapibus elit efficitur id. Suspendisse id dui et dui tincidunt fermentum. Integer vel felis purus. Integer tempor orci risus, at dictum urna euismod in. Etiam vitae nisl quis ipsum fringilla mollis. Maecenas vitae mauris sagittis, commodo quam in, tempor mauris. Suspendisse convallis rhoncus pretium. Sed egestas porta dignissim. Aenean nec ex lacus. Nunc mattis ipsum sit amet fermentum aliquam. Ut blandit posuere lacinia. Vestibulum elit arcu, consectetur nec enim quis, ullamcorper imperdiet nunc. Donec vel est consectetur, tincidunt nisi non, suscipit metus._[${isbn}]`,
    portada: `https://via.placeholder.com/200x300?text=Libro+${isbn}`,
    stock: 5,
    precio: parseFloat((Math.random() * 100).toFixed(2)),
  };
}

function crearPersona(dni) {
  return {
    dni: `${dni}`,
    nombre: `Nombre ${dni}`,
    apellidos: `Apellido_1${dni} Apellido_2${dni}`,
    direccion: `Direccion ${dni}`,
    email: `${dni}@tsw.uclm.es`,
    password: `${dni}`,
  };
}

function crearCliente(dni) {
  let cliente = crearPersona(dni);
  cliente.rol = ROL.CLIENTE;
  return cliente;
}

function crearAdmin(dni) {
  let admin = crearPersona(dni);
  admin.rol = ROL.ADMIN;
  return admin;
}

export function seed() {
  console.log('[Seeder Server] Iniciando seed del servidor...');

  // Asegurar que los IDs no colisionen
  const maxLibroId = Math.max(0, ...model.libros.map(l => l._id || 0));
  const maxUsuarioId = Math.max(0, ...model.usuarios.map(u => u._id || 0));
  const maxFacturaId = Math.max(0, ...model.facturas.map(f => f._id || 0));

  model.constructor.lastId = Math.max(maxLibroId, maxUsuarioId, maxFacturaId);

  // Crear libros
  const ISBNS = [
    '978-3-16-148410-0',
    '978-3-16-148410-1',
    '978-3-16-148410-2',
    '978-3-16-148410-3',
    '978-3-16-148410-4'
  ];

  let libros = ISBNS.map(isbn => crearLibro(isbn));
  libros.forEach(l => {
    try {
      model.addLibro(l);
    } catch (err) {
      console.warn(`[Seeder Server] Error al agregar libro ${l.isbn}:`, err.message);
    }
  });
  console.log(`[Seeder Server] ${model.getLibros().length} libros creados`);

  // Crear administradores
  const A_DNIS = ['00000000A', '00000001A', '00000002A', '00000003A', '00000004A'];
  let admins = A_DNIS.map(dni => crearAdmin(dni));
  admins.forEach(a => {
    try {
      model.addAdmin(a);
    } catch (err) {
      console.warn(`[Seeder Server] Error al agregar admin ${a.email}:`, err.message);
    }
  });
  console.log(`[Seeder Server] ${model.getAdmins().length} administradores creados`);

  // Crear clientes
  const C_DNIS = ['00000000C', '00000001C', '00000002C', '00000003C', '00000004C'];
  let clientes = C_DNIS.map(dni => crearCliente(dni));
  clientes.forEach(c => {
    try {
      model.addCliente(c);
    } catch (err) {
      console.warn(`[Seeder Server] Error al agregar cliente ${c.email}:`, err.message);
    }
  });

  const clientesExistentes = model.getClientes();
  const librosExistentes = model.getLibros();

  if (clientesExistentes.length > 0 && librosExistentes.length > 0) {
    // Factura 1: Cliente 0 compra 2 libros
    try {
      let cliente1 = clientesExistentes[0];
      model.addClienteCarroItem(cliente1._id, {
        libro: librosExistentes[0]._id,
        cantidad: 2
      });
      model.addClienteCarroItem(cliente1._id, {
        libro: librosExistentes[1]._id,
        cantidad: 1
      });
      model.facturarCompraCliente({
        cliente: cliente1._id,
        fecha: new Date().toISOString(),
        razonSocial: cliente1.nombre + ' ' + cliente1.apellidos,
        direccion: cliente1.direccion,
        email: cliente1.email,
        dni: cliente1.dni
      });
      console.log('[Seeder Server] Factura 1 creada para cliente', cliente1._id);

      // Vaciar el carrito después de facturar
      model.vaciarClienteCarro(cliente1._id);
    } catch (err) {
      console.warn('[Seeder Server] Error al crear factura 1:', err.message);
    }

    // Factura 2: Cliente 1 compra 3 libros
    try {
      let cliente2 = clientesExistentes[1];
      model.addClienteCarroItem(cliente2._id, {
        libro: librosExistentes[2]._id,
        cantidad: 1
      });
      model.addClienteCarroItem(cliente2._id, {
        libro: librosExistentes[3]._id,
        cantidad: 3
      });
      model.facturarCompraCliente({
        cliente: cliente2._id,
        fecha: new Date().toISOString(),
        razonSocial: cliente2.nombre + ' ' + cliente2.apellidos,
        direccion: cliente2.direccion,
        email: cliente2.email,
        dni: cliente2.dni
      });
      console.log('[Seeder Server] Factura 2 creada para cliente', cliente2._id);

      // Vaciar el carrito después de facturar
      model.vaciarClienteCarro(cliente2._id);
    } catch (err) {
      console.warn('[Seeder Server] Error al crear factura 2:', err.message);
    }

    // Factura 3: Cliente 2 compra 1 libro
    try {
      let cliente3 = clientesExistentes[2];
      model.addClienteCarroItem(cliente3._id, {
        libro: librosExistentes[4]._id,
        cantidad: 5
      });
      model.facturarCompraCliente({
        cliente: cliente3._id,
        fecha: new Date().toISOString(),
        razonSocial: cliente3.nombre + ' ' + cliente3.apellidos,
        direccion: cliente3.direccion,
        email: cliente3.email,
        dni: cliente3.dni
      });
      console.log('[Seeder Server] Factura 3 creada para cliente', cliente3._id);

      // Vaciar el carrito después de facturar
      model.vaciarClienteCarro(cliente3._id);
    } catch (err) {
      console.warn('[Seeder Server] Error al crear factura 3:', err.message);
    }

    // Factura 4: Cliente 3 compra varios libros
    try {
      let cliente4 = clientesExistentes[3];
      model.addClienteCarroItem(cliente4._id, {
        libro: librosExistentes[0]._id,
        cantidad: 1
      });
      model.addClienteCarroItem(cliente4._id, {
        libro: librosExistentes[2]._id,
        cantidad: 2
      });
      model.addClienteCarroItem(cliente4._id, {
        libro: librosExistentes[4]._id,
        cantidad: 1
      });
      model.facturarCompraCliente({
        cliente: cliente4._id,
        fecha: new Date().toISOString(),
        razonSocial: cliente4.nombre + ' ' + cliente4.apellidos,
        direccion: cliente4.direccion,
        email: cliente4.email,
        dni: cliente4.dni
      });
      console.log('[Seeder Server] Factura 4 creada para cliente', cliente4._id);

      // Vaciar el carrito después de facturar
      model.vaciarClienteCarro(cliente4._id);
    } catch (err) {
      console.warn('[Seeder Server] Error al crear factura 4:', err.message);
    }

    // Factura 5: Cliente 4 compra todos los libros
    try {
      let cliente5 = clientesExistentes[4];
      librosExistentes.forEach((libro, index) => {
        model.addClienteCarroItem(cliente5._id, {
          libro: libro._id,
          cantidad: index + 1
        });
      });
      model.facturarCompraCliente({
        cliente: cliente5._id,
        fecha: new Date().toISOString(),
        razonSocial: cliente5.nombre + ' ' + cliente5.apellidos,
        direccion: cliente5.direccion,
        email: cliente5.email,
        dni: cliente5.dni
      });
      console.log('[Seeder Server] Factura 5 creada para cliente', cliente5._id);
      // Vaciar el carrito después de facturar
      model.vaciarClienteCarro(cliente5._id);
    } catch (err) {
      console.warn('[Seeder Server] Error al crear factura 5:', err.message);
    }

    console.log(`[Seeder Server] ${model.getFacturas().length} facturas creadas`);
  } else {
    console.warn('[Seeder Server] No se pueden crear facturas: faltan clientes o libros');
  }

  console.log(`[Seeder Server] ${model.getClientes().length} clientes creados`);

  console.log('[Seeder Server] Seed completado exitosamente');
}

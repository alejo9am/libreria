import mongoose from 'mongoose';
import { model, ROL } from './model/model.mjs';

// Funciones auxiliares para crear datos
export function crearLibro(isbn) {
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

export function crearPersona(dni) {
  return {
    dni: `${dni}`,
    nombre: `Nombre ${dni}`,
    apellidos: `Apellido_1${dni} Apellido_2${dni}`,
    direccion: `Direccion ${dni}`,
    email: `${dni}@tsw.uclm.es`,
    password: `${dni}`,
  };
}

export function crearCliente(dni) {
  let cliente = crearPersona(dni);
  cliente.rol = ROL.CLIENTE;
  return cliente;
}

export function crearAdmin(dni) {
  let admin = crearPersona(dni);
  admin.rol = ROL.ADMIN;
  return admin;
}

// Función de conexión
async function connect() {
  const uri = 'mongodb://127.0.0.1/libreria';
  mongoose.Promise = global.Promise;
  const db = mongoose.connection;
  db.on('connecting', () => console.log('Conectando a', uri));
  db.on('connected', () => console.log('Conectado a', uri));
  db.on('disconnecting', () => console.log('Desconectando de', uri));
  db.on('disconnected', () => console.log('Desconectado de', uri));
  db.on('error', (err) => console.error('Error', err.message));
  return await mongoose.connect(uri);
}

// Función de desconexión
async function disconnect() {
  return await mongoose.disconnect();
}

// Función principal de seed
export async function seed() {
  console.log('[Seeder] Iniciando seed...');

  const ISBNS = [
    '978-3-16-148410-0',
    '978-3-16-148410-1',
    '978-3-16-148410-2',
    '978-3-16-148410-3',
    '978-3-16-148410-4'
  ];

  const A_DNIS = [
    '00000000A',
    '00000001A',
    '00000002A',
    '00000003A',
    '00000004A'
  ];

  const C_DNIS = [
    '00000000C',
    '00000001C',
    '00000002C',
    '00000003C',
    '00000004C',
    '00000005C',
    '00000006C'
  ];

  try {
    // Limpiar y crear libros
    console.log('[Seeder] Creando libros...');
    const libros = ISBNS.map(isbn => crearLibro(isbn));
    await model.setLibros(libros);
    console.log(`[Seeder] ${libros.length} libros creados`);

    // Limpiar y crear administradores
    console.log('[Seeder] Creando administradores...');
    const admins = A_DNIS.map(dni => crearAdmin(dni));
    await model.setAdmins(admins);
    console.log(`[Seeder] ${admins.length} administradores creados`);

    // Limpiar y crear clientes
    console.log('[Seeder] Creando clientes...');
    const clientes = C_DNIS.map(dni => crearCliente(dni));
    await model.setClientes(clientes);
    console.log(`[Seeder] ${clientes.length} clientes creados`);

    // Crear usuarios de prueba (fuera de los sets para no ser borrados)
    console.log('[Seeder] Creando usuarios de prueba...');
    try {
      await model.addAdmin({
        dni: '99999999A',
        nombre: 'pruebas',
        apellidos: 'pruebas',
        direccion: 'Calle Pruebas 123',
        email: 'p@p.com',
        password: '1',
        rol: ROL.ADMIN
      });
      console.log('[Seeder] Admin de pruebas creado (p@p.com / 1)');
    } catch (err) {
      console.log('[Seeder] Admin de pruebas ya existe');
    }

    try {
      await model.addCliente({
        dni: '99999999C',
        nombre: 'pruebas',
        apellidos: 'pruebas',
        direccion: 'Calle Pruebas 123',
        email: 'c@c.com',
        password: '1',
        rol: ROL.CLIENTE
      });
      console.log('[Seeder] Cliente de pruebas creado (c@c.com / 1)');
    } catch (err) {
      console.log('[Seeder] Cliente de pruebas ya existe');
    }

    // Crear facturas de ejemplo
    console.log('[Seeder] Creando facturas de ejemplo...');
    const clientesDB = await model.getClientes();
    const librosDB = await model.getLibros();

    if (clientesDB.length > 0 && librosDB.length > 0) {
      // Factura 1
      try {
        const cliente1 = clientesDB[0];
        await model.addClienteCarroItem(cliente1._id, {
          libro: librosDB[0]._id,
          cantidad: 2
        });
        await model.addClienteCarroItem(cliente1._id, {
          libro: librosDB[1]._id,
          cantidad: 1
        });
        await model.facturarCompraCliente({
          cliente: cliente1._id,
          fecha: new Date().toISOString(),
          razonSocial: cliente1.nombre + ' ' + cliente1.apellidos,
          direccion: cliente1.direccion,
          email: cliente1.email,
          dni: cliente1.dni
        });
        console.log('[Seeder] Factura 1 creada');
      } catch (err) {
        console.warn('[Seeder] Error al crear factura 1:', err.message);
      }

      // Factura 2
      try {
        const cliente2 = clientesDB[1];
        await model.addClienteCarroItem(cliente2._id, {
          libro: librosDB[2]._id,
          cantidad: 1
        });
        await model.addClienteCarroItem(cliente2._id, {
          libro: librosDB[3]._id,
          cantidad: 3
        });
        await model.facturarCompraCliente({
          cliente: cliente2._id,
          fecha: new Date().toISOString(),
          razonSocial: cliente2.nombre + ' ' + cliente2.apellidos,
          direccion: cliente2.direccion,
          email: cliente2.email,
          dni: cliente2.dni
        });
        console.log('[Seeder] Factura 2 creada');
      } catch (err) {
        console.warn('[Seeder] Error al crear factura 2:', err.message);
      }

      // Factura 3
      try {
        const cliente3 = clientesDB[2];
        await model.addClienteCarroItem(cliente3._id, {
          libro: librosDB[4]._id,
          cantidad: 5
        });
        await model.facturarCompraCliente({
          cliente: cliente3._id,
          fecha: new Date().toISOString(),
          razonSocial: cliente3.nombre + ' ' + cliente3.apellidos,
          direccion: cliente3.direccion,
          email: cliente3.email,
          dni: cliente3.dni
        });
        console.log('[Seeder] Factura 3 creada');
      } catch (err) {
        console.warn('[Seeder] Error al crear factura 3:', err.message);
      }

      // Factura 4
      try {
        const cliente4 = clientesDB[3];
        await model.addClienteCarroItem(cliente4._id, {
          libro: librosDB[0]._id,
          cantidad: 1
        });
        await model.addClienteCarroItem(cliente4._id, {
          libro: librosDB[2]._id,
          cantidad: 2
        });
        await model.facturarCompraCliente({
          cliente: cliente4._id,
          fecha: new Date().toISOString(),
          razonSocial: cliente4.nombre + ' ' + cliente4.apellidos,
          direccion: cliente4.direccion,
          email: cliente4.email,
          dni: cliente4.dni
        });
        console.log('[Seeder] Factura 4 creada');
      } catch (err) {
        console.warn('[Seeder] Error al crear factura 4:', err.message);
      }

      // Factura 5
      try {
        const cliente5 = clientesDB[4];
        await model.addClienteCarroItem(cliente5._id, {
          libro: librosDB[1]._id,
          cantidad: 4
        });
        await model.facturarCompraCliente({
          cliente: cliente5._id,
          fecha: new Date().toISOString(),
          razonSocial: cliente5.nombre + ' ' + cliente5.apellidos,
          direccion: cliente5.direccion,
          email: cliente5.email,
          dni: cliente5.dni
        });
        console.log('[Seeder] Factura 5 creada');
      } catch (err) {
        console.warn('[Seeder] Error al crear factura 5:', err.message);
      }

      const facturas = await model.getFacturas();
      console.log(`[Seeder] ${facturas.length} facturas creadas en total`);
    }

    // Resumen final
    const librosTotal = await model.getLibros();
    const clientesTotal = await model.getClientes();
    const adminsTotal = await model.getAdmins();
    const facturasTotal = await model.getFacturas();

    console.log('\n===========================================');
    console.log('           SEED COMPLETADO');
    console.log('===========================================');
    console.log(`📚 Libros:          ${librosTotal.length}`);
    console.log(`👥 Clientes:        ${clientesTotal.length}`);
    // Mostrar todos los clientes
    clientesTotal.forEach(cliente => {
      console.log(`   - ${cliente.nombre} ${cliente.apellidos} (${cliente.email})`);
    });
    console.log(`🔑 Administradores: ${adminsTotal.length}`);
    // Mostrar todos los administradores
    adminsTotal.forEach(admin => {
      console.log(`   - ${admin.nombre} ${admin.apellidos} (${admin.email})`);
    });
    console.log(`🧾 Facturas:        ${facturasTotal.length}`);
    console.log('===========================================\n');

  } catch (err) {
    console.error('[Seeder] Error:', err.message);
    throw err;
  }
}

// Ejecutar el seed automáticamente
(async () => {
  try {
    await connect();
    await seed();
  } catch (err) {
    console.error('Error en seed:', err);
  } finally {
    await disconnect();
  }
})();

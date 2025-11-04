import { model, ROL } from './model.mjs';
import { LibreriaSession, LibrosStorage, CarritoStorage } from '../commons/libreria-session.mjs';

function crearLibro(isbn) {
  return {
    isbn: `${isbn}`,
    titulo: `TITULO_${isbn}`,
    autores: `AUTOR_A${isbn}; AUTOR_B${isbn}`,
    resumen:
      `Lorem ipsum dolor sit amet, consectetur adipiscing elit. In ullamcorper massa libero, eget dapibus elit efficitur id. Suspendisse id dui et dui tincidunt fermentum. Integer vel felis purus. Integer tempor orci risus, at dictum urna euismod in. Etiam vitae nisl quis ipsum fringilla mollis. Maecenas vitae mauris sagittis, commodo quam in, tempor mauris. Suspendisse convallis rhoncus pretium. Sed egestas porta dignissim. Aenean nec ex lacus. Nunc mattis ipsum sit amet fermentum aliquam. Ut blandit posuere lacinia. Vestibulum elit arcu, consectetur nec enim quis, ullamcorper imperdiet nunc. Donec vel est consectetur, tincidunt nisi non, suscipit metus._[${isbn}]`,
    portada: `http://google.com/${isbn}`,
    stock: 5,
    precio: (Math.random() * 100).toFixed(2),
    // borrado: false,
    // _id: -1,
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
  // cliente.carro = new Carro();
  return cliente;
}

function crearAdmin(dni) {
  let admin = crearPersona(dni);
  admin.rol = ROL.ADMIN;
  return admin;
}


export function seed() {
  // Asegurar que los IDs de los libros, usuarios y facturas no colisionen con los ya existentes en el MODELO
  const maxLibroId = Math.max(0, ...model.libros.map(l => l._id || 0));
  const maxUsuarioId = Math.max(0, ...model.usuarios.map(u => u._id || 0));
  const maxFacturaId = Math.max(0, ...model.facturas.map(f => f._id || 0));

  model.constructor.lastId = Math.max(maxLibroId, maxUsuarioId, maxFacturaId);

  // Libros: intentar cargar desde sesión para mantener precios estables en recargas
  const ISBNS = ['978-3-16-148410-0', '978-3-16-148410-1', '978-3-16-148410-2', '978-3-16-148410-3', '978-3-16-148410-4'];
  let librosSesion = LibrosStorage.getAll();
  if (librosSesion && librosSesion.length > 0) {
    console.log('[Seeder] Restaurando libros desde sesión:', librosSesion.length);
    librosSesion.forEach(l => model.addLibro(l));
  } else {
    let libros = ISBNS.map(isbn => crearLibro(isbn));
    libros.forEach(l => model.addLibro(l));
    // Guardar en sesión para evitar que el precio cambie en recargas
    LibrosStorage.saveAll(model.getLibros());
  }

  const A_DNIS = ['00000000A', '00000001A', '00000002A', '00000003A', '00000004A'];
  let admins = A_DNIS.map(dni => crearAdmin(dni));
  admins.forEach(a => model.addUsuario(a));

  const C_DNIS = ['00000000C', '00000001C', '00000002C', '00000003C', '00000004C'];
  let clientes = C_DNIS.map(dni => crearCliente(dni));
  clientes.forEach(c => model.addUsuario(c));

  // Cargar usuarios registrados manualmente desde localStorage
  const usuariosGuardados = LibreriaSession.getAllUsuarios();
  console.log('[Seeder] Cargando usuarios desde localStorage:', usuariosGuardados.length);
  usuariosGuardados.forEach(usuarioData => {
    try {
      // Verificar si el usuario ya existe en el modelo por rol
      const usuarioExistente = (usuarioData.rol === ROL.CLIENTE)
        ? model.getClientePorEmail(usuarioData.email)
        : model.getAdministradorPorEmail(usuarioData.email);
      if (!usuarioExistente) {
        console.log('[Seeder] Agregando usuario desde localStorage:', usuarioData.email);
        model.addUsuario(usuarioData);
        // Asegurar que el ID se mantenga igual
        const usuarioAgregado = model.getUsuarioPorEmail(usuarioData.email);
        if (usuarioAgregado && usuarioData._id) {
          usuarioAgregado._id = usuarioData._id;
          // Actualizar lastId si es necesario
          if (usuarioData._id > model.constructor.lastId) {
            model.constructor.lastId = usuarioData._id;
          }
        }
      }
    } catch (err) {
      console.warn('[Seeder] Error al agregar usuario desde localStorage:', usuarioData.email, err);
    }
  });

  // Cargar carritos persistidos desde localStorage
  const carritosGuardados = CarritoStorage.getAll();
  console.log('[Seeder] Cargando carritos desde localStorage:', carritosGuardados.length);
  carritosGuardados.forEach(carritoData => {
    try {
      const cliente = model.getClientePorId(carritoData.userId);
      if (cliente) {
        console.log('[Seeder] Restaurando carrito para usuario:', carritoData.userId);
        // Restaurar los items del carrito pero hay que convertir los libros a referencias correctas
        if (carritoData.items && Array.isArray(carritoData.items)) {
          carritoData.items.forEach(itemData => {
            try {
              const libro = model.getLibroPorId(itemData.libro?._id || itemData.libro);
              if (libro) {
                cliente.addCarroItem({
                  libro: libro,
                  cantidad: itemData.cantidad
                });
              }
            } catch (err) {
              console.warn('[Seeder] Error al restaurar item del carrito:', err);
            }
          });
        }
      }
    } catch (err) {
      console.warn('[Seeder] Error al restaurar carrito:', carritoData.userId, err);
    }
  });
}
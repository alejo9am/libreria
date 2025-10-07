import { model, ROL } from './model.mjs';

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
  const ISBNS = ['978-3-16-148410-0', '978-3-16-148410-1', '978-3-16-148410-2', '978-3-16-148410-3', '978-3-16-148410-4'];
  let libros = ISBNS.map(isbn => crearLibro(isbn));
  libros.forEach(l => model.addLibro(l));

  const A_DNIS = ['00000000A', '00000001A', '00000002A', '00000003A', '00000004A'];
  let admins = A_DNIS.map(dni => crearAdmin(dni));
  admins.forEach(a => model.addUsuario(a));

  const C_DNIS = ['00000000C', '00000001C', '00000002C', '00000003C', '00000004C'];
  let clientes = C_DNIS.map(dni => crearCliente(dni));
  clientes.forEach(c => model.addUsuario(c));
}
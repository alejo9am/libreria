import mongoose from "mongoose";
import { model, ROL } from "./model/model.mjs";
import { Libro } from "./model/libro.mjs";
import { Usuario } from "./model/usuario.mjs";
import { Factura } from "./model/factura.mjs";
import { Carro } from "./model/carro.mjs";
import { Item } from "./model/item.mjs";
import { MONGODB_URI } from './config.mjs';

// =======================================
//   LIBROS PARA EL CATÁLOGO (10 LIBROS)
// =======================================

const LIBROS_SEMILLA = [
  {
    isbn: "9780451524935",
    titulo: "1984",
    autores: "George Orwell",
    portada:
      "https://books.google.com/books/content?id=kotPYEqx7kMC&printsec=frontcover&img=1&zoom=1",
    resumen:
      "Una novela distópica que retrata un futuro marcado por la vigilancia total y la manipulación de la información. Winston Smith lucha por mantener su identidad frente a un sistema que castiga cualquier pensamiento independiente.",
    stock: 12,
    precio: 9.95,
  },
  {
    isbn: "9780261103573",
    titulo: "El Señor de los Anillos: La Comunidad del Anillo",
    autores: "J.R.R. Tolkien",
    portada:
      "https://books.google.com/books/content?id=Yi3tAAAAMAAJ&printsec=frontcover&img=1&zoom=1",
    resumen:
      "El viaje de Frodo comienza cuando hereda un anillo capaz de destruir el mundo. Una aventura épica que combina mitología, amistad y lucha por la libertad.",
    stock: 8,
    precio: 14.99,
  },
  {
    isbn: "9780747532699",
    titulo: "Harry Potter y la Piedra Filosofal",
    autores: "J.K. Rowling",
    portada:
      "https://books.google.com/books/content?id=wrOQLV6xB-wC&printsec=frontcover&img=1&zoom=1",
    resumen:
      "La historia del joven mago que descubre un mundo oculto lleno de criaturas mágicas, misterios y desafíos que marcarán su destino.",
    stock: 10,
    precio: 11.95,
  },
  {
    isbn: "9780156012195",
    titulo: "El Principito",
    autores: "Antoine de Saint-Exupéry",
    portada:
      "https://books.google.com/books/content?id=1o5kQgAACAAJ&printsec=frontcover&img=1&zoom=1",
    resumen:
      "Un cuento profundo disfrazado de fábula infantil. A través del viaje de un pequeño príncipe, reflexiona sobre la amistad, la soledad y el sentido de la vida.",
    stock: 20,
    precio: 7.5,
  },
  {
    isbn: "9780141439518",
    titulo: "Orgullo y Prejuicio",
    autores: "Jane Austen",
    portada:
      "https://books.google.com/books/content?id=Yz4_AAAAYAAJ&printsec=frontcover&img=1&zoom=1",
    resumen:
      "Una sátira elegante sobre la sociedad inglesa del siglo XIX que explora los prejuicios, el amor y las decisiones personales a través de Elizabeth Bennet.",
    stock: 14,
    precio: 8.99,
  },
  {
    isbn: "9780140449136",
    titulo: "Crimen y Castigo",
    autores: "Fiódor Dostoyevski",
    portada:
      "https://books.google.com/books/content?id=vwsnAQAAIAAJ&printsec=frontcover&img=1&zoom=1",
    resumen:
      "Una intensa exploración psicológica del crimen cometido por un joven estudiante y las consecuencias morales que lo persiguen.",
    stock: 7,
    precio: 12.49,
  },
  {
    isbn: "9788437604947",
    titulo: "Cien Años de Soledad",
    autores: "Gabriel García Márquez",
    portada:
      "https://books.google.com/books/content?id=_b1uQgAACAAJ&printsec=frontcover&img=1&zoom=1",
    resumen:
      "La historia de Macondo y de la familia Buendía, una mezcla magistrtral de realismo mágico, tragedia y destino inevitable.",
    stock: 9,
    precio: 13.95,
  },
  {
    isbn: "9780060935467",
    titulo: "Matar a un Ruiseñor",
    autores: "Harper Lee",
    portada:
      "https://books.google.com/books/content?id=PGR2QgAACAAJ&printsec=frontcover&img=1&zoom=1",
    resumen:
      "Un relato sobre injusticia y racismo visto a través de los ojos de Scout, una niña que presencia los prejuicios de su comunidad.",
    stock: 11,
    precio: 10.8,
  },
  {
    isbn: "9788401352836",
    titulo: "El Nombre del Viento",
    autores: "Patrick Rothfuss",
    portada:
      "https://books.google.com/books/content?id=-Y5fQgAACAAJ&printsec=frontcover&img=1&zoom=1",
    resumen:
      "La historia de Kvothe, un músico y mago prodigioso, relatada con una narrativa poética y una construcción del mundo excepcional.",
    stock: 6,
    precio: 15.9,
  },
  {
    isbn: "9780345342966",
    titulo: "Fahrenheit 451",
    autores: "Ray Bradbury",
    portada:
      "https://books.google.com/books/content?id=R1ruAAAAMAAJ&printsec=frontcover&img=1&zoom=1",
    resumen:
      "Una distopía en la que los libros están prohibidos y los bomberos queman conocimiento. Un clásico sobre la censura y el poder de las ideas.",
    stock: 15,
    precio: 9.49,
  },
];

// =======================================
//   USUARIOS PARA LA APLICACIÓN (1 ADMIN, 1 CLIENTE, 1 USUARIO CON DOS ROLES)
// =======================================

export const USUARIOS_SEMILLA = [
  // 1) Cliente por defecto
  {
    dni: "00000000C",
    nombre: "Laura",
    apellidos: "Martínez Gómez",
    direccion: "Calle Alameda 42, 3ºB, Madrid",
    email: "00000000C@tsw.uclm.es",
    password: "00000000C",
    rol: ROL.CLIENTE,
  },

  // 2) Administrador por defecto
  {
    dni: "00000000A",
    nombre: "Javier",
    apellidos: "Serrano Ruiz",
    direccion: "Avenida de la Innovación 12, Sevilla",
    email: "00000000A@tsw.uclm.es",
    password: "00000000A",
    rol: ROL.ADMIN,
  },

  // 3) Usuario de pruebas — versión CLIENTE
  {
    dni: "p",
    nombre: "Alejandro",
    apellidos: "Prats Díez",
    direccion: "Calle Pruebas 123, Valencia",
    email: "p@p.com",
    password: "1",
    rol: ROL.CLIENTE,
  },

  // 4) Usuario de pruebas — versión ADMIN
  {
    dni: "p",
    nombre: "Alejandro",
    apellidos: "Prats Díez",
    direccion: "Calle Pruebas 123, Valencia",
    email: "p@p.com",
    password: "1",
    rol: ROL.ADMIN,
  },
];



// =======================================
//   EJECUCIÓN DEL SEEDER
// =======================================

async function run() {
  try {
    console.log("Conectando a", MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log("Conectado.");

    console.log("[Seeder] Limpiando colecciones...");
    await Usuario.deleteMany({});
    await Libro.deleteMany({});
    await Factura.deleteMany({});
    await Carro.deleteMany({});
    await Item.deleteMany({});
    console.log("[Seeder] Colecciones limpiadas.");

    console.log("[Seeder] Creando libros...");
    await model.setLibros(LIBROS_SEMILLA);
    console.log(`[Seeder] Libros creados: ${LIBROS_SEMILLA.length}`);

    console.log("[Seeder] Creando administradores y clientes...");
    await model.setUsuarios(USUARIOS_SEMILLA);
    console.log("[Seeder] Usuarios creados.");

    console.log("====================================");
    console.log("         SEED COMPLETADO");
    console.log("====================================");
    console.log(`Libros: ${LIBROS_SEMILLA.length}`);
    console.log("Administradores y clientes creados correctamente.");
    console.log("====================================");

    await mongoose.disconnect();
    console.log("Desconectado.");
  } catch (error) {
    console.error("Error en el seeder:", error);
  }
}

run();

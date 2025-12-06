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
    isbn: "9780141441146",
    titulo: "Jane Eyre",
    autores: "Charlotte Brontë",
    portada: "https://covers.openlibrary.org/b/isbn/9780141441146-L.jpg",
    resumen:
      "La historia de Jane Eyre, una joven que lucha por su independencia y dignidad frente a las adversidades de su tiempo.",
    stock: 10,
    precio: 9.95
  },
  {
    isbn: "9780061120084",
    titulo: "Matar a un Ruiseñor",
    autores: "Harper Lee",
    portada: "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg",
    resumen:
      "Un retrato crítico de la injusticia racial en el sur de Estados Unidos, narrado por la joven Scout Finch.",
    stock: 12,
    precio: 11.50
  },
  {
    isbn: "9780743273565",
    titulo: "El Gran Gatsby",
    autores: "F. Scott Fitzgerald",
    portada: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
    resumen:
      "Jay Gatsby persigue un ideal imposible en el Nueva York de los años 20, en una historia sobre ambición y desengaño.",
    stock: 7,
    precio: 10.20
  },
  {
    isbn: "9780385751537",
    titulo: "El Niño con el Pijama de Rayas",
    autores: "John Boyne",
    portada: "https://covers.openlibrary.org/b/isbn/9780385751537-L.jpg",
    resumen:
      "La amistad inocente entre dos niños durante la Segunda Guerra Mundial revela las atrocidades del Holocausto.",
    stock: 9,
    precio: 8.95
  },
  {
    isbn: "9780062315007",
    titulo: "El Alquimista",
    autores: "Paulo Coelho",
    portada: "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg",
    resumen:
      "Santiago emprende un viaje espiritual en busca de su leyenda personal, descubriendo el poder de los sueños.",
    stock: 15,
    precio: 12.99
  },
  {
    isbn: "9780141036144",
    titulo: "1984",
    autores: "George Orwell",
    portada: "https://covers.openlibrary.org/b/isbn/9780141036144-L.jpg",
    resumen:
      "Una distopía sobre un régimen totalitario que controla cada aspecto de la vida y manipula la verdad.",
    stock: 11,
    precio: 9.50
  },
  {
    isbn: "9780140449266",
    titulo: "La Odisea",
    autores: "Homero",
    portada: "https://covers.openlibrary.org/b/isbn/9780140449266-L.jpg",
    resumen:
      "El regreso épico de Ulises a Ítaca, enfrentándose a criaturas mitológicas, dioses y tentaciones.",
    stock: 8,
    precio: 13.99
  },
  {
    isbn: "9780140449181",
    titulo: "La Ilíada",
    autores: "Homero",
    portada: "https://covers.openlibrary.org/b/isbn/9780140449181-L.jpg",
    resumen:
      "El poema épico que narra la guerra de Troya, el honor, la furia de Aquiles y el destino de los héroes.",
    stock: 10,
    precio: 14.50
  },
  {
    isbn: "9780140449334",
    titulo: "Crimen y Castigo",
    autores: "Fiódor Dostoyevski",
    portada: "https://covers.openlibrary.org/b/isbn/9780140449334-L.jpg",
    resumen:
      "Raskólnikov comete un crimen que desencadena una batalla moral y psicológica consigo mismo.",
    stock: 6,
    precio: 12.40
  },
  {
    isbn: "9781451673319",
    titulo: "Fahrenheit 451",
    autores: "Ray Bradbury",
    portada: "https://covers.openlibrary.org/b/isbn/9781451673319-L.jpg",
    resumen:
      "En una sociedad donde los libros están prohibidos, Montag empieza a cuestionar todo lo que siempre creyó.",
    stock: 13,
    precio: 9.80
  }
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

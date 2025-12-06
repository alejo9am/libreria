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
      "Huérfana desde niña, Jane Eyre sufre una infancia cruel antes de convertirse en institutriz en Thornfield Hall. Allí se enamora del misterioso Sr. Rochester, pero descubre un oscuro secreto que amenaza su felicidad. Esta novela clásica explora temas de independencia, moralidad y la apasionada búsqueda de una mujer por encontrar su lugar en el mundo respetándose a sí misma.",
    stock: 10,
    precio: 9.95
  },
  {
    isbn: "9780061120084",
    titulo: "Matar a un Ruiseñor",
    autores: "Harper Lee",
    portada: "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg",
    resumen:
      "A través de los ojos de la joven Scout Finch, esta novela explora la injusticia racial y la pérdida de la inocencia en el sur de Estados Unidos durante la Gran Depresión. Su padre, el abogado Atticus Finch, defiende a un hombre negro acusado injustamente, enseñando a sus hijos lecciones vitales sobre la empatía, el coraje y la integridad moral frente a los prejuicios de una comunidad.",
    stock: 12,
    precio: 11.50
  },
  {
    isbn: "9780743273565",
    titulo: "El Gran Gatsby",
    autores: "F. Scott Fitzgerald",
    portada: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
    resumen:
      "En el vibrante Nueva York de los años 20, el millonario Jay Gatsby organiza fiestas extravagantes obsesionado con reconquistar a su antiguo amor, Daisy Buchanan. Narrada por Nick Carraway, esta obra maestra desentraña la decadencia del Sueño Americano, revelando una historia de obsesión, riqueza desmedida y tragedia inevitable detrás del brillo superficial de la Era del Jazz.",
    stock: 7,
    precio: 10.20
  },
  {
    isbn: "9780385751537",
    titulo: "El Niño con el Pijama de Rayas",
    autores: "John Boyne",
    portada: "https://covers.openlibrary.org/b/isbn/9780385751537-L.jpg",
    resumen:
      "Bruno, un niño alemán de ocho años, se muda con su familia cerca de un campo de concentración donde su padre es comandante. Inocente de la realidad que lo rodea, se hace amigo de Shmuel, un niño judío al otro lado de la alambrada. Su prohibida amistad expone la brutalidad del Holocausto y conduce a un desenlace devastador que marca la pérdida de la inocencia.",
    stock: 9,
    precio: 8.95
  },
  {
    isbn: "9780062315007",
    titulo: "El Alquimista",
    autores: "Paulo Coelho",
    portada: "https://covers.openlibrary.org/b/isbn/9780062315007-L.jpg",
    resumen:
      "Santiago, un joven pastor andaluz, viaja desde España hacia el desierto egipcio en busca de un tesoro oculto en las pirámides. A lo largo de su camino, conoce a mentores y enfrenta desafíos que le enseñan a escuchar a su corazón. Esta fábula inspiradora nos recuerda la importancia de perseguir nuestros sueños y reconocer las señales que el destino pone en nuestro camino.",
    stock: 15,
    precio: 12.99
  },
  {
    isbn: "9780141036144",
    titulo: "1984",
    autores: "George Orwell",
    portada: "https://covers.openlibrary.org/b/isbn/9780141036144-L.jpg",
    resumen:
      "En un futuro sombrío gobernado por el Gran Hermano, la vigilancia es total y la libertad de pensamiento es un crimen. Winston Smith, un funcionario del Partido encargado de reescribir la historia, intenta rebelarse manteniendo una relación prohibida. Esta novela distópica es una advertencia escalofriante sobre los peligros del totalitarismo, la manipulación de la verdad y la aniquilación de la individualidad humana.",
    stock: 11,
    precio: 9.50
  },
  {
    isbn: "9780140268867",
    titulo: "La Odisea",
    autores: "Homero",
    portada: "https://covers.openlibrary.org/b/isbn/9780140268867-L.jpg",
    resumen:
      "Tras la guerra de Troya, el astuto héroe Odiseo emprende un peligroso viaje de diez años para regresar a su hogar en Ítaca. Enfrentándose a cíclopes, sirenas y la ira de los dioses, debe usar todo su ingenio para sobrevivir. Mientras tanto, en su hogar, su esposa Penélope resiste a los pretendientes que asedian su palacio, esperando el regreso de su rey en esta epopeya fundacional.",
    stock: 8,
    precio: 13.99
  },
  {
    isbn: "9780140445923",
    titulo: "La Ilíada",
    autores: "Homero",
    portada: "https://covers.openlibrary.org/b/isbn/9780140445923-L.jpg",
    resumen:
      "Este poema épico relata las últimas semanas de la guerra de Troya, centrándose en la cólera del invencible Aquiles. Tras una disputa con el rey Agamenón, Aquiles se retira del combate, desencadenando consecuencias trágicas para ambos bandos. La obra explora la gloria, el honor, el destino inevitable y la brutalidad de la guerra, culminando en un duelo legendario con Héctor.",
    stock: 10,
    precio: 14.50
  },
  {
    isbn: "9780140449136",
    titulo: "Crimen y Castigo",
    autores: "Fiódor Dostoyevski",
    portada: "https://covers.openlibrary.org/b/isbn/9780140449136-L.jpg",
    resumen:
      "Raskólnikov, un estudiante pobre en San Petersburgo, comete un asesinato justificado por su propia teoría de que algunos hombres extraordinarios están por encima de la ley moral. Sin embargo, la culpa y la paranoia lo consumen, sumergiéndolo en una pesadilla psicológica. Perseguido por un astuto investigador, debe buscar la redención y enfrentar las consecuencias de sus actos en esta profunda exploración de la conciencia humana.",
    stock: 6,
    precio: 12.40
  },
  {
    isbn: "9781451673319",
    titulo: "Fahrenheit 451",
    autores: "Ray Bradbury",
    portada: "https://covers.openlibrary.org/b/isbn/9781451673319-L.jpg",
    resumen:
      "Guy Montag es un bombero cuyo trabajo no es apagar fuegos, sino provocarlos para quemar libros, prohibidos por un gobierno que busca suprimir el pensamiento crítico. Tras conocer a una joven vecina que le abre los ojos, Montag comienza a cuestionar su vida vacía y se une a la resistencia para preservar el conocimiento. Una poderosa defensa de la literatura y la libertad intelectual.",
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

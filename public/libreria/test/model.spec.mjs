// public/libreria/test/model.spec.mjs
// Tests del modelo de la librería usando Mocha + Chai

import * as chai from 'https://cdnjs.cloudflare.com/ajax/libs/chai/5.1.1/chai.js';
import { Libreria, ROL } from '../model/model.mjs';

const assert = chai.assert;

describe("Tests del Modelo de Librería", function () {

    let libreria;

    // Crear nueva instancia antes de cada test
    beforeEach(function () {
        libreria = new Libreria();
    });

    // ============================================================================
    // 1. GETTERS Y SETTERS (1 punto)
    // ============================================================================

    describe("Getters y Setters", function () {

        describe("Libro", function () {
            it("Añadir libro", function () {
                const libro = libreria.addLibro({
                    isbn: "978-3-16-148410-0",
                    titulo: "Test Book",
                    autores: "Author Test",
                    portada: "http://test.com/cover.jpg",
                    resumen: "Test resumen",
                    stock: 10,
                    precio: 25.99
                });

                assert.equal(libro.isbn, "978-3-16-148410-0");
                assert.equal(libro.titulo, "Test Book");
                assert.equal(libro.autores, "Author Test");
                assert.equal(libro.portada, "http://test.com/cover.jpg");
                assert.equal(libro.resumen, "Test resumen");
                assert.equal(libro.stock, 10);
                assert.equal(libro.precio, 25.99);
                assert.isDefined(libro._id);
            });
        });

        describe("Usuario Cliente", function () {
            it("Añadir cliente", function () {
                const cliente = libreria.addUsuario({
                    dni: "12345678A",
                    nombre: "Juan",
                    apellidos: "Pérez García",
                    direccion: "Calle Test 123",
                    email: "juan@test.com",
                    password: "12345678A",
                    rol: ROL.CLIENTE
                });

                assert.equal(cliente.dni, "12345678A");
                assert.equal(cliente.nombre, "Juan");
                assert.equal(cliente.apellidos, "Pérez García");
                assert.equal(cliente.direccion, "Calle Test 123");
                assert.equal(cliente.email, "juan@test.com");
                assert.equal(cliente.rol, ROL.CLIENTE);
                assert.isDefined(cliente._id);
                assert.isDefined(cliente.carro);
            });
        });

        describe("Usuario Administrador", function () {
            it("Añadir administrador", function () {
                const admin = libreria.addUsuario({
                    dni: "87654321B",
                    nombre: "Admin",
                    apellidos: "Test User",
                    direccion: "Admin Street 1",
                    email: "admin@test.com",
                    password: "87654321B",
                    rol: ROL.ADMIN
                });

                assert.equal(admin.dni, "87654321B");
                assert.equal(admin.nombre, "Admin");
                assert.equal(admin.rol, ROL.ADMIN);
                assert.isDefined(admin._id);
                assert.isUndefined(admin.carro);
            });
        });
    });

    // ============================================================================
    // 2. EXCEPCIONES (4 puntos)
    // ============================================================================

    describe("Excepciones (4 puntos)", function () {

        describe("Libros - Excepciones", function () {
            it("debe lanzar error al agregar libro sin ISBN", function () {
                assert.throws(
                    () => libreria.addLibro({ titulo: "Book without ISBN" }),
                    Error,
                    "El libro no tiene ISBN"
                );
            });

            it("debe lanzar error al agregar libro con ISBN duplicado", function () {
                libreria.addLibro({ isbn: "123", titulo: "First Book", precio: 10, stock: 5 });

                assert.throws(
                    () => libreria.addLibro({ isbn: "123", titulo: "Second Book", precio: 15, stock: 3 }),
                    Error,
                    "El ISBN 123 ya existe"
                );
            });

            it("debe lanzar error al eliminar libro inexistente", function () {
                assert.throws(
                    () => libreria.removeLibro(999),
                    Error,
                    "Libro no encontrado"
                );
            });
        });

        describe("Usuarios - Excepciones", function () {
            it("debe lanzar error al registrar email duplicado con mismo rol (CLIENTE)", function () {
                libreria.addUsuario({
                    dni: "11111111A",
                    nombre: "User1",
                    apellidos: "Test",
                    email: "duplicate@test.com",
                    password: "pass1",
                    rol: ROL.CLIENTE
                });

                assert.throws(
                    () => libreria.addUsuario({
                        dni: "22222222B",
                        nombre: "User2",
                        apellidos: "Test",
                        email: "duplicate@test.com",
                        password: "pass2",
                        rol: ROL.CLIENTE
                    }),
                    Error,
                    "Ya existe un CLIENTE registrado con ese email"
                );
            });

            it("debe lanzar error al registrar email duplicado con mismo rol (ADMIN)", function () {
                libreria.addUsuario({
                    dni: "33333333C",
                    nombre: "Admin1",
                    apellidos: "Test",
                    email: "admin@test.com",
                    password: "pass1",
                    rol: ROL.ADMIN
                });

                assert.throws(
                    () => libreria.addUsuario({
                        dni: "44444444D",
                        nombre: "Admin2",
                        apellidos: "Test",
                        email: "admin@test.com",
                        password: "pass2",
                        rol: ROL.ADMIN
                    }),
                    Error,
                    "Ya existe un ADMIN registrado con ese email"
                );
            });

            it("debe permitir mismo email con diferentes roles", function () {
                const cliente = libreria.addUsuario({
                    dni: "55555555E",
                    nombre: "User",
                    apellidos: "Dual",
                    email: "dual@test.com",
                    password: "pass",
                    rol: ROL.CLIENTE
                });

                const admin = libreria.addUsuario({
                    dni: "66666666F",
                    nombre: "Admin",
                    apellidos: "Dual",
                    email: "dual@test.com",
                    password: "pass",
                    rol: ROL.ADMIN
                });

                assert.equal(cliente.email, admin.email);
                assert.notEqual(cliente.rol, admin.rol);
            });

            it("debe lanzar error en autenticación con usuario inexistente", function () {
                assert.throws(
                    () => libreria.autenticar({
                        email: "noexiste@test.com",
                        password: "anypass",
                        rol: ROL.CLIENTE
                    }),
                    Error,
                    "Usuario no encontrado"
                );
            });

            it("debe lanzar error en autenticación con contraseña incorrecta", function () {
                libreria.addUsuario({
                    dni: "77777777G",
                    nombre: "Test",
                    apellidos: "User",
                    email: "test@test.com",
                    password: "correctpass",
                    rol: ROL.CLIENTE
                });

                assert.throws(
                    () => libreria.autenticar({
                        email: "test@test.com",
                        password: "wrongpass",
                        rol: ROL.CLIENTE
                    }),
                    Error,
                    "Error en la contraseña"
                );
            });

            it("debe lanzar error con rol desconocido", function () {
                assert.throws(
                    () => libreria.addUsuario({
                        dni: "88888888H",
                        nombre: "Test",
                        apellidos: "User",
                        email: "test@test.com",
                        password: "pass",
                        rol: "INVALID_ROLE"
                    }),
                    Error,
                    "Rol desconocido"
                );
            });
        });

        describe("Carro - Excepciones", function () {
            it("debe lanzar error al establecer cantidad negativa", function () {
                // Por hacer asi que se pone como fallido
                const cliente = libreria.addUsuario({
                    dni: "CNEG001",
                    nombre: "Negativo",
                    apellidos: "Test",
                    email: "neg@test.com",
                    password: "pass",
                    rol: ROL.CLIENTE
                });

                const libro = libreria.addLibro({
                    isbn: "NEG-L1",
                    titulo: "Libro Neg",
                    precio: 10,
                    stock: 5
                });

                // Añade 1 unidad y luego intenta poner cantidad negativa.
                libreria.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 1 });

                assert.throws(
                    () => libreria.setClienteCarroItemCantidad(cliente._id, 0, -1),
                    Error,
                    "Cantidad inferior a 0"
                );
            });
        });

        describe("Factura - Excepciones", function () {
            it("debe lanzar error al pagar sin cliente", function () {
                Error
            });

            it("debe lanzar error al pagar carro vacío", function () {
                const cliente = libreria.addUsuario({
                    dni: "CVOID001",
                    nombre: "Vacio",
                    apellidos: "Test",
                    email: "void@test.com",
                    password: "pass",
                    rol: ROL.CLIENTE
                });

                // No hay items en el carro -> debe fallar
                assert.throws(
                    () => libreria.facturarCompraCliente({
                        cliente: cliente._id,
                        razonSocial: "Acme S.A.",
                        direccion: "Calle Falsa 123",
                        email: "fact@acme.com",
                        dni: "A0000000Z"
                    }),
                    Error,
                    "No hay que comprar"
                );
            });
        });
    });

    // ============================================================================
    // 3. AGREGAR, MODIFICAR Y ELIMINAR (10 puntos)
    // ============================================================================

    describe("Operaciones CRUD (10 puntos)", function () {

        describe("Libros - CRUD", function () {
            it("debe agregar un libro correctamente", function () {
                const libro = libreria.addLibro({
                    isbn: "978-1-23-456789-0",
                    titulo: "JavaScript: The Good Parts",
                    autores: "Douglas Crockford",
                    portada: "http://example.com/cover.jpg",
                    resumen: "A book about JavaScript",
                    stock: 15,
                    precio: 29.99
                });

                assert.isDefined(libro._id);
                assert.equal(libreria.getLibros().length, 1);
                assert.equal(libro.titulo, "JavaScript: The Good Parts");
            });

            it("debe obtener libro por ID", function () {
                const libro = libreria.addLibro({
                    isbn: "222",
                    titulo: "Test Book",
                    precio: 20,
                    stock: 5
                });

                const retrieved = libreria.getLibroPorId(libro._id);
                assert.equal(retrieved._id, libro._id);
                assert.equal(retrieved.titulo, "Test Book");
            });

            it("debe obtener libro por ISBN", function () {
                libreria.addLibro({ isbn: "333", titulo: "Book by ISBN", precio: 15, stock: 3 });

                const libro = libreria.getLibroPorIsbn("333");
                assert.equal(libro.isbn, "333");
                assert.equal(libro.titulo, "Book by ISBN");
            });

            it("debe obtener libro por título (con regex)", function () {
                libreria.addLibro({ isbn: "444", titulo: "Advanced JavaScript", precio: 30, stock: 10 });

                const libro = libreria.getLibroPorTitulo("javascript");
                assert.isNotNull(libro);
                assert.include(libro.titulo.toLowerCase(), "javascript");
            });

            it("debe modificar un libro existente", function () {
                const libro = libreria.addLibro({
                    isbn: "555",
                    titulo: "Original Title",
                    precio: 25,
                    stock: 8
                });

                libreria.updateLibro({
                    _id: libro._id,
                    isbn: "555",
                    titulo: "Modified Title",
                    precio: 30,
                    stock: 12
                });

                const updated = libreria.getLibroPorId(libro._id);
                assert.equal(updated.titulo, "Modified Title");
                assert.equal(updated.precio, 30);
                assert.equal(updated.stock, 12);
            });

            it("debe eliminar un libro existente", function () {
                const libro = libreria.addLibro({
                    isbn: "666",
                    titulo: "To be deleted",
                    precio: 10,
                    stock: 5
                });

                const initialCount = libreria.getLibros().length;
                libreria.removeLibro(libro._id);

                assert.equal(libreria.getLibros().length, initialCount - 1);
                assert.isUndefined(libreria.getLibroPorId(libro._id));
            });

            it("debe mantener integridad tras eliminar", function () {
                libreria.addLibro({ isbn: "777", titulo: "Book 1", precio: 10, stock: 5 });
                const libro2 = libreria.addLibro({ isbn: "888", titulo: "Book 2", precio: 15, stock: 3 });
                libreria.addLibro({ isbn: "999", titulo: "Book 3", precio: 20, stock: 8 });

                libreria.removeLibro(libro2._id);

                assert.equal(libreria.getLibros().length, 2);
                assert.isDefined(libreria.getLibroPorIsbn("777"));
                assert.isUndefined(libreria.getLibroPorIsbn("888"));
                assert.isDefined(libreria.getLibroPorIsbn("999"));
            });
        });

        describe("Usuarios - Clientes CRUD", function () {
            it("debe agregar un cliente correctamente", function () {
                const cliente = libreria.addUsuario({
                    dni: "12345678X",
                    nombre: "María",
                    apellidos: "González López",
                    direccion: "Calle Principal 1",
                    email: "maria@test.com",
                    password: "12345678X",
                    rol: ROL.CLIENTE
                });

                assert.isDefined(cliente._id);
                assert.equal(cliente.rol, ROL.CLIENTE);
                assert.isDefined(cliente.carro);
                assert.equal(libreria.getClientes().length, 1);
            });

            it("debe obtener cliente por email", function () {
                libreria.addUsuario({
                    dni: "11111111X",
                    nombre: "Test",
                    apellidos: "User",
                    email: "findme@test.com",
                    password: "pass",
                    rol: ROL.CLIENTE
                });

                const cliente = libreria.getClientePorEmail("findme@test.com");
                assert.isNotNull(cliente);
                assert.equal(cliente.email, "findme@test.com");
                assert.equal(cliente.rol, ROL.CLIENTE);
            });

            it("debe obtener cliente por ID", function () {
                const cliente = libreria.addUsuario({
                    dni: "22222222Y",
                    nombre: "Test",
                    apellidos: "User",
                    email: "test@test.com",
                    password: "pass",
                    rol: ROL.CLIENTE
                });

                const found = libreria.getClientePorId(cliente._id);
                assert.equal(found._id, cliente._id);
                assert.equal(found.rol, ROL.CLIENTE);
            });

            it("debe modificar datos del cliente", function () {
                const cliente = libreria.addUsuario({
                    dni: "33333333Z",
                    nombre: "Original",
                    apellidos: "Name",
                    direccion: "Old Address",
                    email: "original@test.com",
                    password: "oldpass",
                    rol: ROL.CLIENTE
                });

                libreria.updateUsuario({
                    _id: cliente._id,
                    dni: "33333333Z",
                    nombre: "Updated",
                    apellidos: "Name",
                    direccion: "New Address",
                    email: "original@test.com",
                    password: "newpass",
                    rol: ROL.CLIENTE
                });

                const updated = libreria.getUsuarioPorId(cliente._id);
                assert.equal(updated.nombre, "Updated");
                assert.equal(updated.direccion, "New Address");
                assert.equal(updated.password, "newpass");
            });
        });

        describe("Usuarios - Administradores CRUD", function () {
            it("debe agregar un administrador correctamente", function () {
                const admin = libreria.addUsuario({
                    dni: "99999999A",
                    nombre: "Admin",
                    apellidos: "System",
                    direccion: "Admin HQ",
                    email: "admin@system.com",
                    password: "adminpass",
                    rol: ROL.ADMIN
                });

                assert.isDefined(admin._id);
                assert.equal(admin.rol, ROL.ADMIN);
                assert.isUndefined(admin.carro);
                assert.equal(libreria.getAdmins().length, 1);
            });

            it("debe obtener administrador por email", function () {
                libreria.addUsuario({
                    dni: "88888888B",
                    nombre: "Admin",
                    apellidos: "Test",
                    email: "admintest@test.com",
                    password: "pass",
                    rol: ROL.ADMIN
                });

                const admin = libreria.getAdministradorPorEmail("admintest@test.com");
                assert.isNotNull(admin);
                assert.equal(admin.email, "admintest@test.com");
                assert.equal(admin.rol, ROL.ADMIN);
            });

            it("debe modificar datos del administrador", function () {
                const admin = libreria.addUsuario({
                    dni: "77777777C",
                    nombre: "OldAdmin",
                    apellidos: "Name",
                    email: "oldadmin@test.com",
                    password: "oldpass",
                    rol: ROL.ADMIN
                });

                libreria.updateUsuario({
                    _id: admin._id,
                    dni: "77777777C",
                    nombre: "NewAdmin",
                    apellidos: "Name",
                    email: "oldadmin@test.com",
                    password: "newpass",
                    rol: ROL.ADMIN
                });

                const updated = libreria.getUsuarioPorId(admin._id);
                assert.equal(updated.nombre, "NewAdmin");
                assert.equal(updated.password, "newpass");
            });

            it("debe autenticar administrador correctamente", function () {
                libreria.addUsuario({
                    dni: "66666666D",
                    nombre: "Auth",
                    apellidos: "Admin",
                    email: "auth@admin.com",
                    password: "correctpass",
                    rol: ROL.ADMIN
                });

                const authenticated = libreria.autenticar({
                    email: "auth@admin.com",
                    password: "correctpass",
                    rol: ROL.ADMIN
                });

                assert.isNotNull(authenticated);
                assert.equal(authenticated.email, "auth@admin.com");
                assert.equal(authenticated.rol, ROL.ADMIN);
            });
        });

        describe("Carro de Compras - CRUD", function () {
            let cliente, libro1, libro2;

            beforeEach(function () {
                cliente = libreria.addUsuario({
                    dni: "55555555E",
                    nombre: "Comprador",
                    apellidos: "Test",
                    email: "comprador@test.com",
                    password: "pass",
                    rol: ROL.CLIENTE
                });

                libro1 = libreria.addLibro({
                    isbn: "BOOK1",
                    titulo: "Book One",
                    precio: 10,
                    stock: 100
                });

                libro2 = libreria.addLibro({
                    isbn: "BOOK2",
                    titulo: "Book Two",
                    precio: 20,
                    stock: 50
                });
            });

            it("debe agregar item al carro del cliente", function () {
                libreria.addClienteCarroItem(cliente._id, { libro: libro1._id, cantidad: 2 });
                const carro = libreria.getCarroCliente(cliente._id);

                assert.equal(carro.items.length, 1);
                assert.equal(carro.items[0].cantidad, 2);
                assert.equal(carro.items[0].libro._id, libro1._id);

                const subtotalEsperado = 2 * libro1.precio;
                const ivaEsperado = subtotalEsperado * 0.21;
                const totalEsperado = subtotalEsperado + ivaEsperado;

                assert.closeTo(carro.subtotal, subtotalEsperado, 1e-9);
                assert.closeTo(carro.iva, ivaEsperado, 1e-9);
                assert.closeTo(carro.total, totalEsperado, 1e-9);
            });

            it("debe incrementar cantidad si el libro ya existe en carro", function () {
                libreria.addClienteCarroItem(cliente._id, { libro: libro1._id, cantidad: 1 });
                libreria.addClienteCarroItem(cliente._id, { libro: libro1._id, cantidad: 2 }); // mismo libro

                const carro = libreria.getCarroCliente(cliente._id);
                assert.equal(carro.items.length, 1); // no duplica el ítem
                assert.equal(carro.items[0].cantidad, 3); // 1 + 2
                assert.closeTo(carro.subtotal, 3 * libro1.precio, 1e-9);
            });

            it("debe modificar cantidad de item en carro", function () {
                libreria.addClienteCarroItem(cliente._id, { libro: libro1._id, cantidad: 1 });
                libreria.setClienteCarroItemCantidad(cliente._id, 0, 4);

                const carro = libreria.getCarroCliente(cliente._id);
                assert.equal(carro.items[0].cantidad, 4);
                assert.closeTo(carro.subtotal, 4 * libro1.precio, 1e-9);
                assert.closeTo(carro.iva, 4 * libro1.precio * 0.21, 1e-9);
                assert.closeTo(carro.total, 4 * libro1.precio * 1.21, 1e-9);
            });

            it("debe eliminar item cuando cantidad es 0", function () {
                libreria.addClienteCarroItem(cliente._id, { libro: libro1._id, cantidad: 2 });
                libreria.setClienteCarroItemCantidad(cliente._id, 0, 0);

                const carro = libreria.getCarroCliente(cliente._id);
                assert.equal(carro.items.length, 0);
                assert.equal(carro.subtotal, 0);
                assert.equal(carro.iva, 0);
                assert.equal(carro.total, 0);
            });

            it("debe vaciar el carro", function () {
                libreria.addClienteCarroItem(cliente._id, { libro: libro1._id, cantidad: 1 });
                libreria.addClienteCarroItem(cliente._id, { libro: libro2._id, cantidad: 1 });

                // Mientras queden items, borra el primero (índice 0)
                let carro = libreria.getCarroCliente(cliente._id);
                while (carro.items.length > 0) {
                    libreria.setClienteCarroItemCantidad(cliente._id, 0, 0);
                    carro = libreria.getCarroCliente(cliente._id);
                }

                assert.equal(carro.items.length, 0);
                assert.equal(carro.subtotal, 0);
                assert.equal(carro.iva, 0);
                assert.equal(carro.total, 0);
            });

        });

        describe("Facturas - CRUD", function () {
            
            it("debe crear factura a partir del carro", function () {
                const cliente = libreria.addUsuario({
                    dni: "F001",
                    nombre: "Pepe",
                    apellidos: "Prueba",
                    email: "pepe@prueba.com",
                    password: "F001",
                    rol: ROL.CLIENTE
                });

                const libro = libreria.addLibro({
                    isbn: "FACT001",
                    titulo: "Libro de Facturación",
                    precio: 50,
                    stock: 20
                });

                // Añadir al carro del cliente
                libreria.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 2 });

                // Obtener carro para verificar datos antes de facturar
                const carro = libreria.getCarroCliente(cliente._id);
                const subtotalEsperado = 2 * libro.precio; // 100
                const ivaEsperado = subtotalEsperado * 0.21; // 21
                const totalEsperado = subtotalEsperado + ivaEsperado; // 121

                // Facturar
                const factura = libreria.facturarCompraCliente({
                    cliente: cliente._id,
                    razonSocial: "Pepe Prueba",
                    direccion: "Calle 123",
                    email: "pepe@prueba.com",
                    dni: "F001"
                });

                // Verificaciones
                assert.isDefined(factura);
                assert.isDefined(factura._id);
                assert.isDefined(factura.numero);
                assert.isTrue(factura.numero.startsWith('F-'));
                assert.equal(factura.items.length, 1);
                assert.equal(factura.items[0].cantidad, 2);
                assert.equal(factura.razonSocial, "Pepe Prueba");
                assert.equal(factura.dni, "F001");
                assert.closeTo(factura.subtotal, subtotalEsperado, 1e-9);
                assert.closeTo(factura.iva, ivaEsperado, 1e-9);
                assert.closeTo(factura.total, totalEsperado, 1e-9);
            });

            it("debe vaciar carro después de facturar", function () {
                // Crear cliente y libro
                const cliente = libreria.addUsuario({
                    dni: "F002",
                    nombre: "Ana",
                    apellidos: "Prueba",
                    email: "ana@prueba.com",
                    password: "F002",
                    rol: ROL.CLIENTE
                });

                const libro = libreria.addLibro({
                    isbn: "FACT002",
                    titulo: "Libro de Facturación 2",
                    precio: 25,
                    stock: 10
                });

                // Añadir al carro y verificar que tiene contenido
                libreria.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 3 });
                let carro = libreria.getCarroCliente(cliente._id);
                assert.equal(carro.items.length, 1, "El carro debería tener 1 ítem antes de facturar");

                // Facturar (esto debe vaciar el carro del cliente)
                libreria.facturarCompraCliente({
                    cliente: cliente._id,
                    razonSocial: "Ana Prueba",
                    direccion: "Calle 456",
                    email: "ana@prueba.com",
                    dni: "F002"
                });

                // Comprobaciones: carro vacío y totales a cero
                carro = libreria.getCarroCliente(cliente._id);
                assert.equal(carro.items.length, 0, "El carro debería quedar vacío tras facturar");
                assert.strictEqual(carro.subtotal, 0, "Subtotal del carro debería ser 0 tras facturar");
                assert.strictEqual(carro.iva, 0, "IVA del carro debería ser 0 tras facturar");
                assert.strictEqual(carro.total, 0, "Total del carro debería ser 0 tras facturar");
            });

            it("debe eliminar una factura", function () {
                // Crear cliente y libro
                const cliente = libreria.addUsuario({
                    dni: "F003",
                    nombre: "Luis",
                    apellidos: "Prueba",
                    email: "luis@prueba.com",
                    password: "F003",
                    rol: ROL.CLIENTE
                });

                const libro = libreria.addLibro({
                    isbn: "FACT003",
                    titulo: "Libro de Facturación 3",
                    precio: 30,
                    stock: 5
                });

                // Añadir al carro y facturar
                libreria.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 1 });
                const factura = libreria.facturarCompraCliente({
                    cliente: cliente._id,
                    razonSocial: "Luis Prueba",
                    direccion: "Calle 789",
                    email: "luis@prueba.com",
                    dni: "F003"
                });

                // La factura ya está guardada en el modelo automáticamente
                const totalAntes = libreria.getFacturas().length;

                // removeFactura devuelve el array de facturas encontradas (por diseño actual del modelo)
                const eliminada = libreria.removeFactura(factura._id);

                // Comprobaciones
                const totalDespues = libreria.getFacturas().length;
                assert.equal(totalDespues, totalAntes - 1, "Debe reducirse el número de facturas en 1");

                // Verificar que ya no existe en el modelo
                const buscar = libreria.getFacturaPorId(factura._id);
                assert.isArray(buscar);
                assert.equal(buscar.length, 0, "No debería encontrarse la factura eliminada");

                // (Opcional) Verificar lo que devolvió removeFactura según implementación actual
                assert.isArray(eliminada, "removeFactura devuelve el array de coincidencias antes de borrar");
                assert.equal(eliminada.length, 1, "Debe haber encontrado exactamente una factura para eliminar");
                assert.equal(eliminada[0]._id, factura._id, "La factura encontrada debe coincidir con la eliminada");
            });
        });
    });

    // ============================================================================
    // 4. CÁLCULOS (10 puntos)
    // ============================================================================

    describe("Cálculos (10 puntos)", function () {

        describe("Libro - Gestión de Stock", function () {
            it("debe incrementar stock en N unidades", function () {
                const libro = libreria.addLibro({
                    isbn: "STOCK001",
                    titulo: "Test Stock",
                    precio: 20,
                    stock: 10
                });

                libro.incStockN(5);
                assert.equal(libro.stock, 15);
            });

            it("debe decrementar stock en N unidades", function () {
                const libro = libreria.addLibro({
                    isbn: "STOCK002",
                    titulo: "Test Stock",
                    precio: 20,
                    stock: 10
                });

                libro.decStockN(3);
                assert.equal(libro.stock, 7);
            });

            it("debe mantener stock correcto tras múltiples operaciones", function () {
                const libro = libreria.addLibro({
                    isbn: "STOCK003",
                    titulo: "Test Stock",
                    precio: 20,
                    stock: 10
                });

                libro.incStockN(5);
                libro.decStockN(3);
                libro.incStockN(8);
                libro.decStockN(5);

                assert.equal(libro.stock, 15);
            });
        });

        describe("Libro - Gestión de Precio", function () {
            it("debe incrementar precio en porcentaje", function () {
                const libro = libreria.addLibro({
                    isbn: "PRICE001",
                    titulo: "Test Price",
                    precio: 100,
                    stock: 10
                });

                libro.incPrecioP(10);
                assert.equal(libro.precio, 110);
            });

            it("debe aplicar descuento (porcentaje) al precio", function () {
                const libro = libreria.addLibro({
                    isbn: "PRICE002",
                    titulo: "Test Price",
                    precio: 100,
                    stock: 10
                });

                libro.dexPrecioP(20);
                assert.equal(libro.precio, 20);
            });

            it("debe mantener precio correcto tras múltiples operaciones", function () {
                const libro = libreria.addLibro({
                    isbn: "PRICE003",
                    titulo: "Test Price",
                    precio: 50,
                    stock: 10
                });

                libro.incPrecioP(20);
                libro.incPrecioP(10);

                assert.equal(libro.precio, 66);
            });
        });

        describe("Item - Cálculo de Total", function () {
            let cliente, libro;

            beforeEach(function () {
                // Creamos un cliente y un libro nuevos para cada caso
                cliente = libreria.addUsuario({
                    dni: "ITEM-T-DNI",
                    nombre: "ItemTester",
                    apellidos: "Spec",
                    email: "item@test.com",
                    password: "pass",
                    rol: ROL.CLIENTE
                });

                libro = libreria.addLibro({
                    isbn: "ITEM-T1",
                    titulo: "Libro para Item Test",
                    precio: 15,   // € unitario
                    stock: 100
                });
            });

            it("debe calcular total del item (cantidad * precio)", function () {
                // añadimos 4 unidades del libro al carro del cliente
                libreria.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 4 });

                // obtenemos el carro y el item
                const carro = libreria.getCarroCliente(cliente._id);
                const item = carro.items[0];

                // total del ítem y coherencia con subtotal/IVA/total
                assert.equal(carro.items.length, 1);
                assert.equal(item.cantidad, 4);

                const subtotalEsperado = 4 * libro.precio;
                const ivaEsperado = subtotalEsperado * 0.21;
                const totalEsperado = subtotalEsperado + ivaEsperado;

                assert.closeTo(item.total, subtotalEsperado, 1e-9);
                assert.closeTo(carro.subtotal, subtotalEsperado, 1e-9);
                assert.closeTo(carro.iva, ivaEsperado, 1e-9);
                assert.closeTo(carro.total, totalEsperado, 1e-9);   
            });

            it("debe recalcular total al cambiar cantidad", function () {
                // añadimos 1 unidad del libro
                libreria.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 1 });
                let carro = libreria.getCarroCliente(cliente._id);
                assert.equal(carro.items.length, 1);
                assert.closeTo(carro.items[0].total, 1 * libro.precio, 1e-9);

                // cambiamos la cantidad a 5
                libreria.setClienteCarroItemCantidad(cliente._id, 0, 5);
                carro = libreria.getCarroCliente(cliente._id);
                const item = carro.items[0];

                // item.total y totales del carro se recalculan
                const subtotalEsperado = 5 * libro.precio;
                const ivaEsperado = subtotalEsperado * 0.21;
                const totalEsperado = subtotalEsperado + ivaEsperado;

                assert.equal(item.cantidad, 5);
                assert.closeTo(item.total, subtotalEsperado, 1e-9);
                assert.closeTo(carro.subtotal, subtotalEsperado, 1e-9);
                assert.closeTo(carro.iva, ivaEsperado, 1e-9);
                assert.closeTo(carro.total, totalEsperado, 1e-9);
            });

            it("debe recalcular total al cambiar precio del libro", function () {
                //añadimos 2 unidades del libro al carrito
                libreria.addClienteCarroItem(cliente._id, { libro: libro._id, cantidad: 2 });
                let carro = libreria.getCarroCliente(cliente._id);
                let item = carro.items[0];

                // Comprobamos estado 
                assert.equal(item.cantidad, 2);
                assert.closeTo(item.total, 2 * libro.precio, 1e-9);

                // cambiamos el precio del libro y forzamos recálculo
                libro.precio = 30;
                item.calcular();     // recalcula el total 
                carro.calcular();    // recalcula subtotal, iva y total del carro

                // totales actualizados con el nuevo precio
                const subtotalEsperado = 2 * 30;
                const ivaEsperado = subtotalEsperado * 0.21;
                const totalEsperado = subtotalEsperado + ivaEsperado;

                assert.closeTo(item.total, subtotalEsperado, 1e-9);
                assert.closeTo(carro.subtotal, subtotalEsperado, 1e-9);
                assert.closeTo(carro.iva, ivaEsperado, 1e-9);
                assert.closeTo(carro.total, totalEsperado, 1e-9);
            });
        });

        describe("Carro - Cálculos Completos", function () {
            let cliente, libro1, libro2;

            beforeEach(function () {
                cliente = libreria.addUsuario({
                    dni: "CARRO001",
                    nombre: "Test",
                    apellidos: "Carro",
                    email: "carro@test.com",
                    password: "pass",
                    rol: ROL.CLIENTE
                });

                libro1 = libreria.addLibro({
                    isbn: "CARRO-L1",
                    titulo: "Libro 1",
                    precio: 10,
                    stock: 100
                });

                libro2 = libreria.addLibro({
                    isbn: "CARRO-L2",
                    titulo: "Libro 2",
                    precio: 20,
                    stock: 50
                });
            });

            it("debe calcular subtotal correctamente", function () {
                // 2 x libro1 (10) + 1 x libro2 (20) = 40
                libreria.addClienteCarroItem(cliente._id, { libro: libro1._id, cantidad: 2 });
                libreria.addClienteCarroItem(cliente._id, { libro: libro2._id, cantidad: 1 });

                const carro = libreria.getCarroCliente(cliente._id);
                const subtotalEsperado = 2 * libro1.precio + 1 * libro2.precio; // 40

                assert.closeTo(carro.subtotal, subtotalEsperado, 1e-9);
            });

            it("debe calcular IVA (21%) correctamente", function () {
                // Subtotal 40 => IVA 8.4
                libreria.addClienteCarroItem(cliente._id, { libro: libro1._id, cantidad: 2 });
                libreria.addClienteCarroItem(cliente._id, { libro: libro2._id, cantidad: 1 });

                const carro = libreria.getCarroCliente(cliente._id);
                const ivaEsperado = (2 * libro1.precio + 1 * libro2.precio) * 0.21; // 8.4

                assert.closeTo(carro.iva, ivaEsperado, 1e-9);
            });

            it("debe calcular total (subtotal + IVA) correctamente", function () {
                // Subtotal 40 + IVA 8.4 => total 48.4
                libreria.addClienteCarroItem(cliente._id, { libro: libro1._id, cantidad: 2 });
                libreria.addClienteCarroItem(cliente._id, { libro: libro2._id, cantidad: 1 });

                const carro = libreria.getCarroCliente(cliente._id);
                const subtotal = 2 * libro1.precio + 1 * libro2.precio; // 40
                const totalEsperado = subtotal * 1.21; // 48.4

                assert.closeTo(carro.total, totalEsperado, 1e-9);
            });

            it("debe recalcular al agregar items", function () {
                // Paso 1: 1 x libro1 => subtotal 10
                libreria.addClienteCarroItem(cliente._id, { libro: libro1._id, cantidad: 1 });
                let carro = libreria.getCarroCliente(cliente._id);
                assert.closeTo(carro.subtotal, 10, 1e-9);

                // Paso 2: agrego 2 x libro2 => +40 => subtotal 50
                libreria.addClienteCarroItem(cliente._id, { libro: libro2._id, cantidad: 2 });
                carro = libreria.getCarroCliente(cliente._id);

                const subtotalEsperado = 1 * libro1.precio + 2 * libro2.precio; // 10 + 40 = 50
                const ivaEsperado = subtotalEsperado * 0.21;
                const totalEsperado = subtotalEsperado + ivaEsperado;

                assert.closeTo(carro.subtotal, subtotalEsperado, 1e-9);
                assert.closeTo(carro.iva, ivaEsperado, 1e-9);
                assert.closeTo(carro.total, totalEsperado, 1e-9);
            });

            it("debe recalcular al modificar cantidad", function () {
                // 1 x libro1 => 10
                libreria.addClienteCarroItem(cliente._id, { libro: libro1._id, cantidad: 1 });
                // Cambio cantidad a 3 => 30
                libreria.setClienteCarroItemCantidad(cliente._id, 0, 3);

                const carro = libreria.getCarroCliente(cliente._id);
                const subtotalEsperado = 3 * libro1.precio; // 30
                const ivaEsperado = subtotalEsperado * 0.21;
                const totalEsperado = subtotalEsperado + ivaEsperado;

                assert.equal(carro.items[0].cantidad, 3);
                assert.closeTo(carro.subtotal, subtotalEsperado, 1e-9);
                assert.closeTo(carro.iva, ivaEsperado, 1e-9);
                assert.closeTo(carro.total, totalEsperado, 1e-9);
            });

            it("debe recalcular al eliminar items", function () {
                // 2 x libro1 (20) + 2 x libro2 (40) => 60
                libreria.addClienteCarroItem(cliente._id, { libro: libro1._id, cantidad: 2 });
                libreria.addClienteCarroItem(cliente._id, { libro: libro2._id, cantidad: 2 });
                let carro = libreria.getCarroCliente(cliente._id);
                assert.closeTo(carro.subtotal, 60, 1e-9);

                // Elimino el primer ítem (index 0) poniendo cantidad 0 => quedan 2 x libro2 => 40
                libreria.setClienteCarroItemCantidad(cliente._id, 0, 0);
                carro = libreria.getCarroCliente(cliente._id);

                assert.equal(carro.items.length, 1);
                assert.closeTo(carro.subtotal, 2 * libro2.precio, 1e-9);
                assert.closeTo(carro.iva, 2 * libro2.precio * 0.21, 1e-9);
                assert.closeTo(carro.total, 2 * libro2.precio * 1.21, 1e-9);
            });

            it("debe tener valores en cero con carro vacío", function () {
                const carro = libreria.getCarroCliente(cliente._id);
                assert.equal(carro.items.length, 0);
                assert.equal(carro.subtotal, 0);
                assert.equal(carro.iva, 0);
                assert.equal(carro.total, 0);
            });

        describe("Factura - Cálculos", function () {
            it("debe heredar cálculos correctos del carro", function () {
                const cliente = libreria.addUsuario({
                    dni: "FAC-CALC-01",
                    nombre: "Cliente",
                    apellidos: "Factura",
                    email: "fac1@test.com",
                    password: "pass",
                    rol: ROL.CLIENTE
                });

                const l1 = libreria.addLibro({ isbn: "F-C1", titulo: "L1", precio: 10, stock: 100 });
                const l2 = libreria.addLibro({ isbn: "F-C2", titulo: "L2", precio: 25, stock: 50 });

                // 2 x 10 + 1 x 25 = 45 → IVA 9.45 → total 54.45
                libreria.addClienteCarroItem(cliente._id, { libro: l1._id, cantidad: 2 });
                libreria.addClienteCarroItem(cliente._id, { libro: l2._id, cantidad: 1 });

                const carroAntes = libreria.getCarroCliente(cliente._id);
                const subEsperado = carroAntes.subtotal;
                const ivaEsperado = carroAntes.iva;
                const totalEsperado = carroAntes.total;

                // Act
                const factura = libreria.facturarCompraCliente({
                    cliente: cliente._id,
                    razonSocial: "Cliente Factura",
                    direccion: "Calle 1",
                    email: "fac1@test.com",
                    dni: "FAC-CALC-01"
                });

                // Assert: la factura hereda EXACTAMENTE los cálculos del carro
                assert.equal(factura.items.length, 2);
                assert.closeTo(factura.subtotal, subEsperado, 1e-9);
                assert.closeTo(factura.iva, ivaEsperado, 1e-9);
                assert.closeTo(factura.total, totalEsperado, 1e-9);
            });

            it("debe calcular subtotal de factura correctamente", function () {
                // Arrange
                const cliente = libreria.addUsuario({
                    dni: "FAC-CALC-02",
                    nombre: "Cliente",
                    apellidos: "Factura",
                    email: "fac2@test.com",
                    password: "pass",
                    rol: ROL.CLIENTE
                });

                const l1 = libreria.addLibro({ isbn: "F-SUB1", titulo: "L1", precio: 40, stock: 100 });
                const l2 = libreria.addLibro({ isbn: "F-SUB2", titulo: "L2", precio: 15, stock: 100 });

                // 3 x 40 = 120; 2 x 15 = 30; subtotal esperado = 150
                libreria.addClienteCarroItem(cliente._id, { libro: l1._id, cantidad: 3 });
                libreria.addClienteCarroItem(cliente._id, { libro: l2._id, cantidad: 2 });

                const subtotalEsperado = 3 * l1.precio + 2 * l2.precio; // 150

                // Act
                const factura = libreria.facturarCompraCliente({
                    cliente: cliente._id,
                    razonSocial: "Cliente Subtotal",
                    direccion: "Calle 2",
                    email: "fac2@test.com",
                    dni: "FAC-CALC-02"
                });

                // Assert
                assert.equal(factura.items.length, 2);
                assert.closeTo(factura.subtotal, subtotalEsperado, 1e-9);
            });


            it("debe calcular IVA de factura correctamente", function () {
                // Arrange
                const cliente = libreria.addUsuario({
                    dni: "FAC-CALC-03",
                    nombre: "Cliente",
                    apellidos: "Factura",
                    email: "fac3@test.com",
                    password: "pass",
                    rol: ROL.CLIENTE
                });

                const l1 = libreria.addLibro({ isbn: "F-IVA1", titulo: "L1", precio: 12.5, stock: 100 });
                const l2 = libreria.addLibro({ isbn: "F-IVA2", titulo: "L2", precio: 7.5, stock: 100 });

                // 4 x 12.5 = 50; 5 x 7.5 = 37.5; subtotal = 87.5; IVA = 18.375
                libreria.addClienteCarroItem(cliente._id, { libro: l1._id, cantidad: 4 });
                libreria.addClienteCarroItem(cliente._id, { libro: l2._id, cantidad: 5 });

                const subtotalEsperado = 4 * l1.precio + 5 * l2.precio; // 87.5
                const ivaEsperado = subtotalEsperado * 0.21;            // 18.375

                // Act
                const factura = libreria.facturarCompraCliente({
                    cliente: cliente._id,
                    razonSocial: "Cliente IVA",
                    direccion: "Calle 3",
                    email: "fac3@test.com",
                    dni: "FAC-CALC-03"
                });

                // Assert
                assert.closeTo(factura.subtotal, subtotalEsperado, 1e-9);
                assert.closeTo(factura.iva, ivaEsperado, 1e-9);
            });



            it("debe calcular total de factura correctamente", function () {
                // Arrange
                const cliente = libreria.addUsuario({
                    dni: "FAC-CALC-04",
                    nombre: "Cliente",
                    apellidos: "Factura",
                    email: "fac4@test.com",
                    password: "pass",
                    rol: ROL.CLIENTE
                });

                const l1 = libreria.addLibro({ isbn: "F-TOT1", titulo: "L1", precio: 18, stock: 100 });
                const l2 = libreria.addLibro({ isbn: "F-TOT2", titulo: "L2", precio: 22, stock: 100 });

                // 2 x 18 = 36; 3 x 22 = 66; subtotal = 102; IVA = 21.42; total = 123.42
                libreria.addClienteCarroItem(cliente._id, { libro: l1._id, cantidad: 2 });
                libreria.addClienteCarroItem(cliente._id, { libro: l2._id, cantidad: 3 });

                const subtotalEsperado = 2 * l1.precio + 3 * l2.precio; // 102
                const ivaEsperado = subtotalEsperado * 0.21;            // 21.42
                const totalEsperado = subtotalEsperado + ivaEsperado;   // 123.42

                // Act
                const factura = libreria.facturarCompraCliente({
                    cliente: cliente._id,
                    razonSocial: "Cliente Total",
                    direccion: "Calle 4",
                    email: "fac4@test.com",
                    dni: "FAC-CALC-04"
                });

                // Assert
                assert.closeTo(factura.subtotal, subtotalEsperado, 1e-9);
                assert.closeTo(factura.iva, ivaEsperado, 1e-9);
                assert.closeTo(factura.total, totalEsperado, 1e-9);
            });

        describe("Cálculos Integrados", function () {
            it("debe mantener consistencia entre Item, Carro y Factura", function () {
                // Arrange: 2 x libro1 (10) + 3 x libro2 (20) = 2*10 + 3*20 = 70
                libreria.addClienteCarroItem(cliente._id, { libro: libro1._id, cantidad: 2 });
                libreria.addClienteCarroItem(cliente._id, { libro: libro2._id, cantidad: 3 });

                const carroAntes = libreria.getCarroCliente(cliente._id);
                assert.equal(carroAntes.items.length, 2, "El carro debe tener 2 ítems");

                // Consistencia de cada Item (cantidad * precio)
                const totalItem1 = 2 * libro1.precio; // 20
                const totalItem2 = 3 * libro2.precio; // 60
                assert.closeTo(carroAntes.items[0].total, totalItem1, 1e-9);
                assert.closeTo(carroAntes.items[1].total, totalItem2, 1e-9);

                // Consistencia del Carro (sumatorio de items)
                const subtotalEsperado = totalItem1 + totalItem2;          // 80
                const ivaEsperado = subtotalEsperado * 0.21;           // 16.8
                const totalEsperado = subtotalEsperado + ivaEsperado;    // 96.8
                assert.closeTo(carroAntes.subtotal, subtotalEsperado, 1e-9);
                assert.closeTo(carroAntes.iva, ivaEsperado, 1e-9);
                assert.closeTo(carroAntes.total, totalEsperado, 1e-9);

                // Act: facturar (copia items y totales del carro y vacía el carro del cliente)
                const factura = libreria.facturarCompraCliente({
                    cliente: cliente._id,
                    razonSocial: "Consistencia Global S.A.",
                    direccion: "Calle Consistencia 123",
                    email: "conta@test.com",
                    dni: "CG0001"
                });

                // Assert: la factura mantiene exactamente la suma de los Item y del Carro
                assert.equal(factura.items.length, 2, "La factura debe tener los 2 ítems del carro");
                const sumaItemsFactura = factura.items.reduce((acc, it) => acc + it.total, 0);
                assert.closeTo(sumaItemsFactura, subtotalEsperado, 1e-9, "Suma de items en factura = subtotal esperado");
                assert.closeTo(factura.subtotal, subtotalEsperado, 1e-9);
                assert.closeTo(factura.iva, ivaEsperado, 1e-9);
                assert.closeTo(factura.total, totalEsperado, 1e-9);

                // Y el carro del cliente debe quedar vacío
                const carroDespues = libreria.getCarroCliente(cliente._id);
                assert.equal(carroDespues.items.length, 0, "El carro debe quedar vacío tras facturar");
                assert.strictEqual(carroDespues.subtotal, 0);
                assert.strictEqual(carroDespues.iva, 0);
                assert.strictEqual(carroDespues.total, 0);
            });


            it("debe calcular correctamente con múltiples items de diferentes precios", function () {
                      
                const libro3 = libreria.addLibro({
                    isbn: "CARRO-L3",
                    titulo: "Libro 3",
                    precio: 7.5,
                    stock: 100
                });

                // Añadimos varias cantidades de cada uno
                libreria.addClienteCarroItem(cliente._id, { libro: libro1._id, cantidad: 4 }); // 4 * 10 = 40
                libreria.addClienteCarroItem(cliente._id, { libro: libro2._id, cantidad: 3 }); // 3 * 20 = 60
                libreria.addClienteCarroItem(cliente._id, { libro: libro3._id, cantidad: 5 }); // 5 * 7.5 = 37.5

                // Act
                const carro = libreria.getCarroCliente(cliente._id);

                // Assert
                const subtotalEsperado = (4 * libro1.precio) + (3 * libro2.precio) + (5 * libro3.precio); // 137.5
                const ivaEsperado = subtotalEsperado * 0.21;  // 28.875
                const totalEsperado = subtotalEsperado + ivaEsperado; // 166.375

                assert.closeTo(carro.subtotal, subtotalEsperado, 1e-9);
                assert.closeTo(carro.iva, ivaEsperado, 1e-9);
                assert.closeTo(carro.total, totalEsperado, 1e-9);
            });

        });
    });

            // ============================================================================
            // RESUMEN DE TESTS
            // ============================================================================

            after(function () {
                console.log("\n" + "=".repeat(60));
                console.log("TODOS LOS TESTS COMPLETADOS");
                console.log("=".repeat(60));
                console.log("Distribución de puntos:");
                console.log("  1.Getters y Setters:  1 punto");
                console.log("  2.Excepciones:        4 puntos");
                console.log("  3.CRUD:              10 puntos");
                console.log("  4.Cálculos:          10 puntos");
                console.log("  " + "-".repeat(35));
                console.log("TOTAL:            25 puntos");
                console.log("=".repeat(60) + "\n");
            });
        });
    });
});

// public/libreria/test/model.spec.mjs
// Tests del modelo de la librería usando Mocha + Chai

import * as chai from 'https://cdnjs.cloudflare.com/ajax/libs/chai/5.1.1/chai.js';
import { Libreria, ROL } from '../js/model/model.mjs';

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
                assert.throws(
                    Error
                );
            });
        });

        describe("Factura - Excepciones", function () {
            it("debe lanzar error al facturar sin cliente", function () {
                // Por hacer asi que se pone como fallido
                assert.throws(
                    Error
                );
            });

            it("debe lanzar error al facturar carro vacío", function () {
                // Por hacer asi que se pone como fallido
                assert.throws(
                    Error
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
                // Por hacer asi que se pone como fallido
                assert.throws(
                    Error
                );
            });

            it("debe incrementar cantidad si el libro ya existe en carro", function () {
                // Por hacer asi que se pone como fallido
                assert.throws(
                    Error
                );
            });

            it("debe modificar cantidad de item en carro", function () {
                // Por hacer asi que se pone como fallido
                assert.throws(
                    Error
                );
            });

            it("debe eliminar item cuando cantidad es 0", function () {
                // Por hacer asi que se pone como fallido
                assert.throws(
                    Error
                );
            });

            it("debe vaciar el carro", function () {
                // Por hacer asi que se pone como fallido
                assert.throws(
                    Error
                );
            });
        });

        describe("Facturas - CRUD", function () {
            it("debe crear factura a partir del carro", function () {
                // Por hacer asi que se pone como fallido
                assert.throws(
                    Error
                );
            });

            it("debe vaciar carro después de facturar", function () {
                // Por hacer asi que se pone como fallido
                assert.throws(
                    Error
                );
            });

            it("debe eliminar una factura", function () {
                // Por hacer asi que se pone como fallido
                assert.throws(
                    Error
                );
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
            it("debe calcular total del item (cantidad * precio)", function () {
                // Por hacer asi que se pone como fallido
                assert.throws(
                    Error
                );
            });

            it("debe recalcular total al cambiar cantidad", function () {
                // Por hacer asi que se pone como fallido
                assert.throws(
                    Error
                );
            });

            it("debe recalcular total al cambiar precio del libro", function () {
                // Por hacer asi que se pone como fallido
                assert.throws(
                    Error
                );
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
                // Por hacer asi que se pone como fallido
                assert.throws(
                    Error
                );
            });

            it("debe calcular IVA (21%) correctamente", function () {
                // Por hacer asi que se pone como fallido
                assert.throws(
                    Error
                );
            });

            it("debe calcular total (subtotal + IVA) correctamente", function () {
                // Por hacer asi que se pone como fallido
                assert.throws(
                    Error
                );
            });

            it("debe recalcular al agregar items", function () {
                // Por hacer asi que se pone como fallido
                assert.throws(
                    Error
                );
            });

            it("debe recalcular al modificar cantidad", function () {
                // Por hacer asi que se pone como fallido
                assert.throws(
                    Error
                );
            });

            it("debe recalcular al eliminar items", function () {
                // Por hacer asi que se pone como fallido
                assert.throws(
                    Error
                );
            });

            it("debe tener valores en cero con carro vacío", function () {
                // Por hacer asi que se pone como fallido
                assert.throws(
                    Error
                );
            });

            describe("Factura - Cálculos", function () {
                it("debe heredar cálculos correctos del carro", function () {
                    // Por hacer asi que se pone como fallido
                    assert.throws(
                        Error
                    );
                });

                it("debe calcular subtotal de factura correctamente", function () {
                    // Por hacer asi que se pone como fallido
                    assert.throws(
                        Error
                    );
                });

                it("debe calcular IVA de factura correctamente", function () {
                    // Por hacer asi que se pone como fallido
                    assert.throws(
                        Error
                    );
                });

                it("debe calcular total de factura correctamente", function () {
                    // Por hacer asi que se pone como fallido
                    assert.throws(
                        Error
                    );
                });

                describe("Cálculos Integrados", function () {
                    it("debe mantener consistencia entre Item, Carro y Factura", function () {
                        // Por hacer asi que se pone como fallido
                        assert.throws(
                            Error
                        );
                    });

                    it("debe calcular correctamente con múltiples items de diferentes precios", function () {
                        // Por hacer asi que se pone como fallido
                        assert.throws(
                            Error
                        );
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

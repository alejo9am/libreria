import * as chaiModule from "chai";
import chaiHttp from "chai-http";
import { app } from "../app.mjs";
const chai = chaiModule.use(chaiHttp);
const assert = chai.assert;
const URL = '/api';

import { model, ROL } from "../model/model.mjs";
import { Libro } from "../model/libro.mjs";
import { Usuario } from "../model/usuario.mjs";
import { Carro } from "../model/carro.mjs";
import { Factura } from "../model/factura.mjs";
import { Item } from "../model/item.mjs";
import mongoose from 'mongoose';
import { MONGODB_URI } from "../config.mjs";

/* ==================== FUNCIONES AUXILIARES ==================== */

function crearLibro(isbn) {
    return {
        isbn: `${isbn}`,
        titulo: `TITULO_${isbn}`,
        autores: `AUTOR_A${isbn}; AUTOR_B${isbn}`,
        resumen: `Lorem ipsum dolor sit amet...`,
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

const ISBNS = ['978-3-16-148410-0', '978-3-16-148410-1', '978-3-16-148410-2', '978-3-16-148410-3', '978-3-16-148410-4'];


describe("REST libreria", function () {

    /* ==================== STATE MANAGEMENT ==================== */

    let backup = {};

    before(async function () {
        // Conectar a la BBDD si no está conectada
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(MONGODB_URI);
        }

        // Backup de la BBDD
        backup.libros = await Libro.find({}).lean();
        backup.usuarios = await Usuario.find({}).lean();
        backup.carros = await Carro.find({}).lean();
        backup.facturas = await Factura.find({}).lean();
        backup.items = await Item.find({}).lean();

        // Limpiar BBDD
        await Libro.deleteMany({});
        await Usuario.deleteMany({});
        await Carro.deleteMany({});
        await Factura.deleteMany({});
        await Item.deleteMany({});
    });

    beforeEach(async function () {
        // Limpiar BBDD antes de cada test
        await Libro.deleteMany({});
        await Usuario.deleteMany({});
        await Carro.deleteMany({});
        await Factura.deleteMany({});
        await Item.deleteMany({});
    });

    after(async function () {
        // Limpiar BBDD (borrar datos del último test)
        await Libro.deleteMany({});
        await Usuario.deleteMany({});
        await Carro.deleteMany({});
        await Factura.deleteMany({});
        await Item.deleteMany({});

        // Restaurar backup
        await Libro.insertMany(backup.libros);
        await Usuario.insertMany(backup.usuarios);
        await Carro.insertMany(backup.carros);
        await Factura.insertMany(backup.facturas);
        await Item.insertMany(backup.items);

        await mongoose.disconnect();
    });

    /* ==================== TESTS LIBROS ==================== */
    describe("libros", function () {
        beforeEach(async function () {
            let requester = chai.request(app).keepOpen();
            let request = requester.put(`/api/libros`);
            let response = await request.send([]);
            assert.equal(response.status, 200);
            assert.isTrue(response.ok);
            requester.close();
        });

        it(`PUT ${URL}/libros`, async () => {
            let requester = chai.request(app).keepOpen();
            let request = requester.get(`/api/libros`);
            let response = await request.send();
            assert.equal(response.status, 200);
            assert.isTrue(response.ok);
            let libros = response.body;
            assert.equal(0, libros.length);
            let libros_esperados = ISBNS.map(isbn => crearLibro(isbn));
            // libros_esperados.forEach((l, i) => l._id = i + 1); // REMOVED
            request = requester.put(`/api/libros`);
            response = await request.send(libros_esperados);
            assert.equal(response.status, 200);
            assert.isTrue(response.ok);
            libros = response.body;
            assert.equal(libros_esperados.length, libros.length);
            libros_esperados.forEach(esperado => {
                let actual = libros.find(l => l.isbn == esperado.isbn);
                assert.isDefined(actual._id, "El _id no esta definido"); // CHANGED
                assert.equal(esperado.isbn, actual.isbn, "El isbn no coincide");
                assert.equal(esperado.titulo, actual.titulo, "El titulo no coincide");
                // assert.equal(esperado.resumen, actual.resumen, "El resumen no coincide");
                // assert.equal(esperado.autores, actual.autores, "Los autores no coinciden");
                // assert.equal(esperado.portada, actual.portada, "La portada no coincide");
                assert.equal(esperado.stock, actual.stock, "El stock no coincide");
                assert.equal(esperado.precio, actual.precio, "El precio no coincide");
            });
            requester.close();
        });

        it(`GET ${URL}/libros`, async () => {
            let requester = chai.request(app).keepOpen();
            let request = requester.get(`/api/libros`);
            let response = await request.send();
            assert.equal(response.status, 200);
            assert.isTrue(response.ok);
            let libros = response.body;
            assert.equal(0, libros.length);
            let libros_esperados = ISBNS.map(isbn => crearLibro(isbn));
            request = requester.put(`/api/libros`);
            await request.send(libros_esperados);
            request = requester.get(`/api/libros`);
            response = await request.send();
            assert.equal(response.status, 200);
            assert.isTrue(response.ok);
            libros = response.body;
            assert.equal(libros_esperados.length, libros.length);
            libros_esperados.forEach(esperado => {
                let actual = libros.find(l => l.isbn == esperado.isbn);
                assert.isDefined(actual._id, "El _id no esta definido");
                assert.equal(esperado.isbn, actual.isbn, "El isbn no coincide");
                assert.equal(esperado.titulo, actual.titulo, "El titulo no coincide");
                // assert.equal(esperado.resumen, actual.resumen, "El resumen no coincide");
                // assert.equal(esperado.autores, actual.autores, "Los autores no coinciden");
                // assert.equal(esperado.portada, actual.portada, "La portada no coincide");
                assert.equal(esperado.stock, actual.stock, "El stock no coincide");
                assert.equal(esperado.precio, actual.precio, "El precio no coincide");
            });
            requester.close();
        });

        it(`GET ${URL}/libros/:id`, async () => {
            let requester = chai.request(app).keepOpen();
            let request = requester.get(`/api/libros`);
            let response = await request.send();
            assert.equal(response.status, 200);
            assert.isTrue(response.ok);
            let libros = response.body;
            assert.equal(0, libros.length);

            // Crear libros primero
            let libros_data = ISBNS.map(isbn => crearLibro(isbn));
            request = requester.put(`/api/libros`);
            response = await request.send(libros_data);
            assert.equal(response.status, 200);
            assert.isTrue(response.ok);

            // Obtener los libros creados (con sus IDs reales)
            let librosCreados = response.body;

            let responses = librosCreados.map(async libroCreado => { // Usar libroCreado en lugar de esperado
                request = requester.get(`/api/libros/${libroCreado._id}`);
                response = await request.send();
                assert.equal(response.status, 200);
                assert.isTrue(response.ok);
                let actual = response.body;

                // Encontrar el dato original esperado basado en ISBN para comparar valores
                let esperado = libros_data.find(l => l.isbn === actual.isbn);

                assert.equal(esperado.isbn, actual.isbn, "El isbn no coincide");
                assert.equal(esperado.titulo, actual.titulo, "El titulo no coincide");
                // assert.equal(esperado.resumen, actual.resumen, "El resumen no coincide");
                // assert.equal(esperado.autores, actual.autores, "Los autores no coinciden");
                // assert.equal(esperado.portada, actual.portada, "La portada no coincide");
                assert.equal(esperado.stock, actual.stock, "El stock no coincide");
                assert.equal(esperado.precio, actual.precio, "El precio no coincide");
                assert.equal(libroCreado._id, actual._id, "El _id no coincide");
            });
            await Promise.all(responses);
            requester.close();
        });

        it(`POST ${URL}/libros`, async () => {
            let requester = chai.request(app).keepOpen();
            let libro = crearLibro('978-1-23-456789-0');
            let request = requester.post(`/api/libros`);
            let response = await request.send(libro);
            assert.equal(response.status, 201);
            assert.isTrue(response.ok);
            let libroCreado = response.body;
            assert.isDefined(libroCreado._id);
            assert.equal(libro.isbn, libroCreado.isbn);
            assert.equal(libro.titulo, libroCreado.titulo);
            requester.close();
        });

        it(`PUT ${URL}/libros/:id`, async () => {
            let requester = chai.request(app).keepOpen();
            let libros = ISBNS.map(isbn => crearLibro(isbn));
            let request = requester.put(`/api/libros`);
            let response = await request.send(libros);
            let libro = response.body[0];
            libro.titulo = 'Título Modificado';
            libro.precio = 99.99;
            request = requester.put(`/api/libros/${libro._id}`);
            response = await request.send(libro);
            assert.equal(response.status, 200);
            let libroActualizado = response.body;
            assert.equal(libroActualizado.titulo, 'Título Modificado');
            assert.equal(libroActualizado.precio, 99.99);
            requester.close();
        });

        it(`DELETE ${URL}/libros/:id`, async () => {
            let requester = chai.request(app).keepOpen();
            let libros = ISBNS.map(isbn => crearLibro(isbn));
            let request = requester.put(`/api/libros`);
            let response = await request.send(libros);
            let libro = response.body[0];
            request = requester.delete(`/api/libros/${libro._id}`);
            response = await request.send();
            assert.equal(response.status, 200);
            assert.isTrue(response.body.ok);
            request = requester.get(`/api/libros/${libro._id}`);
            response = await request.send();
            assert.equal(response.status, 404);
            requester.close();
        });

        it(`GET ${URL}/libros?isbn=...`, async () => {
            let requester = chai.request(app).keepOpen();
            let libros = ISBNS.map(isbn => crearLibro(isbn));
            let request = requester.put(`/api/libros`);
            await request.send(libros);
            let isbnBuscado = ISBNS[0];
            request = requester.get(`/api/libros?isbn=${isbnBuscado}`);
            let response = await request.send();
            assert.equal(response.status, 200);
            assert.equal(response.body.isbn, isbnBuscado);
            requester.close();
        });
    });

    /* ==================== TESTS CLIENTES ==================== */
    describe("clientes", function () {
        beforeEach(async function () {
            let requester = chai.request(app).keepOpen();
            let request = requester.put(`/api/clientes`);
            let response = await request.send([]);
            assert.equal(response.status, 200);
            assert.isTrue(response.ok);
            requester.close();
        });

        it(`PUT ${URL}/clientes`, async () => {
            let requester = chai.request(app).keepOpen();
            let clientes_esperados = [];
            for (let i = 0; i < 5; i++) {
                clientes_esperados.push(crearCliente(`0000000${i}C`));
            }
            let request = requester.put(`/api/clientes`);
            let response = await request.send(clientes_esperados);
            assert.equal(response.status, 200);
            let clientes = response.body;
            assert.equal(clientes_esperados.length, clientes.length);
            clientes_esperados.forEach(esperado => {
                let actual = clientes.find(c => c.email == esperado.email);
                assert.isDefined(actual, "Cliente no encontrado");
                assert.equal(esperado.dni, actual.dni);
                assert.equal(esperado.nombre, actual.nombre);
                assert.isUndefined(actual.password, "La contraseña no debe devolverse");
                assert.isDefined(actual._id, "El _id no está definido");
            });
            requester.close();
        });

        it(`GET ${URL}/clientes`, async () => {
            let requester = chai.request(app).keepOpen();
            let clientes_esperados = [];
            for (let i = 0; i < 5; i++) {
                clientes_esperados.push(crearCliente(`0000000${i}C`));
            }
            let request = requester.put(`/api/clientes`);
            await request.send(clientes_esperados);
            request = requester.get(`/api/clientes`);
            let response = await request.send();
            assert.equal(response.status, 200);
            let clientes = response.body;
            assert.equal(clientes_esperados.length, clientes.length);
            requester.close();
        });

        it(`GET ${URL}/clientes/:id`, async () => {
            let requester = chai.request(app).keepOpen();
            let clientes_esperados = [];
            for (let i = 0; i < 5; i++) {
                clientes_esperados.push(crearCliente(`0000000${i}C`));
            }
            let request = requester.put(`/api/clientes`);
            let response = await request.send(clientes_esperados);
            let clientes = response.body;
            let cliente = clientes[0];
            request = requester.get(`/api/clientes/${cliente._id}`);
            response = await request.send();
            assert.equal(response.status, 200);
            assert.equal(response.body._id, cliente._id);
            assert.equal(response.body.email, cliente.email);
            assert.isUndefined(response.body.password);
            requester.close();
        });

        it(`POST ${URL}/clientes`, async () => {
            let requester = chai.request(app).keepOpen();
            let cliente = crearCliente('12345678C');
            let request = requester.post(`/api/clientes`);
            let response = await request.send(cliente);
            assert.equal(response.status, 201);
            let clienteCreado = response.body;
            assert.isDefined(clienteCreado._id);
            assert.equal(cliente.email, clienteCreado.email);
            assert.isUndefined(clienteCreado.password);
            requester.close();
        });

        it(`PUT ${URL}/clientes/:id`, async () => {
            let requester = chai.request(app).keepOpen();
            let cliente = crearCliente('12345678C');
            let request = requester.post(`/api/clientes`);
            let response = await request.send(cliente);
            let clienteCreado = response.body;
            clienteCreado.nombre = 'Nombre Modificado';
            clienteCreado.direccion = 'Nueva Dirección';
            request = requester.put(`/api/clientes/${clienteCreado._id}`);
            response = await request.send(clienteCreado);
            assert.equal(response.status, 200);
            assert.equal(response.body.nombre, 'Nombre Modificado');
            assert.equal(response.body.direccion, 'Nueva Dirección');
            requester.close();
        });

        it(`DELETE ${URL}/clientes/:id`, async () => {
            let requester = chai.request(app).keepOpen();
            let cliente = crearCliente('12345678C');
            let request = requester.post(`/api/clientes`);
            let response = await request.send(cliente);
            let clienteCreado = response.body;
            request = requester.delete(`/api/clientes/${clienteCreado._id}`);
            response = await request.send();
            assert.equal(response.status, 200);
            assert.isTrue(response.body.ok);
            request = requester.get(`/api/clientes/${clienteCreado._id}`);
            response = await request.send();
            assert.equal(response.status, 404);
            requester.close();
        });

        it(`POST ${URL}/clientes/autenticar`, async () => {
            let requester = chai.request(app).keepOpen();
            let cliente = crearCliente('12345678C');
            let request = requester.post(`/api/clientes`);
            await request.send(cliente);
            request = requester.post(`/api/clientes/autenticar`);
            let response = await request.send({
                email: cliente.email,
                password: cliente.password
            });
            assert.equal(response.status, 200);
            assert.equal(response.body.email, cliente.email);
            assert.isUndefined(response.body.password);
            requester.close();
        });

        it(`POST ${URL}/clientes/autenticar - contraseña incorrecta`, async () => {
            let requester = chai.request(app).keepOpen();
            let cliente = crearCliente('12345678C');
            let request = requester.post(`/api/clientes`);
            await request.send(cliente);
            request = requester.post(`/api/clientes/autenticar`);
            let response = await request.send({
                email: cliente.email,
                password: 'contraseña_incorrecta'
            });
            assert.equal(response.status, 401);
            assert.isDefined(response.body.error);
            requester.close();
        });

        it(`GET ${URL}/clientes?email=...`, async () => {
            let requester = chai.request(app).keepOpen();
            let cliente = crearCliente('12345678C');
            let request = requester.post(`/api/clientes`);
            await request.send(cliente);
            request = requester.get(`/api/clientes?email=${cliente.email}`);
            let response = await request.send();
            assert.equal(response.status, 200);
            assert.equal(response.body.email, cliente.email);
            requester.close();
        });
    });

    /* ==================== TESTS CARRITO ==================== */
    describe("carrito", function () {
        let clienteId;
        let libros;

        beforeEach(async function () {
            let requester = chai.request(app).keepOpen();

            // Limpiar clientes y libros
            let request = requester.put(`/api/clientes`);
            await request.send([]);
            request = requester.put(`/api/libros`);
            await request.send([]);

            // Crear un cliente
            let cliente = crearCliente('12345678C');
            request = requester.post(`/api/clientes`);
            let response = await request.send(cliente);
            clienteId = response.body._id;

            // Crear libros
            let libros_data = ISBNS.map(isbn => crearLibro(isbn));
            request = requester.put(`/api/libros`);
            response = await request.send(libros_data);
            libros = response.body;

            requester.close();
        });

        it(`GET ${URL}/clientes/:id/carro`, async () => {
            let requester = chai.request(app).keepOpen();
            let request = requester.get(`/api/clientes/${clienteId}/carro`);
            let response = await request.send();
            assert.equal(response.status, 200);
            assert.isDefined(response.body.items);
            assert.equal(response.body.items.length, 0);
            assert.equal(response.body.total, 0);
            requester.close();
        });

        it(`POST ${URL}/clientes/:id/carro/items`, async () => {
            let requester = chai.request(app).keepOpen();
            let libro = libros[0];
            let request = requester.post(`/api/clientes/${clienteId}/carro/items`);
            let response = await request.send({
                libro: libro._id,
                cantidad: 2
            });
            assert.equal(response.status, 200);
            assert.equal(response.body.items.length, 1);
            assert.equal(response.body.items[0].cantidad, 2);
            assert.equal(response.body.items[0].libro._id, libro._id);
            assert.isAbove(response.body.total, 0);
            requester.close();
        });

        it(`PUT ${URL}/clientes/:id/carro/items/:index`, async () => {
            let requester = chai.request(app).keepOpen();
            let libro = libros[0];

            // Agregar item al carrito
            let request = requester.post(`/api/clientes/${clienteId}/carro/items`);
            await request.send({
                libro: libro._id,
                cantidad: 2
            });

            // Actualizar cantidad
            request = requester.put(`/api/clientes/${clienteId}/carro/items/0`);
            let response = await request.send({ cantidad: 5 });
            assert.equal(response.status, 200);
            assert.equal(response.body.items[0].cantidad, 5);
            requester.close();
        });

        it(`PUT ${URL}/clientes/:id/carro/items/:index - eliminar con cantidad 0`, async () => {
            let requester = chai.request(app).keepOpen();
            let libro = libros[0];

            // Agregar item al carrito
            let request = requester.post(`/api/clientes/${clienteId}/carro/items`);
            await request.send({
                libro: libro._id,
                cantidad: 2
            });

            // Eliminar con cantidad 0
            request = requester.put(`/api/clientes/${clienteId}/carro/items/0`);
            let response = await request.send({ cantidad: 0 });
            assert.equal(response.status, 200);
            assert.equal(response.body.items.length, 0);
            requester.close();
        });
    });

    /* ==================== TESTS ADMINISTRADORES ==================== */
    describe("administradores", function () {
        beforeEach(async function () {
            let requester = chai.request(app).keepOpen();
            let request = requester.put(`/api/admins`);
            let response = await request.send([]);
            assert.equal(response.status, 200);
            assert.isTrue(response.ok);
            requester.close();
        });

        it(`PUT ${URL}/admins`, async () => {
            let requester = chai.request(app).keepOpen();
            let admins_esperados = [];
            for (let i = 0; i < 5; i++) {
                admins_esperados.push(crearAdmin(`0000000${i}A`));
            }
            let request = requester.put(`/api/admins`);
            let response = await request.send(admins_esperados);
            assert.equal(response.status, 200);
            let admins = response.body;
            assert.equal(admins_esperados.length, admins.length);
            admins_esperados.forEach(esperado => {
                let actual = admins.find(a => a.email == esperado.email);
                assert.isDefined(actual, "Admin no encontrado");
                assert.equal(esperado.dni, actual.dni);
                assert.equal(esperado.nombre, actual.nombre);
                assert.isUndefined(actual.password, "La contraseña no debe devolverse");
            });
            requester.close();
        });

        it(`GET ${URL}/admins`, async () => {
            let requester = chai.request(app).keepOpen();
            let admins_esperados = [];
            for (let i = 0; i < 5; i++) {
                admins_esperados.push(crearAdmin(`0000000${i}A`));
            }
            let request = requester.put(`/api/admins`);
            await request.send(admins_esperados);
            request = requester.get(`/api/admins`);
            let response = await request.send();
            assert.equal(response.status, 200);
            let admins = response.body;
            assert.equal(admins_esperados.length, admins.length);
            requester.close();
        });

        it(`GET ${URL}/admins/:id`, async () => {
            let requester = chai.request(app).keepOpen();
            let admin = crearAdmin('00000000A');
            let request = requester.post(`/api/admins`);
            let response = await request.send(admin);
            let adminCreado = response.body;
            request = requester.get(`/api/admins/${adminCreado._id}`);
            response = await request.send();
            assert.equal(response.status, 200);
            assert.equal(response.body._id, adminCreado._id);
            assert.equal(response.body.email, adminCreado.email);
            assert.isUndefined(response.body.password);
            requester.close();
        });

        it(`POST ${URL}/admins`, async () => {
            let requester = chai.request(app).keepOpen();
            let admin = crearAdmin('12345678A');
            let request = requester.post(`/api/admins`);
            let response = await request.send(admin);
            assert.equal(response.status, 201);
            let adminCreado = response.body;
            assert.isDefined(adminCreado._id);
            assert.equal(admin.email, adminCreado.email);
            assert.isUndefined(adminCreado.password);
            requester.close();
        });

        it(`PUT ${URL}/admins/:id`, async () => {
            let requester = chai.request(app).keepOpen();
            let admin = crearAdmin('12345678A');
            let request = requester.post(`/api/admins`);
            let response = await request.send(admin);
            let adminCreado = response.body;
            adminCreado.nombre = 'Admin Modificado';
            adminCreado.direccion = 'Nueva Dirección Admin';
            request = requester.put(`/api/admins/${adminCreado._id}`);
            response = await request.send(adminCreado);
            assert.equal(response.status, 200);
            assert.equal(response.body.nombre, 'Admin Modificado');
            assert.equal(response.body.direccion, 'Nueva Dirección Admin');
            requester.close();
        });

        it(`DELETE ${URL}/admins/:id`, async () => {
            let requester = chai.request(app).keepOpen();
            let admin = crearAdmin('12345678A');
            let request = requester.post(`/api/admins`);
            let response = await request.send(admin);
            let adminCreado = response.body;
            request = requester.delete(`/api/admins/${adminCreado._id}`);
            response = await request.send();
            assert.equal(response.status, 200);
            assert.isTrue(response.body.ok);
            request = requester.get(`/api/admins/${adminCreado._id}`);
            response = await request.send();
            assert.equal(response.status, 404);
            requester.close();
        });

        it(`POST ${URL}/admins/autenticar`, async () => {
            let requester = chai.request(app).keepOpen();
            let admin = crearAdmin('12345678A');
            let request = requester.post(`/api/admins`);
            await request.send(admin);
            request = requester.post(`/api/admins/autenticar`);
            let response = await request.send({
                email: admin.email,
                password: admin.password
            });
            assert.equal(response.status, 200);
            assert.equal(response.body.email, admin.email);
            assert.isUndefined(response.body.password);
            requester.close();
        });

        it(`POST ${URL}/admins/autenticar - contraseña incorrecta`, async () => {
            let requester = chai.request(app).keepOpen();
            let admin = crearAdmin('12345678A');
            let request = requester.post(`/api/admins`);
            await request.send(admin);
            request = requester.post(`/api/admins/autenticar`);
            let response = await request.send({
                email: admin.email,
                password: 'contraseña_incorrecta'
            });
            assert.equal(response.status, 401);
            assert.isDefined(response.body.error);
            requester.close();
        });
    });

    /* ==================== TESTS FACTURAS ==================== */
    describe("facturas", function () {
        let clienteId;
        let libros;

        beforeEach(async function () {
            let requester = chai.request(app).keepOpen();

            // Limpiar datos
            let request = requester.put(`/api/facturas`);
            await request.send([]);
            request = requester.put(`/api/clientes`);
            await request.send([]);
            request = requester.put(`/api/libros`);
            await request.send([]);

            // Crear un cliente
            let cliente = crearCliente('12345678C');
            request = requester.post(`/api/clientes`);
            let response = await request.send(cliente);
            clienteId = response.body._id;

            // Crear libros
            let libros_data = ISBNS.map(isbn => crearLibro(isbn));
            request = requester.put(`/api/libros`);
            response = await request.send(libros_data);
            libros = response.body;

            requester.close();
        });

        it(`POST ${URL}/facturas`, async () => {
            let requester = chai.request(app).keepOpen();

            // Agregar items al carrito
            let request = requester.post(`/api/clientes/${clienteId}/carro/items`);
            await request.send({
                libro: libros[0]._id,
                cantidad: 2
            });
            await requester.post(`/api/clientes/${clienteId}/carro/items`).send({
                libro: libros[1]._id,
                cantidad: 1
            });

            // Crear factura
            request = requester.post(`/api/facturas`);
            let response = await request.send({
                cliente: clienteId,
                fecha: new Date().toISOString(),
                razonSocial: 'Razón Social Test',
                direccion: 'Dirección Test',
                email: '12345678C@test.com',
                dni: '12345678C'
            });

            assert.equal(response.status, 200);
            let factura = response.body;
            assert.isDefined(factura._id);
            assert.isDefined(factura.numero);
            assert.equal(factura.items.length, 2);
            assert.isAbove(factura.total, 0);
            assert.equal(factura.cliente, clienteId);

            // Verificar que el carrito se vació
            request = requester.get(`/api/clientes/${clienteId}/carro`);
            response = await request.send();
            assert.equal(response.body.items.length, 0);

            requester.close();
        });

        it(`GET ${URL}/facturas`, async () => {
            let requester = chai.request(app).keepOpen();

            // Crear una factura
            let request = requester.post(`/api/clientes/${clienteId}/carro/items`);
            await request.send({
                libro: libros[0]._id,
                cantidad: 1
            });

            request = requester.post(`/api/facturas`);
            await request.send({
                cliente: clienteId,
                fecha: new Date().toISOString(),
                razonSocial: 'Razón Social Test',
                direccion: 'Dirección Test',
                email: '12345678C@test.com',
                dni: '12345678C'
            });

            // Obtener todas las facturas
            request = requester.get(`/api/facturas`);
            let response = await request.send();
            assert.equal(response.status, 200);
            assert.equal(response.body.length, 1);
            requester.close();
        });

        it(`GET ${URL}/facturas/:id`, async () => {
            let requester = chai.request(app).keepOpen();

            // Crear una factura
            let request = requester.post(`/api/clientes/${clienteId}/carro/items`);
            await request.send({
                libro: libros[0]._id,
                cantidad: 1
            });

            request = requester.post(`/api/facturas`);
            let response = await request.send({
                cliente: clienteId,
                fecha: new Date().toISOString(),
                razonSocial: 'Razón Social Test',
                direccion: 'Dirección Test',
                email: '12345678C@test.com',
                dni: '12345678C'
            });
            let factura = response.body;

            // Obtener factura por ID
            request = requester.get(`/api/facturas/${factura._id}`);
            response = await request.send();
            assert.equal(response.status, 200);
            assert.equal(response.body._id, factura._id);
            assert.equal(response.body.numero, factura.numero);
            requester.close();
        });

        it(`GET ${URL}/facturas?cliente=...`, async () => {
            let requester = chai.request(app).keepOpen();

            // Crear una factura
            let request = requester.post(`/api/clientes/${clienteId}/carro/items`);
            await request.send({
                libro: libros[0]._id,
                cantidad: 1
            });

            request = requester.post(`/api/facturas`);
            await request.send({
                cliente: clienteId,
                fecha: new Date().toISOString(),
                razonSocial: 'Razón Social Test',
                direccion: 'Dirección Test',
                email: '12345678C@test.com',
                dni: '12345678C'
            });

            // Buscar facturas por cliente
            request = requester.get(`/api/facturas?cliente=${clienteId}`);
            let response = await request.send();
            assert.equal(response.status, 200);
            assert.equal(response.body.length, 1);
            assert.equal(response.body[0].cliente._id, clienteId);
            requester.close();
        });

        it(`DELETE ${URL}/facturas/:id`, async () => {
            let requester = chai.request(app).keepOpen();

            // Crear una factura
            let request = requester.post(`/api/clientes/${clienteId}/carro/items`);
            await request.send({
                libro: libros[0]._id,
                cantidad: 1
            });

            request = requester.post(`/api/facturas`);
            let response = await request.send({
                cliente: clienteId,
                fecha: new Date().toISOString(),
                razonSocial: 'Razón Social Test',
                direccion: 'Dirección Test',
                email: '12345678C@test.com',
                dni: '12345678C'
            });
            let factura = response.body;

            // Eliminar factura
            request = requester.delete(`/api/facturas/${factura._id}`);
            response = await request.send();
            assert.equal(response.status, 200);
            assert.isTrue(response.body.ok);

            // Verificar que no existe
            request = requester.get(`/api/facturas/${factura._id}`);
            response = await request.send();
            assert.equal(response.status, 404);
            requester.close();
        });
    });
});
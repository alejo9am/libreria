import express from 'express';
import path from 'path';
import url from 'url';
import mongoose from 'mongoose';
import { MONGODB_URI, PORT } from './config.mjs';
import passport from 'passport';
import { Strategy as JWTStrategy, ExtractJwt as ExtractJWT } from 'passport-jwt';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { model } from './model/model.mjs';
import { Usuario } from './model/usuario.mjs';

// Función de conexión a MongoDB
async function connect() {
  const uri = MONGODB_URI;
  mongoose.Promise = global.Promise;
  const db = mongoose.connection;
  db.on('connecting', () => console.log('Conectando a', uri));
  db.on('connected', () => {
    console.log('Conectado a', uri);
    console.log('Base de datos en uso:', db.name);
    console.log('Host:', db.host);
  });
  db.on('disconnecting', () => console.log('Desconectando de', uri));
  db.on('disconnected', () => console.log('Desconectado de', uri));
  db.on('error', (err) => console.error('Error', err.message));
  return await mongoose.connect(uri);
}

// Conectar a MongoDB
await connect();

const STATIC_DIR = url.fileURLToPath(new URL('.', import.meta.url));

export const app = express();

// Middleware
app.use('/', express.static(path.join(STATIC_DIR, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const SECRET_KEY = 'TSW';
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest:
        ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: SECRET_KEY
    },
    async function (jwtPayload, cb) {
      try {
        let user = await Usuario.findById(jwtPayload.id);
        cb(null, user);
      } catch (err) {
        return cb(err);
      }
    }
  )
);

// Middleware CORS para desarrollo
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

/* ==================== API REST - AUTENTICACIÓN ==================== */

// POST /api/autenticar - Autenticar usuario y devolver un token JWT
app.post('/api/autenticar', async function (req, res, next) {
  try {
    //Verifico que el usuario existe con el rol especificado
    const userExists = await Usuario.findOne({ email: req.body.email, rol: req.body.rol });
    if (!userExists) return res.status(400).json({ message: "El usuario no existe con ese rol" });
    // Verifico la contraseña 
    let ok = await bcrypt.compare(req.body.password, userExists.password);
    if (!ok) return res.status(400).json({ message: "Contraseña incorrecta" });
    // Creo un token 
    const accessToken = jwt.sign({ id: userExists._id }, SECRET_KEY, { expiresIn: "24h" });
    return res.status(200).json({ token: accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/usuarios/actual",
  passport.authenticate("jwt", { session: false }),
  function (req, res, next) {
    try {
      let usuario = req.user;
      // console.log(req.user); 
      if (!usuario) res.status(404).json({ message: "Usuario no encotnrado" });
      res.json(usuario);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  });

app.get('/api/usuarios/:id',
  async function (req, res, next) {
    try {
      let usuario = await Usuario.findById(req.params.id);
      if (!usuario) res.status(404).json({ message: 'Usuario no encotnrado' })
      res.json(usuario);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
app.put("/api/usuarios/:id",
  passport.authenticate("jwt", { session: false }),
  async function (req, res, next) {
    try {
      let obj = req.body;
      obj._id = req.user._id;
      let usuario = await model.updateUsuario(obj);
      res.json(usuario);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  }
);
app.post('/api/usuarios',
  async function (req, res, next) {
    try {
      let usuario = await model.addUsuario(req.body);
      res.json(usuario);
    } catch (err) {
      console.error(err);
      res.status(401).json({ message: err.message })
    }
  })

/* ==================== API REST - LIBROS ==================== */

// GET /api/libros - Obtener todos los libros O filtrar por query params
app.get('/api/libros', async function (req, res, next) {
  try {
    const { isbn, titulo } = req.query;

    // Filtrar por ISBN si se proporciona
    if (isbn) {
      const libro = await model.getLibroPorIsbn(isbn);
      if (!libro) {
        return res.status(404).json({ error: 'Libro no encontrado' });
      }
      return res.json(libro);
    }

    // Filtrar por título si se proporciona
    if (titulo) {
      const libro = await model.getLibroPorTitulo(titulo);
      if (!libro) {
        return res.status(404).json({ error: 'Libro no encontrado' });
      }
      return res.json(libro);
    }

    // Si no hay filtros, devolver todos
    res.json(await model.getLibros());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/libros/:id - Obtener un libro por ID
app.get('/api/libros/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Id no definido' });
    }
    let libro = await model.getLibroPorId(id);
    if (!libro) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    res.json(libro);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/libros - Crear un nuevo libro
app.post('/api/libros', async function (req, res, next) {
  try {
    let obj = req.body;
    // console.log('[POST /api/libros]', obj);
    let libro = await model.addLibro(obj);
    res.status(201).json(libro);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/libros - Reemplazar todos los libros (setLibros)
app.put('/api/libros', async function (req, res, next) {
  try {
    // console.log('[PUT /api/libros]', req.body);
    await model.setLibros(req.body);
    res.json(await model.getLibros());
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/libros/:id - Actualizar un libro existente
app.put('/api/libros/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'ID no definido' });
    }
    let libro = await model.getLibroPorId(id);
    if (!libro) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    req.body._id = id;
    await model.updateLibro(req.body);
    res.json(await model.getLibroPorId(id));
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/libros - Eliminar todos los libros
app.delete('/api/libros', async function (req, res, next) {
  try {
    const count = await model.removeLibros();
    res.json({ ok: true, message: `${count} libros eliminados` });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/libros/:id - Eliminar un libro
app.delete('/api/libros/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Id no definido' });
    }
    await model.removeLibro(id);
    res.json({ ok: true, message: 'Libro eliminado' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

/* ==================== API REST - CLIENTES ==================== */

// GET /api/clientes - Obtener todos los clientes O filtrar por query params
app.get('/api/clientes', async function (req, res, next) {
  try {
    const { email, dni } = req.query;

    // Filtrar por email si se proporciona
    if (email) {
      const cliente = await model.getClientePorEmail(email);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      // No devolver contraseña
      const clienteObj = cliente.toObject();
      const { password, ...clienteSinPassword } = clienteObj;
      return res.json(clienteSinPassword);
    }

    // Filtrar por DNI si se proporciona
    if (dni) {
      const cliente = await model.getClientePorDni(dni);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      // No devolver contraseña
      const clienteObj = cliente.toObject();
      const { password, ...clienteSinPassword } = clienteObj;
      return res.json(clienteSinPassword);
    }

    // Si no hay filtros, devolver todos (sin contraseñas)
    const clientes = (await model.getClientes()).map(c => {
      const clienteObj = c.toObject();
      const { password, ...clienteSinPassword } = clienteObj;
      return clienteSinPassword;
    });
    res.json(clientes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clientes/:id - Obtener un cliente por ID
app.get('/api/clientes/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Id no definido' });
    }
    let cliente = await model.getClientePorId(id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    // No devolver contraseña
    const clienteObj = cliente.toObject();
    const { password, ...clienteSinPassword } = clienteObj;
    res.json(clienteSinPassword);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clientes - Registrar un nuevo cliente
app.post('/api/clientes', async function (req, res, next) {
  // console.log('[POST /api/clientes]', req.body);
  try {
    req.body.rol = 'CLIENTE'; // Forzar rol de cliente
    let cliente = await model.addCliente(req.body);
    console.log('[Cliente registrado]', cliente.email);
    // No devolver contraseña
    const clienteObj = cliente.toObject();
    const { password, ...clienteSinPassword } = clienteObj;
    res.status(201).json(clienteSinPassword);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/clientes - Reemplazar todos los clientes (setClientes)
app.put('/api/clientes', async function (req, res, next) {
  try {
    // console.log('[PUT /api/clientes]', req.body);
    await model.setClientes(req.body);
    const clientesDB = await model.getClientes();
    const clientes = clientesDB.map(c => {
      const clienteObj = c.toObject();
      const { password, ...clienteSinPassword } = clienteObj;
      return clienteSinPassword;
    });
    res.json(clientes);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/clientes/:id - Actualizar un cliente
app.put('/api/clientes/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'ID no definido' });
    }
    req.body._id = id;
    let cliente = await model.updateCliente(req.body);
    // No devolver contraseña
    const clienteObj = cliente.toObject();
    const { password, ...clienteSinPassword } = clienteObj;
    res.json(clienteSinPassword);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/clientes - Eliminar todos los clientes
app.delete('/api/clientes', async function (req, res, next) {
  try {
    const count = await model.removeClientes();
    res.json({ ok: true, message: `${count} clientes eliminados` });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/clientes/:id - Eliminar un cliente
app.delete('/api/clientes/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Id no definido' });
    }
    await model.removeCliente(id);
    res.json({ ok: true, message: 'Cliente eliminado' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// POST /api/clientes/autenticar (o /clientes/signin)
app.post('/api/clientes/autenticar', async function (req, res, next) {
  console.log('[POST /api/clientes/autenticar]', req.body);
  try {
    req.body.rol = 'CLIENTE';
    let cliente = await model.autenticarCliente(req.body);
    console.log('[Cliente autenticado]', cliente.email);

    // Convertir a objeto plano primero
    const clienteObj = cliente.toObject();
    const { password, ...clienteSinPassword } = clienteObj;
    res.json(clienteSinPassword);
  } catch (err) {
    // NO imprimir el error en consola - es un error esperado
    res.status(401).json({ error: err.message });
  }
});

// Alias para signin
app.post('/api/clientes/signin', async function (req, res, next) {
  req.body.rol = 'CLIENTE';
  return app._router.handle(Object.assign(req, {
    url: '/api/clientes/autenticar',
    originalUrl: '/api/clientes/signin'
  }), res, next);
});

// GET /api/clientes/:id/carro - Obtener el carrito de un cliente
app.get('/api/clientes/:id/carro', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Id no definido' });
    }
    let carro = await model.getCarroCliente(id);
    if (!carro) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    res.json(carro);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clientes/:id/carro/items - Agregar un item al carrito
app.post('/api/clientes/:id/carro/items', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Id no definido' });
    }
    let item = req.body;
    // console.log('[POST /api/clientes/:id/carro/items]', id, item);
    let carro = await model.addClienteCarroItem(id, item);
    res.json(carro);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/clientes/:id/carro/items/:index - Actualizar cantidad de un item
app.put('/api/clientes/:id/carro/items/:index', async function (req, res, next) {
  try {
    let id = req.params.id;
    let index = parseInt(req.params.index);
    let cantidad = req.body.cantidad;

    if (!id) {
      return res.status(400).json({ error: 'Id no definido' });
    }
    if (isNaN(index)) {
      return res.status(400).json({ error: 'Index inválido' });
    }
    if (cantidad === undefined) {
      return res.status(400).json({ error: 'Cantidad no definida' });
    }

    // console.log('[PUT /api/clientes/:id/carro/items/:index]', id, index, cantidad);
    let carro = await model.setClienteCarroItemCantidad(id, index, cantidad);
    res.json(carro);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

/* ==================== API REST - ADMINISTRADORES ==================== */

// GET /api/admins - Obtener todos los administradores O filtrar por query params
app.get('/api/admins', async function (req, res, next) {
  try {
    const { email, dni } = req.query;

    // Filtrar por email si se proporciona
    if (email) {
      const admin = await model.getAdministradorPorEmail(email);
      if (!admin) {
        return res.status(404).json({ error: 'Administrador no encontrado' });
      }
      // No devolver contraseña
      const adminObj = admin.toObject();
      const { password, ...adminSinPassword } = adminObj;
      return res.json(adminSinPassword);
    }

    // Filtrar por DNI si se proporciona
    if (dni) {
      const admin = await model.getAdminPorDni(dni);
      if (!admin) {
        return res.status(404).json({ error: 'Administrador no encontrado' });
      }
      // No devolver contraseña
      const adminObj = admin.toObject();
      const { password, ...adminSinPassword } = adminObj;
      return res.json(adminSinPassword);
    }

    // Si no hay filtros, devolver todos (sin contraseñas)
    const admins = (await model.getAdmins()).map(a => {
      const adminObj = a.toObject();
      const { password, ...adminSinPassword } = adminObj;
      return adminSinPassword;
    });
    res.json(admins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admins/:id - Obtener un administrador por ID
app.get('/api/admins/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Id no definido' });
    }
    let admin = await model.getAdminPorId(id);
    if (!admin) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }
    // No devolver contraseña
    const adminObj = admin.toObject();
    const { password, ...adminSinPassword } = adminObj;
    res.json(adminSinPassword);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admins - Registrar un nuevo administrador
app.post('/api/admins', async function (req, res, next) {
  // console.log('[POST /api/admins]', req.body);
  try {
    req.body.rol = 'ADMIN'; // Forzar rol de administrador
    let admin = await model.addAdmin(req.body);
    // console.log('[Administrador registrado]', admin.email);
    // No devolver contraseña
    const adminObj = admin.toObject();
    const { password, ...adminSinPassword } = adminObj;
    res.status(201).json(adminSinPassword);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/admins - Reemplazar todos los administradores (setAdmins)
app.put('/api/admins', async function (req, res, next) {
  try {
    // console.log('[PUT /api/admins]', req.body);
    await model.setAdmins(req.body);
    const admins = (await model.getAdmins()).map(a => {
      const adminObj = a.toObject();
      const { password, ...adminSinPassword } = adminObj;
      return adminSinPassword;
    });
    res.json(admins);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/admins/:id - Actualizar un administrador
app.put('/api/admins/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'ID no definido' });
    }
    req.body._id = id;
    let admin = await model.updateAdmin(req.body);
    // No devolver contraseña
    const adminObj = admin.toObject();
    const { password, ...adminSinPassword } = adminObj;
    res.json(adminSinPassword);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/admins - Eliminar todos los administradores
app.delete('/api/admins', async function (req, res, next) {
  try {
    const count = await model.removeAdmins();
    res.json({ ok: true, message: `${count} administradores eliminados` });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/admins/:id - Eliminar un administrador
app.delete('/api/admins/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Id no definido' });
    }
    await model.removeAdmin(id);
    res.json({ ok: true, message: 'Administrador eliminado' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// POST /api/admins/autenticar (o /admins/signin)
app.post('/api/admins/autenticar', async function (req, res, next) {
  console.log('[POST /api/admins/autenticar]', req.body);
  try {
    req.body.rol = 'ADMIN';
    let admin = await model.autenticarAdmin(req.body);
    console.log('[Administrador autenticado]', admin.email);

    // Convertir a objeto plano primero
    const adminObj = admin.toObject();
    const { password, ...adminSinPassword } = adminObj;
    res.json(adminSinPassword);
  } catch (err) {
    // NO imprimir el error en consola - es un error esperado
    res.status(401).json({ error: err.message });
  }
});

// Alias para signin
app.post('/api/admins/signin', async function (req, res, next) {
  req.body.rol = 'ADMIN';
  return app._router.handle(Object.assign(req, {
    url: '/api/admins/autenticar',
    originalUrl: '/api/admins/signin'
  }), res, next);
});

/* ==================== API REST - FACTURAS ==================== */

// GET /api/facturas - Obtener todas las facturas O filtrar por query params
app.get('/api/facturas', async function (req, res, next) {
  try {
    const { numero, cliente } = req.query;

    // Filtrar por número si se proporciona
    if (numero) {
      const factura = await model.getFacturaPorNumero(numero);
      if (!factura) {
        return res.status(404).json({ error: 'Factura no encontrada' });
      }
      return res.json(factura);
    }

    // Filtrar por cliente si se proporciona
    if (cliente) {
      const facturas = await model.getFacturasPorCliente(cliente);
      return res.json(facturas);
    }

    // Si no hay filtros, devolver todas
    res.json(await model.getFacturas());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/facturas/:id - Obtener una factura por ID
app.get('/api/facturas/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Id no definido' });
    }
    let factura = await model.getFacturaPorId(id);
    if (!factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    res.json(factura);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// POST /api/facturas - Crear una nueva factura (facturar compra)
app.post('/api/facturas', async (req, res) => {
  try {
    // Extraer el ID del cliente
    let clienteId = typeof req.body.cliente === 'object'
      ? req.body.cliente._id
      : req.body.cliente;

    // Si vienen items en el body, agregarlos al carrito primero
    if (req.body.items && req.body.items.length > 0) {
      // Vaciar el carrito actual del cliente
      await model.vaciarCarroCliente(clienteId);

      // Agregar cada item al carrito
      for (const item of req.body.items) {
        await model.addClienteCarroItem(clienteId, {
          libro: typeof item.libro === 'object' ? item.libro._id : item.libro,
          cantidad: item.cantidad
        });
      }
    }

    // Ahora sí, facturar la compra
    let factura = await model.facturarCompraCliente({
      cliente: clienteId,
      fecha: req.body.fecha || new Date().toISOString(),
      razonSocial: req.body.razonSocial,
      direccion: req.body.direccion,
      email: req.body.email,
      dni: req.body.dni
    });

    // console.log('[POST /api/facturas] Factura creada:', factura);
    res.json(factura);
  } catch (err) {
    console.error('[POST /api/facturas] Error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/facturas - Reemplazar todas las facturas (setFacturas)
app.put('/api/facturas', async function (req, res, next) {
  try {
    // console.log('[PUT /api/facturas]', req.body);
    await model.setFacturas(req.body);
    res.json(await model.getFacturas());
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/facturas - Eliminar todas las facturas
app.delete('/api/facturas', async function (req, res, next) {
  try {
    const count = await model.removeFacturas();
    res.json({ ok: true, message: `${count} facturas eliminadas` });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/facturas/:id - Eliminar una factura
app.delete('/api/facturas/:id', async function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Id no definido' });
    }
    const removed = await model.removeFactura(id);
    if (!removed) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }
    res.json({ ok: true, message: `Factura ${id} eliminada` });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

app.use(passport.initialize());


/* ==================== RUTAS DEL CLIENTE (SPA) ==================== */

// Redirección a index.html para rutas de la SPA
app.use('/libreria*', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'public/libreria/index.html'));
});

/* ==================== MANEJO DE ERRORES ==================== */

// 404 para rutas no encontradas
app.all('*', function (req, res, next) {
  console.error(`${req.originalUrl} not found!`);

  // Si es una petición a la API, devolver JSON
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(404).json({
      error: 'Ruta API no encontrada',
      path: req.originalUrl
    });
  }

  // Para cualquier otra ruta, devolver página HTML de error 404
  const urlSolicitada = encodeURIComponent(req.originalUrl);
  res.redirect(`/libreria/error-404.html?url=${urlSolicitada}`);
});

/* ==================== INICIAR SERVIDOR ==================== */

app.listen(PORT, async function () {
  console.log(`===========================================`);
  console.log(`   Servidor iniciado en puerto ${PORT}`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`===========================================`);
  const libros = await model.getLibros();
  const clientes = await model.getClientes();
  const admins = await model.getAdmins();
  const facturas = await model.getFacturas();
  console.log(`Libros en el sistema: ${libros.length}`);
  console.log(`Clientes: ${clientes.length}`);
  console.log(`Administradores: ${admins.length}`);
  console.log(`Facturas: ${facturas.length}`);
  console.log(`===========================================`);
  console.log(`\n API REST Endpoints:`);
  console.log(`   Libros:          /api/libros`);
  console.log(`   Clientes:        /api/clientes`);
  console.log(`   Administradores: /api/admins`);
  console.log(`   Facturas:        /api/facturas`);
  console.log(`===========================================\n`);
});

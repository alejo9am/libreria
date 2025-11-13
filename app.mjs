import express from 'express';
import path from 'path';
import url from 'url';

import { model } from './model/model.mjs';
import { seed } from './model/seeder.mjs';

// Inicializar datos
seed();

const STATIC_DIR = url.fileURLToPath(new URL('.', import.meta.url));
const PORT = 3000;

export const app = express();

// Middleware
app.use('/', express.static(path.join(STATIC_DIR, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

/* ==================== API REST - LIBROS ==================== */

// GET /api/libros - Obtener todos los libros O filtrar por query params
app.get('/api/libros', function (req, res, next) {
  try {
    const { isbn, titulo } = req.query;
    
    // Filtrar por ISBN si se proporciona
    if (isbn) {
      const libro = model.getLibroPorIsbn(isbn);
      if (!libro) {
        return res.status(404).json({ error: 'Libro no encontrado' });
      }
      return res.json(libro);
    }
    
    // Filtrar por título si se proporciona
    if (titulo) {
      const libro = model.getLibroPorTitulo(titulo);
      if (!libro) {
        return res.status(404).json({ error: 'Libro no encontrado' });
      }
      return res.json(libro);
    }
    
    // Si no hay filtros, devolver todos
    res.json(model.getLibros());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/libros/:id - Obtener un libro por ID
app.get('/api/libros/:id', function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Id no definido' });
    }
    let libro = model.getLibroPorId(id);
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
app.post('/api/libros', function (req, res, next) {
  try {
    let obj = req.body;
    console.log('[POST /api/libros]', obj);
    let libro = model.addLibro(obj);
    res.status(201).json(libro);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/libros - Reemplazar todos los libros (setLibros)
app.put('/api/libros', function (req, res, next) {
  try {
    console.log('[PUT /api/libros]', req.body);
    model.setLibros(req.body);
    res.json(model.getLibros());
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/libros/:id - Actualizar un libro existente
app.put('/api/libros/:id', function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'ID no definido' });
    }
    let libro = model.getLibroPorId(id);
    if (!libro) {
      return res.status(404).json({ error: 'Libro no encontrado' });
    }
    req.body._id = id;
    model.updateLibro(req.body);
    res.json(model.getLibroPorId(id));
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/libros - Eliminar todos los libros
app.delete('/api/libros', function (req, res, next) {
  try {
    const count = model.removeLibros();
    res.json({ ok: true, message: `${count} libros eliminados` });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/libros/:id - Eliminar un libro
app.delete('/api/libros/:id', function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Id no definido' });
    }
    model.removeLibro(id);
    res.json({ ok: true, message: 'Libro eliminado' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

/* ==================== API REST - CLIENTES ==================== */

// GET /api/clientes - Obtener todos los clientes O filtrar por query params
app.get('/api/clientes', function (req, res, next) {
  try {
    const { email, dni } = req.query;
    
    // Filtrar por email si se proporciona
    if (email) {
      const cliente = model.getClientePorEmail(email);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      // No devolver contraseña
      const { password, ...clienteSinPassword } = cliente;
      return res.json(clienteSinPassword);
    }
    
    // Filtrar por DNI si se proporciona
    if (dni) {
      const cliente = model.getClientePorDni(dni);
      if (!cliente) {
        return res.status(404).json({ error: 'Cliente no encontrado' });
      }
      // No devolver contraseña
      const { password, ...clienteSinPassword } = cliente;
      return res.json(clienteSinPassword);
    }
    
    // Si no hay filtros, devolver todos (sin contraseñas)
    const clientes = model.getClientes().map(c => {
      const { password, ...clienteSinPassword } = c;
      return clienteSinPassword;
    });
    res.json(clientes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/clientes/:id - Obtener un cliente por ID
app.get('/api/clientes/:id', function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Id no definido' });
    }
    let cliente = model.getClientePorId(id);
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    // No devolver contraseña
    const { password, ...clienteSinPassword } = cliente;
    res.json(clienteSinPassword);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/clientes - Registrar un nuevo cliente
app.post('/api/clientes', function (req, res, next) {
  console.log('[POST /api/clientes]', req.body);
  try {
    req.body.rol = 'CLIENTE'; // Forzar rol de cliente
    let cliente = model.addCliente(req.body);
    console.log('[Cliente registrado]', cliente.email);
    // No devolver contraseña
    const { password, ...clienteSinPassword } = cliente;
    res.status(201).json(clienteSinPassword);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/clientes - Reemplazar todos los clientes (setClientes)
app.put('/api/clientes', function (req, res, next) {
  try {
    console.log('[PUT /api/clientes]', req.body);
    model.setClientes(req.body);
    const clientes = model.getClientes().map(c => {
      const { password, ...clienteSinPassword } = c;
      return clienteSinPassword;
    });
    res.json(clientes);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/clientes/:id - Actualizar un cliente
app.put('/api/clientes/:id', function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'ID no definido' });
    }
    req.body._id = id;
    let cliente = model.updateCliente(req.body);
    // No devolver contraseña
    const { password, ...clienteSinPassword } = cliente;
    res.json(clienteSinPassword);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/clientes - Eliminar todos los clientes
app.delete('/api/clientes', function (req, res, next) {
  try {
    const count = model.removeClientes();
    res.json({ ok: true, message: `${count} clientes eliminados` });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/clientes/:id - Eliminar un cliente
app.delete('/api/clientes/:id', function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Id no definido' });
    }
    model.removeCliente(id);
    res.json({ ok: true, message: 'Cliente eliminado' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// POST /api/clientes/autenticar (o /clientes/signin)
app.post('/api/clientes/autenticar', function (req, res, next) {
  console.log('[POST /api/clientes/autenticar]', req.body);
  try {
    req.body.rol = 'CLIENTE'; // Forzar autenticación como cliente
    let cliente = model.autenticarCliente(req.body);
    console.log('[Cliente autenticado]', cliente.email);
    // No devolver contraseña
    const { password, ...clienteSinPassword } = cliente;
    res.json(clienteSinPassword);
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: err.message });
  }
});

// Alias para signin
app.post('/api/clientes/signin', function (req, res, next) {
  req.body.rol = 'CLIENTE';
  return app._router.handle(Object.assign(req, { 
    url: '/api/clientes/autenticar',
    originalUrl: '/api/clientes/signin'
  }), res, next);
});

// GET /api/clientes/:id/carro - Obtener el carrito de un cliente
app.get('/api/clientes/:id/carro', function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Id no definido' });
    }
    let carro = model.getCarroCliente(id);
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
app.post('/api/clientes/:id/carro/items', function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Id no definido' });
    }
    let item = req.body;
    console.log('[POST /api/clientes/:id/carro/items]', id, item);
    let carro = model.addClienteCarroItem(id, item);
    res.json(carro);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/clientes/:id/carro/items/:index - Actualizar cantidad de un item
app.put('/api/clientes/:id/carro/items/:index', function (req, res, next) {
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
    
    console.log('[PUT /api/clientes/:id/carro/items/:index]', id, index, cantidad);
    let carro = model.setClienteCarroItemCantidad(id, index, cantidad);
    res.json(carro);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

/* ==================== API REST - ADMINISTRADORES ==================== */

// GET /api/admins - Obtener todos los administradores O filtrar por query params
app.get('/api/admins', function (req, res, next) {
  try {
    const { email, dni } = req.query;
    
    // Filtrar por email si se proporciona
    if (email) {
      const admin = model.getAdministradorPorEmail(email);
      if (!admin) {
        return res.status(404).json({ error: 'Administrador no encontrado' });
      }
      // No devolver contraseña
      const { password, ...adminSinPassword } = admin;
      return res.json(adminSinPassword);
    }
    
    // Filtrar por DNI si se proporciona
    if (dni) {
      const admin = model.getAdministradorPorDni(dni);
      if (!admin) {
        return res.status(404).json({ error: 'Administrador no encontrado' });
      }
      // No devolver contraseña
      const { password, ...adminSinPassword } = admin;
      return res.json(adminSinPassword);
    }
    
    // Si no hay filtros, devolver todos (sin contraseñas)
    const admins = model.getAdmins().map(a => {
      const { password, ...adminSinPassword } = a;
      return adminSinPassword;
    });
    res.json(admins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admins/:id - Obtener un administrador por ID
app.get('/api/admins/:id', function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Id no definido' });
    }
    let admin = model.getAdministradorPorId(id);
    if (!admin) {
      return res.status(404).json({ error: 'Administrador no encontrado' });
    }
    // No devolver contraseña
    const { password, ...adminSinPassword } = admin;
    res.json(adminSinPassword);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admins - Registrar un nuevo administrador
app.post('/api/admins', function (req, res, next) {
  console.log('[POST /api/admins]', req.body);
  try {
    req.body.rol = 'ADMIN'; // Forzar rol de administrador
    let admin = model.addUsuario(req.body);
    console.log('[Administrador registrado]', admin.email);
    // No devolver contraseña
    const { password, ...adminSinPassword } = admin;
    res.status(201).json(adminSinPassword);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/admins - Reemplazar todos los administradores (setAdmins)
app.put('/api/admins', function (req, res, next) {
  try {
    console.log('[PUT /api/admins]', req.body);
    model.setAdmins(req.body);
    const admins = model.getAdmins().map(a => {
      const { password, ...adminSinPassword } = a;
      return adminSinPassword;
    });
    res.json(admins);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/admins/:id - Actualizar un administrador
app.put('/api/admins/:id', function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'ID no definido' });
    }
    req.body._id = id;
    let admin = model.updateUsuario(req.body);
    // No devolver contraseña
    const { password, ...adminSinPassword } = admin;
    res.json(adminSinPassword);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/admins - Eliminar todos los administradores
app.delete('/api/admins', function (req, res, next) {
  try {
    const count = model.removeAdmins();
    res.json({ ok: true, message: `${count} administradores eliminados` });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/admins/:id - Eliminar un administrador
app.delete('/api/admins/:id', function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Id no definido' });
    }
    model.removeAdmin(id);
    res.json({ ok: true, message: 'Administrador eliminado' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// POST /api/admins/autenticar (o /admins/signin)
app.post('/api/admins/autenticar', function (req, res, next) {
  console.log('[POST /api/admins/autenticar]', req.body);
  try {
    req.body.rol = 'ADMIN'; // Forzar autenticación como administrador
    let admin = model.autenticar(req.body);
    console.log('[Administrador autenticado]', admin.email);
    // No devolver contraseña
    const { password, ...adminSinPassword } = admin;
    res.json(adminSinPassword);
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: err.message });
  }
});

// Alias para signin
app.post('/api/admins/signin', function (req, res, next) {
  req.body.rol = 'ADMIN';
  return app._router.handle(Object.assign(req, { 
    url: '/api/admins/autenticar',
    originalUrl: '/api/admins/signin'
  }), res, next);
});

/* ==================== API REST - FACTURAS ==================== */

// GET /api/facturas - Obtener todas las facturas O filtrar por query params
app.get('/api/facturas', function (req, res, next) {
  try {
    const { numero, cliente } = req.query;
    
    // Filtrar por número si se proporciona
    if (numero) {
      const factura = model.getFacturaPorNumero(numero);
      if (!factura) {
        return res.status(404).json({ error: 'Factura no encontrada' });
      }
      return res.json(factura);
    }
    
    // Filtrar por cliente si se proporciona
    if (cliente) {
      const facturas = model.getFacturasCliente(cliente);
      return res.json(facturas);
    }
    
    // Si no hay filtros, devolver todas
    res.json(model.getFacturas());
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/facturas/:id - Obtener una factura por ID
app.get('/api/facturas/:id', function (req, res, next) {
  try {
    let id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Id no definido' });
    }
    let factura = model.getFacturaPorId(id);
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
app.post('/api/facturas', function (req, res, next) {
  try {
    console.log('[POST /api/facturas]', req.body);
    let factura = model.facturarCompraCliente(req.body);
    res.status(201).json(factura);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/facturas - Reemplazar todas las facturas (setFacturas)
app.put('/api/facturas', function (req, res, next) {
  try {
    console.log('[PUT /api/facturas]', req.body);
    model.setFacturas(req.body);
    res.json(model.getFacturas());
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/facturas - Eliminar todas las facturas
app.delete('/api/facturas', function (req, res, next) {
  try {
    const count = model.removeFacturas();
    res.json({ ok: true, message: `${count} facturas eliminadas` });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

/* ==================== RUTAS DEL CLIENTE (SPA) ==================== */

// Redirección a index.html para rutas de la SPA
app.use('/libreria*', (req, res) => {
  res.sendFile(path.join(STATIC_DIR, 'public/libreria/index.html'));
});

/* ==================== MANEJO DE ERRORES ==================== */

// 404 para rutas no encontradas
app.all('*', function (req, res, next) {
  console.error(`${req.originalUrl} not found!`);
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl 
  });
});

/* ==================== INICIAR SERVIDOR ==================== */

app.listen(PORT, function () {
  console.log(`===========================================`);
  console.log(`   Servidor iniciado en puerto ${PORT}`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`===========================================`);
  console.log(`Libros en el sistema: ${model.getLibros().length}`);
  console.log(`Clientes: ${model.getClientes().length}`);
  console.log(`Administradores: ${model.getAdmins().length}`);
  console.log(`Facturas: ${model.getFacturas().length}`);
  console.log(`===========================================`);
  console.log(`\n API REST Endpoints:`);
  console.log(`   Libros:          /api/libros`);
  console.log(`   Clientes:        /api/clientes`);
  console.log(`   Administradores: /api/admins`);
  console.log(`   Facturas:        /api/facturas`);
  console.log(`===========================================\n`);
});

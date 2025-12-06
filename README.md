# 📚 Librería WebApp - Sistema de Gestión de Libros

Aplicación **full-stack** desarrollada como práctica de la asignatura **Tecnologías y Sistemas Web (curso 24/25)** de la **Universidad de Castilla-La Mancha**.

La aplicación implementa un sistema completo de gestión de librería con arquitectura cliente-servidor, incluyendo una **SPA (Single Page Application)** en el frontend y una **API REST** en el backend.

[![Deploy on Render](https://img.shields.io/badge/Render-Online-brightgreen?logo=render&logoColor=white)](https://libreria-le6m.onrender.com/libreria/)

---

## 🎯 Objetivo

Desarrollar un sistema completo de gestión de librería que permita:

- Navegación fluida sin recarga de página (SPA)
- Gestión de usuarios con diferentes roles y permisos
- Operaciones CRUD sobre libros, clientes y administradores
- Sistema de carrito de compras y facturación
- Persistencia de datos con sincronización cliente-servidor

---

## 🏗️ Arquitectura del Sistema

El proyecto implementa una arquitectura **cliente-servidor** con separación clara de responsabilidades:

### Backend (Servidor Node.js + Express + MongoDB)

```
├── app.mjs                 # Servidor Express con API REST
├── model/
│   ├── model.mjs          # Lógica de negocio y dominio
│   ├── libro.mjs          # Esquema Mongoose para Libros
│   ├── usuario.mjs        # Esquema Mongoose para Usuarios
│   ├── factura.mjs        # Esquema Mongoose para Facturas
│   ├── carro.mjs          # Esquema Mongoose para Carrito
│   ├── item.mjs           # Esquema Mongoose para Items
│   └── seeder.mjs         # Datos iniciales de prueba
└── test/
    └── rest.spec.mjs      # Tests de la API REST
```

### Frontend (SPA con JavaScript ES6+)

```
public/libreria/
├── index.html             # Punto de entrada
├── estilo.css            # Estilos globales
└── js/
    ├── main.mjs          # Inicialización de la SPA
    ├── model/
    │   └── proxy.mjs     # Cliente de la API REST
    ├── commons/
    │   ├── router.mjs            # Sistema de enrutamiento SPA
    │   ├── libreria-session.mjs  # Gestión de sesión
    │   ├── presenter.mjs         # Clase base para componentes
    │   └── mensajes-helper.mjs   # Sistema de notificaciones
    └── components/               # Componentes de UI por rol
        ├── invitado-*/          # Componentes para usuarios no autenticados
        ├── cliente-*/           # Componentes para clientes
        ├── admin-*/             # Componentes para administradores
        └── error-404/           # Página de error
```

---

## 🔌 API REST

El backend expone una API REST completa con los siguientes endpoints:

### 📖 Libros

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/libros` | Obtener todos los libros |
| `GET` | `/api/libros?isbn=xxx` | Buscar libro por ISBN |
| `GET` | `/api/libros?titulo=xxx` | Buscar libro por título |
| `GET` | `/api/libros/:id` | Obtener libro por ID |
| `POST` | `/api/libros` | Crear nuevo libro |
| `PUT` | `/api/libros` | Reemplazar todos los libros |
| `PUT` | `/api/libros/:id` | Actualizar libro existente |
| `DELETE` | `/api/libros` | Eliminar todos los libros |
| `DELETE` | `/api/libros/:id` | Eliminar libro por ID |

### 👤 Clientes

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/clientes` | Obtener todos los clientes |
| `GET` | `/api/clientes?email=xxx` | Buscar cliente por email |
| `GET` | `/api/clientes?nombre=xxx` | Buscar cliente por nombre |
| `GET` | `/api/clientes/:id` | Obtener cliente por ID |
| `POST` | `/api/clientes` | Crear nuevo cliente |
| `POST` | `/api/clientes/signin` | Registrar nuevo cliente |
| `POST` | `/api/clientes/autenticar` | Autenticar cliente |
| `PUT` | `/api/clientes` | Reemplazar todos los clientes |
| `PUT` | `/api/clientes/:id` | Actualizar cliente existente |
| `DELETE` | `/api/clientes` | Eliminar todos los clientes |
| `DELETE` | `/api/clientes/:id` | Eliminar cliente por ID |

### 🛒 Carrito de Compras

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/clientes/:id/carro` | Obtener carrito del cliente |
| `POST` | `/api/clientes/:id/carro/items` | Agregar item al carrito |
| `PUT` | `/api/clientes/:id/carro/items/:index` | Actualizar cantidad de item |

### 👨‍💼 Administradores

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/admins` | Obtener todos los administradores |
| `GET` | `/api/admins?email=xxx` | Buscar admin por email |
| `GET` | `/api/admins?nombre=xxx` | Buscar admin por nombre |
| `GET` | `/api/admins/:id` | Obtener admin por ID |
| `POST` | `/api/admins` | Crear nuevo admin |
| `POST` | `/api/admins/signin` | Registrar nuevo admin |
| `POST` | `/api/admins/autenticar` | Autenticar admin |
| `PUT` | `/api/admins` | Reemplazar todos los admins |
| `PUT` | `/api/admins/:id` | Actualizar admin existente |
| `DELETE` | `/api/admins` | Eliminar todos los admins |
| `DELETE` | `/api/admins/:id` | Eliminar admin por ID |

### 🧾 Facturas

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/facturas` | Obtener todas las facturas |
| `GET` | `/api/facturas?clienteId=xxx` | Buscar facturas por cliente |
| `GET` | `/api/facturas/:id` | Obtener factura por ID |
| `POST` | `/api/facturas` | Crear nueva factura |
| `PUT` | `/api/facturas` | Reemplazar todas las facturas |
| `DELETE` | `/api/facturas` | Eliminar todas las facturas |
| `DELETE` | `/api/facturas/:id` | Eliminar factura por ID |

---

## 👥 Roles y Funcionalidades

### 🌐 Invitado (No autenticado)

- ✅ Ver catálogo de libros con paginación
- ✅ Ver detalle completo de cada libro
- ✅ Buscar libros por título o ISBN
- ✅ Iniciar sesión como cliente o administrador
- ✅ Registrarse como nuevo cliente

### 🛍️ Cliente (Usuario registrado)

- ✅ Todas las funcionalidades de invitado
- ✅ Agregar libros al carrito de compras
- ✅ Ver y modificar carrito
- ✅ Realizar compras y generar facturas
- ✅ Consultar historial de compras
- ✅ Ver detalles de facturas anteriores
- ✅ Modificar perfil personal

### 👨‍💼 Administrador

- ✅ Ver catálogo completo de libros
- ✅ Ver detalle de cada libro
- ✅ Agregar nuevos libros al sistema
- ✅ Modificar información de libros existentes
- ✅ Eliminar libros del catálogo
- ✅ Editar perfil de administrador

---

## ⚙️ Características Técnicas

### Frontend

- **SPA (Single Page Application)** con JavaScript vanilla ES6+
- **Sistema de enrutamiento personalizado** sin recarga de página
- **Patrón Presenter-View** para componentes UI
- **Gestión de sesión** en sessionStorage
- **Sistema de notificaciones** para feedback de operaciones
- **Validación de formularios** en cliente
- **Manejo de errores** con página 404 personalizada

### Backend

- **Node.js** con **Express.js**
- **MongoDB** como base de datos NoSQL con **Mongoose** como ODM
- **Esquemas Mongoose** para validación y estructura de documentos:
  - `Libro` - Catálogo de libros disponibles
  - `Usuario` - Datos de clientes y administradores
  - `Factura` - Histórico de compras
  - `Carro` - Carrito de compras de cada cliente
  - `Item` - Items dentro del carrito
- **API REST** completa con todas las operaciones CRUD
- **Middleware CORS** para desarrollo
- **Validación de datos** en servidor
- **Manejo de errores** centralizado
- **Arquitectura MVC** con separación de capas
- **Persistencia en MongoDB** con sincronización cliente-servidor en tiempo real

### Testing

- **Mocha + Chai** para tests unitarios
- **Chai-HTTP** para tests de integración de la API
- Tests automatizados para:
  - Endpoints de la API REST
  - Validaciones de negocio
  - Manejo de errores
  - Operaciones CRUD

---

## 🗄️ Arquitectura de Base de Datos

### Colecciones MongoDB

#### Libros
```javascript
{
  isbn: String (único),
  titulo: String,
  autor: String,
  editorial: String,
  año: Number,
  precio: Number,
  cantidad: Number,
  descripcion: String
}
```

#### Usuarios (Clientes y Administradores)
```javascript
{
  nombre: String,
  email: String (único),
  password: String (hasheada),
  rol: String (ADMIN | CLIENTE),
  activo: Boolean,
  fechaCreacion: Date
}
```

#### Facturas
```javascript
{
  numero: String (único),
  clienteId: ObjectId (referencia a Usuario),
  items: [Item],
  total: Number,
  fecha: Date,
  estado: String
}
```

#### Carrito
```javascript
{
  clienteId: ObjectId (referencia a Usuario),
  items: [Item],
  total: Number,
  fechaActualizacion: Date
}
```

#### Items
```javascript
{
  libroId: ObjectId (referencia a Libro),
  cantidad: Number,
  precioUnitario: Number,
  subtotal: Number
}
```

---

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js (versión 14 o superior)
- npm (incluido con Node.js)
- MongoDB (versión 4.4 o superior, ejecutándose localmente en puerto 27017)

### Instalación

1. **Clonar el repositorio:**

   ```bash
   git clone <url-del-repositorio>
   cd libreria
   ```

2. **Instalar dependencias:**

   ```bash
   npm install
   ```

### Ejecución

**Asegúrese de que MongoDB está ejecutándose:**

#### En Windows

```bash
C:/mongodb/bin/mongod.exe --dbpath C:/mongodb/data
```

**En otra terminal, inicializar la base de datos:**

```bash
npm run seed
```

**Iniciar el servidor:**

```bash
npm start
```

El servidor se iniciará en `http://localhost:3000`

**Acceder a la aplicación:**

```bash
http://localhost:3000/libreria
```

### Testing

**Ejecutar tests de la API REST:**

```bash
npm run test-rest
```

---

## 📦 Dependencias

```json
{
  "express": "^4.21.1",     // Framework web
  "mongoose": "^8.8.2",     // ODM para MongoDB
  "path": "^0.12.7",        // Utilidades de rutas
  "mocha": "^10.2.0",       // Framework de testing
  "chai": "^4.3.7",         // Librería de aserciones
  "chai-http": "^4.3.0"     // Plugin HTTP para Chai
}
```

### Dependencias de Base de Datos

- **MongoDB** - Base de datos NoSQL (debe estar instalada y ejecutándose localmente en puerto 27017)

---

## 📂 Estructura Detallada del Proyecto

```
libreria/
│
├── 📄 app.mjs                    # Servidor Express + API REST
├── 📄 package.json               # Configuración del proyecto
├── 📄 package-lock.json          # Lock de dependencias
├── 📄 README.md                  # Este archivo
├── 📄 seeder.mjs                 # Seeder de la base de datos con datos iniciales
│
├── 📁 model/                    # Capa de modelo (Backend) - Esquemas MongoDB
│   ├── model.mjs                # Lógica de negocio y dominio
│   ├── libro.mjs                # Esquema Mongoose - Libros
│   ├── usuario.mjs              # Esquema Mongoose - Usuarios (Clientes/Admins)
│   ├── factura.mjs              # Esquema Mongoose - Facturas
│   ├── carro.mjs                # Esquema Mongoose - Carrito
│   └── item.mjs                 # Esquema Mongoose - Items del carrito
│
├── 📁 test/                      # Tests del backend
│   └── rest.spec.mjs            # Tests de la API REST
│
└── 📁 public/                    # Archivos públicos
    └── 📁 libreria/             # Aplicación SPA
        ├── index.html           # Punto de entrada HTML
        ├── estilo.css           # Estilos globales
        │
        ├── 📁 js/              
        │   ├── main.mjs         # Inicialización de la SPA
        │   │
        │   ├── 📁 model/
        │   │   └── proxy.mjs    # Cliente HTTP de la API
        │   │
        │   ├── 📁 commons/      # Utilidades compartidas
        │   │   ├── router.mjs           # Enrutamiento SPA
        │   │   ├── libreria-session.mjs # Gestión de sesión
        │   │   ├── presenter.mjs        # Clase base de componentes
        │   │   └── mensajes-helper.mjs  # Sistema de mensajes
        │   │
        │   └── 📁 components/   # Componentes de UI
        │       │
        │       ├── 📁 invitado-*        # Invitado (6 componentes)
        │       │   ├── invitado-home/
        │       │   ├── invitado-catalogo/
        │       │   ├── invitado-catalogo-libro/
        │       │   ├── invitado-ver-libro/
        │       │   ├── invitado-ingreso/
        │       │   └── invitado-registro/
        │       │
        │       ├── 📁 cliente-*         # Cliente (9 componentes)
        │       │   ├── cliente-home/
        │       │   ├── cliente-catalogo-libro/
        │       │   ├── cliente-ver-libro/
        │       │   ├── cliente-carrito/
        │       │   ├── cliente-comprar/
        │       │   ├── cliente-lista-compras/
        │       │   ├── cliente-ver-compra/
        │       │   ├── cliente-facturas/
        │       │   └── cliente-perfil/
        │       │
        │       ├── 📁 admin-*           # Admin (7 componentes)
        │       │   ├── admin-home/
        │       │   ├── admin-catalogo/
        │       │   ├── admin-catalogo-libro/
        │       │   ├── admin-ver-libro/
        │       │   ├── admin-agregar-libro/
        │       │   ├── admin-modificar-libro/
        │       │   └── admin-perfil/
        │       │
        │       └── 📁 error-404/        # Página de error
        │
        └── 📁 test/                     # Tests del frontend
            └── model.spec.mjs           # Tests del modelo cliente
```

**Total:** 23 componentes de UI + infraestructura completa

---

## 🚦 Estados de la Aplicación

La aplicación maneja diferentes estados de manera clara:

### Mensajes de Usuario

- **✅ Éxito:** Operaciones completadas correctamente
- **ℹ️ Información:** Notificaciones y avisos
- **⚠️ Advertencia:** Situaciones que requieren atención
- **❌ Error:** Fallos en operaciones

---

## 📝 Convenciones de Código

### Estructura de Componentes

Cada componente tiene:

- **`.mjs`** - Lógica del presenter (JavaScript)
- **`.html`** - Template del componente (HTML)

### API REST

- Rutas con prefijo `/api`
- Uso semántico de verbos HTTP
- Respuestas JSON consistentes
- Códigos de estado HTTP apropiados

---

## 🔄 Flujo de Datos

```
┌─────────────┐        ┌──────────────┐        ┌─────────────┐
│   Browser   │◄──────►│  Presenter   │◄──────►│    Proxy    │
│   (View)    │  DOM   │  (Controller)│  API   │   (Client)  │
└─────────────┘        └──────────────┘        └─────────────┘
                                                       │
                                                       │ HTTP
                                                       ▼
                                                ┌─────────────┐
                                                │   Express   │
                                                │  API REST   │
                                                └─────────────┘
                                                       │
                                                       │ Calls
                                                       ▼
                                                ┌─────────────┐
                                                │    Model    │
                                                │  (Mongoose) │
                                                └─────────────┘
                                                       │
                                                       │ Queries
                                                       ▼
                                                ┌─────────────┐
                                                │  MongoDB    │
                                                │ (Database)  │
                                                └─────────────┘
```

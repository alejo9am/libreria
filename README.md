# Librería WebApp

Aplicación **SPA (Single Page Application)** desarrollada como práctica de la asignatura **Tecnologías y Sistemas Web (curso 24/25)** de la **Universidad de Castilla-La Mancha**.  
El objetivo es implementar el **front-end** de una aplicación para la **venta de libros**, con distintos roles de usuario y persistencia de sesión en el navegador.

---

## 🎯 Objetivo
Desarrollar la interfaz de usuario y la lógica de presentación de una aplicación Web para la compra y gestión de libros, incluyendo la navegación, feedback al usuario y pruebas.

---

## 👥 Roles y Funcionalidades

### Invitado
- Ver catálogo de libros.
- Ver detalle de un libro.
- Ingresar al sistema.
- Registrarse.

### Cliente
- Ver catálogo y detalle de libros.
- Agregar libros al carrito.
- Ver carrito y realizar compras.
- Pagar.
- Consultar historial de compras y detalles.
- Modificar perfil de cliente.

### Administrador
- Ver catálogo y detalle de libros.
- Agregar, modificar o eliminar libros.
- Editar perfil de administrador.

---

## ⚙️ Requisitos no funcionales
- **Node.js + Express.js**.
- Gestión de **sesión en navegador** (usuario y rol).
- **Mensajes de feedback** (operaciones exitosas, información y errores).
- **Páginas de error** donde aplique.
- Pruebas con **Mocha + Chai**.

---

## 🏗️ Arquitectura del Proyecto
El proyecto está dividido en 4 módulos principales:

- **main** → Punto de entrada, inicializa navegación y componentes.
- **model** → Contiene las clases de dominio y lógica de datos (mock del backend).
- **commons** → Componentes comunes:
  - `Router` → Control de navegación.
  - `LibreriaSession` → Gestión de sesión y mensajes.
  - `Presenter` → Renderizado y control de componentes UI.
- **components** → Subclases de `Presenter` que representan páginas y componentes anidados.

---

## 🧪 Pruebas
Se han definido pruebas en navegador usando **Mocha + Chai**, que validan:
- Getters y Setters.
- Manejo de excepciones.
- Agregar, modificar y eliminar elementos.
- Cálculos internos del modelo.

---

## 🚀 Instalación y Uso

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/alejo9am/libreria.git
   cd libreria
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Ejecutar el servidor de desarrollo:
   ```bash
   npm run start
   ```

4. Abrir en el navegador:
   ```
   http://localhost:3000
   ```

---

## 📂 Estructura de Carpetas
```
libreria/
│── main/              # Punto de entrada
│── model/             # Clases de dominio (Libro, Usuario, Compra, etc.)
│── commons/           # Router, Session, Presenter
│── components/        # Componentes de UI
│── public/            # Recursos estáticos (HTML, CSS, imágenes)
│── test/              # Pruebas con Mocha + Chai
│── package.json
```


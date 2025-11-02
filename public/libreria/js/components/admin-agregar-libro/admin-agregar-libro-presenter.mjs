import { Presenter } from "../../commons/presenter.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";

export class AdminAgregarLibroPresenter extends Presenter {
  constructor(model, view, parentSelector) {
    super(model, view, parentSelector);
  }

  async refresh() {
    await super.refresh();

    const form = document.getElementById("agregarLibroForm");
    const mensajesContainer = document.getElementById("mensajesContainer");
    const btnMostrarLibros = document.getElementById("mostrarLibrosBtn");

    if (!form) return;

    // Verificar si el usuario es administrador, sino redirigir al login
    const userSession = LibreriaSession.getUserSession();
    if (!userSession || userSession.rol !== "ADMIN") {
      LibreriaSession.addMessage("error", "Debe iniciar sesión como administrador");
      console.log("ERROR, usuario no autorizado", userSession);
      router.navigate("/libreria/invitado-ingreso.html");
      return;
    }
    form.onsubmit = (e) => {
      e.preventDefault();
      mensajesContainer.innerHTML = "";

      try {
        const nuevoLibro = {
          isbn: form.isbn.value.trim(),
          titulo: form.titulo.value.trim(),
          autores: form.autores.value.trim(),
          portada: form.portada.value.trim(),
          resumen: form.resumen.value.trim(),
          stock: parseInt(form.stock.value),
          precio: parseFloat(form.precio.value),
        };

        // Validaciones básicas
        if (!nuevoLibro.isbn || !nuevoLibro.titulo)
          throw new Error("El ISBN y el título son obligatorios.");
        if (isNaN(nuevoLibro.precio) || nuevoLibro.precio < 0)
          throw new Error("El precio debe ser un número válido.");
        if (isNaN(nuevoLibro.stock) || nuevoLibro.stock < 0)
          throw new Error("El stock debe ser un número válido.");

        // Guardar libro en el modelo
        const libro = this.model.addLibro(nuevoLibro);
        console.log("Libro agregado:", libro);

        // Mensaje de éxito
        LibreriaSession.addMessage("success", `Libro agregado: ${libro.titulo}`);
        mensajesContainer.innerHTML = `<div class="message">Libro agregado correctamente: <strong>${libro.titulo}</strong></div>`;

        // Limpia el formulario después de 2 segundos
        setTimeout(() => {
          form.reset();
          mensajesContainer.innerHTML = "";
        }, 2000);
      } catch (err) {
        LibreriaSession.addMessage("error", err.message);
        mensajesContainer.innerHTML = `<div class="error">${err.message}</div>`;
      }
    };

  }
}

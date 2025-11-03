import { Presenter } from "../../commons/presenter.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";
import { router } from "../../commons/router.mjs";

export class AdminAgregarLibroPresenter extends Presenter {
  constructor(model, view, parentSelector) {
    super(model, view, parentSelector);
  }

  async refresh() {
    await super.refresh();

    const form = document.getElementById("agregarLibroForm");
    const mensajesContainer = document.getElementById("mensajesContainer");

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

        // Si se ha añadido el libro correctamente, enviar a home
        router.navigate("admin-home.html"); 
      } catch (err) {
        LibreriaSession.addMessage("error", err.message);
        mensajesContainer.innerHTML = `<div class="error">${err.message}</div>`;
      }
    };

        // Cerrar sesion
    const salirLink = document.getElementById("salirLink");
    if (salirLink) {
      salirLink.addEventListener("click", (e) => {
        e.preventDefault();
        LibreriaSession.clearUserSession();
        LibreriaSession.addMessage("success", "Sesión cerrada correctamente");
      });
    }
  }
}

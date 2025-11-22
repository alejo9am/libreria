import { Presenter } from "../../commons/presenter.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";
import { router } from "../../commons/router.mjs";
import { renderUltimoMensaje } from "../../commons/mensajes-helper.mjs";

export class AdminModificarLibroPresenter extends Presenter {
  constructor(model, view, parentSelector) {
    super(model, view, parentSelector);
  }

  get searchParams() {
    return new URLSearchParams(document.location.search);
  }

  get id() {
    return this.searchParams.get("id");
  }

  async getLibro() {
    return await this.model.getLibroPorId(this.id);
  }

  _fillForm(libro) {
    document.querySelector("#isbn").value = libro.isbn || "";
    document.querySelector("#titulo").value = libro.titulo || "";
    document.querySelector("#autores").value = libro.autores || "";
    document.querySelector("#portada").value = libro.portada || "";
    document.querySelector("#resumen").value = libro.resumen || "";
    document.querySelector("#stock").value = libro.stock ?? 0;
    document.querySelector("#precio").value = libro.precio ?? 0;
  }

  async refresh() {
    await super.refresh();

    const form = document.getElementById("modificarLibroForm");
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

    const libro = await this.getLibro();

    // Verificar si el libro existe ANTES de llenar el formulario
    if (!libro) {
      LibreriaSession.addMessage("error", "Libro no encontrado");
      renderUltimoMensaje("#mensajesContainer");
      return;
    }

    // Llenar el formulario con los datos del libro
    this._fillForm(libro);

    form.onsubmit = async (e) => {
      e.preventDefault();
      mensajesContainer.innerHTML = "";

      try {
        const libroActualizado = {
          _id: this.id,
          isbn: form.isbn.value.trim(),
          titulo: form.titulo.value.trim(),
          autores: form.autores.value.trim(),
          portada: form.portada.value.trim(),
          resumen: form.resumen.value.trim(),
          stock: parseInt(form.stock.value),
          precio: parseFloat(form.precio.value),
        };

        if (!libroActualizado.isbn || !libroActualizado.titulo)
          throw new Error("El ISBN y el título son obligatorios.");
        if (isNaN(libroActualizado.precio) || libroActualizado.precio < 0)
          throw new Error("El precio debe ser un número válido.");
        if (isNaN(libroActualizado.stock) || libroActualizado.stock < 0)
          throw new Error("El stock debe ser un número válido.");

        await this.model.updateLibro(libroActualizado);

        LibreriaSession.addMessage("success", `Libro modificado correctamente: ${libroActualizado.titulo}`);

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
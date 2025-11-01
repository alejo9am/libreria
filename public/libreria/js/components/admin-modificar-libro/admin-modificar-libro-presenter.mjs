import { Presenter } from "../../commons/presenter.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";
import { router } from "../../commons/router.mjs";

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

  getLibro() {
    return this.model.getLibroPorId(this.id);
  }

  async refresh() {
    await super.refresh();

    const form = document.getElementById("modificarLibroForm");
    const mensajesContainer = document.getElementById("mensajesContainer");
    if (!form) return;

    const libro = this.getLibro();
    if (!libro) {
      mensajesContainer.innerHTML = `<div class="error">Libro no encontrado</div>`;
      return;
    }

    form.isbn.value = libro.isbn || "";
    form.titulo.value = libro.titulo || "";
    form.autores.value = libro.autores || "";
    form.portada.value = libro.portada || "";
    form.resumen.value = libro.resumen || "";
    form.stock.value = libro.stock ?? 0;
    form.precio.value = libro.precio ?? 0;

    form.onsubmit = (e) => {
      e.preventDefault();
      mensajesContainer.innerHTML = "";

      try {
        const libroActualizado = {
          _id: libro._id, // mantener el id
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

        this.model.updateLibro(libroActualizado);

        LibreriaSession.addMessage("success", `Libro modificado correctamente: ${libroActualizado.titulo}`);

        router.navigate("admin-home.html");

      } catch (err) {
        LibreriaSession.addMessage("error", err.message);
        mensajesContainer.innerHTML = `<div class="error">${err.message}</div>`;
      }
    };
  }
}

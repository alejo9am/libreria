import { Presenter } from "../../commons/presenter.mjs";
import { AdminCatalogoLibroPresenter } from "../admin-catalogo-libro/admin-catalogo-libro-presenter.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";
import { router } from "../../commons/router.mjs";
import { renderUltimoMensaje } from "../../commons/mensajes-helper.mjs";

export class AdminHomePresenter extends Presenter {
  constructor(model, view, parentSelector) {
    super(model, view, parentSelector);
  }

  get catalogoElement() {
    return document.querySelector("#catalogo");
  }

  async refresh() {
    await super.refresh();

    // Mostrar el último mensaje
    renderUltimoMensaje("#mensajesContainer");

    // Verificar si el usuario es administrador, sino redirigir al login
    if (!LibreriaSession.esAdmin()) {
      LibreriaSession.addMessage("error", "Acceso no autorizado. Por favor, inicie sesión como administrador.");
      renderUltimoMensaje("#mensajesContainer");
      router.navigate("/libreria/invitado-ingreso.html");
      return;
    }
    renderUltimoMensaje("#mensajesContainer");
    let libros = await this.model.getLibros();

    await Promise.all(
      libros.map(async (l) => {
        return await new AdminCatalogoLibroPresenter(
          l,
          "admin-catalogo-libro",
          "#catalogo"
        ).refresh();
      })
    );

    // Cerrar sesion
    const salirLink = document.getElementById("salirLink");
    if (salirLink) {
      // Crear un nuevo elemento para eliminar todos los listeners anteriores
      const newSalirLink = salirLink.cloneNode(true);
      salirLink.parentNode.replaceChild(newSalirLink, salirLink);
      
      newSalirLink.addEventListener("click", (e) => {
        e.preventDefault();
        LibreriaSession.salir();
        router.navigate("/libreria/invitado-home.html");
        LibreriaSession.addMessage("success", "Sesión cerrada correctamente");
      });
    }

  }
}
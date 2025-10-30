import { Presenter } from "../../commons/presenter.mjs";
import { AdminCatalogoLibroPresenter } from "../admin-catalogo-libro/admin-catalogo-libro-presenter.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";
import { router } from "../../commons/router.mjs";

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
    const mensajesContainer = document.getElementById("mensajesContainer");
    const mensajes = LibreriaSession.getMessages();
    if (mensajes.length > 0) {
        const ultimo = mensajes[mensajes.length - 1]; // solo el último
        mensajesContainer.innerHTML = `<div class="message ${ultimo.type}">${ultimo.text}</div>`;
    }

    // Verificar si el usuario es administrador, sino redirigir al login
    const userSession = LibreriaSession.getUserSession();
    if (!userSession || userSession.rol !== "ADMIN") {
        LibreriaSession.addMessage("error", "Debe iniciar sesión como administrador");
        console.log("ERROR, usuario no autorizado", userSession);
        router.navigate("/libreria/invitado-ingreso.html");
        return;
    }
    
    let libros = this.model.getLibros();

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
      salirLink.addEventListener("click", (e) => {
        e.preventDefault();
        LibreriaSession.clearUserSession();
        LibreriaSession.addMessage("success", "Sesión cerrada correctamente");
      });
    }

  }
}
import { Presenter } from "../../commons/presenter.mjs";
import { ClienteCatalogoLibroPresenter } from "../cliente-catalogo-libro/cliente-catalogo-libro-presenter.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";
import { router } from "../../commons/router.mjs";
import { renderUltimoMensaje } from "../../commons/mensajes-helper.mjs";

export class ClienteHomePresenter extends Presenter {
  constructor(model, view, parentSelector) {
    super(model, view, parentSelector);
  }

  get catalogoElement() {
    return document.querySelector("#catalogo");
  }
  async refresh() {
    await super.refresh();

    // Obtener la URL anterior del router (SIN usar document.referrer)
        const previousUrl = router.previousUrl || '';
    
        // Páginas del navbar
        const noMostrarMensaje = ['cliente-carrito.html'];
        const vieneDeNoMostrar = noMostrarMensaje.some(pagina => previousUrl.includes(pagina));

        // Renderizar primero el mensaje
        renderUltimoMensaje("#mensajesContainer");
        
        // Obtener el div del mensaje que está dentro de #mensajesContainer
        const textoMensaje = document.querySelector("#mensajesContainer > div");
        
        if (textoMensaje) {

            if (!textoMensaje.innerHTML.includes("Compra realizada correctamente") && !textoMensaje.innerHTML.includes("Bienvenido,")) {
                // Limpiar mensajes si venimos de no mostrar
                LibreriaSession.clearMessages();
                textoMensaje.parentElement.innerHTML = "";
            }
        }
    
    // Verificar si el usuario es cliente, sino redirigir al login
    const userSession = LibreriaSession.getUserSession();
    if (!userSession || userSession.rol !== "CLIENTE") {
        LibreriaSession.addMessage("error", "Debe iniciar sesión como cliente");
        console.log("ERROR, usuario no autorizado", userSession);
        router.navigate("/libreria/invitado-ingreso.html");
        return;
    }
  
    let libros = this.model.getLibros();

    await Promise.all(
      libros.map(async (l) => {
        return await new ClienteCatalogoLibroPresenter(
          l,
          "cliente-catalogo-libro",
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
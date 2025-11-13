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

    

    // Obtener la URL anterior del router
    const previousUrl = router.previousUrl || '';

    // lista de paginas que muestran mensajes
    const paginasConMensajes = ['invitado-ingreso.html', 'cliente-comprar.html'];

    // Verificar si la URL anterior coincide con alguna de las páginas que muestran mensajes
    const mostrarMensaje = paginasConMensajes.some(pagina => previousUrl.includes(pagina));

    if (mostrarMensaje) {

        //obtenemos el contenido del mensaje de la sesión
        const mensajes = LibreriaSession.getMessages();
        if (mensajes && mensajes.length > 0) {
                
            const textoMensaje = mensajes[mensajes.length - 1].text;

            // Renderizar mensaje si contiene el texto esperado ("Bienvenido, ..." o "Compra relizada...")
            if (textoMensaje.includes("Bienvenido") || textoMensaje.includes("Compra realizada")) {
                renderUltimoMensaje("#mensajesContainer");
            }
        }
    }
    
    // Verificar si el usuario es cliente, sino redirigir al login
    const userSession = LibreriaSession.getUserSession();
    if (!userSession || userSession.rol !== "CLIENTE") {
        LibreriaSession.addMessage("error", "Debe iniciar sesión como cliente");
        console.log("ERROR, usuario no autorizado", userSession);
        //poner timeout antes de redirigir
        setTimeout(() => {
          router.navigate("/libreria/invitado-ingreso.html");
        }, 2000);
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
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

            // Renderizar mensaje si contiene el texto esperado ("Bienvenido, ..." o "Compra realizada...")
            if (textoMensaje.includes("Bienvenido") || textoMensaje.includes("Compra realizada")) {
                renderUltimoMensaje("#mensajesContainer");
            }
        }
    }
    
    // Verificar si el usuario es cliente, sino redirigir al login
    if (!LibreriaSession.esCliente()) {
      LibreriaSession.addMessage("error", "Acceso no autorizado. Por favor, inicie sesión como cliente.");
      renderUltimoMensaje("#mensajesContainer");
      router.navigate("/libreria/invitado-ingreso.html");
      return;
    }
  
    let libros = await this.model.getLibros();

    console.log("[ALEJO] Libros en el catálogo:", libros);

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
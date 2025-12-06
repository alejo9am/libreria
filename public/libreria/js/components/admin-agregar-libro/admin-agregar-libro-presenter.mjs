import { Presenter } from "../../commons/presenter.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";
import { router } from "../../commons/router.mjs";
import { clearMensajes, renderUltimoMensaje } from "../../commons/mensajes-helper.mjs";

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
    if (!LibreriaSession.esAdmin()) {
      LibreriaSession.addMessage("error", "Acceso no autorizado. Por favor, inicie sesión como administrador.");
      renderUltimoMensaje("#mensajesContainer");
      router.navigate("/libreria/invitado-ingreso.html");
      return;
    }
    form.onsubmit = async (e) => {
      e.preventDefault();
      clearMensajes("#mensajesContainer");
      
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
        const libro =  await this.model.addLibro(nuevoLibro);
        console.log("Libro agregado:", libro);

        // Mensaje de éxito
        LibreriaSession.addMessage("success", `Libro agregado: ${libro.titulo}`);

        // Si se ha añadido el libro correctamente, enviar a home
        router.navigate("admin-home.html"); 
      } catch (err) {
        LibreriaSession.addMessage("error", err.message);
        renderUltimoMensaje("#mensajesContainer");
      }
    };

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

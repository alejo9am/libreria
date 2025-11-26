// js/components/admin-perfil/admin-perfil-presenter.mjs

import { Presenter } from "../../commons/presenter.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";
import { router } from "../../commons/router.mjs";
import { renderUltimoMensaje } from "../../commons/mensajes-helper.mjs";

export class ClientePerfilPresenter extends Presenter {
  constructor(model, view, parentSelector) {
    super(model, view, parentSelector);
  }

  async refresh() {
    await super.refresh();

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
  
    // Buscar el usuario completo en el MODELO (no en localStorage)
    const cliente = await this.model.getClientePorId(userSession._id);

    if (!cliente) {
        LibreriaSession.addMessage("error", "Cliente no encontrado");
        router.navigate("/libreria/invitado-ingreso.html");
        return;
    }

    this.cliente = cliente;
    this._fillForm(cliente);
    this._attachHandlers();

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

  _fillForm(cliente) {
    document.querySelector("#dni").value = cliente.dni || "";
    document.querySelector("#nombre").value = cliente.nombre || "";
    document.querySelector("#apellidos").value = cliente.apellidos || "";
    document.querySelector("#direccion").value = cliente.direccion || "";
    document.querySelector("#email").value = cliente.email || "";
    document.querySelector("#password").value = ""; // No mostrar password
  }

  _attachHandlers() {
    const form = document.querySelector("#perfilForm");
    const mensajesContainer = document.querySelector("#mensajesContainer");

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      mensajesContainer.innerHTML = "";

      try {
        const nombre = form.nombre.value.trim();
        const apellidos = form.apellidos.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value.trim();
        const direccion = form.direccion.value.trim();
        const dni = form.dni.value.trim();

        if (!nombre || !apellidos || !email) {
          throw new Error("Nombre, apellidos y email son obligatorios");
        }

        // Preparar datos actualizados
        const datosActualizados = {
          _id: this.cliente._id,
          nombre: nombre,
          apellidos: apellidos,
          email: email,
          direccion: direccion,
          dni: dni,
          rol: this.cliente.rol
        };

        // Solo actualizar password si se proporciona uno nuevo
        if (password) {
          datosActualizados.password = password;
        } else {
          datosActualizados.password = this.cliente.password;
        }

        console.log("Actualizando perfil:", datosActualizados);

        // Actualizar en el modelo (servidor)
        const clienteActualizado = await this.model.updateCliente(datosActualizados);

        // Actualizar la referencia local
        this.cliente = clienteActualizado;
        // Actualizar sesión
        LibreriaSession.setUser(this.cliente);
        LibreriaSession.addMessage("success", "Perfil actualizado correctamente");
        renderUltimoMensaje("#mensajesContainer");

        // Limpiar campo de password
        form.password.value = "";

      } catch (err) {
        console.error("Error actualizando perfil:", err);
        LibreriaSession.addMessage("error", err.message);
        renderUltimoMensaje("#mensajesContainer");
      }
    });
  }
}
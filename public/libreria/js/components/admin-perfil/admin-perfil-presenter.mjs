// js/components/admin-perfil/admin-perfil-presenter.mjs

import { Presenter } from "../../commons/presenter.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";
import { router } from "../../commons/router.mjs";
import { renderUltimoMensaje } from "../../commons/mensajes-helper.mjs";

export class AdminPerfilPresenter extends Presenter {
  constructor(model, view, parentSelector) {
    super(model, view, parentSelector);
  }

  async refresh() {
    await super.refresh();

    // Verificar autenticación
    if (!LibreriaSession.esAdmin()) {
      LibreriaSession.addMessage("error", "Acceso no autorizado. Por favor, inicie sesión como administrador.");
      router.navigate("/libreria/invitado-ingreso.html");
      return;
    }

    const userSessionId = LibreriaSession.getUsuarioId();

    // Buscar el usuario completo en el MODELO (no en localStorage)
    const admin = await this.model.getAdminPorId(userSessionId);

    if (!admin) {
      LibreriaSession.addMessage("error", "Administrador no encontrado");
      router.navigate("/libreria/invitado-ingreso.html");
      return;
    }

    this.admin = admin;
    this._fillForm(admin);
    this._attachHandlers();

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

  _fillForm(admin) {
    document.querySelector("#dni").value = admin.dni || "";
    document.querySelector("#nombre").value = admin.nombre || "";
    document.querySelector("#apellidos").value = admin.apellidos || "";
    document.querySelector("#direccion").value = admin.direccion || "";
    document.querySelector("#email").value = admin.email || "";
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
          _id: this.admin._id,
          nombre: nombre,
          apellidos: apellidos,
          email: email,
          direccion: direccion,
          dni: dni,
          rol: this.admin.rol
        };

        // Solo actualizar password si se proporciona uno nuevo
        if (password) {
          datosActualizados.password = password;
        } else {
          datosActualizados.password = this.admin.password;
        }

        console.log("Actualizando perfil:", datosActualizados);

        // Actualizar en el modelo (esto también actualiza en localStorage automáticamente)
        await this.model.updateUsuario(datosActualizados);
        // Actualizar sesión
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
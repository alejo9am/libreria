// js/components/admin-perfil/admin-perfil-presenter.mjs

import { Presenter } from "../../commons/presenter.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";
import { router } from "../../commons/router.mjs";

export class AdminPerfilPresenter extends Presenter {
  constructor(model, view, parentSelector) {
    super(model, view, parentSelector);
  }

  async refresh() {
    await super.refresh();

    // Verificar autenticación
    const userSession = LibreriaSession.getUserSession();
    if (!userSession || userSession.rol !== "ADMIN") {
      LibreriaSession.addMessage("error", "Debe iniciar sesión como administrador");
      router.navigate("/libreria/invitado-ingreso.html");
      return;
    }

    // Buscar el usuario completo en el MODELO (no en localStorage)
    const admin = this.model.getUsuarioPorId(userSession._id);
    
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
      salirLink.addEventListener("click", (e) => {
        e.preventDefault();
        LibreriaSession.clearUserSession();
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

    form.addEventListener("submit", (ev) => {
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
        this.model.updateUsuario(datosActualizados);

        LibreriaSession.addMessage("success", "Perfil actualizado correctamente");
        mensajesContainer.innerHTML = `<div class="message">Perfil actualizado correctamente</div>`;

        // Limpiar campo de password
        form.password.value = "";

      } catch (err) {
        console.error("Error actualizando perfil:", err);
        LibreriaSession.addMessage("error", err.message);
        mensajesContainer.innerHTML = `<div class="error">${err.message}</div>`;
      }
    });
  }
}
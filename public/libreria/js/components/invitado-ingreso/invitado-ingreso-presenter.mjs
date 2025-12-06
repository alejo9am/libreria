// js/components/invitado-ingreso/invitado-ingreso-presenter.mjs

import { Presenter } from "../../commons/presenter.mjs";
import { ROL } from "../../model/proxy.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";
import { router } from "../../commons/router.mjs";
import { renderUltimoMensaje } from "../../commons/mensajes-helper.mjs";

export class InvitadoIngresoPresenter extends Presenter {
  constructor(model, view, parentSelector) {
    super(model, view, parentSelector);
  }

  async refresh() {
    await super.refresh();

    const form = document.getElementById("ingresoForm");
    const mensajesContainer = document.getElementById("mensajesContainer");
    const btnUsuarios = document.getElementById("mostrarUsuariosBtn");

    if (!form) return;

    form.onsubmit = async (e) => {
      e.preventDefault();
      mensajesContainer.innerHTML = "";

      try {
        const email = form.email.value.trim();
        const password = form.password.value.trim();
        const rolInput = form.rol.value.trim();

        if (!email || !password || !rolInput) {
          throw new Error("Debe completar todos los campos.");
        }

        // Determinar el rol esperado
        const rolEsperado = rolInput === "ADMIN" ? ROL.ADMIN : ROL.CLIENTE;

        console.log(`Intentando login: ${email} como ${rolEsperado}`);

        // Buscar usuario en el MODELO (ya tiene los usuarios de localStorage cargados)
        const token = await this.model.autenticar({
          email: email,
          password: password,
          rol: rolEsperado
        });

        // Guardar sesión
        LibreriaSession.setToken(token.token);
        let usuario = await this.model.getUsuarioActual();
        LibreriaSession.ingreso(usuario);

        // Si llegamos aquí, la autenticación fue exitosa
        console.log("Login exitoso:", usuario);

        LibreriaSession.addMessage("success", `Bienvenido, ${usuario.nombre} ${usuario.apellidos}`);
        renderUltimoMensaje("#mensajesContainer");
        // Redirigir según el rol
        setTimeout(() => {
          if (usuario.rol === ROL.ADMIN) {
            router.navigate("/libreria/admin-home.html");
          } else {
            router.navigate("/libreria/cliente-home.html");
          }
        }, 1000);

      } catch (err) {
        console.error("Error en login:", err);
        LibreriaSession.addMessage("error", err.message);
        renderUltimoMensaje("#mensajesContainer");
      }
    };
  }
}
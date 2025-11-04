// js/components/invitado-ingreso/invitado-ingreso-presenter.mjs

import { Presenter } from "../../commons/presenter.mjs";
import { ROL } from "../../model/model.mjs";
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

    form.onsubmit = (e) => {
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
        const usuario = this.model.autenticar({
          email: email,
          password: password,
          rol: rolEsperado
        });

        // Si llegamos aquí, la autenticación fue exitosa
        console.log("Login exitoso:", usuario);

        // Guardar sesión
        LibreriaSession.setUser(usuario);

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

    // Botón para depurar usuarios
    if (btnUsuarios) {
      btnUsuarios.onclick = () => {
        const usuarios = this.model.usuarios;

        if (usuarios.length === 0) {
          mensajesContainer.innerHTML = `<div class="log">No hay usuarios registrados.</div>`;
          return;
        }

        mensajesContainer.innerHTML = `
          <h3>👥 Usuarios registrados (${usuarios.length})</h3>
          <ul>
            ${usuarios.map(u => `
              <li>
                <strong>ID:</strong> ${u._id} | 
                <strong>Email:</strong> ${u.email} | 
                <strong>Rol:</strong> ${u.rol} | 
                <strong>Nombre:</strong> ${u.nombre} ${u.apellidos}
              </li>
            `).join("")}
          </ul>
          <p><em>Usa estos datos para hacer login. La contraseña es el DNI del usuario.</em></p>
        `;
      };
    }
  }
}
import { Presenter } from "../../commons/presenter.mjs";
import { model, ROL } from "../../model/model.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";
import { router } from "../../commons/router.mjs";

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

      const email = form.email.value.trim();
      const password = form.password.value.trim();
      const rolInput = form.rol.value.trim();

      mensajesContainer.innerHTML = "";

      try {
        if (!email || !password || !rolInput)
          throw new Error("Debe completar todos los campos.");

        // Rol solicitado
        const rolEsperado = rolInput === "ADMIN" ? ROL.ADMIN : ROL.CLIENTE;

        // Buscar usuarios por email (puede haber más de uno)
        const usuarios = LibreriaSession.getUsuarios().filter(u => u.email === email);

        if (usuarios.length === 0)
          throw new Error("El usuario no existe.");

        // Buscar el usuario con el rol solicitado
        const usuario = usuarios.find(u => u.rol === rolEsperado);

        if (!usuario)
          throw new Error(`No se encontró un usuario con el rol ${rolInput}.`);

        // Validar contraseña
        if (usuario.password !== password)
          throw new Error("Contraseña incorrecta.");

        // Guardar sesión (solo con el usuario y rol elegido)
        LibreriaSession.setUser({
          _id: usuario._id,
          email: usuario.email,
          rol: usuario.rol,
        });

        LibreriaSession.addMessage("success", `Bienvenido, ${usuario.email}`);
        mensajesContainer.innerHTML = `<div class="message">Ingreso correcto como ${usuario.rol}</div>`;

        // Redirigir según el rol
        setTimeout(() => {
          if (usuario.rol === ROL.ADMIN) {
            router.navigate("/libreria/admin-home.html");
          } else {
            router.navigate("/libreria/cliente-home.html");
          }
        }, 1500);
      } catch (err) {
        LibreriaSession.addMessage("error", err.message);
        mensajesContainer.innerHTML = `<div class="error">${err.message}</div>`;
      }
    };

    // Botón para depurar usuarios guardados
    if (btnUsuarios) {
      btnUsuarios.onclick = () => {
        const usuarios = LibreriaSession.getUsuarios();
        if (usuarios.length === 0) {
          mensajesContainer.innerHTML = `<div class="info">No hay usuarios guardados.</div>`;
          return;
        }

        mensajesContainer.innerHTML = `
          <h3>Usuarios registrados en localStorage</h3>
          <ul>
            ${usuarios
              .map((u) => `<li>${u._id} - ${u.dni} - ${u.email} - ${u.rol}</li>`)
              .join("")}
          </ul>
        `;
      };
    }
  }
}

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
                // Buscar usuario por email en localStorage (persistencia)
                const usuario = LibreriaSession.getUsuarioByEmail(email);

                if (!usuario) throw new Error("El usuario no existe.");
                if (usuario.password && usuario.password !== password)
                    throw new Error("Contraseña incorrecta.");

                const rolEsperado = rolInput === "ADMIN" ? ROL.ADMIN : ROL.CLIENTE;
                if (usuario.rol !== rolEsperado)
                    throw new Error(`El usuario no tiene el rol ${rolInput}.`);

                // Guardar sesión (en sessionStorage)
                LibreriaSession.setUser({
                    _id: usuario._id,
                    email: usuario.email,
                    rol: usuario.rol,
                });

                LibreriaSession.addMessage("success", `Bienvenido, ${usuario.email}`);
                mensajesContainer.innerHTML = `<div class="message">Ingreso correcto como ${usuario.rol}</div>`;

                // Espera 2 segundos antes de redirigir (para ver el mensaje)
                setTimeout(() => {
                    if (usuario.rol === ROL.ADMIN) {
                        router.navigate("/libreria/admin-dashboard.html");
                    } else {
                        router.navigate("/libreria/catalogo.html");
                    }
                }, 2000);

            } catch (err) {
                LibreriaSession.addMessage("error", err.message);
                mensajesContainer.innerHTML = `<div class="error">${err.message}</div>`;
            }
        };

        // Mostrar usuarios persistidos (solo para depurar)
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

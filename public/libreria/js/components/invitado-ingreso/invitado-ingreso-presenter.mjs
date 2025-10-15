// js/components/ingreso/invitado-ingreso-presenter.mjs
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
                // Buscamos el usuario por email
                const usuario = model.getUsuarioPorEmail(email);

                if (!usuario) {
                    throw new Error("El usuario no existe.");
                }

                // Validar contraseña
                if (usuario.password !== password) {
                    throw new Error("Contraseña incorrecta.");
                }

                // Validar rol
                const rolEsperado = rolInput === "ADMIN" ? ROL.ADMIN : ROL.CLIENTE;
                if (usuario.rol !== rolEsperado) {
                    throw new Error(`El usuario no tiene el rol ${rolInput}.`);
                }

                // Guardar en sesión
                LibreriaSession.setUser({
                    _id: usuario._id,
                    dni: usuario.dni,
                    rol: usuario.rol
                });

                LibreriaSession.addMessage("success", `Bienvenido, ${usuario.nombre || usuario.email}`);

                mensajesContainer.innerHTML = `<div class="message">Ingreso correcto como ${usuario.rol}</div>`;

                // Redirigir según rol
                if (usuario.rol === ROL.ADMIN) {
                    router.navigate("admin-dashboard.html");
                } else {
                    router.navigate("catalogo.html");
                }

                form.reset();
            } catch (err) {
                LibreriaSession.addMessage("error", err.message);
                mensajesContainer.innerHTML = `<div class="error">${err.message}</div>`;
            }
        };

        // Mostrar usuarios persistidos
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
                        .map(
                            (u) =>
                                `<li>${u._id} - ${u.dni} - ${u.email} - ${u.rol}</li>`
                        )
                        .join("")}
          </ul>
        `;
            };
        }
    }
}


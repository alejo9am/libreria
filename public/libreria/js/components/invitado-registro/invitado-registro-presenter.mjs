// js/components/registro/registro-presenter.mjs

import { Presenter } from "../../commons/presenter.mjs";
import { ROL } from "../../model/model.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";

export class InvitadoRegistroPresenter extends Presenter {
    constructor(model, view, parentSelector) {
        super(model, view, parentSelector);
    }

    async refresh() {
        await super.refresh();

        const form = document.getElementById("registroForm");
        const mensajesContainer = document.getElementById("mensajesContainer");
        const btnUsuarios = document.getElementById("mostrarUsuariosBtn");

        form.onsubmit = (e) => {
            e.preventDefault();

            try {
                const nuevoUsuario = {
                    dni: form.dni.value,
                    nombre: form.nombre.value,
                    apellidos: form.apellidos.value,
                    direccion: form.direccion.value,
                    email: form.email.value,
                    password: form.password.value,
                    rol: form.rol.value === "ADMIN" ? ROL.ADMIN : ROL.CLIENTE
                };
                console.log("Nuevo usuario a registrar:", nuevoUsuario);
                // Insertamos en el modelo
                this.model.addUsuario(nuevoUsuario);

                // Recuperamos el usuario recién creado (por email)
                const usuario = this.model.getUsuarioPorEmail(nuevoUsuario.email);

                // Guardamos en sesión, lo comento porque no queremos loguear al usuario al registrarse
                // LibreriaSession.setUser(usuario);

                // Guardamos en localStorage el usuario, si el email existe comprueba el ROL,
                // si el ROL es diferente al que tiene, crea un usuario nuevo con el mismo email pero diferente ROL
                if (usuario.email === LibreriaSession.getUsuarioByEmail(usuario.email)?.email) {
                    if (usuario.rol !== LibreriaSession.getUsuarioByEmail(usuario.email)?.rol) {
                        LibreriaSession.saveUsuario(usuario);
                        LibreriaSession.addMessage("success", "Usuario registrado con éxito");
                    }
                    else {
                        LibreriaSession.addMessage("error", "El email ya está registrado con ese ROL.");
                    }
                } else {
                    LibreriaSession.saveUsuario(usuario);
                    LibreriaSession.addMessage("success", "Usuario registrado con éxito");
                }

                mensajesContainer.innerHTML =
                    `<div class="message">Registro completado: ${usuario.email} (${usuario.rol})</div>`;

                form.reset();
            } catch (err) {
                LibreriaSession.addMessage("error", err.message);
                mensajesContainer.innerHTML = `<div class="error">${err.message}</div>`;
            }
        };

        if (btnUsuarios) {
            btnUsuarios.onclick = () => {
                const usuarios = LibreriaSession.getUsuarios();
                mensajesContainer.innerHTML = `
                    <h3>Usuarios registrados</h3>
                    <ul>
                        ${usuarios.map(u =>
                    `<li>${u._id} - ${u.dni} - ${u.email} - ${u.rol}</li>`
                ).join("")}
                    </ul>
                `;
            };
        }
    }
}

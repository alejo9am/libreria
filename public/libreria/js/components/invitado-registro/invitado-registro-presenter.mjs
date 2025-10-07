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

                // Insertamos en el modelo
                this.model.addUsuario(nuevoUsuario);

                // Recuperamos el usuario recién creado (por email)
                const usuario = this.model.getUsuarioPorEmail(nuevoUsuario.email);

                // Guardamos en sesión
                LibreriaSession.setUser(usuario);
                LibreriaSession.addMessage("message", "Usuario registrado con éxito");

                mensajesContainer.innerHTML =
                    `<div class="message">Registro completado: ${usuario.email} (${usuario.rol})</div>`;

                form.reset();
            } catch (err) {
                LibreriaSession.addMessage("error", err.message);
                mensajesContainer.innerHTML = `<div class="error">${err.message}</div>`;
            }
        };
    }
}

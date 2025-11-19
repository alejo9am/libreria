import { Presenter } from "../../commons/presenter.mjs";
import { ROL } from "../../model/proxy.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";
import { clearMensajes, renderUltimoMensaje } from "../../commons/mensajes-helper.mjs";

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
            clearMensajes("#mensajesContainer");

            try {
                const nuevoUsuario = {
                    dni: form.dni.value.trim(),
                    nombre: form.nombre.value.trim(),
                    apellidos: form.apellidos.value.trim(),
                    direccion: form.direccion.value.trim(),
                    email: form.email.value.trim(),
                    password: form.password.value.trim(),
                    rol: form.rol.value === "ADMIN" ? ROL.ADMIN : ROL.CLIENTE
                };

                // Validaciones básicas
                if (!nuevoUsuario.email || !nuevoUsuario.password) {
                    throw new Error("Email y contraseña son obligatorios");
                }
                if (!nuevoUsuario.nombre || !nuevoUsuario.apellidos) {
                    throw new Error("Nombre y apellidos son obligatorios");
                }
                if (!nuevoUsuario.dni) {
                    throw new Error("DNI es obligatorio");
                }

                console.log("Intentando registrar usuario:", nuevoUsuario.email, nuevoUsuario.rol);

                // Insertamos en el modelo (esto también lo guarda en localStorage automáticamente)
                // El modelo ya valida que no exista otro usuario con el mismo email Y rol
                const usuario = this.model.addUsuario(nuevoUsuario);

                LibreriaSession.addMessage("success", `Usuario registrado: ${usuario.email} (${usuario.rol})`);
                renderUltimoMensaje("#mensajesContainer");

                form.reset();

            } catch (err) {
                console.error("Error en registro:", err);
                LibreriaSession.addMessage("error", err.message);
                renderUltimoMensaje("#mensajesContainer");
            }
        };

        // Botón de depuración
        if (btnUsuarios) {
            btnUsuarios.onclick = () => {
                // Mostrar usuarios del MODELO (fuente de verdad)
                const usuarios = this.model.usuarios;

                if (usuarios.length === 0) {
                    mensajesContainer.innerHTML = `<div class="log">No hay usuarios en el modelo.</div>`;
                    return;
                }

                // Agrupar usuarios por email para mostrar los que comparten email
                const usuariosPorEmail = {};
                usuarios.forEach(u => {
                    if (!usuariosPorEmail[u.email]) {
                        usuariosPorEmail[u.email] = [];
                    }
                    usuariosPorEmail[u.email].push(u);
                });

                // Identificar emails con múltiples roles
                const emailsMultiples = Object.keys(usuariosPorEmail).filter(
                    email => usuariosPorEmail[email].length > 1
                );

                mensajesContainer.innerHTML = `
                    <h3>Usuarios en el MODELO (${usuarios.length})</h3>
                    ${emailsMultiples.length > 0 ? `
                        <div style="background: #ffffcc; padding: 10px; border: 2px solid #ff9800; margin-bottom: 10px;">
                            <strong>Emails con múltiples roles (${emailsMultiples.length}):</strong>
                            <ul>
                                ${emailsMultiples.map(email => `
                                    <li><strong>${email}</strong>: ${usuariosPorEmail[email].map(u => u.rol).join(', ')}</li>
                                `).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: #f0f0f0; border-bottom: 2px solid #333;">
                                <th style="padding: 8px; text-align: left;">ID</th>
                                <th style="padding: 8px; text-align: left;">Email</th>
                                <th style="padding: 8px; text-align: left;">Rol</th>
                                <th style="padding: 8px; text-align: left;">Nombre</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${usuarios.map(u => {
                    const tieneMultiplesRoles = usuariosPorEmail[u.email].length > 1;
                    const style = tieneMultiplesRoles ?
                        'background: #fff9c4; border-left: 4px solid #ff9800;' : '';
                    return `
                                    <tr style="${style}">
                                        <td style="padding: 8px;">${u._id}</td>
                                        <td style="padding: 8px;">${u.email}</td>
                                        <td style="padding: 8px;"><strong>${u.rol}</strong></td>
                                        <td style="padding: 8px;">${u.nombre} ${u.apellidos}</td>
                                    </tr>
                                `;
                }).join("")}
                        </tbody>
                    </table>
                    <p style="margin-top: 15px;"><em>
                        Los usuarios con fondo amarillo comparten el mismo email pero tienen diferentes roles.
                    </em></p>
                `;
            };
        }
    }
}
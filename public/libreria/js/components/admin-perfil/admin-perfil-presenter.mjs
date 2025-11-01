import { Presenter } from "../../commons/presenter.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";
import { router } from "../../commons/router.mjs";

export class AdminPerfilPresenter extends Presenter {
  constructor(model, view, parentSelector) {
    super(model, view, parentSelector);
  }

  async refresh() {
    await super.refresh();

    const userSession = LibreriaSession.getUserSession();

    // Verificación de sesión
    if (!userSession || userSession.rol !== "ADMIN") {
      LibreriaSession.addMessage("error", "Debe iniciar sesión como administrador");
      router.navigate("/libreria/invitado-ingreso.html");
      return;
    }

    // Cargar usuario desde localStorage
    const admin = LibreriaSession.getUsuarioByEmail(userSession.email);
    if (!admin) {
      LibreriaSession.addMessage("error", "Administrador no encontrado");
      router.navigate("/libreria/invitado-ingreso.html");
      return;
    }

    this.admin = admin; // Guardamos referencia
    this._fillForm(admin);
    this._attachHandlers();
  }

  _fillForm(admin) {
    // Rellenamos campos y bloqueamos por defecto
    document.querySelector("#dni").value = admin.dni || "";
    document.querySelector("#nombre").value = admin.nombre || "";
    document.querySelector("#apellidos").value = admin.apellidos || "";
    document.querySelector("#direccion").value = admin.direccion || "";
    document.querySelector("#email").value = admin.email || "";
    document.querySelector("#password").value = admin.password || "";

  }

  _attachHandlers() {
    const form = document.querySelector("#perfilForm");
    const mensajesContainer = document.querySelector("#mensajesContainer");

    // Guardar cambios
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();

      const nombre = form.nombre.value.trim();
      const apellidos = form.apellidos.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value.trim();
      const direccion = form.direccion.value.trim();
      const dni = form.dni.value.trim();

      try {
        if (!nombre || !apellidos || !email) throw new Error("Todos los campos son obligatorios");

        // Actualizamos usuario en localStorage
        this.admin.nombre = nombre;
        this.admin.apellidos = apellidos;
        this.admin.email = email;
        this.admin.direccion = direccion;
        this.admin.dni = dni;
        if (password) this.admin.password = password;

        LibreriaSession.putUsuario(this.admin);

        this._mostrarMensaje("success", "Perfil actualizado correctamente");

      } catch (err) {
        this._mostrarMensaje("error", err.message);
      }
    });
  }
}

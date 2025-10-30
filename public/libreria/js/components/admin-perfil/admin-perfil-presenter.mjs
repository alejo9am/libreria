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
    document.querySelector("#nombre").value = admin.nombre || "";
    document.querySelector("#apellidos").value = admin.apellidos || "";
    document.querySelector("#email").value = admin.email || "";
    document.querySelector("#password").value = "";

    // Bloquear todos los campos inicialmente
    document.querySelector("#nombre").disabled = true;
    document.querySelector("#apellidos").disabled = true;
    document.querySelector("#email").disabled = true;
    document.querySelector("#password").disabled = true;
  }

  _attachHandlers() {
    const form = document.querySelector("#perfilForm");
    const mensajesContainer = document.querySelector("#mensajesContainer");

    const btnModificar = document.querySelector("#btnModificar");

    // Botón modificar desbloquea campos
    btnModificar.addEventListener("click", (ev) => {
      ev.preventDefault();
      document.querySelector("#nombre").disabled = false;
      document.querySelector("#apellidos").disabled = false;
      document.querySelector("#email").disabled = false;
      document.querySelector("#password").disabled = false;
    });

    // Guardar cambios
    form.addEventListener("submit", (ev) => {
      ev.preventDefault();

      const nombre = form.nombre.value.trim();
      const apellidos = form.apellidos.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value.trim();

      try {
        if (!nombre || !apellidos || !email) throw new Error("Todos los campos son obligatorios");

        // Actualizamos usuario en localStorage
        this.admin.nombre = nombre;
        this.admin.apellidos = apellidos;
        this.admin.email = email;
        if (password) this.admin.password = password;

        LibreriaSession.putUsuario(this.admin);

        this._mostrarMensaje("success", "Perfil actualizado correctamente");
        form.password.value = "";

        // Bloquear campos otra vez
        document.querySelector("#nombre").disabled = true;
        document.querySelector("#apellidos").disabled = true;
        document.querySelector("#email").disabled = true;
        document.querySelector("#password").disabled = true;

      } catch (err) {
        this._mostrarMensaje("error", err.message);
      }
    });

    // Logout
    document.querySelector("#logoutLink").addEventListener("click", (ev) => {
      ev.preventDefault();
      LibreriaSession.clearUserSession();
      LibreriaSession.addMessage("info", "Sesión cerrada correctamente");
      router.navigate("/libreria/invitado-ingreso.html");
    });
  }

  _mostrarMensaje(tipo, texto, tiempo = 2500) {
    const cont = document.querySelector("#mensajesContainer");
    cont.innerHTML = `<div class="msg ${tipo}">${texto}</div>`;
    setTimeout(() => (cont.innerHTML = ""), tiempo);
  }
}

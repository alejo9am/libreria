
import { model } from "./model/model.mjs";
import { router } from "./commons/router.mjs";
import { InvitadoHomePresenter } from "./components/invitado-home/invitado-home-presenter.mjs";
import { InvitadoCatalogoPresenter } from "./components/invitado-catalogo/invitado-catalogo-presenter.mjs";
import { InvitadoVerLibroPresenter } from "./components/invitado-ver-libro/invitado-ver-libro-presenter.mjs";
import { InvitadoRegistroPresenter } from "./components/invitado-registro/invitado-registro-presenter.mjs";
import { InvitadoIngresoPresenter } from "./components/invitado-ingreso/invitado-ingreso-presenter.mjs";
import { AdminHomePresenter } from "./components/admin-home/admin-home-presenter.mjs";
import { ClienteHomePresenter } from "./components/cliente-home/cliente-home-presenter.mjs";
import { seed } from "./model/seeder.mjs";

export function init() {
  seed();
  // console.log(model)
  // Distintas maneras de entrar a la página principal
  router.register(/^\/libreria\/index.html$/, new InvitadoHomePresenter(model, 'invitado-home'));
  router.register(/^\/libreria\/invitado-home.html$/, new InvitadoHomePresenter(model, 'invitado-home'));
  router.register(/^\/libreria\/$/, new InvitadoHomePresenter(model, 'invitado-home'));

  // Otras páginas
  router.register(/^\/libreria\/catalogo.html$/, new InvitadoCatalogoPresenter(model, 'invitado-catalogo'));
  router.register(/^\/libreria\/invitado-ver-libro.html/, new InvitadoVerLibroPresenter(model, 'invitado-ver-libro'));
  router.register(/^\/libreria\/invitado-registro.html$/, new InvitadoRegistroPresenter(model, 'invitado-registro'));
  router.register(/^\/libreria\/invitado-ingreso.html$/, new InvitadoIngresoPresenter(model, 'invitado-ingreso'));
  router.register(/^\/libreria\/cliente-home.html$/, new ClienteHomePresenter(model, 'cliente-home'));

  router.register(/^\/libreria\/admin-home.html$/, new AdminHomePresenter(model, 'admin-home'));
  // router.register(/^\/libreria\/home.html$/, new HomePresenter(model, 'home'));
  // router.register(/^\/libreria$/, new HomePresenter(model, 'home'));
  // router.register(/^\/libreria\/agregar-libro.html$/, new AgregarLibroPresenter(model, 'agregar-libro'));
  router.handleLocation();
}
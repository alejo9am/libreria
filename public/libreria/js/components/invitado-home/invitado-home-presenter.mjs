import { Presenter } from "../../commons/presenter.mjs";
import { InvitadoCatalogoLibroPresenter } from "../invitado-catalogo-libro/invitado-catalogo-libro-presenter.mjs";
import { renderUltimoMensaje } from "../../commons/mensajes-helper.mjs";

export class InvitadoHomePresenter extends Presenter {
  constructor(model, view, parentSelector) {
    super(model, view, parentSelector);
  }

  get catalogoElement() {
    return document.querySelector("#catalogo");
  }
  async refresh() {
    await super.refresh();

    /* renderUltimoMensaje("#mensajesContainer"); */
    let libros = this.model.getLibros(); 

    await Promise.all(
      libros.map(async (l) => {
        return await new InvitadoCatalogoLibroPresenter(
          l,
          "invitado-catalogo-libro",
          "#catalogo"
        ).refresh();
      })
    );
  }
}
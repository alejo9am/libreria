import { Presenter } from "../../commons/presenter.mjs";
import { ClienteCatalogoLibroPresenter } from "../cliente-catalogo-libro/cliente-catalogo-libro-presenter.mjs";

export class ClienteCatalogoPresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
  }

  get catalogoElement() {
    return document.querySelector("#catalogo");
  }
  async refresh() {
    await super.refresh();
    let libros = await this.model.getLibros();

    await Promise.all(
      libros.map(async (l) => {
        return await new ClienteCatalogoLibroPresenter(
          l,
          "cliente-catalogo-libro",
          "#catalogo"
        ).refresh();
      })
    );
  }
}
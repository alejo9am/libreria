import { Presenter } from "../../commons/presenter.mjs";
import { AdminCatalogoLibroPresenter } from "../admin-catalogo-libro/admin-catalogo-libro-presenter.mjs";

export class AdminCatalogoPresenter extends Presenter {
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
        return await new AdminCatalogoLibroPresenter(
          l,
          "admin-catalogo-libro",
          "#catalogo"
        ).refresh();
      })
    );
  }
}

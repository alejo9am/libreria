import { Presenter } from "../../commons/presenter.mjs";

export class InvitadoCatalogoLibroPresenter extends Presenter {
  constructor(model, view, parentSelector) {
    super(model, view, parentSelector);
  }

  async refresh() {
    let html = await this.getHTML();
    this.parentElement.insertAdjacentHTML('beforeend', html);

    let node = this.parentElement.querySelector(`#titulo`);
    node.setAttribute('id', `titulo_${this.model._id}`);
    node.innerHTML = this.model.titulo;

    node = this.parentElement.querySelector(`#verLink`);
    node.setAttribute('id', `verLink_${this.model._id}`);
    node.setAttribute('href', `invitado-ver-libro.html?id=${this.model._id}`);
    this.attachAnchors();
  }
}
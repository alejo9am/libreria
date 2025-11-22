import { Presenter } from "../../commons/presenter.mjs";

export class AdminCatalogoLibroPresenter extends Presenter {
  constructor(model, view, parentSelector) {
    super (model, view, parentSelector);
  }

  setLibroField(name, value) {
    let node = this.parentElement.querySelector(`#${name}`);
    node.setAttribute('id', `${name}_${this.model._id}`);
    node.innerHTML = value;
  }

  setLibroFields() {
    this.setLibroField('titulo', this.model.titulo);
    this.setLibroField('autores', this.model.autores);
    this.setLibroField('isbn', this.model.isbn);
    this.setLibroField('precio', `€ ${this.model.precio}`);
  }

  setVerButton() {
    let node = this.parentElement.querySelector(`#verButton`);
    node.setAttribute('id', `ver_${this.model._id}`);
    node.setAttribute('href', `admin-ver-libro.html?id=${this.model._id}`);
  }

  async refresh() {
    try {
      let html = await this.getHTML();
      this.parentElement.insertAdjacentHTML('beforeend', html);
      this.setLibroFields();
      this.setVerButton();
      this.attachAnchors();
    } catch (err) { console.error(err); };
  }
}
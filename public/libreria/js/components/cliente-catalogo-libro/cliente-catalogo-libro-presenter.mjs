import { Presenter } from "../../commons/presenter.mjs";

export class ClienteCatalogoLibroPresenter extends Presenter {
  constructor(model, view, parentSelector) {
    super(model, view, parentSelector);
  }

  async refresh() {
    const html = await this.getHTML();
    this.parentElement.insertAdjacentHTML('beforeend', html);

    // obtenemos el último <article> insertado
    const libroElement = this.parentElement.lastElementChild;
    if (!libroElement) return;

    // Título
    const tituloNode = libroElement.querySelector('#titulo');
    if (tituloNode) {
      tituloNode.setAttribute('id', `titulo_${this.model._id}`);
      tituloNode.textContent = this.model.titulo || '';
    }

    // Autores
    const autoresNode = libroElement.querySelector('.autores');
    if (autoresNode) {
      if (Array.isArray(this.model.autores))
        autoresNode.textContent = this.model.autores.join('; ');
      else autoresNode.textContent = this.model.autores || '';
    }

    // ISBN
    const isbnNode = libroElement.querySelector('.isbn');
    if (isbnNode) isbnNode.textContent = this.model.isbn || '';

    // Precio
    const precioNode = libroElement.querySelector('.precio');
    if (precioNode) {
        precioNode.textContent = `€ ${this.model.precio || ''}`;
    }

    // Desactivado porque ruta a la imagen no esta implementada
    // Portada
    // const portadaNode = libroElement.querySelector('img.portada');
    // if (portadaNode && this.model.portada)
    //   portadaNode.src = this.model.portada;

    // Enlace "Ver"
    const verLinkNode = libroElement.querySelector('#verLink');
    if (verLinkNode) {
      verLinkNode.setAttribute('href', `cliente-ver-libro.html?id=${this.model._id}`);
    }

    if (typeof this.attachAnchors === 'function') this.attachAnchors();
  }
}

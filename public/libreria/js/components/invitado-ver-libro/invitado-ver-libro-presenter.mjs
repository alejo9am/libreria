import { Presenter } from "../../commons/presenter.mjs";
import { proxy } from "../../model/proxy.mjs";

export class InvitadoVerLibroPresenter extends Presenter {

  constructor(proxy, view) {
    super(proxy, view);
  }

  get catalogoElement() {
    return document.querySelector('#catalogo');
  }

  get searchParams() {
    return new URLSearchParams(document.location.search);
  }

  get id() {
    return this.searchParams.get('id');
  }

  async getLibro() {
    return await this.model.getLibroPorId(this.id);
  }

  set libro(libro) {
    this.isbn = libro.isbn;
    this.titulo = libro.titulo;
    this.autores = libro.autores;
    this.resumen = libro.resumen;
    this.stock = libro.stock;
    this.precio = libro.precio;
  }

  get isbnParagraph() {
    return document.querySelector('#isbnParagraph');
  }

  set isbn(isbn) {
    this.isbnParagraph.textContent = isbn;
  }
  get tituloParagraph() {
    return document.querySelector('#tituloParagraph');
  }

  set titulo(titulo) {
    this.tituloParagraph.textContent = titulo;
  }
  get autoresParagraph() {
    return document.querySelector('#autoresParagraph');
  }

  set autores(autores) {
    this.autoresParagraph.textContent = autores;
  }

  get resumenParagraph() {
    return document.querySelector('#resumenParagraph');
  }

  set resumen(resumen) {
    this.resumenParagraph.textContent = resumen;
  }
  get precioParagraph() {
    return document.querySelector('#precioParagraph');
  }

  set precio(precio) {
    this.precioParagraph.textContent = precio;
  }

  get stockParagraph() {
    return document.querySelector('#stockParagraph');
  }

  set stock(stock) {
    this.stockParagraph.textContent = stock;
  }

  async refresh() {
    try {
      await super.refresh();
      const libro = await this.getLibro();

      if (libro) {
        this.libro = libro;
        document.querySelector('#verLibroTitulo').textContent = `Titulo: ${libro.titulo}`;
      } else {
        console.error(`Libro ${this.id} not found!`);
      }
    } catch (error) {
      console.error('Error al cargar el libro:', error);
    }
  }

}
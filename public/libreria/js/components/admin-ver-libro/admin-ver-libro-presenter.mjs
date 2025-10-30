import { Presenter } from "../../commons/presenter.mjs";
import { router } from "../../commons/router.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";

export class AdminVerLibroPresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
  }

  get catalogoElement() {
    return document.querySelector("#catalogo");
  }

  get searchParams() {
    return new URLSearchParams(document.location.search);
  }

  get id() {
    return this.searchParams.get("id");
  }

  getLibro() {
    return this.model.getLibroPorId(this.id);
  }

  get borrarLibroElement() {
    return document.querySelector(".borrarLibro");
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
    console.log(document);
    return document.querySelector("#isbnParagraph");
  }

  set isbn(isbn) {
    this.isbnParagraph.textContent = isbn;
  }
  get tituloParagraph() {
    return document.querySelector("#tituloParagraph");
  }

  set titulo(titulo) {
    this.tituloParagraph.textContent = titulo;
  }
  get autoresParagraph() {
    return document.querySelector("#autoresParagraph");
  }

  set autores(autores) {
    this.autoresParagraph.textContent = autores;
  }

  get resumenParagraph() {
    return document.querySelector("#resumenParagraph");
  }

  set resumen(resumen) {
    this.resumenParagraph.textContent = resumen;
  }
  get precioParagraph() {
    return document.querySelector("#precioParagraph");
  }

  set precio(precio) {
    this.precioParagraph.textContent = precio;
  }

  get stockParagraph() {
    return document.querySelector("#stockParagraph");
  }

  set stock(stock) {
    this.stockParagraph.textContent = stock;
  }

  get modificarLink() {
    return document.querySelector("#modificarLink");
  }

  async refresh() {
    await super.refresh();
    console.log(this.id);
    let libro = this.getLibro();
    if (libro) this.libro = libro;
    else console.error(`Libro ${id} not found!`);

    document.querySelector(
      "#verLibroTitulo"
    ).textContent = `Titulo: ${libro.titulo}`;
    const mensajesContainer = document.getElementById("mensajesContainer");
    mensajesContainer.innerHTML = "";

    if (this.modificarLink) {
      this.modificarLink.addEventListener("click", (e) => {
        e.preventDefault();
        router.navigate(`admin-modificar-libro.html?id=${this.id}`);
      });
    }

    if (this.borrarLibroElement) {
      this.borrarLibroElement.addEventListener("click", () => {
        try {
          this.model.removeLibro(this.id);
          LibreriaSession.addMessage({
            type: "info",
            text: "Libro borrado correctamente",
          });
          mensajesContainer.innerHTML = `<div class="message">Libro ${this.titulo} borrado correctamente</div>`;
          setTimeout(() => {
            router.navigate("admin-home.html");
          }, 2000);
        } catch (err) {
          console.error(err);
          LibreriaSession.addMessage({ type: "error", text: err.message });
        }
      });
    }
  }
}

import { Presenter } from "../../commons/presenter.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";
import { router } from "../../commons/router.mjs";
import { renderUltimoMensaje } from "../../commons/mensajes-helper.mjs";

export class ClienteVerLibroPresenter extends Presenter {

  constructor(model, view) {
    super(model, view);
    this._isNavigating = false;
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
    if (this._isNavigating) return;
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
    const elem = this.isbnParagraph;
    if (elem) elem.textContent = isbn;
  }
  get tituloParagraph() {
    return document.querySelector('#tituloParagraph');
  }

  set titulo(titulo) {
    const elem = this.tituloParagraph;
    if (elem) elem.textContent = titulo;
  }
  get autoresParagraph() {
    return document.querySelector('#autoresParagraph');
  }

  set autores(autores) {
    const elem = this.autoresParagraph;
    if (elem) elem.textContent = autores;
  }

  get resumenParagraph() {
    return document.querySelector('#resumenParagraph');
  }

  set resumen(resumen) {
    const elem = this.resumenParagraph;
    if (elem) elem.textContent = resumen;
  }
  get precioParagraph() {
    return document.querySelector('#precioParagraph');
  }

  set precio(precio) {
    const elem = this.precioParagraph;
    if (elem) elem.textContent = precio;
  }

  get stockParagraph() {
    return document.querySelector('#stockParagraph');
  }

  set stock(stock) {
    const elem = this.stockParagraph;
    if (elem) elem.textContent = stock;
  }



  async refresh() {
    this._isNavigating = false;
    await super.refresh();
    
    // Verificar si el usuario es cliente, sino redirigir al login
    if (!LibreriaSession.esCliente()) {
      LibreriaSession.addMessage("error", "Acceso no autorizado. Por favor, inicie sesión como cliente.");
      router.navigate("/libreria/invitado-ingreso.html");
      return;
    }

    // Cerrar sesion
    const salirLink = document.getElementById("salirLink");
    if (salirLink) {
      // Crear un nuevo elemento para eliminar todos los listeners anteriores
      const newSalirLink = salirLink.cloneNode(true);
      salirLink.parentNode.replaceChild(newSalirLink, salirLink);
      
      newSalirLink.addEventListener("click", (e) => {
        e.preventDefault();
        LibreriaSession.salir();
        router.navigate("/libreria/invitado-home.html");
        LibreriaSession.addMessage("success", "Sesión cerrada correctamente");
      });
    }

    console.log(this.id);
    let libro = await this.getLibro();
    if (libro) this.libro = libro;
    else console.error(`Libro ${id} not found!`);

    const tituloElem = document.querySelector('#verLibroTitulo');
    if (tituloElem && libro) tituloElem.textContent = `Titulo: ${libro.titulo}`;
    
    const mensajesContainer = document.getElementById("mensajesContainer");
    const agregarCarritoBtn = document.getElementById("agregarCarritoBtn");

    console.log('[ClienteVerLibroPresenter] agregarCarritoBtn encontrado:', agregarCarritoBtn);

    if (agregarCarritoBtn) {
      console.log('[ClienteVerLibroPresenter] Asignando addEventListener al botón');
      // Reemplazar onclick para evitar conflicto con router.route
      agregarCarritoBtn.onclick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('[ClienteVerLibroPresenter] Click detectado en agregarCarritoBtn');
        if (mensajesContainer) mensajesContainer.innerHTML = "";

        try {
          const userId = LibreriaSession.getUsuarioId();
          console.log('[ClienteVerLibroPresenter] userId:', userId);
          if (!userId) throw new Error('Debe iniciar sesión para añadir al carrito');

          console.log('[ClienteVerLibroPresenter] libro._id:', libro._id);
          // Verificar stock antes de añadir
          if (libro.stock <= 0) {
            throw new Error('No hay stock disponible para este libro');
          }
          // Añadir 1 unidad del libro al carrito del cliente
          await this.model.addClienteCarroItem(userId, { libro: libro._id, cantidad: 1 });

          // Mensaje de éxito persistido (se mostrará en la página del carrito)
          LibreriaSession.addMessage("success", `Libro agregado a carrito: ${libro.titulo}`);
          // Marcar que estamos navegando para prevenir actualizaciones del DOM
          this._isNavigating = true;
          // Navegar inmediatamente al carrito, donde se mostrará el mensaje
          router.navigate('/libreria/cliente-carrito.html');

        } catch (err) {
          console.error('[ClienteVerLibroPresenter] Error:', err);
          LibreriaSession.addMessage('error', err.message);
          renderUltimoMensaje("#mensajesContainer");
          // Si no está autenticado, redirigir al formulario de ingreso pasado 1s
          if (err.message && err.message.toLowerCase().includes('iniciar sesión')) {
            setTimeout(() => router.navigate('/libreria/invitado-ingreso.html'), 1000);
          }
        }
      };
    }

  }

}
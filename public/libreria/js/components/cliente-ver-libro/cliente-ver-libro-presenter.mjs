import { Presenter } from "../../commons/presenter.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";
import { router } from "../../commons/router.mjs";

export class ClienteVerLibroPresenter extends Presenter {

  constructor(model, view) {
    super(model, view);
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
    console.log(document);
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
    await super.refresh();
    
    // Verificar si el usuario es cliente, sino redirigir al login
    const userSession = LibreriaSession.getUserSession();
    if (!userSession || userSession.rol !== "CLIENTE") {
        LibreriaSession.addMessage("error", "Debe iniciar sesión como cliente");
        console.log("ERROR, usuario no autorizado", userSession);
        //poner timeout antes de redirigir
        setTimeout(() => {
          router.navigate("/libreria/invitado-ingreso.html");
        }, 2000);
        return;
    }

    console.log(this.id);
    let libro = await this.getLibro();
    if (libro) this.libro = libro;
    else console.error(`Libro ${id} not found!`);

    document.querySelector('#verLibroTitulo').textContent=`Titulo: ${libro.titulo}`
    const mensajesContainer = document.getElementById("mensajesContainer");
    const agregarCarritoBtn = document.getElementById("agregarCarritoBtn");

    console.log('[ClienteVerLibroPresenter] agregarCarritoBtn encontrado:', agregarCarritoBtn);

    if (agregarCarritoBtn) {
      console.log('[ClienteVerLibroPresenter] Asignando addEventListener al botón');
      // Usar addEventListener en lugar de onclick para que tenga prioridad
      agregarCarritoBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('[ClienteVerLibroPresenter] Click detectado en agregarCarritoBtn');
        if (mensajesContainer) mensajesContainer.innerHTML = "";

        try {
          const userId = LibreriaSession.getUserId();
          console.log('[ClienteVerLibroPresenter] userId:', userId);
          if (!userId) throw new Error('Debe iniciar sesión para añadir al carrito');

          console.log('[ClienteVerLibroPresenter] libro._id:', libro._id);
          // Añadir 1 unidad del libro al carrito del cliente
          await this.model.addClienteCarroItem(userId, { libro: libro._id, cantidad: 1 });

          // Mensaje de éxito persistido (se mostrará en la página del carrito)
          LibreriaSession.addMessage("success", `Libro agregado a carrito: ${libro.titulo}`);
          // Navegar inmediatamente al carrito, donde se mostrará el mensaje
          router.navigate('/libreria/cliente-carrito.html');
          return; // Detener ejecución después de navegar

        } catch (err) {
          console.error('[ClienteVerLibroPresenter] Error:', err);
          LibreriaSession.addMessage('error', err.message);
          if (mensajesContainer) mensajesContainer.innerHTML = `<div class="error">${err.message}</div>`;
          // Si no está autenticado, redirigir al formulario de ingreso pasado 1s
          if (err.message && err.message.toLowerCase().includes('iniciar sesión')) {
            setTimeout(() => router.navigate('/libreria/invitado-ingreso.html'), 1000);
          }
        }
      });
    }

  }

}
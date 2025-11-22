import { Presenter } from "../../commons/presenter.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";
import { router } from "../../commons/router.mjs";
import { renderUltimoMensaje } from "../../commons/mensajes-helper.mjs";

export class ClienteCarritoPresenter extends Presenter {
  constructor(model, view) {
    super(model, view);
  }

  formatCurrency(n) {
    if (!n) n = 0;
    return Number(n).toFixed(2).replace('.', ',');
  }

  async refresh() {
    await super.refresh();

    const mensajesContainer = document.getElementById("mensajesContainer");

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

    // Obtener la URL anterior del router (SIN usar document.referrer)
    const previousUrl = router.previousUrl || '';

    // Páginas del navbar
    const paginasNavbar = ['cliente-facturas.html', 'cliente-perfil.html'];
    const vieneDeNavbar = paginasNavbar.some(pagina => previousUrl.includes(pagina));

    console.log('[CarritoPresenter] URL anterior:', previousUrl);
    console.log('[CarritoPresenter] Viene de navbar:', vieneDeNavbar);

    if (mensajesContainer) {
      if (vieneDeNavbar) {
        // Limpiar mensajes si venimos del navbar
        LibreriaSession.clearMessages();
        mensajesContainer.innerHTML = "";
      } else {
        // Mostrar mensajes si venimos de otra acción (ej: añadir al carrito)
        renderUltimoMensaje("#mensajesContainer");
      }
    }

    const carritoItems = document.getElementById("carritoItems");
    const carritoEmpty = document.getElementById("carritoEmpty");
    const subtotalCell = document.getElementById("subtotalCell");
    const ivaCell = document.getElementById("ivaCell");
    const totalCell = document.getElementById("totalCell");

    if (!carritoItems) return;

    const userId = LibreriaSession.getUserId();
    console.log('[CarritoPresenter] userId:', userId);

    if (!userId) {
      if (mensajesContainer) mensajesContainer.innerHTML = `<div class="error">Debe iniciar sesión para ver el carrito</div>`;
      LibreriaSession.addMessage('error', 'Debe iniciar sesión para ver el carrito');
      setTimeout(() => router.navigate('/libreria/invitado-ingreso.html'), 2000);
      return;
    }

    const carro = await this.model.getCarroCliente(userId);
    console.log('[CarritoPresenter] carro:', carro);

    if (!carro) {
      console.warn('[CarritoPresenter] Cliente no encontrado con id:', userId);
      if (carritoEmpty) carritoEmpty.classList.remove('hidden');
      if (subtotalCell) subtotalCell.textContent = this.formatCurrency(0);
      if (ivaCell) ivaCell.textContent = this.formatCurrency(0);
      if (totalCell) totalCell.textContent = this.formatCurrency(0);
      carritoItems.innerHTML = '';
      return;
    }

    carritoItems.innerHTML = '';

    if (!carro.items || carro.items.length === 0) {
      console.log('[CarritoPresenter] Carrito vacío');
      if (carritoEmpty) carritoEmpty.classList.remove('hidden');
      if (subtotalCell) subtotalCell.textContent = this.formatCurrency(0);
      if (ivaCell) ivaCell.textContent = this.formatCurrency(0);
      if (totalCell) totalCell.textContent = this.formatCurrency(0);

      LibreriaSession.addMessage('warn', 'El carrito está vacío');
      if (mensajesContainer) renderUltimoMensaje("#mensajesContainer");

      const btnPagar = document.getElementById('btnPagar');
        if (btnPagar) {
            btnPagar.setAttribute('disabled', 'true');
            btnPagar.style.cursor = 'not-allowed';
        }
      return;
    }

    if (carritoEmpty) carritoEmpty.classList.add('hidden');
    console.log('[CarritoPresenter] Items en carrito:', carro.items.length);

    carro.items.forEach((item, idx) => {
      console.log('[CarritoPresenter] Renderizando item:', item);
      const tr = document.createElement('tr');

      const tdQty = document.createElement('td');
      tdQty.className = 'item-cantidad';
      const input = document.createElement('input');
      input.type = 'number';
      input.min = '0';
      // input.max = item.libro.stock;
      input.value = item.cantidad;
      input.dataset.index = idx;
      input.className = 'qty-input';
      input.onchange = async (e) => {
        const v = Number(e.target.value);
        try {
          // if (input.value >= item.libro.stock) {
          //   LibreriaSession.addMessage('warn', 'La cantidad solicitada supera el stock disponible');
          //   this.refresh();
          //   renderUltimoMensaje("#mensajesContainer");
          // }
          await this.model.setClienteCarroItemCantidad(userId, idx, v);
          LibreriaSession.addMessage('success', 'Cantidad actualizada');
          this.refresh();
          renderUltimoMensaje("#mensajesContainer");

        } catch (err) {
          LibreriaSession.addMessage('error', err.message);
          if (mensajesContainer) mensajesContainer.innerHTML = `<div class="error">${err.message}</div>`;
        }
      };
      tdQty.appendChild(input);
      tr.appendChild(tdQty);

      const tdDetalle = document.createElement('td');
      tdDetalle.className = 'item-detalle';
      tdDetalle.textContent = `${item.libro.titulo} ${item.libro.isbn ? '[' + item.libro.isbn + ']' : ''}`;
      tr.appendChild(tdDetalle);

      const tdUnit = document.createElement('td');
      tdUnit.className = 'item-unidad';
      tdUnit.textContent = this.formatCurrency(item.libro.precio);
      tr.appendChild(tdUnit);

      const tdTotal = document.createElement('td');
      tdTotal.className = 'item-total';
      tdTotal.textContent = this.formatCurrency(item.total);
      tr.appendChild(tdTotal);

      carritoItems.appendChild(tr);
    });

    if (subtotalCell) subtotalCell.textContent = this.formatCurrency(carro.subtotal);
    if (ivaCell) ivaCell.textContent = this.formatCurrency(carro.iva);
    if (totalCell) totalCell.textContent = this.formatCurrency(carro.total);

    const btnPagar = document.getElementById('btnPagar');
    if (btnPagar) {
      btnPagar.removeAttribute('disabled');
      btnPagar.onclick = (e) => {
        e.preventDefault();
        LibreriaSession.clearMessages();
        router.navigate('/libreria/cliente-comprar.html');
      };
    }
  }
}

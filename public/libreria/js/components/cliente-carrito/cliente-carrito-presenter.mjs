import { Presenter } from "../../commons/presenter.mjs";
import { model } from "../../model/model.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";
import { router } from "../../commons/router.mjs";
import { CarritoStorage } from "../../commons/libreria-session.mjs";

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
    // Mostrar el último mensaje persistido
    if (mensajesContainer) {
      const mensajes = LibreriaSession.getMessages();
      if (mensajes && mensajes.length > 0) {
        const ultimo = mensajes[mensajes.length - 1];
        mensajesContainer.innerHTML = `<div class="message ${ultimo.type}">${ultimo.text}</div>`;
      } else {
        mensajesContainer.innerHTML = "";
      }
    }

    const carritoItems = document.getElementById("carritoItems");
    const carritoEmpty = document.getElementById("carritoEmpty");
    const subtotalCell = document.getElementById("subtotalCell");
    const ivaCell = document.getElementById("ivaCell");
    const totalCell = document.getElementById("totalCell");

  // No limpiar aquí mensajesContainer; ya se mostró el último mensaje si existe
    if (!carritoItems) return;

    const userId = LibreriaSession.getUserId();
    console.log('[CarritoPresenter] userId:', userId);
    
    if (!userId) {
      if (mensajesContainer) mensajesContainer.innerHTML = `<div class="error">Debe iniciar sesión para ver el carrito</div>`;
      LibreriaSession.addMessage('error', 'Debe iniciar sesión para ver el carrito');
      setTimeout(() => router.navigate('/libreria/invitado-ingreso.html'), 2000);
      return;
    }

  const carro = model.getCarroCliente(userId);
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

      //mostrar mensaje tipo info de que el carrito está vacío
      LibreriaSession.addMessage('warn', 'El carrito está vacío');
      if (mensajesContainer) mensajesContainer.innerHTML = `<div class="warn">El carrito está vacío</div>`;

      // Asegurar botón de pagar deshabilitado
      const btnPagar = document.getElementById('btnPagar');
      if (btnPagar) btnPagar.setAttribute('disabled', 'true');
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
      input.value = item.cantidad;
      input.dataset.index = idx;
      input.className = 'qty-input';
      input.onchange = (e) => {
        const v = Number(e.target.value);
        try {
          model.setClienteCarroItemCantidad(userId, idx, v);
          LibreriaSession.addMessage('success', 'Cantidad actualizada');
          if (mensajesContainer) mensajesContainer.innerHTML = `<div class="message">Cantidad actualizada</div>`;
          // Re-render para actualizar totales
          this.refresh();
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

    // Gestionar botón Pagar
    const btnPagar = document.getElementById('btnPagar');
    if (btnPagar) {
      btnPagar.removeAttribute('disabled');
      btnPagar.onclick = (e) => {
        e.preventDefault();
        router.navigate('/libreria/cliente-comprar.html');
      };
    }
  }

}

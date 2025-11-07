import { Presenter } from "../../commons/presenter.mjs";
import { model } from "../../model/model.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";
import { router } from "../../commons/router.mjs";
import { CarritoStorage } from "../../commons/libreria-session.mjs";
import { renderUltimoMensaje } from "../../commons/mensajes-helper.mjs";

export class ClienteComprarPresenter extends Presenter {
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
    renderUltimoMensaje("#mensajesContainer");

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

    const userId = LibreriaSession.getUserId();
    const clienteData = LibreriaSession.getUsuarioById(userId);

    // =============ESTABLECER DATOS DEL FORMULARIO================

    // Establecer fecha actual por defecto
    const fechaInput = document.getElementById("fecha");
    if (fechaInput) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      fechaInput.value = `${year}-${month}-${day}`;
    }

    //establecer datos del cliente por defecto en el formulario
    const dniInput = document.getElementById("dni");
    const emailInput = document.getElementById("email");
    const direccionInput = document.getElementById("direccion");
    if (clienteData) {
      if (dniInput) dniInput.value = clienteData.dni || '';
      if (emailInput) emailInput.value = clienteData.email || '';
      if (direccionInput) direccionInput.value = clienteData.direccion || '';
    }

    // =============MOSTRAR CARRITO================

    const carritoItems = document.getElementById("carritoItems");
    const carritoEmpty = document.getElementById("carritoEmpty");
    const subtotalCell = document.getElementById("subtotalCell");
    const ivaCell = document.getElementById("ivaCell");
    const totalCell = document.getElementById("totalCell");

    if (!carritoItems) return;

    if (!userId) {
      if (mensajesContainer) mensajesContainer.innerHTML = `<div class="error">Debe iniciar sesión para ver el carrito</div>`;
      LibreriaSession.addMessage('error', 'Debe iniciar sesión para ver el carrito');
      setTimeout(() => router.navigate('/libreria/invitado-ingreso.html'), 2000);
      return;
    }

    const carro = model.getCarroCliente(userId);
    // console.log('[ComprarPresenter] carro:', carro);
    
    if (!carro) {
      console.warn('[ComprarPresenter] Cliente no encontrado con id:', userId);
      if (carritoEmpty) carritoEmpty.classList.remove('hidden');
      if (subtotalCell) subtotalCell.textContent = this.formatCurrency(0);
      if (ivaCell) ivaCell.textContent = this.formatCurrency(0);
      if (totalCell) totalCell.textContent = this.formatCurrency(0);
      carritoItems.innerHTML = '';
      return;
    }

    carritoItems.innerHTML = '';

    if (!carro.items || carro.items.length === 0) {
      console.log('[ComprarPresenter] Carrito vacío');
      if (carritoEmpty) carritoEmpty.classList.remove('hidden');
      if (subtotalCell) subtotalCell.textContent = this.formatCurrency(0);
      if (ivaCell) ivaCell.textContent = this.formatCurrency(0);
      if (totalCell) totalCell.textContent = this.formatCurrency(0);

      LibreriaSession.addMessage('error', 'Has vaciado el carrito. No se puede procesar la compra.');
      if (mensajesContainer) {
        renderUltimoMensaje("#mensajesContainer");
      }

      const btnPagar = document.getElementById('btnPagar');
      if (btnPagar) {
        btnPagar.setAttribute('disabled', 'true');
        btnPagar.style.cursor = 'not-allowed';
      }
      return;
    }
    if (carritoEmpty) carritoEmpty.classList.add('hidden');
    // console.log('[ComprarPresenter] Items en carrito:', carro.items.length);

    carro.items.forEach((item, idx) => {
      // console.log('[ComprarPresenter] Renderizando item:', item);
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
            console.log('[ComprarPresenter] Cantidad actualizada para item index', idx, 'a', v);
            LibreriaSession.addMessage('success', 'Cantidad actualizada');
            this.refresh();
            if (mensajesContainer) renderUltimoMensaje("#mensajesContainer");
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

    // ==============BOTON PAGAR================

    // Gestionar botón Pagar
    const btnPagar = document.getElementById('btnPagar');
    if (btnPagar) {
      btnPagar.removeAttribute('disabled');
      btnPagar.onclick = (e) => {
        e.preventDefault();
        try {
          // Obtener carrito actual
          const current = model.getCarroCliente(userId);

          // Obtener datos del formulario
          const fecha = document.getElementById('fecha').value;
          const dni = document.getElementById('dni').value;
          const razonSocial = document.getElementById('razonSocial').value;
          const direccion = document.getElementById('direccion').value;
          const email = document.getElementById('email').value;

          // Validar formulario
          if (!fecha || !dni || !razonSocial || !direccion || !email) {
            LibreriaSession.addMessage('error', 'Por favor complete todos los campos del formulario');
            if (mensajesContainer) mensajesContainer.innerHTML = `<div class="error">Por favor complete todos los campos del formulario</div>`;
            return;
          }

          // Crear objeto de factura con los datos del formulario y del carrito
          let factura = {
            fecha: fecha,
            razonSocial: razonSocial,
            direccion: direccion,
            email: email,
            dni: dni,
            items: current.items.map(item => ({
              cantidad: item.cantidad,
              detalle: `${item.libro.titulo} ${item.libro.isbn ? '[' + item.libro.isbn + ']' : ''}`,
              precioUnitario: item.libro.precio,
              totalItem: item.total
            })),
            subtotal: current.subtotal,
            iva: current.iva,
            totalFactura: current.total,
            cliente: userId
          };

          factura = model.facturarCompraCliente(factura);

          console.log('[ComprarPresenter] Factura generada:', factura);

          // Guardar factura en localStorage
          LibreriaSession.saveFactura(factura);

          // Vaciar carrito del cliente en el modelo
          const cliente = model.getClientePorId(userId);
          if (cliente) {
            cliente.removeItems();
          }

          // Persistir carrito vacío en localStorage
          CarritoStorage.save(userId, { items: [], subtotal: 0, iva: 0, total: 0 });

          // Mensaje de éxito
          LibreriaSession.addMessage('success', 'Compra realizada correctamente. Factura generada.');
          if (mensajesContainer) { renderUltimoMensaje("#mensajesContainer"); }
          
          //redirigir a la pagina de inicio después de unos segundos, manteniendo la sesion iniciada del cliente
          router.navigate('/libreria/cliente-home.html');
          
        } catch (err) {
          console.error('[ComprarPresenter] Error al pagar:', err);
          LibreriaSession.addMessage('error', err.message || 'Error al procesar el pago');
          if (mensajesContainer) mensajesContainer.innerHTML = `<div class="error">${err.message || 'Error al procesar el pago'}</div>`;
        }
      };
    }
  }

}

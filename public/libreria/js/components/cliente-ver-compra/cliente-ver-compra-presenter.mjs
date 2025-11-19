import { Presenter } from "../../commons/presenter.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";
import { router } from "../../commons/router.mjs";

export class ClienteVerCompraPresenter extends Presenter {

  constructor(model, view) {
    super(model, view);
  }

  formatCurrency(n) {
    if (!n) n = 0;
    return Number(n).toFixed(2).replace('.', ',');
  }

  get searchParams() {
    return new URLSearchParams(document.location.search);
  }

  get id() {
    return this.searchParams.get('id');
  }

  getFactura() {
    return this.model.getFacturaPorId(this.id);
  }

  set factura(factura) {    
    this.numero = factura.numero;
    this.fecha = factura.fecha;
    this.razonSocial = factura.razonSocial;
    this.dni = factura.dni;
    this.direccion = factura.direccion;
    this.email = factura.email;
  }

  get numeroParagraph() {
    return document.querySelector('#numero');
  }

  set numero(numero) {
    this.numeroParagraph.textContent = numero;
  }

  get fechaParagraph() {
    return document.querySelector('#fecha');
  }

  set fecha(fecha) {
    this.fechaParagraph.textContent = fecha;
  }

  get razonSocialParagraph() {
    return document.querySelector('#razonSocial');
  }

  set razonSocial(razonSocial) {
    this.razonSocialParagraph.textContent = razonSocial;
  }

  get dniParagraph() {
    return document.querySelector('#dni');
  }

  set dni(dni) {
    this.dniParagraph.textContent = dni;
  }

  get direccionParagraph() {
    return document.querySelector('#direccion');
  }

  set direccion(direccion) {
    this.direccionParagraph.textContent = direccion;
  }

  get emailParagraph() {
    return document.querySelector('#email');
  }

  set email(email) {
    this.emailParagraph.textContent = email;
  }


  async refresh() {
    await super.refresh();

    let factura = this.getFactura()[0];
    if (factura) this.factura = factura;
    else console.error(`Factura ${this.id} not found!`);

    const carritoItems = document.getElementById("carritoItems");

    factura.items.forEach((item, idx) => {
      const tr = document.createElement('tr');

      const tdQty = document.createElement('td');
      tdQty.className = 'item-cantidad';
      tdQty.textContent = item.cantidad;
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

    document.getElementById("subtotalCell").textContent = this.formatCurrency(factura.subtotal);
    document.getElementById("ivaCell").textContent = this.formatCurrency(factura.iva);
    document.getElementById("totalCell").textContent = this.formatCurrency(factura.total);

  }

}
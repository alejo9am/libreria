import { Presenter } from "../../commons/presenter.mjs";

const euro = (n) => {
  const num = Number(n) || 0;
  const s = num.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return s;
};

export class ClienteFacturasPresenter extends Presenter {
  constructor(model, view, parentSelector) {
    super(model, view, parentSelector);
  }

  async refresh() {
    const html = await this.getHTML();
    this.parentElement.insertAdjacentHTML("beforeend", html);

    const row = this.parentElement.lastElementChild;
    if (!row) return;

    const numeroNode = row.querySelector('.numero');
    if (numeroNode) numeroNode.textContent = this.model.numero || '';

    const fechaNode = row.querySelector('.fecha');
    if (fechaNode) {
      // Formatear la fecha a formato legible (dd/mm/yyyy)
      const fecha = this.model.fecha;
      if (fecha) {
        const date = new Date(fecha);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        fechaNode.textContent = `${day}/${month}/${year}`;
      } else {
        fechaNode.textContent = '';
      }
    }

    const totalNode = row.querySelector('.total');
    if (totalNode) {
        totalNode.textContent = `€ ${euro(this.model.total) || ''}`;
    }

    const verLinkNode = row.querySelector('#verFactura');
    if (verLinkNode) {
      verLinkNode.setAttribute('href', `cliente-ver-compra.html?id=${this.model._id}`);
    }

    if (typeof this.attachAnchors === "function") this.attachAnchors();
  }
}

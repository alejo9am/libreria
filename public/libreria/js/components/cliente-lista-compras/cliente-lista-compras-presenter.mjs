import { Presenter } from "../../commons/presenter.mjs";
import { ClienteFacturasPresenter } from "../cliente-facturas/cliente-facturas-presenter.mjs";
import { LibreriaSession } from "../../commons/libreria-session.mjs";

const euro = (n) => {
  const num = Number(n) || 0;
  const s = num.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return s;
};

export class ClienteListaComprasPresenter extends Presenter {
  constructor(model, view, parentSelector) {
    super(model, view, parentSelector);
  }

  get tbody() {
    return document.querySelector("#tabla-facturas");
  }

  get mensajes() {
    return document.querySelector("#mensajesContainer");
  }

  get totalTh() {
    return document.querySelector("#total-factura");
  }

  get tfootRow() {
    return document.querySelector("tfoot tr");
  }

  async refresh() {
    await super.refresh();

    console.log(this.model.getFacturas())

    if (this.tbody) this.tbody.innerHTML = "";
    if (this.mensajes) this.mensajes.innerHTML = "";

    const facturas = this.model.getFacturasCliente(LibreriaSession.getUserId()) || [];

    if (facturas.length === 0) {
      if (this.mensajes) {
        this.mensajes.innerHTML = `<div class="mensaje">No hay facturas todavía.</div>`;
      }
      this.#pintarTotal(0);
      return;
    }

    await Promise.all(
      facturas.map(async (f, idx) => {
        return await new ClienteFacturasPresenter(
          { ...f, _index: idx + 1 },
          "cliente-facturas",
          "#tabla-facturas"
        ).refresh();
      })
    );

    const totalAcumulado = facturas.reduce((acc, f) => acc + (Number(f.total) || 0), 0);
    this.#pintarTotal(totalAcumulado);
  }

  #pintarTotal(total) {
    let totalCell = this.tfootRow.querySelector("td.total-global");
    if (!totalCell) {
      totalCell = document.createElement("td");
      totalCell.className = "total-global";
      this.tfootRow.appendChild(totalCell);
    }
    totalCell.textContent = euro(total);
  }
}

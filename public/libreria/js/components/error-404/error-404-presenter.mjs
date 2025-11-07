import { Presenter } from "../../commons/presenter.mjs";

export class Error404Presenter extends Presenter {
    constructor(model, view, parentSelector) {
        super(model, view, parentSelector);
    }

    async refresh() {
        await super.refresh();

        // Obtener la URL solicitada desde los parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const urlSolicitada = urlParams.get('url') || window.location.pathname;

        // Mostrar la URL solicitada en el mensaje de error
        const urlElement = document.getElementById('urlSolicitada');
        if (urlElement) {
            urlElement.textContent = `URL solicitada: ${urlSolicitada}`;
        }

        console.error(`Error 404: Página no encontrada - ${urlSolicitada}`);
    }
}

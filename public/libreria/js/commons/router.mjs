class Router {
  static _instance;
  routes;
  presenters;
  _previousUrl = null; // Rastrear URL anterior
  _currentUrl = null;

  static get instance() {
    if (!Router._instance)
      Router._instance = new Router();
    return Router._instance;
  };

  constructor() {
    this.routers = [];
    this.presenters = [];
    this._currentUrl = this.localLocation;
    this.init();
  }
  
  init() {
    window.addEventListener('popstate', () => {
      this.handleLocation();
    });
    console.log('Router initialized!');
  }
  
  register(router, presenter) {
    this.routers.push(router);
    this.presenters.push(presenter);
  }
  
  unregister(router) {
    let index = this.routers.indexOf(router);
    this.routers.splice(index, 1);
    this.presenters.splice(index, 1);
  }

  async route(event) {
    event.preventDefault(); // Previene navegación real
    this.navigate(event.target.href);
  }

  async navigate(url) {
    // Guardar URL anterior
    this._previousUrl = this._currentUrl;
    this._currentUrl = url;
    
    // Solo cambia la URL en el historial, SIN recargar
    window.history.pushState({}, '', url);
    this.handleLocation();
  }

  get previousUrl() {
    return this._previousUrl;
  }

  get localLocation() {
    let url = window.location.pathname;
    return url.concat(window.location.search.length > 1 ? window.location.search : '');
  }

  get presenter() {
    let url = this.localLocation;
    let index = this.routers.findIndex((router) => router.test(url));
    if (index < 0) return null;
    return this.presenters[index];
  }

  async handleLocation() {
    console.log('Refreshing presenter', this.localLocation);
    const presenter = this.presenter;
    
    if (!presenter) {
      // Si no se encuentra ningún presenter, mostrar error 404
      let url = this.localLocation;
      console.error(`Error 404: ${url} not found`);
      
      // Redirigir a la página de error con la URL solicitada como parámetro
      const errorUrl = '/libreria/error-404.html?url=' + encodeURIComponent(url);
      window.history.replaceState({}, '', errorUrl);
      
      // Buscar el presenter de error 404 (debe ser el último o penúltimo registrado)
      const error404Index = this.routers.findIndex((router) => 
        router.test('/libreria/error-404.html')
      );
      
      if (error404Index >= 0) {
        await this.presenters[error404Index].refresh();
      } else {
        // Fallback: usar el último presenter registrado (catch-all)
        const lastIndex = this.presenters.length - 1;
        if (lastIndex >= 0) {
          await this.presenters[lastIndex].refresh();
        } else {
          console.error('No se encontró ningún presenter para mostrar el error 404');
        }
      }
    } else {
      await presenter.refresh();
    }
  }
}

export const router = Router.instance;

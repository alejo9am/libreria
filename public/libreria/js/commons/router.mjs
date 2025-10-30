class Router {
  static _instance;
  routes;
  presenters;

  static get instance() {
    if (!Router._instance)
      Router._instance = new Router();
    return Router._instance;
  };

  constructor() {
    this.routers = [];
    this.presenters = [];
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
    event.preventDefault();
    this.navigate(event.target.href);
  }

  async navigate(url) {
    window.history.pushState({}, '', url);
    this.handleLocation();
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

  // router.mjs



  async handleLocation() {
    // 1. obtener la URL actual
    const url = this.localLocation;                 
    console.log('Refreshing presenter', url);

    // 2. buscar el presenter que coincide
    const presenter = this.presenter;

    // 3. si no hay presenter para esa ruta, no petamos
    if (!presenter) {
      console.error(`${url} not found`);
      // si quieres redirigir a una página de not found, lo haces aquí:
      // window.history.replaceState({}, '', '/libreria/index.html');
      return;
    }

    // 4. si lo hay, lo refrescamos
    await presenter.refresh();
  }

}

export const router = Router.instance;
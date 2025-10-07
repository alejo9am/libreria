import { router } from "./router.mjs";

export class Presenter {
  static BASE = '/libreria/js/components'
  static DEFAULT_PARENT = 'main'
  constructor(model, view, parentSelector) {
    this.model = model;
    this.view = view;
    this.parentSelector = parentSelector ?? Presenter.DEFAULT_PARENT;
    this.html = null;
  }

  async getHTML() {
    if (!this.html)
      this.html = await this.loadHTML();
    return this.html;
  }

  get viewURL() {
    return `${Presenter.BASE}/${this.view}/${this.view}-presenter.html`;
  }

  async loadHTML() {
    console.log('Loading ', this.viewURL)
    let response = await fetch(this.viewURL);
    if (response.ok) this.html = await response.text();
    else throw new Error(`${this.view} not found!`);
    return this.html;
  }

  get parentElement() {
    return document.querySelector(`${this.parentSelector}`);
  }

  attachAnchors() {
    document.querySelectorAll('a[href]').forEach((a) => a.onclick = function (event) {
      event.preventDefault();
      router.route(event);      
    });
  }

  async refresh() {
    try {
      this.parentElement.innerHTML = await this.getHTML();
      this.attachAnchors();
    } catch (err) {
      console.error(err);
    }
  }

}
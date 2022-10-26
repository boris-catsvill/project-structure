export default class UndefinedPage {
    element = null;
    constructor() {
      this.render();
    }

    get elementDOM() {
      const container = document.createElement('div');
      const bodyOfcontainer = `<a href="/">Страница не найдена. Перейти на главную</a>`;
  
      container.innerHTML = bodyOfcontainer;
      return container;
    }

    render() {
      this.element = this.elementDOM;
    }
    remove() {
    this.element?.remove();
    this.element = null;
    }

    destroy() {
      this.remove();
    }
}

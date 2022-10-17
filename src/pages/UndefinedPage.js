export default class UndefinedPage {
    element = null;
    constructor() {
      this.render();
    }

    get undefinedElement() {
      const undefinedElement = document.createElement('div');
      const bodyOfUndefinedElement = `<a href="/">Страница не найдена. Перейти на главную</a>`;
  
      undefinedElement.innerHTML = bodyOfUndefinedElement;
      return undefinedElement;
    }

    render() {
      this.element = this.undefinedElement;
      return this.undefinedElement;
    }
    remove() {
    this.element?.remove();
    this.element = null;
    }
    destroy() {
      this.remove();
    }
}

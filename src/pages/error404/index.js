export default class {
  element;

  constructor() {
    this.render();
  }

  render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div class="error-404">
        <h1 class="page-title">Страница не найдена</h1>
        <p>Извините, страница не существует</p>
      </div>
    `;

    this.element = element.firstElementChild;

    return this.element;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}

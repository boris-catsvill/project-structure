export default class {
  element;

  async render () {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <div class="error-404">
        <h1 class="page-title">Страница не найдена</h1>
        <p>Извините, страница не существует</p>
      </div>
    `;

    this.element = wrapper.firstElementChild

    return this.element;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}

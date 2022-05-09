

export default class ErrorPage {

  async render () {
    this.getTemplate();
    const div = document.createElement('div');
    div.innerHTML = this.getTemplate();
    this.element = div.firstElementChild;
    return this.element;
  }

  getTemplate () {
    return `
    <div class="error-404">
        <h1 class="page-title">Страница не найдена</h1>
        <p>Извините, страница не существует</p>
    </div>
    `;
  }

  remove () {
    this.element.remove();
  }

  destroy () {
    this.remove();
    this.element = null;
  }
}

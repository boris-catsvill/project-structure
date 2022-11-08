export default class {
  element;

  async render() {
    const element = document.createElement('div');

    element.innerHTML = `
      <div class="error-404">
        <h1 class="page-title">Page not found</h1>
      </div>
    `;

    this.element = element.firstElementChild;

    return this.element;
  }
}

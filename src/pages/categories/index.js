import Categories from '../../components/categories';

export default class Page {
  conponents;

  async render() {
    await this.initComponents();
    this.element = this.toHTML(this.getTemplate());
    this.renderComponents();
    this.subElements = this.getSubElements(this.element);
    this.addEventListeners();
    return this.element;
  }

  getTemplate() {
    return `
        <div class="categories">
            <div class="content__top-panel">
            <h1 class="page-title">Категории товаров</h1>
            </div>
            <div data-element="categoriesContainer">
                <div data-categories></div>
            </div>
        </div>
    `;
  }

  async initComponents() {
    const categories = new Categories(this.productId);
    await categories.render();

    this.components = {
        categories
    };
  }

  renderComponents() {
    for (const component of Object.entries(this.components)) {
      this.element.querySelector(`[data-${component[0]}]`).replaceWith(component[1].element);
    }
  }

  getSubElements(root) {
    const subElements = {};
    [...root.querySelectorAll('[data-element]')].forEach(el => {
      subElements[el.dataset.element] = el;
    });
    return subElements;
  }

  addEventListeners() {

  }

  removeEventListeners() {

  }

  remove() {
    if (this.element) this.element.remove();
    this.element = null;
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }

  toHTML(htmlString) {
    const htmlObject = document.createElement('div');
    htmlObject.innerHTML = htmlString;
    return htmlObject.firstElementChild;
  }
}

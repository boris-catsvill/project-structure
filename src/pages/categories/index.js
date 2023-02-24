import Categories from '../../components/categories/index.js';


export default class Page {

  async initComponents() {
    const categories = new Categories();
    await categories.render();
    this.categories = categories;
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();
    await this.initComponents();

    this.subElements.categoriesContainer.append(this.categories.element);

    return this.element;
  }

  getTemplate() {
    return `
        <div class="categories">
            <div class="content__top-panel">
                <h1 class="page-title">Категории товаров</h1>
            </div>
            <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>
            <div data-element="categoriesContainer">
            </div>
        </div>
        `;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.categories.destroy();
    this.remove();
  }
}

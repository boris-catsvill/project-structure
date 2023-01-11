import SortableList from '../../components/sortable-list/index.js';

export default class Category {
  element;
  components;

  constructor(category = {}) {
    this.category = category;
    this.render();
  }

  getTemplate() {
    return `
      <div class="category category_open" data-id="${this.category.id}">
      <header class="category__header">
        ${this.category.title}
      </header>
      <div class="category__body">
        <div class="subcategory-list" data-element="sortableList"></div>
      </div>
    </div>
      `
  }

  initComponents() {
    const sortableList = new SortableList({
      items: this.category.subcategories.map(item => {
        const element = document.createElement('li');
        element.classList.add('categories__sortable-list-item');
        element.classList.add('sortable-list__item');
        element.dataset.grabHandle = '';
        element.dataset.id = item.id;

        element.innerHTML = `
          <strong>${item.title}</strong>
          <span><b>${item.count}</b> products</span>
        `;

        return element;
      })
    });

    this.components = {
      sortableList
    };
  }

  renderComponents() {
    Object.keys(this.components).forEach(componentName => {
      const root = this.subElements[componentName];
      const { element } = this.components[componentName];

      root.append(element);
    });
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

  render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    this.initComponents();
    this.renderComponents()

    return this.element;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;

    for (const component of Object.values(this.components)) {
      component.destroy();
    }

    this.components = {};
  }
}

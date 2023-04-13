import SortableList from '../sortable-list';

export default class Category {
  element;
  subElements;

  constructor(category = []) {
    this.category = category;
    this.subCategories = category.subcategories;
    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getCategoryTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
    this.renderSubcategories();
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, elem) => {
      acc[elem.dataset.element] = elem;
      return acc;
    }, {});
  }

  getCategoryTemplate() {
    return `
      <div class="category category_open" data-id="${this.category.id}">
        <header class="category__header">
          ${this.category.title}
        </header>
        <div class="category__body">
          <div data-element="subcategories" class="subcategory-list"></div>
        </div>
      </div>
    `;
  }

  renderSubcategories() {
    const elements = this.subCategories.map(subcategory => {
      const element = document.createElement('li');
      element.classList.add('categories__sortable-list-item');
      element.setAttribute('data-id', subcategory.id);
      element.setAttribute('data-grab-handle', '');

      element.innerHTML = `
        <strong>${subcategory.title}</strong>
        <span><b>${subcategory.count}</b> products</span>
      `;

      return element;
    });

    const sortableList = new SortableList({
      items: elements
    });

    this.subElements.subcategories.append(sortableList.element);
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

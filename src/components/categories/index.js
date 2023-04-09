import SortableList from '../sortable-list';

export default class Category {
  element;
  subElements;

  constructor(category) {
    this.category = category;
    this.subcategories = category.subcategories;
    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getCategoryTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();

    this.renderSubcategories();
    this.initEventListeners();
  }

  getSubElements() {
    const subElements = {};

    for (const elem of this.element.querySelectorAll('[data-element]')) {
      subElements[elem.dataset.element] = elem;
    }

    return subElements;
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
    const elements = this.subcategories.map(subcategory => {
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

  initEventListeners() {
    this.element.addEventListener('click', event => {
      if (!event.target.closest('.category__header')) return;
      this.element.classList.toggle('category_open');
    });

    this.element.addEventListener('sortable-list-reorder', () => {
      const items = this.subElements.subcategories.querySelectorAll('.sortable-list__item');
      const sortIndexes = [ ...items ].map(subcategory => subcategory.dataset.id);
      this.subcategories.sort((a, b) => sortIndexes.indexOf(a.id) - sortIndexes.indexOf(b.id));

      this.element.dispatchEvent(new CustomEvent('subcategories-reorder', {
        bubbles: true,
        detail: this.subcategories
      }));
    });
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
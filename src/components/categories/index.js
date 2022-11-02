import SortableList from '../../components/sortable-list';

export default class Categories {
  element;
  subElements = {};

  constructor({ id, title, count, weight, subcategories }) {
    this.id = id;
    this.title = title;
    this.count = count;
    this.weight = weight;
    this.subcategories = subcategories;

    this.render();
  }

  initListeners() {
    document.addEventListener('pointerdown', this.subcatOpenOnClick);
  }

  removeListeners() {
    document.removeEventListener('pointerdown', this.subcatOpenOnClick);
  }

  subcatOpenOnClick(event) {
    const target = event.target.closest('.category__header');
    if (!target) return;

    target.parentElement.classList.toggle('category_open');
  }

  async renderComponents() {
    const { subcategories } = this.subElements;
    const subcategoryItems = this.subcategories.map(item => this.renderSubcategories(item));

    this.sortableListElement = new SortableList({ items: subcategoryItems });

    subcategories.append(this.sortableListElement.element);
  }

  renderSubcategories(item) {
    const wrapper = document.createElement('li');
    wrapper.classList.add('categories__sortable-list-item');
    wrapper.dataset.id = item.id;
    wrapper.dataset.grabHandle = '';

    wrapper.innerHTML = `
      <strong>${item.title}</strong>
      <span><b>${item.count}</b> products</span>
    `;
    return wrapper;
  }

  get template() {
    return `
      <div data-element="categoriesContainer">
        <div class="category category_open" data-id="${this.id}">
          <header class="category__header">
            ${this.title}
          </header>
          <div class="category__body">
            <div class="subcategory-list" data-element="subcategories">
              
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    await this.renderComponents();
    this.initListeners();

    return this.element;
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
    if (this.element) {
      this.element.remove();
    }
    this.removeListeners();
  }

  destroy() {
    this.element.remove();
    this.removeListeners();
  }
}

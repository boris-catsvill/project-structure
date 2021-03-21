import SortableList from '../sortable-list'

export default class Categories {
  element;

  constructor(categories = []) {
    this.categories = categories;

    this.render();
    this.initEventListners();
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'categories';

    this.categories.forEach(category => {
      this.element.append(this.createCategory(category));
    });
  }

  initEventListners() {
    this.element.addEventListener('click', event => {
      const header = event.target.closest('.category__header');

      if (header) {
        const category = header.closest('.category');
        category.classList.toggle('category_open');
      }
    });
  }

  createCategory(category) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div class="category category_open" data-id="${category.id}">
        <header class="category__header">
          ${category.title}
        </header>
        <div class="category__body">
          <div class="subcategory-list"></div>
        </div>
      </div>
    `;
    const categoryElement = wrapper.firstElementChild;
    const subcategoryList = this.createSubcategoryList(category.subcategories);
    categoryElement.querySelector('.subcategory-list').append(subcategoryList);
    return categoryElement;
  }

  createSubcategoryList(subcategories = []) {
    const sortableList = new SortableList({
      items: subcategories.map(item => this.createSubcategoryItem(item)),
    });
    return sortableList.element;
  }

  createSubcategoryItem(subcategory) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <li class="categories__sortable-list-item sortable-list__item" data-grab-handle="" data-id="${subcategory.id}">
        <strong>${subcategory.title}</strong>
        <span><b>${subcategory.count}</b> products</span>
      </li>
    `;
    return wrapper.firstElementChild;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
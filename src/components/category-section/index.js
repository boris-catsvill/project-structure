import SortableList from '../../components/sortable-list';
import getSubElements from '../../utils/getSubElements';

export default class CategorySection {
  data;

  constructor(data) {
    this.data = data;
    this.render();
  }

  getSubcategoryItem(subcategory) {
    const subcategoryElement = document.createElement('div');
    subcategoryElement.innerHTML = `
      <li class="categories__sortable-list-item sortable-list__item" data-grab-handle="" data-id="${subcategory.id}" style="">
        <strong>${subcategory.title}</strong>
        <span><b>${subcategory.count}</b> products</span>
      </li>
    `;

    return subcategoryElement.firstElementChild;
  }

  getCategoryList(category) {
    const items = category.subcategories.map((subcategory) => {
      return this.getSubcategoryItem(subcategory);
    });
    const list = new SortableList({ items });
    return list.element;
  }

  getCategorySection(category) {
    const element = document.createElement('div');
    element.innerHTML = `
      <div class="category category_open" data-id="${category.id}">
        <header data-elem="categoryHeader" class="category__header">
          ${category.title}
        </header>
        <div data-category-body class="category__body">
          <div data-subcategory-inner class="subcategory-list">
          </div>
        </div>
     </div>
    `;

    const subcategoryListInner = element.querySelector('[data-subcategory-inner]');
    subcategoryListInner.append(this.getCategoryList(category));

    return element.firstElementChild;
  }

  toggleCategoryBody = () => {
    if (this.element.classList.contains('category_open')) {
      this.element.classList.remove('category_open');
    } else {
      this.element.classList.add('category_open');
    }
  }

  initEventListeners() {
    this.subElements.categoryHeader.addEventListener('click', this.toggleCategoryBody);
  }

  render() {
    const element = document.createElement('div');

    element.append(this.getCategorySection(this.data));

    this.element = element.firstElementChild;
    this.subElements = getSubElements(this.element, 'elem');

    this.initEventListeners();
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy () {
    this.remove();
  }
}

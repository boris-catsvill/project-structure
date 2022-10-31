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

  initListeners() {}

  removeListeners() {}

  async renderComponents() {
    const { subcategories } = this.subElements;
    // const subcategoryItems = this.subcategories.map((item) => )

    this.sortableListElement = new SortableList({ items: subcategoryItems });

    subcategories.append(this.sortableListElement.element);
  }

  renderSubcategories() {

  }

  // <ul class="sortable-list">
  //   <li class="categories__sortable-list-item sortable-list__item" data-grab-handle=""
  //       data-id="tovary-dlya-doma">
  //     <strong>Товары для дома</strong>
  //     <span><b>11</b> products</span>
  //   </li>
  //   <li class="categories__sortable-list-item sortable-list__item" data-grab-handle=""
  //       data-id="krasota-i-zdorove">
  //     <strong>Красота и здоровье</strong>
  //     <span><b>11</b> products</span>
  //   </li>
  //   <li class="categories__sortable-list-item sortable-list__item" data-grab-handle=""
  //       data-id="tovary-dlya-kuxni">
  //     <strong>Товары для кухни</strong>
  //     <span><b>13</b> products</span>
  //   </li>
  // </ul>

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

  getSubcategoriesTemplate() {

  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    // await this.renderComponents();
    this.initListeners();

    return this.element;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element; 
      result[name] = subElement;
    }
    return result;
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.removeListeners();
  }
}
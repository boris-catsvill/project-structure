export default class Categories {
  element;
  subElements = {};

  constructor() {
    this.render();
  }

  initListeners() {}

  removeListeners() {}

  // async renderComponents() {
  //   const { categoriesComponent } = this.subElements;

  //   this.categoriesComponentElement = new 

  //   categoriesComponent.append
  // }

  get template() {
    return `
      <div data-element="categoriesContainer">
        <div class="category category_open" data-id="bytovaya-texnika">
          <header class="category__header">
            Бытовая техника
          </header>
          <div class="category__body">
            <div class="subcategory-list">
              <ul class="sortable-list">
                <li class="categories__sortable-list-item sortable-list__item" data-grab-handle=""
                    data-id="tovary-dlya-doma">
                  <strong>Товары для дома</strong>
                  <span><b>11</b> products</span>
                </li>
                <li class="categories__sortable-list-item sortable-list__item" data-grab-handle=""
                    data-id="krasota-i-zdorove">
                  <strong>Красота и здоровье</strong>
                  <span><b>11</b> products</span>
                </li>
                <li class="categories__sortable-list-item sortable-list__item" data-grab-handle=""
                    data-id="tovary-dlya-kuxni">
                  <strong>Товары для кухни</strong>
                  <span><b>13</b> products</span>
                </li>
              </ul>
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
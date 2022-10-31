import Categories from '../../components/categories';

export default class CategoriesPage {
  element;
  subElements = {};
  categoriesData = [];

  // constructor() {
  //   this.render();
  // }

  // initListeners() {}

  // removeListeners() {}

  // this.categoriesData.map((item) => new Categories(item).forEach((item) => {
  //   categoriesComponent.append(item.element);
  // }));

  async getCategoriesData() {
    const url = new URL('api/rest/categories', process.env.BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    const data = this.fetchData(url);

    return data;
  }

  async renderComponents() {
    const { categoriesComponent } = this.subElements;
    this.categoriesData = await this.getCategoriesData();
    console.log(this.categoriesData);

    this.categoriesData.map((item) => new Categories(item)).forEach((item) => {
      categoriesComponent.append(item.element);
    });

    
    // this.categoriesData
    //   .map(item => new Categories(item))
    //   .forEach(item => {
    //     this.subElements.categoriesContainer.append(item.element);
    // });


    // this.categoriesComponentElement = new Categories();

    // categoriesComponent.append(this.categoriesComponentElement.element);
  }

  get template() {
    return `
    <div class="categories">
      <div class="content__top-panel">
        <h1 class="page-title">Product categories</h1>
      </div>
      <p>Подкатегории можно перетаскивать, меняя их порядок внутри своей категории.</p>

      <div data-element="categoriesComponent">
        <!-- categories component -->
      </div>
    </div>
    `;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();

    this.renderComponents();
    // this.initListeners();

    return this.element;
  }

  async fetchData(url) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element; 
      result[name] = subElement;
    }
    console.log(result);
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
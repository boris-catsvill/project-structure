import SortableTable from "../../../components/sortable-table";
import header from "./products-header.js";

export default class Page {
  subElements = {};
  components = {};

  render() {
    const element = document.createElement('div');
    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);


    const components = this.initComponents();
    this.renderComponents(components);
    this.components = components;

    return this.element;
  }

  initComponents() {
    this.urlProducts =  new URL('/api/rest/products', process.env.BACKEND_URL);
    this.urlProducts.searchParams.set('_embed', 'subcategory.category');

    const sortableTable = new SortableTable(header, {
      url: this.urlProducts,
      isSortLocally: false,
      isInfinityScroll: true,
      sorted: {
        id: 'title',
        order: 'asc'
      }
    });

    return {
      sortableTable
    };
  }

  renderComponents(components) {
    const keysComponents = Object.keys(components);

    keysComponents.forEach(component => {
      const root = this.subElements[component];
      const { element } = components[component];

      root.append(element);
    });
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  getTemplate() {
    return `
      <div class="products-list">
        <div class="content__top-panel">
          <h1 class="page-title">Товары</h1>
          <a href="/products/add" class="button-primary">Добавить товар</a>
        </div>
        <div class="content-box content-box_small"></div>
        <div class="products-list__container" data-element="sortableTable"></div>
      </div>
    `;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}

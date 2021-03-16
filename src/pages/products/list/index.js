import SortableTable from "../../../components/sortable-table/index.js";
import header from "../../dashboard/bestsellers-header.js";
import FilterTable from "../../../components/filter-table/index.js"

export default class Page {
  element;
  subElements = {};
  components = {};

  sliderFrom = 0;
  sliderTo = 4000;

  get template() {
    return `
    <div class="products-list">
      <div class = "content__top-panel">
        <h1 class="page-title">Products</h1>
        <a href="/products/add" class="button-primary">Add product</a>
      </div>
      <div data-element ="filterTable">
      </div>
      <div data-elemen ="productsContainer" class="products-list__container">
        <div data-element="sortableTable"></div>
      </div>
    </div>
    `;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.initComponents();
    this.renderComponents();
    
    return this.element;
  }

  getSubElements (element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  initComponents() {
    const filterTable = new FilterTable({
      sliderMin: this.sliderFrom,
      sliderMax: this.sliderTo
    });

    const sortableTable = new SortableTable(header, {
      url: `api/rest/products?_embed=subcategory.category`,
      isSortLocally: true
    }); 
    this.components = {sortableTable, filterTable};
  }

  async renderComponents() {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];
    
      root.append(element);
    });
  }


  remove() {
    this.element.remove();
  }
  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}

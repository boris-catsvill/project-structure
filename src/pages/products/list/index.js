import SortableTable from '../../../components/sortable-table/index.js';
import FilterPanel from '../../../components/filter-panel/index.js';
import header from './products-header.js';

export default class ProductsPage {
  subElements = {};
  components = {};

  sliderFrom = 0;
  sliderTo = 4000;

  get getTemplate() {
    return `
      <div class="products-list">
        <div class="content__top-panel">
          <h1 class="page-title">Товары</h1>
          <a href="/products/add" class="button-primary">Добавить товар</a>
        </div>
        <div data-element="filterPanel">
        </div>
        <div data-element="productsContainer" class="products-list__container">
          <div data-element="sortableTable"></div>
        </div>
      </div>
    `;
  }

  async render() {
    const element = document.createElement('div');

    element.innerHTML = this.getTemplate;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.initComponents();
    this.renderComponents();

    this.addEventListeners();

    return this.element;
  }

  getSubElements(element) {
    const subElements = element.querySelectorAll('[data-element]');

    return [...subElements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  initComponents() {
    const filterPanel = new FilterPanel({
      sliderMin: this.sliderFrom,
      sliderMax: this.sliderTo
    });
    
    const sortableTable = new SortableTable(header, {
      url: `api/rest/products?_embed=subcategory.category`,
      step: 30,
      isSortLocally: false
    });

    this.components = {
      filterPanel,
      sortableTable
    };
  }

  renderComponents() {
    Object.entries(this.components).forEach(([title, component]) => {
      const container = this.subElements[title];

      container.append(component.element);
    });
  }

  addEventListeners() {
    const { filterPanel, sortableTable } = this.components;

    filterPanel.element.addEventListener('change-name', ({ detail: name }) => {
      sortableTable.filterByName(name);
    });

    filterPanel.element.addEventListener('change-status', ({ detail: status }) => {
      sortableTable.filterByStatus(status);
    });

    filterPanel.element.addEventListener('range-select', ({ detail: prices }) => {
      sortableTable.filterByPrice(prices);
    });
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
import ProductListFilters from '../../../components/product-list-filters';
import SortableTable from '../../../components/sortable-table/index';
import productsHeader from './products-header';

export default class Page {
  subElements = {};
  components = {};
  url = 'api/rest/products?_embed=subcategory.category';

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template;
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);
    this.components = this.initComponents();
    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  get template() {
    return `
    <div class="products-list">
      <div class="content__top-panel">
        <h1 class="page-title">Товары</h1>
        <a href="/products/add" class="button-primary">Добавить товар</a>
      </div>
      <div data-element="productListFilters" class="content-box content-box_small"></div>
      <div data-element="sortableTable" class="products-list__container"></div>
    </div>
    `;
  }

  initComponents() {
    const productListFilters = new ProductListFilters();
    productListFilters.render();

    const sortableTable = new SortableTable(productsHeader, {
      url: `${this.url}`,
      getRowLink: id => `/products/${id}`,
      sorted: {
        id: 'title',
        order: 'asc'
      }
    });

    return {
      productListFilters,
      sortableTable
    };
  }

  async loadData(filterValues = {}) {
    const table = this.components.sortableTable;
    const { filterName = '', doubleSlider = '', filterStatus = '' } = filterValues;

    table.start = 0;
    table.end = table.step;

    if (filterName !== '') {
      table.url.searchParams.set('title_like', filterName);
    } else {
      table.url.searchParams.delete('title_like');
    }

    if (doubleSlider !== '') {
      table.url.searchParams.set('price_gte', doubleSlider.from);
      table.url.searchParams.set('price_lte', doubleSlider.to);
    } else {
      table.url.searchParams.delete('price_gte');
      table.url.searchParams.delete('price_lte');
    }

    if (filterStatus !== '') {
      table.url.searchParams.set('status', filterStatus);
    } else {
      table.url.searchParams.delete('status');
    }

    table.subElements.body.innerHTML = '';
    const data = await table.loadData(table.sorted.id, table.sorted.order, table.start, table.end);

    table.setRows(data);
  }

  renderComponents() {
    for (const componentName of Object.keys(this.components)) {
      const root = this.subElements[componentName];
      const element = this.components[componentName].element;

      root.append(element);
    }
  }

  initEventListeners() {
    this.components.productListFilters.element.addEventListener('product-list-change', event => {
      const filterValues = event.detail;
      this.loadData(filterValues);
    });
    this.components.sortableTable.element.addEventListener('filters-reset', () => {
      const filterValues = this.components.productListFilters.resetValues();
      this.loadData(filterValues);
    });
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};

    for (const component in this.components) {
      this.components[component].destroy();
    }

    this.components = {};
  }
}

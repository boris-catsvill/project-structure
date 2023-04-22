import ProductForm from "../../../components/product-form";
import SortableTable from '../../../components/sortable-table';
import headerProducts from './products-list-header';
import ProductFilter from '../../../components/ProductFilter/index.js'

export default class Page {
  element;
  subElements = {
    productsContainer: null,
    productFilter: null
  };
  components = {};


  async render () {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements();
    await this.initComponents();

    await this.renderComponents();

    // this.initEventListeners();
    return this.element;
  }

  get template() {
    return `
       <div class="products-list">
          <div class="content__top-panel">
            <h1 class="page-title">Товары</h1>
            <a href="/products/add" class="button-primary">Добавить товар</a>
          </div>
          <div data-elem="productFilter" class="content-box content-box_small"></div>
          <div data-elem="productsContainer" class="products-list__container"></div>
       </div>
    `;
  }


  initComponents() {
    const settings = {
      min: 100,
      max: 4000,
      formatValue: value => `$${value}`
    };
    // const productId = '101-planset-lenovo-yt3-x90l-64-gb-3g-lte-cernyj';
    const productFilter = new ProductFilter(settings);
    const sortableTable = new SortableTable(headerProducts, {
      url: `api/rest/products?_embed=subcategory.category&_sort=title&_order=asc&_start=1&_end=20`,
      isSortLocally: true
    });
    this.components.productFilter = productFilter;
    this.components.sortableTable = sortableTable;
    this.initEventListeners();
  }

  async renderComponents() {
    const productFilter = this.components.productFilter.render();
    this.subElements.productFilter.append(productFilter);
    const sortableTable = await this.components.sortableTable.render();
    this.subElements.productsContainer.append(sortableTable);
  }


  getSubElements () {
    const result = {};
    const elements = this.element.querySelectorAll('[data-elem]');
    [...elements].map((subElement) => {
      result[subElement.dataset.elem] = subElement;
    });
    return result;
  }

  initEventListeners() {
    document.addEventListener('product-filter', this.filterData);
    const toggleSidebar = document.querySelector('.sidebar__toggler');
    this.toggleSidebar = toggleSidebar;
    this.toggleSidebar.addEventListener('click', this.togglerSidebar);
  }

  filterData = async (event) => {
    const data = await this.components.sortableTable.loadFiltredData(event.detail.params)
    this.components.sortableTable.filter(data)
  };

  togglerSidebar() {
    document.body.classList.toggle("is-collapsed-sidebar")
  }

  destroy() {
    window
    this.toggleSidebar.removeEventListener('click', this.togglerSidebar);
    document.removeEventListener('product-filter', this.filterData);

    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}

import SortableTable from '../../../components/sortable-table/index.js';
import DoubleSlider from '../../../components/double-slider/index.js';
import header from '../products-header.js';

export default class Page {
  subElements = {};
  components = {};
  url;

  getTemplate() {
    return `
      <div class='products-list'>
        <div class="content__top-panel">
          <h1 class="page-title">Goods</h1>
          <a href="/products/add" class="button-primary">Add product</a>
        </div>
        <div class="content-box content-box_small">
          <form class="form-inline">
            <div class="form-group">
              <label class="form-label">Sort by:</label>
              <input type="text" data-element="filterName" class="form-control" placeholder="Product name">
            </div>
            <div class="form-group" data-element="doubleSlider">
              <label class='form-label'>Price:</label>
            </div>
            <div class="form-group">
              <label class="form-label">Status:</label>
              <select class="form-control" data-element="filterStatus">
                <option value="" selected>Any</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
          </form>
        </div>
        <div data-element='productsContainer' class='products-list__container'>
          <div data-element="sortableTable" class="sortable-table"></div>
        </div>
      </div>
`
  }

  urlInitializer() {
    this.url = new URL('api/rest/products', process.env.BACKEND_URL);
    this.url.searchParams.set('_embed', 'subcategory.category');
  }

  renderLinkItem(dataItem) {
    return `
      <a href="/products/${dataItem.id}" class="sortable-table__row">
        ${this.headerConfig.find(obj => obj.id === 'images').template(dataItem.images)}
        <div class="sortable-table__cell">${dataItem.title}</div>
        ${this.headerConfig.find(obj => obj.id === 'subcategory').template(dataItem.subcategory)}
        <div class="sortable-table__cell">${dataItem.quantity}</div>
        <div class="sortable-table__cell">${dataItem.price}</div>
        ${this.headerConfig.find(obj => obj.id === 'status').template(dataItem.status)}
      </a>
      `
  }

  initialize() {
    this.urlInitializer();
    this.components = {
      sortableTable: new SortableTable(header, {
        url: this.url,
        sorted: {
          order: 'desc',
          id: 'title'
        },
        renderLinkItem: this.renderLinkItem,
      }),
      doubleSlider: new DoubleSlider({
        min: 0,
        max: 4000
      })
    }

    this.renderComponents();
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.initialize();
    this.attachEventListeners();
    return this.element;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accumulator, subElement) => {
      accumulator[subElement.dataset.element] = subElement;
      return accumulator;
    }, {})
  }

  renderComponents() {
    Object.keys(this.components).forEach((component) => {
      const container = this.subElements[component];
      const { element } = this.components[component];
      container.append(element);
    })
  }

  rangeSelectHandler = async (event) => {
    this.url.searchParams.set('price_gte', event.detail.from);
    this.url.searchParams.set('price_lte', event.detail.to);
    this.components.sortableTable.sortOnServer({
      updatedURL: this.url
    })
  }

  sortByStatusHandler = async (event) => {
    this.url.searchParams.set('status', event.target.value);
    this.components.sortableTable.sortOnServer({
      updatedURL: this.url
    })
  }

  sortByNameHandler = async (event) => {
    this.url.searchParams.set('title_like', event.target.value);
    this.components.sortableTable.sortOnServer({
      updatedURL: this.url
    })
  }

  attachEventListeners() {
    this.components.doubleSlider.element.addEventListener('range-select', this.rangeSelectHandler);
    this.element.querySelector('[data-element="filterStatus"]')
      .addEventListener('change', this.sortByStatusHandler);
    this.element.querySelector('[data-element="filterName"]')
      .addEventListener('input', this.sortByNameHandler);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
    this.remove();
    this.subElements = {};
  }
}

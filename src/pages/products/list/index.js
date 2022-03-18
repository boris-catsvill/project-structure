import SortableTable from '../../../components/sortable-table/index.js';
import header from './products-header.js';

import fetchJson from '../../../utils/fetch-json.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  async initComponents () {
    const sortableTable = new SortableTable(header, {
      url: 'api/rest/products?_embed=subcategory.category&_sort=title&_order=asc&_start=0&_end=30',
      isSortLocally: false,
      step: 30,
      rowWrapper: (item, callback) => {
        return `
          <a href="/products/${item.id}" class="sortable-table__row">
            ${callback}
          </a>
        `;
      }
    });

    this.components.sortableTable = sortableTable;
  }

  get template () {
    return `<div class="products-list">
      <div class="content__top-panel">
        <h1 class="page-title">Products</h1>
        <a href="/products/add" class="button-primary">Add product</a>
      </div>

      <div data-element="sortableTable">
        <!-- sortable-table component -->
      </div>
    </div>`;
  }

  async render () {
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.initComponents();

    this.renderComponents();
    this.initEventListeners();

    return this.element;
  }

  renderComponents () {
    Object.keys(this.components).forEach(component => {
      const root = this.subElements[component];
      const { element } = this.components[component];

      root.append(element);
    });
  }

  getSubElements ($element) {
    const elements = $element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {});
  }

  initEventListeners () {
    // this.components.rangePicker.element.addEventListener('date-select', event => {
    //   const { from, to } = event.detail;
      
    //   this.updateTableComponent(from, to);
    // });
  }

  destroy () {
    for (const component of Object.values(this.components)) {
      component.destroy();
    }
  }
}

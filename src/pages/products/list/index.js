import SortableTable from '../../../components/sortable-table/index.js';
import FilterForm from '../../../components/filter-form/filter-form.js';

import header from './products-header.js';

export default class Page {
  element;
  subElements = {};
  components = {};

  onInput = async () => {
    try {
      const values = this.getValueFromFilter();

      const id = this.components.sortableTable.url.searchParams.get('_sort');
      const order = this.components.sortableTable.url.searchParams.get('_order');

      this.components.sortableTable.url = this.changeTableUrl(values);

      const data = await this.components.sortableTable.loadData(id, order);

      this.components.sortableTable.data = data;
      this.components.sortableTable.bodyReFilling(data);
    } catch (error) {
      console.log(error);
    }
  };

  constructor() {}

  getTemplate() {
    const div = document.createElement('div');

    div.innerHTML = `
      <div class="dashboard">
        <div class="content__top-panel">
          <h2 class="page-title">Products</h2>
          <a href="/products/add" class="button-primary">Add product</a>
       </div>
       <div data-element="filterLine" class="content-box content-box_small">
       </div>
        <div data-element="sortableTable">
            <!-- sortable-table component -->
        </div>
      </div>`;

    this.element = div.firstElementChild;

    this.getSubElements();
  }

  getValueFromFilter() {
    const valueElements = this.components.filterForm.valueElements;
    const values = {};

    for (const elem in valueElements) {
      if (valueElements[elem].getValue) {
        values[elem] = valueElements[elem].getValue();
      } else {
        values[elem] = valueElements[elem].value;
      }
    }

    return values;
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');

    for (const elem of elements) {
      this.subElements[elem.dataset.element] = elem;
    }
  }

  getFilterForm() {
    const filterForm = new FilterForm();

    this.components.filterForm = filterForm;

    this.subElements.filterLine.append(filterForm.element);
  }

  changeTableUrl({ doubleSlider: { from, to }, input: name, select: status }) {
    const { url } = this.components.sortableTable;

    url.searchParams.set('_start', 0);
    url.searchParams.set('_end', 30);
    url.searchParams.set('price_gte', from);
    url.searchParams.set('price_lte', to);

    name ? url.searchParams.set('title_like', name) : url.searchParams.delete('title_like');

    status ? url.searchParams.set('status', status) : url.searchParams.delete('status');

    return url;
  }

  getProductsTable() {
    const table = new SortableTable(header, {
      url: 'api/rest/products'
    });

    this.components.sortableTable = table;

    this.subElements.sortableTable.append(table.element);
  }

  render() {
    this.getTemplate();

    this.getFilterForm();
    this.getProductsTable();
    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {
    this.element.addEventListener('input', this.onInput);
    this.element.addEventListener('range-select', this.onInput);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = null;
    this.element.removeEventListener('input', this.onInput);
    this.element.removeEventListener('range-select', this.onInput);

    for (const component in this.components) {
      this.components[component].destroy();
    }

    this.components = null;
  }
}

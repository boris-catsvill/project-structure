import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';
const collator = new Intl.Collator(['ru', 'en'], { sensitivity: 'variant', caseFirst: 'upper' });
const DATA_INC = 30;

export default class SortableTable {
  data = [];

  constructor(
    headerConfig,
    {
      url = '',
      isSortLocally = false,
      sorted = {
        id: '',
        order: ''
      }
    } = {}
  ) {
    this.headerConfig = headerConfig;
    this.url = url;
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;
  }

  get template() {
    return `
    ${this.headerTemplate}
    <div data-element='body' class='sortable-table__body'>
    ${this.bodyTemplate}
    </div>
    `;
  }

  get headerTemplate() {
    return `
    <div data-element='header' class='sortable-table__header sortable-table__row'>
      ${this.headerConfig.map(({ id, title, sortable, template }) => {
      if (template) {
        return template(this.data);
      } else {
        return this.headerCellTemplate(id, sortable, title);
      }
    }).join('\n')}
    </div>
    `;
  }

  headerCellTemplate(id, sortable, title) {
    return `
    <div class='sortable-table__cell' data-id='${id}' data-sortable='${sortable}'
    ${this.sorted?.id === id ? `data-order=${this.sorted.order}` : ''}>
      <span>${title}</span>
      <span data-element='arrow' class='sortable-table__sort-arrow'>
        <span class='sort-arrow'></span>
      </span>
    </div>
    `;
  }

  get bodyTemplate() {
    return this.data.map(item => `
        <a href='/products/${item.id}' class='sortable-table__row'>
        ${this.headerConfig.map(configItem => {
          const itemProperty = item[configItem.id];
          const itemTemplate = configItem.template ? configItem.template : this.defaultItemTemplate;
          return itemTemplate(itemProperty);
        }).join('\n')}
        </a>`
    ).join('\n');
  }

  defaultItemTemplate = data => {
    return `${data ? `<div class='sortable-table__cell'>${data}</div>` : ''}`;
  };

  async render() {
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'sortable-table';
    tableWrapper.innerHTML = this.template;

    this.element = tableWrapper;
    this.subElements = this.getSubElements();

    await this.loadData(this.sorted?.id, this.sorted?.order);

    this.init();

    return this.element;
  }

  reRenderTableBody(id = this.sorted.id, order = this.sorted.order) {
    for (const headerCell of this.subElements.header.children) {
      if (headerCell.dataset.id === id) {
        headerCell.dataset.order = order;
      } else {
        headerCell.dataset.order = '';
      }
    }
    this.subElements.body.innerHTML = this.bodyTemplate;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  init() {
    for (const headerCell of this.subElements.header.children) {
      if (headerCell.dataset.sortable) {
        headerCell.addEventListener('pointerdown', (event) => {
          const sortableCell = event.target.closest('[data-sortable=\'true\']');
          if (sortableCell) {
            this.sortTable(sortableCell.dataset.id);
          }
        });
      }
    }
    window.addEventListener('scroll', this.loadDataOnScroll);
  }

  sortTable(id) {
    const order = this.toggleSort(id);
    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else if (!this.loading) {
      this.sortOnServer(id, order, this.range.end);
    }
  }

  toggleSort(id) {
    if (id && this.sorted?.id !== id) {
      this.sorted.id = id;
      this.sorted.order = 'asc';
    } else {
      this.sorted.order = this.sorted.order === 'asc' ? 'desc' : 'asc';
    }
    return this.sorted.order;
  }

  sortOnClient(id, order) {
    this.sortData();
    this.reRenderTableBody(id, order);
  }

  sortData() {
    if (!this.hasSortParams()) {
      return;
    }

    const sortType = this.headerConfig.find(it => it.id === this.sorted.id).sortType;
    const rule = (x, y) => {
      switch (sortType) {
      case 'number':
        return this.sorted.order === 'asc' ?
          x[this.sorted.id] - y[this.sorted.id] :
          y[this.sorted.id] - x[this.sorted.id];
      case 'string':
        return this.sorted.order === 'asc' ?
          collator.compare(x[this.sorted.id], y[this.sorted.id]) :
          collator.compare(y[this.sorted.id], x[this.sorted.id]);
      }
    };
    this.data.sort(rule);
  }

  hasSortParams() {
    return this.sorted && this.sorted.id && this.sorted.order;
  }

  sortOnServer(id, order, end) {
    this.loading = true;
    this.data = [];
    this.reRenderTableBody(id, order);
    fetchJson(this.dataRequestUrl({ id, order, start: 0, end }))
      .then(data => {
        this.data = data;
        this.reRenderTableBody(id, order);
        this.loading = false;
      });
  }

  async loadData(id, order) {
    this.loading = true;
    if (!this.range) {
      this.range = { start: 0, end: DATA_INC };
    } else {
      this.range.start += DATA_INC;
      this.range.end += DATA_INC;
    }

    await fetchJson(this.dataRequestUrl({ id, order, start: this.range.start, end: this.range.end }))
      .then(data => {
        this.data.push(...data);
        this.reRenderTableBody();
        this.loading = false;
      });
  }

  loadDataOnScroll = async () => {
    const { bottom } = this.element.getBoundingClientRect();
    const { id, order } = this.sorted;

    if (bottom < document.documentElement.clientHeight && !this.loading && !this.isSortLocally) {
      await this.loadData(id, order);
    }
  };

  dataRequestUrl({ id, order, start, end }) {
    const dataRequestUrl = new URL(this.url, `${BACKEND_URL}`);
    dataRequestUrl.searchParams.set('_embed', 'subcategory.category');
    if (id) {
      dataRequestUrl.searchParams.set('_sort', id);
    }
    if (order) {
      dataRequestUrl.searchParams.set('_order', order);
    }
    dataRequestUrl.searchParams.set('_start', start);
    dataRequestUrl.searchParams.set('_end', end);
    return dataRequestUrl;
  }

  destroy() {
    if (this.element) {
      this.element.remove();
    }

    this.element = null;
    this.subElements = {};

    window.removeEventListener('scroll', this.loadDataOnScroll);
  }
}

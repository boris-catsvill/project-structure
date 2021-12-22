const BACKEND_URL = process.env.BACKEND_URL;
const MAX_ROWS_IN_REQUEST = 30;

export default class SortableTable {
  element;
  subElements = {};
  listeners = [];
  visibleRows = 0;
  range = {
    from: void 0,
    to: void 0
  };
  rowClickUrl


  constructor(headerConfig, {
    url = '',
    data = [],
    sorted = {},
    isSortLocally = false,
    range = {
      from: void 0,
      to: void 0
    },
    rowClickUrl
  } = {}) {
    this.range = range;
    this.url = url;
    this.headerConfig = headerConfig;
    this.data = Array.isArray(data) ? data : data.data;
    this.hasData = this.data && Boolean(this.data.length);
    this.sorted = {
      id: headerConfig.find(item => item.sortable).id,
      order: 'asc',
      ...sorted
    };
    this.isSortLocally = isSortLocally;
    this.rowClickUrl = rowClickUrl
    void this.render();
  }

  getTableHeader() {
    return `<div data-element='header' class='sortable-table__header sortable-table__row'>
      ${this.headerConfig.map(item => this.getHeaderRow(item)).join('')}
    </div>`;
  }

  getHeaderRow({ id, title, sortable }) {
    return `
      <div class='sortable-table__cell' data-id='${id}' data-sortable='${sortable}'>
        <span>${title}</span>
        <span data-element='arrow' class='sortable-table__sort-arrow'>
          <span class='sort-arrow'></span>
        </span>
      </div>
    `;
  }

  initClickListener = (elem) => {
    const sortSelectRow = (id) => () => {
      if (this.sorted.id === id) {
        this.sorted.order = this.sorted.order === 'asc' ? 'desc' : 'asc';
      } else {
        this.sorted.id = id;
        this.sorted.order = 'desc';
      }
      void this.sort();
    };
    const sortHandler = sortSelectRow(elem.getAttribute('data-id'));
    elem.addEventListener('pointerdown', sortHandler);
    this.listeners.push({
      elem, sortHandler
    });
  };

  addEventListeners() {
    document.addEventListener('scroll', this.scrollHandler);
    this.element
      .querySelectorAll('[data-id][data-sortable="true"]')
      .forEach(elem => this.initClickListener(elem));
  }

  getTableBody() {
    return `
      <div data-element='body' class='sortable-table__body'>
        ${this.getTableRows(this.data)}
      </div>`;
  }

  getTableRows(data) {
    return data.map(item => this.rowClickUrl
      ? `<a href='${this.rowClickUrl+ item.id }' class='sortable-table__row'>
          ${this.getTableRow(item)}
        </a>`
      : `<a class='sortable-table__row'>
          ${this.getTableRow(item)}
        </a>`
    ).join('');
  }

  getTableRow(item) {
    const cells = this.headerConfig.map(({ id, template }) => {
      return {
        id,
        template
      };
    });

    return cells.map(({ id, template }) => {
      return template
        ? template(item[id])
        : `<div class='sortable-table__cell'>${item[id]}</div>`;
    }).join('');
  }

  getTable() {
    return `
      <div class='sortable-table'>
        ${this.getTableHeader()}
        ${this.getTableBody()}
      </div>`;
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTable();
    const element = wrapper.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(element);

    this.addEventListeners();
    await this.sort();
    document.createElement('div');
  }

  async sort() {
    this.visibleRows = 0;
    const id = this.sorted.id;
    const order = this.sorted.order;

    if (this.isSortLocally) {
      await this.sortOnClient(id, order);
    } else {
      await this.sortOnServer(id, order);
    }
  }

  getData = async (id, order, visibleRows = 0) => {
    const url = new URL(this.url, BACKEND_URL);
    if (id) {
      url.searchParams.append('_sort', id);
    }
    if (order) {
      url.searchParams.append('_order', order);
    }
    if (this.range.from) {
      url.searchParams.append('from', this.range.from.toISOString());
    }
    if (this.range.to) {
      url.searchParams.append('to', this.range.to.toISOString());
    }
    if (this.range.createdAt_gte) {
      url.searchParams.append('createdAt_gte', this.range.createdAt_gte.toISOString());
    }
    if (this.range.createdAt_lte) {
      url.searchParams.append('createdAt_lte', this.range.createdAt_lte.toISOString());
    }
    url.searchParams.append('_start', visibleRows);
    url.searchParams.append('_end', visibleRows + MAX_ROWS_IN_REQUEST);
    return (await fetch(url.toString())).json();
  };

  scrollHandler = async () => {
    const { bottom } = this.element.getBoundingClientRect();
    if (bottom < document.documentElement.clientHeight && !this.isLoading) {
      this.isLoading = true;
      const id = this.sorted.id;
      const order = this.sorted.order;
      this.visibleRows += MAX_ROWS_IN_REQUEST;
      const scrollData = await this.getData(id, order, this.visibleRows);
      this.sortedData = [...this.sortedData, ...scrollData];
      this.updateData(this.sortedData, id, order);
      this.isLoading = false;
    }
  };

  sortOnServer = async (id, order) => {
    this.sortedData = await this.getData(id, order);
    this.updateData(this.sortedData, id, order);
  };

  sortOnClient = async (id, order) => {
    if (!this.hasData) {
      this.data = await this.getData(id, order);
    }
    this.sortedData = this.sortData(id, order);
    this.updateData(this.sortedData, id, order);
  };

  updateData = (data, id, order) => {
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${id}"]`);
    allColumns.forEach(column => {
      column.dataset.order = '';
    });
    currentColumn.dataset.order = order;
    this.subElements.body.innerHTML = this.getTableRows(data);
  };

  sortData(id, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find(item => item.id === id);
    const { sortType } = column;
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];

    return arr.sort((a, b) => {
      switch (sortType) {
        case 'number':
          return direction * (a[id] - b[id]);
        case 'string':
          return direction * a[id].localeCompare(b[id], ['ru', 'en']);
        default:
          return direction * (a[id] - b[id]);
      }
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

  update = (range) => {
    this.range = range;
    this.visibleRows = 0;
    void this.sort();
  };

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.listeners.forEach(pair => {
      pair.elem.removeEventListener('pointerdown', pair.sortHandler);
    });
    document.removeEventListener('scroll', this.scrollHandler);
  }
}

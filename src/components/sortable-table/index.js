import fetchJson from '../../utils/fetch-json.js';
import vars from '../../utils/vars.js';

export default class SortableTable {
  element;
  subElements = {};
  data;
  onPage = 20;
  start = 1;
  end = this.start + this.onPage;
  loading = false;

  constructor(headerConfig = [],
              {url = '', isSortLocally = false,
              sorted = {id: headerConfig.find(item => item.sortable).id, order: 'asc'}} = {}) {
    this.headerConfig = headerConfig;
    this.url = new URL(url, vars.BACKEND_URL);
    this.isSortLocally = isSortLocally;
    this.sorted = sorted;

    if (!this.isSortLocally) {
      this.onPage = 30;
    }

    this.render();
  }

  async loadData(id, order, start, end) {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);
    const data = await fetchJson(this.url);

    if (data.length) {
      this.subElements.loading.remove();
    } else {
      this.subElements.body.insertAdjacentHTML('beforeend', '<p>по заданному критерию запроса данные отсутствуют</p>');
    }
    return data;
  }

  update(data) {
    const bodyContent = data.map(row => {
      return `<a href="/products/${row.id}" class="sortable-table__row">
        ${this.headerConfig.map(cell => {
          const headerCell = cell.template ?
            cell.template(row[cell.id]) :
            `<div class="sortable-table__cell">${row[cell.id]}</div>`;
          return headerCell;
        }).join('')
        }
        </a>
        `
      }).join('');

    if (this.start > this.onPage) {
      this.subElements.body.insertAdjacentHTML('beforeend', bodyContent);
    } else {
      this.subElements.body.innerHTML = bodyContent;
    }
    this.rows = this.getRows();
    this.fields = this.getFields();
  }

  getHeaderTemplate() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig.map(item => {
            return `<div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-order="">
              <span>${item.title}</span>
              ${item.sortable ?
              `<span data-element="arrow" class="sortable-table__sort-arrow">
                  <span class="sort-arrow"></span>
              </span>` : ``
              }
              </div>`;
          }).join('')
        }
      </div>
      `
  }

  getRows() {
    const bodyRows = Array.from(this.subElements.body.querySelectorAll('.sortable-table__row'));
    return bodyRows;
  }

  getFields() {
    const fields = this.headerConfig.map(item => item.id);
    return fields;
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
      <div class="sortable-table sortable-table_loading">
        <div class="sortable-table__loading-line" data-element="loading"><div class="loading-line"></div></div>
        ${this.getHeaderTemplate()}
        <div data-element="body" class="sortable-table__body"></div>
      </div>
      `
  }

  async render() {
    const element = document.createElement("div");
    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    const data = await this.loadData(this.sorted.id, this.sorted.order, this.start, this.end);
    this.update(data);
    this.initEventListeners();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }

  sortOnClient(field = '', order = '') {
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];
    const fieldIndex = this.fields.indexOf(field);
    const sortType = this.headerConfig[fieldIndex].sortType;

    const sortedRows = [...this.rows].sort((row1, row2) => {
      if (sortType === 'string') {
        return direction * row1.children[fieldIndex].innerHTML.localeCompare(row2.children[fieldIndex].innerHTML, ['ru', 'en'], { caseFirst: "upper" });
      } else if (sortType === 'number') {
        return direction * (row1.children[fieldIndex].innerHTML - row2.children[fieldIndex].innerHTML);
      } else {
        sortType(row1, row2);
      }
      return;
    });

    this.subElements.body.innerHTML = sortedRows.map(item => {
      return item.outerHTML;
    }).join('');
  }

  async sortOnServer (id, order) {
    this.start = 1;
    this.end = this.start + this.onPage;
    this.sorted.id = id;
    this.sorted.order = order;
    const data = await this.loadData(this.sorted.id, this.sorted.order, this.start, this.end);
    this.update(data);
  }

  sort(id, order) {
    for (const elem of this.subElements.header.querySelectorAll(`[data-order]`)) {
      elem.dataset.order = '';
    }
    this.subElements.header.querySelector(`[data-id="${id}"]`).dataset.order = order;

    if (this.isSortLocally) {
      this.sortOnClient(id, order);
    } else {
      this.sortOnServer(id, order);
    }
  }

  initEventListeners() {
    const sortableColumns = this.subElements.header.querySelectorAll(`[data-sortable="true"]`);

    for (const item of sortableColumns) {
      item.addEventListener("pointerdown", () => {
        switch (item.dataset.order) {
          case "asc":
            return this.sort(item.dataset.id, "desc");
          case "desc":
            return this.sort(item.dataset.id, "asc");
          default:
            this.sort(item.dataset.id, "desc");
            return;
        }
      });
    }

    document.addEventListener('scroll', async () => {
      const blockBottom = this.element.getBoundingClientRect().bottom;

      if (document.documentElement.clientHeight > blockBottom && !this.loading && !this.isSortLocally) {
        this.start = this.end;
        this.end = this.start + this.onPage;
        this.loading = true;

        const data = await this.loadData(this.sorted.id, this.sorted.order, this.start, this.end);
        this.update(data);
        this.loading = false;
      }
    })
  }
}

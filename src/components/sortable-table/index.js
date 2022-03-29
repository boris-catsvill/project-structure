import fetchJson from '../../utils/fetch-json';

export default class SortableTable {
  element = {};
  subElements = {};
  data = [];
  order = 'asc';
  id = 'title';
  isLoading = false;
  constructor(headerConfig, {
    url = '',
    sorted = {},
    isSortLocally = false,
    start = 1,
    step = 20,
    end = start + step,
    isNotLinkRow = false,
  } = {}) {
    this.headerConfig = headerConfig;
    this.sorted = sorted;
    this.url = url;
    this.isSortLocally = isSortLocally;
    this.start = start;
    this.step = step;
    this.end = end;
    this.isNotLinkRow = isNotLinkRow;

    this.render();
  }
  loadData = async (
    push = false,
    id = this.sorted.id || 'title',
    order = this.sorted.order || 'asc',
    from = this.start,
    to = this.end
  ) => {
    this.url.searchParams.set('_sort', id);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', from);
    this.url.searchParams.set('_end', to);

    this.element.classList.add('sortable-table_loading');
    
    if (push) {
      const addedData = await fetchJson(this.url);
      return [...this.data, ...addedData];
    } 
    const data = await fetchJson(this.url);
    this.element.classList.remove('sortable-table_loading');

    return data;
  };

  sortOnClient = (id, order) => {
    const newArr = [...this.data];
    const { sortType } = this.headerConfig.find(item => item.id === id);
    
    const directions = {
      asc: 1,
      desc: -1,
    };
    const direction = directions[order];
    
    return newArr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[id] - b[id]);
      case 'string':
        return direction * a[id].localeCompare(b[id], ['ru', 'en']);
      default:
        return direction * (a[id] - b[id]);
      }
    });
  };

  sortOnServer = async (id, order) => {
    return await this.loadData(false, id, order, 1);
  };
  
  get template() {
    return `
        <div class="sortable-table">
          <div data-element="header" class="sortable-table__header sortable-table__row">
            ${this.renderRowHeading()}
          </div>
          <div data-element="body" class="sortable-table__body">
          </div>
        </div>
    `;
  }

  renderRowHeading = () => {
    return this.headerConfig.map(item => {
      return ` 
        <div class="sortable-table__cell" data-id="${item.id}" data-sortable="${item.sortable}" data-active="heading">
          <span>${item.title}</span>
          <span data-element = "arrow" class = "sortable-table__sort-arrow">
            <span class = "sort-arrow"></span>
          </span>
        </div>
    `;
    }).join('');
  };

  renderRowBody = (data) => {
    return data.map(product => {
      if (this.isNotLinkRow) {
        return `
            <div class="sortable-table__row">
              ${this.renderSortableCell(product)}
            </div>`;
      }
      if (!this.isNotLinkRow) {
        return `
            <a href="/products/${product.id}" class="sortable-table__row">
              ${this.renderSortableCell(product)}
            </a>
        `;
      }
    }).join('');
  };

  renderSortableCell = (product) => {
    return this.headerConfig.map(({template, id}) => {
      if (template) {
        return template(product[id]);
      }
      return `<div class="sortable-table__cell">${product[id]}</div>`;
    }).join('');
  };

  clickTableHandler = async (e) => {
    const headingCell = e.target.closest('[data-active="heading"]');
    
    if (headingCell.dataset.sortable === 'true') {
      this.order = headingCell.dataset.order === 'desc' ? 'asc' : 'desc';
      this.id = headingCell.dataset.id;
      
      await this.sort(this.id, this.order);
      headingCell.dataset.order = this.order;
    }
  };

  scrollTableHandler = async () => {
    
    const scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
    const {scrollTop, clientHeight} = document.documentElement;
    
    if (scrollTop + clientHeight >= scrollHeight && !this.isLoading && !this.isSortLocally) {
      
      this.start += this.step;
      this.end += this.step;

      this.isLoading = true;

      this.data = await this.loadData(true, this.id, this.order, this.start);

      this.update(this.data);

      this.isLoading = false;
    }
  };

  render = async () => {
    const $wrapper = document.createElement('div');
    $wrapper.insertAdjacentHTML('beforeend', this.template);
    this.element = $wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    
    this.data = await this.loadData();
    
    this.subElements.body.innerHTML = this.renderRowBody(this.data);

    const { id, order } = this.sorted;

    if (id && order) {
      this.element.querySelector(`.sortable-table__cell[data-id=${id}]`).dataset.order = order;
      this.subElements.body.innerHTML = this.renderRowBody(this.sortOnClient(id, order));
    }
    this.ihitEventListeners();
  };

  sort = async (id, order) => {
    const $allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    $allColumns.forEach(item => item.dataset.order = '');

    if (this.isSortLocally) {
      this.data = this.sortOnClient(id, order);
      this.subElements.body.innerHTML = this.renderRowBody(this.data);
      return;
    }
    this.data = await this.sortOnServer(id, order);
    this.subElements.body.innerHTML = this.renderRowBody(this.data);
  };

  getSubElements = ($el) => {
    const result = {};
    const $els = $el.querySelectorAll('[data-element]');
    $els.forEach(item => {
      const name = item.dataset.element;
      result[name] = item;
    });
    
    return result;
  };

  update = (data) => {
    this.data = data;
    this.subElements.body.innerHTML = this.renderRowBody(data);
  };

  ihitEventListeners = () => {
    this.subElements.header.addEventListener('pointerdown', this.clickTableHandler);
    window.addEventListener('scroll', this.scrollTableHandler);
  };

  destroy = () => {
    this.remove();
    this.element = null;
    this.subElements = null;
    window.removeEventListener('scroll', this.scrollTableHandler);
  };

  remove = () => {
    this.element.remove();
  };
}
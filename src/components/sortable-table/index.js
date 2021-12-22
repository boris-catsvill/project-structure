import throttle from '../../utils/throttle';
import Component from '../../utils/component';


const BACKEND_URL = `${process.env.BACKEND_URL}`;

export default class SortableTable extends Component {
  hadleClearFilterClick = () => {
    this.element.classList.remove('sortable-table_empty')
    this.emitEvent('clear-filter', {}, true);
  }

  handleSortItems = ({ target }) => {
    const column = target.closest('[data-sortable=true]');

    if (column) {
      const { id, order } = column.dataset;

      const header = this.getChildElementByName('header');
      const allSortableColumns = header.querySelectorAll('[data-sortable="true"]');

      const arrow = header.querySelector('.sortable-table__sort-arrow');
      const currentArrow = column.querySelector('[data-element="arrow"]');

      const newDirection = this.toggleDirectionArrow(order);   
      const findColumn = [...allSortableColumns].find(it => it.dataset.id === id);


      if (!currentArrow) {
        column.append(arrow);
      }

      findColumn.dataset.order = newDirection;

      this.sorted = { id, order: newDirection };

      if (this.isSortLocally) {
        this.sortOnClient(id, newDirection);
      } else {
        console.log('s')
        this.sortOnServer(id, newDirection);
      }
    }
  }

  handleScroll = async () => {
    const { bottom } = this.refToElement.getBoundingClientRect();
    const { id, order } = this.sorted;

    if (bottom < document.documentElement.clientHeight && !this.loaded && this.sortOnServer && !this.isEmptyResult) {
      this.start = this.end;
      this.end = this.start + this.step;
      
      this.loaded = true;

      const data = await this.handleLoadData(id, order, this.start, this.end)
        .finally(() => this.loaded = false);
    
      this.data = [...this.data, ...data];
      this.getChildElementByName('body').innerHTML = this.renderTableRows();
    }
  }

  updateUrl(value){
    Object.entries(value).forEach(
      ([k, v]) => this.url.searchParams.set(k, v)
    );
  }

  deleteUrl(query) {
    this.url.searchParams.delete(query);
  }

  constructor(
    headerConfig = [], 
    {
      url = '',
      sorted = {
        id: headerConfig.find(item => item.sortable).id,
        order: 'asc'
      },
      isSortLocally = false,
      step = 20,
      start = 1,
      hasInfinityScroll = false,
      hasRowClicked = false,
      queryParams = {},
      end = start + step
    } = {}
  ) {
    super();
    this.headerConfig = headerConfig;
    this.data = [];
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.hasInfinityScroll = hasInfinityScroll;
    this.hasRowClicked = hasRowClicked;

    this.start = start;
    this.step = end;

    this.end = this.start + this.step;

    this.queryParams = queryParams;

    this.url = new URL(url, BACKEND_URL);

    this.loaded = false;

    this.render();
  }

  toggleDirectionArrow(order) {
    const direction = {
      ['asc']: 'desc',
      ['desc']: 'asc'
    };

    return direction[order];
  }

  async sortOnClient(id, order) {
    this.data = this.sortData(id, order);
    this.getChildElementByName('body').innerHTML = this.renderTableRows(this.data);
  }

  async sortOnServer(id, order) {
    const start = 1;
    const end = start + this.step;

    this.data = await this.handleLoadData(id, order, start, end);

    if(!this.data) {
      this.data = []
    }
    
    const tableBody = this.getChildElementByName('body');
    tableBody.innerHTML = this.renderTableRows();
  }

  initEventListeners() {
    this.getChildElementByName('header').addEventListener('pointerdown', this.handleSortItems);
    this.getChildElementByName('clearButton').addEventListener('pointerdown', this.hadleClearFilterClick)

    if(this.hasInfinityScroll) {
      this.handleThottleScroll = throttle(this.handleScroll, 500);
      document.addEventListener('scroll', this.handleThottleScroll);
    }
  }

  removeEventListeners() {
    this.getChildElementByName('header').removeEventListener('pointerdown', this.handleSortItems);
    this.getChildElementByName('clearButton').removeEventListener('pointerdown', this.hadleClearFilterClick)

    if(this.handleThottleScroll) {
      document.removeEventListener('scroll', this.handleThottleScroll);
    }
  }

  get template() {
    return (
      `<div class="sortable-table">
        ${this.renderTableHead()}
        ${this.renderTableBody()}
  
        <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
    
        <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
          <div>
            <p>Не найдено товаров удовлетворяющих выбранному критерию</p>
            <button type="button" data-element="clearButton" class="button-primary-outline">Очистить фильтры</button>
          </div>
        </div>
      </div>`
    );
  }

  async handleLoadData(title, order, start, end) {
    this.url.searchParams.set('_sort', title);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', start);
    this.url.searchParams.set('_end', end);

    if(Object.values(this.queryParams).length) {
      this.updateUrl(this.queryParams);
    }
    
    if (this.isEmptyResult) {
      return;
    }

    if (this.refToElement) {
      this.refToElement.classList.add('sortable-table_loading');
    }

    const data = await this.fetchJson(this.url)
      .finally(() => this.refToElement.classList.remove('sortable-table_loading'));


    if (!data.length) {
      this.isEmptyResult = true;
    } else {
      this.isEmptyResult = false;
    }

    return data;
  }

  async render() { 
    const { id, order } = this.sorted;   

    this.element = this.createElement(this.template);
    this.setChildren(this.element);

    this.data = await this.handleLoadData(order, id, this.start, this.end);
    this.subElements.body.innerHTML = this.renderTableRows();

    this.initEventListeners();
  }

  renderTableHead() {
    return (
      `<div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.renderTableColumnHead()}
      </div>`
    );
  }

  renderTableBody() {
    return (
      `<div data-element="body" class="sortable-table__body"></div>`
    );
  }

  renderTableRows() {
    return this.data.map(
      (item) => (
        `<a ${this.hasRowClicked ? `href="/products/${item.id}"` : ``} class="sortable-table__row">
          ${this.renderTableRow(item)}
        </a>`
      )
    )
    .join(' ');
  }

  renderTableRow(item) {
    const cell = this.headerConfig.map(({ id, template }) => ({ id, template }));

    return cell.map(({ id, template }) => template ? template(item[id]) : (`<div class="sortable-table__cell">${item[id]}</div>`)
    ).join(' ');
  }

  renderTableColumnHead() {
    const hasOrder = (id) => this.sorted.id === id ? this.sorted.order : 'asc';
    const arrowTemplate = (
      `<span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>`
    );

    const renderSortArrow = (id) => this.sorted.id === id ? arrowTemplate : '';

    return this.headerConfig.map((it) => {
      return (
        `<div class="sortable-table__cell" data-id="${it.id}" data-sortable="${it.sortable}" data-order='${hasOrder(it.id)}'>
            <span>${it.title}</span>
            ${renderSortArrow(it.id)}
        </div>`
      );
    })
    .join(' ');
  }

  sortData(field, order) {
    const SortTypes = {
      ASC: 'asc',
      DESC: 'desc'
    };
    
    const Direction = {
      [SortTypes.ASC]: 1,
      [SortTypes.DESC]: -1
    };

    const DataTypes = {
      STRING: 'string',
      NUMBER: 'number'
    };

    const currentSort = this.headerConfig.find(({ id }) => id === field);

    if (currentSort) {
      const { sortType } = currentSort;
      
      switch (sortType) {
      case DataTypes.NUMBER:
        return [...this.data].sort(
          (a, b) => (a[field] - b[field]) * Direction[order]
        );

      case DataTypes.STRING:
        return [...this.data].sort(
          (a, b) => a[field].localeCompare(b[field], ['ru', 'eng']) * Direction[order]
        );
      }
    }
  }

  update(data) {
    if(!data.length) {
      this.element.classList.add('sortable-table_empty');
    } else {
      this.element.classList.remove('sortable-table_empty');
    }

    this.data = data;
    this.subElements.body.innerHTML = this.renderTableRows();
  }
}
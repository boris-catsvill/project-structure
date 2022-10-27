export default class SortableTable {
  
  element = null;
  subElements = {}
  statusOfLoading = 'fulfilled'
  data = []

  constructor(headerConfig, {
    url = ``,
    sorted: {
      id: field = headerConfig.find(cell => cell.sortable).id,
      order = 'asc'
    } = {},
    isSortLocally = false,
    pagination = true,
    clickableRows = true,
    searchParams
  } = {}) {

    this.paramOfSort = {
      ...searchParams,
      '_sort': searchParams._sort ? searchParams._sort : field,
      '_order': order,
    };

    this.isSortLocally = isSortLocally;
    this.pagination = pagination;
    this.clickableRows = clickableRows

    this.headerConfig = headerConfig;

    this.cells = this.headerConfig.map(item => item.id);
    this.url = new URL(url);

    this.templates = this.headerConfig.reduce((acc, headerItem) => {
      if (headerItem.template) {
        const { id, template } = headerItem;
        acc[id] = template;
      }
      return acc;
    }, {});
  }

  getArrowOfSort() {
    return (
      `<span class="sortable-table__sort-arrow">
        <span class="sortable-table__sort-arrow_${this.paramOfSort.order}"></span>
      </span>`
    );
  }

  getLoadingLine() {
    return (
      `<div data-element="loading" class="loading-line sortable-table__loading-line"></div>`
    );
  }

  getMessageForEmptyDataOfLoading() {
    return (
      `<div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
        <div>
          <p>No products satisfies your filter criteria</p>
          <button type="button" class="button-primary-outline">Reset all filters</button>
        </div>
      </div>`
    );
  }

  getCellOfTableHeader({ title, sortable, id }) {
    const isSortedCell = id === this.paramOfSort.field;
    const [dataOrder, elementOfSort] = isSortedCell
      ? [`data-order="${this.paramOfSort.order}"`, this.getArrowOfSort()]
      : ['', ''];
    return (
      `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" ${dataOrder}">
        <span>${title}</span>
        ${elementOfSort}
      </div>`
    );
  }

  getTableHeader() {
    const elementsOfTableHeader = this.headerConfig.map(cellItem => this.getCellOfTableHeader(cellItem)).join('');
    return elementsOfTableHeader;
  }

  getCellOfTableBody(value, key) {

    return this.templates[key]
      ? this.templates[key](value)
      : `<div class="sortable-table__cell">${value}</div>`;
  }

  getRowOfTableBody(rowItem) {
    const typeOfContainer = this.clickableRows ? 'a' : 'div';
    const href = this.clickableRows ? `href="/products/${rowItem.id}"` : '';
    return (
      `<${typeOfContainer} ${href} class="sortable-table__row" data-element="rowOfTableBody">
          ${this.cells.map(key => this.getCellOfTableBody(rowItem[key], key)).join('')}
       </${typeOfContainer}>`
    );
  }

  getTableBody() {
    const elementsOfTableBody = this.data.map((rowItem => this.getRowOfTableBody(rowItem))).join('');
    return elementsOfTableBody;
  }

  get elementDOM() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = (
      `<div class="sortable-table sortable-table_loading">
        <div data-element="header" class="sortable-table__header sortable-table__row">
          ${this.getTableHeader()}
        </div>
        <div data-element="body" class="sortable-table__body"></div>
          ${this.getLoadingLine()}
          ${this.getMessageForEmptyDataOfLoading()}
      </div>`
    );
    return wrapper.firstElementChild;
  }

  urlSetSearchParams() {
    Object.entries(this.paramOfSort).forEach(([key, value]) => {
      this.url.searchParams.set(key, value)
    })
  }

  switchStatusOfLoading() {
    const switcherStatusOfLoading = {
      pending: () => {
        this.element.classList.remove('sortable-table_loading');
        this.statusOfLoading = 'fulfilled';
      },
      fulfilledWithEmptyValue: () => {
        this.element.classList.remove('sortable-table_loading');
        this.element.classList.add('sortable-table_empty');
        this.statusOfLoading = 'fulfilled';
      },
      fulfilled: () => {
        this.element.classList.add('sortable-table_loading');
        this.element.classList.remove('sortable-table_empty');
        this.statusOfLoading = 'pending';
      },
    };
    switcherStatusOfLoading[this.statusOfLoading]();
  }

  async getData() {
    try {
      this.switchStatusOfLoading();
      this.urlSetSearchParams();

      const response = await fetch(this.url.toString());
      const sortedata = await response.json();

      if (!sortedata.length) { this.statusOfLoading = 'fulfilledWithEmptyValue'; }

      this.switchStatusOfLoading();
      return sortedata;

    } catch (error) {
      throw new Error(error.message)
    }
    
  }

  async sortOnServer() {
    return await this.getData();
  }

  sortOnClient() {
    const { field, order } = this.paramOfSort;
    const paramOfShift = order === 'asc' ? 1 : -1;

    const sortedData = [...this.data].sort((firstItem, secondItem) => {
      firstItem = firstItem[field];
      secondItem = secondItem[field];

      const resultOfComparing = typeof firstItem === 'string'
        ? firstItem.localeCompare(secondItem, ["ru", "en"], { caseFirst: 'upper', number: true })
        : firstItem - secondItem;
      return resultOfComparing * paramOfShift;
    });
    return sortedData;
  }

  updateElement() {
    const { body, header, loading } = this.subElements;

    header.innerHTML = this.getTableHeader();
    body.innerHTML = this.getTableBody();

    if (this.isSortLocally) {
      loading.remove();
    }
  }

  async sort() {
    if (this.isSortLocally) {
      this.data = this.sortOnClient();
    } else {
      const { body } = this.subElements;
      body.innerHTML = '';
      this.data = await this.sortOnServer();
    }
    this.updateElement();
  }

  async update() {
    this.data = await this.getData();
    this.updateElement();
  }

  setSubElements() {
    const elements = this.element.querySelectorAll('div[data-element]');
    for (const element of elements) {
      const name = element.dataset.element;
      this.subElements[name] = element;
    }
  }

  sortByHeaderHandler = (event) => {
    if (this.statusOfLoading === 'pending') { return; }
    const sortableTarget = event.target.closest('div[data-sortable="true"]');
    if (!sortableTarget) { return; }
    let { dataset:
      {
        order = 'asc',
        id: field
      }
    } = sortableTarget;
    if (this.paramOfSort.field === field) {
      order = this.paramOfSort.order === 'asc' ? 'desc' : 'asc';
    }
    this.paramOfSort = { ...this.paramOfSort, ...{ field, order } };
    this.sort();
  }

  scrollHandler = () => {
    const scrollHeight = Math.max(
      document.body.scrollHeight, document.documentElement.scrollHeight,
      document.body.offsetHeight, document.documentElement.offsetHeight,
      document.body.clientHeight, document.documentElement.clientHeight
    );
    const windowHeight = document.documentElement.clientHeight;
    const scrolled = window.pageYOffset + windowHeight;
    const limitOfScrolling = scrollHeight - windowHeight / 6;

    if (scrolled > limitOfScrolling && this.statusOfLoading === 'fulfilled') {
      this.paramOfSort.end = this.paramOfSort.end + 30;
      this.getDataFromServer().then(data => {
        this.data = data;
        this.updateElement();
      });
    }
  };

  resetParamsOfSortHandler = (startParams) => async () => {
    this.paramOfSort = startParams;
    this.data = await this.getDataFromServer();
    this.updateElement();
  }

  addEventListeners() {
    const { header, emptyPlaceholder } = this.subElements;
    if (this.pagination) {
      document.addEventListener('scroll', this.scrollHandler);
    }
    header.addEventListener('pointerdown', this.sortByHeaderHandler);

    emptyPlaceholder.addEventListener('click', this.resetParamsOfSortHandler({ ...this.paramOfSort }));
  }

  removeEventListeners() {
    document.removeEventListener('scroll', this.scrollHandler);
  }

  render() {
    this.element = this.elementDOM;
    this.setSubElements()
    this.addEventListeners();
  }

  remove() {
    this.element?.remove();
    this.element = null;
    this.subElements = {};
  }
  destroy() {
    this.removeEventListeners();
    this.remove();
  }
}



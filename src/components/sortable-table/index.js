import fetchJson from '../../utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

function createQueryParams(params) {
  return Object.entries(params)
    .map(([key, value]) => `${ key }=${ value }`)
    .join('&');
}

export default class SortableTable {
  element = null;
  subElements = {};

  pageSize = 30;
  isLoading = false;
  range = [];

  onSortClick = (ev) => {
    const targetColumn = ev.target.closest('[data-sortable="true"]');
    if (targetColumn) {
      const { id: sortFieldName } = targetColumn.dataset;
      const isFieldCurrentlySorted = this.currentSort.fieldName === sortFieldName;
      const sortOrder = isFieldCurrentlySorted && this.currentSort.order === 'desc' ? 'asc' : 'desc';

      this.currentSort = { fieldName: sortFieldName, order: sortOrder };
      if (this.isLocalSort) {
        this.sortOnClient(sortFieldName, sortOrder);
      } else {
        this.sortOnServer(sortFieldName, sortOrder);
      }
    }

  };

  onTableScroll = (ev) => {
    if (!this.isLoading && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight) {
      this.pageNumber++;
      //reset: false для того, чтобы не перерисовывать body полностью (как при локальной сортировке)
      // а просто добавить новые строки в конеу
      this.loadTableData({ reset: false });
    }
  };

  constructor(headersConfig, {
    data = [],
    sorted = {},
    isSortLocally = false,
    url = '',
    range = [],
    infinite = true,
    requestParamsConverter = null
  } = {}) {
    this.url = url;
    this.isLocalSort = isSortLocally;
    this.data = [...data];
    this.pageNumber = 0;
    this.range = range;
    this.infinite = infinite;

    this.headerConfig = headersConfig;
    this.requestParamsConverter = requestParamsConverter;

    const { id: sortFieldName, order: sortOrder } = sorted;
    this.currentSort = sortFieldName ? {
      fieldName: sortFieldName,
      order: sortOrder
    } : {};

    this.render();
  }

  isEmptyData = () => !this.isLoading && !this.data.length;

  get emptyPlaceholder() {
    return `<div
      data-element='emptyPlaceholder'
      class='sortable-table__empty-placeholder'
    >
      <div>
        <p>Нет данных. Укажите другие параметры поиска</p>
        <button
          type='button'
          class='button-primary-outline'
        >Очистить фильтры
        </button>
      </div>
    </div>`;
  }

  get headerTemplate() {
    const { fieldName, order } = this.currentSort;
    return this.headerConfig.map(({ id, title, sortable, sortType }) => {
      const isColumnSorted = fieldName === id;
      return `<div class='sortable-table__cell' data-sortable='${ sortable }' data-id='${ id }' data-order='${ isColumnSorted ? order : '' }'>
            <span>${ title }</span>
            <span data-element='arrow' class='sortable-table__sort-arrow'>
                <span class='sort-arrow'></span>
           </span>
      </div>`;
    }).join('');
  }

  getRowTemplate(row) {
    return this.headerConfig.map(({ id, template }) => {
      return (
        typeof template === 'function' ? template(row[id]) :
          `<div class='sortable-table__cell'>${ row[id] }</div>`
      );
    }).join('');
  }

  get rowsTemplate() {
    return this.data.map((row) => (
      `<div class='sortable-table__row'>
            ${ this.getRowTemplate(row) }
      </div>`))
      .join('');
  }

  get template() {
    return `<div class='sortable-table'>
        <div data-element='header' class='sortable-table__header sortable-table__row'>
          ${ this.headerTemplate }
        </div>
        <div data-element='body' class='sortable-table__body'>
          ${ this.rowsTemplate }
        </div>
        <div data-element='loading' class='loading-line sortable-table__loading-line'></div>
           ${ this.emptyPlaceholder }
      </div>`;
  }


  async loadDataByRange(from, to) {
    this.range = [from, to];
    //сбрасываем пагинацию
    this.pageNumber = 1;
    // this.end = this.start + this.pageSize;

    // const { id, order } = this.sorted;
    return this.loadTableData();
  }

  setData(data) {
    this.data = data;
    this.subElements.body.innerHTML = this.rowsTemplate;
  }

  sortLocalData(fieldName, order) {
    const fieldConfig = this.headerConfig.find(({ id }) => id === fieldName);
    if (fieldConfig && fieldConfig.sortable) {
      const multiplier = order === 'desc' ? -1 : 1;
      this.data.sort(({ [fieldName]: a }, { [fieldName]: b }) => {
        switch (fieldConfig.sortType) {
          case 'string':
            return multiplier * a.localeCompare(b, ['ru', 'en'], {
              caseFirst: 'upper'
            });
          case 'number':
          default:
            return multiplier * (a - b);
        }
      });
    }
  }

  addEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
    if (this.infinite) {
      window.addEventListener('scroll', this.onTableScroll);
    }
  }

  appendRows(newRows) {
    newRows.forEach((row) => {
      const rowElement = document.createElement('div');
      rowElement.classList.add('sortable-table__row');
      rowElement.innerHTML = this.getRowTemplate(row);
      this.subElements.body.append(rowElement);
    });
  }

  loadTableData({ reset = true, ...additionalParams } = {}) {
    this.isLoading = true;

    const startIndex = this.pageNumber * this.pageSize;
    const endIndex = startIndex + this.pageSize - 1;
    let requestParams = {
      ...additionalParams,
      _start: startIndex,
      _end: endIndex
    };

    if (this.currentSort.fieldName && !this.isLocalSort) {
      const { fieldName, order } = this.currentSort;
      requestParams._sort = fieldName;
      requestParams._order = order;
    }

    if (this.range.length === 2) {
      const [from, to] = this.range;
      requestParams.from = from.toISOString();
      requestParams.to = to.toISOString();
    }

    if (this.requestParamsConverter) {
      requestParams = this.requestParamsConverter(requestParams);
    }

    let url = `${ BACKEND_URL }/${ this.url }?${ createQueryParams(requestParams) }`;
    this.element.classList.add('sortable-table_loading');
    return fetchJson(url)
      .then(data => {
        this.element.classList.remove('sortable-table_loading');
        this.data = reset ? [...data] : this.data.concat(data);

        this.isLoading = false;
        if (this.isLocalSort && this.currentSort.fieldName) {
          // при локальной сортировке перерисовываем body целиком
          const { fieldName, order } = this.currentSort;
          this.sortOnClient(fieldName, order);
        } else {
          //иначе либо аппендим строки, либо перерисовываем
          // Если сбрасываем данные (например, новая сортировка)- перерисовываем боди целиком
          // иначе просто аппендим новые строки
          if (reset) {
            this.reRender();
          } else {
            this.appendRows(data);
          }
        }
      });
  }

  render() {
    const elementContainer = document.createElement('div');
    elementContainer.innerHTML = this.template;

    this.element = elementContainer.firstChild;
    const tableComponents = this.element.querySelectorAll('[data-element]');

    tableComponents.forEach(component => {
      this.subElements[component.dataset.element] = component;
    });

    this.addEventListeners();
    return this.loadTableData({ reset: true });
  }

  reRender() {
    this.subElements.body.innerHTML = this.rowsTemplate;
    this.subElements.header.innerHTML = this.headerTemplate;
  }

  removeEventListeners() {
    window.removeEventListener('scroll', this.onTableScroll);
  }

  destroy() {
    if (this.element) {
      this.removeEventListeners();
      this.element.remove();
      this.element = null;
    }

    this.subElements = {};
  }

  sortOnClient(fieldName, order) {
    this.sortLocalData(fieldName, order);

    //перерисовываем body
    this.subElements.body.innerHTML = this.rowsTemplate;
    this.subElements.header.innerHTML = this.headerTemplate;
  }

  sortOnServer(fieldName, order) {
    // Сортировка  применится внутри loadTableData, параметры возьмёт из this.currentSort
    // Сбрасываем номер страницы для загрузки
    this.pageNumber = 0;
    this.loadTableData();
  }
}

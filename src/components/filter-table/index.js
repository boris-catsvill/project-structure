import SortableTable from '../sortable-table/index.js';

export default class FilterTable extends SortableTable {
  clearButton;

  constructor(
    headerConfig = [],
    {
      url = '',
      isSortLocally = !Boolean(url),
      data = [],
      sorted = {
        id: headerConfig.find(item => item.sortable).id,
        order: 'asc'
      },
      namesForApiRange = {
        from: 'from',
        to: 'to'
      },
      linkRow = { hrefTemplate: item => `/products/${item}`, field: 'id' },
      range,
      filter = {},
      filters = []
    }
  ) {
    super(headerConfig, {
      url,
      isSortLocally,
      data,
      sorted,
      namesForApiRange,
      linkRow,
      range
    });

    this.filter = filter;
    this.filters = filters;
    this.createClearButton();
  }

  updateData() {
    this.hideLoading();
    if (this.isDataLoaded()) {
      const filtered = this.filterData();
      if (filtered.length > 0) {
        this.hidePlaceholder();
      } else {
        this.showPlaceholder(this.clearButton);
      }
      this.subElements.header.innerHTML = this.getHeaderInnerTemplate();
      this.subElements.body.innerHTML = this.getBodyInnerTemplate(filtered);
    } else {
      this.showPlaceholder();
    }
  }
  //

  createClearButton() {
    const wrap = document.createElement('div');
    wrap.innerHTML =
      '<button type="button" class="button-primary-outline">Очистить фильтры</button>';
    this.clearButton = wrap.firstElementChild;
    this.clearButton.addEventListener('click', this.clearFilters);
  }

  clearFilters = () => {
    const clearEvent = new CustomEvent('clear-filters');
    document.dispatchEvent(clearEvent);
  };

  applyFilter(filter = this.filter) {
    this.filter = filter;
    this.updateData();
  }

  filterData(data = this.data) {
    let filterArray = [...data];

    this.filters.forEach(filterItem => {
      if (filterItem.testFns(this.filter[filterItem.id])) {
        filterArray = filterArray.filter(item =>
          filterItem.filterFns(item, this.filter[filterItem.id])
        );
      }
    });

    return filterArray;
  }

  destroy() {
    this.clearButton();
    super.destroy();
  }
}

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
      filter = {
        byName: '',
        byPrice: null,
        byStatus: null
      }
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
    this.createClearButton();

    this.render();
  }

  updateData() {
    console.dir(this.subElements);
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

  filterData(filterData = this.data) {
    let filterArray = [...filterData];

    console.log('filterData', this.filter);

    if (this.filter.byName) {
      filterArray = filterArray.filter(
        item => item['title'] && item['title'].includes(this.filter.byName)
      );
    }
    // if (this.filter.byPrice && this.filter.byPrice.from && this.filter.byPrice.to) {
    //   filterArray = filterData.filter(item => item['title'].includes(this.filter.byName));
    // }
    if (typeof this.filter.byStatus === 'number') {
      filterArray = filterArray.filter(item => item['status'] === this.filter.byStatus);
    }

    return filterArray;
  }

  destroy() {
    this.clearButton();
    super.destroy();
  }
}

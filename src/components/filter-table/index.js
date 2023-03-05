import SortableTable from '../sortable-table/index.js';

export default class FilterTable extends SortableTable {
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
        byStatus: ''
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

    this.render();
  }

  updateData() {
    this.hideLoading();
    if (this.isDataLoaded()) {
      const filtered = this.filterData();
      this.hidePlaceholder();
      this.subElements.header.innerHTML = this.getHeaderInnerTemplate();
      this.subElements.body.innerHTML = this.getBodyInnerTemplate(filtered);
    } else {
      this.showPlaceholder();
    }
  }

  applyFilter(filter = this.filter) {
    this.filter = filter;
    this.updateData();
  }

  filterData(filterData = this.data) {
    let filterArray = [...filterData];

    if (this.filter.byName) {
      filterArray = filterData.filter(
        item => item['title'] && item['title'].includes(this.filter.byName)
      );
    }
    // if (this.filter.byPrice && this.filter.byPrice.from && this.filter.byPrice.to) {
    //   filterArray = filterData.filter(item => item['title'].includes(this.filter.byName));
    // }

    return filterArray;
  }
}

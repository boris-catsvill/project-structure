import SortableTable from '../sortable-table';

export default class ProductsTable extends SortableTable {
  getTableRows(data) {
    return data.map(item => `
      <a href="/products/${item.id}" class="sortable-table__row">
        ${this.getTableRow(item, data)}
      </a>`
    ).join('');
  }

  async updateFilters(filters) {
    this.url.searchParams.set('price_gte', filters.filterRange.from);
    this.url.searchParams.set('price_lte', filters.filterRange.to);
    this.url.searchParams.set('title_like', filters.filterName);

    if (filters.filterStatus) {
      this.url.searchParams.set('status', this.filters.filterStatus);
    } else {
      this.url.searchParams.delete('status');
    }

    const newData = await this.loadData();
    this.addRows(newData);
  }
}

import SortableTable from '../sortable-table';

export class ProductSortableTable extends SortableTable {
  getTableRows(data) {
    return data
      .map(
        item => `
      <a href='/products/${item.id}' class='sortable-table__row'>
        ${this.getTableRow(item)}
      </a>`
      )
      .join('');
  }
}

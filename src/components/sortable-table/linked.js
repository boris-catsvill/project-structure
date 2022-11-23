import SortableTable from './index';

export default class LinkedSortableTable extends SortableTable {
  renderRows(data = []) {
    return data.map(item => {
      return `<a href="/products/${item.id}" class="sortable-table__row">${this.renderRow(item)}</a>`;
    }).join('');
  }
}

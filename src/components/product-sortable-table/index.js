import SortableTable from '../sortable-table';
import { getPageLink } from '../sidebar/menu';

export class ProductSortableTable extends SortableTable {
  getTableRows(data) {
    return data
      .map(
        item => `<a href='${getPageLink('products')}/${item.id}' class='sortable-table__row'>
                    ${this.getTableRow(item)}
                 </a>`
      )
      .join('');
  }
}

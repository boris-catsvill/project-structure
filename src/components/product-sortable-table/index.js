import SortableTable from '../sortable-table';
import { getPageLink } from '../sidebar/menu';
import { ROUTER_LINK } from '../../router/router-link';

export class ProductSortableTable extends SortableTable {
  getTableRows(data) {
    return data
      .map(
        item => `
          <a is='${ROUTER_LINK}' 
             href='${getPageLink('products')}/${item.id}' 
             class='sortable-table__row'>
             ${this.getTableRow(item)}
          </a>`
      )
      .join('');
  }
}

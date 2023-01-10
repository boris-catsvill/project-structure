import BasicPage from '../basic-page';
import RangePicker from '../../components/range-picker';
import SortableTable from '../../components/sortable-table';
import escapeHtml from '../../utils/escape-html';
import { currencyFormat, dateFormat } from '../../utils/formatters';

/**
 * Sales page
 */
export default class extends BasicPage {

  initComponents() {
    const from = new Date();
    const to = new Date(from.getTime());
    from.setMonth(from.getMonth() - 1);

    const rangePicker = new RangePicker({ from, to });

    const columns = [
      { id: 'id', title: 'ID', sortable: true, sortType: 'number' },
      { id: 'user', title: 'Клиент', sortable: true, sortType: 'string' },
      {
        id: 'createdAt', title: 'Дата', sortable: true, sortType: 'string',
        template: (value) => escapeHtml(dateFormat(value))
      },
      {
        id: 'totalCost', title: 'Стоимость', sortable: true, sortType: 'number',
        template: (value) => escapeHtml(currencyFormat(value))
      },
      { id: 'delivery', title: 'Статус', sortable: true, sortType: 'string' }
    ];

    const sortableTable = new SortableTable(columns, {
      url: `api/rest/orders?createdAt_gte=${encodeURIComponent(from.toISOString())}&createdAt_lte=${encodeURIComponent(to.toISOString())}`
    });

    this.components = { rangePicker, sortableTable };

    /* Обработчик изменения диапазона дат */
    this.dateHandler = event => {
      const { from, to } = event.detail;

      sortableTable.url.searchParams.set('createdAt_gte', from.toISOString());
      sortableTable.url.searchParams.set('createdAt_lte', to.toISOString());
      sortableTable.fetchData();
    };
    document.addEventListener('date-select', this.dateHandler);
  }

  destroy() {
    document.removeEventListener('date-select', this.dateHandler);
    super.destroy();
  }

  async render() {
    this.element.classList.add('sales', 'full-height', 'flex-column');
    return super.render();
  }

  getTemplate() {
    return `<div class='dashboard full-height flex-column'>
  <div class='content__top-panel'>
    <h1 class='page-title'>Продажи</h1>
    <div data-element='rangePicker'><!-- RangePicker --></div>
  </div>
  <div data-element='sortableTable' class='full-height flex-column'><!-- SortableTable --></div>
</div>`;
  }
}

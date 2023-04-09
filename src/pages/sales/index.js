import SortableTable from '../../components/sortable-table';
import header from './list-header';
import PageComponent from '../page';
import RangePicker from '../../components/range-picker';

export default class Page extends PageComponent {
  get template() {
    return `
      <div class='sales full-height flex-column'>
        <div class="content__top-panel">
          <h1 class="page-title">Продажи</h1>
          <div data-element='rangePicker'></div>
        </div>
        <div data-element='ordersContainer' class='full-height flex-column'></div>
      </div>
    `;
  }

  initComponents() {
    const to = new Date();
    const from = new Date(to.getFullYear(), to.getMonth() - 1, to.getDate());

    const rangePicker = new RangePicker({ from, to });

    const ordersContainer = new SortableTable(header, {
      url: `${this.backendUrl}/api/rest/orders`,
      sorted: {
        id: 'createdAt',
        order: 'desc',
        createdAt_gte: from,
        createdAt_lte: to,
      },
      isStaticRows: true,
    });

    this.components.rangePicker = rangePicker;
    this.components.ordersContainer = ordersContainer;
  }

  initEventListeners() {
    this.components.rangePicker.element.addEventListener('date-select', event => {
      this.components.ordersContainer.update({
        id: 'createdAt',
        order: 'desc',
        createdAt_gte: event.detail.from,
        createdAt_lte: event.detail.to
      });
    });
  }
}

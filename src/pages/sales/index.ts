import { Menu } from '../../components/sidebar/menu';
import header from './header';
import { DateRangeType } from '../../types';
import { RangePicker } from '../../components/range-picker';
import SortableTable from '../../components/sortable-table';
import { IPage, TypeComponents, TypeSubElements } from '../../types/base';
import { BasePage } from '../../base-page';
import { API_ROUTES, CUSTOM_EVENTS } from '../../constants';

enum ComponentsEnum {
  RangePicker = 'rangePicker',
  SortableTable = 'salesTable'
}

type SalesComponents = {
  [ComponentsEnum.RangePicker]: RangePicker;
  [ComponentsEnum.SortableTable]: SortableTable;
};

class SalesPage extends BasePage implements IPage {
  components: TypeComponents<SalesComponents>;
  subElements: TypeSubElements<SalesComponents>;

  get type() {
    return Menu.sales.page;
  }

  get template() {
    return `<div class='sales full-height flex-column'>
              <div class='content__top-panel'>
                <h2 class='page-title'>Sales</h2>
                <div data-element='${ComponentsEnum.RangePicker}'></div>
              </div>
              <div data-element='${ComponentsEnum.SortableTable}' class='full-height flex-column'></div>
             </div>`;
  }

  initComponents() {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - 1);
    const range: DateRangeType = { from, to };

    const rangePicker = new RangePicker(range);
    const salesTable = new SortableTable(header, {
      url: `${
        API_ROUTES.ORDER
      }?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`,
      sorted: {
        id: 'createdAt',
        order: 'desc'
      }
    });
    this.components = { rangePicker, salesTable };
  }

  async render() {
    super.render();
    this.initComponents();
    this.renderComponents();
    this.initListener();
    return this.element;
  }

  selectDate() {
    const { salesTable, rangePicker } = this.components;
    const { from, to } = rangePicker.rangeDate;
    const orderUrl = new URL(API_ROUTES.ORDER, process.env['BACKEND_URL']);
    orderUrl.searchParams.set('createdAt_gte', from.toISOString());
    orderUrl.searchParams.set('createdAt_lte', to.toISOString());
    salesTable.setUrl(orderUrl);
  }

  initListener() {
    const { rangePicker } = this.components;
    rangePicker.element.addEventListener(CUSTOM_EVENTS.DateSelect, () => this.selectDate());
  }
}

export default SalesPage;

import menu from '../../components/sidebar/menu';
import {
  DateSelectEvent,
  INodeListOfSubElements,
  IPage,
  RangeType,
  SubElementsType
} from '../../types';
import { RangePicker } from '../../components/range-picker';
import SortableTable from '../../components/sortable-table';
import header from './header';
import fetchJson from '../../utils/fetch-json';

type SalesComponents = {
  rangePicker: RangePicker;
  salesTable: SortableTable;
};
type SalesComponentNames = keyof SalesComponents;

class SalesPage implements IPage {
  element: Element | null;
  components: SalesComponents;
  subElements: SubElementsType;

  get type() {
    return menu.sales.page;
  }

  get template() {
    return `<div class='sales full-height flex-column'>
              <div class='content__top-panel'>
                <h2 class='page-title'>Sales</h2>
                <!-- RangePicker component -->
                <div data-element='rangePicker'></div>
              </div>
              <div data-element='salesTable' class='full-height flex-column'></div>
             </div>`;
  }

  initComponents() {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - 1);
    const range: RangeType = { from, to };

    const rangePicker = new RangePicker(range);
    const salesTable = new SortableTable(header, {
      url: `api/rest/orders?createdAt_gte=${from.toISOString()}&createdAt_lte=${to.toISOString()}`,
      sorted: {
        id: 'createdAt',
        order: 'desc'
      }
    });
    this.components = { rangePicker, salesTable };
  }

  render() {
    const wrap = document.createElement('div');
    wrap.innerHTML = this.template;
    this.element = wrap.firstElementChild;
    this.subElements = this.getSubElements(this.element!);
    this.initComponents();
    this.renderComponents();
    this.initListener();
    return this.element;
  }

  renderComponents() {
    // @ts-ignore
    Object.keys(this.components).forEach(async (componentName: SalesComponentNames) => {
      const root = this.subElements[componentName];
      const component = this.components[componentName];
      root.append(component.element);
    });
  }

  getSubElements(element: Element) {
    const elements: INodeListOfSubElements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, el) => {
      const elementName = el.dataset.element;
      acc[elementName] = el;
      return acc;
    }, {} as SubElementsType);
  }

  async loadSalesData(url: URL): Promise<object[]> {
    return fetchJson(url);
  }

  async selectDate(range: RangeType) {
    const { salesTable } = this.components;
    const start = 0;
    const { offset: end } = salesTable;
    const params = { ...range, start, end };
    salesTable.setUrlParams(params);
    salesTable.isLoading = true;
    salesTable.clearTable();
    const loadedDate = await this.loadSalesData(salesTable.url);
    salesTable.isLoading = false;
    salesTable.addRows(loadedDate);
  }

  initListener() {
    const { rangePicker } = this.components;
    rangePicker.element.addEventListener(
      RangePicker.EVENT_DATE_SELECT,
      ({ detail: range }: DateSelectEvent) => this.selectDate(range)
    );
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}

export default SalesPage;

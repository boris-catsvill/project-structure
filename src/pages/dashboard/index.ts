import {
  ComponentsType,
  DateSelectEvent,
  INodeListOfSubElements,
  IPage,
  RangeType,
  SubElementsType
} from '../../types';
import { RangePicker } from '../../components/range-picker';
import { ProductSortableTable } from '../../components/product-sortable-table';
import { ColumnChart } from '../../components/column-chart';
import menu from '../../components/sidebar/menu';
import fetchJson from '../../utils/fetch-json';

import header from './bestsellers-header';

enum Components {
  RangePicker = 'rangePicker',
  OrdersChart = 'ordersChart',
  SalesChart = 'salesChart',
  CustomersChart = 'customersChart',
  SortableTable = 'sortableTable',
  ChartsRoot = 'chartRoot'
}

type ChartSettingType = {
  chart: Components;
  url: string;
  label: string;
  link?: string;
  formatHeading?: (data: any) => string;
};

const BESTSELLER_PRODUCTS_URL = 'api/dashboard/bestsellers?_start=0&_end=30&_sort=title&_order=asc';

class Dashboard implements IPage {
  element: Element;
  subElements: SubElementsType;
  // @ts-ignore
  components: ComponentsType = {};

  get type() {
    return menu.dashboard.page;
  }

  get chartsSettings(): ChartSettingType[] {
    return [
      {
        chart: Components.OrdersChart,
        url: 'api/dashboard/orders',
        label: 'orders',
        link: '#'
      },
      {
        chart: Components.SalesChart,
        url: 'api/dashboard/sales',
        label: 'sales',
        formatHeading: data => `$${data}`
      },
      {
        chart: Components.CustomersChart,
        url: 'api/dashboard/customers',
        label: 'customers'
      }
    ];
  }

  get template() {
    return `<div class='dashboard'>
      <div class='content__top-panel'>
        <h2 class='page-title'>Dashboard</h2>
        <!-- RangePicker component -->
        <div data-element='${Components.RangePicker}'></div>
      </div>
      <div data-element='${Components.ChartsRoot}' class='dashboard__charts'>
        <!-- column-chart components -->
        <div data-element='${Components.OrdersChart}' class='dashboard__chart_orders'></div>
        <div data-element='${Components.SalesChart}' class='dashboard__chart_sales'></div>
        <div data-element='${Components.CustomersChart}' class='dashboard__chart_customers'></div>
      </div>

      <h3 class='block-title'>Best sellers</h3>

      <div data-element='${Components.SortableTable}'>
        <!-- sortable-table component -->
      </div>
    </div>`;
  }

  async render() {
    const wrap = document.createElement('div');
    wrap.innerHTML = this.template;
    this.element = wrap.firstElementChild!;
    this.subElements = this.getSubElements(this.element);
    await this.initComponents();
    this.renderComponents();
    this.initListeners();
    return this.element;
  }

  getSubElements(element: Element) {
    const elements: INodeListOfSubElements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, el) => {
      const elementName = el.dataset.element;
      acc[elementName] = el;
      return acc;
    }, {} as SubElementsType);
  }

  async loadData(range: RangeType) {
    const productsRequest: Promise<object[]> = this.loadProducts(range);
    const chartRequests: Array<Promise<object[]>> = this.loadCharts(range);

    return await Promise.all([productsRequest, ...chartRequests]);
  }

  loadProducts({ from, to }: RangeType): Promise<object[]> {
    const bestsellerProducts = new URL(BESTSELLER_PRODUCTS_URL, process.env.BACKEND_URL);
    bestsellerProducts.searchParams.set('from', from.toISOString());
    bestsellerProducts.searchParams.set('to', to.toISOString());
    return fetchJson(bestsellerProducts);
  }

  loadCharts({ from, to }: RangeType): Array<Promise<object[]>> {
    return this.chartsSettings.map(setting => {
      const url = new URL(setting.url, process.env.BACKEND_URL);
      url.searchParams.set('from', from.toISOString());
      url.searchParams.set('to', to.toISOString());
      return fetchJson(url);
    });
  }

  async initComponents() {
    const to = new Date();
    const from = new Date(to.getFullYear(), to.getMonth() - 1, to.getDate());
    const range = { from, to };
    const [sortableTableData, ...chartsData] = await this.loadData(range);

    this.components[Components.RangePicker] = new RangePicker(range);
    this.components[Components.SortableTable] = new ProductSortableTable(header, {
      data: sortableTableData,
      url: BESTSELLER_PRODUCTS_URL,
      isSortLocally: true
    });
    this.initCharts(chartsData);
  }

  initCharts(chartsData: object[]) {
    this.chartsSettings.forEach((setting, index) => {
      const data = Object.values(chartsData[index]);
      const { chart } = setting;
      this.components[chart] = new ColumnChart({ data, ...setting });
    });
  }

  async updateComponents(range: RangeType) {
    // @ts-ignore
    this.components[Components.SortableTable].isLoading = true;
    // @ts-ignore
    this.components[Components.SortableTable].clearTable();
    this.chartsSettings.forEach(({ chart }, index) => {
      // @ts-ignore
      this.components[chart].isLoading = true;
    });

    const [sortableTableData, ...chartsData] = await this.loadData(range);
    // @ts-ignore
    this.components[Components.SortableTable].addRows(sortableTableData);
    // @ts-ignore
    this.components[Components.SortableTable].isLoading = false;
    this.updateCharts(chartsData);
  }

  updateCharts(chartsData: object[]) {
    this.chartsSettings.forEach(({ chart }, index) => {
      // @ts-ignore
      this.components[chart].update(Object.values(chartsData[index]));
      // @ts-ignore
      this.components[chart].isLoading = false;
    });
  }

  initListeners() {
    // @ts-ignore
    this.components[Components.RangePicker].element.addEventListener(
      RangePicker.EVENT_DATE_SELECT,
      ({ detail: range }: DateSelectEvent) => {
        this.updateComponents(range);
      }
    );
  }

  renderComponents() {
    Object.keys(this.components).forEach(component => {
      // @ts-ignore
      const root = this.subElements[component];
      // @ts-ignore
      const { element } = this.components[component];
      // @ts-ignore
      root.append(element);
    });
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null!;
    // @ts-ignore
    Object.values(this.components).forEach(component => component.destroy());
  }
}

export default Dashboard;

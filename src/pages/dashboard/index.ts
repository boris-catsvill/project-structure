import {
  DateRangeType,
  DateSelectEvent,
  INodeListOfSubElements,
  IPage,
  SubElementsType
} from '../../types';
import { RangePicker } from '../../components/range-picker';
import { ProductSortableTable } from '../../components/product-sortable-table';
import { getPageLink, menu } from '../../components/sidebar/menu';
import fetchJson from '../../utils/fetch-json';

import header from './bestsellers-header';
import { ColumnChart } from '../../components/column-chart';

enum Components {
  RangePicker = 'rangePicker',
  OrdersChart = 'ordersChart',
  SalesChart = 'salesChart',
  CustomersChart = 'customersChart',
  SortableTable = 'sortableTable'
}

type ChartComponents = Record<
  Components.OrdersChart | Components.SalesChart | Components.CustomersChart,
  ColumnChart
>;

type DashboardComponents = {
  [Components.RangePicker]: RangePicker;
  [Components.SortableTable]: ProductSortableTable;
} & ChartComponents;

type ChartSettingType = {
  id: keyof ChartComponents;
  url: string;
  label: string;
  link?: string;
  formatHeading?: (data: any) => string;
};

const BESTSELLER_PRODUCTS_URL = 'api/dashboard/bestsellers?_start=0&_end=30&_sort=title&_order=asc';

class Dashboard implements IPage {
  element: Element;
  subElements: SubElementsType<Components>;
  components: DashboardComponents;

  get type() {
    return menu.dashboard.page;
  }

  get chartsSettings(): ChartSettingType[] {
    return [
      {
        id: Components.OrdersChart,
        url: 'api/dashboard/orders',
        label: 'Orders',
        link: getPageLink('products')
      },
      {
        id: Components.SalesChart,
        url: 'api/dashboard/sales',
        label: 'Sales',
        formatHeading: data => `$${data.toLocaleString('default')}`
      },
      {
        id: Components.CustomersChart,
        url: 'api/dashboard/customers',
        label: 'Customers'
      }
    ];
  }

  get template() {
    return `<div class='dashboard'>
              <div class='content__top-panel'>
                <h2 class='page-title'>Dashboard</h2>
        
                <div data-element='${Components.RangePicker}'></div>
              </div>
              <div class='dashboard__charts'>
        
                <div data-element='${Components.OrdersChart}' class='dashboard__chart_orders'></div>
                <div data-element='${Components.SalesChart}' class='dashboard__chart_sales'></div>
                <div data-element='${Components.CustomersChart}' class='dashboard__chart_customers'></div>
              </div>

              <h3 class='block-title'>Best sellers</h3>

              <div data-element='${Components.SortableTable}'></div>
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
      return { ...acc, [elementName]: el };
    }, {} as SubElementsType);
  }

  async loadData(range: DateRangeType) {
    const productsRequest: Promise<object[]> = this.loadProducts(range);

    /* Example: const chartRequests = {chart1: 'Promise1',chart2: 'Promise2', chart3: 'Promise3'};*/
    const chartRequests: Record<string, Promise<object>> = this.loadCharts(range);

    /* Example: const chartsDataArray = [{ data1 }, { data2 }, { data3 }];*/
    const [productsData, ...chartsDataArray] = await Promise.all([
      productsRequest,
      ...Object.values(chartRequests)
    ]);

    /* Example: const chartsData = {chart1: { data1 }, chart2: { data2 }, chart3: { data3 }};*/
    const chartsData = Object.fromEntries(
      Object.keys(chartRequests).map((key, index) => [key, chartsDataArray[index]])
    ) as Record<string, object>;

    return { productsData, chartsData };
  }

  loadProducts({ from, to }: DateRangeType): Promise<object[]> {
    const bestsellerProducts = new URL(BESTSELLER_PRODUCTS_URL, process.env.BACKEND_URL);
    bestsellerProducts.searchParams.set('from', from.toISOString());
    bestsellerProducts.searchParams.set('to', to.toISOString());
    return fetchJson(bestsellerProducts);
  }

  loadCharts({ from, to }: DateRangeType): Record<string, Promise<object>> {
    return this.chartsSettings.reduce((acc, { id, url }) => {
      const apiUrl = new URL(url, process.env.BACKEND_URL);
      apiUrl.searchParams.set('from', from.toISOString());
      apiUrl.searchParams.set('to', to.toISOString());
      return { ...acc, [id]: fetchJson(apiUrl) };
    }, {});
  }

  async initComponents() {
    const from = new Date();
    const to = new Date();
    from.setMonth(from.getMonth() - 1);
    const range = { from, to };

    const { productsData, chartsData } = await this.loadData(range);

    const rangePicker = new RangePicker(range);
    const sortableTable = new ProductSortableTable(header, {
      data: productsData,
      isSortLocally: true
    });
    const { ordersChart, salesChart, customersChart } = this.initCharts(chartsData);

    this.components = {
      rangePicker,
      sortableTable,
      customersChart,
      ordersChart,
      salesChart
    };
  }

  initCharts(chartsData: Record<string, object>): ChartComponents {
    const charts: Partial<ChartComponents> = {};

    for (const { id, ...chartSettings } of this.chartsSettings) {
      const data = Object.values(chartsData[id]);
      charts[id] = new ColumnChart({ data, ...chartSettings });
    }

    return charts as ChartComponents;
  }

  async updateComponents(range: DateRangeType) {
    const { sortableTable, rangePicker, ...charts } = this.components;

    sortableTable.isLoading = true;
    for (const chart of Object.values(charts)) {
      chart.isLoading = true;
    }

    const { productsData, chartsData } = await this.loadData(range);

    sortableTable.update(productsData);
    for (const [name, chart] of Object.entries(charts)) {
      const data = Object.values(chartsData[name]);
      chart.update(data);
    }
  }

  initListeners() {
    const { rangePicker } = this.components;
    rangePicker.element.addEventListener(
      RangePicker.EVENT_DATE_SELECT,
      ({ detail: range }: DateSelectEvent) => this.updateComponents(range)
    );
  }

  renderComponents() {
    for (const name of Object.keys(this.components) as Components[]) {
      const { element } = this.components[name];
      this.subElements[name].append(element);
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null!;
    Object.values(this.components).forEach(component => component.destroy());
  }
}

export default Dashboard;

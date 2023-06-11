import { DateRangeType, IPage, SubElementsType } from '../../types';
import { RangePicker } from '../../components/range-picker';
import { ProductSortableTable } from '../../components/product-sortable-table';
import { getPageLink, menu } from '../../components/sidebar/menu';
import fetchJson from '../../utils/fetch-json';

import header from './bestsellers-header';
import { ColumnChart } from '../../components/column-chart';
import { DEFAULT_LIMIT } from '../../components/sortable-table';
import { Base } from '../../base';

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

const BESTSELLER_PRODUCTS_URL = `api/dashboard/bestsellers?_start=0&_end=${DEFAULT_LIMIT}&_sort=title&_order=asc`;

class Dashboard extends Base implements IPage {
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
        link: getPageLink('sales')
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
    return `<div class='dashboard  full-height flex-column'>
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

              <div class='full-height' data-element='${Components.SortableTable}' ></div>
            </div>`;
  }

  render() {
    super.render();
    this.initComponents();
    this.renderComponents();
    this.updateComponents();
    this.initListeners();
    return this.element;
  }

  async loadData(range: DateRangeType) {
    const productsPromise: Promise<object[]> = this.loadProducts(range);
    const chartsPromises: Array<Promise<Array<Promise<any>>>> = this.loadCharts(range);
    const [productsData, ...chartsData] = await Promise.all([productsPromise, ...chartsPromises]);
    return { productsData, chartsData };
  }

  loadProducts({ from, to }: DateRangeType): Promise<object[]> {
    const bestsellerProducts = new URL(BESTSELLER_PRODUCTS_URL, process.env.BACKEND_URL);
    bestsellerProducts.searchParams.set('from', from.toISOString());
    bestsellerProducts.searchParams.set('to', to.toISOString());
    return fetchJson(bestsellerProducts);
  }

  loadCharts({ from, to }: DateRangeType): Array<Promise<Array<Promise<DashboardComponents>>>> {
    return this.chartsSettings.map(async ({ id, url }) => {
      const apiUrl = new URL(url, process.env.BACKEND_URL);
      apiUrl.searchParams.set('from', from.toISOString());
      apiUrl.searchParams.set('to', to.toISOString());
      return Promise.all([Promise.resolve(id), fetchJson(apiUrl)]);
    });
  }

  initComponents() {
    const from = new Date();
    const to = new Date();
    from.setMonth(from.getMonth() - 1);
    const range = { from, to };

    //const { productsData, chartsData } = this.loadData(range);

    const rangePicker = new RangePicker(range);
    const sortableTable = new ProductSortableTable(header, {
      data: [],
      isSortLocally: true
    });
    const { ordersChart, salesChart, customersChart } = this.initCharts();

    this.components = {
      rangePicker,
      sortableTable,
      customersChart,
      ordersChart,
      salesChart
    };
  }

  initCharts(chartsData = []): ChartComponents {
    const charts: Partial<ChartComponents> = {};
    for (const { id, ...chartSettings } of this.chartsSettings) {
      charts[id] = new ColumnChart({ data: [], ...chartSettings });
    }
    return charts as ChartComponents;
  }

  async updateComponents() {
    const { sortableTable, rangePicker, ...charts } = this.components;
    const range = rangePicker.rangeDate;
    sortableTable.cleanRows();
    sortableTable.isLoading = true;
    for (const chart of Object.values(charts)) {
      chart.isLoading = true;
    }

    const { productsData, chartsData } = await this.loadData(range);

    sortableTable.update(productsData);
    for (const chartData of chartsData) {
      const [chartName, data] = chartData;
      // @ts-ignore
      const chart = this.components[chartName];
      chart.update(Object.values(data));
    }
  }

  initListeners() {
    const { rangePicker } = this.components;
    rangePicker.element.addEventListener(RangePicker.EVENT_DATE_SELECT, () =>
      this.updateComponents()
    );
  }

  renderComponents() {
    for (const name of Object.keys(this.components) as Components[]) {
      const { element } = this.components[name];
      this.subElements[name].append(element);
    }
  }

  /*  destroy() {
      this.remove();
      this.element = null!;
      Object.values(this.components).forEach(component => component.destroy());
    }*/
}

export default Dashboard;

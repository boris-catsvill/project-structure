import { DateRangeType } from '../../types';
import { RangePicker } from '../../components/range-picker';
import { ProductSortableTable } from '../../components/product-sortable-table';
import { getPageLink, Menu } from '../../components/sidebar/menu';
import fetchJson from '../../utils/fetch-json';

import header from './bestsellers-header';
import { ColumnChart } from '../../components/column-chart';
import { BasePage } from '../../base-page';
import { IPage, TypeComponents, TypeSubElements } from '../../types/base';
import {
  ChartComponentKeys,
  ChartComponents,
  ChartSettingType,
  ComponentsEnum,
  DashboardComponents
} from './types';
import { API_ROUTES, CUSTOM_EVENTS } from '../../constants';

class Dashboard extends BasePage implements IPage {
  components: TypeComponents<DashboardComponents>;
  subElements: TypeSubElements<DashboardComponents>;

  get type() {
    return Menu.dashboard.page;
  }

  get chartsSettings(): ChartSettingType[] {
    return [
      {
        id: ComponentsEnum.OrdersChart,
        url: 'api/dashboard/orders',
        label: 'Orders',
        link: getPageLink('sales')
      },
      {
        id: ComponentsEnum.SalesChart,
        url: 'api/dashboard/sales',
        label: 'Sales',
        formatHeading: data => `$${data.toLocaleString()}`
      },
      {
        id: ComponentsEnum.CustomersChart,
        url: 'api/dashboard/customers',
        label: 'Customers'
      }
    ];
  }

  get template() {
    return `<div class='dashboard  full-height flex-column'>
              <div class='content__top-panel'>
                <h2 class='page-title'>Dashboard</h2>
        
                <div data-element='${ComponentsEnum.RangePicker}'></div>
              </div>
              <div class='dashboard__charts'>
        
                <div data-element='${ComponentsEnum.OrdersChart}' class='dashboard__chart_orders'></div>
                <div data-element='${ComponentsEnum.SalesChart}' class='dashboard__chart_sales'></div>
                <div data-element='${ComponentsEnum.CustomersChart}' class='dashboard__chart_customers'></div>
              </div>

              <h3 class='block-title'>Best sellers</h3>

              <div class='full-height' data-element='${ComponentsEnum.SortableTable}' ></div>
            </div>`;
  }

  async render() {
    super.render();
    this.initComponents();
    this.renderComponents();
    this.updateComponents();
    this.initListeners();
    return this.element;
  }

  async loadData(range: DateRangeType) {
    const productsPromise: Promise<object[]> = this.loadProducts(range);
    const chartsPromises: Array<Promise<[ChartComponentKeys, Record<string, number>]>> =
      this.loadCharts(range);
    const [productsData, ...chartsData] = await Promise.all([productsPromise, ...chartsPromises]);
    return { productsData, chartsData };
  }

  loadProducts({ from, to }: DateRangeType): Promise<object[]> {
    const bestsellerProducts = new URL(API_ROUTES.BESTSELLERS, process.env.BACKEND_URL);
    bestsellerProducts.searchParams.set('from', from.toISOString());
    bestsellerProducts.searchParams.set('to', to.toISOString());
    return fetchJson(bestsellerProducts);
  }

  loadCharts({ from, to }: DateRangeType) {
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
      const chart = this.components[chartName];
      chart.update(Object.values(data));
    }
  }

  initListeners() {
    const { rangePicker } = this.components;
    rangePicker.element.addEventListener(CUSTOM_EVENTS.DateSelect, () => this.updateComponents());
  }
}

export default Dashboard;

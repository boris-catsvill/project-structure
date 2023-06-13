import { ColumnChart } from '../../components/column-chart';
import { RangePicker } from '../../components/range-picker';
import { ProductSortableTable } from '../../components/product-sortable-table';

export enum ComponentsEnum {
  RangePicker = 'rangePicker',
  OrdersChart = 'ordersChart',
  SalesChart = 'salesChart',
  CustomersChart = 'customersChart',
  SortableTable = 'sortableTable'
}

export type ChartComponentKeys =
  | ComponentsEnum.OrdersChart
  | ComponentsEnum.SalesChart
  | ComponentsEnum.CustomersChart;

export type ChartComponents = {
  [K in ChartComponentKeys]: ColumnChart;
};

export type DashboardComponents = {
  [ComponentsEnum.RangePicker]: RangePicker;
  [ComponentsEnum.SortableTable]: ProductSortableTable;
} & ChartComponents;

export type ChartSettingType = {
  id: ChartComponentKeys;
  url: string;
  label: string;
  link?: string;
  formatHeading?: (data: any) => string;
};

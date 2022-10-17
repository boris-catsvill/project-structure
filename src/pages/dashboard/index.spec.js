import { default as DashboardPage } from './index.js';

describe('routes-browser-history-api/dashboard-page', () => {
  let dashboardPage;

  beforeEach(async () => {
    dashboardPage = new DashboardPage();
    const element = await dashboardPage.render();

    document.body.append(element);
  });

  afterEach(() => {
    dashboardPage.destroy();
    dashboardPage = null;
  });

  it('should be rendered correctly', () => {
    expect(dashboardPage.element).toBeVisible();
    expect(dashboardPage.element).toBeInTheDocument();
  });

  it('should render bestsellers table', () => {
    const { sortableTable } = dashboardPage.subElements;

    expect(sortableTable).toBeVisible();
    expect(sortableTable).toBeInTheDocument();
  });

  it('should render "RangePicker" component', () => {
    const { rangePicker } = dashboardPage.subElements;

    expect(rangePicker).toBeVisible();
    expect(rangePicker).toBeInTheDocument();
  });

  it('should render "ordersChart" component', () => {
    const { ordersChart } = dashboardPage.subElements;

    expect(ordersChart).toBeVisible();
    expect(ordersChart).toBeInTheDocument();
  });

  it('should render "salesChart" component', () => {
    const { salesChart } = dashboardPage.subElements;

    expect(salesChart).toBeVisible();
    expect(salesChart).toBeInTheDocument();
  });

  it('should render "customersChart" component', () => {
    const { customersChart } = dashboardPage.subElements;

    expect(customersChart).toBeVisible();
    expect(customersChart).toBeInTheDocument();
  });

  it('should have ability to be removed', () => {
    dashboardPage.remove();

    expect(dashboardPage.element).not.toBeInTheDocument();
  });
});

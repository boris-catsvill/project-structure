import SalesPage from "./index.js";
import {orders} from './__mocks__/orders-data.js';

describe('tests sales page', () => {
  let salesPage;

  beforeEach(async () => {
    fetchMock.mockResponseOnce(JSON.stringify(orders));
    salesPage = new SalesPage();
    const element = await salesPage.render();
    document.body.append(element);
  });

  afterEach(() => {
    fetchMock.resetMocks();
    salesPage.destroy();
    salesPage = null;
  });

  it('should be rendered correctly', () => {
    expect(salesPage.element).toBeVisible();
    expect(salesPage.element).toBeInTheDocument();
  });

  it('should have ability to be removed', () => {
    salesPage.remove();

    expect(salesPage.element).not.toBeInTheDocument();
  });

  it('should add sortable table component', () => {
    const {ordersContainer} = salesPage.components;
    expect(ordersContainer.element).toBeInTheDocument();
  });

  it('should add range picker component', () => {
    const {rangePicker} = salesPage.components;
    expect(rangePicker.element).toBeInTheDocument();
  });

});

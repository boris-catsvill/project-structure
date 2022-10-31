import ProductsPage from "./index.js";
import {products} from '../__mocks__/products-data.js';

describe('tests product page list', () => {
  let productPage;

  beforeEach(async () => {
    fetchMock.mockResponseOnce(JSON.stringify(products));
    productPage = new ProductsPage();
    const element = await productPage.render();
    document.body.append(element);
  });

  afterEach(() => {
    fetchMock.resetMocks();
    productPage.destroy();
    productPage = null;
  });

  it('should be rendered correctly', () => {
    expect(productPage.element).toBeVisible();
    expect(productPage.element).toBeInTheDocument();
  });

  it('should have ability to be removed', () => {
    productPage.remove();

    expect(productPage.element).not.toBeInTheDocument();
  });

  it('should add sortable table component', () => {
    const {productsContainer} = productPage.components;
    expect(productsContainer.element).toBeInTheDocument();
  });

  it('should add sort filter component', () => {
    const {sortFilter} = productPage.components;
    expect(sortFilter.element).toBeInTheDocument();
  });

});

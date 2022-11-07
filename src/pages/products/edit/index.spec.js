import AddProductPage from "./index.js";
import categoriesData from './__mocks__/categories-data.js';

describe('tests edit product page', () => {
  let productPage;

  beforeEach(async () => {
    fetchMock
      .once(JSON.stringify(categoriesData));
    productPage = new AddProductPage();
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

  it('should add empty product form component', () => {
    const {productForm} = productPage.components;
    expect(productForm.element).toBeInTheDocument();
  });

});

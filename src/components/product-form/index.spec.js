import ProductForm from './index.js';

import productData from './__mocks__/product-data.js';
import categoriesData from './__mocks__/categories-data.js';

describe('forms-fetch-api-part-2/product-form-v1', () => {
  let productFormComponent;

  beforeEach(async () => {
    fetchMock
      .once(JSON.stringify(categoriesData))
      .once(JSON.stringify(productData));

    const productId = 'some-id';

    productFormComponent = new ProductForm(productId);

    const element = await productFormComponent.render();

    document.body.append(element);
  });

  afterEach(() => {
    fetchMock.resetMocks();
    productFormComponent.destroy();
    productFormComponent = null;
  });

  it('should be rendered correctly', () => {
    expect(productFormComponent.element).toBeVisible();
    expect(productFormComponent.element).toBeInTheDocument();
  });

  it('should render categories data correctly', () => {
    const subcategory = productFormComponent.element.querySelector('#subcategory');

    function prepareCategoryName () {
      const names = [];

      for (const category of categoriesData) {
        for (const child of category.subcategories) {
          names.push(`${category.title} > ${child.title}`);
        }
      }

      return names;
    }

    const categoriesNames = prepareCategoryName();

    expect(subcategory.children[0]).toHaveTextContent(categoriesNames[0]);
    expect(subcategory.children[subcategory.children.length - 1])
      .toHaveTextContent(categoriesNames[categoriesNames.length - 1]);
  });

  it('should render product data correctly', () => {
    const { productForm, imageListContainer } = productFormComponent.subElements;
    const defaultFormData = {
      title: '',
      description: '',
      quantity: 1,
      subcategory: '',
      status: 1,
      price: 100,
      discount: 0
    };

    const fields = Object.keys(defaultFormData);
    const values = {};

    for (const field of fields) {
      values[field] = productForm.querySelector(`#${field}`).value;
    }

    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    values.images = [];
    values.id = productFormComponent.productId;

    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.alt
      });
    }

    expect(values.id).toBe('some-id');
    expect(values.title).toBe('10.1" Планшет Lenovo Tab E10 TB-X104L 32 ГБ 3G, LTE черный');
    expect(values.quantity).toBe('73');
    expect(values.price).toBe('10');
    expect(values.discount).toBe('21');
    expect(values.images[0].url).toBe('https://shop-image.js.cx/101-planset-lenovo-tab-e10-tb-x104l-32-gb-3g-lte-cernyj-8.jpg');
  });

  it('should dispatch "product-updated" event after product creating', async () => {
    const spyDispatchEvent = jest.spyOn(productFormComponent.element, 'dispatchEvent');

    fetchMock
      .once(JSON.stringify({status: 'ok'}));

    await productFormComponent.save();

    const [event] = spyDispatchEvent.mock.calls;

    expect(event[0].type).toEqual('product-updated');
  });

  it('should have ability to be removed', () => {
    productFormComponent.remove();

    expect(productFormComponent.element).not.toBeInTheDocument();
  });
});


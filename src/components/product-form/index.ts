import fetchJson from '../../utils/fetch-json';
import { INodeListOfSubElements, SubElementsType } from '../../types';
import SortableList from '../sortable-list';
import escapeHtml from '../../utils/escape-html';

export default class ProductForm {
  element: Element;
  productId: string = '';
  formData: object = {};
  components: object = {};
  defaultFormData = {
    title: '',
    description: '',
    images: [],
    subcategory: '',
    price: 0,
    discount: 0,
    quantity: 0,
    status: 0
  };
  subElements: object = {};
  categories: object[] = [];

  constructor(productId = '') {
    this.productId = productId;
  }

  static get ADDED_PRODUCT_EVENT() {
    return 'added-product';
  }

  static get UPDATED_PRODUCT_EVENT() {
    return 'updated-product';
  }

  get titleField() {
    return `<div class='form-group form-group__half_left'>
              <fieldset>
                <label class='form-label'>Title</label>
                <input required='' type='text' name='title' class='form-control' placeholder='Product title'>
              </fieldset>
            </div>`;
  }

  get descriptionField() {
    return `<div class='form-group form-group__wide'>
              <label class='form-label'>Description</label>
              <textarea required='' class='form-control' name='description' data-element='description' placeholder='Description'></textarea>
            </div>`;
  }

  get imagesField() {
    return `<div class='form-group form-group__wide' data-element='sortableListContainer'>
        <label class='form-label'>Photo</label>
        <div data-element='imageListContainer'></div>
        <button type='button' name='uploadImage' data-element='uploadImage' class='button-primary-outline'>
          <span>Load</span>
        </button>
      </div>`;
  }

  get categoryField() {
    // @ts-ignore
    return `<div class='form-group form-group__half_left'>
              <label class='form-label'>Category</label>
              <select class='form-control' name='subcategory'>
                ${this.getCategoryOptions(this.categories)}
              </select>
            </div>`;
  }

  get priceGroupField() {
    return `<div class='form-group form-group__half_left form-group__two-col'>
              <fieldset>
                <label class='form-label'>Price ($)</label>
                <input required='' type='number' name='price' class='form-control' placeholder='100'>
              </fieldset>
              <fieldset>
                <label class='form-label'>Discount ($)</label>
                <input required='' type='number' name='discount' class='form-control' placeholder='0'>
              </fieldset>
            </div>`;
  }

  get quantityField() {
    return `<div class='form-group form-group__part-half'>
              <label class='form-label'>Quantity</label>
              <input required='' type='number' class='form-control' name='quantity' placeholder='1'>
            </div>`;
  }

  get statusField() {
    return `<div class='form-group form-group__part-half'>
              <label class='form-label'>Status</label>
              <select class='form-control' name='status'>
                <option value='1'>Active</option>
                <option value='0'>Inactive</option>
              </select>
            </div>`;
  }

  get submitField() {
    return `<div class='form-buttons'>
              <button type='submit' name='save' data-element='submitBtn' class='button-primary-outline'>${this.btnLabel}</button>
            </div>`;
  }

  get btnLabel() {
    return `${this.productId ? 'Save' : 'Add'} product`;
  }

  get template() {
    return `<div class='product-form'>
              <form data-element='productForm' class='form-grid'>
                ${this.titleField}
                ${this.descriptionField}
                ${this.imagesField}
                ${this.categoryField}
                ${this.priceGroupField}
                ${this.quantityField}
                ${this.statusField}
                ${this.submitField}
              </form>
            </div>`;
  }

  get emptyTemplate() {
    return `<div>
              <h1 class='page-title'>Page not found</h1>
              <p>Sorry, but this product does not exist</p>
            </div>`;
  }

  // @ts-ignore
  getImageItem({ url, source }) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<li class='products-edit__imagelist-item sortable-list__item' style=''>
                            <input type='hidden' name='url' value='${escapeHtml(url)}'>
                            <input type='hidden' name='source' value='${escapeHtml(source)}'>
                            <span>
                              <img src='/icon-grab.svg' data-grab-handle='' alt='grab'>
                              <img class='sortable-table__cell-img' alt='Image' src='${escapeHtml(
                                url
                              )}'>
                              <span>${escapeHtml(source)}</span>
                            </span>
                            <button type='button'>
                              <img src='/icon-trash.svg' data-delete-handle='' alt='delete'>
                          </button>
                        </li>`;
    return wrapper.firstElementChild;
  }

  getCategoryOptions(categories: object[] = []) {
    return (
      categories
        //@ts-ignore
        .map(({ subcategories, title: categoryTitle }) =>
          //@ts-ignore
          subcategories
            //@ts-ignore
            .map(subcategory => this.getSubCategoryOption({ categoryTitle, ...subcategory }))
            .join('')
        )
        .join('')
    );
  }

  getSubCategoryOption({ id = '', categoryTitle = '', title: subCategoryTitle = '' }) {
    // @ts-ignore
    const { subcategory } = this.formData;
    const title = `${categoryTitle} > ${subCategoryTitle}`;
    const isCategorySelected = subcategory === id ? 'selected' : '';

    return `<option value='${id}' ${isCategorySelected} >${title}</option>`;
  }

  async render() {
    const productPromise: Promise<object[]> = this.productId
      ? this.loadProductData(this.productId)
      : Promise.resolve([this.defaultFormData]);
    const categoriesPromise: Promise<object[]> = this.loadCategories();
    const [productResponse, categoriesResponse] = await Promise.all([
      productPromise,
      categoriesPromise
    ]);
    const [productData] = productResponse;

    this.formData = productData!;
    this.categories = categoriesResponse!;
    if (this.formData) {
      this.initComponents();
      this.renderForm();
      this.fillForm();
      this.initListeners();
    }

    return this.element;
  }

  renderForm() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.formData ? this.template : this.emptyTemplate;
    this.element = wrapper.firstElementChild!;
    this.subElements = this.getSubElements(this.element);
    this.renderComponents();
  }

  initComponents() {
    // @ts-ignore
    const images = this.formData?.images || [];
    // @ts-ignore
    const items = images.map(img => this.getImageItem(img));
    const imageListContainer = new SortableList({ items });
    // @ts-ignore
    this.components = { imageListContainer };
  }

  renderComponents() {
    Object.keys(this.components).forEach(async component => {
      // @ts-ignore
      const root = this.subElements[component];
      // @ts-ignore
      const { element } = this.components[component];

      root.append(element);
    });
  }

  fillForm() {
    //@ts-ignore
    const { productForm } = this.subElements;
    const excludeFields = ['images', 'subcategory'];
    for (const field of Object.keys(this.defaultFormData)) {
      if (!excludeFields.includes(field)) {
        const input = productForm.querySelector(`[name=${field}]`);
        // @ts-ignore
        input.value = this.formData[field] || this.defaultFormData[field];
      }
    }
  }

  saveProduct(data = {}) {
    // @ts-ignore
    const productUrl = new URL(process.env['PRODUCT_API_PATH'], process.env['BACKEND_URL']);
    const params = {
      method: `${this.productId ? 'PATCH' : 'PUT'}`,
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(data)
    };
    return fetchJson(productUrl, params);
  }

  getSubElements(element: Element) {
    const elements: INodeListOfSubElements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, el) => {
      const elementName = el.dataset.element;
      acc[elementName] = el;
      return acc;
    }, {} as SubElementsType);
  }

  loadProductData(productId: String): Promise<object[]> {
    //@ts-ignore
    const productUrl = new URL(process.env['PRODUCT_API_PATH'], process.env['BACKEND_URL']);
    // @ts-ignore
    productUrl.searchParams.set('id', productId);
    return fetchJson(productUrl);
  }

  loadCategories(): Promise<object[]> {
    //@ts-ignore
    const categoriesUrl = new URL(process.env['CATEGORIES_API_PATH'], process.env['BACKEND_URL']);
    return fetchJson(categoriesUrl);
  }

  async uploadImage({ target: imageInput }: Event) {
    // @ts-ignore
    const { imageListContainer, uploadImage: uploadImageBtn } = this.subElements;
    // @ts-ignore
    const [file] = imageInput.files;
    // @ts-ignore
    imageInput.remove();

    const formData = new FormData();
    // @ts-ignore
    formData.append('image', file);

    uploadImageBtn.disabled = true;
    uploadImageBtn.classList.add('is-loading');
    const response = await fetchJson(process.env['IMGUR_URL'], {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${process.env['IMGUR_CLIENT_ID']}`
      },
      body: formData,
      referrer: ''
    });
    uploadImageBtn.classList.remove('is-loading');
    uploadImageBtn.disabled = false;

    const url = response['data']['link'];
    const source = file['name'];

    const newListImageItem = this.getImageItem({ url, source });
    imageListContainer.querySelector('ul').append(newListImageItem);
  }

  onClickImageLoad(e: PointerEvent) {
    e.preventDefault();
    const inputFileUpload = document.createElement('input');
    inputFileUpload.setAttribute('type', 'file');
    inputFileUpload.setAttribute('accept', 'image/*');
    inputFileUpload.addEventListener('change', (e: Event) => this.uploadImage(e));
    inputFileUpload.click();
  }

  async submitForm(e: SubmitEvent) {
    e.preventDefault();
    const formData = this.getFormData();
    const data = await this.saveProduct(formData);
    this.dispatch(data);
  }

  getFormData() {
    //@ts-ignore
    const { productForm, imageListContainer } = this.subElements;
    const formData = {};
    const numberFields = ['discount', 'price', 'quantity', 'status'];
    const excludeFields = ['images'];
    const fields = Object.keys(this.defaultFormData);
    const imageElements = imageListContainer.querySelectorAll('li');

    if (this.productId) {
      // @ts-ignore
      formData['id'] = this.productId;
    }

    for (const field of fields) {
      if (excludeFields.includes(field)) continue;
      const fieldElement = productForm.querySelector(`[name="${field}"]`);
      const value = fieldElement ? fieldElement.value : '';
      // @ts-ignore
      formData[field] = numberFields.includes(field) ? parseInt(value) : value;
    }

    // @ts-ignore
    formData['images'] = [...imageElements].reduce((acc, imageElement) => {
      const source = imageElement.querySelector('input[name="source"]').value;
      const url = imageElement.querySelector('input[name="url"]').value;
      acc.push({ source, url });
      return acc;
    }, []);

    return formData;
  }

  initListeners() {
    //@ts-ignore
    const { productForm, uploadImage } = this.subElements;
    uploadImage.addEventListener('pointerdown', (e: PointerEvent) => this.onClickImageLoad(e));
    productForm.addEventListener('submit', (e: SubmitEvent) => this.submitForm(e));
  }

  dispatch(detail = {}) {
    const event = this.productId
      ? ProductForm.UPDATED_PRODUCT_EVENT
      : ProductForm.ADDED_PRODUCT_EVENT;

    this.element.dispatchEvent(new CustomEvent(event, { detail }));
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    for (const component of Object.values(this.components)) {
      if (component.destroy) {
        component.destroy();
      }
    }
  }
}

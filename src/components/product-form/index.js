import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements;
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  };
  onSubmit = event => {
    event.preventDefault();

    this.save();
  };
  /* последний обработчик */
  uploadImage = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.addEventListener('change', async () => {
      const [file] = fileInput.files;
      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;
        formData.append('image', file);

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        console.log(IMGUR_CLIENT_ID);
        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: formData
        });

        imageListContainer.firstElementChild.append(this.getImageItem(result.data.link, file.name));

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        fileInput.remove();
      }
    });

    fileInput.click();
  };
  constructor(productId) {
    this.productId = productId;
  }

  template() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Name</label>
              <input required
                id="title"
                value=""
                type="text"
                name="title"
                class="form-control"
                placeholder="Name">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Description</label>
            <textarea required
              id="description"
              class="form-control"
              name="description"
              data-element="productDescription"
              placeholder="Description"></textarea>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Images</label>
            <div data-element="imageListContainer"></div>
            <button data-element="uploadImage" type="button" class="button-primary-outline">
              <span>Upload</span>
            </button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Category</label>
              ${this.createCategoriesSelect()}
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Price ($)</label>
              <input required
                id="price"
                value=""
                type="number"
                name="price"
                class="form-control"
                placeholder="${this.defaultFormData.price}">
            </fieldset>
            <fieldset>
              <label class="form-label">Discount ($)</label>
              <input required
                id="discount"
                value=""
                type="number"
                name="discount"
                class="form-control"
                placeholder="${this.defaultFormData.discount}">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Count</label>
            <input required
              id="quantity"
              value=""
              type="number"
              class="form-control"
              name="quantity"
              placeholder="${this.defaultFormData.quantity}">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Status</label>
            <select id="status" class="form-control" name="status">
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              ${this.productId ? 'Save' : 'Add'} product
            </button>
          </div>
        </form>
      </div>
    `;
  }

  async render() {
    const categoriesPromise = this.loadCategoriesList();
    const productPromise = this.productId
      ? this.loadProductData(this.productId)
      : [this.defaultFormData];

    const [categoriesData, productResponse] = await Promise.all([
      categoriesPromise,
      productPromise
    ]);
    const [productData] = productResponse;

    this.formData = productData;
    this.categories = categoriesData;

    this.renderForm();

    if (this.formData) {
      this.setFormData();
      this.createImageList();
      this.initEventListeners();
    }

    return this.element;
  }

  async save() {
    const product = this.getFormData();

    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      this.dispatchEvent(result.id);
    } catch (error) {
      console.error('Unknown error', error);
    }
  }

  getFormData() {
    const { productForm, imageListContainer } = this.subElements;
    const excludedFields = ['images'];
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));
    const getValue = field => productForm.querySelector(`[name=${field}]`).value;
    const values = {};

    for (const field of fields) {
      const value = getValue(field);
      values[field] = formatToNumber.includes(field) ? parseInt(value) : value;
    }

    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    values.images = [];
    values.id = this.productId;

    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.alt
      });
    }

    return values;
  }

  setFormData() {
    const { productForm } = this.subElements;
    const excludedFields = ['images', 'subcategory'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));

    fields.forEach(item => {
      const element = productForm.querySelector(`#${item}`);
      element.value = this.formData[item] || this.defaultFormData[item];
    });
  }

  renderForm() {
    const element = document.createElement('div');
    element.innerHTML = this.formData ? this.template() : this.getEmptyTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);
  }

  getEmptyTemplate() {
    return `
      <div>
        <h1 class="page-title">Страница не найдена</h1>
        <p>Извините, данный товар не существует</p>
      </div>
    `;
  }

  async loadCategoriesList() {
    return fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  async loadProductData(productId) {
    return fetchJson(`${BACKEND_URL}/api/rest/products?id=${productId}`);
  }

  createCategoriesSelect() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<select class="form-control" id="subcategory" name="subcategory"></select>`;
    const select = wrapper.firstElementChild;
    for (const category of this.categories) {
      for (const child of category.subcategories) {
        select.append(new Option(`${category.title} > ${child.title}`, child.id));
      }
    }
    return select.outerHTML;
  }

  createImageList() {
    const { imageListContainer } = this.subElements;
    const { images } = this.formData;

    const items = images.map(({ url, source }) => this.getImageItem(url, source));

    const sortableList = new SortableList({
      items
    });
    imageListContainer.append(sortableList.element);
  }

  getImageItem(url, name) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
    <li class="products-edit__imagelist-item sortable-list__item">
      <span>
        <img src="/icons/icon-grab.svg" data-grab-handle alt="grab">
        <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
        <span>${escapeHtml(name)}</span>
      </span>
      <button type="button">
        <img src="/icons/icon-trash.svg" alt="delete" data-delete-handle>
      </button>
    </li>
    `;

    return wrapper.firstElementChild;
  }

  getSubElements(element) {
    const subElements = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const item of elements) {
      subElements[item.dataset.element] = item;
    }

    return subElements;
  }

  dispatchEvent(id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id, bubbles: true })
      : new CustomEvent('product-saved', { bubbles: true });

    this.element.dispatchEvent(event);
  }

  initEventListeners() {
    const { productForm, uploadImage } = this.subElements;
    productForm.addEventListener('submit', this.onSubmit);
    uploadImage.addEventListener('click', this.uploadImage);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}

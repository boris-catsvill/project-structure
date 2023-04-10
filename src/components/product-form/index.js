import fetchJson from '../../utils/fetch-json.js';
import SortableList from '../sortable-list/index.js';
import ImageUploader from '../image-uploader/index.js';

const BACKEND_URL = process.env.BACKEND_URL;

export default class ProductForm {
  element;
  subElements = {};
  imageList = {};
  imageUploader = {};
  productDefaults = {
    title: '',
    description: '',
    subcategory: '',
    price: 100,
    discount: 0,
    quantity: 1,
    status: 1
  };
  endpoint = '/api/rest/products';

  onImageUploaded = event => {
    const listElement = this.getImageListItem(event.detail.image);
    this.imageList.append(listElement);
  };

  onSave = event => {
    event.preventDefault();
    this.save();
  };

  constructor(productId = '') {
    this.productId = productId;
    this.url = new URL(this.endpoint, BACKEND_URL);
  }

  async save() {
    const product = this.formToProduct();
    const options = {
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: JSON.stringify(product)
    };

    let eventType;
    if (this.productId.length) {
      eventType = 'product-updated';
      options.method = 'PATCH';
    } else {
      eventType = 'product-saved';
      options.method = 'PUT';
    }

    const response = await fetchJson(this.url);
    this.element.dispatchEvent(
      new CustomEvent(eventType, {
        detail: {
          product: response
        }
      })
    );
  }

  async loadCategories() {
    const url = new URL('/api/rest/categories', BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');
    return await fetchJson(url);
  }

  async loadProduct() {
    this.url.searchParams.set('id', this.productId);
    const [response] = await fetchJson(this.url);
    return response;
  }

  async render() {
    const categoriesPromise = this.loadCategories();
    const productPromise = this.productId.length
      ? this.loadProduct()
      : Promise.resolve(this.productDefaults);
    const [categories, product] = await Promise.all([categoriesPromise, productPromise]);
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate(categories);
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.productToForm(product);
    this.imageUploader = new ImageUploader();
    this.subElements['sortable-list-container'].append(this.imageUploader.element);
    this.initEventListeners();
    return this.element;
  }

  initEventListeners() {
    this.imageUploader.element.addEventListener('image-uploaded', this.onImageUploaded);
    this.subElements.productForm.addEventListener('submit', this.onSave);
  }

  getTemplate(categories = []) {
    return `
    <div class="product-form">
      <form data-elem="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input
              required=""
              type="text"
              name="title"
              class="form-control"
              placeholder="Название товара"
              id="title"
            />
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea
            required=""
            class="form-control"
            name="description"
            placeholder="Описание товара"
            id="description"
          ></textarea>
        </div>
        <div
          class="form-group form-group__wide"
          data-elem="sortable-list-container"
        >
          <label class="form-label">Фото</label>
          <div data-elem="imageListContainer"></div>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          <select class="form-control" name="category" id="subcategory">
            ${this.getOptions(categories)}
          </select>
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input
              required=""
              type="number"
              name="price"
              class="form-control"
              placeholder="100"
              id="price"
            />
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input
              required=""
              type="number"
              name="discount"
              class="form-control"
              placeholder="0"
              id="discount"
            />
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input
            required=""
            type="number"
            class="form-control"
            name="quantity"
            placeholder="1"
            id="quantity"
          />
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" name="status" id="status">
            <option value="1">Активен</option>
            <option value="0">Неактивен</option>
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            Добавить товар
          </button>
        </div>
      </form>
    </div>`;
  }

  productToForm({ images = [], ...product } = {}) {
    const elements = this.subElements.productForm.elements;
    for (const field of Object.keys(this.productDefaults)) {
      elements[field].value = product[field];
    }
    if (!this.productId.length) elements.subcategory.selectedIndex = 0;
    this.imageList = new SortableList({
      items: images.map(image => this.getImageListItem(image))
    });
    this.subElements.imageListContainer.append(this.imageList.element);
  }

  formToProduct() {
    const form = this.subElements.productForm;
    const product = {};
    for (const field of Object.keys(this.productDefaults)) {
      product[field] = form.elements[field].value;
      if (typeof this.productDefaults[field] === 'number')
        product[field] = parseInt(product[field]);
    }

    product.images = Array.from(this.imageList.element.children, listItem => {
      const [url, source] = listItem.children;
      return {
        url: url.value,
        source: source.value
      };
    });
    return product;
  }

  getImageListItem(image) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <input type="hidden" name="url" value="${image.url}">
        <input type="hidden" name="source" value="${image.source}">
        <span>
          <img src="/assets/icons/icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
          <span>${image.source}</span>
        </span>
        <button type="button">
          <img src="/assets/icons/icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;
    return wrapper.firstElementChild;
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-elem]');
    for (const subElement of elements) {
      const name = subElement.dataset.elem;
      result[name] = subElement;
    }
    return result;
  }

  getOptions(categories = []) {
    const options = [];
    for (const category of categories) {
      for (const subcategory of category.subcategories) {
        options.push(
          `<option value="${subcategory.id}">${category.title} > ${subcategory.title}</option>`
        );
      }
    }
    return options;
  }

  remove() {
    if (!this.element) return;
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.imageList = {};
    this.imageUploader = {};
  }
}

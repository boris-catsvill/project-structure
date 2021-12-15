import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {

  element;
  product = {};
  categoriesNSubcategories = [];
  subElements = {};
  fields = {};

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

  onImageInputClick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.addEventListener('change', this.onImageInputChange);

    this.subElements.fileInput = fileInput;

    fileInput.click();
  };

  onImageInputChange = async () => {
    this.subElements.uploadImage.classList.add('is-loading');
    try {
      const [file] = this.subElements.fileInput.files;
      const result = await this.upload(file);

      this.addImage(this.renderImage(result.data.link, file.name));
    } catch (error) {
      console.error(error);
    } finally {
      this.subElements.uploadImage.classList.remove('is-loading');
    }
  };

  onSubmit = async (event) => {
    event.preventDefault();

    await this.save();
  }

  constructor(productId) {
    this.productId = productId;

    this.categoriesNSubcategoriesUrl = new URL(`api/rest/categories`, BACKEND_URL);
    this.productUrl = new URL(`api/rest/products`, BACKEND_URL);
  }

  async loadCategoriesNSubcategories() {
    this.categoriesNSubcategoriesUrl.searchParams.set('_sort', 'weight');
    this.categoriesNSubcategoriesUrl.searchParams.set('_refs', 'subcategory');
    return fetchJson(this.categoriesNSubcategoriesUrl);
  }

  getCategoriesOptions(data) {
    return data
      .map(category => category.subcategories
        .map(subcategory => `<option value="${subcategory.id}" ${this.product.subcategory === subcategory.id ? 'selected' : ''}>${category.title} &gt; ${subcategory.title}</option>`)
        .join(''))
      .join('');
  }

  async upload(file) {
    const formData = new FormData();

    formData.append('image', file);

    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
        },
        body: formData,
        referrer: ''
      });

      return await response.json();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  addImage(image) {
    const ul = this.subElements.imageListContainer.firstElementChild;
    ul.append(image);
  }

  renderImage(url = '', source = '') {
    const element = document.createElement('li');
    element.className = 'products-edit__imagelist-item sortable-list__item';
    element.style = '';
    element.innerHTML = `<input type="hidden" name="url" value="${url}">
             <input type="hidden" name="source" value="${source}">
              <span>
                <img src="/icon-grab.svg" data-grab-handle="" alt="grab">
                <img class="sortable-table__cell-img" alt="Image" src="${url}">
                <span>${source}</span>
              </span>
              <button type="button">
                <img src="/icon-trash.svg" data-delete-handle="" alt="delete">
              </button>`;

    return element;
  }

  get template() {
    return `<div class="product-form">
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" id="title"
          class="form-control" placeholder="Название товара"
          value="${this.product.title ? escapeHtml(this.product.title) : ''}" />
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" id="description"
          data-element="productDescription" placeholder="Описание товара">${this.product.description ? escapeHtml(this.product.description) : ''}</textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
          </div>
        <button type="button" name="uploadImage" class="button-primary-outline">
          <span>Загрузить</span>
        </button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory" id="subcategory">
          ${this.getCategoriesOptions(this.categoriesNSubcategories)}
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" id="price" class="form-control" placeholder="100"
          value="${this.product.price ? this.product.price : ''}">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0"
          value="${this.product.discount ? this.product.discount : ''}">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1"
          value="${this.product.quantity ? this.product.quantity : ''}">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status" id="status">
          <option value="1" ${this.product.status === '1' ? 'selected' : ''}>Активен</option>
          <option value="0" ${this.product.status === '0' ? 'selected' : ''}>Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    </form>`;
  }

  async render() {
    const categoriesNSubcategoriesPromise = this.loadCategoriesNSubcategories();
    this.productUrl.searchParams.set('id', this.productId);

    const productPromise = this.productId ? fetchJson(this.productUrl) : [this.defaultFormData];
    this.productUrl.searchParams.delete('id');

    const [categoriesNSubcategories, product]
      = await Promise.all([categoriesNSubcategoriesPromise, productPromise]);
    [this.product] = product;
    this.categoriesNSubcategories = categoriesNSubcategories;
    const element = document.createElement('div');

    element.innerHTML = this.template;

    this.element = element.firstElementChild;

    this.subElements = this.getSubElements(this.element);
    this.fields = this.getFields(this.element);

    this.sortableList = new SortableList({
      items: this.product.images.map(image => this.renderImage(image.url, image.source))
    });

    this.subElements.imageListContainer.append(this.sortableList.element);
    this.initEventListeners();
    return this.element;
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    result.imageListContainer
      = result['sortable-list-container'].querySelector('[data-element="imageListContainer"]');

    result.uploadImage = this.element.querySelector('[name="uploadImage"]');

    return result;
  }

  getFields(element) {
    const result = {};
    const fields = element.querySelectorAll('[id]');

    for (const field of fields) {
      result[field.id] = field;
    }

    return result;
  }

  initEventListeners() {
    this.subElements.uploadImage.addEventListener('click', this.onImageInputClick);
    this.element.addEventListener('submit', this.onSubmit);
  }

  async save() {
    const images = [];
    Object.entries(this.subElements.imageListContainer.firstElementChild.children)
      .map((elem) => {
        const inputs = elem[1].querySelectorAll('input');

        if (inputs.length) {
          images.push({url: inputs[0].value, source: inputs[1].value});
        }
      });

    for (const [field, element] of Object.entries(this.fields)) {
      this.product[field]
        = element.type === 'number' || field === 'status'
          ? parseInt(element.value)
          : escapeHtml(element.value);
    }

    this.product.images = images;

    try {
      const response = await fetch(this.productUrl.toString(), {
        method: this.product.id ? "PATCH" : "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(this.product),
        referrer: ''
      });

      this.element.dispatchEvent(new CustomEvent(this.product.id ? 'product-updated' : 'product-saved',
        {
          bubbles: true,
        }));

      return await response.json();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

import SortableList from '../sortable-list/index.js';
import NotificationMessage from "../notification";
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements = {};
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

  onSubmit = (evt) => {
    evt.preventDefault();
    this.save();
  }

  uploadImage = () => {
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = async () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const { uploadImages, imageListContainer } = this.subElements;

        formData.append('image', file);

        uploadImages.classList.add('is-loading');
        uploadImages.disabled = true;

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData,
        })

        imageListContainer.append(this.getImageItemTemplate(result.data.link, file.name));

        uploadImages.classList.remove('is-loading');
        uploadImages.disabled = false;

        fileInput.remove();
      }
    };

    fileInput.click();
  }

  constructor (productId) {
    this.productId = productId;
  }

  async render () {
    this.data = await this.loadData(this.productId);

    this.renderForm();

    if (this.formData) {
      this.setFormData();
    }

    this.createImagesList();
    this.initEventListeners();

    return this.element;
  }

  renderForm() {
    const elementWrapper = document.createElement('div');
    elementWrapper.innerHTML = this.formData ? this.getTemplate() : this.getEmptyTemplate();

    this.element = elementWrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  async loadData(id) {
    const urlCategoriesList = new URL('/api/rest/categories?_sort=weight&_refs=subcategory', BACKEND_URL);
    const categoriesPromise = fetchJson(urlCategoriesList);

    const urlProductData = new URL('/api/rest/products', BACKEND_URL);
    urlProductData.searchParams.set('id', id);
    const productPromise = this.productId ? fetchJson(urlProductData, {
      credentials: 'same-origin'
    }) : [this.defaultFormData];

    const [categoriesData, productResponse] = await Promise.all([categoriesPromise, productPromise]);
    const [productData] = productResponse;

    this.formData = productData;
    this.categories = categoriesData;
  }

  setFormData() {
    const { productForm } = this.subElements;
    const excludedFields = ['images'];

    const fields = Object.keys(this.defaultFormData).filter((field) => !excludedFields.includes(field));

    fields.forEach((field) => {
      const target = productForm.querySelector(`[name=${field}]`);

      if (!target) {
        return;
      }

      target.value = this.formData[field] || this.defaultFormData[field];
    })
  }

  getFormData() {
    const { productForm, imageListContainer } = this.subElements;
    const excludedFields = ['images'];
    const formatToNumber = ['price', 'discount', 'quantity', 'status'];

    const fields = Object.keys(this.defaultFormData).filter((field) => !excludedFields.includes(field));
    const getValue = (field) => {
      return productForm.querySelector(`[name=${field}]`).value;
    }
    const values = {};

    values.id = this.productId;

    for (const field of fields) {
      const value = getValue(field);
      values[field] = formatToNumber.includes(field) ? parseInt(value) : value;
    }

    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    values.images = [];
    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.url,
        source: image.alt,
      })
    }
    return values;
  }

  getSelectTemplate() {
    const elementWrapper = document.createElement('div');

    elementWrapper.innerHTML = `<select class="form-control" id="subcategory" name="subcategory"></select>`;

    const select = elementWrapper.firstElementChild;

    for (const category of this.categories) {
      const subcategories = category.subcategories || []
      for (const subcategory of subcategories) {
        select.append(new Option(`${category.title} > ${subcategory.title}`, subcategory.id))
      }
    }

    return select.outerHTML;
  }

  createImagesList() {
    const {imageListContainer} = this.subElements;
    const {images} = this.formData;

    const items = images.map(({url, source}) => this.getImageItemTemplate(url, source));

    const sortableList = new SortableList({
      items
    });

    imageListContainer.append(sortableList.element);
  }

  getImageItemTemplate(url, name) {
    const elementWrapper = document.createElement('div');

    elementWrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt=${escapeHtml(name)} src=${url} />
          <span>${name ? name : url}</span>
        </span>
        <button type="button" id="delete-image">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;
    return elementWrapper.firstElementChild;
  }

  getTemplate() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">

          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>

          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>

          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer"></div>
            <button data-element="uploadImages" type="button" name="uploadImage" id="uploadImage" class="button-primary-outline">
              <span>Загрузить</span>
            </button>
          </div>

          ${this.categories.length ? `
            <div class="form-group form-group__half_left">
              <label class="form-label">Категория</label>
              ${this.getSelectTemplate()}
          </div>` : ''}

          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required="" type="number" name="price" id="price" class="form-control" placeholder="100" value="${this.defaultFormData.price}">
            </fieldset>

            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0" value="${this.defaultFormData.discount}">
            </fieldset>
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1" value="${this.defaultFormData.quantity}">
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status" id="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>

          <div class="form-buttons">
            <button type="submit" name="save" id="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>

        </form>
      </div>
    `;
  }

  getEmptyTemplate() {
    return `
      <div>
        <h1 class="page-title">Страница не найдена</h1>
        <p>Извините, данный товар не существует</p>
      </div>
    `;
  }

  dispatchEvent(id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  initEventListeners() {
    const { productForm, imageListContainer, uploadImages } = this.subElements;

    productForm.addEventListener('submit', this.onSubmit);
    uploadImages.addEventListener('click', this.uploadImage);

    imageListContainer.addEventListener('click', (evt) => {
      if ('deleteHandle' in evt.target.dataset) {
        evt.target.closest('li').remove();
      }
    })
  }

  async save() {
    const product = this.getFormData();
    const urlProductData = new URL('/api/rest/products', BACKEND_URL);

    try {
      const result = await fetchJson(urlProductData, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product),
      })

      const notification = new NotificationMessage('Success');
      notification.show();

      this.dispatchEvent(result.id);

    } catch (error) {
      console.error(error);
      const notification = new NotificationMessage('Error');
      notification.show();
    }
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;

      return accum;
    }, {})
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = null;
    this.element = null;
  }
}

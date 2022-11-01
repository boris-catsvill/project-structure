import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';
import iconGrab from './icon-grab.svg';
import iconTrash from './icon-trash.svg'
import NotificationMessage from '../notification';

const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;
const BACKEND_URL = process.env.BACKEND_URL;

export default class ProductForm {
  static BACKEND_URL = BACKEND_URL;
  static IMGUR_CLIENT_ID = IMGUR_CLIENT_ID;

  element;
  subElements = {};
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    price: 10,
    status: 1,
    subcategory: '',
    discount: 0,
    images: [],
  }

  constructor (productId) {
    this.productId = productId;
  }

  getTemplate() {
    return `
      <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required
              id="title"
              value=""
              type="text"
              name="title"
              class="form-control"
              placeholder="Название товара">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required
            id="description"
            class="form-control"
            name="description"
            placeholder="Описание товара"></textarea>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer"></div>
          <button data-element="uploadImage" type="button" class="button-primary-outline">
            <span>Загрузить</span>
          </button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
            ${this.createCategoriesSelect()}
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required
              id="price"
              value=""
              type="number"
              name="price"
              class="form-control"
              placeholder="${this.defaultFormData.price}">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
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
          <label class="form-label">Количество</label>
          <input required
            id="quantity"
            value=""
            type="number"
            class="form-control"
            name="quantity"
            placeholder="${this.defaultFormData.quantity}">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select id="status" class="form-control" name="status">
            <option value="1">Активен</option>
            <option value="0">Неактивен</option>
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            ${this.productId ? 'Сохранить' : 'Добавить'} товар
          </button>
        </div>
      </form>
    </div>
    `;
  }

  getEmptyTemplate() {
    return `<div>
      <h1 class="page-title">Страница не найдена</h1>
      <p>Товар не найден</p>
    </div>`;
  }

  async getProductInfo(id) {
    const url = new URL(`${ProductForm.BACKEND_URL}api/rest/products`);
    url.searchParams.set('id', id);
    try {
      return await fetchJson(url);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getCategoriesList() {
    const url = new URL(`${ProductForm.BACKEND_URL}api/rest/categories`);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');
    try {
      return await fetchJson(url);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async render () {
    const productPr = this.productId ? this.getProductInfo(this.productId) : Promise.resolve([this.defaultFormData]);
    const categoriesPr = this.getCategoriesList();

    try {
      const [productRes, categoriesData] = await Promise.all([productPr, categoriesPr]);
      const [productData] = productRes;
      this.formData = productData;
      this.categories = categoriesData;

      this.renderForm();
      this.setFormData();
      this.getImagesList();
      this.addEventListeners();

      return this.element;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async saveData() {
    const product = this.getFormData();

    try {
      const result = await fetchJson(`${ProductForm.BACKEND_URL}api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      this.dispatchEvent(result.id);

      const notification = new NotificationMessage(this.productId ? 'Product was changed!' : 'Product was saved!', { type: 'success' });
      notification.show();
    } catch (e) {
      const notification = new NotificationMessage(e.body, { type: 'error' });
      notification.show();

      throw new Error(e.message);
    }
  }

  renderForm() {
    const element = document.createElement('div');
    element.innerHTML = this.formData ? this.getTemplate() : this.getEmptyTemplate();

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);
  }

  getFormData() {
    const {productForm, imageListContainer} = this.subElements;
    const excludedFields = ['images'];
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));
    const values = {};

    for (const field of fields) {
      values[field] = formatToNumber.includes(field)
        ? parseInt(productForm[field].value)
        : productForm[field].value;
    }

    const imagesHTMLList = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    values.images = [];
    values.id = this.productId;

    for (const image of imagesHTMLList) {
      values.images.push({
        url: image.src,
        source: image.alt
      });
    }

    return values;
  }

  setFormData() {
    const {productForm} = this.subElements;
    const unusedField = 'images';
    const fields = Object.keys(this.defaultFormData).filter(item => item !== unusedField);
    fields.forEach(item => {
      const element = productForm.querySelector(`#${item}`);
      element.value = this.formData[item] || this.defaultFormData[item];
    });
  }

  createCategoriesSelect() {
    const select = document.createElement('select');
    select.id = 'subcategory';
    select.classList.add('form-control');
    select.name = 'subcategory';

    for (const category of this.categories) {
      for (const item of category.subcategories) {
        select.append(new Option(`${category.title} > ${item.title}`, item.id));
      }
    }

    return select.outerHTML;
  }

  getSubElements(element) {
    const subElements = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const item of elements) {
      subElements[item.dataset.element] = item;
    }

    return subElements;
  }


  onSubmit = event => {
    event.preventDefault();

    this.saveData();
  };

  uploadImage = () => {
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = async () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const {uploadImage, imageListContainer} = this.subElements;

        formData.append('image', file);

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${ProductForm.IMGUR_CLIENT_ID}`
          },
          body: formData,
          referrer: '',
        });

        imageListContainer.firstElementChild.append(this.getImageItem(result.data.link, file.name));

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        fileInput.remove();
      }
    };

    fileInput.hidden = true;
    document.body.appendChild(fileInput);
    fileInput.click();
  };

  getImageItem(url, src) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src=${iconGrab} data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(src)}" src="${escapeHtml(url)}">
          <span>${src}</span>
        </span>
        <button type="button">
          <img src=${iconTrash} alt="delete" data-delete-handle>
        </button>
      </li>`;

    return wrapper.firstElementChild;
  }

  getImagesList() {
    const {imageListContainer} = this.subElements;

    const images = this.formData.images.map(item => {
      return this.getImageItem(item.url, item.source);
    });

    const sortableList = new SortableList({
      items: images
    });

    imageListContainer.append(sortableList.element);
  }

  addEventListeners() {
    const {productForm, uploadImage} = this.subElements;

    productForm.addEventListener('submit', this.onSubmit);
    uploadImage.addEventListener('click', this.uploadImage);
  }

  dispatchEvent(id) {
    const event = this.productId
      ? new CustomEvent('product-updated', {detail: id})
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove() {
    this.element.remove();
  }
}

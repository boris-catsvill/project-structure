import SortableList from '../sortable-list/index.js';
import Notification from "../notification/index.js"
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

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

  getEmptyTemplate () {
    return `<div>
      <h1 class="page-title">Ой-ой</h1>
      <p>Похоже такого товара не существует</p>
    </div>`;
  }

  constructor (productId) {
    this.productId = productId;
  }

  template () {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fielset>
              <label class="form-label">Название товара</label>
              <input required id="title" value="" type="text" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>

          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required id="description" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>

          <div class="form-group form-group__wide">
            <label class="form-label">Фото</label>

              <div data-element="imageListContainer" class="sortable-list"></div>

            <button type="button" data-element="uploadImage" class="button-primary-outline">
              <span>Загрузить</span>
            </button>
          </div>

          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
              ${this.createSelectList()}
          </div>

          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required id="price" value="" type="number" name="price" class="form-control" placeholder="${this.defaultFormData.discount}">
            </fieldset>

            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required id="discount" value="" type="number" name="discount" class="form-control" placeholder="${this.defaultFormData.discount}">
            </fieldset>
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Колличество</label>
            <input required id="quantity" value="" type="number" class="form-control" name="quantity" placeholder="${this.defaultFormData.quantity}">
          </div>

          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>

            <select id="status" class="form-control" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>

          <div class="form-buttons">
            <button data-id="btn" type="submit" name="save" class="button-primary-outline">
              ${this.productId ? "Сохранить" : "Добавить"} товар
            </button>
          </div>
        </form>
      </div>
    `;
  }
  
  async render () {
    const productPromise = this.productId ? this.loadProductData(this.productId) : Promise.resolve([this.defaultFormData]);

    const categoriesPromise = this.loadCategoriesList();

    const [productResponse, categoriesData] = await Promise.all([productPromise, categoriesPromise]);

    const [productData] = productResponse;
    
    this.formData = productData;
    this.categories = categoriesData;

    this.renderForm();
    
    if(this.formData) {
      this.setFormValue();
      this.createImagesList();
      this.initEventListeners();
    }

    return this.element;
  }

  setFormValue () {
    const form = this.subElements.productForm;
    const nonInclude = ['images'];
    const field = Object.keys(this.defaultFormData).filter(item => !nonInclude.includes(item));
    
    field.forEach(elem => {
      const elemForm = form.querySelector(`#${elem}`);
      
      elemForm.value = this.formData[elem] ?? this.defaultFormData[elem];
    })
  }

  renderForm () {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.formData ? this.template() : this.getEmptyTemplate();

    const element = wrapper.firstElementChild;
    this.element = element;
    this.subElements = this.getSubElements(this.element);
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  loadCategoriesList () {
    return fetchJson(new URL('/api/rest/categories?_sort=weight&_refs=subcategory', BACKEND_URL));
  }

  loadProductData (productId) {
    return fetchJson(`${BACKEND_URL}/api/rest/products?id=${productId}`);
  }

  createImagesList () {
    const { imageListContainer } = this.subElements;
    const {images} = this.formData;
    
    const items = images.map(item => this.getImageItem(item.url, item.source));
    const sortableList = new SortableList({items});

    imageListContainer.append(sortableList.element)
  }

  getImageItem (url, name) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="/icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(name)}</span>
        </span>
        <button type="button">
          <img src="/icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>`

    return wrapper.firstElementChild;
  }

  createSelectList () {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `<select class="form-control" id="subcategory" name="subcategory"></select>`;

    const select = wrapper.firstElementChild;

    for (const category of this.categories) {
      for (const item of category.subcategories) {
        select.append(new Option(`${category.title} > ${item.title}`, item.id));
      }
    }

    return select.outerHTML;
  }

  uploadImage = () => {
    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = 'image/*';

    inputFile.addEventListener('change', async () => {
      const [file] = inputFile.files;
      
      if (file) {
        const formData = new FormData();
        let q = formData.append('image', file);

        const {uploadImage, imageListContainer} = this.subElements;

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData,
          referrer: ''
        });

        imageListContainer.firstElementChild.append(this.getImageItem(result.data.link, file.name));

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        inputFile.remove();
      }
    });

    inputFile.hidden = true;
    document.body.appendChild(inputFile);

    inputFile.click();
  };

  createNotification(massage, type) {
    const notification = new Notification(massage, {
      duration: 2000,
      type: type
    });

    notification.show(this.subElements.productForm);
  }

  onSubmit = (event) => {
    event.preventDefault();
    
    this.save();
  }

  async save () {
    const obj = this.getForm();

    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? `PATCH` : `PUT`,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(obj)
      });

      this.dispatchEvent(result.id, 'success')
    } catch (error) {
      this.dispatchEvent('', 'error')
    }
  }

  dispatchEvent (id, status) {
    const event = this.productId ? new CustomEvent('product-updated', { detail: {id, status} }) : new CustomEvent('product-saved', { detail: {id, status} });

    this.element.dispatchEvent(event);
  }

  getForm() {
    const { productForm, imageListContainer } = this.subElements;
    const nonInclude = ['images'];
    const mustBeNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultFormData).filter(item => !nonInclude.includes(item));
    const sendObj = {};
    sendObj.images = [];
    sendObj.id = this.productId;

    if (!this.productId) {
      sendObj.id = String(Date.now());
    }

    const getValue = (field) => productForm.querySelector(`[name=${field}]`);

    for (const field of fields) {
      const value = getValue(field);

      sendObj[field] = mustBeNumber.includes(field) ? parseInt(value.value) : value.value;
    }

    const imagesList = imageListContainer.querySelectorAll('.sortable-table__cell-img');
    
    for (const image of imagesList) {
      sendObj.images.push({
        url: image.src,
        source: image.alt
      })
    }

    return sendObj;
  }


  initEventListeners () {
    const { productForm, uploadImage } = this.subElements;

    productForm.addEventListener('submit', this.onSubmit);
    uploadImage.addEventListener('click', this.uploadImage);
  }

  remove () {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
    this.selected = {
      from: new Date(),
      to: new Date()
    };
    return this;
  }
}
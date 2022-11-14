import SortableList from '../sortable-list/index.js';
import escapeHtml from '/src/utils/escape-html.js';
import fetchJson from '/src/utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  url = new URL('/api/rest/products', BACKEND_URL);
  element;
  subElements = {};
  defaultData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  }

  constructor (productId) {
    const pathChunks = document.URL.split("/");
    productId = pathChunks[pathChunks.length-1] === "add" ? null : pathChunks[pathChunks.length-1];
    this.productId = productId;
  }

  async render () {
    const categoriesPromise = this.loadCategoties();

    const productPromise = this.productId
      ? this.loadProductData(this.productId)
      : Promise.resolve([this.defaultFormData]);

      const [categoriesData, productResponse] = await Promise.all([categoriesPromise, productPromise])

      const productData = productResponse.reduce(item => item);
      this.productData = productData;
      this.categoriesData = categoriesData;

    this.renderDefaultForm();
    if (this.productId) {
      this.setFormData();
    }

    this.initEventListeners();

    return this.element;
  }

  renderDefaultForm() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate;

    const element = wrapper.firstElementChild;

    this.element = element;
    this.subElements = this.getSubElements(element);
    this.forms = element.querySelectorAll("select");
  }

  initEventListeners() {
    const { productForm, uploadImage } = this.subElements;

    productForm.addEventListener('submit', this.onSubmit);
    uploadImage.addEventListener('click', this.uploadImage);
  }

  async setFormData() {
    const { productForm } = this.subElements;
    const fields = Object.keys(this.defaultData).filter(item => item !== "images");

    fields.forEach(item => {
      const element = productForm.querySelector(`#${item}`);

      element.value = this.productData[item] || this.defaultData[item];
    });

    const { images } = this.productData;
    const { imageListContainer } = this.subElements;

    const items = images.map(({url, source}) => this.getImage(url, source));
    const sortableList = new SortableList({items});

    imageListContainer.append(sortableList.element);
  }

  get getTemplate() {
    return `
      <div class="product-form">
    <form data-element="productForm" class="form-grid">

      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input
            required=""
            type="text"
            id="title"
            name="title"
            class="form-control"
            placeholder="Название товара">
        </fieldset>
      </div>

      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea
          required=""
          class="form-control"
          id="description"
          name="description"
          data-element="productDescription"
          placeholder="Описание товара">
        </textarea>
      </div>

      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>

        <div data-element="imageListContainer">

        </div>

        <button
          type="button"
          data-element="uploadImage"
          class="button-primary-outline">
          <span>Загрузить</span>
        </button>
      </div>

      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" id="subcategory" name="subcategory">
          ${this.getCategories()}
        </select>
      </div>

      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input
            required
            type="number"
            name="price"
            id="price"
            class="form-control"
            placeholder="${this.defaultData.price}">
        </fieldset>

        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input
            required=""
            type="number"
            id="discount"
            name="discount"
            class="form-control"
            placeholder="${this.defaultData.discount}">
        </fieldset>
      </div>

      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input
          required=""
          type="number"
          class="form-control"
          id="quantity"
          name="quantity"
          placeholder="${this.defaultData.quantity}">
      </div>

      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" id="status" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>

      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
        ${this.productId ? "Сохранить" : "Добавить"} товар
        </button>
      </div>

    </form>
  </div>
    `
  }

  getImage(url, src) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="/assets/icons/icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(src)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(src)}</span>
        </span>

        <button type="button">
          <img src="/assets/icons/icon-trash.svg" data-delete-handle alt="delete">
        </button>
      </li>`;

    return wrapper.firstElementChild;
  }

  getCategories() {
    let options = "";
    for (const section of this.categoriesData) {
      for (const subsection of section.subcategories) {
        options += `<option value="${subsection.id}">${section.title} &gt; ${subsection.title}</option>`;
      }
    }
    return options;
  }

  async loadProductData(productId) {
    return await fetchJson(`${process.env.BACKEND_URL}api/rest/products?id=${productId}`);
  }

  async loadCategoties() {
    return fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  onSubmit = event => {
    event.preventDefault();

    this.save();
  }

  async save() {
    const product = this.getFormData();

    try {
      const result = await fetchJson(this.url, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      this.dispatchEvent(result.id);
    } catch(error) {
      console.log("Something went wrong.. ", error);
    }

    const div = document.createElement("div");
    div.innerHTML = `
    <div class="notification notification_success show">
      <div class="notification__content">Product saved</div>
    </div>
    `
    document.body.appendChild(div.firstElementChild);
    const notification = document.body.getElementsByClassName("notification");
    setTimeout(() => notification[0].remove(), 2000);
  }

  getFormData() {
    const { productForm, imageListContainer } = this.subElements;
    const conversionToNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultData).filter(item => item !== "images");
    const getValue = field => productForm.querySelector(`[name=${field}]`).value;
    const formData = {};

    for (const field of fields) {
      const value = getValue(field);

      formData[field] = conversionToNumber.includes(field)
        ? parseInt(value)
        : value;
    }

    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    formData.images = [];
    formData.id = this.productId;

    for (const image of imagesHTMLCollection) {
      formData.images.push({
        url: image.src,
        source: image.alt
      });
    }

    return formData;
  }

  dispatchEvent (id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

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

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData,
          referrer: ''
        });

        imageListContainer.firstElementChild.append(this.getImage(result.data.link, file.name));

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;


        fileInput.remove();
      }
    });

    fileInput.hidden = true;
    document.body.append(fileInput);

    fileInput.click();
  };

  getSubElements(element) {
    const subElements = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const item of elements) {
      subElements[item.dataset.element] = item;
    }

    return subElements;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
    this.element = null;
  }
}

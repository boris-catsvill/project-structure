import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

import iconGrab from './icon-grab.svg';
import iconTrash from './icon-trash.svg';

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

  constructor(productId) {
    this.productId = productId;
  }

  getSubElements(element) {
    const elements = element.querySelectorAll(`[data-element]`);

    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;

      return acc;
    }, {});
  }

  getCategoriesSelect() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `<select class="form-control" name="subcategory" id="subcategory">${this.getCategories()}</select>`;

    const categorySelect = wrapper.firstElementChild;

    return categorySelect.outerHTML;
  }

  getCategories() {
    const categoriesOptions = this.categories
    .map((category) => {
      return category.subcategories.map((subcategory) => {
        return `<option value=\"${subcategory.id}\">${category.title} &gt; ${subcategory.title}</option>`;
      })
      .join('');
    })
    .join('');

    return categoriesOptions;
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
            data-element="productDescription"
            placeholder="Описание товара"></textarea>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer">
          </div>
          <button data-element="uploadImage" type="button" class="button-primary-outline">
            <span>Загрузить</span>
          </button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
            ${this.getCategoriesSelect()}
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

  async render() {
    const categoriesPromise = fetchJson(
      `${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`
    );

    const productPromise = this.productId
      ? fetchJson(`${process.env.BACKEND_URL}api/rest/products?id=${this.productId}`)
      : Promise.resolve([this.defaultFormData]);

    const [data, response] = await Promise.all([categoriesPromise, productPromise]);

    const [productData] = response;

    this.formData = productData;
    this.categories = data;

    const wrapper = document.createElement('div');
   
    wrapper.innerHTML = this.getTemplate();

    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements(this.element);

    if (this.formData) {
      this.setFormData();
      this.createImagesList();
      this.initEventListeners();
    }

    return this.element;
  }

  getFormData() {
    const excludedFields = ['images'];
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));
    const getValue = field => this.subElements.productForm.querySelector(`[name=${field}]`).value;
    const values = {};

    for (const field of fields) {
      const value = getValue(field);

      values[field] = formatToNumber.includes(field) ? +value : value;
    }

    const imagesHTMLCollection = this.subElements.imageListContainer.querySelectorAll('.sortable-table__cell-img');

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
    const excludedFields = ['images'];

    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));
    fields.forEach(item => {
      const element = this.subElements.productForm.querySelector(`#${item}`);

      element.value = this.formData[item] || this.defaultFormData[item];
    });
  }

  createImagesList() {
    const items = this.formData.images.map(({ url, source }) => this.getImageItem(url, source));

    const sortableList = new SortableList({items});

    this.subElements.imageListContainer.append(sortableList.element);
  }

  getImageItem(url, source) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src=${iconGrab} data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(source)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(source)}</span>
        </span>
        <button type="button">
          <img src=${iconTrash} alt="delete" data-delete-handle>
        </button>
      </li>`;

    return wrapper.firstElementChild;
  }

  onSubmit = (event) => {
    event.preventDefault();

    this.save();
  };

  async save() {
    const product = this.getFormData();

    const result = await fetchJson(`${process.env.BACKEND_URL}api/rest/products`, {
      method: this.productId ? 'PATCH' : 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    });

    this.dispatchEvent(result.id, 'success');
  }

  dispatchEvent(id, status) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: { id, status } })
      : new CustomEvent('product-saved', { detail: { status } });

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

        formData.append('image', file);

        this.subElements.uploadImage.classList.add('is-loading');
        this.subElements.uploadImage.disabled = true;

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
          },
          body: formData,
          referrer: ''
        });

        this.subElements.imageListContainer.firstElementChild.append(this.getImageItem(result.data.link, file.name));

        this.subElements.uploadImage.classList.remove('is-loading');
        this.subElements.uploadImage.disabled = false;

        fileInput.remove();
      }
    });

    fileInput.hidden = true;
    document.body.append(fileInput);

    fileInput.click();
  };

  initEventListeners() {
    this.subElements.productForm.addEventListener('submit', this.onSubmit);
    
    this.subElements.uploadImage.addEventListener('click', this.uploadImage);
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

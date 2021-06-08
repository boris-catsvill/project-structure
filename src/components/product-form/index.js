/* eslint-disable no-undef */
import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

export default class ProductForm {
  formFields = {
    strings: ['title', 'description', 'subcategory'],
    numbers: ['price', 'discount', 'quantity', 'status'],
  }

  productData = {
    images: []
  };

  categories = [];

  subElements = {};

  api = '/api/rest/';

  onSubmit = async event => {
    event.preventDefault();

    const form = this.subElements['productForm'];

    this.formFields.strings.forEach(field => {
      this.productData[field] = form.querySelector(`#${field}`).value;
    });

    this.formFields.numbers.forEach(field => {
      this.productData[field] = Number(form.querySelector(`#${field}`).value);
    });

    await this.save();
  }

  onImageRemoving = ({ detail }) => {
    this.productData.images.splice(detail, 1);
  }

  onImagesReorder = ({ detail }) => {
    this.productData.images.splice(detail.to, 0, this.productData.images.splice(detail.from, 1)[0]);
  }

  onUploadClick = async event => {
    const uploadButton = event.currentTarget;

    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.addEventListener('change', async () => {
      const [file] = fileInput.files;

      if (file) {
        const loadingClass = 'is-loading';
        const formData = new FormData();
        formData.append('image', file);

        uploadButton.classList.add(loadingClass);
        uploadButton.disabled = true;

        try {
          const result = await fetchJson('https://api.imgur.com/3/image', {
            method: 'POST',
            headers: {
              Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
            },
            body: formData
          });

          const imageData = { source: file.name, url: result.data.link };
          this.productData.images.push(imageData);
          this.subElements['imageListContainer'].append(this.getElementFromTemplate(this.getImageTemplate(imageData)));
        } catch (e) {
          console.error(e);
        } finally {
          uploadButton.classList.remove(loadingClass);
          uploadButton.disabled = false;

          fileInput.remove();
        }
      }
    });

    document.body.append(fileInput);
    fileInput.click();
  };

  constructor(productId = null) {
    this.productId = productId;
  }

  getElementFromTemplate(template) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = template;

    return wrapper.firstElementChild;
  }

  async render() {
    await Promise.all([this.getCategories(), this.productId ? this.getProductData() : []]);

    this.element = this.getElementFromTemplate(this.template);
    document.body.append(this.element);
    this.subElements = this.getSubElements();

    if (this.productId) {
      [...this.formFields.strings, ...this.formFields.numbers].forEach(field => {
        this.subElements['productForm'].querySelector(`#${field}`).value = this.productData[field];
      });
    }

    if (this.productData.images.length) {
      const items = this.productData.images.map(image => this.getElementFromTemplate(this.getImageTemplate(image)));
      this.subElements['imageListContainer'].append(new SortableList({ items }).element);
    }

    this.initEventListeners();

    return this.element;
  }

  async getProductData(id = this.productId) {
    const url = new URL(`${this.api}products`, process.env.BACKEND_URL);
    url.searchParams.set('id', id);

    this.productData = (await fetchJson(url))[0];
  }

  async getCategories() {
    const url = new URL(`${this.api}categories`, process.env.BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    this.categories = await fetchJson(url);
  }

  get template() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid"">
          ${this.titleTemplate}
          ${this.descriptionTemplate}
          ${this.imagesTemplate}
          ${this.categoriesTemplate}
          ${this.priceTemplate}
          ${this.numberTemplate}
          ${this.statusTemplate}
          <div class="form-buttons">
            <button type="submit" id="save" class="button-primary-outline">Сохранить товар</button>
          </div>
        </form>
      </div>
    `;
  }

  get titleTemplate() {
    return `
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" id="title" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
    `;
  }

  get descriptionTemplate() {
    return `
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
    `;
  }

  get imagesTemplate() {
    return `
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer"></div>
        <button type="button" id="uploadImage" class="button-primary-outline fit-content">
          <span>Загрузить</span>
        </button>
      </div>
    `;
  }

  get categoriesTemplate() {
    return `
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" id="subcategory" name="subcategory">${this.subcategoriesTemplate}</select>
      </div>
    `;
  }

  get priceTemplate() {
    return `
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" id="price" name="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" id="discount" name="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
    `;
  }

  get numberTemplate() {
    return `
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" id="quantity" name="quantity" placeholder="1">
      </div>
    `;
  }

  get statusTemplate() {
    return `
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" id="status" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
    `;
  }

  get subcategoriesTemplate() {
    return this.categories.map(category => {
      return category.subcategories.map(subcategory => {
        return `<option value="${subcategory.id}">${category.title} &gt; ${subcategory.title}</option>`;
      }).join('');
    }).join('');
  }

  getImageTemplate({ source, url }) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item">
        <input type="hidden" name="url" value="${url}">
        <input type="hidden" name="source" value="${source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(source)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(source)}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;
  }

  initEventListeners() {
    this.element.querySelector('#uploadImage').addEventListener('pointerdown', this.onUploadClick);

    const { productForm, imageListContainer } = this.subElements;
    productForm.addEventListener('submit', this.onSubmit);
    imageListContainer.addEventListener(SortableList.removedItemEventName, this.onImageRemoving);
    imageListContainer.addEventListener(SortableList.reorderedEventName, this.onImagesReorder);
  }

  async save() {
    try {
      const response = await fetchJson(new URL(`${this.api}products`, process.env.BACKEND_URL), {
        method: this.productId ? 'PATCH' : 'PUT',
        body: JSON.stringify(this.productData),
        headers: {
          'content-type': 'application/json'
        }
      });

      this.element.dispatchEvent(new CustomEvent(`product-${this.productId ? 'updated' : 'saved'}`, {detail: {id: response.id}}));

      this.productData = response;
      this.productId = response.id;
    } catch (error) {
      console.error(`Some error occurred: ${error}`);
    }
  }

  getSubElements(element = this.element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
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

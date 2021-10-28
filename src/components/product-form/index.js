import SortableList from '../sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  onSubmit = (event) => {
    event.preventDefault();
    this.save();
  }

  addImage = (event) => {
    event.preventDefault();

    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    imageInput.hidden = true;
    imageInput.addEventListener('change', this.uploadImage);

    this.subElements.imageListContainer.append(imageInput);
    imageInput.click();
  }

  uploadImage = async (event) => {
    const input = event.target;
    const file = input.files[0];
    const data = new FormData();
    data.set('image', file);

    this.subElements.productForm.uploadImage.classList.add('is-loading');
    this.subElements.productForm.uploadImage.disabled = true;

    try {
      const response = await fetch('https://api.imgur.com/3/image',
        {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: data,
        });
      const image = await response.json();
      this.images.push({
        source: image.data.name,
        url: image.data.link,
      });
      this.renderImagesList();
    } catch (error) {
      console.error(error);
    } finally {
      this.subElements.productForm.uploadImage.classList.remove('is-loading');
      this.subElements.productForm.uploadImage.disabled = false;
    }
  }

  constructor (productId) {
    this.productId = productId;
    this.images = [];
    this.productsUrl = new URL('api/rest/products  ', BACKEND_URL);
    this.categoriesUrl = new URL('api/rest/categories  ', BACKEND_URL);
  }

  async render () {
    const requests = [
      this.loadCategories(),
    ];
    if (this.productId) requests.push(this.loadProductData());

    const [categories, productData = {}] = await Promise.all(requests);

    if (productData.images) this.images = productData.images;

    if (this.element) this.element.replaceWith(this.toHTML(this.getTemplate(productData, categories)));
    else this.element = this.toHTML(this.getTemplate(productData, categories));

    this.subElements = this.getSubElements(this.element);

    this.renderImagesList();
    this.addEventListeners();

    return this.element;
  }

  renderImagesList() {
    const imagesList = this.getImagesList(this.images);
    if (this.imagesList) {
      this.imagesList.replaceWith(imagesList);
    } else {
      this.subElements.imageListContainer.append(imagesList);
    }
    this.imagesList = imagesList;
  }

  async loadProductData() {
    this.productsUrl.searchParams.set('id', this.productId);

    const response = await fetch(this.productsUrl.toString());
    const json = await response.json();
    this.productData = json[0];

    return json[0];
  }

  async loadCategories() {
    this.categoriesUrl.searchParams.set('_sort', 'weight');
    this.categoriesUrl.searchParams.set('_refs', 'subcategory');

    const response = await fetch(this.categoriesUrl.toString());
    const json = await response.json();

    return json;
  }

  async save() {
    const formData = this.getFormData();

    if (this.productId) {
      await this.update(formData, this.productsUrl.toString());
    } else {
      await this.create(formData, this.productsUrl.toString());
    }
  }

  async create(data, url) {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: data,
      });
      const product = await response.json();

      document.dispatchEvent(new CustomEvent('product-saved', {
        detail: { product }
      }));

      return product;
    } catch (error) {
      console.error('Create product', error);
    }
  }

  async update(data, url) {
    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: data,
      });
      const product = await response.json();

      document.dispatchEvent(new CustomEvent('product-updated', {
        detail: { product }
      }));

      return product;
    } catch (error) {
      console.error('Update product', error);
    }
  }

  getFormData() {
    const form = this.subElements.productForm;
    const formData = new FormData(form);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      subcategory: formData.get('subcategory'),
      price: parseInt(formData.get('price')),
      discount: parseInt(formData.get('discount')),
      quantity: parseInt(formData.get('quantity')),
      status: parseInt(formData.get('status')),
      images: this.getImagesData(formData),
    };
    if (this.productData && this.productData.id) data.id = this.productData.id;
    return JSON.stringify(data);
  }

  getImagesData(formData) {
    const sources = formData.getAll('source');
    const urls = formData.getAll('url');
    return sources.map((source, index) => {
      return {
        url: urls[index],
        source
      };
    });
  }

  getTemplate({
    title = '',
    description = '',
    price = 0,
    discount = 0,
    quantity = 0,
    status = '',
    subcategory = '',
  } = {}, categories) {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" value="${escapeHtml(title)}" id="title" type="text" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара">${escapeHtml(description)}</textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer"></div>
            <button data-element="imageUploadBtn" type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            ${this.getCategoriesSelectTemplate(categories, subcategory)}
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required="" value="${price}" id="price" type="number" name="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" value="${discount}" id="discount" type="number" name="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" value="${quantity}" id="quantity" type="number" class="form-control" name="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" id="status" name="status">
              <option ${status ? 'selected' : ''} value="1">Активен</option>
              <option ${!status ? 'selected' : ''} value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
      </div>
    `;
  }

  getCategoriesSelectTemplate(categories = [], currentSubcategory = '') {
    const createOptions = () => {
      const options = categories.map((category) => {
        const subcategories = category.subcategories.map((subcategory) => {
          const title = escapeHtml(`${category.title} > ${subcategory.title}`);
          const isSelected = subcategory.id === currentSubcategory;
          return `<option value="${subcategory.id}" ${isSelected ? 'selected' : ''}>${title}</option>`;
        });
        return subcategories.join('');
      });
      return options.join('');
    }
    return `
      <select class="form-control" id="subcategory" name="subcategory" id="subcategory">
        ${createOptions()}
      </select>
    `;
  }

  getImagesList(images = []) {
    const imagesList = images.map((image) => {
      return `
        <li class="products-edit__imagelist-item" style="">
          <input type="hidden" name="url" value="${escapeHtml(image.url)}">
          <input type="hidden" name="source" value="${escapeHtml(image.source)}">
          <span>
            <img src="/icons/icon-grab.svg" data-grab-handle alt="grab">
            <img class="sortable-table__cell-img" alt="${escapeHtml(image.source)}" src="${escapeHtml(image.url)}">
            <span>${escapeHtml(image.source)}</span>
          </span>
          <button type="button">
            <img src="/icons/icon-trash.svg" data-delete-handle alt="delete">
          </button>
        </li>
      `;
    });
    return this.createSortableList(imagesList);
  }

  createSortableList(list) {
    const sortableList = new SortableList({
      items: list
    });

    return sortableList.element;
  }

  getSubElements(root) {
    const subElements = {};
    [...root.querySelectorAll('[data-element]')].forEach((el) => {
      subElements[el.dataset.element] = el;
    });
    return subElements;
  }

  addEventListeners() {
    this.subElements.productForm.addEventListener('submit', this.onSubmit);
    this.subElements.imageUploadBtn.addEventListener('click', this.addImage);
  }

  removeEventListeners() {
    this.subElements.productForm.removeEventListener('submit', this.onSubmit);
    this.subElements.imageUploadBtn.removeEventListener('click', this.addImage);
  }

  remove() {
    if (this.element) this.element.remove();
    this.element = null;
  }

  destroy() {
    this.remove();
    this.removeEventListeners();
  }

  toHTML(htmlString) {
    const htmlObject = document.createElement('div');
    htmlObject.innerHTML = htmlString;
    return htmlObject.firstElementChild;
  }
}

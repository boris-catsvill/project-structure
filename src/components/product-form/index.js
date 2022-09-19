import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;
const BACKEND_URL = process.env.BACKEND_URL;

export default class ProductForm {
  сategories = [];
  productInfo = {};
  productImages = [];
  elementsToEdit = {};
  subElements = {};

  deleteImageByClick = event => {
    if (event.target.hasAttribute('data-delete-handle')) {
      event.target.closest('li').remove();
    }
  };

  onClickToSend = async () => {
    const pickerOpts = {
      types: [
        {
          description: 'Images',
          accept: {
            'image/*': ['.png', '.gif', '.jpeg', '.jpg']
          }
        }
      ],
      excludeAcceptAllOption: true,
      multiple: false
    };

    try {
      const [promise] = await window.showOpenFilePicker(pickerOpts);
      const file = await promise.getFile();

      this.sendImage(file);
    } catch (error) {
      console.log(error);
    }
  };

  sendImage = async file => {
    this.elementsToEdit.uploadImage.classList.add('is-loading');
    this.elementsToEdit.uploadImage.disabled = true;

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

      const result = await response.json();
      const { link } = result.data;

      this.makeNewLi(link, file.name);
    } catch (error) {
      console.error(error);
    }

    this.elementsToEdit.uploadImage.classList.remove('is-loading');
    this.elementsToEdit.uploadImage.disabled = false;
  };

  onSave = event => {
    event.preventDefault();

    this.save();
  };

  constructor(productId) {
    this.productId = productId;
  }

  async save() {
    try {
      const dataToSend = this.dataFill();

      const url = new URL('api/rest/products', BACKEND_URL);

      const promise = await fetchJson(url, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      this.element.dispatchEvent(this.customEvent(promise.id));
    } catch (error) {
      console.log(error);
    }
  }

  customEvent(id) {
    return this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved');
  }

  dataFill() {
    const data = {};

    if (this.productId) {
      data.id = this.productId;
    }

    for (const elem in this.elementsToEdit) {
      if (elem === 'uploadImage' || elem === 'save') {
        continue;
      }

      const element = this.elementsToEdit[elem];

      const value = isFinite(element.value) ? Number(element.value) : escapeHtml(element.value);

      data[element.getAttribute('name')] = value;
    }

    data.images = this.imagesForData();

    return data;
  }

  imagesForData() {
    const images = this.subElements.imageListContainer.querySelectorAll('li');
    const array = [];

    images.forEach(image => {
      const [url, source] = image.children;

      array.push({ url: url.value, source: source.value });
    });

    return array;
  }

  makeTemplate() {
    const div = document.createElement('div');

    div.innerHTML = `
    <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer"></div>
          <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          <select class="form-control" name="subcategory" id="subcategory">
            ${this.categories
              .map(object => {
                return object.subcategories
                  .map(
                    category =>
                      `<option value="${category.id}">${object.title} > ${category.title}</option>`
                  )
                  .join('');
              })
              .join('')}            
          </select>
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" name="price" class="form-control" placeholder="100">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" type="number" name="discount" class="form-control" placeholder="0">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required="" type="number" class="form-control" name="quantity" placeholder="1">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" name="status">
            <option value="1">Активен</option>
            <option value="0">Неактивен</option>
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

    this.element = div.firstElementChild;
    this.getSubElements();
  }

  templateFill() {
    for (const element of Object.keys(this.elementsToEdit)) {
      const attributeName = this.elementsToEdit[element].getAttribute('name');

      if (attributeName === 'uploadImage' || attributeName === 'save') {
        continue;
      }

      this.elementsToEdit[element].value = this.productInfo[attributeName];
    }

    this.addImage();
  }

  getSubElements() {
    const dataElements = this.element.querySelectorAll('[data-element]');
    const elementsNameAttribute = this.element.querySelectorAll(`[name]`);

    for (const elem of dataElements) {
      this.subElements[elem.dataset.element] = elem;
    }

    for (const element of elementsNameAttribute) {
      const attributeName = element.getAttribute('name');

      element.id = attributeName;

      this.elementsToEdit[attributeName] = element;
    }
  }

  addImage() {
    const array = this.productImages.map(image => {
      const div = document.createElement('div');

      div.innerHTML = `
        <li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${image.url}">
          <input type="hidden" name="source" value="${image.source}">
          <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
          <span>${image.source}</span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
        </li>`;

      return div.firstElementChild;
    });

    const images = this.sortableList({ items: array });

    this.subElements.imageListContainer.append(images);
  }

  sortableList(items) {
    const sortableList = new SortableList(items);

    this.subElements.sortableList = sortableList;

    return sortableList.element;
  }

  initEventListeners() {
    this.element.addEventListener('click', this.deleteImageByClick);

    this.elementsToEdit.uploadImage.addEventListener('click', this.onClickToSend);

    this.elementsToEdit.save.addEventListener('click', this.onSave);
  }

  makeNewLi(link, name) {
    const div = document.createElement('div');

    div.innerHTML = `<li class="products-edit__imagelist-item sortable-list__item" style="">
    <input type="hidden" name="url" value="${link}">
    <input type="hidden" name="source" value="${name}">
    <span>
      <img src="icon-grab.svg" data-grab-handle="" alt="grab">
      <img class="sortable-table__cell-img" alt="Image" src="${link}">
    <span>${name}</span>
    </span>
    <button type="button">
      <img src="icon-trash.svg" data-delete-handle="" alt="delete">
    </button>
  </li>`;

    const { firstElementChild: li } = div;

    const { firstElementChild: imagesContainer } = this.subElements.imageListContainer;

    imagesContainer.append(li);
  }

  async loadCategories() {
    try {
      const urlCategories = new URL('api/rest/categories', BACKEND_URL);

      urlCategories.searchParams.set('_sort', 'weight');
      urlCategories.searchParams.set('_refs', 'subcategory');

      const categories = await fetchJson(urlCategories);

      this.categories = categories;
    } catch (error) {
      console.log(error);
    }
  }

  async loadProductInfo() {
    try {
      const urlInfo = new URL('api/rest/products', BACKEND_URL);

      urlInfo.searchParams.set('id', this.productId);

      const productInfo = await fetchJson(urlInfo);

      [this.productInfo] = productInfo;

      this.productImages = this.productInfo.images;
    } catch (error) {
      console.log(error);
    }
  }

  async render() {
    try {
      if (this.productId) {
        await Promise.all([this.loadCategories(), this.loadProductInfo()]);
      } else {
        await this.loadCategories();
      }

      this.makeTemplate();
      this.initEventListeners();

      if (this.productId) {
        this.templateFill();
      }

      return this.element;
    } catch (error) {
      console.log(error);
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.subElements.sortableList.destroy();

    this.remove();
    this.productId = null;

    for (const key in this) {
      if (typeof this[key] === 'object') {
        console.log(key);
        this[key] = null;
      }
    }
  }
}

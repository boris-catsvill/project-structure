import SortableList from '../sortable-list/index.js';
import NotificationMessage from '../notification/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

//icons
import iconGrab from '../../components/product-form/icon-grab.svg';
import iconTrash from '../../components/product-form/icon-trash.svg';

export default class ProductForm {
  element;
  subElements = {};
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    price: 100,
    discount: 0
  };
  fileInput;

  constructor(productId) {
    this.productId = productId === 'add' ? '' : productId;

    this.render();
  }

  async render() {
    const element = document.createElement('div');
    element.innerHTML = this.template;

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    const categoriesPromise = this.loadCategoriesData();

    const productPromise = this.productId
      ? this.loadProductData(this.productId)
      : Promise.resolve([this.defaultFormData]);

    const [categoriesData, productResponse] = await Promise.all([
      categoriesPromise,
      productPromise
    ]);
    const [productData] = productResponse;

    this.renderCategories(categoriesData);
    this.renderForm(productData);
    this.renderImages(productData.images);
    this.initEventListeners();

    return this.element;
  }

  async loadProductData(id) {
    const url = new URL('api/rest/products', process.env.BACKEND_URL);
    url.searchParams.set('id', id);

    const data = await fetchJson(url);

    return data;
  }

  async loadCategoriesData() {
    const url = new URL('api/rest/categories', process.env.BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    const data = await fetchJson(url);

    return data;
  }

  async save() {
    const product = this.getFromData();

    try {
      const result = await fetchJson(`${process.env.BACKEND_URL}api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(product)
      });
      this.dispatchEvent(result.id);
      this.showNotification('success', `Товар ${result.id ? 'сохранен' : 'добавлен'}`);
    } catch (error) {
      this.showNotification('error', `Ошибка :( ${error}`);
    }
  }

  async uploadImage(file) {
    const formData = new FormData();

    formData.append('image', file);

    try {
      const response = await fetchJson('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
        },
        body: formData,
        referrer: ''
      });

      return response;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  get template() {
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
          <button type="button" name="uploadImage" data-element="imageUpload" class="button-primary-outline fit-content"><span>Загрузить</span></button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          <select class="form-control" name="subcategory" id="subcategory"></select>
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" name="price" id="price" class="form-control" placeholder="100">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
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
            ${this.productId ? 'Сохранить' : 'Добавить'} товар
          </button>
        </div>
      </form>
    </div>
    `;
  }

  renderCategories(data) {
    const select = this.subElements.productForm.querySelector('[name="subcategory"]');

    for (const item of data) {
      if (item.subcategories) {
        for (const subItem of item.subcategories) {
          select.add(new Option(`${item.title} > ${subItem.title}`, subItem.id));
        }
      } else {
        select.add(new Option(item.title, item.id));
      }
    }
  }

  renderForm(data) {
    const fields = Object.keys(this.defaultFormData);
    const productData = this.productId ? data : this.defaultFormData;

    console.log(this.productId);
    for (const key of fields) {
      let value = productData[key];

      this.subElements.productForm.querySelector(`#${key}`).value = value;
    }
  }

  initEventListeners() {
    this.subElements.productForm.addEventListener('submit', this.onSubmitClick);
    this.subElements.imageListContainer.addEventListener('pointerdown', this.onDeleteClick);
    this.subElements.imageUpload.addEventListener('pointerdown', this.onUploadClick);
  }

  renderImages(images) {
    if (images) {
      const sortableList = new SortableList({
        items: images.map(image => {
          return this.getImageItem(image.url, image.source);
        })
      });

      this.subElements.imageListContainer.append(sortableList.element);
    }
  }

  getImageItem(url, source) {
    const element = document.createElement('li');
    element.classList.add('products-edit__imagelist-item', 'sortable-list__item');
    element.innerHTML = `
      <input type="hidden" name="url" value="${url}">
      <input type="hidden" name="source" value="${source}">
      <span>
        <img src="${iconGrab}" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${url}">
        <span>${source}</span>
      </span>
      <button type="button">
       <img src="${iconTrash}" data-delete-handle="" alt="delete">
      </button>
    `;

    return element;
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

  onSubmitClick = async event => {
    event.preventDefault();

    this.save();
  };

  onUploadClick = event => {
    event.preventDefault();

    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.accept = 'image/*';
    this.fileInput.hidden = true;

    this.element.append(this.fileInput);

    this.fileInput.click();

    this.fileInput.addEventListener('change', this.onUploadImageClick);
  };

  onDeleteClick = event => {
    if (event.target.closest('button')) {
      event.target.closest('li').remove();
    }
  };

  onUploadImageClick = async event => {
    const [file] = event.target.files;
    const uploadImageButton = this.element.querySelector('[name="uploadImage"]');

    uploadImageButton.classList.add('is-loading');

    const data = await this.uploadImage(file);

    uploadImageButton.classList.remove('is-loading');

    const newImageItem = this.getImageItem(data.data.link, file.name);

    if (!this.subElements.imageListContainer.firstElementChild) {
      const sortableList = new SortableList({
        items: [newImageItem]
      });

      this.subElements.imageListContainer.append(sortableList.element);
    } else {
      this.subElements.imageListContainer.firstElementChild.append(newImageItem);
    }

    this.fileInput.remove();
  };

  getFromData() {
    const result = {};
    const fields = Object.keys(this.defaultFormData);

    if (this.productId) {
      result.id = this.productId;
    }

    for (const key of fields) {
      const field = this.subElements.productForm.querySelector(`#${key}`);
      if (field.type === 'number' || key === 'status') {
        result[key] = parseFloat(field.value);
      } else {
        result[key] = escapeHtml(field.value);
      }
    }

    result.images = [];
    const images = this.subElements.imageListContainer.querySelectorAll('li');
    for (const image of images) {
      result.images.push({
        source: image.querySelector('[name="source"]').value,
        url: image.querySelector('[name="url"]').value
      });
    }

    return result;
  }

  dispatchEvent(id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  showNotification(type, message) {
    const notification = new NotificationMessage(message, { type: type, duration: 2000 });

    notification.show();
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}

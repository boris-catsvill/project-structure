import SortableList from "../sortable-list/index.js";
import NotificationMessage from "../notification";
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = process.env.BACKEND_URL;

export default class ProductForm {
  subElements = {};
  _defaultFormData = {
    id: null,
    title: '',
    description: '',
    subcategory: '',
    images: [],
    price: 100,
    discount: 0,
    quantity: 1,
    status: 1
  };
  _categoriesData = [];

  onSubmit = event => {
    event.preventDefault();
    // noinspection JSIgnoredPromiseFromCall
    this.save()
      .then(() => {
        const notificationSuccess = new NotificationMessage('Товар сохранен', {
          duration: 2000,
          type: 'success'
        });
        notificationSuccess.show()
      })
      .catch(() => {
        const notificationError = new NotificationMessage('Товар не сохранен', {
          duration: 2000,
          type: 'error'
        });
        notificationError.show()
      });
  };

  onUploadImage = () => {
    const imageInput = document.getElementById('imageInput');

    imageInput.onchange = async () => {
      const [file] = imageInput.files;

      if (!file) {
        return;
      }

      const { imageListContainer } = this.subElements;

      const formData = new FormData();
      formData.append('name', file.name);
      formData.append('image', file);

      const response = await this._fetchUploadImage(formData);

      if (response.data) {
        const imgObj = {
          source: escapeHtml(response.data.name),
          url: escapeHtml(response.data.link)
        };

        this._formData.images.push(imgObj);
        imageListContainer.append(this._addPhotoItem(imgObj));
      }
    };

    imageInput.click();
  };

  constructor (productId) {
    this.productId = productId;
  }

  async render() {
    const getCategories = this._fetchCategoriesData();
    const getProduct = this.productId
      ? this._fetchProductData(this.productId)
      : [this._defaultFormData];

    const [productData, categoriesData] = await Promise.all([getProduct, getCategories]);

    this._formData = productData[0];
    this._categoriesData = categoriesData;

    const element = document.createElement('div');
    element.innerHTML = productData.length ? this._getTemplate() : this._getEmptyTemplate();
    this.element = element.firstElementChild;
    this.subElements = this._getSubElements(this.element);

    if (productData.length) {
      this._setFormData();
      this._setImageData();
      this._addEventListeners();
    }

    return this.element;
  }

  async _fetchProductData(productId) {
    const url = new URL('/api/rest/products', BACKEND_URL);
    url.searchParams.set('id', productId);

    return await fetchJson(url);
  }

  async _sendProductData(product) {
    const url = new URL('/api/rest/products', BACKEND_URL);
    const params = {
      method: this.productId ? 'PATCH' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    };

    return await fetchJson(url, params);
  }

  async _fetchCategoriesData() {
    const url = new URL('/api/rest/categories', BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    return await fetchJson(url);
  }

  async _fetchUploadImage(formData) {
    const url = new URL('https://api.imgur.com/3/upload');
    const params = {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
      },
      body: formData,
    };

    return await fetchJson(url, params);
  }

  async save() {
    const product = this._getFormData();
    const response = await this._sendProductData(product);

    this._dispatchEvent(response.id);
  }

  _setFormData() {
    const { productForm } = this.subElements;
    const { title, description, subcategory, price, discount, quantity, status } = this._formData;

    productForm.elements.title.value = title;
    productForm.elements.description.value = description;
    productForm.elements.subcategory.value = subcategory;
    productForm.elements.price.value = price;
    productForm.elements.discount.value = discount;
    productForm.elements.quantity.value = quantity;
    productForm.elements.status.value = status;
  }

  _getFormData() {
    const { productForm, imageListContainer } = this.subElements;

    const images = [];
    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    for (const image of imagesHTMLCollection) {
      images.push({
        url: image.src,
        source: image.alt
      });
    }

    return {
      id: this.productId ? this.productId : null,
      title: productForm.elements.title.value,
      description: productForm.elements.description.value,
      subcategory: productForm.elements.subcategory.value,
      images: images,
      price: Number(productForm.elements.price.value),
      discount: Number(productForm.elements.discount.value),
      quantity: Number(productForm.elements.quantity.value),
      status: Number(productForm.elements.status.value)
    };
  }

  _setImageData() {
    const { imageListContainer } = this.subElements;
    const imagesHtmlCollection = [];

    for (const image of this._formData.images) {
      imagesHtmlCollection.push(this._addPhotoItem(image));
    }

    const sortableList = new SortableList({
      items: imagesHtmlCollection
    });

    imageListContainer.append(sortableList.element);
  }

  _dispatchEvent(id) {
    const eventDetail = { productId: id };
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: eventDetail })
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  _addEventListeners() {
    const { productForm } = this.subElements;
    const btnSubmit = productForm.elements.save;
    const btnUploadImage = productForm.elements.uploadImage;

    btnSubmit.addEventListener('click', this.onSubmit);
    btnUploadImage.addEventListener('pointerdown', this.onUploadImage);
  }

  _getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }

    return result;
  }

  _getTemplate() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          ${this._createTemplateProductTitle()}
          ${this._createTemplateProductDescription()}
          ${this._createTemplateProductPhoto()}
          ${this._createTemplateProductCategories()}
          ${this._createTemplateProductPriceAndDiscount()}
          ${this._createTemplateProductQuantity()}
          ${this._createTemplateProductStatus()}
          ${this._createTemplateButtonSubmit()}
         </form>
      </div>
    `;
  }

  _getEmptyTemplate() {
    return `
      <div class="product-form">
        <h1>Страница не найдена</h1>
        <p>Извините, данный товар не существует</p>
      </div>
    `;
  }

  _createTemplateProductTitle() {
    return `
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input id="title" required="" type="text" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
    `;
  }

  _createTemplateProductDescription() {
    return `
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea id="description" required="" class="form-control" name="description" placeholder="Описание товара"></textarea>
      </div>
    `;
  }

  _createTemplateProductPhoto() {
    return `
      <div class="form-group form-group__wide">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
          <input id="imageInput" type="file" accept="image/*" hidden>
        </div>
        <button type="button" name="uploadImage" class="button-primary-outline">
          <span>Загрузить</span>
        </button>
      </div>
    `;
  }

  _createTemplateProductPhotoItem(img) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <svg data-grab-handle width="11" height="18" viewBox="0 0 11 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.8 0C1.29375 0 0.867188 0.173438 0.520312 0.520312C0.173438 0.867187 0 1.29375 0 1.8C0 2.30625 0.173438 2.73282 0.520312 3.07969C0.867187 3.42657 1.29375 3.6 1.8 3.6C2.30625 3.6 2.73282 3.42657 3.07969 3.07969C3.42657 2.73282 3.6 2.30625 3.6 1.8C3.6 1.29375 3.42657 0.867188 3.07969 0.520312C2.73282 0.173438 2.30625 0 1.8 0ZM9 0C8.49375 0 8.06719 0.173438 7.72031 0.520312C7.37344 0.867187 7.2 1.29375 7.2 1.8C7.2 2.30625 7.37344 2.73282 7.72031 3.07969C8.06719 3.42657 8.49375 3.6 9 3.6C9.50625 3.6 9.93282 3.42657 10.2797 3.07969C10.6266 2.73282 10.8 2.30625 10.8 1.8C10.8 1.29375 10.6266 0.867188 10.2797 0.520312C9.93282 0.173438 9.50625 0 9 0ZM1.8 7.2C1.29375 7.2 0.867188 7.37344 0.520312 7.72031C0.173438 8.06719 0 8.49375 0 9C0 9.50625 0.173438 9.93281 0.520312 10.2797C0.867187 10.6266 1.29375 10.8 1.8 10.8C2.30625 10.8 2.73282 10.6266 3.07969 10.2797C3.42657 9.93282 3.6 9.50625 3.6 9C3.6 8.49375 3.42657 8.06719 3.07969 7.72031C2.73282 7.37344 2.30625 7.2 1.8 7.2ZM9 7.2C8.49375 7.2 8.06719 7.37344 7.72031 7.72031C7.37344 8.06719 7.2 8.49375 7.2 9C7.2 9.50625 7.37344 9.93281 7.72031 10.2797C8.06719 10.6266 8.49375 10.8 9 10.8C9.50625 10.8 9.93282 10.6266 10.2797 10.2797C10.6266 9.93282 10.8 9.50625 10.8 9C10.8 8.49375 10.6266 8.06719 10.2797 7.72031C9.93282 7.37344 9.50625 7.2 9 7.2ZM1.8 14.4C1.29375 14.4 0.867188 14.5734 0.520312 14.9203C0.173438 15.2672 0 15.6937 0 16.2C0 16.7063 0.173438 17.1328 0.520312 17.4797C0.867187 17.8266 1.29375 18 1.8 18C2.30625 18 2.73282 17.8266 3.07969 17.4797C3.42657 17.1328 3.6 16.7063 3.6 16.2C3.6 15.6937 3.42657 15.2672 3.07969 14.9203C2.73282 14.5734 2.30625 14.4 1.8 14.4ZM9 14.4C8.49375 14.4 8.06719 14.5734 7.72031 14.9203C7.37344 15.2672 7.2 15.6937 7.2 16.2C7.2 16.7063 7.37344 17.1328 7.72031 17.4797C8.06719 17.8266 8.49375 18 9 18C9.50625 18 9.93282 17.8266 10.2797 17.4797C10.6266 17.1328 10.8 16.7063 10.8 16.2C10.8 15.6937 10.6266 15.2672 10.2797 14.9203C9.93282 14.5734 9.50625 14.4 9 14.4Z" fill="#90A0B7"/>
          </svg>
          <img class="sortable-table__cell-img" alt="${img.source}" src="${img.url}">
          <span>${img.source}</span>
        </span>
        <button type="button">
          <svg data-delete-handle width="15" height="18" viewBox="0 0 15 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.00002 0C5.56252 0 5.20314 0.140625 4.92189 0.421876C4.64064 0.703128 4.50001 1.0625 4.50001 1.50001V2.25001H0V3.75001H0.750002V15.7501C0.750002 16.3594 0.972659 16.8868 1.41797 17.3321C1.86329 17.7774 2.39063 18.0001 3.00001 18.0001H12C12.6094 18.0001 13.1368 17.7774 13.5821 17.3321C14.0274 16.8868 14.25 16.3594 14.25 15.7501V3.75001H15V2.25001H10.5V1.50001C10.5 1.06251 10.3594 0.703129 10.0782 0.421876C9.79691 0.140625 9.43753 0 9.00003 0H6.00002ZM6.00002 1.5H9.00003V2.25001H6.00002V1.5ZM2.25001 3.75001H12.75V15.75C12.75 15.9532 12.6758 16.129 12.5274 16.2774C12.3789 16.4258 12.2032 16.5001 12 16.5001H3.00001C2.79689 16.5001 2.6211 16.4258 2.47267 16.2774C2.32423 16.129 2.25001 15.9532 2.25001 15.75V3.75001ZM3.75001 6.00002V14.25H5.25002V6.00002H3.75001ZM6.75002 6.00002V14.25H8.25003V6.00002H6.75002ZM9.75003 6.00002V14.25H11.25V6.00002H9.75003Z" fill="#90A0B7"/>
          </svg>
        </button>
      </li>
    `;
  }

  _addPhotoItem(img) {
    const element = document.createElement('div');
    element.innerHTML = this._createTemplateProductPhotoItem(img);

    return element.firstElementChild;
  }

  _createTemplateProductCategories() {
    return `
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select id="subcategory" class="form-control" name="subcategory">
          ${this._createTemplateProductCategoriesOptions()}
        </select>
      </div>
    `;
  }

  _createTemplateProductCategoriesOptions() {
    const result = [];

    for (const category of this._categoriesData) {
      for (const child of category.subcategories) {
        result.push(`<option value="${child.id}">${category.title} > ${child.title}</option>`);
      }
    }

    return result.join('');
  }

  _createTemplateProductPriceAndDiscount() {
    return `
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input id="price" required="" type="number" name="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input id="discount" required="" type="number" name="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
    `;
  }

  _createTemplateProductQuantity() {
    return `
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1">
      </div>
    `;
  }

  _createTemplateProductStatus() {
    return `
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select id="status" class="form-control" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
    `;
  }

  _createTemplateButtonSubmit() {
    return `
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          <span>${ this.productId ? 'Сохранить' : 'Добавить' } товар</span>
        </button>
      </div>
    `;
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.subElements = {};
    this._categoriesData = [];
    this.remove();
  }
}

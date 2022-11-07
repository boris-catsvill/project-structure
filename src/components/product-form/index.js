import SortableList from './../sortable-list/index.js';
import fetchJson from './utils/fetch-json.js';

export default class ProductForm {
  abortController = new AbortController();
  API_PATH = '/api/rest';

  defaultProductData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 2,
    price: 0,
    discount: 0,
  };
  currentProductData = {};

  formValueConverter = {
    status: value => parseFloat(value),
    quantity: value => parseFloat(value),
    price: value => parseFloat(value),
    discount: value => parseFloat(value),
  };

  constructor(productId) {
    this.productId = productId;
  }

  async render() {
    const divElement = document.createElement('div');
    divElement.innerHTML = this.getTemplate();
    this.element = divElement.firstElementChild;

    this.subElements = this.getSubElements();

    const [categoriesData, productData] = await Promise.all([
      this.getCategoriesData(),
      this.getProductData()
    ]);
    this.fillCategoriesElement(categoriesData);
    this.fillProductDataElement(productData);
    this.currentProductData = productData;

    this.addEventListeners();
    return this.element;
  }

  addEventListeners() {
    const {productForm} = this.subElements;
    productForm.addEventListener(
      'submit',
      this.save
    );

    this.element.querySelector('#uploadImage').addEventListener(
      'pointerdown',
      this.uploadImageHandler
    );

  }

  uploadImageHandler = (event) => {
    event.preventDefault();
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = 'image/*';
    inputElement.onchange = async () => {
      const [file] = inputElement.files;
      if (!file) {
        return;
      }
      const {imageListContainer} = this.subElements;

      const link = await this.uploadImage(file);
      const name = file.name;

      const imageElement = this.makeImageListItemElement({'url': link, 'source': name});
      imageListContainer.firstElementChild.append(imageElement);

      inputElement.remove();
    };
    inputElement.hidden = true;
    this.element.appendChild(inputElement);
    inputElement.click();
  };

  fillCategoriesElement(categories) {
    const categoriesSelect = this.element.querySelector("#subcategory");
    if (!categoriesSelect) {
      return;
    }
    this.makeCategoriesData(categories).forEach(option => categoriesSelect.append(option));
  }

  async getCategoriesData() {
    return fetchJson(`${process.env.BACKEND_URL}${this.API_PATH}/categories?_sort=weight&_refs=subcategory`,
      {
        signal: this.abortController.signal
      }
    );
  }

  fillProductDataElement(productData) {
    this.fillProduct(productData);
    this.fillImage(productData.images);
  }

  async getProductData() {
    if (!this.productId) {
      return this.defaultProductData;
    }
    const url = new URL(`${this.API_PATH}/products`, `${process.env.BACKEND_URL}`);
    url.searchParams.set('id', this.productId);
    const fetchResult = await fetchJson(url,
      {
        signal: this.abortController.signal
      }
    );
    const [result] = fetchResult;
    if (result === undefined) {
      throw new Error(`Product data for ${this.productId} is not correctly`);
    }
    return result;
  }

  fillProduct(productData) {
    if (!productData) {
      return;
    }
    const {productForm} = this.subElements;
    Object.keys(this.defaultProductData).forEach(key => {
      productForm.querySelector(`#${key}`).value = productData[key];
    });
  }

  fillImage(imagesData) {
    if (!imagesData) {
      return;
    }
    const {imageListContainer} = this.subElements;
    const imageElements = imagesData.map(this.makeImageListItemElement);
    this.sortableList = new SortableList({items: imageElements});
    imageListContainer.append(this.sortableList.element);
  }


  makeCategoriesData(categoriesData) {
    const names = [];
    for (const category of categoriesData) {
      for (const child of category.subcategories) {
        const text = `${category.title} > ${child.title}`;
        const value = child.id;
        names.push(new Option(text, value));
      }
    }
    return names;
  }

  save = async (event) => {
    event.preventDefault();
    await this.onSaveEventHandler();
  };

  loadImage = () => {
    this.onLoadImageHandler();
  };

  onLoadImageHandler() {
    const input = this.element.querySelector('#fileInput');
    const [file] = input.files;
  }

  async onSaveEventHandler() {
    const updateBody = this.makeBody();
    if (this.productId) {
      updateBody['id'] = this.productId;
    }

    const response = await fetchJson(`${process.env.BACKEND_URL}${this.API_PATH}/products`,
      {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(updateBody),
        signal: this.abortController.signal
      }
    );

    if (response.status === 'ok') {
      const event = (this.productId) ? new Event("product-updated") : new Event("product-saved");
      this.element.dispatchEvent(event);
    }
  }

  makeBody() {
    const {productForm} = this.subElements;
    const body = {};
    Object.keys(this.defaultProductData).forEach(key => {
      const formDataElement = productForm.querySelector(`#${key}`);
      if (!formDataElement) {
        return;
      }

      let converter = this.formValueConverter[key];
      if (!converter) {
        converter = value => value;
      }

      const formValue = converter(formDataElement.value);

      if (this.productId) {
        if (formValue !== this.currentProductData[key]) {
          body[key] = formValue;
        }
      } else {
        body[key] = formValue;
      }
    });

    const {imageListContainer} = this.subElements;
    const images = [];
    for (const element of imageListContainer.querySelectorAll('li')) {
      const imageData = this.getImageData(element);
      images.push(imageData);
    }
    body.images = images;
    return body;
  }

  getImageData(element) {
    const res = {};
    for (const input of [...element.querySelectorAll('input')]) {
      res[input.name] = input.value;
    }
    return res;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.abortController.abort();
    this.remove();
    this.element = null;
    this.subElements = null;
    if (this.sortableList) {
      this.sortableList.destroy();
      this.sortableList = null;
    }
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  async uploadImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const response = await fetch(`${process.env.IMGUR_URL}/3/image`, {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
        },
        body: formData,
        referrer: ''
      });
      const body = await response.json();
      return body.data.link;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  getTemplate() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input id="title" required="" type="text" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea id="description" required="" class="form-control" name="description" data-element="productDescription"
                      placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
            </div>
            <button id="uploadImage" name="uploadImage" class="button-primary-outline" type="button"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left" id="formCategories">
            <label class="form-label">Категория</label>
            <select id="subcategory" class="form-control"  name="subcategory" data-element="categories" > </select>
          </div>
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
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select id="status" class="form-control" name="status" >
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button id="save" type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
      </div>
    `;
  }

  makeImageListItemElement({url, source}) {
    const div = document.createElement('div');
    div.innerHTML = `
          <li class="products-edit__imagelist-item sortable-list__item" style="">
            <input type="hidden" name="url" value=${url}>
            <input type="hidden" name="source" value=${source}>
            <span>
              <img src="/assets/icons/icon-grab.svg" data-grab-handle="" alt="grab">
              <img class="sortable-table__cell-img" alt="Image" src=${url}>
              <span>${source}</span>
            </span>
            <button type="button">
              <img src="/assets/icons/icon-trash.svg" data-delete-handle="" alt="delete">
            </button>
          </li>
    `;
    return div.firstElementChild;
  }
}

import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';
import iconGrab from '../../assets/icons/icon-grab.svg';
import iconTrash from '../../assets/icons/icon-trash.svg';
const IMGUR_CLIENT_ID = process.env.IMGUR_CLIENT_ID;
const BACKEND_URL = process.env.BACKEND_URL;

export default class ProductForm {
  element;
  product = [];
  subElements = {};
  defaultFormData = {
    description: '',
    discount: 0,
    price: 100,
    quantity: 1,
    status: 1,
    subcategory: '',
    title: '',
    images: []
  };

  onUploadBtnClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', async () => {
      try {
        const [file] = input.files;
        const { uploadImage } = this.subElements;
        const { imageListContainer } = this.subElements;
        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        const result = await this.uploader(file);

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;
        imageListContainer.firstElementChild.append(
          this.fillImagesList(result.data.link, file.name)
        );

        console.log('изображение загружено ', result);
      } catch (error) {
        console.error('ошибка загрузки изображения', error);
      }
    });
    input.click();
  };

  sendFormBtnClick = async event => {
    event.preventDefault();
    const url = new URL('/api/rest/products', BACKEND_URL);
    const method = this.productId ? 'PATCH' : 'PUT';
    const data = this.getFormData();
    try {
      const result = await fetchJson(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      this.dispatchEvent(result);
      console.log('форма отправлена');
    } catch (error) {
      console.error('ошибка отправки формы', error);
      this.element.dispatchEvent(new CustomEvent('error', { detail: error }));
    }
  };

  constructor(productId) {
    this.productId = productId;
  }

  async render() {
    const product = this.productId
      ? this.getProduct(this.productId)
      : Promise.resolve(this.defaultFormData);
    const categoriesPromise = this.getCategories();
    const [categoriesData, productResponse] = await Promise.all([categoriesPromise, product]);
    this.product = productResponse;
    this.categories = categoriesData;
    this.createForm();
    this.fillThisForm();
    this.createImageList();
    this.initEventListeners();
    return this.element;
  }

  createForm() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.product ? this.getTemplate() : this.getEmptyTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
  }

  getEmptyTemplate() {
    return `<div>
      <h1 class="page-title">Страница не найдена</h1>
      <p>Извините, данный товар не отсутствует</p>
    </div>`;
  }

  getFormData() {
    const { productForm, imageListContainer } = this.subElements;
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const excludedFields = ['images'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));
    const getValue = field => productForm.querySelector(`[name=${field}]`).value;

    const values = {};

    for (const field of fields) {
      const value = getValue(field);
      values[field] = formatToNumber.includes(field) ? parseInt(value) : value;
    }

    values.id = this.productId;
    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');
    values.images = [];
    for (const image of imagesHTMLCollection) {
      values.images.push({
        url: image.src,
        source: image.nextElementSibling.textContent
      });
    }
    return values;
  }

  async getProduct(productId) {
    const url = new URL('/api/rest/products', BACKEND_URL);
    url.searchParams.set('id', encodeURIComponent(productId));
    try {
      const response = await fetchJson(url);
      return response[0];
    } catch (error) {
      console.error('ошибка получения данных о товаре', error);
    }
  }

  async getCategories() {
    return await fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  createCategories() {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `<select class="form-control" id="subcategory" name="subcategory"></select>`;

    const select = wrapper.firstElementChild;

    for (const category of this.categories) {
      for (const child of category.subcategories) {
        select.append(new Option(`${category.title} > ${child.title}`, child.id));
      }
    }

    return select.outerHTML;
  }
  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((acc, subElement) => {
      acc[subElement.dataset.element] = subElement;
      return acc;
    }, {});
  }

  getInputs() {
    const inputs = this.element.querySelectorAll('.form-control');
    return [...inputs].reduce((acc, input) => {
      acc[input.name] = input;
      return acc;
    }, {});
  }

  async uploader(file) {
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          authorization: `Client-ID ${IMGUR_CLIENT_ID}`
        },
        body: formData,
        refferer: ''
      });
      return await response.json();
    } catch (error) {
      console.error('ошибка загрузки изображения на сервер', error);
      return Promise.reject(error);
    }
  }

  getTemplate() {
    return `<div class="product-form">
    <form data-element="productForm" class="form-grid">
    <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товар</label>
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
          </div>
        <button type="button" name="uploadImage" class="button-primary-outline" data-element="uploadImage"><span>Загрузить</span></button>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
          ${this.createCategories()}
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" class="form-control" placeholder="${
            this.defaultFormData.price
          }">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" class="form-control" placeholder="${
            this.defaultFormData.discount
          }">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" placeholder="${
          this.defaultFormData.quantity
        }">
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
        ${this.productId ? 'Сохранить' : 'Добавить'} товар
        </button>
      </div>
    </form>
  </div>`;
  }

  createImageList() {
    const { images } = this.product;
    const items = images.map(({ url, source }) => this.fillImagesList(url, source));

    const sortableList = new SortableList({ items });

    this.subElements.imageListContainer.append(sortableList.element);
  }

  fillImagesList(url, source) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
      <input type="hidden" name="url" value="${escapeHtml(url)}">
      <input type="hidden" name="source" value="${escapeHtml(source)}">
      <span>
    <img src="${iconGrab}" data-grab-handle alt="grab">
    <img class="sortable-table__cell-img" alt="Image" src="${escapeHtml(url)}">
    <span>${escapeHtml(source)}</span>
  </span>
      <button type="button">
        <img src="${iconTrash}" data-delete-handle alt="delete">
      </button></li>`;
    return wrapper.firstElementChild;
  }

  fillThisForm() {
    Object.keys(this.product).forEach(key => {
      const input = this.element.querySelector(`[name="${key}"]`);
      if (input) {
        input.value = this.product[key] || this.defaultFormData[key];
      }
    });
  }

  dispatchEvent(result) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: result })
      : new CustomEvent('product-saved', {});
    this.element.dispatchEvent(event);
  }
  initEventListeners() {
    this.subElements.uploadImage.addEventListener('pointerdown', this.onUploadBtnClick);
    this.subElements.productForm.addEventListener('submit', this.sendFormBtnClick);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.subElements = null;
    this.element = null;
  }
}

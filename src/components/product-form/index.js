import SortableList from '../sortable-list/index.js';
import fetchJson from '../../utils/fetch-json.js';
import escapeHtml from '../../utils/escape-html.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  CAT_API_URL = 'api/rest/categories';
  PRODUCT_API_URL = 'api/rest/products';
  DEFAULT_FORM_DATA = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    images: [],
    status: 1,
    price: 100,
    discount: 0
  };

  element = null;
  subElements = {};
  formControls = {};
  controller = new AbortController();
  sortableImageList = {};

  product = {};
  categories = [];

  constructor(productId) {
    this.productId = productId;
  }

  async render() {
    const wrap = document.createElement('div');

    await this.loadData();

    wrap.innerHTML = this.getTemplate();

    this.element = wrap.firstElementChild;
    this.getSubElements();
    this.renderImages();

    this.initListeners();

    return this.element;
  }

  async save() {
    this.subElements.saveButton.classList.add('is-loading');

    const product = this.getProductFormData();
    try {
      const query = new URL(this.PRODUCT_API_URL, BACKEND_URL);
      const result = await fetchJson(query, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });

      this.dispathcEvent(result.id);
      this.productId = result.id;
    } catch (error) {
      console.error(`Saving error: ${error.message}`);
    } finally {
      this.subElements.saveButton.classList.remove('is-loading');
    }
  }

  getProductFormData() {
    const product = this.product;

    const numbers = ['price', 'discount', 'quantity', 'status'];

    this.formControls.forEach(({ id, value }) => {
      product[id] = numbers.includes(id) ? Number(value) : value;
    });

    if (!this.productId) {
      product.id = product.title.toLowerCase().replaceAll(' ', '-');
    }

    return product;
  }

  getSubElements() {
    for (const item of this.element.querySelectorAll('[data-element]')) {
      this.subElements[item.dataset.element] = item;
    }
    this.formControls = this.subElements.productForm.querySelectorAll('.form-control');

    this.subElements['saveButton'] = this.element.querySelector('#save');
    this.subElements['uploadImage'] = this.element.querySelector('#uploadImage');
  }

  async loadData() {
    const promises = [];
    promises.push(this.loadCategories());
    if (this.productId) {
      promises.push(this.loadProduct());
    } else {
      // eslint-disable-next-line new-cap
      promises.push(Promise.resolve([this.DEFAULT_FORM_DATA]));
    }

    try {
      const [categories, productArr] = await Promise.all(promises);

      if (categories && categories.length > 0) {
        this.categories = categories;
      }
      if (productArr && productArr.length > 0) {
        this.product = productArr[0];
      }
    } catch (e) {
      console.error(`Error of data loading. ${e}`);
    }
  }

  loadCategories() {
    const query = new URL(this.CAT_API_URL, BACKEND_URL);
    query.searchParams.set('_sort', 'weight');
    query.searchParams.set('_refs', 'subcategory');

    return fetchJson(query);
  }
  loadProduct() {
    if (this.productId) {
      const query = new URL(this.PRODUCT_API_URL, BACKEND_URL);
      query.searchParams.set('id', this.productId);

      return fetchJson(query);
    }
  }

  // ********************************************************
  //                          EVENTS
  initListeners() {
    this.subElements.uploadImage.addEventListener('click', this.uploadImageBtnClick, {
      signal: this.controller.signal
    });

    this.subElements.productForm.addEventListener('submit', this.saveFormSubmit, {
      signal: this.controller.signal
    });

    document.addEventListener('sorting-list-toggle-items', this.updateImages, {
      signal: this.controller.signal
    });
  }

  updateImages = ({ detail }) => {
    if (detail) {
      this.product.images = detail.map(item => {
        const [url, source] = item.querySelectorAll('[type="hidden"]');
        return { url: url.value, source: source.value };
      });
    }
  };

  uploadImage = async ({ target }) => {
    const formData = new FormData();
    const [file] = target.files;

    if (file) {
      this.subElements.uploadImage.disabled = true;
      this.subElements.uploadImage.classList.add('is-loading');
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

        const image = await response.json();

        if (image.success) {
          this.product.images.push({
            url: image.data.link,
            source: image.data.link.split('/').at(-1)
          });
          this.renderImages();
        }
      } catch (e) {
        console.error(`uploadImage fetch error: ${e}`);
      } finally {
        this.subElements.uploadImage.classList.remove('is-loading');
        this.subElements.uploadImage.disabled = false;
      }
    }
  };

  uploadImageBtnClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.hidden = true;
    document.body.append(input);
    input.addEventListener('change', this.uploadImage, { bubbles: false });
    input.click();
    input.remove();
  };

  saveFormSubmit = event => {
    event.preventDefault();
    this.save();
  };

  dispathcEvent(detail) {
    const eventType = this.productId ? 'updated' : 'saved';
    this.element.dispatchEvent(
      new CustomEvent(`product-${eventType}`, {
        detail: detail,
        bubbles: true
      })
    );
  }
  //                          /EVENTS
  // ********************************************************

  // ********************************************************
  //                          TEMPLATES
  getTemplate() {
    return `<div class="product-form">
        <form data-element="productForm" class="form-grid">
        ${this.getTitleTemplate()}
        ${this.getDescriptionTemplate()}
        ${this.getImagesTemplate()}
        ${this.getCategoriesTemplate()}
        ${this.getPropertiesTemplate()}
        ${this.getButtonsTemplate()}
        </form>
      </div>`;
  }
  getTitleTemplate() {
    return `<div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input
            value="${this.product.title ? escapeHtml(this.product.title) : ''}"
            required=""
            type="text"
            name="title"
            id="title"
            class="form-control"
            placeholder="Название товара"
          />
        </fieldset>
      </div>
    `;
  }
  getDescriptionTemplate() {
    return `<div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea
          required=""
          class="form-control"
          name="description"
          id="description"
          data-element="productDescription"
          placeholder="Описание товара"
        >${this.product ? escapeHtml(this.product.description) : ''}</textarea>
      </div>`;
  }
  getImagesTemplate() {
    return `<div
        class="form-group form-group__wide"
        data-element="sortable-list-container"
      >
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
        </div>
        <button type="button" name="uploadImage" id="uploadImage" class="button-primary-outline">
          <span>Загрузить</span>
        </button>
      </div>`;
  }
  renderImages() {
    const items = Object.hasOwn(this.product, 'images')
      ? this.product.images.map(photo => {
          return this.getPhotoTemplate(photo);
        })
      : [];

    if (Object.hasOwn(this.sortableImageList, 'destroy')) {
      this.sortableImageList.destroy();
    }

    this.sortableImageList = new SortableList({ items });
    this.subElements.imageListContainer.innerHTML = '';
    this.subElements.imageListContainer.append(this.sortableImageList.element);
  }

  getPhotoTemplate(photo) {
    const result = document.createElement('li');
    result.classList.add('products-edit__imagelist-item');
    result.innerHTML = `
        <input
          type="hidden"
          name="url"
          value="${escapeHtml(photo.url) || ''}"
        />
        <input
          type="hidden"
          name="source"
          value="${escapeHtml(photo.source) || ''}"
        />
        <span>
          <img src="/assets/icons/icon-grab.svg" data-grab-handle alt="grab" />
          <img
            class="sortable-table__cell-img"
            alt="Image"
            src="${escapeHtml(photo.url) || ''}"
          />
          <span>${photo.source || ''}</span>
        </span>
        <button type="button">
          <img src="/assets/icons/icon-trash.svg" data-delete-handle alt="delete" />
        </button>
      `;
    return result;
  }
  getCategoriesTemplate() {
    return `<div class="form-group form-group__half_left">
      <label class="form-label">Категория</label>
      <select class="form-control" name="subcategory" id="subcategory">
        ${this.categories
          .map(cat => {
            return this.getCategoryTemplate(cat);
          })
          .join('')}
      </select>
    </div>`;
  }
  getCategoryTemplate(cat) {
    return cat.subcategories
      .map(item => {
        return this.getSubcategoryTemplate(cat.title, item);
      })
      .join('');
  }
  getSubcategoryTemplate(parentName, item) {
    const selected = item.id === this.product.subcategory ? 'selected' : '';
    return `<option value="${item.id}" ${selected}>${parentName} > ${item.title}</option>`;
  }
  getPropertiesTemplate() {
    return `<div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input
              value="${this.product.price || '0'}"
              required=""
              type="number"
              name="price"
              id="price"
              class="form-control"
              placeholder="100"
            />
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input
              value="${this.product.discount || '0'}"
              required=""
              type="number"
              name="discount"
              id="discount"
              class="form-control"
              placeholder="0"
            />
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input
            value="${this.product.quantity || '0'}"
            required=""
            type="number"
            class="form-control"
            name="quantity"
            id="quantity"
            placeholder="1"
          />
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" name="status" id="status" >
            <option value="1" value="${
              this.product.status === 1 ? 'selected' : ''
            }">Активен</option>
            <option value="0" ${this.product.status === 0 ? 'selected' : ''}>Неактивен</option>
          </select>
        </div>`;
  }
  getButtonsTemplate() {
    return `<div class="form-buttons">
    <button type="submit" name="save" id="save" class="button-primary-outline">
      ${this.productId ? 'Сохранить' : 'Добавить'} товар
    </button>
  </div>`;
  }
  //                        /TEMPLATES
  // ********************************************************

  remove() {
    // eslint-disable-next-line curly
    if (this.element) this.element.remove();
  }
  destroy() {
    this.remove();
    this.element = null;
    if (Object.hasOwn(this.sortableImageList, 'destroy')) {
      this.sortableImageList.destroy();
    }
    this.sortableImageList = null;
    this.controller.abort();
  }
}

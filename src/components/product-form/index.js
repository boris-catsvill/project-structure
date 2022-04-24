// import SortableList from "../../2-sortable-list/src/index.js";
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';
import FileUploader from './FileUploader/FileUploader.js';
import iconGrab from '../../assets/icons/icon-grab.svg';
import iconTrash from '../../assets/icons/icon-trash.svg';

export default class ProductForm {
  subElements = [];
  defaultFormData = {
    title: '',
    description: '',
    images: [],
    price: 100,
    discount: 0,
    quantity: 1,
    status: 1
  };

  handleSubmit = event => {
    event.preventDefault();

    this.save();
  };

  constructor(productId = '') {
    this.productId = productId;
    this.fileUploader = new FileUploader();
  }

  getTemplate(productInfo, categoryTouples) {
    return `
    <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара" value="${
              productInfo.title
            }">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required="" class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара">${
            productInfo.description
          }</textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          ${this.getImageListContainer(productInfo.images)}
          <button type="button" name="uploadImage" data-element="uploadImageButton" class="button-primary-outline">
            <span>Загрузить</span>
          </button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          ${this.getSubcategorySelect(categoryTouples, productInfo.subcategory)}
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" name="price" id="price" class="form-control" placeholder="100" value="${
              productInfo.price
            }">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0" value="${
              productInfo.discount
            }">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1" value="${
            productInfo.quantity
          }">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" name="status" id="status">
            ${this.getSelectOption(1, 'Активен', productInfo.status)}
            ${this.getSelectOption(0, 'Неактивен', productInfo.status)}
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            Сохранить товар
          </button>
        </div>
      </form>
    </div>`;
  }

  getImageListContainer(images) {
    return `
    <div data-element="imageListContainer">
      <ul class="sortable-list">
        ${images.map(this.getImageListItem).join('')}
      </ul>
    </div>`;
  }

  getImageListItem(image) {
    return `
    <li class="products-edit__imagelist-item sortable-list__item" style="">
      <input type="hidden" name="url" value="${image.url}">
      <input type="hidden" name="source" value="${image.source}">
      <span>
        <img src="${iconGrab}" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
        <span>${image.source}</span>
      </span>
      <button type="button">
        <img src="${iconTrash}" data-delete-handle="" alt="delete">
      </button>
    </li>`;
  }

  getSubcategorySelect(categoryTouples, activeSubcategory) {
    return `
    <select class="form-control" name="subcategory" id="subcategory">
      ${categoryTouples
        .map(([value, title]) => this.getSelectOption(value, title, activeSubcategory))
        .join('')}
    </select>`;
  }

  getSelectOption(value, title, selectValue) {
    return `<option value='${value}' ${selectValue === value ? 'selected' : ''}>${title}</option>`;
  }

  addImage(url, source, imageContainer) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getImageListItem({
      url,
      source
    });

    imageContainer.querySelector('ul').append(wrapper.firstElementChild);
  }

  async render() {
    const wrapper = document.createElement('div');

    const [escapedInfo, categoryTouples] = await this.loadData();

    wrapper.innerHTML = this.getTemplate(escapedInfo, categoryTouples);
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();

    this.initEventListeners();

    return this.element;
  }

  initEventListeners() {
    this.subElements.productForm.addEventListener('submit', this.handleSubmit);

    this.subElements.uploadImageButton.addEventListener('click', this.fileUploader.showModal);

    this.subElements.imageListContainer.addEventListener('click', event => {
      if (event.target.dataset.deleteHandle !== undefined) {
        const li = event.target.closest('li');
        if (li) {
          li.remove();
        }
      }
    });

    this.fileUploader.element.addEventListener('upload-loading', () => {
      this.setUploadImageButtonLoading(true);
    });

    this.fileUploader.element.addEventListener('upload-error', error => {
      console.error(error);
      this.setUploadImageButtonLoading(false);
    });

    this.fileUploader.element.addEventListener('upload-success', event => {
      this.setUploadImageButtonLoading(false);

      const { link, name } = event.detail;

      this.addImage(link, name, this.subElements.imageListContainer);
    });
  }

  async save() {
    const data = this.serializeForm();
    const result = await this.sendData(data);

    const eventName = this.productId ? 'product-updated' : 'product-saved';
    const event = new CustomEvent(eventName, { detail: result });

    this.element.dispatchEvent(event);
  }

  async sendData(data) {
    const url = new URL('api/rest/products', process.env.BACKEND_URL);
    const method = this.productId ? 'PATCH' : 'PUT';

    const result = await fetchJson(url, {
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
      method
    });

    return result;
  }

  async loadData() {
    const [categories, productInfo] = await Promise.all([
      this.loadCategories(),
      this.loadProductInfo()
    ]);
    const escapedInfo = this.escapeProductInfo(productInfo);
    const categoryTouples = this.getCategoryTouples(categories);

    return [escapedInfo, categoryTouples];
  }

  async loadProductInfo() {
    if (!this.productId) {
      return this.defaultFormData;
    }

    const url = new URL('api/rest/products', process.env.BACKEND_URL);
    url.searchParams.set('id', this.productId);

    const [product] = await fetchJson(url);

    return product;
  }

  async loadCategories() {
    const url = new URL('api/rest/categories', process.env.BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');

    const categories = await fetchJson(url);

    return categories;
  }

  serializeForm() {
    const formElements = this.subElements.productForm.elements;

    const { title, description, price, discount, subcategory, status, quantity } = formElements;

    const result = {
      description: description.value,
      discount: Number(discount.value),
      images: [],
      price: Number(price.value),
      quantity: Number(quantity.value),
      status: Number(status.value),
      subcategory: subcategory.value,
      title: title.value
    };

    if (this.productId) {
      result.id = this.productId;
    }

    const imageUrlInputs = formElements.url;
    const imageSourceInputs = formElements.source;

    if (imageUrlInputs !== undefined && imageSourceInputs !== undefined) {
      result.images = Array.from(imageUrlInputs).reduce((previousValue, imageUrlInput, index) => {
        const imageSourceInput = imageSourceInputs[index];

        previousValue.push({
          url: imageUrlInput.value,
          source: imageSourceInput.value
        });

        return previousValue;
      }, []);
    }

    return result;
  }

  setUploadImageButtonLoading(status) {
    const uploadButton = this.subElements.uploadImageButton;

    if (status) {
      uploadButton.classList.add('is-loading');
    } else {
      uploadButton.classList.remove('is-loading');
    }
    uploadButton.disabled = status;
  }

  escapeProductInfo(productInfo) {
    const entries = Object.entries(productInfo);
    const escapedEntries = entries.map(([key, value]) => {
      const escapedValue = typeof value === 'string' ? escapeHtml(value) : value;

      return [key, escapedValue];
    });

    return Object.fromEntries(escapedEntries);
  }

  getCategoryTouples(categories) {
    return categories.reduce((result, category) => {
      const subcategories = category.subcategories.map(subcategory => [
        subcategory.id,
        `${category.title} > ${subcategory.title}`
      ]);

      result.push(...subcategories);

      return result;
    }, []);
  }

  getSubElements() {
    const result = {};
    const collection = this.element.querySelectorAll('[data-element]');

    for (const elem of collection) {
      const name = elem.dataset.element;
      result[name] = elem;
    }

    return result;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  removeFileInput(fileInput) {
    fileInput.value = null;
    fileInput.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.fileUploader = null;
  }
}

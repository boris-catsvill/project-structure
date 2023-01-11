import fetchJson from '../../../utils/fetch-json.js';
import escapeHtml from '../../../utils/escape-html.js';
import vars from '../../../utils/vars.js';
import SortableList from '../../../components/sortable-list/index.js';

export default class Page {
  element;
  urlCategory = new URL(vars.API_REST_CATEGORIES, vars.BACKEND_URL);
  urlProduct = new URL(vars.API_REST_PRODUCTS, vars.BACKEND_URL);
  categories;
  productInfo;
  defaultData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  }

  constructor (productId) {
    this.productId = productId;
  }

  async loadData(id) {
    this.urlCategory.searchParams.set('_sort', 'weight');
    this.urlCategory.searchParams.set('_refs', 'subcategory');
    this.urlProduct.searchParams.set('id', id || '');

    const promiseCategory = fetchJson(this.urlCategory);
    const promiseProduct = id ? fetchJson(this.urlProduct) : Promise.resolve(this.defaultData);

    return await Promise.all([promiseCategory, promiseProduct]);
  }

  async render () {
    const [categoriesInfo, productInfo] = await this.loadData(this.productId);
    this.categories = categoriesInfo;
    this.productInfo = productInfo[0];

    const element = document.createElement("div");
    element.innerHTML = this.categories ? this.getTemplate() : this.getEmptyTemplate();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.categories && this.productInfo && this.getImages();
    this.initEventListeners();
    return this.element;
  }

  getFormData() {
    const inputs = Object.keys(this.defaultData).filter(item => item !== 'images');
    const getValue = item => this.element.querySelector(`[name=${item}]`).value;
    const values = {};

    for (const item of inputs) {
      const value = getValue(item);
      values[item] = value;
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

  getCategories() {
    return this.categories.map(item => {
      return item.subcategories.map(subitem => {
        return `<option value="${subitem.id}" ${this.productInfo && subitem.id === this.productInfo.subcategory && `selected`}>
          ${item.title} ${escapeHtml('>')} ${subitem.title}
          </option>`
      }).join('');
    }).join('');
  }

  getImageItem(url, name) {
    const wrapper = document.createElement('li');
    wrapper.classList.add('products-edit__imagelist-item');
    wrapper.classList.add('sortable-list__item');
    wrapper.innerHTML = `
        <span>
          <img src="./icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${name}" src="${url}">
          <span>${name}</span>
        </span>
        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>
        `;

    return wrapper;
  }

  getImages () {
    const images = this.productInfo.images.map(item => {
      return this.getImageItem(item.url, item.source);
    });

    const sortableImages = new SortableList({'items': images});

    this.subElements.imageListContainer.append(sortableImages.element);
  }

  getEmptyTemplate () {
    return `<div>
      <h1 class="page-title">Страница не найдена</h1>
      <p>Извините, данный товар не существует</p>
    </div>`;
  }

  getTemplate() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" type="text" id="title" name="title" class="form-control" placeholder="Название товара"
                  value="${(this.productInfo && this.productInfo.title) || ''}">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" id="description" name="description" data-element="productDescription"
              placeholder="Описание товара" >${(this.productInfo && this.productInfo.description) || ''}</textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer"></div>
            <button data-element="uploadImage" type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" name="subcategory" id="subcategory">
              ${this.getCategories()}
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required="" type="number" id="price" name="price" class="form-control" placeholder="100"
                value="${(this.productInfo && this.productInfo.price) || 100}">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" type="number" id="discount" name="discount" class="form-control" placeholder="0"
              value="${(this.productInfo && this.productInfo.discount) || 0}">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" id="quantity" name="quantity" placeholder="1"
            value="${(this.productInfo && this.productInfo.quantity) || 1}">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status" id="status">
              <option value="1" ${(this.productInfo && this.productInfo.status) && `selected`}>Активен</option>
              <option value="0" ${(this.productInfo && !this.productInfo.status) && `selected`}>Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              ${this.productId ? "Сохранить" : "Добавить"} товар
            </button>
          </div>
        </form>
      </div>
    `
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

  async save() {
    const product = this.getFormData();

    try {
      const result = await fetchJson(`${vars.BACKEND_URL}${vars.API_REST_PRODUCTS}`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      this.dispatchEvent(result.id);
    } catch (error) {
      console.error('error', error);
    }
  }

  dispatchEvent(id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved');

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
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append('image', file);

        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${vars.IMGUR_CLIENT_ID}`,
          },
          body: formData,
          referrer: ''
        });

        imageListContainer.firstElementChild.append(this.getImageItem(result.data.link, file.name));

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        // Remove input from body
        fileInput.remove();
      }
    });

    // must be in body for IE
    fileInput.hidden = true;
    document.body.append(fileInput);

    fileInput.click();
  };

  onSubmit = event => {
    event.preventDefault();

    this.save();
  };

  initEventListeners() {
    const { productForm, uploadImage, imageListContainer } = this.subElements;

    productForm.addEventListener('submit', this.onSubmit);
    uploadImage.addEventListener('click', this.uploadImage);

    imageListContainer.addEventListener('click', event => {
      if ('deleteHandle' in event.target.dataset) {
        event.target.closest('li').remove();
      }
    });
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}

import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

export default class ProductForm {
  element;
  subElements = {};
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  };
  constructor(productId) {
    this.productId = productId;
  }

  submit = event => {
    event.preventDefault();
    this.save();
  };

  async save() {
    const data = this.getFormData();

    try {
      const result = await fetchJson(`${process.env.BACKEND_URL}api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      this.dispatchEvent(result.id, 'success');
    } catch (error) {
      this.dispatchEvent('', 'error');
    }
  }

  dispatchEvent(id, status) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: { id, status } })
      : new CustomEvent('product-saved', { detail: { id, status } });

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
            Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
          },
          body: formData,
          referrer: 'it'
        });

        imageListContainer.firstElementChild.append(this.getImageItem(result.data.link, file.name));

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        fileInput.remove();
      }
    });

    fileInput.hidden = true;
    document.body.append(fileInput);

    fileInput.click();
  };

  getTemplate() {
    return `
      <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required
              id="title"
              value=""
              type="text"
              name="title"
              class="form-control"
              placeholder="Название товара">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required
            id="description"
            class="form-control"
            name="description"
            data-element="productDescription"
            placeholder="Описание товара"></textarea>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer">
          </div>
          <button data-element="uploadImage" type="button" class="button-primary-outline">
            <span>Загрузить</span>
          </button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
            ${this.createOptionsCategory()}
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required
              id="price"
              value=""
              type="number"
              name="price"
              class="form-control"
              placeholder="${this.defaultFormData.price}">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required
              id="discount"
              value=""
              type="number"
              name="discount"
              class="form-control"
              placeholder="${this.defaultFormData.discount}">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required
            id="quantity"
            value=""
            type="number"
            class="form-control"
            name="quantity"
            placeholder="${this.defaultFormData.quantity}">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select id="status" class="form-control" name="status">
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

  async render() {
    const categoriesPromise = fetchJson(
      `${process.env.BACKEND_URL}api/rest/categories?_sort=weight&_refs=subcategory`
    );

    const productPromise = this.productId
      ? fetchJson(`${process.env.BACKEND_URL}api/rest/products?id=${this.productId}`)
      : Promise.resolve([this.defaultFormData]);

    const [data, response] = await Promise.all([categoriesPromise, productPromise]);

    const [productData] = response;

    this.formData = productData;
    this.categories = data;

    this.createForm();

    if (this.formData) {
      this.setFormData();
      this.createImagesList();
      this.initEventListeners();
    }

    return this.element;
  }

  createForm() {
    const element = document.createElement('div');
    if (this.formData) {
      element.innerHTML = this.getTemplate();
    } else {
      console.error('not found page');
      element.innerHTML = `<div>
          <p>Извините, такой страницы не существует</p>
        </div>`;
    }

    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);
  }

  getFormData() {
    const { productForm, imageListContainer } = this.subElements;
    const excludedFields = ['images'];
    const formatToNumber = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));
    const getValue = field => productForm.querySelector(`[name=${field}]`).value;
    const values = {};

    for (const field of fields) {
      const value = getValue(field);

      values[field] = formatToNumber.includes(field) ? +value : value;
    }

    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

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

  setFormData() {
    const { productForm } = this.subElements;
    const excludedFields = ['images'];

    const fields = Object.keys(this.defaultFormData).filter(item => !excludedFields.includes(item));
    fields.forEach(item => {
      const element = productForm.querySelector(`#${item}`);

      element.value = this.formData[item] || this.defaultFormData[item];
    });
  }

  createOptionsCategory() {
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

  getSubElements(element) {
    const subElements = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const item of elements) {
      subElements[item.dataset.element] = item;
    }

    return subElements;
  }

  createImagesList() {
    const { imageListContainer } = this.subElements;
    const { images } = this.formData;

    const items = images.map(({ url, source }) => this.getImageItem(url, source));

    const sortableList = new SortableList({
      items
    });

    imageListContainer.append(sortableList.element);
  }

  getImageItem(url, name) {
    const wrapper = document.createElement('div');

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="/icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(name)}</span>
        </span>
        <button type="button">
          <img src="/icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;

    return wrapper.firstElementChild;
  }

  initEventListeners() {
    const { productForm, uploadImage, imageListContainer } = this.subElements;

    productForm.addEventListener('submit', this.submit);
    uploadImage.addEventListener('click', this.uploadImage);

    imageListContainer.addEventListener('click', event => {
      if ('deleteHandle' in event.target.dataset) {
        event.target.closest('li').remove();
      }
    });
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}

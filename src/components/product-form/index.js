import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  categories = [];
  defaultProducts = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0,
  };

  constructor (productId) {
    this.productId = productId;
  }

  async getCategoryRequest() {
    return await fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  async getProductRequest(id) {
    return await fetchJson(`${BACKEND_URL}/api/rest/products?id=${id}`);
  }

  renderFormLabel(label) {
    return `<label class="form-label">${label}</label>`;
  }

  renderCategorySelect(categories) {
    const categoryList = categories.reduce((memo, category) => {
      category.subcategories.map(item => {
        memo.push({
          id: item.id,
          title: `${category.title} > ${item.title}`,
        });
      });

      return memo;
    }, []);

    return `
      <select class="form-control" name="subcategory" id="subcategory">
        ${categoryList.map(item => `<option value=${item.id}>${item.title}</option>`).join('')}
      </select>
    `;
  }

  renderStatusSelect() {
    return `
      <select class="form-control" id="status" name="status">
        <option value="1">Активен</option>
        <option value="0">Неактивен</option>
      </select>
    `;
  }

  renderProductList(images) {
    const sortableListImages = new SortableList({
      items: images.map(item => this.getImageItem(item.url, item.source))
    });

    this.subElements.imageListContainer.append(sortableListImages.element);
  }

  getImageItem(url, name) {
    const wrapper = document.createElement('div');
    const path = escapeHtml(url);
    const imgName = escapeHtml(name);

    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="./src/components/product-form/icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${imgName}" src="${path}">
          <span>${imgName}</span>
        </span>
        <button type="button">
          <img src="./icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;

    return wrapper.firstElementChild;
  }

  renderInput(label, inputName, placeholder) {
    return `
      ${this.renderFormLabel(label)}
      <input required="" type="text" id=${inputName} name=${inputName} class="form-control" placeholder=${placeholder}>
    `;
  }

  renderFormButton(name, label) {
    return `
      <button type="submit" name=${name} class="button-primary-outline"  data-element=${name}>
        ${label}
      </button>
    `;
  }

  renderFrom() {
    const {categories, defaultProducts} = this;

    return `
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            ${this.renderInput('Название товара', 'title', 'Название товара')}
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          ${this.renderFormLabel('Описание')}
          <textarea required="" class="form-control" name="description" id="description" data-element="productDescription" placeholder="Описание товара"></textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          ${this.renderFormLabel('Фото')}
          <div data-element="imageListContainer"></div>
          ${this.renderFormButton('uploadImage', 'Загрузить')}
        </div>
        <div class="form-group form-group__half_left">
          ${this.renderFormLabel('Категория')}
          ${this.renderCategorySelect(categories)}
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            ${this.renderInput('Цена ($)', 'price', defaultProducts.price)}
          </fieldset>
          <fieldset>
            ${this.renderInput('Скидка ($)', 'discount', defaultProducts.discount)}
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          ${this.renderInput('Количество', 'quantity', defaultProducts.quantity)}
        </div>
        <div class="form-group form-group__part-half">
          ${this.renderFormLabel('Статус')}
          ${this.renderStatusSelect('status')}
        </div>
        <div class="form-buttons">
          ${this.renderFormButton('save', 'Сохранить товар')}
        </div>
      </form>
    `;
  }

  async render() {
    const {productId} = this;

    const categoriesPromise = this.getCategoryRequest();
    const dataProductPromise = productId
         ? this.getProductRequest(productId)
         : [this.defaultProducts];

    const [categories, productResponse] = await Promise.all([categoriesPromise, dataProductPromise]);
    const [productData] = productResponse;

    this.categories = categories;
    this.products = productData;

    const element = document.createElement('div');
    element.innerHTML = this.renderFrom();
    this.element = element.firstElementChild;
    this.subElements = this.getSubElements(element);

    if (this.products) {
      this.setFormData();
      this.renderProductList(this.products.images);
      this.handlersForm();
    }

    return this.element;
  }

  getFormData() {
    const {productForm, imageListContainer} = this.subElements;
    const numberFields = ['price', 'discount', 'quantity', 'status'];
    const fields = Object.keys(this.defaultProducts).filter(item => !['images'].includes(item));

    for (const field of fields) {
      const element = productForm.querySelector(`#${field}`);

      if (!numberFields.includes(element)) {
        element.value = this.products[field];
      } else {
        Number(element).value = this.products[field] || this.defaultProducts[field];
      }
    }

    const imagesHTMLCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    this.products.id = this.productId;
    this.products.images = [];

    for (const image of imagesHTMLCollection) {
      this.products.images.push({
        url: image.src,
        source: image.alt
      });
    }

    return this.products;
  }

  setFormData() {
    const {productForm} = this.subElements;
    const {defaultProducts} = this;
    const fields = Object.keys(defaultProducts).filter(item => !['images'].includes(item));

    for (const field of fields) {
      const element = productForm.querySelector(`#${field}`);

      element.value = this.products[field] || defaultProducts[field];
    }
  }

  getSubElements(element) {
    const elements = element.querySelectorAll('[data-element]');

    return [...elements].reduce((accum, subElement) => {
       accum[subElement.dataset.element] = subElement;

       return accum;
    }, {});
  }

  handlersForm() {
    const {imageListContainer, uploadImage, productForm} = this.subElements;

    imageListContainer.addEventListener('click', this.handleRemoveImage);
    uploadImage.addEventListener('click', this.uploadImage);
    productForm.addEventListener('submit', this.onSubmit);
  }

  handleRemoveImage = event => {
    if ('deleteHandle' in event.target.dataset) {
      event.target.closest('li').remove();
    }
 }

 async save() {
    const product = this.getFormData();

    const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
      method: this.productId ? 'PATCH' : 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    });

    this.dispatchEvent(result.id);
  }

  uploadImage = () => {
    const fileInput = document.createElement('input');

    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = async () => {
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
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData
        });

        imageListContainer.append(this.getImageItem(result.data.link, file.name));

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        fileInput.remove();
      }
    };

    fileInput.hidden = true;
    document.body.append(fileInput);

    fileInput.click();
  };

  onSubmit = event => {
    event.preventDefault();

    this.save();
  };

  dispatchEvent(id) {
    const event = this.productId
        ? new CustomEvent('product-updated', {detail: id})
        : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElement = {};
  }
}

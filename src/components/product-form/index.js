import SortableList from '../sortable-list/index.js';
import Notification from '../notification/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

import { NOTIFICATION_TYPE, PRODUCTS_REST_URL, CATEGORIES_REST_URL, BACKEND_URL, IMGUR_UPLOAD_URL, IMGUR_CLIENT_ID } from '../../constants';

export default class ProductForm {
  element;
  subElements = {};

  onUploadImage = () => {
    let fileInput = document.getElementById('imageUpload');

    if (!fileInput) {
      fileInput = document.createElement('input');
      fileInput.id = 'imageUpload';
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.hidden = true;
      fileInput.addEventListener('change', this.onChange);
      this.element.append(fileInput);
    }

    fileInput.click();
  }

  onChange = event => {
    const [file] = event.target.files;

    if (!file) {
      return;
    }

    this.disableImageUpload();

    const formData = new FormData();
    formData.append('image', file);

    fetchJson(IMGUR_UPLOAD_URL, {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
      },
      body: formData,
      referrer: ''
    })
      .then(response => this.addImage({url: response.data.link, source: file.name}))
      .catch(error => new Notification(error.message, {type: NOTIFICATION_TYPE.error}).show())
      .finally(() => this.enableImageUpload());
  }

  onSubmit = event => {
    event.preventDefault();

    this.save()
      .then(() => new Notification('Товар сохранен!', {type: NOTIFICATION_TYPE.success}).show())
      .catch(error => new Notification(error.message, {type: NOTIFICATION_TYPE.error}).show());
  }

  constructor(productId) {
    this.productId = productId;
    this.defaultData = {
      title: '',
      description: '',
      price: 100,
      quantity: 1,
      discount: 0,
      status: 1,
      images: []
    };
    this.render()
      .catch(error => new Notification(error.message, {type: NOTIFICATION_TYPE.error}).show());
  }

  async loadCategories() {
    const url = new URL(CATEGORIES_REST_URL, BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');
    return await fetchJson(url);
  }

  async loadProduct(id) {
    const url = new URL(PRODUCTS_REST_URL, BACKEND_URL);
    url.searchParams.set('id', id);
    return await fetchJson(url);
  }

  async loadData() {
    const [categories, products] = await Promise.all([
      this.loadCategories(),
      this.productId ? this.loadProduct(this.productId) : Promise.resolve([this.defaultData])
    ]);

    this.setCategories(categories);

    const [product] = products;
    this.setProductData(product);
  }

  async render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.template;
    this.element = this.element.firstElementChild;
    this.subElements = this.getSubElements(this.element);

    await this.loadData();

    this.initEventListeners();
  }

  async save() {
    const [method, eventType] = this.productId ? ['PATCH', 'product-updated'] : ['PUT', 'product-saved'];

    const response = await fetchJson(new URL(PRODUCTS_REST_URL, BACKEND_URL), {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.getProductData())
    });

    this.element.dispatchEvent(new CustomEvent(eventType, {
      bubbles: true,
      detail: {
        response: response
      }
    }));
  }

  initEventListeners() {
    this.subElements.productForm.elements.uploadImage.addEventListener('click', this.onUploadImage);
    this.subElements.productForm.addEventListener('submit', this.onSubmit);
  }

  get template() {
    return `
      <div class='product-form'>
        <form data-element='productForm' class='form-grid'>
          <div class='form-group form-group__half_left'>
            <fieldset>
              <label class='form-label'>Название товара</label>
              <input required='' type='text' name='title' id='title' class='form-control' placeholder='Название товара'>
            </fieldset>
          </div>
          <div class='form-group form-group__wide'>
            <label class='form-label'>Описание</label>
            <textarea required='' class='form-control' name='description' id='description' placeholder='Описание товара'></textarea>
          </div>
          <div class='form-group form-group__wide'>
            <label class='form-label'>Фото</label>
            <div data-element='imageList'></div>
            <button type='button' name='uploadImage' class='button-primary-outline fit-content'><span>Загрузить</span></button>
          </div>
          <div class='form-group form-group__half_left'>
            <label class='form-label'>Категория</label>
            <select class='form-control' name='subcategory' id='subcategory'></select>
          </div>
          <div class='form-group form-group__half_left form-group__two-col'>
            <fieldset>
              <label class='form-label'>Цена ($)</label>
              <input required='' type='number' name='price' id='price' class='form-control' placeholder='100'>
            </fieldset>
            <fieldset>
              <label class='form-label'>Скидка ($)</label>
              <input required='' type='number' name='discount' id='discount' class='form-control' placeholder='0'>
            </fieldset>
          </div>
          <div class='form-group form-group__part-half'>
            <label class='form-label'>Количество</label>
            <input required='' type='number' class='form-control' name='quantity' id='quantity' placeholder='1'>
          </div>
          <div class='form-group form-group__part-half'>
            <label class='form-label'>Статус</label>
            <select class='form-control' name='status' id='status'>
              <option value='1'>Активен</option>
              <option value='0'>Неактивен</option>
            </select>
          </div>
          <div class='form-buttons'>
            <button type='submit' name='save' class='button-primary-outline'>
              Сохранить товар
            </button>
          </div>
        </form>
      </div>
    `;
  }

  setCategories(data) {
    const categories = [];

    data.forEach(category => {
      category.subcategories.forEach(subCategory => {
        categories.push({
          id: subCategory.id,
          text: category.title + ' > ' + subCategory.title
        });
      });
    });

    this.subElements.productForm.elements.subcategory.innerHTML = categories.map(({id, text}) => {
      return `
        <option value="${id}">${escapeHtml(text)}</option>
      `;
    }).join('');
  }

  createImageList(images) {
    const sortableList = new SortableList({
      items: images.map(image => this.createImageListItem(image))
    });
    return sortableList.element;
  }

  createImageListItem({url, source}) {
    const element = document.createElement('div');

    element.innerHTML = `
      <li class='products-edit__imagelist-item sortable-list__item'>
        <input type="hidden" name="url" value="${url}">
        <input type="hidden" name="source" value="${source}">
        <span>
           <img src="/icon-grab.svg" data-grab-handle="" alt="grab">
           <img class="sortable-table__cell-img" alt="Image" src="${url}"><span>${source}</span>
        </span>
        <button type="button">
           <img src="/icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;

    return element.firstElementChild;
  }

  disableImageUpload() {
    this.subElements.productForm.elements.uploadImage.classList.add('is-loading');
    this.subElements.productForm.elements.uploadImage.disabled = true;
  }

  enableImageUpload() {
    this.subElements.productForm.elements.uploadImage.classList.remove("is-loading");
    this.subElements.productForm.elements.uploadImage.disabled = false;
  }

  addImage(image) {
    const images = this.getImages();
    images.push(image);
    this.setImages(images);
  }

  getImages() {
    const images = [];

    this.subElements.imageList.querySelectorAll('.sortable-list__item').forEach(element => {
      const url = element.querySelector('input[name="url"]').value;
      const source = element.querySelector('input[name="source"]').value;
      images.push({url, source});
    });

    return images;
  }

  setImages(images) {
    this.subElements.imageList.replaceChildren(this.createImageList(images));
  }

  getSubElements(parent) {
    const result = {};

    for (const subElement of parent.querySelectorAll('[data-element]')) {
      result[subElement.dataset.element] = subElement;
    }
    return result;
  }

  getProductData() {
    const elements = this.subElements.productForm.elements;

    const product = {
      title: elements.title.value,
      description: elements.description.value,
      subcategory: elements.subcategory.value,
      price: Number(elements.price.value),
      quantity: Number(elements.quantity.value),
      discount: Number(elements.discount.value),
      status: Number(elements.status.value),
      images: this.getImages()
    };

    if (this.productId) {
      product.id = this.productId;
    }

    return product;
  }

  setProductData(product) {
    const elements = this.subElements.productForm.elements;

    elements.title.value = product.title;
    elements.description.value = product.description;
    if (product.subcategory) {
      elements.subcategory.value = product.subcategory;
    }
    elements.price.value = product.price;
    elements.quantity.value = product.quantity;
    elements.discount.value = product.discount;
    elements.status.value = product.status;
    this.setImages(product.images);
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}

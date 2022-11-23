import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';
import SortableList from '../sortable-list';
import { getSubElements } from '../../utils/helpers';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = process.env.BACKEND_URL;

export default class ProductForm {
  element
  subElements = {}
  defaultFormData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  }

  constructor(productId) {
    this.productId = productId;
  }

  async render() {
    const categories = await fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
    let product = null;
    if (this.productId){
      product = await fetchJson(`${BACKEND_URL}/api/rest/products?id=${this.productId}`)
      if (!product || product.length === 0){
        this.element.innerHTML = 'Товар ненайден'
        return this.element;
      }
      product = product[0]
    }

    this.formData = product ?? this.defaultFormData;
    this.categories = categories;

    this.renderForm();
    this.setData();
    this.initEventListeners();
    this.getImages();
    return this.element;
  }

  renderForm() {
    const elem = document.createElement('div');
    elem.innerHTML = this.template();
    this.element = elem.firstElementChild;
    this.subElements = getSubElements(this.element)
  }

  template() {
    return `
      <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required id="title" value="" type="text" name="title" class="form-control" placeholder="Название товара">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required id="description" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer"></div>
          <button data-element="uploadImage" type="button" class="button-primary-outline"><span>Загрузить</span></button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
            ${this.renderCategories()}
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required id="price" value="" type="number" name="price" class="form-control" placeholder="${this.defaultFormData.price}">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required id="discount" value="" type="number" name="discount" class="form-control" placeholder="${this.defaultFormData.discount}">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required id="quantity" value="" type="number" class="form-control" name="quantity" placeholder="${this.defaultFormData.quantity}">
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
            ${this.productId ? "Сохранить" : "Добавить"} товар
          </button>
        </div>
      </form>
    </div>
    `;
  }

  setData() {
    const form = this.subElements.productForm;
    const fields = Object.keys(this.defaultFormData).filter(item => item !== 'images');
    fields.forEach(item => {
      const element = form.querySelector(`#${item}`);
      element.value = this.formData[item] || this.defaultFormData[item];
    });
  }

  initEventListeners() {
    this.subElements.productForm.addEventListener('submit', event => { event.preventDefault(); this.save(); });
    this.subElements.uploadImage.addEventListener('click', this.uploadImage);
  }

  async save() {
    const product = this.getData();
    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(product)
      });

      this.dispatchEvent(result.id);
    } catch (error) {
      console.error("Couldn't save data", error, product);
    }
  }

  uploadImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    document.body.append(input);
    input.onclick = () => {
      document.body.onfocus = function () { setTimeout(() => {
        input.remove();
        document.body.onfocus = null;
      }, 500);};
    };
    input.click();
    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;

        formData.append('image', file);
        uploadImage.disabled = true;
        uploadImage.classList.add('is-loading');

        const result = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData,
        });

        imageListContainer.append(this.getImage(result.data.link, file.name));
        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;
        input.remove();
      }
    });
  };

  getData() {
    const { productForm, imageListContainer } = this.subElements;
    const intValue = ['price', 'quantity', 'discount', 'status'];
    const fields = Object.keys(this.defaultFormData).filter(item => item !== 'images');
    const images = imageListContainer.querySelectorAll('.sortable-table__cell-img');
    const values = {};

    for (const field of fields) {
      const value = productForm.querySelector(`[name=${field}]`).value;
      values[field] = intValue.includes(field)
        ? parseInt(value)
        : value;
    }

    values.images = [];
    values.id = this.productId;

    for (const image of images) {
      values.images.push({
        url: image.src,
        source: image.alt
      });
    }
    return values;
  }

  dispatchEvent(id) {
    const event = this.productId
      ? new CustomEvent('product-updated', { detail: id })
      : new CustomEvent('product-saved');

    this.element.dispatchEvent(event);
  }

  renderCategories() {
    const elem = document.createElement('div');
    elem.innerHTML = `<select class="form-control" id="subcategory" name="subcategory"></select>`;
    const select = elem.firstElementChild;

    for (const category of this.categories) {
      for (const child of category.subcategories) {
        select.append(new Option(`${category.title} > ${child.title}`, child.id));
      }
    }
    return select.outerHTML;
  }

  getImages() {
    let items = this.formData.images.map(item => {
      return this.getImage(item.url, item.source);
    });
    const sortableList = new SortableList({ items });
    this.subElements.imageListContainer.append(sortableList.element)
  }

  getImage(url, name) {
    const elem = document.createElement('div');
    elem.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="/assets/icons/icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}">
          <span>${escapeHtml(name)}</span>
        </span>
        <button type="button">
          <img src="/assets/icons/icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;
    return elem.firstElementChild;
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove() {
    this.element?.remove();
  }
}

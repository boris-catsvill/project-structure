import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';
import process from 'process';

export default class ProductForm {
  onSubmit = (event) => {
    event.preventDefault();
    this.save();
  }
  onClick = (event) => {
    if (event.target.dataset.deleteHandle !== undefined) {
      const parent = event.target.closest(".products-edit__imagelist-item");
      if (parent) {
        parent.remove();
      }
    }
  }

  constructor (productId) {
    this.productId = productId;
  }

  getImageList() {
    const urls = this.subElements.productForm.elements.url;
    const sources = this.subElements.productForm.elements.source;
    const result = [];
    if (urls && sources) {
      for (let i = 0; i < urls.length; i++) {
        result.push({
          source: sources[i].value,
          url: urls[i].value
        });
      }
    }
    return result;
  }
  async save() {
    const url = new URL('api/rest/products', process.env.BACKEND_URL);
    const responce = await fetch(url, {
      method: this.productId ? "PATCH" : "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(this.getFormData())
    });
    const data = await responce.json();
    const eventName = this.productId ? 'product-updated' : 'product-saved';
    this.element.dispatchEvent(new CustomEvent(eventName, {
      detail: {
        id: data.id
      }
    }));
  }
  async loadProducs() {
    const url = new URL('/api/rest/products', process.env.BACKEND_URL);
    url.searchParams.append('id', this.productId);
    return await fetchJson(url);
  }
  async loadCategories() {
    const url = new URL('/api/rest/categories', process.env.BACKEND_URL);
    url.searchParams.append('_sort', 'weight');
    url.searchParams.append('_refs', 'subcategory');
    return await fetchJson(url);
  }

  async render () {
    const defaultProduct = {
      title: '',
      description: '',
      price: 100,
      discount: 0,
      quantity: 1,
      status: 0
    };
    const categoriesPromise = this.loadCategories();
    const productPromise = this.productId ? this.loadProducs().then(products => products[0]) : defaultProduct;
    const [categories, product] = await Promise.all([categoriesPromise, productPromise]);
    const div = document.createElement('div');
    div.innerHTML = this.getTemplate(product, categories);
    this.element = div.firstElementChild;
    this.subElements = {};
    const elements = this.element.querySelectorAll('[data-element]');
    for (const elem of elements) {
      this.subElements[elem.dataset.element] = elem;
    }
    this.initForm(product);
    this.renderImageList(product.images);
    this.element.addEventListener("click", this.onClick);
    this.subElements.productForm.addEventListener('submit', this.onSubmit);
    const uploadImage = this.subElements.productForm.uploadImage;
    if (uploadImage) {
      uploadImage.onclick = () => this.uploadImage();
    }
    return this.element;
  }
  uploadImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append("image", file);
      this.subElements.productForm.uploadImage.classList.toggle('is-loading');
      let responceData;
      try {
        const responce = await fetch("https://api.imgur.com/3/image", {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`
          },
          referrer: '',
          body: formData
        });
        responceData = (await responce.json()).data;
      } finally {
        this.subElements.productForm.uploadImage.classList.toggle('is-loading');
      }
      const link = responceData.link;
      const name = file.name;
      const images = this.getImageList();
      images.push({ source: name, url: link });
      input.remove();
      this.renderImageList(images);
    };
    input.hidden = true;
    document.body.append(input);
    input.click();
  }
  initForm(product) {
    const form = this.subElements.productForm;
    form.elements.title.value = product.title;
    form.elements.description.value = product.description;
    form.elements.price.value = product.price;
    form.elements.discount.value = product.discount;
    form.elements.quantity.value = product.quantity;
    form.elements.status.value = product.status;
  }
  getFormData() {
    const form = this.subElements.productForm;
    return {
      id: this.productId,
      subcategory: form.elements.subcategory.value,
      title: form.elements.title.value,
      description: form.elements.description.value,
      price: parseInt(form.elements.price.value),
      discount: parseInt(form.elements.discount.value),
      quantity: parseInt(form.elements.quantity.value),
      status: parseInt(form.elements.status.value),
      images: this.getImageList()
    };
  }
  renderImageList(images) {
    if (images) {
      this.subElements.imageListContainer.innerHTML = this.getImageListTemplate(images);
    }
  }
  getTemplate(product, categories) {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" type="text" id="title" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer"></div>
            <button type="button" name="uploadImage" id="uploadImage" class="button-primary-outline fit-content">
              <span>Загрузить</span>
            </button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select id="subcategory" class="form-control" name="subcategory">
              ${this.getSubcategoryOptions(categories)}
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required="" type="number" id="price" name="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" type="number" id="discount" name="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" id="quantity" name="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" id="status" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" id="save" name="save" class="button-primary-outline">
              ${product ? 'Сохранить товар' : 'Добавить товар'}
            </button>
          </div>
        </form>
      </div>
    `;
  }
  getSubcategoryOptions(categories) {
    return categories.map(category => {
      return category.subcategories.map(subcategory => {
        const text = escapeHtml(`${category.title} > ${subcategory.title}`);
        return `<option value="kormlenie-i-gigiena">${text}</option>`; 
      });
    });
  }
  getImageListTemplate(items) {
    return `
      <ul class="sortable-list">
        ${items.map(item => this.getImageItemTemplate(item)).join('')}
      </ul>
    `;
  }
  getImageItemTemplate(item) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${item.url}">
        <input type="hidden" name="source" value="${item.source}">
        <span>
          <img src="/assets/icons/icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${item.url}">
          <span>${item.source}</span>
        </span>
        <button type="button">
          <img src="/assets/icons/icon-trash.svg" data-delete-handle alt="delete">
        </button>
      </li>
    `;
  }
  remove() {
    if (this.element) {
      this.element.remove();
    }
  }
  destroy() {
    this.remove();
    this.element = null;
  }
}

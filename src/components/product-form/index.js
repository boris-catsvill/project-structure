import SortableList from '../sortable-list'

import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

export default class ProductForm {
  product;
  defaultProduct = {
    title: '',
    description: '',
    images: [],
    subcategory: '',
    status: 0,
    quantity: 1,
    price: 100,
    discount: 0,
  }
  categories = [];
  element;
  subElements = {};
  
  onSubmit = event => {
    event.preventDefault();
    this.save();
  };
  
  onUploadImage = () => {
    const fileInput = document.createElement('input');
    fileInput.hidden = true;
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.addEventListener('change', async () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const { uploadImage, imageListContainer } = this.subElements;
        const [imageList] = imageListContainer.children;

        formData.append('image', file);
        
        uploadImage.classList.add('is-loading');
        uploadImage.disabled = true;

        const result = await fetchJson(new URL('https://api.imgur.com/3/image'), {
          method: 'POST',
          headers: {
            Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}`,
          },
          body: formData,
        });

        imageList.append(this.createImageListItem(result.data.link, file.name));

        uploadImage.classList.remove('is-loading');
        uploadImage.disabled = false;

        fileInput.remove();
      }
    });

    document.body.append(fileInput);
    fileInput.click();
  };

  onDeleteImage = event => {
    if ('deleteHandle' in event.target.dataset) {
      event.target.closest('li').remove();
    }
  };

  constructor (productId) {
    this.productId = productId;
  }

  async render() {
    await this.loadData();

    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.product ? this.template : this.emptyTemplate;
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();

    if (this.product) {
      this.setFormData();
      this.initEventListners();
    }
    
    return this.element;
  }

  async loadData() {
    const [categories, [product]] = await Promise.all([this.loadCategories(), this.loadProducts(this.productId)]);
    this.categories = categories;
    this.product = product;
  }

  loadProducts(id) {
    if (!id) return [this.defaultProduct];
    const url = new URL('/api/rest/products', process.env.BACKEND_URL);
    url.searchParams.set('id', id);
    return fetchJson(url);
  }

  loadCategories() {
    const url = new URL('/api/rest/categories', process.env.BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');
    return fetchJson(url);
  }

  get template() {
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
            <textarea id="description" required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer"></div>
            <button type="button" name="uploadImage" class="button-primary-outline fit-content" data-element="uploadImage"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select id="subcategory" class="form-control" name="subcategory">
              ${this.getSubcategoryOptions(this.categories)}
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input id="price" required="" type="number" name="price" class="form-control" placeholder="${this.defaultProduct.price}">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input id="discount" required="" type="number" name="discount" class="form-control" placeholder="${this.defaultProduct.discount}">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input id="quantity" required="" type="number" class="form-control" name="quantity" placeholder="${this.defaultProduct.quantity}">
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

  get emptyTemplate() {
    return `
      <div class="product-form">
        <h1 class="page-title">Страница не найдена</h1>
        <p>Извините, данный товар не существует</p>
      </div>
    `;
  }

  createImageList(images = []) {
    const sortableList = new SortableList({
      items: images.map(({ url, source }) => this.createImageListItem(url, source)),
    });
    return sortableList.element;
  }

  createImageListItem(url, source) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${url}">
        <input type="hidden" name="source" value="${escapeHtml(source)}">
        <span>
          <img src="/icons/icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${url}">
          <span>${escapeHtml(source)}</span>
        </span>
        <button type="button">
          <img src="/icons/icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;
    return wrapper.firstElementChild;
  }

  getSubcategoryOptions(categories = []) {
    const options = [];
    for (const category of categories) {
      for (const subcategory of category.subcategories) {
        const option = new Option(`${category.title} > ${subcategory.title}`, subcategory.id);
        options.push(option.outerHTML);
      }
    }
    return options.join('');
  }

  async save() {
    const product = this.getFormData();

    try {
      const result = await fetchJson(new URL('/api/rest/products', process.env.BACKEND_URL), {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      });
  
      this.dispatchEvent(result.id);
    } catch(error) {
      console.error(error);
    }
  }
  
  getFields() {
    const excludes = ['images'];
    return Object.keys(this.defaultProduct).filter(item => !excludes.includes(item));
  }
  
  setFormData() {
    const { productForm, imageListContainer } = this.subElements;

    const imageList = this.createImageList(this.product.images);
    imageListContainer.innerHTML = '';
    imageListContainer.append(imageList);

    this.getFields().forEach(item => {
      const element = productForm.querySelector(`#${item}`);
      element.value = this.product[item] || this.defaultProduct[item];
    });
  }

  getFormData() {
    const { productForm } = this.subElements;
    const numbers = ['status', 'quantity', 'price', 'discount'];
    const values = {};

    if (this.productId) values.id = this.productId;

    this.getFields().forEach(item => {
      const element = productForm.querySelector(`#${item}`);
      values[item] = numbers.includes(item) ? Number(element.value) : element.value;
    });

    values.images = [...productForm.querySelectorAll('.products-edit__imagelist-item')].map(item => ({
      url: item.querySelector(`[name="url"]`).value,
      source: item.querySelector(`[name="source"]`).value,
    }));
    
    return values;
  }
  
  dispatchEvent(id) {
    const eventType = this.productId ? 'product-updated' : 'product-saved';
    const event = new CustomEvent(eventType, { detail: id, bubbles: true });
    this.element.dispatchEvent(event);
  }

  initEventListners() {
    const { productForm, uploadImage, imageListContainer } =  this.subElements;
    productForm.addEventListener('submit', this.onSubmit);
    uploadImage.addEventListener('pointerdown', this.onUploadImage);
    imageListContainer.addEventListener('pointerdown', this.onDeleteImage)
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    return [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}

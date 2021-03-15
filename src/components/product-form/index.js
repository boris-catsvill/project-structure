import SortableList from '../2-sortable-list/index.js';
import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  constructor(productId) {
    this.productId = productId;
  }

  async render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    wrapper.remove();

    const elements = this.element.querySelectorAll('[data-element]');
    
    this.subElements = [...elements].reduce((accum, subElement) => {
      accum[subElement.dataset.element] = subElement;
      return accum;
    }, {});

    await this.loadCategoriesData();
    await this.loadProductData();
    this.initEventListeners();

    return this.element;
  }

  async loadCategoriesData() {
    this.urlCategories = new URL('api/rest/categories', BACKEND_URL);
    this.urlCategories.searchParams.set('_sort', 'weight');
    this.urlCategories.searchParams.set('_refs', 'subcategory');

    this.dataCategories = await fetchJson(this.urlCategories);

    const arraySubCategories = [];

    this.dataCategories.forEach(item => {
      item.subcategories.forEach(subcategory => {
        arraySubCategories.push(
          `<option value="${subcategory.id}">${item.title + ' > ' + subcategory.title}</option>`
        );
      });
    });

    this.subElements.productForm.querySelector('#subcategory').innerHTML = arraySubCategories.join('');
  }

  async loadProductData() {
    if (!this.productId) return;

    this.urlProduct = new URL('api/rest/products', BACKEND_URL);
    this.urlProduct.searchParams.set('id', this.productId);

    this.dataProduct = await fetchJson(this.urlProduct);
    this.dataProduct = this.dataProduct[0];

    const formControls = this.subElements.productForm.querySelectorAll('.form-control');

    for (const item of formControls) {
      item.value = this.dataProduct[item.name];
    }

    const imagesProduct = this.dataProduct.images;

    const sortableList = new SortableList({
      items: imagesProduct.map(item => {
        const element = document.createElement('li');
        element.classList.add('products-edit__imagelist-item');
  
        element.innerHTML = `
          <input type="hidden" name="url" value="${item.url}">
          <input type="hidden" name="source" value="${item.source}">
          <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="${item.url}">
            <span>${item.source}</span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
        `
        return element;
      })
    });

    this.subElements.imageListContainer.append(sortableList.element);
  }

  initEventListeners() {
    // this.subElements.productForm.addEventListener('pointerdown', this.deleteImage);
    this.subElements.productForm.addEventListener('pointerdown', this.uploadImage);
    this.subElements.productForm.addEventListener('submit', this.submitForm);
  }

  deleteImage = (evt) => { 
    const imagesDelete = this.element.querySelectorAll('img[data-delete-handle]');
    if ([...imagesDelete].includes(evt.target)) evt.target.closest('li').remove();
  }

  uploadImage = (evt) => { 
    const uploadButton = this.element.querySelector('button[name="uploadImage"]');
    
    if (evt.target !== uploadButton) return; 
      
    const uploadInput = document.createElement(`input`);
    uploadInput.type = 'file';
    uploadInput.accept = 'image/*';
    uploadInput.hidden = true;

    uploadInput.addEventListener('change', async () => {
      const [file] = uploadInput.files;
      const result = await this.uploadFile(file);
      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.getImageTemplate(result.data.link, file.name);
      
      this.subElements
        .imageListContainer
        .firstElementChild
        .append(wrapper.firstElementChild);
      
      wrapper.remove();
    });

    this.element.append(uploadInput);  

    uploadInput.click();
  }

  async uploadFile(file) { 
    const form = new FormData();
    form.append('image', file);

    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}` 
      },
      body: form
    });

    const result = await response.json();
    
    return result;
  }

  submitForm = async (evt) => { 
    evt.preventDefault();
    const formValues = {};

    if (this.productId) formValues.id = this.productId;

    const formControls = this.subElements.productForm.querySelectorAll('.form-control');

    for (const item of formControls) {
      if (parseInt(item.value) || item.value === '0') {
        formValues[item.id] = parseInt(item.value);
      } else { 
        formValues[item.id] = item.value;
      }
    }

    const imagesList = this.subElements.imageListContainer.querySelectorAll('li');

    const images = [...imagesList].map(item => {
      return {
        source: item.querySelector('input[name="source"]').value,
        url: item.querySelector('input[name="url"]').value
      };
    });
    
    formValues.images = images;
    
    try {
      const response = await fetch('https://course-js.javascript.ru/api/rest/products', {
      method: (this.productId) ? 'PATCH' : 'PUT',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formValues)
      });

      const result = await response.json();
      console.log(result);

      await this.save();

    } catch (err) {
      console.log('Ошибка ', err);
    }
  }
  
  async save() { 
    const productUpdate = new CustomEvent('product-updated', { bubbles: true });
    const productSaved = new CustomEvent('product-saved', { bubbles: true });

    this.productId
      ? this.element.dispatchEvent(productUpdate)
      : this.element.dispatchEvent(productSaved);
  }

  getTemplate() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          ${this.getTitle()}
          ${this.getDescription()}
          ${this.getPhoto()}
          ${this.getCategories()}
          ${this.getAddCharachters()}
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
      </div>
    `;
  }

  getTitle() {
    return `
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" id="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
    `;
  }

  getDescription() {
    return `
      <div class="form-group form-group__wide" >
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
    `;
  }

  getPhoto() {
    return `
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
        </div>
        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
    `;
  }

  getCategories() {
    return `
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" id="subcategory" name="subcategory"></select>
      </div>
    `;
  }

  getAddCharachters() {
    return `
    <div class="form-group form-group__half_left form-group__two-col">
      <fieldset>
        <label class="form-label">Цена ($)</label>
        <input required="" type="number" name="price" id="price" class="form-control" placeholder="100">
      </fieldset>
      <fieldset>
        <label class="form-label">Скидка ($)</label>
        <input required="" type="number" name="discount" id="discount" class="form-control" placeholder="0">
      </fieldset>
    </div>
    <div class="form-group form-group__part-half">
      <label class="form-label">Количество</label>
      <input required="" type="number" class="form-control" name="quantity" id="quantity" placeholder="1">
    </div>
    <div class="form-group form-group__part-half">
      <label class="form-label">Статус</label>
      <select class="form-control" name="status" id="status">
        <option value="1">Активен</option>
        <option value="0">Неактивен</option>
      </select>
    </div>
    `;
  }

  remove() { 
    this.element.remove();
  }

  destroy() { 
    this.remove();
  }
}

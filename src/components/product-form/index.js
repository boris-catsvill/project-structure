import SortableList from '../sortable-list';
import escapeHtml from '../../utils/escape-html';
import fetchJson from '../../utils/fetch-json';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {

  sortableList;
  subElements = {};
  defaultForm = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: '',
    images: '',
    price: 0,
    discount: 0
  };

  onSubmit = (event) => {
    event.preventDefault();

    this.save();

  }


  onUploadImage = () => {
    const inputFile = document.createElement('input');

    const {uploadImage, imageListContainer} = this.subElements;

    inputFile.type = 'file';
    inputFile.accept = 'image/*';

    inputFile.addEventListener('change', async () => {
      const [file] = inputFile.files;
      console.log(file);
      if (file) {

        const formData = new FormData();
        formData.append('image', file);

        uploadImage.disabled = true;
        uploadImage.classList.add('is-loading');

        const responce = await fetchJson('https://api.imgur.com/3/image', {
          method: 'POST',
          body: formData,

          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },

          referrer: ''
        });
        
      
        this.sortableList.addItem(this.getImage(responce.data.link, file.name));
        console.log(this.subElements)

        // раскоментить при работе без SortableList
        // const newImage = this.getImage(responce.data.link, file.name);
        // imageListContainer.firstElementChild.append(newImage);

        uploadImage.disabled = false;
        uploadImage.classList.remove('is-loading');
        
        inputFile.remove();

      }
    });

    // для корректной работы в IE
    inputFile.hidden = true;
    document.body.appendChild(inputFile);
    inputFile.click();
  }


  onDelete = (event) => {
    if ('deleteHandle' in event.target.dataset) {
      console.log('test');
      event.target.closest('li').remove();
    }
  }

  constructor (productId = '') {
    this.productId = productId;
  }

  async render () {

    const categoriesPromise = this.loadCategoriesList(); 
    // присвоили промис в переменную 
    console.log(categoriesPromise);
    const productsPromise = this.productId ? 
      this.loadProducts(this.productId) : Promise.resolve([this.defaultForm]);
    const promiseProductsCategories = await Promise.all([categoriesPromise, productsPromise]);
    // ждем результаты промиса, await ждет результат промиса, он ничего не вызывает.
    console.log(promiseProductsCategories);
    const [categories, productsResponse] = promiseProductsCategories;

    const [products] = productsResponse;

    this.dataForm = products;
    this.dataCategories = categories;

    const element = document.createElement('div');

    element.innerHTML = this.getTemplate();
    this.element = element.firstElementChild;

    this.subElements = this.getSubElements();

    this.setData();
    this.initEventListeners();
  }

  async loadCategoriesList() {
    const url = new URL('api/rest/categories', BACKEND_URL);
    url.searchParams.set('_sort', 'weight');
    url.searchParams.set('_refs', 'subcategory');
    return await fetchJson(url);
  }

  async loadProducts(id) {
    const url = new URL('api/rest/products', BACKEND_URL);
    url.searchParams.set('id', id);
    return await fetchJson(url);
  }

  setData() {
    const formData = this.element.querySelector('[data-element="productForm"]');
 
    const allowedFields = Object.keys(this.defaultForm).filter((field) => field !== 'images');

    for (const field of allowedFields) {
      const name = formData.querySelector(`[name="${field}"]`);
      if (name !== null) {
        name.value = this.dataForm[field] || this.defaultForm[field];
      }
    }

    this.getImageContainer();
  }


  async save () {
    const data = this.getData();

    try {
      const responce = await fetch(`${BACKEND_URL}/api/rest/products`, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
      });

      this.dispatchEvent({
        message: 'Товар сохранен',
        status: 'success'
      });
  
    } catch (e) {
      this.dispatchEvent({
        message: e.message,
        status: 'error'
      });
    }
  }


  dispatchEvent(detail) {
    this.element.dispatchEvent(new CustomEvent('notification-message', {
      bubbles: true,
      detail,
    }))
  }

  getData() {
    const {productForm, imageListContainer} = this.subElements;
    const allowedFields = Object.keys(this.defaultForm).filter((field) => field !== 'images');
    const numberFields = ['price', 'discount', 'status', 'quantity'];

    const getValue = (field) => productForm.querySelector(`[name=${field}]`).value;
    // в value могут засунуть скрипт, разве не нужен escapeHtml?
    const data = {};
    

    for (const field of allowedFields) {
      const value = getValue(field);
      console.log(value);
      data[field] = numberFields.includes(field) ?
        parseInt(value) : value;
    } 


    const imageCollection = imageListContainer.querySelectorAll('.sortable-table__cell-img');

    data.images = [];
    
    data.id = this.productId;

    for (const image of imageCollection) {
      data.images.push({
        url: image.src,
        source: image.alt,
      });
    }

    return data;
  }


  getSubElements() {

    const elements = this.element.querySelectorAll('[data-element]');

    for (const item of elements) {
      this.subElements[item.dataset.element] = item;
    }

    return this.subElements;

  }

  initEventListeners() {
    const {productForm, uploadImage, imageListContainer} = this.subElements;

    imageListContainer.addEventListener('click', this.onDelete);
    uploadImage.addEventListener('click', this.onUploadImage);
    productForm.addEventListener('submit', this.onSubmit);
  }

  removeEventListeners() {
    this.removeEventListener('click', this.onDelete);
    this.removeEventListener('click', this.onUploadImage);
    this.removeEventListener('submit', this.onSubmit); 
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }


  getTemplate() {
    return ` <div class="products-edit">
    <div class="content__top-panel">
      <h1 class="page-title">
        <a href="/products" class="link">Товары</a> / ${this.productId !== '' ? 'Редактировать' : 'Добавить'}
      </h1>
    </div>
    <div class="content-box">
      <div class="product-form">
          ${this.getProductForm()}
      </div>
    </div>
  </div>`;
  }

  getProductForm() {
    return `<form data-element="productForm" class="form-grid">
      ${this.getFormGroup()}
      ${this.getFormButtons(this.productId)}
    </form>`;
  }

  getFormGroup() {
    return `
      ${this.getTitle()}
      ${this.getDescription()}
      ${this.getListImageContainer()}
      ${this.getCategories()}
      ${this.getFullPrice()}
      ${this.getQuantity()}
      ${this.getStatus()}
    `;
  }

  getTitle() {
    return `<div class="form-group form-group__half_left">
    <fieldset>
      <label class="form-label">Название товара</label>
      <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
    </fieldset>
  </div>`;
  }

  getDescription() {
    return `<div class="form-group form-group__wide">
    <label class="form-label">Описание</label>
    <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
  </div>`;
  }

  getListImageContainer() {
    return `
  <div class="form-group form-group__wide" data-element="sortable-list-container">
    <label class="form-label">Фото</label>
    <div data-element="imageListContainer">

    </div>
    <button type="button" name="uploadImage" data-element="uploadImage" class="button-primary-outline fit-content"><span>Загрузить</span></button>
  </div>
    `;
  }

  getImageContainer() {
    if (!this.productId) {
      return;
    } 
    const { imageListContainer } = this.subElements;
    this.sortableList = new SortableList({
      items: this.dataForm.images.map((image) => this.getImage(image.url, image.source))
    })
    
    return imageListContainer.append(this.sortableList.element)

    // раскомментировать если работать без new SortableList()
    // + добавить li класс sortable-list__item в getImage() и создать в 
    // getListImageContainer()  <ul class="sortable-list"></ul>
    // const ul = imageListContainer.firstElementChild;
    // const imagesHTML = this.dataForm.images.map((image) => this.getImage(image.url, image.source));
    // return imagesHTML.map((image) => ul.append(image)).join('');
  }

  getImage(url, name) {

    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
    <li class="products-edit__imagelist-item" style="">
    <input type="hidden" name="url" value="${escapeHtml(url)}">
    <input type="hidden" name="source" value="${escapeHtml(name)}">
    <span>
        <img src="/assets/icons/icon-grab.svg" data-grab-handle="" alt="grab">
        <img class="sortable-table__cell-img" alt="${escapeHtml(name)}" src="${escapeHtml(url)}" referrerpolicy="no-referrer">
        <span>${escapeHtml(url)}</span>
    </span>
    <button type="button">
      <img src="/assets/icons/icon-trash.svg" data-delete-handle="" alt="delete">
    </button></li>
    `;

    return wrapper.firstElementChild;

  }

  getCategories() {
    return `
    <div class="form-group form-group__half_left">
    <label class="form-label">Категория</label>
    ${this.getFormControl()}
    </div>
    `;
  }
  
  getFormControl() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `<select class="form-control" id="subcategory" name="subcategory"></select>`;

    const select = wrapper.firstElementChild;
    for (const category of this.dataCategories) {
      for (const subcategories of category.subcategories) {
        select.append(new Option(`${category.title} > ${subcategories.title}`, subcategories.id));
      }
    }

    return select.outerHTML;
  }

  getFullPrice() {
    return `
    <div class="form-group form-group__half_left form-group__two-col">
    <fieldset>
      <label class="form-label">Цена ($)</label>
      <input required="" type="number" name="price" class="form-control" placeholder="100">
    </fieldset>
    <fieldset>
      <label class="form-label">Скидка ($)</label>
      <input required="" type="number" name="discount" class="form-control" placeholder="0">
    </fieldset>
  </div>
    `;
  }


  getQuantity() {
    return `
    <div class="form-group form-group__part-half">
    <label class="form-label">Количество</label>
    <input required="" type="number" class="form-control" name="quantity" placeholder="1">
  </div>
    `;
  }

  getStatus() {
    return `
    <div class="form-group form-group__part-half">
    <label class="form-label">Статус</label>
    <select class="form-control" name="status">
      <option value="1">Активен</option>
      <option value="0">Неактивен</option>
    </select>
  </div>
    `;
  }

  getFormButtons(productId) {
    return `<div class="form-buttons">
    <button type="submit" name="save" class="button-primary-outline" data-element="formButtons">
      ${productId ? 'Сохранить товар' : 'Добавить'}
    </button>`;
  }

}


import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class {
  element;
  subElements = {};
  categories;
  formData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    price: 100,
    discount: 0
  };

  constructor(productId) {
    this.productId = productId;
    this.uploadingImg = this.uploadingImageCall.bind(this);
  }

  dispatchEvents(productId) {
    let event = productId ?
      new CustomEvent('product-updated', {
        bubbles: true,
        detail: productId
      })
      : new CustomEvent('product-saved', {
        bubbles: true
      });

    this.element.dispatchEvent(event);
  }

  uploadingImageCall(event) {
    event.preventDefault();
    this.uploadImage(event, event.currentTarget);
  }

  _getFormTemplate(data) {
    return `<div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required="" class="form-control" name="description" data-element="productDescription"
                    placeholder="Описание товара"></textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer">
          </div>
          <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
            ${this._getCategoriesOptions()}
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" name="price" class="form-control" placeholder="${data.price}">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" type="number" name="discount" class="form-control" placeholder="${data.discount}">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required="" type="number" class="form-control" name="quantity" placeholder="${data.quantity}">
        </div>
         <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status">
                <option value="1">Активен</option>
                <option value="0">Неактивен</option>
            </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            ${this.productId ? 'Сохранить товар' : 'Добавить товар'}
          </button>
        </div>
      </form>
    </div>`;
  }

  _getListImage(url, source) {
    if (!this.productId) {
      return '';
    }

    let wrap = document.createElement('div');

    wrap.innerHTML = `<li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${escapeHtml(url)}">
        <input type="hidden" name="source" value="${escapeHtml(source)}">
        <span>
           <img src="icon-grab.svg" data-grab-handle="" alt="grab">
           <img class="sortable-table__cell-img"
                alt="${escapeHtml(source)}"
                src="${escapeHtml(url)}"
                referrerpolicy="no-referrer">
           <span>${source}</span>
        </span>
        <button type="button">
        <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>`;

    return wrap.firstElementChild;
  }

  _getCategoriesOptions() {
    let selectWrap = document.createElement('div');
    selectWrap.innerHTML = `<select class="form-control" name="subcategory" id="subcategory"></select>`;
    selectWrap = selectWrap.firstElementChild;

    for (let category of this.categories) {
      for (let subcategory of category.subcategories) {
        let optionWrap = document.createElement('div');
        optionWrap.innerHTML = `<option value="${subcategory.id}"> ${category.title} > ${subcategory.title} </option>`;

        optionWrap = optionWrap.firstElementChild;
        selectWrap.append(optionWrap);
      }
    }

    return selectWrap.outerHTML;
  }

  _getCategories() {
    return fetchJson(new URL(BACKEND_URL + '/api/rest/categories?_sort=weight&_refs=subcategory'));
  }

  _getSubElements() {
    let elements = this.element.querySelectorAll('[data-element]');
    for (let element of elements) {
      this.subElements[element.dataset.element] = element;
    }

    return this.subElements;
  }

  _fillFormWithValues() {
    let {productForm} = this.subElements;
    let notAllowed = ['images'];
    let keys = Object.keys(this.formData).filter(item =>
      !notAllowed.includes(item)
    );

    keys.forEach(item => {
      let valueForm = productForm.querySelector(`[name="${item}"]`);
      if (valueForm) {
        valueForm.value = this.formData[item];
      }

    });
  }

  _makeSortableListImage() {
    const {imageListContainer} = this.subElements;
    const {images} = this.formData;
    let items = [];
    for (let i = 0; i < images.length; i++) {
      items[i] = this._getListImage(images[i]['url'], images[i]['source']);
    }

    const sortableList = new SortableList({items});
    imageListContainer.append(sortableList.element);
  }

  _getFormValue(values) {
    const transformValues = {...values, url: undefined, source: undefined};
    const {imageListContainer} = this.subElements;
    let numberFormat = ['discount', 'price', 'quantity', 'status'];

    let keys = Object.keys(transformValues).filter(item =>
      numberFormat.includes(item)
    );

    keys.forEach(item => {
      transformValues[item] = Number(transformValues[item]);
    });

    transformValues.id = this.productId;
    transformValues.images = [];

    let images = imageListContainer.querySelectorAll('.sortable-list__item');

    images.forEach(item => {
      let url = item.querySelector("input[name = 'url']");
      let source = item.querySelector("input[name = 'source']");
      transformValues.images.push({
        url: url.value,
        source: source.value
      });
    });

    return transformValues;
  }

  async save() {
    let url = new URL(BACKEND_URL + '/api/rest/products');
    let {productForm} = this.subElements;

    let formData = new FormData(productForm);
    let values = Object.fromEntries(formData.entries());

    values = this._getFormValue(values);

    try {
      await fetchJson(url, {
        method: this.productId ? 'PATCH' : 'PUT',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(values)
      });
      this.dispatchEvents(this.productId);
    } catch (error) {
      console.error(error);
    }
  }

  async _getDataFromServer() {
    let url = new URL(BACKEND_URL + '/api/rest/products');

    let urlParams = {
      'id': this.productId,
    };

    url.search = new URLSearchParams(urlParams);

    return  await fetchJson(url);
  }

  async render() {
    let categories = this._getCategories();
    let data = this.productId ? this._getDataFromServer() : [this.formData];

    let [categoriesList, productData] = await Promise.all([
      categories,
      data
    ]);

    let [productDataReform] = productData;

    this.formData = productDataReform;
    this.categories = categoriesList;

    this.element = document.createElement('div');
    this.element.innerHTML = this._getFormTemplate(this.formData);
    this.element = this.element.firstElementChild;
    if (this.formData) {
      this._getSubElements();
      this._fillFormWithValues();
      this._makeSortableListImage();
      this.addListeners();
    }

    return this.element;
  }

  uploadImage(event, btnUploadImg) {
    let {imageListContainer} = this.subElements;
    let url = new URL('https://api.imgur.com/3/image');
    let fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = async () => {
      let [file] = fileInput.files;
      fileInput.remove();


      if(file){
        let formData = new FormData();
        formData.append('image', file);

        btnUploadImg.classList.add('is-loading');
        btnUploadImg.disabled = true;

        let response = await fetchJson(url, {
          method: 'POST',
          headers: {
            'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`,
          },
          body: formData
        });


        imageListContainer.firstElementChild.append(this._getListImage(response.data.link, file.name))
        btnUploadImg.classList.remove('is-loading');
        btnUploadImg.disabled = false;
      }
    };

    fileInput.hidden = true;

    imageListContainer.append(fileInput);

    fileInput.click();
  }

  addListeners() {
    let {productForm} = this.subElements;
    let btnUploadImg = productForm.querySelector('[name="uploadImage"]');
    productForm.addEventListener('submit', (event) => {
      event.preventDefault();
      this.save();
    });
    btnUploadImg.addEventListener('click', this.uploadingImg);
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}


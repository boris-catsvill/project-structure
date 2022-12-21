import escapeHtml from './../../utils/escape-html.js';
import fetchJson from './../../utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';
const IMGUR_URL = 'https://api.imgur.com/3/image';

export default class ProductForm {
  onClick = async (event) => {
    event.preventDefault();
    await this.save();
  }
  onClickFileUploadBtn = () => {
    this.subElements.fileInput.click();
  }

  onImageListClick = (event) => {
    const el = event.target.closest('.imgDeleteBtn');
    const index = this.product.images.findIndex(item => item.source === el.dataset.source);
    this.product.images.splice(index, 1)

    this.subElements.imageList.innerHTML = this.getImagesTemplate();
  }

  onChangeInputFile = async() => {
    const files = this.subElements.fileInput.files;
    const imageFormData = new FormData();
    imageFormData.append('image', files[0]);
    const result = await fetchJson(IMGUR_URL, {
      method: 'POST',
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
      },
      body: imageFormData,
      referrer: ''
    });
    const img = document.createElement('div');
    img.innerHTML = `
      <li class="products-edit__imagelist-item sortable-list__item">
        <span>
          <img src="/assets/icons/icon-grab.svg" data-grab-handle alt="grab">
          <img class="sortable-table__cell-img" alt="${escapeHtml(files[0].name)}" src="${escapeHtml(result.data.link)}">
          <span>${escapeHtml(files[0].name)}</span>
        </span>
        <button type="button" data-source="${files[0].name}" class="imgDeleteBtn">
          <img src="/assets/icons/icon-trash.svg" alt="delete" data-delete-handle>
        </button>
      </li>`;

    this.subElements.imageList.append(img.firstElementChild);

    if(!this.productId) {
      this.product = {};
      this.product.images = [];
    }
    this.product.images.push({
      "url": result.data.link,
      "source": files[0].name
    });
  }
  constructor (productId = null) {
    this.productId = productId;
  }
  async load(urlCategories, urlProduct) {
    const categories = fetchJson(urlCategories).catch((error) => console.log('loadProduct', error));
    const product = fetchJson(urlProduct).catch((error) => console.log('loadProduct', error));
    return await Promise.all([categories, product]);
  }
  async save() {
    let product = {
      'images': this.product.images,
      'title': escapeHtml(this.subElements.productTitle.value),
      'description': escapeHtml(this.subElements.productDescription.value),
      'subcategory': escapeHtml(this.subElements.productSubcategory.value),
      'price': parseInt(this.subElements.productPrice.value),
      'discount': parseInt(this.subElements.productDiscount.value),
      'quantity': parseInt(this.subElements.productQuantity.value),
      'status': parseInt(this.subElements.productStatus.value),
    };
    if (this.productId) {
      product.id = this.productId;
    } else {
      product.id = product.title.split(' ').join('-');
    }
    const method = this.productId ? "PATCH" : "PUT";
    try {
    const promise = await fetch('https://course-js.javascript.ru/api/rest/products', {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(product)
    });
    const result = await promise.json();
    const customEvent = this.productId ? new CustomEvent("product-updated") : new CustomEvent("product-saved");
    this.element.dispatchEvent(customEvent);
    return result;
    } catch (error) {
      console.error('product-form-error', error);
    }

  }
  formFill() {
    this.subElements.productTitle.value = this.product.title;
    this.subElements.productDescription.value = this.product.description;
    this.subElements.productSubcategory.value = this.product.subcategory;
    this.subElements.productPrice.value = this.product.price;
    this.subElements.productDiscount.value = this.product.discount;
    this.subElements.productQuantity.value = this.product.quantity;
    this.subElements.productStatus.value = this.product.status;
  }
  getTemplate() {
    return `
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" id="title" name="title" class="form-control" data-element="productTitle" placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer">
          <ul class="sortable-list" data-element="imageList">
            ${this.getImagesTemplate()}
          </ul>
        </div>
        <input id="fileInput" data-element="fileInput" type="file" name="file" style=" display: none;">
        <button id="fileUploadBtn" data-element="addFile" type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory" id="subcategory" data-element="productSubcategory">
          ${this.getCategoriesTemplate()}
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" id="price" type="number" name="price" data-element="productPrice" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" id="discount" type="number" name="discount" data-element="productDiscount" class="form-control" placeholder="0">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" data-element="productQuantity" id="quantity" name="quantity" placeholder="1">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status" id="status" data-element="productStatus">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline" data-element="productSave">
          Сохранить товар
        </button>
      </div>
    </form>
  `;
  }
  getCategoriesTemplate() {
    return this.categories.map(category => {
      if (category.subcategories && category.subcategories.length > 0) {
        return category.subcategories.map(subcategory => {
          return `<option value="${subcategory.id}">${category.title} &gt; ${subcategory.title}</option>`;
        });
      } else {
        return `<option value="${category.id}">${category.title}</option>`;
      }
    }).join('');
  }
  getImagesTemplate() {
    if(!this.productId) {
      return '';
    }
    return this.product.images.map(image => {
      return `
        <li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${image.url}">
          <input type="hidden" name="source" value="${image.source}">
          <span>
            <img src="/assets/icons/icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="${image.url}">
            <span>${image.source}</span>
          </span>
          <button type="button" data-source="${image.source}" class="imgDeleteBtn">
            <img src="/assets/icons/icon-trash.svg" data-delete-handle="" alt="delete">
          </button>
         </li>
        `;
    }).join('');
  }

  async render () {
    const urlCategories = new URL(BACKEND_URL);
    const urlProduct = new URL(BACKEND_URL);
    urlProduct.searchParams.set('id', this.productId);
    urlCategories.searchParams.set('_sort', 'weight');
    urlCategories.searchParams.set('_refs', 'subcategory');
    urlCategories.pathname = '/api/rest/categories';
    urlProduct.pathname = '/api/rest/products';
    const loadData = await this.load(urlCategories.href, urlProduct.href);

    this.categories = loadData[0];
    this.product = loadData[1][0];

    const wrapper = document.createElement("div");
    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;
    if(this.productId) {
      this.formFill();
    }
    this.initEventListeners();
    return this.element;
  }
  initEventListeners() {
    this.subElements.productSave.addEventListener('click', this.onClick);
    this.subElements.addFile.addEventListener('click', this.onClickFileUploadBtn);
    this.subElements.fileInput.addEventListener('change', this.onChangeInputFile);
    this.subElements.imageList.addEventListener('click', this.onImageListClick);
  }
  get subElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");
    for (const subElement of elements) {
      const name = subElement.dataset.element;
      result[name] = subElement;
    }
    return result;
  }
  remove() {
    this.element.remove();
  }
  destroy() {
    this.remove();
    this.subElements.productSave.removeEventListener('click', this.onClick);
    this.subElements.addFile.removeEventListener('click', this.onClickFileUploadBtn);
    this.subElements.fileInput.removeEventListener('change', this.onChangeInputFile);
    this.subElements.imageList.removeEventListener('click', this.onImageListClick);
  }
}

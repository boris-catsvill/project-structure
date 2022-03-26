import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';
import { log } from 'webpack-dev-server/client/utils/log';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  subElements = {};
  defaultFormData = [{
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0,
  }];
  constructor (productId) {
    this.productId = productId;
  }

  onSubmit = event => {
    event.preventDefault();

    this.save();
  };

  template() {
    return `<div class="products-edit">
      <div class="content__top-panel">
        <h1 class="page-title">
          <a href="/products" class="link">Товары</a> / ${this.productId ? "Редактировать" : "Добавить"}
        </h1>
      </div>
      <div class="content-box">

    <div class="product-form">
    
    <form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
      
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>

        <div data-element="imageListContainer">
        </\div>

        <button type="button" name="uploadImage" class="button-primary-outline fit-content"><span>Загрузить</span></button>
      </div>
      
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory">
            ${this.createCategoriesSelect()}
        </select>
      </div>
      
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" class="form-control" placeholder="${this.defaultFormData.price}">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" class="form-control" placeholder="${this.defaultFormData.discount}">
        </fieldset>
      </div>
      
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" placeholder="${this.defaultFormData.quantity}">
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
          ${this.productId ? "Сохранить" : "Добавить"} товар
        </button>
      </div>
    </form>
  </div>
  </div>
`;
  }

  async render () {
    const categoriesPromise = this.loadCategoriesList();
    const productPromise = this.productId
      ? this.loadProductData(this.productId)
      : Promise.resolve(this.defaultFormData);
    const [categoriesData, productResponse] = await Promise.all([categoriesPromise, productPromise]);
    const [productData] = productResponse;

    this.formData = productData;
    this.categories = categoriesData;
    this.renderForm();
    if (this.formData) {
      this.setFormData();
      this.initEventListeners();
      return this.element;
    }
  }
  renderForm() {
    const element = document. createElement('div');
    element.innerHTML = this.formData
      ? this.template()
      : this.qetEmptyTemplate();
    this.element = element.firstElementChild;

    this.getSubElements(element);
    const items = this.createImagesList();
    this.imageList = new SortableList({items});
    this.subElements.imageListContainer.append(this.imageList.element);
    const productCategory = this.formData.subcategory;
    const selectArr = this.subElements.productForm.subcategory.options;
    const optionProduct = Array.from(selectArr).find(elem => {
      return elem.value === productCategory;
    });
    optionProduct ? optionProduct.selected = true: '';
  }
  qetEmptyTemplate() {
    return `<div class="error-404">
      <h1 class="page-title">Страница не найдена</h1>
      <p>Извините, страница не существует</p>
    </div>`;
  }
  getSubElements(element) {
    const arr = element.querySelectorAll('[data-element]');
    for (const elem of arr) {
      this.subElements[elem.dataset.element] = elem;
    }
  }

  async loadProductData() {
    return fetchJson(`https://course-js.javascript.ru/api/rest/products?id=${this.productId}`);
  }

  async loadCategoriesList() {
    return fetchJson("https://course-js.javascript.ru/api/rest/categories?_sort=weight&_refs=subcategory");

  }

  setFormData() {
    const {title, description, price, discount, quantity, status} = this.formData;
    this.subElements.productForm.title.value = title;
    this.subElements.productForm.description.value = description;
    this.subElements.productForm.price.value = price;
    this.subElements.productForm.discount.value = discount;
    this.subElements.productForm.quantity.value = quantity;
    this.subElements.productForm.status.value = status;
  }
  createCategoriesSelect() {
    return this.categories.map(elem => elem.subcategories
      .map(item => {
        return `<option value="${item.id}">${elem.title} > ${item.title}</option>`;
      })
      .join(''))
      .join('');

  }

  async save() {
    const product = this.getFormData();

    try {
      const result = await fetchJson(`${BACKEND_URL}/api/rest/products`,
        {
          method: this.productId ? 'PATCH' : 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(product)
        });

      const event = this.productId ? new CustomEvent("product-saved", {detail: result.id}) : new CustomEvent("product-updated", {detail: result.id});
      this.element.dispatchEvent(event);

    } catch (error) {
      console.error('Ошибка в отправке формы', error);
    }
  }

  getFormData() {
    const {productForm} = this.subElements;
    const {title, description, subcategory, price, quantity, discount, status} = productForm;
    return {
      id: this.productId,
      title: title.value,
      description: description.value,
      subcategory: subcategory.value,
      price: parseInt(price.value, 10),
      quantity: parseInt(quantity.value, 10),
      discount: parseInt(discount.value, 10),
      status: parseInt(status.value, 10),
      images: this.formData.images
    };

  }

  initEventListeners() {
    const {productForm, imageListContainer} = this.subElements;

    productForm.addEventListener('submit', this.onSubmit);

    productForm.uploadImage.addEventListener('click', this.uploadImage) ;

    imageListContainer.addEventListener('click', event => {
      if ('deleteHandle' in event.target.dataset)
        event.target.closest('li').remove();
    });
  }
  uploadImage = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async()=>{
      const [file] = fileInput.files;
      if (!file)
        return;
      let result; let formData = new FormData();
      formData.append("image", file);
      this.subElements.productForm.uploadImage.classList.add("is-loading");
      this.subElements.productForm.uploadImage.disabled = true;

      try {
        result = await fetchJson("https://api.imgur.com/3/image", {
          method: "POST",
          headers: {
            Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
          },
          body: formData,
          referrer: ''
        });
      } catch (error) {
        return new Error("Upload error: " + error.message);
      } finally {
        this.subElements.productForm.uploadImage.classList.remove("is-loading");
        this.subElements.productForm.uploadImage.disabled = false;
      }

      this.formData.images.push({url: result.data.link, source: file.name});
      this.imageList.addItem(this.renderImageElem({
        url: result.data.link,
        source: file.name
      }));
    };
    fileInput.hidden = true;
    document.body.appendChild(fileInput);
    fileInput.click();
  };

  createImagesList() {
    if (!this.formData)
      return '';
    return this.formData.images.map(item => this.renderImageElem(item));
  }
  renderImageElem ({url, source}) {
    const liEl = document.createElement('li');
    liEl.classList.add('products-edit__imagelist-item');
    liEl.innerHTML = `<input type="hidden" name="url" value="${url}">
                    <input type="hidden" name="source" value="${source}">
      <span>
      <img src="/assets/icons/icon-grab.svg" data-grab-handle alt="grab">
      <img class="sortable-table__cell-img" alt="Image" src="${escapeHtml(url)}">
      <span>${escapeHtml(source)}</span>
      </span>
      <button type="button">
      <img src="/assets/icons/icon-trash.svg" data-delete-handle alt="delete">
      </button>`;
    return liEl;
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    const {productForm} = this.subElements;
    productForm.uploadImage.removeEventListener('click', this.uploadImage);
    productForm.removeEventListener('submit', this.onSubmit);
    this.remove();
  }
}

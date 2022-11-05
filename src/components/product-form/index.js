import SortableList from '../sortable-list/index.js';
import Notification from '../../components/notification';
import fetchJson from '../../utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  element;
  subElements = {};
  formDefault = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  };

  constructor(productId = '') {
    this.productId = productId;
  }

  async render() {
    const fetchCategories = this.fetchCategories();
    const fetchProduct = this.productId
      ? this.fetchProduct(this.productId)
      : Promise.resolve([this.formDefault]);
    const [categotiesData, productResponse] = await Promise.all([fetchCategories, fetchProduct]);
    const [productData] = productResponse;

    this.imgArr = [];
    this.product = productData;
    this.categories = categotiesData;

    this.renderForm();
  }

  fetchProduct() {
    return fetchJson(`${BACKEND_URL}/api/rest/products?id=${this.productId}`);
  }
  fetchCategories() {
    return fetchJson(`${BACKEND_URL}/api/rest/categories?_sort=weight&_refs=subcategory`);
  }

  renderForm() {
    const element = document.createElement('div');
    element.innerHTML = this.template;
    this.element = element.firstElementChild;
    this.getSubElements();

    this.setData();
    this.sortableListModule();
    this.initEventListeners();
  }

  setData() {
    const exclusions = [];
    const subElementsNames = Object.keys(this.subElements);

    for (const item of subElementsNames) {
      if (this.subElements[item] === null) continue;
      if (exclusions.indexOf(this.subElements[item].name) !== -1) continue;
      this.subElements[item].value = this.product[item];
    }
    this.imgArr = [...this.product.images];
  }

  sortableListModule() {
    const sortableList = new SortableList(
      this.product.images.map(item => {
        return this.imagesTemplate(item);
      })
    );
    this.subElements.imageListContainer.append(sortableList.element);
  }

  appendNewImage(item) {
    const template = document.createElement('div');
    template.innerHTML = this.imagesTemplate(item);
    this.subElements.imageListContainer.firstElementChild.append(template.firstElementChild);
  }

  uploadImages = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.click();
    fileInput.addEventListener('change', () => {
      this.subElements.uploadImage.disabled = true;
      this.subElements.uploadImage.classList.add('is-loading');
      fetch('https://api.imgur.com/3/image', {
        method: 'POST',
        headers: {
          Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
        },
        body: fileInput.files[0],
        referrer: ''
      })
        .then(response => {
          const data = response.json();
          data.then(data => {
            if (data.status >= 400) {
              console.error(data.data.error);
              return;
            }
            const newImage = {
              url: data.data.link,
              source: fileInput.files[0].name
            };
            this.imgArr.push(newImage);
            this.appendNewImage(newImage);
          });
          this.subElements.uploadImage.disabled = false;
          this.subElements.uploadImage.classList.remove('is-loading');
          fileInput.remove();
        })
        .catch(error => {
          console.error(error);
        });
    });
  };

  async sendData(formData) {
    try {
      const method = this.productId ? 'PATCH' : 'PUT';
      const response = await fetchJson(`${BACKEND_URL}/api/rest/products`, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      new Notification(this.productId ? 'Product updated' : 'Product saved');
    } catch (error) {
      new Notification(error, { type: 'error' });
      console.error(error);
    }
  }

  formSubmit = event => {
    event.preventDefault();
    const formData = {};
    for (const item in this.formDefault) {
      if (this.subElements[item] === null) continue;
      if (this.subElements[item].type === 'number' || this.subElements[item].name === 'status') {
        formData[item] = parseFloat(this.subElements[item].value);
      } else {
        formData[item] = this.subElements[item].value;
      }
    }
    formData.images = [...this.imgArr];
    this.sendData(formData);
  };

  initEventListeners() {
    this.subElements.uploadImage.addEventListener('click', this.uploadImages);
    this.subElements.productForm.addEventListener('submit', this.formSubmit);
  }

  getSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    for (const element of elements) {
      this.subElements[element.dataset.element] = element;
    }
    for (const item in this.formDefault) {
      this.subElements[item] = this.subElements.productForm.querySelector(`[name="${item}"]`);
    }
  }

  imagesTemplate(item) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${item.url}">
        <input type="hidden" name="source" value="${item.source}">
        <span>
          <img src="../../assets/icons/icon-grab.svg" data-grab-handle="" alt="grab" draggable="false">
          <img class="sortable-table__cell-img" alt="Image" src="${item.url}">
          <span>${item.source}</span>
        </span>
        <button type="button">
          <img src="../../assets/icons/icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;
  }

  categoryTemplate() {
    const categoryTemp = [];
    this.categories.map(item =>
      item.subcategories.map(subItem => {
        categoryTemp.push(
          `<option value="${subItem.id}">${item.title} &gt; ${subItem.title}</option>`
        );
      })
    );

    return categoryTemp.join('');
  }

  get template() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input 
                required="" 
                type="text" 
                name="title" 
                class="form-control" 
                placeholder="Название товара"
              >
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea 
              required="" 
              class="form-control" 
              name="description" 
              data-element="productDescription" 
              placeholder="Описание товара"
            ></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div class="image-container" data-element="imageListContainer"></div>
            <button type="button" name="uploadImage" class="button-primary-outline" data-element="uploadImage"><span>Загрузить</span></button>
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" name="subcategory">
              ${this.categoryTemplate()}
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input 
                required="" 
                type="number" 
                name="price" 
                class="form-control" 
                placeholder="100"
              >
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input 
                required="" 
                type="number" 
                name="discount" 
                class="form-control" 
                placeholder="0"
              >
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input 
              required="" 
              type="number" 
              class="form-control" 
              name="quantity" 
              placeholder="1"
            >
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline" data-element="submitBtn">
                Сохранить товар
            </button>
          </div>
        </form>
      </div>
    `;
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}

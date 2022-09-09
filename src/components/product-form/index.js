import SortableList from '../sortable-list/index.js';
import escapeHtml from '../../utils/escape-html.js';
import fetchJson from '../../utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const IMGUR_URL = "https://api.imgur.com/3/image";
const BACKEND_URL = 'https://course-js.javascript.ru';
const CATEGORIES_PATH = "api/rest/categories";
const PRODUCT_PATH = "api/rest/products";


export default class ProductForm {
  element = {};
  subElements = {};
  productId = null;
  categories = [];
  formData = {
    title: null,
    description: null,
    quantity: null,
    subcategory: null,
    status: null,
    price: null,
    discount: null,
    images: []
  };
  sortableList = {};

  constructor(productId) {
    this.productId = productId;
  }

  formTemplate() {
    return `
    <div class="product-form">
      <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input required="" type="text" name="title" class="form-control" placeholder="Название товара" value="${this.formData.title ? this.formData.title : ''}">
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара">${this.formData.description ? this.formData.description : ''}</textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <div data-element="imageListContainer">
<!--            A place for a sortable list-->
          </div>
          <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          <select class="form-control" name="subcategory">
          ${this.subcategoriesTemplate()}
          </select>
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input required="" type="number" name="price" class="form-control" placeholder="100" value="${this.formData.price ? this.formData.price : ''}">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input required="" type="number" name="discount" class="form-control" placeholder="0" value="${this.formData.discount ? this.formData.discount : ''}">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input required="" type="number" class="form-control" name="quantity" placeholder="1" value="${this.formData.quantity ? this.formData.quantity : ''}">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select class="form-control" name="status">
            <option value="1" ${this.formData.status === 1 ? "selected" : ""}>Активен</option>
            <option value="0" ${this.formData.status === 0 ? "selected" : ""}>Неактивен</option>
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" name="save" class="button-primary-outline">
            Сохранить товар
          </button>
        </div>
      </form>
    </div>
    `;
  }

  subcategoriesTemplate() {
    if (this.categories && this.categories.length > 0) {
      return `
        ${this.categories.map(category => category.subcategories.map(subcategory => {
        return `
        <option value=${subcategory.id} ${this.formData.subcategory === subcategory.id ? "selected" : ""}>
          ${category.title} &gt; ${subcategory.title}
        </option>`;
      }).join('\n')).join('\n')}
      `;
    }
    return "";
  }

  sortableListItems() {
    if (this.formData.images && this.formData.images.length > 0) {
      return this.formData.images.map(img => this.productImagesContainerItemTemplate(img));
    }
    return [];
  }

  productImagesContainerItemTemplate({url, source}) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${url}">
        <input type="hidden" name="source" value="${source}">
        <span>
          <img draggable="false" src="../../assets/icons/icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${url}">
          <span>${source}</span>
        </span>
        <button type="button">
          <img src="../../assets/icons/icon-trash.svg" data-delete-handle="" alt="delete">
        </button>
      </li>
    `;
  }

  appendImagesContainerItem({url, source}) {
    const itemWrapper = document.createElement('div');
    itemWrapper.innerHTML = this.productImagesContainerItemTemplate({url, source});
    const newItem = itemWrapper.firstElementChild;
    this.subElements.imageListContainer.querySelector(".sortable-list").appendChild(newItem);
    this.sortableList.registerItem(newItem);
  }

  async render() {
    [this.categories, this.formData] = await Promise.all([
      this.fetchCategories(),
      this.productId ? this.fetchProduct() : this.formData]
    );

    const elementWrapper = document.createElement("div");
    elementWrapper.innerHTML = this.formTemplate();
    this.element = elementWrapper.firstElementChild;
    this.subElements = this.getSubElements();
    this.sortableList = new SortableList({items: this.sortableListItems()});
    this.subElements.imageListContainer.append(this.sortableList.element);
    this.initHandlers();

    return this.element;
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  initHandlers() {
    this.subElements.productForm.querySelector('[name="save"]').addEventListener("click", this.clickSave);
    this.subElements.productForm.querySelector('[name="uploadImage"]').addEventListener("click", this.clickUploadImage);
  }

  async fetchCategories() {
    const url = new URL(CATEGORIES_PATH, BACKEND_URL);
    url.searchParams.set("_sort", "weight");
    url.searchParams.set("_refs", "subcategory");
    return await fetchJson(url)
      .catch(reason => console.error(`Failed to fetch form categories: ${reason}`));
  }

  async fetchProduct() {
    const url = new URL(PRODUCT_PATH, BACKEND_URL);
    url.searchParams.set("id", this.productId);
    return fetchJson(url)
      .then(arr => (this.formParams(arr[0])))
      .then(unsafeObj => this.escapeHtmlValues(unsafeObj))
      .catch(reason => {
        console.error(`Failed to fetch product ${this.productId} data: ${reason}`);
        return {};
      });
  }

  escapeHtmlValues(obj) {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === "string") {
        obj[key] = escapeHtml(obj[key]);
      }
    });
    return obj;
  }

  formParams = ({title, description, quantity, subcategory, status, price, discount, images}) =>
    ({title, description, quantity, subcategory, status, price, discount, images});

  clickSave = async (event) => {
    event.preventDefault();
    await this.save();
  };

  async save() {
    const formData = {};

    for (const prop in this.formData) {
      const dataInput = this.subElements.productForm.querySelector(`[name=${prop}]`);
      formData[prop] = dataInput?.value;
    }

    const urls = [...this.subElements.productForm.querySelectorAll("[name='url']")].map(element => element.value);
    const sources = [...this.subElements.productForm.querySelectorAll("[name='source']")].map(element => element.value);
    formData.images = urls.map((url, index) => {
      return {url: url, source: sources[index]};
    });
    if (this.productId) {
      await this.updateProduct(formData);
    } else {
      await this.createProduct(formData);
    }
  }

  async createProduct(jsonFormData) {
    return this.productApiCall(jsonFormData, "POST", "product-created");
  }

  async updateProduct(formData) {
    return this.productApiCall(JSON.stringify(formData), "PATCH", "product-updated");
  }

  async productApiCall(jsonFormData, method, event) {
    const url = new URL(PRODUCT_PATH, BACKEND_URL);
    await fetchJson(url, {
      method: method,
      body: jsonFormData
    })
      .then(_ => this.element.dispatchEvent(new Event(event)))
      .catch(reason => console.error(`Failed to create product: ${reason}`));
  }

  clickUploadImage = (event) => {
    event.preventDefault();
    this.uploadImage();
  };

  uploadImage() {
    const imageInput = document.createElement("input");
    imageInput.type = "file";
    imageInput.accept = "image/*";
    imageInput.onchange = async (event) => {
      const image = event.target.files[0];
      const imageFormData = new FormData();
      imageFormData.append("image", image);

      const imgurResource = await this.createImgurResource(image, imageFormData);
      // this.formData.images.push(imgurResource);
      this.appendImagesContainerItem({url: imgurResource.url, source: imgurResource.source});
    };
    imageInput.click();
    imageInput.remove();
  }

  async createImgurResource(image, imageFormData) {
    return fetchJson(IMGUR_URL, {
      method: 'POST',
      body: imageFormData,
      headers: {
        authorization: `Client-ID ${IMGUR_CLIENT_ID}`
      }
    })
      .then(response => {
        return {
          source: image.name,
          url: response.data.link
        };
      })
      .catch(reason => console.error(`Failed to upload image to imgur ${reason}`));
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    if (this.element != null) {
      this.remove();
    }

    if (this.subElements) {
      this.subElements.productForm?.querySelector('[name="save"]')?.removeEventListener("click", this.clickSave);
      this.subElements.productForm?.querySelector('[name="uploadImage"]').removeEventListener("click", this.clickSave);
    }

    this.element = null;
  }
}
